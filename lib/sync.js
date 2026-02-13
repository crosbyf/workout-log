import { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from './supabase';
import { useWorkoutStore } from '../stores/workoutStore';
import { usePresetStore } from '../stores/presetStore';
import { useTrackingStore } from '../stores/trackingStore';
import { useThemeStore } from '../stores/themeStore';

// ── Store registry ─────────────────────────────────────────────
// Maps each store key to its data accessors and change detection
const STORES = {
  workouts: {
    getData: () => ({ workouts: useWorkoutStore.getState().workouts }),
    setData: (data) => useWorkoutStore.setState({ workouts: data.workouts || [] }),
    subscribe: (cb) => useWorkoutStore.subscribe(cb),
    changed: (state, prev) => state.workouts !== prev.workouts,
  },
  presets: {
    getData: () => ({
      presets: usePresetStore.getState().presets,
      exercises: usePresetStore.getState().exercises,
    }),
    setData: (data) =>
      usePresetStore.setState({
        presets: data.presets || [],
        exercises: data.exercises || [],
      }),
    subscribe: (cb) => usePresetStore.subscribe(cb),
    changed: (state, prev) =>
      state.presets !== prev.presets || state.exercises !== prev.exercises,
  },
  tracking: {
    getData: () => ({
      weightEntries: useTrackingStore.getState().weightEntries,
      proteinEntries: useTrackingStore.getState().proteinEntries,
    }),
    setData: (data) =>
      useTrackingStore.setState({
        weightEntries: data.weightEntries || [],
        proteinEntries: data.proteinEntries || [],
      }),
    subscribe: (cb) => useTrackingStore.subscribe(cb),
    changed: (state, prev) =>
      state.weightEntries !== prev.weightEntries ||
      state.proteinEntries !== prev.proteinEntries,
  },
  theme: {
    getData: () => ({ theme: useThemeStore.getState().theme }),
    setData: (data) => {
      if (data.theme) useThemeStore.setState({ theme: data.theme });
    },
    subscribe: (cb) => useThemeStore.subscribe(cb),
    changed: (state, prev) => state.theme !== prev.theme,
  },
};

// ── Status management ──────────────────────────────────────────
let _syncStatus = 'idle'; // 'idle' | 'syncing' | 'synced' | 'error'
let _statusListeners = [];

export function getSyncStatus() {
  return _syncStatus;
}

export function onSyncStatusChange(cb) {
  _statusListeners.push(cb);
  return () => {
    _statusListeners = _statusListeners.filter((l) => l !== cb);
  };
}

function setStatus(s) {
  _syncStatus = s;
  _statusListeners.forEach((cb) => cb(s));
}

// ── React hooks ────────────────────────────────────────────────

/** Hook to get current sync status */
export function useSyncStatus() {
  const [status, setS] = useState(_syncStatus);
  useEffect(() => onSyncStatusChange(setS), []);
  return status;
}

/** Hook to get current auth session */
export function useSession() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    // Get existing session
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      setLoading(false);
    });

    // Listen for auth changes (magic link callback, sign out, etc.)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
    });

    return () => subscription.unsubscribe();
  }, []);

  return { session, loading };
}

// ── Merge helpers ──────────────────────────────────────────────
// When syncing for the first time or across devices, we merge
// cloud and local data to avoid losing anything.

function workoutKey(w) {
  const exNames = (w.exercises || [])
    .map((e) => e.name)
    .sort()
    .join('|');
  return w.date + '::' + exNames;
}

function mergeWorkouts(local, cloud) {
  const seen = new Map();
  // Cloud data first (prefer cloud version for exact duplicates)
  (cloud || []).forEach((w) => seen.set(workoutKey(w), w));
  // Local data — add only if not a duplicate
  (local || []).forEach((w) => {
    const key = workoutKey(w);
    if (!seen.has(key)) {
      seen.set(key, w);
    }
  });
  // Sort by date descending
  return Array.from(seen.values()).sort((a, b) =>
    a.date > b.date ? -1 : a.date < b.date ? 1 : 0
  );
}

function mergePresets(local, cloud) {
  const seen = new Map();
  (cloud || []).forEach((p) => seen.set(p.name, p));
  (local || []).forEach((p) => {
    if (!seen.has(p.name)) seen.set(p.name, p);
  });
  return Array.from(seen.values());
}

function mergeStringArrays(local, cloud) {
  return [...new Set([...(cloud || []), ...(local || [])])].sort();
}

function mergeWeightEntries(local, cloud) {
  const seen = new Map();
  (cloud || []).forEach((e) => seen.set(e.date, e));
  (local || []).forEach((e) => {
    if (!seen.has(e.date)) seen.set(e.date, e);
  });
  return Array.from(seen.values()).sort((a, b) =>
    a.date > b.date ? 1 : -1
  );
}

function mergeProteinEntries(local, cloud) {
  const seen = new Map();
  (cloud || []).forEach((e) => seen.set(e.timestamp, e));
  (local || []).forEach((e) => {
    if (!seen.has(e.timestamp)) seen.set(e.timestamp, e);
  });
  return Array.from(seen.values()).sort((a, b) => a.timestamp - b.timestamp);
}

// ── Cloud operations ───────────────────────────────────────────
let _isPulling = false;

async function getUser() {
  if (!supabase) return null;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

/** Pull all store data from Supabase and merge with local */
export async function pullFromCloud() {
  if (!isSupabaseConfigured()) return false;
  const user = await getUser();
  if (!user) return false;

  setStatus('syncing');

  try {
    const { data, error } = await supabase
      .from('user_data')
      .select('store_key, data')
      .eq('user_id', user.id);

    if (error) throw error;

    if (data && data.length > 0) {
      // Cloud has data — merge with local
      const cloudMap = {};
      data.forEach((row) => {
        cloudMap[row.store_key] = row.data;
      });

      _isPulling = true;

      // Merge workouts
      if (cloudMap.workouts) {
        const local = useWorkoutStore.getState().workouts;
        const cloud = cloudMap.workouts.workouts || [];
        useWorkoutStore.setState({ workouts: mergeWorkouts(local, cloud) });
      }

      // Merge presets + exercises
      if (cloudMap.presets) {
        const localP = usePresetStore.getState().presets;
        const localE = usePresetStore.getState().exercises;
        const cloudP = cloudMap.presets.presets || [];
        const cloudE = cloudMap.presets.exercises || [];
        usePresetStore.setState({
          presets: mergePresets(localP, cloudP),
          exercises: mergeStringArrays(localE, cloudE),
        });
      }

      // Merge tracking
      if (cloudMap.tracking) {
        const localW = useTrackingStore.getState().weightEntries;
        const localPr = useTrackingStore.getState().proteinEntries;
        const cloudW = cloudMap.tracking.weightEntries || [];
        const cloudPr = cloudMap.tracking.proteinEntries || [];
        useTrackingStore.setState({
          weightEntries: mergeWeightEntries(localW, cloudW),
          proteinEntries: mergeProteinEntries(localPr, cloudPr),
        });
      }

      // Theme: cloud wins
      if (cloudMap.theme) {
        STORES.theme.setData(cloudMap.theme);
      }

      _isPulling = false;

      // Push merged state back to cloud to keep it consistent
      await pushAllToCloud();
      setStatus('synced');
      return true;
    } else {
      // Cloud is empty — first-time sync, push local up
      _isPulling = false;
      await pushAllToCloud();
      setStatus('synced');
      return true;
    }
  } catch (err) {
    _isPulling = false;
    console.error('Sync pull failed:', err);
    setStatus('error');
    return false;
  }
}

/** Push a single store to Supabase */
export async function pushToCloud(storeKey) {
  if (!isSupabaseConfigured()) return false;
  const user = await getUser();
  if (!user) return false;

  const config = STORES[storeKey];
  if (!config) return false;

  try {
    const storeData = config.getData();
    const { error } = await supabase.from('user_data').upsert(
      {
        user_id: user.id,
        store_key: storeKey,
        data: storeData,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,store_key' }
    );

    if (error) throw error;
    return true;
  } catch (err) {
    console.error('Sync push (' + storeKey + ') failed:', err);
    return false;
  }
}

/** Push all stores to Supabase */
export async function pushAllToCloud() {
  setStatus('syncing');
  const results = await Promise.all(
    Object.keys(STORES).map((key) => pushToCloud(key))
  );
  const success = results.every(Boolean);
  setStatus(success ? 'synced' : 'error');
  return success;
}

// ── Auto-sync listeners ────────────────────────────────────────
let _listeners = [];
const _pushTimers = {};

function cancelPendingPushes() {
  Object.keys(_pushTimers).forEach((k) => clearTimeout(_pushTimers[k]));
}

function debouncedPush(storeKey) {
  clearTimeout(_pushTimers[storeKey]);
  _pushTimers[storeKey] = setTimeout(() => {
    pushToCloud(storeKey).then((ok) => {
      if (ok) setStatus('synced');
    });
  }, 1500);
  setStatus('syncing');
}

/** Subscribe to all store changes and auto-push to cloud */
export function setupStoreListeners() {
  teardownStoreListeners();

  Object.entries(STORES).forEach(([storeKey, config]) => {
    const unsub = config.subscribe((state, prevState) => {
      if (_isPulling) return;
      if (config.changed(state, prevState)) {
        debouncedPush(storeKey);
      }
    });
    _listeners.push(unsub);
  });
}

/** Remove all store listeners */
export function teardownStoreListeners() {
  _listeners.forEach((unsub) => unsub());
  _listeners = [];
  cancelPendingPushes();
}

// ── Initialize / Destroy ───────────────────────────────────────

/** Call on app mount when user is authenticated */
export async function initSync() {
  if (!isSupabaseConfigured()) return false;
  const success = await pullFromCloud();
  if (success) {
    setupStoreListeners();
  }
  return success;
}

/** Call on sign out or unmount */
export function destroySync() {
  teardownStoreListeners();
  setStatus('idle');
}
