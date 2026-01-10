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
    if (str.includes(',')) {
      const d = new Date(str);
      if (!isNaN(d.getTime())) 
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    }
    if (str.includes('-')) {
      const p = str.split('-');
      if (p.length >= 3) {
        const m = p[0].padStart(2, '0'), d = p[1].padStart(2, '0');
        const y = p.find(x => x.length === 4 && !isNaN(x)) || '2025';
        return `${y}-${m}-${d}`;
      }
    }
    return str;
  };

  const importWorkouts = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const lines = ev.target.result.split('\n');
      const imp = [];
      let date = '', exs = [], notes = '', loc = '';
      
      for (let i = 0; i < lines.length; i++) {
        const cols = lines[i].split(',').map(c => c.trim().replace(/^"|"$/g, ''));
        if (cols[0] && (cols[0] === 'Date' || cols[0].includes('Exercise'))) continue;
        
        if (cols[0] && (cols[0].match(/^\d+-\d+/) || cols[0].includes(','))) {
          if (date && exs.length) 
            imp.push({ date: parseDate(date), exercises: exs, notes, location: loc });
          date = cols[0];
          exs = [{
            name: cols[1],
            sets: [cols[2], cols[3], cols[4], cols[5]]
              .filter(s => s).map(s => ({ reps: parseInt(s) || 0, weight: null })),
            notes: cols[7] || ''
          }];
          notes = ''; loc = '';
        } else if (!cols[0] && !cols[1] && cols[2]) {
          if (cols[2].includes('Garage') || cols[2].includes('BW') || cols[2].includes('Manual')) {
            loc = cols[2]; notes = cols[7] || '';
          }
        } else if (cols[1] && !cols[0]) {
          if (cols[1].includes('Garage') || cols[1].includes('BW') || cols[1].includes('Manual')) {
            loc = cols[1]; 
            notes = [cols[6], cols[7], cols[8]].filter(n => n).join(' ');
          } else if (cols[1] !== 'Day Off') {
            exs.push({
              name: cols[1],
              sets: [cols[2], cols[3], cols[4], cols[5]]
                .filter(s => s).map(s => ({ reps: parseInt(s) || 0, weight: null })),
              notes: cols[7] || ''
            });
          }
        }
      }
      if (date && exs.length) 
        imp.push({ date: parseDate(date), exercises: exs, notes, location: loc });
      save(imp.reverse(), 'workouts', setWorkouts);
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
        <title>Workout Log</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
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
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Icons.Dumbbell />
              Workout Log
            </h1>
            <button onClick={() => setShowSettings(!showSettings)} className="bg-gray-700 px-3 py-2 rounded-lg">
              <Icons.Settings />
            </button>
          </div>
        </div>

        {showSettings && (
          <div className="bg-gray-800 border-b p-4">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center justify-between mb-4">
                <h2>Settings</h2>
                <button onClick={() => setShowClear(true)} className="bg-red-600 px-3 py-2 rounded text-sm">
                  Clear All
                </button>
              </div>
              <div className="flex gap-2 mb-4">
                <label className="cursor-pointer bg-blue-600 px-4 py-2 rounded-lg text-sm flex items-center gap-2">
                  <Icons.Upload />
                  Presets
                  <input type="file" accept=".csv" onChange={importPresets} className="hidden" />
                </label>
                <label className="cursor-pointer bg-green-600 px-4 py-2 rounded-lg text-sm flex items-center gap-2">
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

        <div className="max-w-4xl mx-auto p-4">
          {view === 'log' && !showNew && (
            <div className="space-y-2">
              <h2 className="text-lg font-semibold mb-3">Select Workout</h2>
              {presets.map((p, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setShowNew(true);
                    p.name === 'Manual' ? setCurrent({ ...current, location: p.name }) : loadPreset(p);
                  }}
                  className="w-full bg-gray-800 hover:bg-gray-700 p-4 rounded-lg text-left"
                >
                  <div className="font-semibold">{p.name}</div>
                  {p.exercises.length > 0 && (
                    <div className="text-sm text-gray-400">{p.exercises.length} exercises</div>
                  )}
                </button>
              ))}
            </div>
          )}

          {view === 'log' && showNew && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">{editing !== null ? 'Edit' : 'New'}</h2>
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
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Date</label>
                  <input
                    type="date"
                    value={current.date}
                    onChange={(e) => setCurrent({ ...current, date: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Workout</label>
                  <select
                    value={current.location}
                    onChange={(e) => setCurrent({ ...current, location: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2"
                  >
                    <option value="">Select</option>
                    {presets.map((p, i) => (
                      <option key={i} value={p.name}>{p.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {current.exercises.map((ex, ei) => (
                <div key={ei} className="bg-gray-800 rounded-lg p-4 space-y-3">
                  <select
                    value={ex.name}
                    onChange={(e) => updateEx(ei, 'name', e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 font-semibold"
                  >
                    <option value="">Select</option>
                    {exercises.map((e, i) => (
                      <option key={i} value={e}>{e}</option>
                    ))}
                  </select>
                  
                  <div className="space-y-2">
                    {ex.sets.map((s, si) => (
                      <div key={si} className="flex items-center gap-2">
                        <span className="text-sm text-gray-400 w-12">Set {si + 1}</span>
                        <input
                          type="number"
                          value={s.reps || ''}
                          onChange={(e) => updateSet(ei, si, 'reps', e.target.value)}
                          placeholder="Reps"
                          className="flex-1 bg-gray-700 border border-gray-600 rounded px-3 py-2"
                        />
                        <input
                          type="text"
                          value={s.weight || ''}
                          onChange={(e) => updateSet(ei, si, 'weight', e.target.value)}
                          placeholder="Weight"
                          className="flex-1 bg-gray-700 border border-gray-600 rounded px-3 py-2"
                        />
                        <button onClick={() => removeSet(ei, si)} className="text-red-400 px-2">
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                  
                  <button onClick={() => addSet(ei)} className="text-sm text-blue-400">
                    + Add Set
                  </button>
                  
                  <input
                    type="text"
                    value={ex.notes}
                    onChange={(e) => updateEx(ei, 'notes', e.target.value)}
                    placeholder="Notes"
                    className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm"
                  />
                </div>
              ))}

              <button
                onClick={addEx}
                className="w-full bg-gray-800 hover:bg-gray-700 py-3 rounded-lg border-2 border-dashed border-gray-600"
              >
                + Add Exercise
              </button>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Workout Notes</label>
                <textarea
                  value={current.notes}
                  onChange={(e) => setCurrent({ ...current, notes: e.target.value })}
                  placeholder="How did it go?"
                  className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 h-24"
                />
              </div>

              <button
                onClick={saveWorkout}
                className="w-full bg-blue-600 hover:bg-blue-700 py-3 rounded-lg font-semibold"
              >
                {editing !== null ? 'Update' : 'Save'}
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
