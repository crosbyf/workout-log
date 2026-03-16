/**
 * Supabase sync layer for GORS LOG.
 *
 * Strategy:
 * - localStorage is the fast cache (used for instant UI)
 * - Supabase is the source of truth (used for persistence across devices)
 * - On load: fetch from Supabase → merge with localStorage → update both
 * - On write: update localStorage immediately, then push to Supabase async
 */

import { supabase } from './supabase';

/**
 * Check if we can reach Supabase.
 */
export async function isOnline() {
  try {
    const { error } = await supabase.from('settings').select('key').limit(1);
    return !error;
  } catch {
    return false;
  }
}

/**
 * Diagnostic: write a test row, read it back, delete it.
 * Returns { success, steps[], error? }
 */
export async function runSyncDiagnostic() {
  const steps = [];
  const testId = `diag_${Date.now()}`;

  try {
    // Step 1: Write
    const { error: writeErr } = await supabase.from('settings').upsert({
      key: testId,
      value: 'test',
      updated_at: new Date().toISOString(),
    });
    if (writeErr) {
      steps.push({ step: 'Write', ok: false, detail: writeErr.message });
      return { success: false, steps, error: writeErr.message };
    }
    steps.push({ step: 'Write', ok: true, detail: 'Wrote test row' });

    // Step 2: Read
    const { data, error: readErr } = await supabase
      .from('settings')
      .select('*')
      .eq('key', testId)
      .single();
    if (readErr) {
      steps.push({ step: 'Read', ok: false, detail: readErr.message });
      return { success: false, steps, error: readErr.message };
    }
    steps.push({ step: 'Read', ok: true, detail: `Got value: ${JSON.stringify(data.value)}` });

    // Step 3: Cleanup
    const { error: delErr } = await supabase.from('settings').delete().eq('key', testId);
    if (delErr) {
      steps.push({ step: 'Delete', ok: false, detail: delErr.message });
    } else {
      steps.push({ step: 'Delete', ok: true, detail: 'Cleaned up test row' });
    }

    return { success: true, steps };
  } catch (err) {
    steps.push({ step: 'Connection', ok: false, detail: err.message });
    return { success: false, steps, error: err.message };
  }
}

/**
 * Force push all local data to Supabase (for first-time sync).
 * Returns { success, counts }
 */
export async function forcePushAll({ workouts, proteinEntries, weightEntries, presets, exercises, settings }) {
  const counts = {};
  let allOk = true;

  if (workouts && workouts.length > 0) {
    const ok = await upsertWorkouts(workouts);
    counts.workouts = { count: workouts.length, ok };
    if (!ok) allOk = false;
  }

  if (proteinEntries && proteinEntries.length > 0) {
    const ok = await upsertProteinEntries(proteinEntries);
    counts.protein = { count: proteinEntries.length, ok };
    if (!ok) allOk = false;
  }

  if (weightEntries && weightEntries.length > 0) {
    const ok = await upsertWeightEntries(weightEntries);
    counts.weight = { count: weightEntries.length, ok };
    if (!ok) allOk = false;
  }

  if (presets && presets.length > 0) {
    const ok = await upsertPresets(presets);
    counts.presets = { count: presets.length, ok };
    if (!ok) allOk = false;
  }

  if (exercises && exercises.length > 0) {
    const ok = await upsertExercises(exercises);
    counts.exercises = { count: exercises.length, ok };
    if (!ok) allOk = false;
  }

  if (settings && Object.keys(settings).length > 0) {
    const ok = await upsertAllSettings(settings);
    counts.settings = { count: Object.keys(settings).length, ok };
    if (!ok) allOk = false;
  }

  return { success: allOk, counts };
}

// ─── Workouts ───

export async function fetchWorkouts() {
  const { data, error } = await supabase
    .from('workouts')
    .select('*')
    .order('date', { ascending: false });
  if (error) { console.error('fetchWorkouts:', error); return null; }
  // Map DB columns → JS camelCase
  return data.map(row => {
    const exercises = row.exercises || [];
    // Decode run metadata stored as first element of exercises array
    const runMeta = exercises.length > 0 && exercises[0]?._runMeta ? exercises[0] : null;
    return {
      id: row.id,
      date: row.date,
      location: row.location || '',
      structure: row.structure || 'standard',
      structureDuration: row.structure_duration,
      exercises: runMeta ? [] : exercises,
      elapsedTime: row.elapsed_time || 0,
      notes: row.notes || '',
      isDayOff: row.is_day_off || false,
      isRun: !!runMeta,
      runDistance: runMeta ? runMeta.distance : null,
      runTime: runMeta ? runMeta.time : null,
      runPace: runMeta ? runMeta.pace : null,
    };
  });
}

export async function upsertWorkout(workout) {
  // Encode run metadata into exercises array for storage
  let exercises = workout.exercises || [];
  if (workout.isRun) {
    exercises = [{ _runMeta: true, distance: workout.runDistance, time: workout.runTime, pace: workout.runPace }];
  }
  const { error } = await supabase.from('workouts').upsert({
    id: workout.id,
    date: workout.date,
    location: workout.location || '',
    structure: workout.structure || 'standard',
    structure_duration: workout.structureDuration || null,
    exercises,
    elapsed_time: workout.elapsedTime || 0,
    notes: workout.notes || '',
    is_day_off: workout.isDayOff || false,
  }, { onConflict: 'id' });
  if (error) console.error('upsertWorkout:', error);
  return !error;
}

export async function upsertWorkouts(workouts) {
  if (!workouts.length) return true;
  const rows = workouts.map(w => {
    let exercises = w.exercises || [];
    if (w.isRun) {
      exercises = [{ _runMeta: true, distance: w.runDistance, time: w.runTime, pace: w.runPace }];
    }
    return {
      id: w.id,
      date: w.date,
      location: w.location || '',
      structure: w.structure || 'standard',
      structure_duration: w.structureDuration || null,
      exercises,
      elapsed_time: w.elapsedTime || 0,
      notes: w.notes || '',
      is_day_off: w.isDayOff || false,
    };
  });
  const { error } = await supabase.from('workouts').upsert(rows, { onConflict: 'id' });
  if (error) console.error('upsertWorkouts:', error);
  return !error;
}

export async function deleteWorkoutRemote(id) {
  const { error } = await supabase.from('workouts').delete().eq('id', id);
  if (error) console.error('deleteWorkoutRemote:', error);
  return !error;
}

export async function deleteAllWorkoutsRemote() {
  const { error } = await supabase.from('workouts').delete().neq('id', '');
  if (error) console.error('deleteAllWorkoutsRemote:', error);
  return !error;
}

// ─── Protein ───

export async function fetchProtein() {
  const { data, error } = await supabase
    .from('protein_entries')
    .select('*')
    .order('date', { ascending: false });
  if (error) { console.error('fetchProtein:', error); return null; }
  return data.map(row => ({
    id: row.id,
    date: row.date,
    grams: row.grams || 0,
    food: row.food || '',
    timestamp: row.timestamp || null,
  }));
}

export async function upsertProteinEntry(entry) {
  const { error } = await supabase.from('protein_entries').upsert({
    id: entry.id,
    date: entry.date,
    grams: entry.grams || 0,
    food: entry.food || '',
    timestamp: entry.timestamp || null,
  });
  if (error) console.error('upsertProteinEntry:', error);
  return !error;
}

export async function upsertProteinEntries(entries) {
  if (!entries.length) return true;
  const rows = entries.map(e => ({
    id: e.id,
    date: e.date,
    grams: e.grams || 0,
    food: e.food || '',
    timestamp: e.timestamp || null,
  }));
  const { error } = await supabase.from('protein_entries').upsert(rows);
  if (error) console.error('upsertProteinEntries:', error);
  return !error;
}

export async function deleteProteinRemote(id) {
  const { error } = await supabase.from('protein_entries').delete().eq('id', id);
  if (error) console.error('deleteProteinRemote:', error);
  return !error;
}

// ─── Weight ───

export async function fetchWeight() {
  const { data, error } = await supabase
    .from('weight_entries')
    .select('*')
    .order('date', { ascending: false });
  if (error) { console.error('fetchWeight:', error); return null; }
  return data.map(row => ({
    id: row.id,
    date: row.date,
    weight: row.weight || 0,
    unit: row.unit || 'lbs',
  }));
}

export async function upsertWeightEntry(entry) {
  const { error } = await supabase.from('weight_entries').upsert({
    id: entry.id,
    date: entry.date,
    weight: entry.weight || 0,
    unit: entry.unit || 'lbs',
  });
  if (error) console.error('upsertWeightEntry:', error);
  return !error;
}

export async function upsertWeightEntries(entries) {
  if (!entries.length) return true;
  const rows = entries.map(e => ({
    id: e.id,
    date: e.date,
    weight: e.weight || 0,
    unit: e.unit || 'lbs',
  }));
  const { error } = await supabase.from('weight_entries').upsert(rows);
  if (error) console.error('upsertWeightEntries:', error);
  return !error;
}

export async function deleteWeightRemote(id) {
  const { error } = await supabase.from('weight_entries').delete().eq('id', id);
  if (error) console.error('deleteWeightRemote:', error);
  return !error;
}

// ─── Presets ───

export async function fetchPresets() {
  const { data, error } = await supabase
    .from('presets')
    .select('*')
    .order('sort_order', { ascending: true });
  if (error) { console.error('fetchPresets:', error); return null; }
  return data.map(row => ({
    id: row.id,
    name: row.name,
    color: row.color,
    exercises: row.exercises || [],
    order: row.sort_order || 0,
    isDayOff: row.is_day_off || false,
  }));
}

export async function upsertPresets(presets) {
  if (!presets.length) return true;
  const rows = presets.map(p => ({
    id: p.id,
    name: p.name,
    color: p.color || null,
    exercises: p.exercises || [],
    sort_order: p.order || 0,
    is_day_off: p.isDayOff || false,
  }));
  const { error } = await supabase.from('presets').upsert(rows);
  if (error) console.error('upsertPresets:', error);
  return !error;
}

export async function deletePresetRemote(id) {
  const { error } = await supabase.from('presets').delete().eq('id', id);
  if (error) console.error('deletePresetRemote:', error);
  return !error;
}

// ─── Exercises ───

export async function fetchExercises() {
  const { data, error } = await supabase
    .from('exercises')
    .select('name')
    .order('name', { ascending: true });
  if (error) { console.error('fetchExercises:', error); return null; }
  return data.map(row => row.name);
}

export async function upsertExercises(names) {
  if (!names.length) return true;
  const rows = names.map(name => ({ name }));
  const { error } = await supabase.from('exercises').upsert(rows);
  if (error) console.error('upsertExercises:', error);
  return !error;
}

export async function deleteExerciseRemote(name) {
  const { error } = await supabase.from('exercises').delete().eq('name', name);
  if (error) console.error('deleteExerciseRemote:', error);
  return !error;
}

// ─── Settings ───

export async function fetchSettings() {
  const { data, error } = await supabase.from('settings').select('*');
  if (error) { console.error('fetchSettings:', error); return null; }
  const obj = {};
  for (const row of data) {
    obj[row.key] = row.value;
  }
  return obj;
}

export async function upsertSetting(key, value) {
  const { error } = await supabase.from('settings').upsert({
    key,
    value,
    updated_at: new Date().toISOString(),
  });
  if (error) console.error('upsertSetting:', error);
  return !error;
}

export async function upsertAllSettings(settingsObj) {
  const rows = Object.entries(settingsObj).map(([key, value]) => ({
    key,
    value,
    updated_at: new Date().toISOString(),
  }));
  if (!rows.length) return true;
  const { error } = await supabase.from('settings').upsert(rows);
  if (error) console.error('upsertAllSettings:', error);
  return !error;
}
