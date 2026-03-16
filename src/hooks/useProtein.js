'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import { getItem, setItem } from '@/utils/storage';
import { generateId } from '@/utils/ids';
import { getTodayStr } from '@/utils/format';
import {
  fetchProtein,
  upsertProteinEntry,
  upsertProteinEntries,
  deleteProteinRemote,
} from '@/lib/sync';

const PROTEIN_KEY = 'protein';

function loadProtein() {
  return getItem(PROTEIN_KEY, []);
}

export function useProtein() {
  const [entries, setEntriesState] = useState(() => loadProtein());

  // Hydrate from Supabase on mount
  useEffect(() => {
    let cancelled = false;
    fetchProtein().then(remote => {
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
      const merged = [...uniqueRemote, ...localOnly].sort((a, b) => {
        if (b.date !== a.date) return b.date.localeCompare(a.date);
        return (b.timestamp || 0) - (a.timestamp || 0);
      });
      setEntriesState(merged);
      setItem(PROTEIN_KEY, merged);
      if (localOnly.length > 0) upsertProteinEntries(localOnly);
    });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const saveToStorage = useCallback((updated) => {
    const sorted = updated.sort((a, b) => {
      if (b.date !== a.date) return b.date.localeCompare(a.date);
      return (b.timestamp || 0) - (a.timestamp || 0);
    });
    setEntriesState(sorted);
    setItem(PROTEIN_KEY, sorted);
    return sorted;
  }, []);

  const addEntry = useCallback((data) => {
    const entry = {
      id: generateId('p'),
      date: data.date || getTodayStr(),
      grams: Number(data.grams) || 0,
      food: data.food || '',
      timestamp: Date.now(),
    };
    const updated = [...entries, entry];
    saveToStorage(updated);
    upsertProteinEntry(entry);
    return entry;
  }, [entries, saveToStorage]);

  const updateEntry = useCallback((id, data) => {
    let updatedEntry = null;
    const updated = entries.map(e => {
      if (e.id !== id) return e;
      updatedEntry = {
        ...e,
        grams: data.grams !== undefined ? Number(data.grams) : e.grams,
        food: data.food !== undefined ? data.food : e.food,
      };
      return updatedEntry;
    });
    saveToStorage(updated);
    if (updatedEntry) upsertProteinEntry(updatedEntry);
  }, [entries, saveToStorage]);

  const deleteEntry = useCallback((id) => {
    const updated = entries.filter(e => e.id !== id);
    saveToStorage(updated);
    deleteProteinRemote(id);
  }, [entries, saveToStorage]);

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
    saveToStorage(newEntries);
    upsertProteinEntries(newEntries);
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
