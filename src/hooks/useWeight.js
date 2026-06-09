'use client';

import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { getItem, setItem } from '@/utils/storage';
import { generateId } from '@/utils/ids';
import { getTodayStr } from '@/utils/format';
import { getPendingIds, addPendingIds, removePendingIds } from '@/utils/pending';
import {
  fetchWeight,
  upsertWeightEntry,
  upsertWeightEntries,
  deleteWeightRemote,
} from '@/lib/sync';

const WEIGHT_KEY = 'weight';
const PENDING_KEY = 'weight_pending';

function loadWeight() {
  return getItem(WEIGHT_KEY, []);
}

export function useWeight() {
  const [entries, setEntriesState] = useState(() => loadWeight());
  // Ref mirrors current state so the hydrate merge always sees the latest
  // data, including entries added while the Supabase fetch was in flight.
  const entriesRef = useRef(entries);

  const saveToStorage = useCallback((updated) => {
    const sorted = [...updated].sort((a, b) => b.date.localeCompare(a.date));
    entriesRef.current = sorted;
    setEntriesState(sorted);
    setItem(WEIGHT_KEY, sorted);
    return sorted;
  }, []);

  // Hydrate from Supabase on mount
  useEffect(() => {
    let cancelled = false;
    fetchWeight().then(remote => {
      if (cancelled || !remote) return;
      // Use CURRENT local state (via ref), not a stale mount-time snapshot
      const current = entriesRef.current;
      const pendingIds = getPendingIds(PENDING_KEY);
      // Deduplicate remote by ID
      const seenIds = new Set();
      const uniqueRemote = remote.filter(e => {
        if (seenIds.has(e.id)) return false;
        seenIds.add(e.id);
        return true;
      });
      const remoteIds = new Set(uniqueRemote.map(e => e.id));
      const localOnly = current.filter(e => !remoteIds.has(e.id));
      // Local version wins while its latest change hasn't reached Supabase
      const mergedRemote = uniqueRemote.map(re => {
        if (pendingIds.has(re.id)) {
          const local = current.find(le => le.id === re.id);
          if (local) return local;
        }
        return re;
      });
      const merged = [...mergedRemote, ...localOnly];
      saveToStorage(merged);
      // Push anything Supabase doesn't have yet or has stale
      const toPush = merged.filter(e => pendingIds.has(e.id) || !remoteIds.has(e.id));
      if (toPush.length > 0) {
        upsertWeightEntries(toPush).then(ok => {
          if (ok) removePendingIds(PENDING_KEY, toPush.map(e => e.id));
        });
      }
      // Drop pending IDs that no longer exist anywhere
      const mergedIds = new Set(merged.map(e => e.id));
      removePendingIds(PENDING_KEY, [...pendingIds].filter(id => !mergedIds.has(id)));
    });
    return () => { cancelled = true; };
  }, [saveToStorage]);

  const addEntry = useCallback((data) => {
    const entry = {
      id: generateId('bw'),
      date: data.date || getTodayStr(),
      weight: Number(data.weight) || 0,
      unit: data.unit || 'lbs',
    };
    const updated = [...entriesRef.current, entry];
    saveToStorage(updated);
    addPendingIds(PENDING_KEY, [entry.id]);
    upsertWeightEntry(entry).then(ok => {
      if (ok) removePendingIds(PENDING_KEY, [entry.id]);
    });
    return entry;
  }, [saveToStorage]);

  const updateEntry = useCallback((id, data) => {
    let updatedEntry = null;
    const updated = entriesRef.current.map(e => {
      if (e.id !== id) return e;
      updatedEntry = {
        ...e,
        weight: data.weight !== undefined ? Number(data.weight) : e.weight,
        date: data.date !== undefined ? data.date : e.date,
      };
      return updatedEntry;
    });
    saveToStorage(updated);
    if (updatedEntry) {
      addPendingIds(PENDING_KEY, [id]);
      upsertWeightEntry(updatedEntry).then(ok => {
        if (ok) removePendingIds(PENDING_KEY, [id]);
      });
    }
  }, [saveToStorage]);

  const deleteEntry = useCallback((id) => {
    const updated = entriesRef.current.filter(e => e.id !== id);
    saveToStorage(updated);
    removePendingIds(PENDING_KEY, [id]);
    deleteWeightRemote(id);
  }, [saveToStorage]);

  // Latest entry
  const latest = useMemo(() => {
    return entries.length > 0 ? entries[0] : null;
  }, [entries]);

  // Bulk replace for import
  const replaceAll = useCallback((newEntries) => {
    saveToStorage(newEntries);
    addPendingIds(PENDING_KEY, newEntries.map(e => e.id));
    upsertWeightEntries(newEntries).then(ok => {
      if (ok) removePendingIds(PENDING_KEY, newEntries.map(e => e.id));
    });
  }, [saveToStorage]);

  return {
    entries,
    addEntry,
    updateEntry,
    deleteEntry,
    latest,
    replaceAll,
  };
}
