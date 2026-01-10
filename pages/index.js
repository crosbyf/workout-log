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
  const [view, setView] = useState('log');
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [editing, setEditing] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [sortOrder, setSortOrder] = useState('desc');
  const [search, setSearch] = useState('');
  const [showClear, setShowClear] = useState(false);
  const [expandedTrends, setExpandedTrends] = useState({});
  const [current, setCurrent] = useState({
    date: new Date().toISOString().split('T')[0],
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
      date: new Date().toISOString().split('T')[0],
      exercises: [],
      notes: '',
      location: ''
    });
    setShowNew(false);
  };

  const deleteWorkout = (i) => save(workouts.filter((_, idx) => idx !== i), 'workouts', setWorkouts);
  
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
    if (search.trim()) {
      const q = search.toLowerCase();
      f = workouts.filter(w =>
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
                      onClick={() => save(presets.filter((_, idx) => idx !== i), 'presets', setPresets)}
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

        <div className="bg-gray-800 border-b">
          <div className="max-w-4xl mx-auto flex">
            <button
              onClick={() => setView('log')}
              className={`flex-1 py-3 ${view === 'log' ? 'bg-gray-700 border-b-2 border-blue-500' : ''}`}
            >
              <div className="flex flex-col items-center">
                <Icons.Plus />
                <span className="text-sm mt-1">Log</span>
              </div>
            </button>
            <button
              onClick={() => setView('history')}
              className={`flex-1 py-3 ${view === 'history' ? 'bg-gray-700 border-b-2 border-blue-500' : ''}`}
            >
              <div className="flex flex-col items-center">
                <Icons.Calendar />
                <span className="text-sm mt-1">History</span>
              </div>
            </button>
            <button
              onClick={() => setView('trends')}
              className={`flex-1 py-3 ${view === 'trends' ? 'bg-gray-700 border-b-2 border-blue-500' : ''}`}
            >
              <div className="flex flex-col items-center">
                <Icons.TrendingUp />
                <span className="text-sm mt-1">Trends</span>
              </div>
            </button>
          </div>
        </div>

        <div className="max-w-4xl mx-auto p-3">
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
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">{editing !== null ? 'Edit' : 'New'}</h2>
                <button
                  onClick={() => {
                    setShowNew(false);
                    setEditing(null);
                    setCurrent({
                      date: new Date().toISOString().split('T')[0],
                      exercises: [],
                      notes: '',
                      location: ''
                    });
                  }}
                >
                  <Icons.X />
                </button>
              </div>
              
              <div className="space-y-2">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Date</label>
                  <input
                    type="date"
                    value={current.date}
                    onChange={(e) => setCurrent({ ...current, date: e.target.value })}
                    className="w-full max-w-full bg-gray-800 border border-gray-700 rounded px-2 py-1.5 text-sm overflow-hidden"
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

              {current.exercises.map((ex, ei) => (
                <div key={ei} className="bg-gray-800 rounded-lg p-3 space-y-2">
                  <select
                    value={ex.name}
                    onChange={(e) => updateEx(ei, 'name', e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1.5 text-sm font-medium"
                  >
                    <option value="">Select</option>
                    {exercises.map((e, i) => (
                      <option key={i} value={e}>{e}</option>
                    ))}
                  </select>
                  
                  <div className="space-y-1.5">
                    {ex.sets.map((s, si) => (
                      <div key={si} className="flex items-center gap-2">
                        <span className="text-xs text-gray-400 w-12">Set {si + 1}</span>
                        <input
                          type="number"
                          value={s.reps || ''}
                          onChange={(e) => updateSet(ei, si, 'reps', e.target.value)}
                          placeholder="Reps"
                          className="flex-1 bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm"
                        />
                        <button onClick={() => removeSet(ei, si)} className="text-red-400 px-2 text-lg">
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                  
                  <button onClick={() => addSet(ei)} className="text-xs text-blue-400">
                    + Add Set
                  </button>
                  
                  <input
                    type="text"
                    value={ex.notes}
                    onChange={(e) => updateEx(ei, 'notes', e.target.value)}
                    placeholder="Notes"
                    className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1.5 text-xs"
                  />
                </div>
              ))}

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

              {filtered().map((w, i) => (
                <div key={i} className="bg-gray-800 rounded-lg p-3">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="font-medium text-sm">
                        {(() => {
                          const [year, month, day] = w.date.split('-');
                          return `${month}/${day}/${year}`;
                        })()}
                      </div>
                      {w.location && <div className="text-xs text-gray-400">{w.location}</div>}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => copyToSheets(w)}
                        className="text-blue-400 hover:text-blue-300"
                        title="Copy to clipboard"
                      >
                        <Icons.Copy />
                      </button>
                      <button
                        onClick={() => editWorkout(i)}
                        className="text-green-400 hover:text-green-300"
                      >
                        <Icons.Edit />
                      </button>
                      <button
                        onClick={() => deleteWorkout(i)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <Icons.Trash />
                      </button>
                    </div>
                  </div>
                  
                  <div className="space-y-1.5">
                    {w.exercises.map((ex, ei) => (
                      <div key={ei} className="border-l-2 border-gray-700 pl-2">
                        <div className="font-medium text-xs">{ex.name}</div>
                        <div className="text-xs text-gray-400">
                          {ex.sets.map((s, si) => (
                            <span key={si}>
                              {s.reps}
                              {s.weight && ` @ ${s.weight}`}
                              {si < ex.sets.length - 1 && ', '}
                            </span>
                          ))}
                        </div>
                        {ex.notes && <div className="text-xs text-gray-500">{ex.notes}</div>}
                      </div>
                    ))}
                  </div>
                  
                  {w.notes && (
                    <div className="mt-2 text-xs text-gray-400 italic">{w.notes}</div>
                  )}
                </div>
              ))}

              {filtered().length === 0 && (
                <div className="text-center text-gray-500 py-8">
                  {search ? 'No workouts found' : 'No workouts yet'}
                </div>
              )}
            </div>
          )}

          {view === 'trends' && (
            <div className="space-y-3">
              <h2 className="text-base font-semibold mb-2">Trends</h2>
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
                                    <div key={week} className="flex items-center gap-1.5">
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
                              </div>
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
        </div>
      </div>
    </>
  );
}
