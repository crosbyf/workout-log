import React, { useState, useEffect } from 'react';
import Head from 'next/head';

const Icons = {
  Plus: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
  ),
  TrendingUp: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>
    </svg>
  ),
  Calendar: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/>
      <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  ),
  Upload: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/>
      <line x1="12" y1="3" x2="12" y2="15"/>
    </svg>
  ),
  Dumbbell: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M14.4 14.4L9.6 9.6M21.5 21.5l-1.4-1.4M3.9 3.9l1.4 1.4"/>
    </svg>
  ),
  X: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  ),
  Copy: () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
    </svg>
  ),
  Trash: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="3 6 5 6 21 6"/>
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
    </svg>
  ),
  Edit: () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
    </svg>
  ),
  Settings: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="3"/>
      <path d="M12 1v6m0 6v6m5.196-13.196l-4.242 4.242m0 5.656l-4.243 4.243"/>
    </svg>
  ),
  Search: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
    </svg>
  ),
  ArrowUpDown: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="m21 16-4 4-4-4M17 20V4M3 8l4-4 4 4M7 4v16"/>
    </svg>
  ),
  Download: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
      <polyline points="7 10 12 15 17 10"/>
      <line x1="12" y1="15" x2="12" y2="3"/>
    </svg>
  ),
  ChevronDown: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="6 9 12 15 18 9"/>
    </svg>
  ),
};

export default function Home() {
  const [workouts, setWorkouts] = useState([]);
  const [presets, setPresets] = useState([]);
  const [exercises, setExercises] = useState([]);
  const [view, setView] = useState('calendar'); // Start with calendar as home
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [editing, setEditing] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [sortOrder, setSortOrder] = useState('desc');
  const [search, setSearch] = useState('');
  const [showClear, setShowClear] = useState(false);
  const [expandedTrends, setExpandedTrends] = useState({});
  const [deleteWorkout, setDeleteWorkout] = useState(null);
  const [deletePreset, setDeletePreset] = useState(null);
  const [deleteExercise, setDeleteExercise] = useState(null);
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);
  const [workoutViewMode, setWorkoutViewMode] = useState('table'); // 'table' or 'cards'
  const [historyFilter, setHistoryFilter] = useState('all'); // 'all', 'day', 'week', 'month'
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(null);
  const [showDayModal, setShowDayModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [expandedRecent, setExpandedRecent] = useState(null);
  const [showWorkoutModal, setShowWorkoutModal] = useState(false);
  const [showPresetSelector, setShowPresetSelector] = useState(false);
  
  // Helper to get today's date in YYYY-MM-DD format without timezone issues
  const getTodayDate = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  
  const [current, setCurrent] = useState({
    date: getTodayDate(),
    exercises: [],
    notes: '',
    location: ''
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const w = localStorage.getItem('workouts');
      const p = localStorage.getItem('presets');
      const e = localStorage.getItem('exercises');
      if (w) setWorkouts(JSON.parse(w));
      if (p) setPresets(JSON.parse(p));
      if (e) setExercises(JSON.parse(e));
      setLoading(false);
    }
  }, []);
  
  // Disable background scroll when modals are open
  useEffect(() => {
    if (showDayModal || showHistoryModal || showSettings || showClear || deleteWorkout !== null || deletePreset !== null || deleteExercise !== null || showCloseConfirm || showPresetSelector || showWorkoutModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [showDayModal, showHistoryModal, showSettings, showClear, deleteWorkout, deletePreset, deleteExercise, showCloseConfirm, showPresetSelector, showWorkoutModal]);

  const save = (data, key, setter) => {
    localStorage.setItem(key, JSON.stringify(data));
    setter(data);
  };

  const importPresets = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const lines = ev.target.result.split('\n');
      const ps = [], exs = new Set();
      lines.forEach((line) => {
        const cols = line.split(',').map(c => c.trim().replace(/^"|"$/g, ''));
        if (!cols[0]) return;
        ps.push({ name: cols[0], exercises: cols.slice(1).filter(e => e) });
        cols.slice(1).filter(e => e).forEach(e => exs.add(e));
      });
      save(ps, 'presets', setPresets);
      save(Array.from(exs).sort(), 'exercises', setExercises);
      e.target.value = '';
    };
    reader.readAsText(file);
  };

  const parseDate = (str) => {
    // Handle MM-DD-YYYY format
    const parts = str.split('-');
    if (parts.length === 3) {
      const month = parts[0].padStart(2, '0');
      const day = parts[1].padStart(2, '0');
      const year = parts[2].length === 4 ? parts[2] : '2026';
      return `${year}-${month}-${day}`;
    }
    return str;
  };

  const importWorkouts = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const lines = ev.target.result.split('\n').map(l => l.trim()).filter(l => l);
      const imp = [];
      let currentWorkout = null;
      let workoutLocation = '';

      // First line is the location (e.g., "Garage BW")
      if (lines.length > 0 && !lines[0].toLowerCase().includes('date')) {
        workoutLocation = lines[0].split(',')[0].trim();
      }

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const cols = line.split(',').map(c => c.trim());

        // Skip header rows
        if (cols[0] && (cols[0].toLowerCase() === 'date' || cols[1] && cols[1].toLowerCase() === 'exercise')) {
          continue;
        }

        // Skip the first location line
        if (i === 0 && !cols[0].match(/^\d/)) {
          continue;
        }

        // Check if this is a new workout (has a date)
        if (cols[0] && cols[0].match(/^\d+-\d+/)) {
          // Save previous workout if exists
          if (currentWorkout && currentWorkout.exercises.length > 0) {
            imp.push(currentWorkout);
          }

          // Start new workout
          currentWorkout = {
            date: parseDate(cols[0]),
            exercises: [],
            notes: '',
            location: workoutLocation
          };

          // Add first exercise if present
          if (cols[1] && cols[1] !== 'Day Off') {
            const sets = [cols[2], cols[3], cols[4], cols[5]]
              .filter(s => s && s.trim())
              .map(s => ({ reps: parseInt(s) || 0, weight: null }));
            
            currentWorkout.exercises.push({
              name: cols[1],
              sets: sets,
              notes: cols[7] || ''
            });
          }
        }
        // Check if this is an additional exercise (no date, but has exercise name)
        else if (currentWorkout && cols[1] && cols[1].trim() && cols[1] !== 'Day Off') {
          const sets = [cols[2], cols[3], cols[4], cols[5]]
            .filter(s => s && s.trim())
            .map(s => ({ reps: parseInt(s) || 0, weight: null }));
          
          currentWorkout.exercises.push({
            name: cols[1],
            sets: sets,
            notes: cols[7] || ''
          });
        }
        // Check if this is workout notes (has location info in col 2)
        else if (currentWorkout && cols[2] && (cols[2].includes('Garage') || cols[2].includes('BW') || cols[2].includes('Manual'))) {
          currentWorkout.location = cols[2];
          const noteParts = [cols[7], cols[8], cols[9], cols[10]].filter(n => n && n.trim());
          if (noteParts.length > 0) {
            currentWorkout.notes = noteParts.join(' ');
          }
        }
      }

      // Don't forget the last workout
      if (currentWorkout && currentWorkout.exercises.length > 0) {
        imp.push(currentWorkout);
      }

      // Merge with existing workouts and save
      const merged = [...imp, ...workouts];
      save(merged, 'workouts', setWorkouts);
      e.target.value = '';
    };
    reader.readAsText(file);
  };

  const addEx = () => setCurrent({
    ...current,
    exercises: [...current.exercises, {
      name: '',
      sets: [
        { reps: 0, weight: null },
        { reps: 0, weight: null },
        { reps: 0, weight: null },
        { reps: 0, weight: null }
      ],
      notes: ''
    }]
  });

  const updateEx = (i, f, v) => {
    const u = [...current.exercises];
    u[i][f] = v;
    setCurrent({ ...current, exercises: u });
  };

  const updateSet = (ei, si, f, v) => {
    const u = [...current.exercises];
    u[ei].sets[si][f] = f === 'weight' ? (v || null) : parseInt(v) || 0;
    setCurrent({ ...current, exercises: u });
  };

  const addSet = (i) => {
    const u = [...current.exercises];
    u[i].sets.push({ reps: 0, weight: null });
    setCurrent({ ...current, exercises: u });
  };

  const removeSet = (ei, si) => {
    const u = [...current.exercises];
    if (u[ei].sets.length > 1) u[ei].sets.splice(si, 1);
    setCurrent({ ...current, exercises: u });
  };

  const saveWorkout = () => {
    if (!current.exercises.length) return;
    let ws;
    if (editing !== null) {
      ws = [...workouts];
      ws[editing] = current;
      setEditing(null);
    } else {
      ws = [current, ...workouts];
    }
    save(ws, 'workouts', setWorkouts);
    setCurrent({
      date: getTodayDate(),
      exercises: [],
      notes: '',
      location: ''
    });
    setShowNew(false);
  };

  const editWorkout = (i) => {
    setCurrent(JSON.parse(JSON.stringify(workouts[i])));
    setEditing(i);
    setShowNew(true);
    setView('log');
  };

  const loadPreset = (p) => setCurrent({
    ...current,
    exercises: p.exercises.map(n => ({
      name: n,
      sets: [
        { reps: 0, weight: null },
        { reps: 0, weight: null },
        { reps: 0, weight: null },
        { reps: 0, weight: null }
      ],
      notes: ''
    })),
    location: p.name
  });

  const copyToSheets = (w) => {
    const d = new Date(w.date);
    const lines = [];
    w.exercises.forEach((ex, i) => {
      const s = ex.sets.slice(0, 4);
      const r = s.map(x => x.reps || '').concat(Array(4 - s.length).fill(''));
      const t = s.reduce((sum, x) => sum + (x.reps || 0), 0);
      let n = ex.notes || '';
      const wts = s.filter(x => x.weight).map(x => x.weight);
      if (wts.length) n = wts[0] + (n ? '. ' + n : '');
      const dateStr = `${d.getMonth() + 1}-${d.getDate()}-${d.toLocaleDateString('en-US', { weekday: 'short' })}`;
      lines.push(
        i === 0
          ? `${dateStr}\t${ex.name}\t${r[0]}\t${r[1]}\t${r[2]}\t${r[3]}\t${t}\t${n}`
          : `\t${ex.name}\t${r[0]}\t${r[1]}\t${r[2]}\t${r[3]}\t${t}\t${n}`
      );
    });
    lines.push(`\t${w.location || ''}\t\t\t\t\t\t${[w.location, w.notes].filter(x => x).join('. ')}`);
    navigator.clipboard.writeText(lines.join('\n'));
  };

  const clearAll = () => {
    save([], 'workouts', setWorkouts);
    setShowClear(false);
  };

  const exportCSV = () => {
    const rows = [];
    
    workouts.sort((a, b) => a.date.localeCompare(b.date)).forEach(w => {
      const d = new Date(w.date);
      const dateStr = `${d.getMonth() + 1}-${d.getDate()}-${d.getFullYear()}`;
      
      w.exercises.forEach((ex, i) => {
        const sets = ex.sets.slice(0, 4);
        const reps = sets.map(s => s.reps || '').concat(Array(4 - sets.length).fill(''));
        const total = sets.reduce((sum, s) => sum + (s.reps || 0), 0);
        let notes = ex.notes || '';
        const weights = sets.filter(s => s.weight).map(s => s.weight);
        if (weights.length) notes = weights[0] + (notes ? '. ' + notes : '');
        
        if (i === 0) {
          rows.push(`${dateStr},${ex.name},${reps[0]},${reps[1]},${reps[2]},${reps[3]},${total},${notes}`);
        } else {
          rows.push(`,${ex.name},${reps[0]},${reps[1]},${reps[2]},${reps[3]},${total},${notes}`);
        }
      });
      
      const workoutNotes = [w.location, w.notes].filter(x => x).join('. ');
      rows.push(`,${w.location || ''},,,,,,${workoutNotes}`);
    });
    
    const csv = `Date,Exercise,1,2,3,4,Tot,Notes\n${rows.join('\n')}`;
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `workouts-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filtered = () => {
    let f = workouts;
    
    // Apply date range filter
    if (historyFilter !== 'all') {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      f = f.filter(w => {
        const [year, month, day] = w.date.split('-');
        const workoutDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        
        if (historyFilter === 'day') {
          return workoutDate.getTime() === today.getTime();
        } else if (historyFilter === 'week') {
          const weekAgo = new Date(today);
          weekAgo.setDate(weekAgo.getDate() - 7);
          return workoutDate >= weekAgo;
        } else if (historyFilter === 'month') {
          const monthAgo = new Date(today);
          monthAgo.setMonth(monthAgo.getMonth() - 1);
          return workoutDate >= monthAgo;
        }
        return true;
      });
    }
    
    // Apply search filter
    if (search.trim()) {
      const q = search.toLowerCase();
      f = f.filter(w =>
        w.date.includes(q) ||
        (w.location && w.location.toLowerCase().includes(q)) ||
        w.exercises.some(e => e.name.toLowerCase().includes(q)) ||
        (w.notes && w.notes.toLowerCase().includes(q)) ||
        w.exercises.some(e => e.notes && e.notes.toLowerCase().includes(q))
      );
    }
    
    return [...f].sort((a, b) =>
      sortOrder === 'desc' ? b.date.localeCompare(a.date) : a.date.localeCompare(b.date)
    );
  };

  const trends = () => {
    const t = {};
    workouts.forEach(w => {
      const d = new Date(w.date);
      const day = d.getDay();
      const diff = d.getDate() - day;
      const start = new Date(d.setDate(diff));
      const ws = start.toISOString().split('T')[0];
      const m = w.date.substring(0, 7);
      
      w.exercises.forEach(e => {
        if (!t[e.name]) t[e.name] = { weekly: {}, monthly: {} };
        const reps = e.sets.reduce((s, set) => s + set.reps, 0);
        t[e.name].weekly[ws] = (t[e.name].weekly[ws] || 0) + reps;
        t[e.name].monthly[m] = (t[e.name].monthly[m] || 0) + reps;
      });
    });
    return t;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Gors Log</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <meta name="theme-color" content="#111827" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
      </Head>
      
      <div className="min-h-screen bg-gray-900 text-white">
        {showClear && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-lg p-6 max-w-md">
              <h3 className="text-xl font-bold mb-4 text-red-400">Delete All?</h3>
              <p className="mb-6">Delete all workouts?</p>
              <div className="flex gap-3">
                <button onClick={clearAll} className="flex-1 bg-red-600 hover:bg-red-700 py-3 rounded-lg font-semibold">
                  Delete
                </button>
                <button onClick={() => setShowClear(false)} className="flex-1 bg-gray-700 py-3 rounded-lg font-semibold">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Workout Confirmation */}
        {deleteWorkout !== null && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-lg p-6 max-w-md">
              <h3 className="text-xl font-bold mb-4 text-red-400">Delete Workout?</h3>
              <p className="mb-6">Are you sure you want to delete this workout? This cannot be undone.</p>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    save(workouts.filter((_, idx) => idx !== deleteWorkout), 'workouts', setWorkouts);
                    setDeleteWorkout(null);
                  }}
                  className="flex-1 bg-red-600 hover:bg-red-700 py-3 rounded-lg font-semibold"
                >
                  Delete
                </button>
                <button
                  onClick={() => setDeleteWorkout(null)}
                  className="flex-1 bg-gray-700 py-3 rounded-lg font-semibold"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Preset Confirmation */}
        {deletePreset !== null && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-lg p-6 max-w-md">
              <h3 className="text-xl font-bold mb-4 text-red-400">Delete Preset?</h3>
              <p className="mb-6">Are you sure you want to delete this preset? This cannot be undone.</p>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    save(presets.filter((_, idx) => idx !== deletePreset), 'presets', setPresets);
                    setDeletePreset(null);
                  }}
                  className="flex-1 bg-red-600 hover:bg-red-700 py-3 rounded-lg font-semibold"
                >
                  Delete
                </button>
                <button
                  onClick={() => setDeletePreset(null)}
                  className="flex-1 bg-gray-700 py-3 rounded-lg font-semibold"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Close Workout Confirmation */}
        {showCloseConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[60] p-4">
            <div className="bg-gray-800 rounded-lg p-6 max-w-md">
              <h3 className="text-xl font-bold mb-4 text-yellow-400">Discard Workout?</h3>
              <p className="mb-6">You have unsaved changes. Are you sure you want to close?</p>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowNew(false);
                    setShowWorkoutModal(false);
                    setEditing(null);
                    setCurrent({
                      date: getTodayDate(),
                      exercises: [],
                      notes: '',
                      location: ''
                    });
                    setShowCloseConfirm(false);
                  }}
                  className="flex-1 bg-red-600 hover:bg-red-700 py-3 rounded-lg font-semibold"
                >
                  Discard
                </button>
                <button
                  onClick={() => setShowCloseConfirm(false)}
                  className="flex-1 bg-gray-700 py-3 rounded-lg font-semibold"
                >
                  Keep Editing
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Exercise Confirmation */}
        {deleteExercise !== null && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-lg p-6 max-w-md">
              <h3 className="text-xl font-bold mb-4 text-red-400">Delete Exercise?</h3>
              <p className="mb-6">Remove this exercise from your workout?</p>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    const u = [...current.exercises];
                    u.splice(deleteExercise, 1);
                    setCurrent({ ...current, exercises: u });
                    setDeleteExercise(null);
                  }}
                  className="flex-1 bg-red-600 hover:bg-red-700 py-3 rounded-lg font-semibold"
                >
                  Delete
                </button>
                <button
                  onClick={() => setDeleteExercise(null)}
                  className="flex-1 bg-gray-700 py-3 rounded-lg font-semibold"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="bg-gray-800 border-b border-gray-700 p-4">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <h1 className="text-2xl font-bold">Gors Log</h1>
            <button onClick={() => setShowSettings(!showSettings)} className="bg-gray-700 px-3 py-2 rounded-lg text-sm">
              Settings
            </button>
          </div>
        </div>

        {showSettings && (
          <div className="bg-gray-800 border-b p-4">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-base font-semibold">Settings</h2>
                <div className="flex gap-2">
                  <button onClick={exportCSV} className="bg-blue-600 px-2 py-1 rounded text-xs flex items-center gap-1">
                    <Icons.Download />
                    Export
                  </button>
                  <button onClick={() => setShowClear(true)} className="bg-red-600 px-2 py-1 rounded text-xs">
                    Clear All
                  </button>
                </div>
              </div>
              <div className="flex gap-2 mb-3">
                <label className="cursor-pointer bg-blue-600 px-3 py-1.5 rounded text-xs flex items-center gap-1.5">
                  <Icons.Upload />
                  Presets
                  <input type="file" accept=".csv" onChange={importPresets} className="hidden" />
                </label>
                <label className="cursor-pointer bg-green-600 px-3 py-1.5 rounded text-xs flex items-center gap-1.5">
                  <Icons.Upload />
                  Workouts
                  <input type="file" accept=".csv" onChange={importWorkouts} className="hidden" />
                </label>
              </div>
              <div className="space-y-2">
                {presets.map((p, i) => (
                  <div key={i} className="bg-gray-700 p-3 rounded flex items-center justify-between">
                    <div>
                      <div className="font-medium">{p.name}</div>
                      <div className="text-xs text-gray-400">{p.exercises.join(', ')}</div>
                    </div>
                    <button
                      onClick={() => setDeletePreset(i)}
                      className="text-red-400"
                    >
                      <Icons.Trash />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="max-w-4xl mx-auto p-3 pb-24">
          {view === 'log' && !showNew && (
            <div className="space-y-1.5">
              <h2 className="text-base font-semibold mb-2">Select Workout</h2>
              {presets.map((p, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setShowNew(true);
                    p.name === 'Manual' ? setCurrent({ ...current, location: p.name }) : loadPreset(p);
                  }}
                  className="w-full bg-gray-800 hover:bg-gray-700 p-3 rounded-lg text-left"
                >
                  <div className="font-medium text-sm">{p.name}</div>
                  {p.exercises.length > 0 && (
                    <div className="text-xs text-gray-400">{p.exercises.length} exercises</div>
                  )}
                </button>
              ))}
            </div>
          )}

          {view === 'log' && showNew && (
            <div className="space-y-3">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-semibold">{editing !== null ? 'Edit' : 'New'}</h2>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowHistoryModal(true)}
                    className="text-blue-400 hover:text-blue-300"
                  >
                    <Icons.Calendar />
                  </button>
                  <button
                    onClick={() => {
                      if (current.exercises.length > 0) {
                        setShowCloseConfirm(true);
                      } else {
                        setShowNew(false);
                        setEditing(null);
                        setCurrent({
                          date: getTodayDate(),
                          exercises: [],
                          notes: '',
                          location: ''
                        });
                      }
                    }}
                  >
                    <Icons.X />
                  </button>
                </div>
              </div>
              
              {/* View mode toggle */}
              <div className="flex gap-1 mb-2">
                <button
                  onClick={() => setWorkoutViewMode('table')}
                  className={`flex-1 px-3 py-1.5 rounded text-xs font-medium ${
                    workoutViewMode === 'table' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400'
                  }`}
                >
                  Table View
                </button>
                <button
                  onClick={() => setWorkoutViewMode('cards')}
                  className={`flex-1 px-3 py-1.5 rounded text-xs font-medium ${
                    workoutViewMode === 'cards' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400'
                  }`}
                >
                  Card View
                </button>
              </div>
              
              <div className="space-y-2">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Date</label>
                  <input
                    type="text"
                    value={current.date}
                    onChange={(e) => setCurrent({ ...current, date: e.target.value })}
                    placeholder="YYYY-MM-DD"
                    className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1.5 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Workout</label>
                  <select
                    value={current.location}
                    onChange={(e) => setCurrent({ ...current, location: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1.5 text-sm"
                  >
                    <option value="">Select</option>
                    {presets.map((p, i) => (
                      <option key={i} value={p.name}>{p.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              
              {workoutViewMode === 'table' ? (
                // Table View
                <div className="overflow-x-auto -mx-3 px-3">
                  {current.exercises.map((ex, ei) => {
                    const total = ex.sets.reduce((sum, s) => sum + (s.reps || 0), 0);
                    const maxSets = Math.max(4, ex.sets.length);
                    
                    return (
                      <div key={ei} className="flex gap-0.5 mb-1 overflow-x-auto pb-1">
                        {/* Frozen exercise name */}
                        <div className="sticky left-0 bg-gray-900 z-10 pr-0.5">
                          <select
                            value={ex.name}
                            onChange={(e) => updateEx(ei, 'name', e.target.value)}
                            className="w-[100px] bg-gray-800 border border-gray-700 rounded px-1 py-1 text-[11px]"
                          >
                            <option value="">Select</option>
                            {exercises.map((e, i) => (
                              <option key={i} value={e}>{e}</option>
                            ))}
                          </select>
                        </div>
                        
                        {/* Sets */}
                        {Array.from({ length: maxSets }, (_, si) => (
                          <div key={si} className="relative">
                            <input
                              type="number"
                              inputMode="numeric"
                              value={ex.sets[si]?.reps || ''}
                              onChange={(e) => {
                                const u = [...current.exercises];
                                if (!u[ei].sets[si]) u[ei].sets[si] = { reps: 0, weight: null };
                                u[ei].sets[si].reps = parseInt(e.target.value) || 0;
                                setCurrent({ ...current, exercises: u });
                              }}
                              onFocus={(e) => {
                                e.target.nextElementSibling?.classList.remove('hidden');
                              }}
                              onBlur={(e) => {
                                setTimeout(() => {
                                  e.target.nextElementSibling?.classList.add('hidden');
                                }, 200);
                              }}
                              placeholder="0"
                              className="w-[40px] bg-gray-800 border border-gray-700 rounded px-1 py-1 text-[11px] text-center flex-shrink-0"
                            />
                            {ex.sets[si] && (
                              <button
                                onClick={() => {
                                  const u = [...current.exercises];
                                  u[ei].sets.splice(si, 1);
                                  setCurrent({ ...current, exercises: u });
                                }}
                                className="hidden absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs z-10"
                              >
                                ×
                              </button>
                            )}
                          </div>
                        ))}
                        
                        {/* Total */}
                        <div className="w-[35px] bg-gray-900 border border-gray-700 rounded px-1 py-1 text-[11px] text-center font-bold flex-shrink-0">
                          {total}
                        </div>
                        
                        {/* Notes */}
                        <input
                          type="text"
                          value={ex.notes}
                          onChange={(e) => updateEx(ei, 'notes', e.target.value)}
                          placeholder="..."
                          className="w-[80px] bg-gray-800 border border-gray-700 rounded px-1 py-1 text-[11px] flex-shrink-0"
                        />
                        
                        {/* Delete */}
                        <button
                          onClick={() => setDeleteExercise(ei)}
                          className="w-[24px] text-red-400 hover:text-red-300 text-lg flex-shrink-0"
                        >
                          ×
                        </button>
                        
                        {/* Add Set */}
                        <button
                          onClick={() => {
                            const u = [...current.exercises];
                            u[ei].sets.push({ reps: 0, weight: null });
                            setCurrent({ ...current, exercises: u });
                          }}
                          className="w-[36px] text-blue-400 hover:text-blue-300 text-xs bg-gray-700 rounded flex-shrink-0"
                        >
                          +
                        </button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                // Card View
                <div className="space-y-2">
                {current.exercises.map((ex, ei) => {
                  const total = ex.sets.reduce((sum, s) => sum + (s.reps || 0), 0);
                  return (
                    <div key={ei} className="bg-gray-800 rounded-lg p-2">
                      {/* Exercise name */}
                      <select
                        value={ex.name}
                        onChange={(e) => updateEx(ei, 'name', e.target.value)}
                        className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-xs font-medium mb-2"
                      >
                        <option value="">Select Exercise</option>
                        {exercises.map((e, i) => (
                          <option key={i} value={e}>{e}</option>
                        ))}
                      </select>
                      
                      {/* Sets row */}
                      <div className="flex items-center gap-1 mb-2 overflow-x-auto">
                        {ex.sets.map((s, si) => (
                          <div key={si} className="flex flex-col items-center">
                            <div className="text-[10px] text-gray-400 mb-0.5">S{si + 1}</div>
                            <input
                              type="number"
                              inputMode="numeric"
                              value={s.reps || ''}
                              onChange={(e) => {
                                const u = [...current.exercises];
                                u[ei].sets[si].reps = parseInt(e.target.value) || 0;
                                setCurrent({ ...current, exercises: u });
                              }}
                              placeholder="0"
                              className="w-12 bg-gray-700 border border-gray-600 rounded px-1 py-1 text-[11px] text-center"
                            />
                          </div>
                        ))}
                        
                        {/* Total */}
                        <div className="flex flex-col items-center">
                          <div className="text-[10px] text-gray-400 mb-0.5">Tot</div>
                          <div className="w-12 bg-gray-900 border border-gray-700 rounded px-1 py-1 text-[11px] text-center font-bold">
                            {total}
                          </div>
                        </div>
                        
                        {/* Add Set button */}
                        <button
                          onClick={() => {
                            const u = [...current.exercises];
                            u[ei].sets.push({ reps: 0, weight: null });
                            setCurrent({ ...current, exercises: u });
                          }}
                          className="text-blue-400 hover:text-blue-300 text-xs px-2 py-1 bg-gray-700 rounded"
                        >
                          +
                        </button>
                      </div>
                      
                      {/* Notes and delete */}
                      <div className="flex items-center gap-1">
                        <input
                          type="text"
                          value={ex.notes}
                          onChange={(e) => updateEx(ei, 'notes', e.target.value)}
                          placeholder="Notes..."
                          className="flex-1 bg-gray-700 border border-gray-600 rounded px-2 py-1 text-[11px]"
                        />
                        <button
                          onClick={() => setDeleteExercise(ei)}
                          className="text-red-400 hover:text-red-300 px-2 py-1"
                        >
                          <Icons.Trash />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
              )}

              <button
                onClick={addEx}
                className="w-full bg-gray-800 hover:bg-gray-700 py-2 rounded-lg border-2 border-dashed border-gray-600 text-sm"
              >
                + Add Exercise
              </button>

              <div>
                <label className="block text-xs text-gray-400 mb-1">Workout Notes</label>
                <textarea
                  value={current.notes}
                  onChange={(e) => setCurrent({ ...current, notes: e.target.value })}
                  placeholder="How did it go?"
                  className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1.5 h-20 text-sm"
                />
              </div>

              <button
                onClick={saveWorkout}
                className="w-full bg-blue-600 hover:bg-blue-700 py-2.5 rounded-lg font-semibold text-sm"
              >
                {editing !== null ? 'Update' : 'Save'}
              </button>
            </div>
          )}

          {view === 'calendar' && (
            <div className="space-y-3">
              {/* Start Workout Button */}
              <button
                onClick={() => setShowPresetSelector(true)}
                className="w-full bg-blue-600 hover:bg-blue-700 rounded-lg p-4 mb-3 flex items-center justify-center gap-2 text-lg font-semibold"
              >
                <Icons.Plus />
                Start Workout
              </button>
              
              {/* Recent Workouts */}
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-gray-400">Recent Workouts</h3>
                {[...workouts].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 3).map((w, i) => {
                  const [year, month, day] = w.date.split('-');
                  const dateObj = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
                  const dayOfWeek = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
                  const isExpanded = expandedRecent === i;
                  
                  const locationColors = {
                    'Garage BW': 'border-blue-500',
                    'Manual': 'border-green-500',
                    'Garage 10': 'border-purple-500',
                    'BW-only': 'border-yellow-500',
                  };
                  const bgColors = {
                    'Garage BW': 'bg-blue-900/20',
                    'Manual': 'bg-green-900/20',
                    'Garage 10': 'bg-purple-900/30',
                    'BW-only': 'bg-yellow-900/20',
                  };
                  const borderColor = locationColors[w.location] || 'border-gray-600';
                  const bgColor = bgColors[w.location] || 'bg-gray-800';
                  
                  return (
                    <div key={i} className={`${bgColor} rounded-lg border-l-4 ${borderColor} overflow-hidden`}>
                      <button
                        onClick={() => setExpandedRecent(isExpanded ? null : i)}
                        className="w-full p-3 text-left"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-sm">
                              {dayOfWeek} {month}/{day}
                              {w.location && <span className="ml-2 text-xs text-gray-400">· {w.location}</span>}
                            </div>
                            <div className="text-xs text-gray-400 mt-0.5">
                              {w.exercises.length} exercises
                            </div>
                          </div>
                          <div className={`transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                            <Icons.ChevronDown />
                          </div>
                        </div>
                      </button>
                      
                      {isExpanded && (
                        <div 
                          className="px-3 pb-3 space-y-2 border-t border-gray-700 pt-2"
                          onTouchStart={(e) => {
                            e.currentTarget.dataset.startY = e.touches[0].clientY;
                            e.currentTarget.dataset.startScrollTop = e.currentTarget.scrollTop || 0;
                          }}
                          onTouchMove={(e) => {
                            const startY = parseFloat(e.currentTarget.dataset.startY);
                            const scrollTop = parseFloat(e.currentTarget.dataset.startScrollTop);
                            const currentY = e.touches[0].clientY;
                            const diff = currentY - startY;
                            
                            // Only trigger swipe if we're at the top and swiping down
                            if (scrollTop === 0 && diff > 0) {
                              e.preventDefault();
                            }
                          }}
                          onTouchEnd={(e) => {
                            const startY = parseFloat(e.currentTarget.dataset.startY);
                            const scrollTop = parseFloat(e.currentTarget.dataset.startScrollTop);
                            const currentY = e.changedTouches[0].clientY;
                            const diff = currentY - startY;
                            
                            // Swipe down to collapse
                            if (scrollTop === 0 && diff > 50) {
                              setExpandedRecent(null);
                            }
                          }}
                        >
                          {w.exercises.map((ex, ei) => {
                            const totalReps = ex.sets.reduce((sum, s) => sum + (s.reps || 0), 0);
                            return (
                              <div key={ei}>
                                <div className="flex items-start text-xs">
                                  <div className="w-28 font-medium">{ex.name}</div>
                                  <div className="flex-1 flex items-center gap-1">
                                    {ex.sets.map((s, si) => (
                                      <span key={si} className="text-gray-400">
                                        {s.reps}
                                        {si < ex.sets.length - 1 && <span className="text-gray-600 mx-0.5">·</span>}
                                      </span>
                                    ))}
                                    <span className="ml-1 font-bold text-white">({totalReps})</span>
                                  </div>
                                </div>
                                {ex.notes && (
                                  <div className="text-[10px] text-gray-500 ml-28 -mt-0.5">{ex.notes}</div>
                                )}
                              </div>
                            );
                          })}
                          {w.notes && (
                            <div className="text-xs text-gray-400 italic mt-2 pt-2 border-t border-gray-700">
                              {w.notes}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              
              {/* Month navigation */}
              <div className="flex items-center justify-between mb-3">
                <button
                  onClick={() => {
                    const newDate = new Date(calendarDate);
                    newDate.setMonth(newDate.getMonth() - 1);
                    setCalendarDate(newDate);
                  }}
                  className="bg-gray-800 px-3 py-2 rounded text-sm"
                >
                  ← Prev
                </button>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-semibold">
                    {calendarDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </h2>
                  {(() => {
                    const now = new Date();
                    const isCurrentMonth = calendarDate.getMonth() === now.getMonth() && 
                                          calendarDate.getFullYear() === now.getFullYear();
                    if (!isCurrentMonth) {
                      return (
                        <button
                          onClick={() => setCalendarDate(new Date())}
                          className="bg-blue-600 hover:bg-blue-700 px-2 py-1 rounded text-xs"
                        >
                          Today
                        </button>
                      );
                    }
                  })()}
                </div>
                <button
                  onClick={() => {
                    const newDate = new Date(calendarDate);
                    newDate.setMonth(newDate.getMonth() + 1);
                    setCalendarDate(newDate);
                  }}
                  className="bg-gray-800 px-3 py-2 rounded text-sm"
                >
                  Next →
                </button>
              </div>

              {/* Calendar grid */}
              <div 
                className="bg-gray-800 rounded-lg p-3"
                onTouchStart={(e) => {
                  e.currentTarget.dataset.startX = e.touches[0].clientX;
                }}
                onTouchEnd={(e) => {
                  const startX = parseFloat(e.currentTarget.dataset.startX);
                  const endX = e.changedTouches[0].clientX;
                  const diff = endX - startX;
                  
                  if (Math.abs(diff) > 50) {
                    if (diff > 0) {
                      // Swiped right - go to previous month
                      const newDate = new Date(calendarDate);
                      newDate.setMonth(newDate.getMonth() - 1);
                      setCalendarDate(newDate);
                    } else {
                      // Swiped left - go to next month
                      const newDate = new Date(calendarDate);
                      newDate.setMonth(newDate.getMonth() + 1);
                      setCalendarDate(newDate);
                    }
                  }
                }}
              >
                {/* Day headers */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                    <div key={day} className="text-center text-xs text-gray-400 font-medium">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar days */}
                <div className="grid grid-cols-7 gap-1">
                  {(() => {
                    const year = calendarDate.getFullYear();
                    const month = calendarDate.getMonth();
                    let firstDay = new Date(year, month, 1).getDay();
                    // Convert Sunday (0) to 7, then subtract 1 to make Monday = 0
                    firstDay = firstDay === 0 ? 6 : firstDay - 1;
                    const daysInMonth = new Date(year, month + 1, 0).getDate();
                    const days = [];

                    // Empty cells for days before month starts
                    for (let i = 0; i < firstDay; i++) {
                      days.push(<div key={`empty-${i}`} className="aspect-square" />);
                    }

                    // Days of the month
                    for (let day = 1; day <= daysInMonth; day++) {
                      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                      const dayWorkouts = workouts.filter(w => w.date === dateStr);
                      const hasWorkout = dayWorkouts.length > 0;
                      const isToday = dateStr === getTodayDate();
                      
                      // Get workout type color
                      let borderColor = 'border-gray-700';
                      if (hasWorkout && dayWorkouts[0].location) {
                        const locationColors = {
                          'Garage BW': 'border-blue-500',
                          'Manual': 'border-green-500',
                          'Garage 10': 'border-purple-500',
                          'BW-only': 'border-yellow-500',
                        };
                        borderColor = locationColors[dayWorkouts[0].location] || 'border-gray-600';
                      }

                      days.push(
                        <button
                          key={day}
                          onClick={() => {
                            if (hasWorkout) {
                              setSelectedDay(dateStr);
                              setShowDayModal(true);
                            }
                          }}
                          className={`aspect-square rounded border-2 flex items-center justify-center text-sm
                            ${hasWorkout ? `${borderColor} bg-gray-700 font-bold` : 'border-gray-700 bg-gray-800'}
                            ${isToday ? 'ring-2 ring-blue-400' : ''}
                            ${selectedDay === dateStr ? 'ring-2 ring-white' : ''}
                          `}
                        >
                          {day}
                        </button>
                      );
                    }

                    return days;
                  })()}
                </div>
              </div>

              {/* Legend */}
              <div className="bg-gray-800 rounded-lg p-3">
                <div className="text-xs text-gray-400 mb-2">Workout Types:</div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded border-2 border-blue-500"></div>
                    <span className="text-xs">Garage BW</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded border-2 border-green-500"></div>
                    <span className="text-xs">Manual</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded border-2 border-purple-500"></div>
                    <span className="text-xs">Garage 10</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded border-2 border-yellow-500"></div>
                    <span className="text-xs">BW-only</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {view === 'history' && (
            <div className="space-y-2.5">
              <div className="flex items-center gap-2 mb-3">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search workouts..."
                    className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1.5 pl-8 text-sm"
                  />
                  <div className="absolute left-2 top-2 text-gray-400">
                    <Icons.Search />
                  </div>
                </div>
                <button
                  onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
                  className="bg-gray-800 px-2 py-1.5 rounded-lg border border-gray-700"
                >
                  <Icons.ArrowUpDown />
                </button>
              </div>

              {filtered().map((w, i) => {
                // Parse date without timezone issues
                const [year, month, day] = w.date.split('-');
                const dateObj = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
                const dayOfWeek = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
                
                // Color-code by workout location
                const locationColors = {
                  'Garage BW': 'border-blue-500',
                  'Manual': 'border-green-500',
                  'Garage 10': 'border-purple-500',
                  'BW-only': 'border-yellow-500',
                };
                const borderColor = locationColors[w.location] || 'border-gray-600';
                
                return (
                  <div key={i} className={`bg-gray-800 rounded-lg p-3 border-l-4 ${borderColor}`}>
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="font-bold text-base">
                          {dayOfWeek} {month}/{day}
                          {w.location && <span className="ml-2 text-sm font-medium">· {w.location}</span>}
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <button
                          onClick={() => copyToSheets(w)}
                          className="text-blue-400 hover:text-blue-300 p-1"
                          title="Copy to clipboard"
                        >
                          <Icons.Copy />
                        </button>
                        <button
                          onClick={() => editWorkout(i)}
                          className="text-green-400 hover:text-green-300 p-1"
                        >
                          <Icons.Edit />
                        </button>
                        <button
                          onClick={() => setDeleteWorkout(i)}
                          className="text-red-400 hover:text-red-300 p-1"
                        >
                          <Icons.Trash />
                        </button>
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      {w.exercises.map((ex, ei) => {
                        const totalReps = ex.sets.reduce((sum, s) => sum + (s.reps || 0), 0);
                        return (
                          <div key={ei}>
                            <div className="flex items-start text-xs">
                              <div className="w-32 font-medium truncate">{ex.name}</div>
                              <div className="flex-1 flex items-center gap-1">
                                {ex.sets.map((s, si) => (
                                  <span key={si} className="text-gray-400">
                                    {s.reps}
                                    {si < ex.sets.length - 1 && <span className="text-gray-600 mx-0.5">·</span>}
                                  </span>
                                ))}
                                <span className="ml-1 font-bold text-white">({totalReps})</span>
                              </div>
                            </div>
                            {ex.notes && (
                              <div className="text-xs text-gray-500 ml-32 -mt-0.5">{ex.notes}</div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    
                    {w.notes && (
                      <div className="mt-2 text-xs text-gray-400 italic border-t border-gray-700 pt-1.5">{w.notes}</div>
                    )}
                  </div>
                );
              })}

              {filtered().length === 0 && (
                <div className="text-center text-gray-500 py-8">
                  {search ? 'No workouts found' : 'No workouts yet'}
                </div>
              )}
            </div>
          )}

          {view === 'stats' && (
            <div className="space-y-3">
              <h2 className="text-base font-semibold mb-2">Your Stats</h2>
              {Object.keys(trends()).length === 0 ? (
                <div className="text-center text-gray-500 py-8 text-sm">
                  No data yet. Start logging workouts!
                </div>
              ) : (
                <div className="space-y-3">
                  {Object.entries(trends()).map(([exercise, data]) => {
                    const isExpanded = expandedTrends[exercise];
                    return (
                      <div key={exercise} className="bg-gray-800 rounded-lg">
                        <button
                          onClick={() => setExpandedTrends({
                            ...expandedTrends,
                            [exercise]: !isExpanded
                          })}
                          className="w-full p-3 flex items-center justify-between text-left"
                        >
                          <h3 className="font-medium text-sm">{exercise}</h3>
                          <div className={`transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                            <Icons.ChevronDown />
                          </div>
                        </button>
                        
                        {isExpanded && (
                          <div className="px-3 pb-3">
                            <div className="mb-3">
                              <div className="text-xs text-gray-400 mb-1.5">Weekly Volume</div>
                              <div className="space-y-1">
                                {Object.entries(data.weekly)
                                  .sort(([a], [b]) => b.localeCompare(a))
                                  .map(([week, reps]) => (
                                    <button
                                      key={week}
                                      onClick={() => {
                                        const weekDate = new Date(week);
                                        setCalendarDate(weekDate);
                                        setView('calendar');
                                      }}
                                      className="flex items-center gap-1.5 w-full hover:bg-gray-700 rounded px-1 -mx-1"
                                    >
                                      <span className="text-xs text-gray-500 w-20 text-right">
                                        {new Date(week).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' })}
                                      </span>
                                      <div className="flex-1 bg-gray-700 rounded-full h-5 relative overflow-hidden">
                                        <div
                                          className="bg-blue-500 h-full rounded-full"
                                          style={{
                                            width: `${(reps / Math.max(...Object.values(data.weekly))) * 100}%`
                                          }}
                                        />
                                        <span className="absolute inset-0 flex items-center justify-center text-xs font-medium">
                                          {reps}
                                        </span>
                                      </div>
                                    </button>
                                  ))}
                        </div>
                      </div>

                      <div>
                        <div className="text-xs text-gray-400 mb-1.5">Monthly Volume</div>
                        <div className="space-y-1">
                          {Object.entries(data.monthly)
                            .sort(([a], [b]) => b.localeCompare(a))
                            .map(([month, reps]) => (
                              <div key={month} className="flex items-center gap-1.5">
                                <span className="text-xs text-gray-500 w-20 text-right">{month}</span>
                                <div className="flex-1 bg-gray-700 rounded-full h-5 relative overflow-hidden">
                                  <div
                                    className="bg-green-500 h-full rounded-full"
                                    style={{
                                      width: `${(reps / Math.max(...Object.values(data.monthly))) * 100}%`
                                    }}
                                  />
                                  <span className="absolute inset-0 flex items-center justify-center text-xs font-medium">
                                    {reps}
                                  </span>
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>
                    </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
          
          {view === 'list' && (
            <div className="space-y-2.5">
              <div className="flex items-center gap-2 mb-3">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search workouts..."
                    className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1.5 pl-8 text-sm"
                  />
                  <div className="absolute left-2 top-2 text-gray-400">
                    <Icons.Search />
                  </div>
                </div>
                <button
                  onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
                  className="bg-gray-800 px-2 py-1.5 rounded text-xs"
                >
                  {sortOrder === 'desc' ? '↓' : '↑'}
                </button>
              </div>

              {filtered().map((w, i) => {
                // Parse date without timezone issues
                const [year, month, day] = w.date.split('-');
                const dateObj = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
                const dayOfWeek = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
                
                // Color-code by workout location
                const locationColors = {
                  'Garage BW': 'border-blue-500',
                  'Manual': 'border-green-500',
                  'Garage 10': 'border-purple-500',
                  'BW-only': 'border-yellow-500',
                };
                const borderColor = locationColors[w.location] || 'border-gray-600';
                
                return (
                  <div key={i} className={`bg-gray-800 rounded-lg p-3 border-l-4 ${borderColor}`}>
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="font-bold text-base">
                          {dayOfWeek} {month}/{day}
                          {w.location && <span className="ml-2 text-sm font-medium">· {w.location}</span>}
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <button
                          onClick={() => copyToSheets(w)}
                          className="text-blue-400 hover:text-blue-300 p-1"
                          title="Copy to clipboard"
                        >
                          <Icons.Copy />
                        </button>
                        <button
                          onClick={() => editWorkout(i)}
                          className="text-green-400 hover:text-green-300 p-1"
                        >
                          <Icons.Edit />
                        </button>
                        <button
                          onClick={() => setDeleteWorkout(i)}
                          className="text-red-400 hover:text-red-300 p-1"
                        >
                          <Icons.Trash />
                        </button>
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      {w.exercises.map((ex, ei) => {
                        const totalReps = ex.sets.reduce((sum, s) => sum + (s.reps || 0), 0);
                        return (
                          <div key={ei}>
                            <div className="flex items-start text-xs">
                              <div className="w-32 font-medium truncate">{ex.name}</div>
                              <div className="flex-1 flex items-center gap-1">
                                {ex.sets.map((s, si) => (
                                  <span key={si} className="text-gray-400">
                                    {s.reps}
                                    {si < ex.sets.length - 1 && <span className="text-gray-600 mx-0.5">·</span>}
                                  </span>
                                ))}
                                <span className="ml-1 font-bold text-white">({totalReps})</span>
                              </div>
                            </div>
                            {ex.notes && (
                              <div className="text-xs text-gray-500 ml-32 -mt-0.5">{ex.notes}</div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    
                    {w.notes && (
                      <div className="mt-2 text-xs text-gray-400 italic border-t border-gray-700 pt-1.5">{w.notes}</div>
                    )}
                  </div>
                );
              })}

              {filtered().length === 0 && (
                <div className="text-center text-gray-500 py-8">
                  {search ? 'No workouts found' : 'No workouts yet'}
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Day Details Modal */}
        {showDayModal && selectedDay && (() => {
          const workout = workouts.find(w => w.date === selectedDay);
          if (!workout) return null;

          const [year, month, day] = selectedDay.split('-');
          const dateObj = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
          const dayOfWeek = dateObj.toLocaleDateString('en-US', { weekday: 'long' });
          
          let startY = 0;
          let currentY = 0;
          let scrollTop = 0;
          
          const handleTouchStart = (e) => {
            startY = e.touches[0].clientY;
            scrollTop = e.currentTarget.scrollTop;
          };
          
          const handleTouchMove = (e) => {
            currentY = e.touches[0].clientY;
            const diff = currentY - startY;
            
            // Only allow swipe down if at top of scroll
            if (scrollTop === 0 && diff > 0) {
              e.preventDefault();
              e.currentTarget.style.transform = `translateY(${diff}px)`;
              e.currentTarget.style.transition = 'none';
            }
          };
          
          const handleTouchEnd = (e) => {
            const diff = currentY - startY;
            e.currentTarget.style.transition = 'transform 0.2s ease-out';
            
            if (scrollTop === 0 && diff > 100) {
              e.currentTarget.style.transform = 'translateY(100%)';
              setTimeout(() => setShowDayModal(false), 200);
            } else {
              e.currentTarget.style.transform = '';
            }
          };

          return (
            <div 
              className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end" 
              onClick={() => setShowDayModal(false)}
              style={{ touchAction: 'none' }}
            >
              <div 
                className="bg-gray-800 rounded-t-2xl w-full max-h-[80vh] overflow-y-auto pb-8" 
                onClick={(e) => e.stopPropagation()}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                {/* Drag handle */}
                <div className="flex justify-center pt-3 pb-2">
                  <div className="w-10 h-1 bg-gray-600 rounded-full"></div>
                </div>
                
                <div className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-bold text-lg">
                        {dayOfWeek}, {month}/{day}/{year}
                      </h3>
                      {workout.location && <div className="text-sm text-gray-400">{workout.location}</div>}
                    </div>
                    <button
                      onClick={() => setShowDayModal(false)}
                      className="text-gray-400 hover:text-white"
                    >
                      <Icons.X />
                    </button>
                  </div>

                  <div className="space-y-3">
                    {workout.exercises.map((ex, ei) => {
                      const totalReps = ex.sets.reduce((sum, s) => sum + (s.reps || 0), 0);
                      return (
                        <div key={ei}>
                          <div className="flex items-start text-sm">
                            <div className="w-32 font-medium">{ex.name}</div>
                            <div className="flex-1 flex items-center gap-1">
                              {ex.sets.map((s, si) => (
                                <span key={si} className="text-gray-400">
                                  {s.reps}
                                  {si < ex.sets.length - 1 && <span className="text-gray-600 mx-0.5">·</span>}
                                </span>
                              ))}
                              <span className="ml-1 font-bold text-white">({totalReps})</span>
                            </div>
                          </div>
                          {ex.notes && (
                            <div className="text-xs text-gray-500 ml-32 -mt-0.5">{ex.notes}</div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {workout.notes && (
                    <div className="mt-4 text-sm text-gray-400 italic border-t border-gray-700 pt-3">
                      {workout.notes}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })()}
        
        {/* Preset Selector Modal */}
        {showPresetSelector && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end" onClick={() => setShowPresetSelector(false)}>
            <div 
              className="bg-gray-800 rounded-t-2xl w-full max-h-[60vh] overflow-y-auto pb-8" 
              onClick={(e) => e.stopPropagation()}
              onTouchStart={(e) => {
                e.currentTarget.dataset.startY = e.touches[0].clientY;
              }}
              onTouchMove={(e) => {
                const startY = parseFloat(e.currentTarget.dataset.startY);
                const currentY = e.touches[0].clientY;
                const diff = currentY - startY;
                
                if (diff > 0) {
                  e.preventDefault();
                  e.currentTarget.style.transform = `translateY(${diff}px)`;
                  e.currentTarget.style.transition = 'none';
                }
              }}
              onTouchEnd={(e) => {
                const startY = parseFloat(e.currentTarget.dataset.startY);
                const currentY = e.changedTouches[0].clientY;
                const diff = currentY - startY;
                
                e.currentTarget.style.transition = 'transform 0.2s ease-out';
                
                if (diff > 100) {
                  e.currentTarget.style.transform = 'translateY(100%)';
                  setTimeout(() => setShowPresetSelector(false), 200);
                } else {
                  e.currentTarget.style.transform = '';
                }
              }}
            >
              <div className="sticky top-0 bg-gray-800 z-10 pt-3 pb-2 border-b border-gray-700">
                <div className="flex justify-center pb-2">
                  <div className="w-10 h-1 bg-gray-600 rounded-full"></div>
                </div>
                <div className="flex items-center justify-between px-4">
                  <h3 className="font-bold text-lg">Choose Workout</h3>
                  <button
                    onClick={() => setShowPresetSelector(false)}
                    className="text-gray-400 hover:text-white"
                  >
                    <Icons.X />
                  </button>
                </div>
              </div>
              
              <div className="p-4 space-y-2">
                {presets.map((p, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      loadPreset(p);
                      setShowPresetSelector(false);
                      setShowWorkoutModal(true);
                      setEditing(null);
                    }}
                    className="w-full bg-gray-700 hover:bg-gray-600 p-4 rounded-lg text-left"
                  >
                    <div className="font-medium text-base mb-1">{p.name}</div>
                    {p.exercises.length > 0 && (
                      <div className="text-xs text-gray-400">{p.exercises.length} exercises</div>
                    )}
                  </button>
                ))}
                
                {presets.length === 0 && (
                  <div className="text-center text-gray-500 py-8 text-sm">
                    No presets yet. Add some in Settings!
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        
        {/* Workout Modal */}
        {showWorkoutModal && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end"
            onClick={() => {
              if (current.exercises.length > 0) {
                setShowCloseConfirm(true);
              } else {
                setShowWorkoutModal(false);
              }
            }}
          >
            <div 
              className="bg-gray-900 rounded-t-2xl w-full h-[90vh] overflow-y-auto flex flex-col" 
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="sticky top-0 bg-gray-900 z-10 border-b border-gray-700 px-4 py-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold">{editing !== null ? 'Edit' : 'New'} Workout</h2>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowHistoryModal(true)}
                      className="text-blue-400 hover:text-blue-300"
                    >
                      <Icons.Calendar />
                    </button>
                    <button
                      onClick={() => {
                        if (current.exercises.length > 0) {
                          setShowCloseConfirm(true);
                        } else {
                          setShowWorkoutModal(false);
                          setCurrent({
                            date: getTodayDate(),
                            exercises: [],
                            notes: '',
                            location: ''
                          });
                        }
                      }}
                    >
                      <Icons.X />
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Content - reuse workout form */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {/* View mode toggle */}
                <div className="flex gap-1">
                  <button
                    onClick={() => setWorkoutViewMode('table')}
                    className={`flex-1 px-3 py-1.5 rounded text-xs font-medium ${
                      workoutViewMode === 'table' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400'
                    }`}
                  >
                    Table View
                  </button>
                  <button
                    onClick={() => setWorkoutViewMode('cards')}
                    className={`flex-1 px-3 py-1.5 rounded text-xs font-medium ${
                      workoutViewMode === 'cards' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400'
                    }`}
                  >
                    Card View
                  </button>
                </div>
                
                <div className="space-y-2">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Date</label>
                    <input
                      type="text"
                      value={current.date}
                      onChange={(e) => setCurrent({ ...current, date: e.target.value })}
                      placeholder="YYYY-MM-DD"
                      className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1.5 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Workout</label>
                    <select
                      value={current.location}
                      onChange={(e) => setCurrent({ ...current, location: e.target.value })}
                      className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1.5 text-sm"
                    >
                      <option value="">Select</option>
                      {presets.map((p, i) => (
                        <option key={i} value={p.name}>{p.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Workout Form */}
                {workoutViewMode === 'table' ? (
                  // Table View
                  <div className="overflow-x-auto -mx-3 px-3">
                    {current.exercises.map((ex, ei) => {
                      const total = ex.sets.reduce((sum, s) => sum + (s.reps || 0), 0);
                      const maxSets = Math.max(4, ex.sets.length);
                      
                      return (
                        <div key={ei} className="flex gap-0.5 mb-1 overflow-x-auto pb-1">
                          {/* Frozen exercise name */}
                          <div className="sticky left-0 bg-gray-900 z-10 pr-0.5">
                            <select
                              value={ex.name}
                              onChange={(e) => updateEx(ei, 'name', e.target.value)}
                              className="w-[100px] bg-gray-800 border border-gray-700 rounded px-1 py-1 text-[11px]"
                            >
                              <option value="">Select</option>
                              {exercises.map((e, i) => (
                                <option key={i} value={e}>{e}</option>
                              ))}
                            </select>
                          </div>
                          
                          {/* Sets */}
                          {Array.from({ length: maxSets }, (_, si) => (
                            <div key={si} className="relative">
                              <input
                                type="number"
                                inputMode="numeric"
                                value={ex.sets[si]?.reps || ''}
                                onChange={(e) => {
                                  const u = [...current.exercises];
                                  if (!u[ei].sets[si]) u[ei].sets[si] = { reps: 0, weight: null };
                                  u[ei].sets[si].reps = parseInt(e.target.value) || 0;
                                  setCurrent({ ...current, exercises: u });
                                }}
                                onFocus={(e) => {
                                  e.target.nextElementSibling?.classList.remove('hidden');
                                }}
                                onBlur={(e) => {
                                  setTimeout(() => {
                                    e.target.nextElementSibling?.classList.add('hidden');
                                  }, 200);
                                }}
                                placeholder="0"
                                className="w-[40px] bg-gray-800 border border-gray-700 rounded px-1 py-1 text-[11px] text-center flex-shrink-0"
                              />
                              {ex.sets[si] && (
                                <button
                                  onClick={() => {
                                    const u = [...current.exercises];
                                    u[ei].sets.splice(si, 1);
                                    setCurrent({ ...current, exercises: u });
                                  }}
                                  className="hidden absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs z-10"
                                >
                                  ×
                                </button>
                              )}
                            </div>
                          ))}
                          
                          {/* Total */}
                          <div className="w-[35px] bg-gray-900 border border-gray-700 rounded px-1 py-1 text-[11px] text-center font-bold flex-shrink-0">
                            {total}
                          </div>
                          
                          {/* Notes */}
                          <input
                            type="text"
                            value={ex.notes}
                            onChange={(e) => updateEx(ei, 'notes', e.target.value)}
                            placeholder="..."
                            className="w-[80px] bg-gray-800 border border-gray-700 rounded px-1 py-1 text-[11px] flex-shrink-0"
                          />
                          
                          {/* Delete */}
                          <button
                            onClick={() => setDeleteExercise(ei)}
                            className="w-[24px] text-red-400 hover:text-red-300 text-lg flex-shrink-0"
                          >
                            ×
                          </button>
                          
                          {/* Add Set */}
                          <button
                            onClick={() => {
                              const u = [...current.exercises];
                              u[ei].sets.push({ reps: 0, weight: null });
                              setCurrent({ ...current, exercises: u });
                            }}
                            className="w-[36px] text-blue-400 hover:text-blue-300 text-xs bg-gray-700 rounded flex-shrink-0"
                          >
                            +
                          </button>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  // Card View
                  <div className="space-y-2">
                    {current.exercises.map((ex, ei) => {
                      const total = ex.sets.reduce((sum, s) => sum + (s.reps || 0), 0);
                      return (
                        <div key={ei} className="bg-gray-800 rounded-lg p-2">
                          {/* Exercise name */}
                          <select
                            value={ex.name}
                            onChange={(e) => updateEx(ei, 'name', e.target.value)}
                            className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-xs font-medium mb-2"
                          >
                            <option value="">Select Exercise</option>
                            {exercises.map((e, i) => (
                              <option key={i} value={e}>{e}</option>
                            ))}
                          </select>
                          
                          {/* Sets row */}
                          <div className="flex items-center gap-1 mb-2 overflow-x-auto">
                            {ex.sets.map((s, si) => (
                              <div key={si} className="flex flex-col items-center">
                                <div className="text-[10px] text-gray-400 mb-0.5">S{si + 1}</div>
                                <input
                                  type="number"
                                  inputMode="numeric"
                                  value={s.reps || ''}
                                  onChange={(e) => {
                                    const u = [...current.exercises];
                                    u[ei].sets[si].reps = parseInt(e.target.value) || 0;
                                    setCurrent({ ...current, exercises: u });
                                  }}
                                  placeholder="0"
                                  className="w-12 bg-gray-700 border border-gray-600 rounded px-1 py-1 text-[11px] text-center"
                                />
                              </div>
                            ))}
                            
                            {/* Total */}
                            <div className="flex flex-col items-center">
                              <div className="text-[10px] text-gray-400 mb-0.5">Tot</div>
                              <div className="w-12 bg-gray-900 border border-gray-700 rounded px-1 py-1 text-[11px] text-center font-bold">
                                {total}
                              </div>
                            </div>
                            
                            {/* Add Set button */}
                            <button
                              onClick={() => {
                                const u = [...current.exercises];
                                u[ei].sets.push({ reps: 0, weight: null });
                                setCurrent({ ...current, exercises: u });
                              }}
                              className="text-blue-400 hover:text-blue-300 text-xs px-2 py-1 bg-gray-700 rounded"
                            >
                              +
                            </button>
                          </div>
                          
                          {/* Notes and delete */}
                          <div className="flex items-center gap-1">
                            <input
                              type="text"
                              value={ex.notes}
                              onChange={(e) => updateEx(ei, 'notes', e.target.value)}
                              placeholder="Notes..."
                              className="flex-1 bg-gray-700 border border-gray-600 rounded px-2 py-1 text-[11px]"
                            />
                            <button
                              onClick={() => setDeleteExercise(ei)}
                              className="text-red-400 hover:text-red-300 px-2 py-1"
                            >
                              <Icons.Trash />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                <button
                  onClick={addEx}
                  className="w-full bg-gray-800 hover:bg-gray-700 py-2 rounded-lg border-2 border-dashed border-gray-600 text-sm"
                >
                  + Add Exercise
                </button>

                <div>
                  <label className="block text-xs text-gray-400 mb-1">Workout Notes</label>
                  <textarea
                    value={current.notes}
                    onChange={(e) => setCurrent({ ...current, notes: e.target.value })}
                    placeholder="How did it go?"
                    className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1.5 h-20 text-sm"
                  />
                </div>
              </div>
              
              {/* Footer with Finish button */}
              <div className="sticky bottom-0 bg-gray-900 border-t border-gray-700 p-4">
                <button
                  onClick={() => {
                    saveWorkout();
                    setShowWorkoutModal(false);
                  }}
                  className="w-full bg-blue-600 hover:bg-blue-700 py-3 rounded-lg font-semibold text-base"
                >
                  Finish Workout
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* History Modal - For workout reference */}
        {showHistoryModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end" onClick={() => setShowHistoryModal(false)}>
            <div 
              className="bg-gray-800 rounded-t-2xl w-full max-h-[75vh] overflow-y-auto pb-8" 
              onClick={(e) => e.stopPropagation()}
              onTouchStart={(e) => {
                e.currentTarget.dataset.startY = e.touches[0].clientY;
                e.currentTarget.dataset.scrollTop = e.currentTarget.scrollTop;
              }}
              onTouchMove={(e) => {
                const startY = parseFloat(e.currentTarget.dataset.startY);
                const scrollTop = parseFloat(e.currentTarget.dataset.scrollTop);
                const currentY = e.touches[0].clientY;
                const diff = currentY - startY;
                
                if (scrollTop === 0 && diff > 0) {
                  e.preventDefault();
                  e.currentTarget.style.transform = `translateY(${diff}px)`;
                  e.currentTarget.style.transition = 'none';
                }
              }}
              onTouchEnd={(e) => {
                const startY = parseFloat(e.currentTarget.dataset.startY);
                const scrollTop = parseFloat(e.currentTarget.dataset.scrollTop);
                const currentY = e.changedTouches[0].clientY;
                const diff = currentY - startY;
                
                e.currentTarget.style.transition = 'transform 0.2s ease-out';
                
                if (scrollTop === 0 && diff > 100) {
                  e.currentTarget.style.transform = 'translateY(100%)';
                  setTimeout(() => setShowHistoryModal(false), 200);
                } else {
                  e.currentTarget.style.transform = '';
                }
              }}
            >
              <div className="sticky top-0 bg-gray-800 z-10 pt-3 pb-2 border-b border-gray-700">
                <div className="flex justify-center pb-2">
                  <div className="w-10 h-1 bg-gray-600 rounded-full"></div>
                </div>
                <div className="flex items-center justify-between px-4">
                  <h3 className="font-bold text-lg">Recent Workouts</h3>
                  <button
                    onClick={() => setShowHistoryModal(false)}
                    className="text-gray-400 hover:text-white"
                  >
                    <Icons.X />
                  </button>
                </div>
              </div>
              
              <div className="p-4 space-y-2">
                {[...workouts].sort((a, b) => b.date.localeCompare(a.date)).map((w, i) => {
                  const [year, month, day] = w.date.split('-');
                  const dateObj = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
                  const dayOfWeek = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
                  
                  const locationColors = {
                    'Garage BW': 'border-blue-500',
                    'Manual': 'border-green-500',
                    'Garage 10': 'border-purple-500',
                    'BW-only': 'border-yellow-500',
                  };
                  const bgColors = {
                    'Garage BW': 'bg-blue-900/30',
                    'Manual': 'bg-green-900/30',
                    'Garage 10': 'bg-purple-900/30',
                    'BW-only': 'bg-yellow-900/30',
                  };
                  const borderColor = locationColors[w.location] || 'border-gray-600';
                  const bgColor = bgColors[w.location] || 'bg-gray-700';
                  
                  return (
                    <div key={i} className={`${bgColor} rounded-lg p-3 border-l-4 ${borderColor}`}>
                      <div className="font-bold text-sm mb-2">
                        {dayOfWeek} {month}/{day}
                        {w.location && <span className="ml-2 text-xs font-normal text-gray-400">· {w.location}</span>}
                      </div>
                      
                      <div className="space-y-1">
                        {w.exercises.map((ex, ei) => {
                          const totalReps = ex.sets.reduce((sum, s) => sum + (s.reps || 0), 0);
                          return (
                            <div key={ei}>
                              <div className="flex items-start text-xs">
                                <div className="w-28 font-medium">{ex.name}</div>
                                <div className="flex-1 flex items-center gap-1">
                                  {ex.sets.map((s, si) => (
                                    <span key={si} className="text-gray-400">
                                      {s.reps}
                                      {si < ex.sets.length - 1 && <span className="text-gray-600 mx-0.5">·</span>}
                                    </span>
                                  ))}
                                  <span className="ml-1 font-bold text-white">({totalReps})</span>
                                </div>
                              </div>
                              {ex.notes && (
                                <div className="text-[10px] text-gray-500 ml-28 -mt-0.5">{ex.notes}</div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
        
        {/* Bottom Navigation */}
        <div className="fixed bottom-0 left-0 right-0 bg-gray-800 border-t border-gray-700 safe-area-pb">
          <div className="max-w-4xl mx-auto flex">
            <button
              onClick={() => setView('calendar')}
              className={`flex-1 py-3 ${view === 'calendar' ? 'text-blue-500' : 'text-gray-400'}`}
            >
              <div className="flex flex-col items-center">
                <Icons.Calendar />
                <span className="text-xs mt-1">Home</span>
              </div>
            </button>
            <button
              onClick={() => setView('log')}
              className={`flex-1 py-3 ${view === 'log' ? 'text-blue-500' : 'text-gray-400'}`}
            >
              <div className="flex flex-col items-center">
                <Icons.Plus />
                <span className="text-xs mt-1">Workout</span>
              </div>
            </button>
            <button
              onClick={() => setView('stats')}
              className={`flex-1 py-3 ${view === 'stats' ? 'text-blue-500' : 'text-gray-400'}`}
            >
              <div className="flex flex-col items-center">
                <Icons.TrendingUp />
                <span className="text-xs mt-1">Stats</span>
              </div>
            </button>
            <button
              onClick={() => setView('list')}
              className={`flex-1 py-3 ${view === 'list' ? 'text-blue-500' : 'text-gray-400'}`}
            >
              <div className="flex flex-col items-center">
                <Icons.Calendar />
                <span className="text-xs mt-1">List</span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
