'use client';

import { useState, useCallback, useEffect } from 'react';
import { getItem, setItem } from '@/utils/storage';
import { generateId } from '@/utils/ids';
import {
  fetchPresets,
  upsertPresets,
  deletePresetRemote,
  fetchExercises,
  upsertExercises,
  deleteExerciseRemote,
} from '@/lib/sync';

const PRESETS_KEY = 'presets';
const EXERCISES_KEY = 'exercises';

// Color mapping for presets
const PRESET_COLORS = {
  blue: '#4a9eff',
  purple: '#a855f7',
  green: '#22c55e',
  yellow: '#facc15',
  red: '#ef4444',
  pink: '#ec4899',
  orange: '#f97316',
  cyan: '#06b6d4',
};

const COLOR_NAMES = Object.keys(PRESET_COLORS);

// Seed data from the owner's actual workout presets
const SEED_PRESETS = [
  {
    id: 'preset_garage-a',
    name: 'Garage A',
    color: 'blue',
    exercises: ['Pull-ups', 'Pike push-ups', 'Inverted rows', 'Decline push-ups', 'Hammer curls', 'Lateral raises', 'Deadhang'],
    order: 0,
  },
  {
    id: 'preset_garage-b',
    name: 'Garage B',
    color: 'purple',
    exercises: ['Chin-ups', 'Dips', 'Inverted rows', 'Overhead press', 'Bicep curls', 'Lateral raises', 'Deadhang'],
    order: 1,
  },
  {
    id: 'preset_bw-only',
    name: 'BW-only',
    color: 'green',
    exercises: ['Pull-ups', 'Dips', 'Inverted rows', 'Decline wide push-ups', 'Chin-ups', 'Decline close push-ups', 'Pike push-ups', 'Deadhang'],
    order: 2,
  },
  {
    id: 'preset_gtg',
    name: 'GtG',
    color: 'yellow',
    exercises: ['Pull-ups', 'Chin-ups'],
    order: 3,
  },
  {
    id: 'preset_manual',
    name: 'Manual',
    color: 'red',
    exercises: ['Pull-ups', 'Push-ups'],
    order: 4,
  },
  {
    id: 'preset_garage-10',
    name: 'Garage 10',
    color: 'pink',
    exercises: ['Pull-ups', 'Dips', 'Inverted rows', 'Decline close push-ups', 'Chin-ups', 'Pike push-ups', 'Bicep curls', 'Overhead press', 'Hammer curls', 'Lateral raises'],
    order: 5,
  },
  {
    id: 'preset_garage-12',
    name: 'Garage 12',
    color: 'orange',
    exercises: ['Pull-ups', 'Dips', 'Inverted rows', 'Decline wide push-ups', 'Chin-ups', 'Decline close push-ups', 'Bicep curls', 'Pike push-ups', 'Reverse curls', 'Lateral raises', 'Hammer curls', 'Front raises'],
    order: 6,
  },
  {
    id: 'preset_garage-bw',
    name: 'Garage BW',
    color: 'cyan',
    exercises: ['Pull-ups', 'Dips', 'Inverted rows', 'Decline wide push-ups', 'Chin-ups', 'Decline close push-ups', 'Pike push-ups', 'Bicep curls', 'Lateral raises'],
    order: 7,
  },
  {
    id: 'preset_day-off',
    name: 'Day Off',
    color: null,
    exercises: [],
    order: 8,
    isDayOff: true,
  },
];

// Build master exercise list from all presets
function buildExerciseList(presetsList) {
  const set = new Set();
  presetsList.forEach(p => p.exercises.forEach(e => set.add(e)));
  return [...set].sort();
}

function loadPresets() {
  const saved = getItem(PRESETS_KEY, null);
  if (saved && saved.length > 0) return saved;
  setItem(PRESETS_KEY, SEED_PRESETS);
  return SEED_PRESETS;
}

function loadExercises(presetsList) {
  const saved = getItem(EXERCISES_KEY, null);
  if (saved && saved.length > 0) return saved;
  const list = buildExerciseList(presetsList);
  setItem(EXERCISES_KEY, list);
  return list;
}

export { PRESET_COLORS, COLOR_NAMES };

export function usePresets() {
  const [presets, setPresetsState] = useState(() => loadPresets());
  const [exercises, setExercisesState] = useState(() => loadExercises(presets));

  // Hydrate from Supabase on mount
  useEffect(() => {
    let cancelled = false;
    Promise.all([fetchPresets(), fetchExercises()]).then(([remotePresets, remoteExercises]) => {
      if (cancelled) return;
      if (remotePresets && remotePresets.length > 0) {
        // Preserve local-only fields (like 'hidden') that Supabase doesn't store
        const localMap = {};
        for (const p of presets) { localMap[p.id] = p; }
        const merged = remotePresets.map(rp => {
          const local = localMap[rp.id];
          if (local && local.hidden) {
            return { ...rp, hidden: true };
          }
          return rp;
        });
        setPresetsState(merged);
        setItem(PRESETS_KEY, merged);
      } else if (presets.length > 0) {
        upsertPresets(presets);
      }
      if (remoteExercises && remoteExercises.length > 0) {
        setExercisesState(remoteExercises);
        setItem(EXERCISES_KEY, remoteExercises);
      } else if (exercises.length > 0) {
        upsertExercises(exercises);
      }
    });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const savePresets = useCallback((updated) => {
    setPresetsState(updated);
    setItem(PRESETS_KEY, updated);
  }, []);

  const saveExercises = useCallback((updated) => {
    setExercisesState(updated);
    setItem(EXERCISES_KEY, updated);
  }, []);

  const getPresetById = useCallback((id) => {
    return presets.find(p => p.id === id) || null;
  }, [presets]);

  const getPresetColor = useCallback((colorName) => {
    return PRESET_COLORS[colorName] || null;
  }, []);

  const addPreset = useCallback((data) => {
    const preset = {
      id: generateId('preset'),
      name: data.name.trim(),
      color: data.color || 'blue',
      exercises: data.exercises || [],
      order: presets.length,
    };
    const updated = [...presets, preset];
    savePresets(updated);
    upsertPresets([preset]);
    return preset;
  }, [presets, savePresets]);

  const updatePreset = useCallback((id, data) => {
    let updatedPreset = null;
    const updated = presets.map(p => {
      if (p.id !== id) return p;
      updatedPreset = { ...p, ...data };
      return updatedPreset;
    });
    savePresets(updated);
    if (updatedPreset) upsertPresets([updatedPreset]);
  }, [presets, savePresets]);

  const deletePreset = useCallback((id) => {
    const updated = presets
      .filter(p => p.id !== id)
      .map((p, idx) => ({ ...p, order: idx }));
    savePresets(updated);
    deletePresetRemote(id);
    upsertPresets(updated);
  }, [presets, savePresets]);

  const reorderPresets = useCallback((fromIndex, toIndex) => {
    const sorted = [...presets].sort((a, b) => a.order - b.order);
    const [moved] = sorted.splice(fromIndex, 1);
    sorted.splice(toIndex, 0, moved);
    const reordered = sorted.map((p, idx) => ({ ...p, order: idx }));
    savePresets(reordered);
    upsertPresets(reordered);
  }, [presets, savePresets]);

  const addExercise = useCallback((name) => {
    const trimmed = name.trim();
    if (!trimmed || exercises.includes(trimmed)) return false;
    const updated = [...exercises, trimmed].sort();
    saveExercises(updated);
    upsertExercises([trimmed]);
    return true;
  }, [exercises, saveExercises]);

  const deleteExercise = useCallback((name) => {
    const updated = exercises.filter(e => e !== name);
    saveExercises(updated);
    deleteExerciseRemote(name);
  }, [exercises, saveExercises]);

  const replaceAllPresets = useCallback((newPresets) => {
    savePresets(newPresets);
    upsertPresets(newPresets);
    const newExercises = buildExerciseList(newPresets);
    const merged = [...new Set([...exercises, ...newExercises])].sort();
    saveExercises(merged);
    upsertExercises(merged);
  }, [exercises, savePresets, saveExercises]);

  const replaceAllExercises = useCallback((newExercises) => {
    const sorted = newExercises.sort();
    saveExercises(sorted);
    upsertExercises(sorted);
  }, [saveExercises]);

  return {
    presets: presets.sort((a, b) => a.order - b.order),
    exercises,
    getPresetById,
    getPresetColor,
    addPreset,
    updatePreset,
    deletePreset,
    reorderPresets,
    addExercise,
    deleteExercise,
    replaceAllPresets,
    replaceAllExercises,
  };
}
