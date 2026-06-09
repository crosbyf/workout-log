'use client';

import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { getItem, setItem } from '@/utils/storage';
import { generateId } from '@/utils/ids';
import { getTodayStr } from '@/utils/format';
import { getPendingIds, addPendingIds, removePendingIds } from '@/utils/pending';
import { createTombstoneStore } from '@/utils/tombstones';
import {
  fetchProtein,
  upsertProteinEntry,
  upsertProteinEntries,
  deleteProteinRemote,
} from '@/lib/sync';

const PROTEIN_KEY = 'protein';
const PENDING_KEY = 'protein_pending';

// Tombstones so deleted protein entries can't be resurrected by stale
// localStorage or a failed remote delete — see src/utils/tombstones.js
const deletedStore = createTombstoneStore('protein_deleted_ids', 'deleted_protein_ids');

function loadProtein() {
  return getItem(PROTEIN_KEY, []);
}

export function useProtein() {
  const [entries, setEntriesState] = useState(() => loadProtein());
  // Ref mirrors current state so the hydrate merge always sees the latest
  // data, including entries added while the Supabase fetch was in flight.
  const entriesRef = useRef(entries);

  const saveToStorage = useCallback((updated) => {
    const sorted = [...updated].sort((a, b) => {
      if (b.date !== a.date) return b.date.localeCompare(a.date);
      return (b.timestamp || 0) - (a.timestamp || 0);
    });
    entriesRef.current = sorted;
    setEntriesState(sorted);
    setItem(PROTEIN_KEY, sorted);
    return sorted;
  }, []);

  // Hydrate from Supabase on mount
  useEffect(() => {
    let cancelled = false;
    Promise.all([fetchProtein(), deletedStore.fetchAndMerge()]).then(([remote, deletedIds]) => {
      if (cancelled || !remote) return;
      // Use CURRENT local state (via ref), not a stale mount-time snapshot
      const current = entriesRef.current;
      const pendingIds = getPendingIds(PENDING_KEY);
      // Retry deleting ONLY tombstoned IDs that actually still exist remotely
      const allRemoteIds = new Set(remote.map(e => e.id));
      [...deletedIds].filter(id => allRemoteIds.has(id)).forEach(id => deleteProteinRemote(id));
      // Deduplicate remote by ID, excluding anything deleted locally
      const seenIds = new Set();
      const uniqueRemote = remote.filter(e => {
        if (deletedIds.has(e.id)) return false;
        if (seenIds.has(e.id)) return false;
        seenIds.add(e.id);
        return true;
      });
      const remoteIds = new Set(uniqueRemote.map(e => e.id));
      const localOnly = current.filter(e => !remoteIds.has(e.id) && !deletedIds.has(e.id));
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
        upsertProteinEntries(toPush).then(ok => {
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
      id: generateId('p'),
      date: data.date || getTodayStr(),
      grams: Number(data.grams) || 0,
      food: data.food || '',
      timestamp: Date.now(),
    };
    const updated = [...entriesRef.current, entry];
    saveToStorage(updated);
    addPendingIds(PENDING_KEY, [entry.id]);
    upsertProteinEntry(entry).then(ok => {
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
        grams: data.grams !== undefined ? Number(data.grams) : e.grams,
        food: data.food !== undefined ? data.food : e.food,
      };
      return updatedEntry;
    });
    saveToStorage(updated);
    if (updatedEntry) {
      addPendingIds(PENDING_KEY, [id]);
      upsertProteinEntry(updatedEntry).then(ok => {
        if (ok) removePendingIds(PENDING_KEY, [id]);
      });
    }
  }, [saveToStorage]);

  const deleteEntry = useCallback((id) => {
    const updated = entriesRef.current.filter(e => e.id !== id);
    saveToStorage(updated);
    removePendingIds(PENDING_KEY, [id]);
    // Track this deletion so it can't be resurrected
    deletedStore.add([id]);
    deleteProteinRemote(id);
  }, [saveToStorage]);

  // Today's total
  const todayTotal = useMemo(() => {
    const today = getTodayStr();
    return entries
      .filter(e => e.date === today)
      .reduce((sum, e) => sum + (e.grams || 0), 0);
  }, [entries]);

  // Group entries by date for daily breakdown
  const entriesByDate = useMemo(() => {
    const map = {};
    for (const entry of entries) {
      if (!map[entry.date]) map[entry.date] = [];
      map[entry.date].push(entry);
    }
    return Object.keys(map)
      .sort((a, b) => b.localeCompare(a))
      .map(date => ({
        date,
        total: map[date].reduce((sum, e) => sum + (e.grams || 0), 0),
        entries: map[date],
      }));
  }, [entries]);

  // Bulk replace for import
  const replaceAll = useCallback((newEntries) => {
    // Explicit restore: clear tombstones for imported IDs
    deletedStore.remove(newEntries.map(e => e.id));
    saveToStorage(newEntries);
    addPendingIds(PENDING_KEY, newEntries.map(e => e.id));
    upsertProteinEntries(newEntries).then(ok => {
      if (ok) removePendingIds(PENDING_KEY, newEntries.map(e => e.id));
    });
  }, [saveToStorage]);

  return {
    entries,
    addEntry,
    updateEntry,
    deleteEntry,
    todayTotal,
    entriesByDate,
    replaceAll,
  };
}
