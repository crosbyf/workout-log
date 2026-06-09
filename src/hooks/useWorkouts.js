'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { getItem, setItem } from '@/utils/storage';
import { generateId } from '@/utils/ids';
import { getPendingIds, addPendingIds, removePendingIds } from '@/utils/pending';
import { createTombstoneStore } from '@/utils/tombstones';
import {
  fetchWorkouts,
  upsertWorkout,
  upsertWorkouts,
  deleteWorkoutRemote,
  deleteAllWorkoutsRemote,
} from '@/lib/sync';

const WORKOUTS_KEY = 'workouts';
const DELETED_IDS_KEY = 'workouts_deleted_ids';
const PENDING_KEY = 'workouts_pending';

/**
 * Create a fingerprint for a workout to detect content-level duplicates
 * (identical content even if IDs differ — e.g. from old sync resurrection bugs).
 *
 * Includes per-set reps and notes so two REAL same-day sessions with the
 * same preset (e.g. multiple GtG sessions) are NOT treated as duplicates.
 * Only truly identical records collide.
 */
function workoutFingerprint(w) {
  if (w.isDayOff) return `${w.date}|dayoff|${w.notes || ''}`;
  if (w.isRun) return `${w.date}|run|${w.runDistance}|${w.runTime}|${w.notes || ''}`;
  const exKey = (w.exercises || [])
    .map(e => `${e.name}:${(e.sets || []).map(s => s.reps ?? '').join(',')}`)
    .sort()
    .join('|');
  return `${w.date}|${w.location}|${exKey}|${w.elapsedTime || 0}|${w.notes || ''}`;
}

/**
 * Deduplicate workouts by ID first, then by fingerprint.
 * Keeps the first occurrence of each.
 */
function deduplicateWorkouts(list) {
  // Pass 1: dedup by id
  const seenIds = new Set();
  const byId = list.filter(w => {
    if (seenIds.has(w.id)) return false;
    seenIds.add(w.id);
    return true;
  });
  // Pass 2: dedup by content fingerprint
  const seenFp = new Set();
  return byId.filter(w => {
    const fp = workoutFingerprint(w);
    if (seenFp.has(fp)) return false;
    seenFp.add(fp);
    return true;
  });
}

/**
 * Tombstones for deleted workout IDs — see src/utils/tombstones.js.
 * Prevents Supabase or stale localStorage from resurrecting deleted workouts.
 */
const deletedStore = createTombstoneStore(DELETED_IDS_KEY, 'deleted_workout_ids');

function loadWorkouts() {
  const saved = getItem(WORKOUTS_KEY, []);
  const unique = deduplicateWorkouts(saved);
  // Clean up localStorage if duplicates were found
  if (unique.length < saved.length) {
    setItem(WORKOUTS_KEY, unique);
  }
  return unique.sort((a, b) => b.date.localeCompare(a.date));
}

export function useWorkouts() {
  const [workouts, setWorkoutsState] = useState(() => loadWorkouts());
  // Ref mirrors current state so the hydrate merge always sees the latest
  // data, including anything added while the Supabase fetch was in flight.
  const workoutsRef = useRef(workouts);

  const saveToStorage = useCallback((updated) => {
    const sorted = [...updated].sort((a, b) => b.date.localeCompare(a.date));
    workoutsRef.current = sorted;
    setWorkoutsState(sorted);
    setItem(WORKOUTS_KEY, sorted);
    return sorted;
  }, []);

  // Hydrate from Supabase on mount
  useEffect(() => {
    let cancelled = false;
    // Fetch deleted IDs from both localStorage AND Supabase before processing
    Promise.all([fetchWorkouts(), deletedStore.fetchAndMerge()]).then(([remote, deletedIds]) => {
      if (cancelled || !remote) return;
      // Use the CURRENT local state (via ref), not a stale mount-time snapshot,
      // so workouts logged during the fetch window are never lost.
      const current = workoutsRef.current;
      const pendingIds = getPendingIds(PENDING_KEY);
      // Filter out any workouts that were deleted locally but may still exist in Supabase
      const filteredRemote = remote.filter(w => !deletedIds.has(w.id));
      // Retry deleting ONLY tombstoned IDs that actually still exist remotely
      // (avoids firing one request per tombstone on every launch)
      const remoteIdSet = new Set(remote.map(w => w.id));
      const toDelete = [...deletedIds].filter(id => remoteIdSet.has(id));
      toDelete.forEach(id => deleteWorkoutRemote(id));
      // Deduplicate remote data
      const uniqueRemote = deduplicateWorkouts(filteredRemote);
      // Merge: Supabase is source of truth, but keep any local-only items
      const remoteIds = new Set(uniqueRemote.map(w => w.id));
      const localOnly = current.filter(w => !remoteIds.has(w.id) && !deletedIds.has(w.id));
      const mergedRemote = uniqueRemote.map(rw => {
        const local = current.find(lw => lw.id === rw.id);
        // Local version wins while its latest change hasn't reached Supabase
        if (local && pendingIds.has(rw.id)) return local;
        // For remote items missing run fields, check if local version has them
        if (local && local.isRun && !rw.isRun) {
          return { ...rw, isRun: true, runDistance: local.runDistance, runTime: local.runTime, runPace: local.runPace };
        }
        return rw;
      });
      // Final dedup across both sources (catches cross-source duplicates)
      const merged = deduplicateWorkouts([...mergedRemote, ...localOnly]);
      saveToStorage(merged);
      // Push anything Supabase doesn't have yet (local-only) or has stale (pending)
      const toPush = merged.filter(w => pendingIds.has(w.id) || !remoteIds.has(w.id));
      if (toPush.length > 0) {
        upsertWorkouts(toPush).then(ok => {
          if (ok) removePendingIds(PENDING_KEY, toPush.map(w => w.id));
        });
      }
      // Drop pending IDs that no longer exist anywhere (e.g. since deleted)
      const mergedIds = new Set(merged.map(w => w.id));
      const stalePending = [...pendingIds].filter(id => !mergedIds.has(id));
      removePendingIds(PENDING_KEY, stalePending);
    });
    return () => { cancelled = true; };
  }, [saveToStorage]);

  const addWorkout = useCallback((data) => {
    const workout = {
      id: generateId('w'),
      date: data.date,
      exercises: data.exercises || [],
      notes: data.notes || '',
      location: data.location || '',
      structure: data.structure || 'standard',
      structureDuration: Number(data.structureDuration) || null,
      elapsedTime: data.elapsedTime || 0,
      isDayOff: data.isDayOff || false,
      isRun: data.isRun || false,
      runDistance: data.runDistance || null,
      runTime: data.runTime || null,
      runPace: data.runPace || null,
    };
    const updated = [...workoutsRef.current, workout];
    saveToStorage(updated);
    // Sync to Supabase; keep marked pending until confirmed
    addPendingIds(PENDING_KEY, [workout.id]);
    upsertWorkout(workout).then(ok => {
      if (ok) removePendingIds(PENDING_KEY, [workout.id]);
    });
    return workout;
  }, [saveToStorage]);

  const updateWorkout = useCallback((id, data) => {
    let updatedWorkout = null;
    const updated = workoutsRef.current.map(w => {
      if (w.id !== id) return w;
      updatedWorkout = {
        ...w,
        ...data,
        structureDuration: data.structureDuration !== undefined
          ? Number(data.structureDuration) || null
          : w.structureDuration,
      };
      return updatedWorkout;
    });
    saveToStorage(updated);
    // Sync to Supabase; keep marked pending until confirmed
    if (updatedWorkout) {
      addPendingIds(PENDING_KEY, [id]);
      upsertWorkout(updatedWorkout).then(ok => {
        if (ok) removePendingIds(PENDING_KEY, [id]);
      });
    }
  }, [saveToStorage]);

  const deleteWorkout = useCallback((id) => {
    const updated = workoutsRef.current.filter(w => w.id !== id);
    saveToStorage(updated);
    removePendingIds(PENDING_KEY, [id]);
    // Track this deletion so stale localStorage can't re-push it
    deletedStore.add([id]);
    // Also remove from Supabase (but keep tracking the ID regardless of success)
    deleteWorkoutRemote(id);
  }, [saveToStorage]);

  const getWorkoutById = useCallback((id) => {
    return workouts.find(w => w.id === id) || null;
  }, [workouts]);

  // Bulk import: merges imported workouts with existing (deduplicates by id)
  const importWorkouts = useCallback((newWorkouts) => {
    // Explicit restore: clear tombstones for imported IDs so they aren't
    // re-deleted on the next launch (backup restore after a delete-all).
    deletedStore.remove(newWorkouts.map(w => w.id));
    const current = workoutsRef.current;
    const existingIds = new Set(current.map(w => w.id));
    const toAdd = newWorkouts.filter(w => !existingIds.has(w.id));
    const updated = [...current, ...toAdd];
    saveToStorage(updated);
    // Sync all to Supabase; keep marked pending until confirmed
    addPendingIds(PENDING_KEY, toAdd.map(w => w.id));
    upsertWorkouts(toAdd).then(ok => {
      if (ok) removePendingIds(PENDING_KEY, toAdd.map(w => w.id));
    });
  }, [saveToStorage]);

  // Delete all workouts
  const deleteAllWorkouts = useCallback(() => {
    const current = workoutsRef.current;
    // Track all current IDs as deleted (single write + single push)
    deletedStore.add(current.map(w => w.id));
    removePendingIds(PENDING_KEY, current.map(w => w.id));
    saveToStorage([]);
    deleteAllWorkoutsRemote();
  }, [saveToStorage]);

  return {
    workouts,
    addWorkout,
    updateWorkout,
    deleteWorkout,
    getWorkoutById,
    importWorkouts,
    deleteAllWorkouts,
  };
}
