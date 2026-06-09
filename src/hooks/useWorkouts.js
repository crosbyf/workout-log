'use client';

import { useState, useCallback, useEffect } from 'react';
import { getItem, setItem } from '@/utils/storage';
import { generateId } from '@/utils/ids';
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
 */
const DELETED_IDS_SETTING_KEY = 'deleted_workout_ids';

function getDeletedIds() {
  return new Set(getItem(DELETED_IDS_KEY, []));
}

function addDeletedId(id) {
  const ids = getDeletedIds();
  ids.add(id);
  const arr = [...ids];
  setItem(DELETED_IDS_KEY, arr);
  // Also persist to Supabase so it survives localStorage wipes
  upsertSetting(DELETED_IDS_SETTING_KEY, JSON.stringify(arr));
}

// Note: we intentionally never remove IDs from the deleted list.
// This prevents stale localStorage from re-pushing deleted workouts to Supabase.

/**
 * Fetch deleted IDs from Supabase settings (for when localStorage is cleared).
 * Merges with any local IDs.
 */
async function fetchAndMergeDeletedIds() {
  const localIds = getDeletedIds();
  try {
    const settings = await fetchSettings();
    if (settings && settings[DELETED_IDS_SETTING_KEY]) {
      let remoteIds = settings[DELETED_IDS_SETTING_KEY];
      // Handle both jsonb (already parsed) and text (needs parsing)
      if (typeof remoteIds === 'string') {
        try { remoteIds = JSON.parse(remoteIds); } catch { remoteIds = []; }
      }
      if (Array.isArray(remoteIds)) {
        for (const id of remoteIds) localIds.add(id);
      }
    }
  } catch {}
  // Update localStorage with merged set
  setItem(DELETED_IDS_KEY, [...localIds]);
  return localIds;
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

  // Hydrate from Supabase on mount
  useEffect(() => {
    let cancelled = false;
    // Fetch deleted IDs from both localStorage AND Supabase before processing
    Promise.all([fetchWorkouts(), fetchAndMergeDeletedIds()]).then(([remote, deletedIds]) => {
      if (cancelled || !remote) return;
      // Filter out any workouts that were deleted locally but may still exist in Supabase
      const filteredRemote = remote.filter(w => !deletedIds.has(w.id));
      // Retry deleting those IDs from Supabase in the background
      // Keep tracking them permanently — never remove from deleted list
      if (deletedIds.size > 0) {
        [...deletedIds].forEach(id => deleteWorkoutRemote(id));
      }
      // Deduplicate remote data
      const uniqueRemote = deduplicateWorkouts(filteredRemote);
      // Merge: Supabase is source of truth, but keep any local-only items
      const remoteIds = new Set(uniqueRemote.map(w => w.id));
      const localOnly = workouts.filter(w => !remoteIds.has(w.id) && !deletedIds.has(w.id));
      // For remote items missing run fields, check if local version has them
      const mergedRemote = uniqueRemote.map(rw => {
        const local = workouts.find(lw => lw.id === rw.id);
        if (local && local.isRun && !rw.isRun) {
          return { ...rw, isRun: true, runDistance: local.runDistance, runTime: local.runTime, runPace: local.runPace };
        }
        return rw;
      });
      // Final dedup across both sources (catches cross-source duplicates)
      const merged = deduplicateWorkouts([...mergedRemote, ...localOnly])
        .sort((a, b) => b.date.localeCompare(a.date));
      setWorkoutsState(merged);
      setItem(WORKOUTS_KEY, merged);
      // Push any local-only items to Supabase
      if (localOnly.length > 0) {
        upsertWorkouts(localOnly);
      }
    });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const saveToStorage = useCallback((updated) => {
    const sorted = updated.sort((a, b) => b.date.localeCompare(a.date));
    setWorkoutsState(sorted);
    setItem(WORKOUTS_KEY, sorted);
    return sorted;
  }, []);

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
    const updated = [...workouts, workout];
    saveToStorage(updated);
    // Sync to Supabase
    upsertWorkout(workout);
    return workout;
  }, [workouts, saveToStorage]);

  const updateWorkout = useCallback((id, data) => {
    let updatedWorkout = null;
    const updated = workouts.map(w => {
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
    // Sync to Supabase
    if (updatedWorkout) upsertWorkout(updatedWorkout);
  }, [workouts, saveToStorage]);

  const deleteWorkout = useCallback((id) => {
    const updated = workouts.filter(w => w.id !== id);
    saveToStorage(updated);
    // Track this deletion permanently so stale localStorage can't re-push it
    addDeletedId(id);
    // Also remove from Supabase (but keep tracking the ID regardless of success)
    deleteWorkoutRemote(id);
  }, [workouts, saveToStorage]);

  const getWorkoutById = useCallback((id) => {
    return workouts.find(w => w.id === id) || null;
  }, [workouts]);

  // Bulk import: merges imported workouts with existing (deduplicates by id)
  const importWorkouts = useCallback((newWorkouts) => {
    const existingIds = new Set(workouts.map(w => w.id));
    const toAdd = newWorkouts.filter(w => !existingIds.has(w.id));
    const updated = [...workouts, ...toAdd];
    saveToStorage(updated);
    // Sync all to Supabase
    upsertWorkouts(toAdd);
  }, [workouts, saveToStorage]);

  // Delete all workouts
  const deleteAllWorkouts = useCallback(() => {
    // Track all current IDs as deleted permanently
    workouts.forEach(w => addDeletedId(w.id));
    saveToStorage([]);
    deleteAllWorkoutsRemote();
  }, [workouts, saveToStorage]);

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
