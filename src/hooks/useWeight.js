'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import { getItem, setItem } from '@/utils/storage';
import { generateId } from '@/utils/ids';
import { getTodayStr } from '@/utils/format';
import {
  fetchWeight,
  upsertWeightEntry,
  upsertWeightEntries,
  deleteWeightRemote,
} from '@/lib/sync';

const WEIGHT_KEY = 'weight';

function loadWeight() {
  return getItem(WEIGHT_KEY, []);
}

export function useWeight() {
  const [entries, setEntriesState] = useState(() => loadWeight());

  // Hydrate from Supabase on mount
  useEffect(() => {
    let cancelled = false;
    fetchWeight().then(remote => {
      if (cancelled || !remote) return;
      // Deduplicate remote by ID
      const seenIds = new Set();
      const uniqueRemote = remote.filter(e => {
        if (seenIds.has(e.id)) return false;
        seenIds.add(e.id);
        return true;
      });
      const remoteIds = new Set(uniqueRemote.map(e => e.id));
      const localOnly = entries.filter(e => !remoteIds.has(e.id));
      const merged = [...uniqueRemote, ...localOnly].sort(
        (a, b) => b.date.localeCompare(a.date)
      );
      setEntriesState(merged);
      setItem(WEIGHT_KEY, merged);
      if (localOnly.length > 0) upsertWeightEntries(localOnly);
    });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const saveToStorage = useCallback((updated) => {
    const sorted = updated.sort((a, b) => b.date.localeCompare(a.date));
    setEntriesState(sorted);
    setItem(WEIGHT_KEY, sorted);
    return sorted;
  }, []);

  const addEntry = useCallback((data) => {
    const entry = {
      id: generateId('bw'),
      date: data.date || getTodayStr(),
      weight: Number(data.weight) || 0,
      unit: data.unit || 'lbs',
    };
    const updated = [...entries, entry];
    saveToStorage(updated);
    upsertWeightEntry(entry);
    return entry;
  }, [entries, saveToStorage]);

  const updateEntry = useCallback((id, data) => {
    let updatedEntry = null;
    const updated = entries.map(e => {
      if (e.id !== id) return e;
      updatedEntry = {
        ...e,
        weight: data.weight !== undefined ? Number(data.weight) : e.weight,
        date: data.date !== undefined ? data.date : e.date,
      };
      return updatedEntry;
    });
    saveToStorage(updated);
    if (updatedEntry) upsertWeightEntry(updatedEntry);
  }, [entries, saveToStorage]);

  const deleteEntry = useCallback((id) => {
    const updated = entries.filter(e => e.id !== id);
    saveToStorage(updated);
    deleteWeightRemote(id);
  }, [entries, saveToStorage]);

  // Latest entry
  const latest = useMemo(() => {
    return entries.length > 0 ? entries[0] : null;
  }, [entries]);

  // Bulk replace for import
  const replaceAll = useCallback((newEntries) => {
    saveToStorage(newEntries);
    upsertWeightEntries(newEntries);
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
