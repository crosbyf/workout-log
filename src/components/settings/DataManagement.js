'use client';

import { useState, useRef } from 'react';
import { Download, Upload, FileSpreadsheet, Trash2 } from 'lucide-react';
import { getItem } from '@/utils/storage';
import { generateId } from '@/utils/ids';

/**
 * Parse a single CSV line, correctly handling quoted fields that may contain commas.
 * e.g. 'a,b,"notes with, commas",d' → ['a', 'b', 'notes with, commas', 'd']
 */
function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        if (i + 1 < line.length && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        current += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ',') {
        result.push(current);
        current = '';
      } else {
        current += ch;
      }
    }
  }
  result.push(current);
  return result;
}

/**
 * Parse the user's workout history CSV into workout objects.
 * CSV format: Row 1 blank, Row 2 headers, then grouped workout rows.
 * Date (MM-DD-YYYY) only on first exercise row per workout.
 * Last row of each workout: empty Exercise, preset name in "1" column.
 */
function parseWorkoutCSV(text) {
  const lines = text.split('\n').map(line => line.trim()).filter(Boolean);
  // Skip header row(s) — find the first data row
  let startIdx = 0;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith('Date,') || lines[i].startsWith('date,')) {
      startIdx = i + 1;
      break;
    }
  }

  const workouts = [];
  let currentWorkout = null;

  for (let i = startIdx; i < lines.length; i++) {
    const parts = parseCSVLine(lines[i]);
    const dateRaw = parts[0] ? parts[0].trim() : '';
    const exerciseName = parts[1] ? parts[1].trim() : '';

    // New workout starts when we see a date
    if (dateRaw && dateRaw.match(/^\d{2}-\d{2}-\d{4}$/)) {
      // Save previous workout if exists
      if (currentWorkout) {
        workouts.push(currentWorkout);
      }
      // Parse MM-DD-YYYY → YYYY-MM-DD
      const [mm, dd, yyyy] = dateRaw.split('-');
      const dateStr = `${yyyy}-${mm}-${dd}`;

      currentWorkout = {
        id: generateId('w'),
        date: dateStr,
        exercises: [],
        notes: '',
        location: '',
        structure: 'standard',
        structureDuration: null,
        elapsedTime: 0,
        isDayOff: false,
      };
    }

    if (!currentWorkout) continue;

    // Summary row (no exercise name) — preset name in column "1" (index 2)
    if (!exerciseName) {
      const presetName = parts[2] ? parts[2].trim() : '';
      // Notes: grab everything from column 7 onward (in case commas weren't quoted)
      let notes = parts.slice(7).join(',').trim();
      // Strip leading/trailing quotes and clean up empty-quoted fields
      notes = notes.replace(/^"+|"+$/g, '').trim();
      if (presetName) currentWorkout.location = presetName;
      if (presetName === 'Day Off') {
        currentWorkout.isDayOff = true;
        currentWorkout.exercises = [];
      }
      if (notes) currentWorkout.notes = notes;
      continue;
    }

    // Exercise row
    const sets = [];
    for (let s = 2; s <= 5; s++) {
      const val = parts[s] ? parts[s].trim() : '';
      if (val && !isNaN(val)) {
        sets.push({ reps: parseInt(val, 10), weight: null });
      }
    }
    // Exercise notes: grab everything from column 7 onward, clean up stray quotes from empty CSV fields
    let exNotes = parts.slice(7).join(',').trim();
    // Strip leading/trailing quotes and clean up empty-quoted fields
    exNotes = exNotes.replace(/^"+|"+$/g, '').trim();

    if (sets.length > 0) {
      currentWorkout.exercises.push({
        name: exerciseName,
        sets,
        notes: exNotes,
      });
    }
  }

  // Don't forget the last workout
  if (currentWorkout) {
    workouts.push(currentWorkout);
  }

  return workouts;
}

/**
 * Parse the user's workout presets CSV.
 * No headers. Each row: PresetName,Exercise1,Exercise2,...
 */
function parsePresetsCSV(text) {
  const colorOrder = ['blue', 'purple', 'green', 'yellow', 'red', 'pink', 'orange', 'cyan'];
  const lines = text.split('\n').map(line => line.trim()).filter(Boolean);
  const presets = [];

  for (let i = 0; i < lines.length; i++) {
    const parts = lines[i].split(',').map(p => p.trim()).filter(Boolean);
    if (parts.length === 0) continue;

    const name = parts[0];
    const exercises = parts.slice(1);
    const isDayOff = name === 'Day Off';

    presets.push({
      id: `preset_import_${i}`,
      name,
      color: isDayOff ? null : colorOrder[i % colorOrder.length],
      exercises: isDayOff ? [] : exercises,
      order: i,
      isDayOff,
    });
  }

  return presets;
}

export default function DataManagement({
  workouts,
  onImportWorkouts,
  onImportPresets,
  onDeleteAllWorkouts,
  proteinEntries,
  weightEntries,
  proteinData = {},
  weightData = {},
}) {
  const [importStatus, setImportStatus] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const fileInputRef = useRef(null);
  const csvWorkoutRef = useRef(null);
  const csvPresetRef = useRef(null);

  // ── JSON Export ──
  const handleExport = () => {
    const data = {
      version: 1,
      exportedAt: new Date().toISOString(),
      workouts: getItem('workouts', []),
      presets: getItem('presets', []),
      exercises: getItem('exercises', []),
      protein: getItem('protein', []),
      weight: getItem('weight', []),
      theme: getItem('theme', 'dark'),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gorslog-export-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setImportStatus({ type: 'success', message: 'Data exported successfully!' });
  };

  // ── JSON Import ──
  const handleImportJSON = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        if (!data.workouts || !Array.isArray(data.workouts)) {
          setImportStatus({ type: 'error', message: 'Invalid JSON format — no workouts array found.' });
          return;
        }
        // Restore all data types
        onImportWorkouts(data.workouts);
        if (data.presets) onImportPresets(data.presets);
        if (data.protein && Array.isArray(data.protein) && proteinData.replaceAll) {
          proteinData.replaceAll(data.protein);
        }
        if (data.weight && Array.isArray(data.weight) && weightData.replaceAll) {
          weightData.replaceAll(data.weight);
        }
        if (data.theme) {
          // Also restore theme preference
          try { localStorage.setItem('gorslog_theme', JSON.stringify(data.theme)); } catch {}
        }
        const parts = [`${data.workouts.length} workouts`];
        if (data.presets) parts.push(`${data.presets.length} presets`);
        if (data.protein && data.protein.length > 0) parts.push(`${data.protein.length} protein entries`);
        if (data.weight && data.weight.length > 0) parts.push(`${data.weight.length} weight entries`);
        setImportStatus({
          type: 'success',
          message: `Imported ${parts.join(', ')}.`,
        });
      } catch (err) {
        setImportStatus({ type: 'error', message: 'Failed to parse JSON file.' });
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // ── CSV Workout Import ──
  const handleImportWorkoutCSV = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = parseWorkoutCSV(event.target.result);
        if (parsed.length === 0) {
          setImportStatus({ type: 'error', message: 'No workouts found in CSV.' });
          return;
        }
        onImportWorkouts(parsed);
        setImportStatus({
          type: 'success',
          message: `Imported ${parsed.length} workouts from CSV!`,
        });
      } catch (err) {
        setImportStatus({ type: 'error', message: 'Failed to parse workout CSV.' });
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // ── CSV Preset Import ──
  const handleImportPresetCSV = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = parsePresetsCSV(event.target.result);
        if (parsed.length === 0) {
          setImportStatus({ type: 'error', message: 'No presets found in CSV.' });
          return;
        }
        onImportPresets(parsed);
        setImportStatus({
          type: 'success',
          message: `Imported ${parsed.length} presets from CSV!`,
        });
      } catch (err) {
        setImportStatus({ type: 'error', message: 'Failed to parse preset CSV.' });
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // ── Delete All ──
  const handleDeleteAll = () => {
    onDeleteAllWorkouts();
    setShowDeleteConfirm(false);
    setImportStatus({ type: 'success', message: 'All workouts deleted.' });
  };

  const workoutCount = workouts ? workouts.length : 0;
  const proteinCount = proteinEntries ? proteinEntries.length : 0;
  const weightCount = weightEntries ? weightEntries.length : 0;

  return (
    <div className="space-y-3">
      {/* Stats summary */}
      <div className="text-xs px-1 mb-2" style={{ color: 'var(--color-text-dim)' }}>
        {workoutCount} workouts · {proteinCount} protein entries · {weightCount} weight entries
      </div>

      {/* Status message */}
      {importStatus && (
        <div
          className="text-xs px-3 py-2 rounded-lg mb-2"
          style={{
            backgroundColor: importStatus.type === 'success' ? 'var(--color-green)' : 'var(--color-red)',
            color: '#ffffff',
            opacity: 0.9,
          }}
        >
          {importStatus.message}
        </div>
      )}

      {/* Export JSON */}
      <button
        onClick={handleExport}
        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm"
        style={{ backgroundColor: 'var(--color-surface-hover)', color: 'var(--color-text)' }}
      >
        <Download size={16} style={{ color: 'var(--color-accent)' }} />
        Export All Data (JSON)
      </button>

      {/* Import JSON */}
      <button
        onClick={() => fileInputRef.current?.click()}
        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm"
        style={{ backgroundColor: 'var(--color-surface-hover)', color: 'var(--color-text)' }}
      >
        <Upload size={16} style={{ color: 'var(--color-accent)' }} />
        Import Data (JSON)
      </button>
      <input ref={fileInputRef} type="file" accept=".json" onChange={handleImportJSON} className="hidden" />

      {/* Import Workout CSV */}
      <button
        onClick={() => csvWorkoutRef.current?.click()}
        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm"
        style={{ backgroundColor: 'var(--color-surface-hover)', color: 'var(--color-text)' }}
      >
        <FileSpreadsheet size={16} style={{ color: 'var(--color-green)' }} />
        Import Workout History (CSV)
      </button>
      <input ref={csvWorkoutRef} type="file" accept=".csv" onChange={handleImportWorkoutCSV} className="hidden" />

      {/* Import Preset CSV */}
      <button
        onClick={() => csvPresetRef.current?.click()}
        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm"
        style={{ backgroundColor: 'var(--color-surface-hover)', color: 'var(--color-text)' }}
      >
        <FileSpreadsheet size={16} style={{ color: 'var(--color-yellow)' }} />
        Import Presets (CSV)
      </button>
      <input ref={csvPresetRef} type="file" accept=".csv" onChange={handleImportPresetCSV} className="hidden" />

      {/* Delete All Workouts */}
      {workoutCount > 0 && (
        <>
          {showDeleteConfirm ? (
            <div className="flex gap-2">
              <button
                onClick={handleDeleteAll}
                className="flex-1 py-2.5 rounded-lg text-sm font-bold"
                style={{ backgroundColor: 'var(--color-red)', color: '#ffffff' }}
              >
                Yes, Delete All {workoutCount} Workouts
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2.5 rounded-lg text-sm"
                style={{ backgroundColor: 'var(--color-surface-hover)', color: 'var(--color-text-muted)' }}
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm"
              style={{ backgroundColor: 'var(--color-surface-hover)', color: 'var(--color-red)' }}
            >
              <Trash2 size={16} />
              Delete All Workouts
            </button>
          )}
        </>
      )}
    </div>
  );
}
