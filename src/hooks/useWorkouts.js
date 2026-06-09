'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { getItem, setItem } from '@/utils/storage';
import { generateId } from '@/utils/ids';
import { getPendingIds, addPendingIds, removePendingIds } from '@/utils/pending';
import {
  fetchWorkouts,
  upsertWorkout,
  upsertWorkouts,
  deleteWorkoutRemote,
  deleteAllWorkoutsRemote,
  upsertSetting,
  fetchSettings,
} from '@/lib/sync';

const WORKOUTS_KEY = 'workouts';
const DELETED_IDS_KEY = 'workouts_deleted_ids';
const PENDING_KEY = 'workouts_pending';

/**
 * Create a fingerprint for a workout to detect content-level duplicates
 * (same date + location + same exercises/distance even if IDs differ).
 */
function workoutFingerprint(w) {
  if (w.isDayOff) return `${w.date}|dayoff`;
  if (w.isRun) return `${w.date}|run|${w.runDistance}|${w.runTime}`;
  const exKey = (w.exercises || []).map(e => e.name).sort().join(',');
  return `${w.date}|${w.location}|${exKey}|${w.elapsedTime || 0}`;
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
 * Track IDs of workouts that were deleted locally.
 * Stored in BOTH localStorage (fast) and Supabase settings (durable).
 * Prevents Supabase from resurrecting them if the remote delete failed
 * or if localStorage is cleared during redeploy/bookmark changes.
 *
 * Stored as { updatedAt, ids } so devices can agree on the newest list
 * (last-write-wins). This allows explicit restores (JSON import) to
 * remove tombstones without a stale device re-deleting the restored data.
 * Legacy plain-array format is still read and migrated transparently.
 */
const DELETED_IDS_SETTING_KEY = 'deleted_workout_ids';

function parseDeletedMeta(raw) {
  if (Array.isArray(raw)) return { updatedAt: 0, ids: raw };
  if (raw && Array.isArray(raw.ids)) return { updatedAt: raw.updatedAt || 0, ids: raw.ids };
  return { updatedAt: 0, ids: [] };
}

function loadDeletedMeta() {
  return parseDeletedMeta(getItem(DELETED_IDS_KEY, []));
}

function saveDeletedMeta(meta) {
  setItem(DELETED_IDS_KEY, meta);
  // Also persist to Supabase so it survives localStorage wipes
  upsertSetting(DELETED_IDS_SETTING_KEY, JSON.stringify(meta));
}

/** Add one or more IDs to the tombstone list (single write + single push). */
function addDeletedIds(idsToAdd) {
  if (!idsToAdd.length) return;
  const meta = loadDeletedMeta();
  const set = new Set(meta.ids);
  for (const id of idsToAdd) set.add(id);
  saveDeletedMeta({ updatedAt: Date.now(), ids: [...set] });
}

/**
 * Remove IDs from the tombstone list. Used ONLY for explicit restores
 * (JSON import), where the user has clearly stated these workouts
 * should exist again.
 */
function removeDeletedIds(idsToRemove) {
  if (!idsToRemove.length) return;
  const meta = loadDeletedMeta();
  const remove = new Set(idsToRemove);
  const ids = meta.ids.filter(id => !remove.has(id));
  saveDeletedMeta({ updatedAt: Date.now(), ids });
}

/**
 * Fetch deleted IDs from Supabase settings (for when localStorage is cleared)
 * and reconcile with the local list. Newest list wins; two legacy lists
 * (no timestamp) are unioned to preserve old behavior.
 */
async function fetchAndMergeDeletedIds() {
  const local = loadDeletedMeta();
  let remote = null;
  try {
    const settings = await fetchSettings();
    if (settings && settings[DELETED_IDS_SETTING_KEY] !== undefined) {
      let val = settings[DELETED_IDS_SETTING_KEY];
      // Handle both jsonb (already parsed) and text (needs parsing)
      if (typeof val === 'string') {
        try { val = JSON.parse(val); } catch { val = null; }
      }
      if (val !== null && val !== undefined) remote = parseDeletedMeta(val);
    }
  } catch {}
  let merged;
  if (!remote) {
    merged = local;
  } else if (local.updatedAt === 0 && remote.updatedAt === 0) {
    merged = { updatedAt: 0, ids: [...new Set([...local.ids, ...remote.ids])] };
  } else {
    merged = remote.updatedAt >= local.updatedAt ? remote : local;
  }
  setItem(DELETED_IDS_KEY, merged);
  return new Set(merged.ids);
}

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
    Promise.all([fetchWorkouts(), fetchAndMergeDeletedIds()]).then(([remote, deletedIds]) => {
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
    addDeletedIds([id]);
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
    removeDeletedIds(newWorkouts.map(w => w.id));
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
    addDeletedIds(current.map(w => w.id));
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
