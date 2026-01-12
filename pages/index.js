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
  const [darkMode, setDarkMode] = useState(true); // true = dark, false = light
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
  const [expandedLog, setExpandedLog] = useState(new Set());
  const [showWorkoutModal, setShowWorkoutModal] = useState(false);
  const [showPresetSelector, setShowPresetSelector] = useState(false);
  const [showLogCalendar, setShowLogCalendar] = useState(false);
  const [logCalendarDate, setLogCalendarDate] = useState(new Date());
  const [showPresetsMenu, setShowPresetsMenu] = useState(false);
  const [selectedLogDay, setSelectedLogDay] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [showEndWorkoutConfirm, setShowEndWorkoutConfirm] = useState(false);
  const [editingPreset, setEditingPreset] = useState(null);
  const [editPresetName, setEditPresetName] = useState('');
  const [editPresetExercises, setEditPresetExercises] = useState([]);
  const [showSaveAsPreset, setShowSaveAsPreset] = useState(false);
  const [newPresetName, setNewPresetName] = useState('');
  const [volumeWidgetDate, setVolumeWidgetDate] = useState(new Date());
  const [autoEmail, setAutoEmail] = useState(false);
  const [emailAddress, setEmailAddress] = useState('');
  const [workoutStarted, setWorkoutStarted] = useState(false);
  const [workoutTimer, setWorkoutTimer] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [showPauseMenu, setShowPauseMenu] = useState(false);
  
  // Timer effect
  useEffect(() => {
    let interval;
    if (timerRunning) {
      interval = setInterval(() => {
        setWorkoutTimer(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerRunning]);
  
  // Format timer display
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${String(secs).padStart(2, '0')}`;
  };
  
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
      const loadData = () => {
        const w = localStorage.getItem('workouts');
        const p = localStorage.getItem('presets');
        const e = localStorage.getItem('exercises');
        const ae = localStorage.getItem('autoEmail');
        const ea = localStorage.getItem('emailAddress');
        const dm = localStorage.getItem('darkMode');
        if (w) setWorkouts(JSON.parse(w));
        if (p) setPresets(JSON.parse(p));
        if (e) setExercises(JSON.parse(e));
        if (ae) setAutoEmail(JSON.parse(ae));
        if (ea) setEmailAddress(JSON.parse(ea));
        if (dm !== null) setDarkMode(JSON.parse(dm));
      };
      
      // Load data immediately
      loadData();
      
      // But keep loading screen visible for 3 seconds
      setTimeout(() => {
        setLoading(false);
      }, 3000);
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
          if (currentWorkout && (currentWorkout.exercises.length > 0 || currentWorkout.location === 'Day Off')) {
            imp.push(currentWorkout);
          }

          // Start new workout
          currentWorkout = {
            date: parseDate(cols[0]),
            exercises: [],
            notes: '',
            location: workoutLocation
          };

          // Check if this is a Day Off entry
          if (cols[1] && cols[1] === 'Day Off') {
            currentWorkout.location = 'Day Off';
            // Get notes from column 7 or later columns
            const noteParts = [cols[7], cols[8], cols[9], cols[10]].filter(n => n && n.trim());
            if (noteParts.length > 0) {
              currentWorkout.notes = noteParts.join(' ');
            }
          }
          // Add first exercise if present
          else if (cols[1] && cols[1] !== 'Day Off') {
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
        // Check if this is workout notes (has location info in col 2) - but not for Day Off
        else if (currentWorkout && currentWorkout.location !== 'Day Off' && cols[2] && (cols[2].includes('Garage') || cols[2].includes('BW') || cols[2].includes('Manual'))) {
          currentWorkout.location = cols[2];
          const noteParts = [cols[7], cols[8], cols[9], cols[10]].filter(n => n && n.trim());
          if (noteParts.length > 0) {
            currentWorkout.notes = noteParts.join(' ');
          }
        }
        // Handle Day Off as location in second line
        else if (currentWorkout && cols[2] && cols[2] === 'Day Off') {
          currentWorkout.location = 'Day Off';
          const noteParts = [cols[7], cols[8], cols[9], cols[10]].filter(n => n && n.trim());
          if (noteParts.length > 0) {
            currentWorkout.notes = noteParts.join(' ');
          }
        }
      }

      // Don't forget the last workout (including Day Off)
      if (currentWorkout && (currentWorkout.exercises.length > 0 || currentWorkout.location === 'Day Off')) {
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
    // Allow Day Off workouts with zero exercises if they have notes or location
    if (!current.exercises.length && !current.notes && current.location !== 'Day Off') return;
    
    let ws;
    if (editing !== null) {
      ws = [...workouts];
      ws[editing] = current;
      setEditing(null);
    } else {
      ws = [current, ...workouts];
    }
    save(ws, 'workouts', setWorkouts);
    
    // Auto-email if enabled (only for new workouts, not edits)
    if (autoEmail && editing === null && emailAddress) {
      setTimeout(() => {
        const csvContent = exportCSV(true);
        const subject = encodeURIComponent('GORS LOG - New Workout');
        const dateStr = new Date(current.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        const body = encodeURIComponent(`New workout logged on ${dateStr}:\n\n${current.location || 'Workout'}\n${current.exercises.length} exercises\n\n${current.notes || 'No notes'}`);
        window.location.href = `mailto:${emailAddress}?subject=${subject}&body=${body}`;
      }, 500);
    }
    
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
    setShowWorkoutModal(true);
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
    
    // Show toast notification
    setToastMessage('Workout copied to clipboard!');
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const clearAll = () => {
    save([], 'workouts', setWorkouts);
    setShowClear(false);
  };

  const exportCSV = (returnContent = false) => {
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
    
    if (returnContent) {
      return csv;
    }
    
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
      // Start week on Monday: if Sunday (0), go back 6 days; otherwise go back (day-1) days
      const diff = day === 0 ? -6 : 1 - day;
      const start = new Date(d.setDate(d.getDate() + diff));
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
      <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-4">GORS LOG</h1>
          <div className="flex items-center gap-2 justify-center">
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-slow-pulse"></div>
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-slow-pulse" style={{animationDelay: '0.66s'}}></div>
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-slow-pulse" style={{animationDelay: '1.33s'}}></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>GORS LOG</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <meta name="theme-color" content="#111827" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <style>{`
          @keyframes slowPulse {
            0%, 100% { opacity: 0.2; transform: scale(1); }
            50% { opacity: 1; transform: scale(1.2); }
          }
          .animate-slow-pulse {
            animation: slowPulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
          }
        `}</style>
      </Head>
      
      <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
        {showClear && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-xl p-6 max-w-md border-2 border-red-500/50">
              <h3 className="text-2xl font-bold mb-3 text-red-400">⚠️ Delete All Workouts?</h3>
              <p className="mb-2 text-base">This will permanently delete <strong>all {workouts.length} workout{workouts.length !== 1 ? 's' : ''}</strong> from your history.</p>
              <p className="mb-6 text-sm text-gray-400">Your workout presets will NOT be deleted. This action cannot be undone!</p>
              <div className="flex gap-3">
                <button onClick={clearAll} className="flex-1 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 py-3 rounded-xl font-bold shadow-lg transition-all">
                  Yes, Delete All
                </button>
                <button onClick={() => setShowClear(false)} className="flex-1 bg-gradient-to-r from-gray-700 to-gray-600 hover:from-gray-600 hover:to-gray-500 py-3 rounded-xl font-semibold shadow-md transition-all">
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
                    // Reset timer
                    setWorkoutStarted(false);
                    setWorkoutTimer(0);
                    setTimerRunning(false);
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

        {/* End Workout Confirmation */}
        {showEndWorkoutConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[60] p-4">
            <div className="bg-gray-800 rounded-lg p-6 max-w-md">
              <h3 className="text-xl font-bold mb-4 text-blue-400">Finish Workout?</h3>
              <p className="mb-6">Save this workout to your log?</p>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    saveWorkout();
                    setShowWorkoutModal(false);
                    setWorkoutStarted(false);
                    setWorkoutTimer(0);
                    setTimerRunning(false);
                    setShowEndWorkoutConfirm(false);
                    
                    // Offer to save as preset if it's a manual workout
                    if (current.location === 'Manual' && current.exercises.length > 0) {
                      setShowSaveAsPreset(true);
                    }
                  }}
                  className="flex-1 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 py-3 rounded-lg font-semibold"
                >
                  Save Workout
                </button>
                <button
                  onClick={() => setShowEndWorkoutConfirm(false)}
                  className="flex-1 bg-gray-700 py-3 rounded-lg font-semibold"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Preset Modal */}
        {editingPreset !== null && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full">
              <h3 className="text-xl font-bold mb-4">Edit Preset</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Preset Name</label>
                  <input
                    type="text"
                    value={editPresetName}
                    onChange={(e) => setEditPresetName(e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Exercises</label>
                  {editPresetExercises.map((ex, i) => (
                    <div key={i} className="flex gap-2 mb-2">
                      <select
                        value={ex}
                        onChange={(e) => {
                          const updated = [...editPresetExercises];
                          updated[i] = e.target.value;
                          setEditPresetExercises(updated);
                        }}
                        className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-3 py-2"
                      >
                        {exercises.map((e, ei) => (
                          <option key={ei} value={e}>{e}</option>
                        ))}
                      </select>
                      <button
                        onClick={() => {
                          const updated = editPresetExercises.filter((_, idx) => idx !== i);
                          setEditPresetExercises(updated);
                        }}
                        className="text-red-400 hover:text-red-300"
                      >
                        <Icons.Trash />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => setEditPresetExercises([...editPresetExercises, exercises[0]])}
                    className="text-blue-400 hover:text-blue-300 text-sm"
                  >
                    + Add Exercise
                  </button>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    const updated = [...presets];
                    updated[editingPreset] = {
                      name: editPresetName,
                      exercises: editPresetExercises
                    };
                    save(updated, 'presets', setPresets);
                    setEditingPreset(null);
                  }}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 py-3 rounded-lg font-semibold"
                >
                  Save Changes
                </button>
                <button
                  onClick={() => setEditingPreset(null)}
                  className="flex-1 bg-gray-700 py-3 rounded-lg font-semibold"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Save Manual Workout as Preset */}
        {showSaveAsPreset && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full">
              <h3 className="text-xl font-bold mb-4">Save as Preset?</h3>
              <p className="text-sm text-gray-400 mb-4">Would you like to save this workout as a preset for future use?</p>
              <div>
                <label className="block text-sm font-medium mb-1">Preset Name</label>
                <input
                  type="text"
                  value={newPresetName}
                  onChange={(e) => setNewPresetName(e.target.value)}
                  placeholder="e.g., My Custom Workout"
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2"
                />
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    if (newPresetName.trim()) {
                      const newPreset = {
                        name: newPresetName.trim(),
                        exercises: current.exercises.map(ex => ex.name)
                      };
                      save([...presets, newPreset], 'presets', setPresets);
                      setToastMessage('Preset saved!');
                      setShowToast(true);
                      setTimeout(() => setShowToast(false), 3000);
                    }
                    setShowSaveAsPreset(false);
                    setNewPresetName('');
                  }}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 py-3 rounded-lg font-semibold"
                >
                  Save Preset
                </button>
                <button
                  onClick={() => {
                    setShowSaveAsPreset(false);
                    setNewPresetName('');
                  }}
                  className="flex-1 bg-gray-700 py-3 rounded-lg font-semibold"
                >
                  Skip
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Exercise Confirmation */}
        {deleteExercise !== null && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[70] p-4">
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

        <div className={`bg-gradient-to-b ${darkMode ? 'from-gray-800 to-gray-900' : 'from-gray-100 to-gray-200'} ${darkMode ? 'border-gray-700/50' : 'border-gray-300'} border-b p-4 shadow-lg`}>
          <div className="max-w-4xl mx-auto text-center">
            <button 
              onClick={() => {
                const newMode = !darkMode;
                setDarkMode(newMode);
                save(newMode, 'darkMode', setDarkMode);
              }}
              className="cursor-pointer hover:opacity-80 transition-opacity"
            >
              <h1 className={`text-2xl font-extrabold tracking-tight bg-gradient-to-r ${darkMode ? 'from-white to-gray-300' : 'from-gray-900 to-gray-700'} bg-clip-text text-transparent`}>GORS LOG</h1>
              <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'} -mt-0.5 font-medium`}>Get Stronger</p>
            </button>
          </div>
        </div>

        <div className="max-w-4xl mx-auto p-3 pb-24">

          {view === 'calendar' && (
            <div className="space-y-3">
              {/* New Workout Button */}
              <button
                onClick={() => setShowPresetSelector(true)}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 rounded-xl p-4 mb-4 flex items-center justify-center gap-2 text-lg font-bold shadow-lg shadow-blue-500/30 transition-all active:scale-[0.98]"
              >
                <Icons.Plus className="w-6 h-6" />
                New Workout
              </button>
              
              {/* Monthly Volume Widget */}
              <div className={`bg-gradient-to-br ${darkMode ? 'from-gray-800 to-gray-900 border-gray-700/50' : 'from-gray-50 to-gray-100 border-gray-300'} rounded-xl p-4 mb-4 shadow-lg border`}>
                <div className="flex items-center justify-between mb-4">
                  <button
                    onClick={() => {
                      const newDate = new Date(volumeWidgetDate);
                      newDate.setMonth(newDate.getMonth() - 1);
                      setVolumeWidgetDate(newDate);
                    }}
                    className={`p-1.5 ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'} rounded-lg transition-colors`}
                  >
                    <svg className={`w-4 h-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <div className="text-center">
                    <div className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-600'} uppercase tracking-wider mb-0.5`}>Monthly Volume</div>
                    <h3 className="text-sm font-bold text-blue-400 mb-0.5">
                      {volumeWidgetDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </h3>
                  </div>
                  <button
                    onClick={() => {
                      const newDate = new Date(volumeWidgetDate);
                      newDate.setMonth(newDate.getMonth() + 1);
                      setVolumeWidgetDate(newDate);
                    }}
                    className={`p-1.5 ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'} rounded-lg transition-colors`}
                  >
                    <svg className={`w-4 h-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
                <div className="space-y-3">
                  {[
                    { name: 'Pull-ups', color: 'from-blue-500 to-blue-600', icon: '💪' },
                    { name: 'Dips', color: 'from-green-500 to-green-600', icon: '🔥' },
                    { name: 'Chin-ups', color: 'from-purple-500 to-purple-600', icon: '⚡' }
                  ].map(({ name, color, icon }) => {
                    const monthStr = `${volumeWidgetDate.getFullYear()}-${String(volumeWidgetDate.getMonth() + 1).padStart(2, '0')}`;
                    
                    // Calculate current month volume
                    const monthlyVolume = workouts
                      .filter(w => w.date.startsWith(monthStr))
                      .reduce((total, w) => {
                        const exercise = w.exercises.find(ex => ex.name === name);
                        if (exercise) {
                          return total + exercise.sets.reduce((sum, s) => sum + (s.reps || 0), 0);
                        }
                        return total;
                      }, 0);
                    
                    // Calculate previous month volume (as goal)
                    const prevMonth = new Date(volumeWidgetDate);
                    prevMonth.setMonth(prevMonth.getMonth() - 1);
                    const prevMonthStr = `${prevMonth.getFullYear()}-${String(prevMonth.getMonth() + 1).padStart(2, '0')}`;
                    const prevMonthVolume = workouts
                      .filter(w => w.date.startsWith(prevMonthStr))
                      .reduce((total, w) => {
                        const exercise = w.exercises.find(ex => ex.name === name);
                        if (exercise) {
                          return total + exercise.sets.reduce((sum, s) => sum + (s.reps || 0), 0);
                        }
                        return total;
                      }, 0);
                    
                    // Use previous month as goal, or fall back to current max
                    const goalVolume = prevMonthVolume > 0 ? prevMonthVolume : Math.max(
                      ...['Pull-ups', 'Dips', 'Chin-ups'].map(ex => {
                        return workouts
                          .filter(w => w.date.startsWith(monthStr))
                          .reduce((total, w) => {
                            const exercise = w.exercises.find(e => e.name === ex);
                            return total + (exercise ? exercise.sets.reduce((sum, s) => sum + (s.reps || 0), 0) : 0);
                          }, 0);
                      })
                    );
                    
                    const percentage = goalVolume > 0 ? Math.min((monthlyVolume / goalVolume) * 100, 100) : 0;
                    const isOverGoal = monthlyVolume > goalVolume && goalVolume > 0;
                    
                    // Calculate on pace / off pace
                    const now = new Date();
                    const isCurrentMonth = volumeWidgetDate.getMonth() === now.getMonth() && 
                                          volumeWidgetDate.getFullYear() === now.getFullYear();
                    let paceStatus = '';
                    if (isCurrentMonth && prevMonthVolume > 0) {
                      const daysInMonth = new Date(volumeWidgetDate.getFullYear(), volumeWidgetDate.getMonth() + 1, 0).getDate();
                      const dayOfMonth = now.getDate();
                      const expectedVolume = (prevMonthVolume / daysInMonth) * dayOfMonth;
                      const difference = Math.round(monthlyVolume - expectedVolume);
                      if (difference >= 0) {
                        paceStatus = `🟢 +${difference}`;
                      } else {
                        paceStatus = `🔴 ${difference}`;
                      }
                    }
                    
                    return (
                      <div key={name} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{icon}</span>
                            <span className={`font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{name}</span>
                          </div>
                          <div className="text-right flex flex-col items-end">
                            <div className="flex items-baseline gap-1">
                              <span className={`font-bold text-xl ${isOverGoal ? 'text-green-400' : darkMode ? 'text-white' : 'text-gray-900'}`}>
                                {monthlyVolume}
                              </span>
                              {prevMonthVolume > 0 && (
                                <>
                                  <span className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>/</span>
                                  <span className={`text-sm font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{prevMonthVolume}</span>
                                </>
                              )}
                            </div>
                            {paceStatus && (
                              <div className="text-[10px] font-medium mt-0.5">{paceStatus}</div>
                            )}
                          </div>
                        </div>
                        <div className={`h-2 ${darkMode ? 'bg-gray-700' : 'bg-gray-300'} rounded-full overflow-hidden relative`}>
                          <div 
                            className={`h-full bg-gradient-to-r ${color} transition-all duration-500 ease-out ${isOverGoal ? 'animate-pulse' : ''}`}
                            style={{ width: `${percentage}%` }}
                          />
                          {isOverGoal && (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className="text-[8px] font-bold text-white drop-shadow-lg">GOAL EXCEEDED! 🎉</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              
              {/* Recent Workouts */}
              <div className="space-y-2">
                <h3 className={`text-sm font-bold ${darkMode ? 'text-gray-300' : 'text-gray-700'} uppercase tracking-wide`}>Recent Workouts</h3>
                {[...workouts].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 3).map((w, i) => {
                  const [year, month, day] = w.date.split('-');
                  const dateObj = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
                  const dayOfWeek = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
                  const isExpanded = expandedRecent === i;
                  
                  const locationColors = {
                    'Garage BW': 'border-blue-400',
                    'Manual': 'border-green-400',
                    'Garage 10': 'border-purple-400',
                    'BW-only': 'border-yellow-400',
                  };
                  const borderColor = locationColors[w.location] || 'border-gray-600';
                  
                  return (
                    <div key={i} className={`${darkMode ? 'bg-gray-800' : 'bg-white border border-gray-200'} rounded-xl border-l-[6px] ${borderColor} overflow-hidden shadow-md hover:shadow-xl transition-all`}>
                      <button
                        onClick={() => setExpandedRecent(isExpanded ? null : i)}
                        className={`w-full p-3 text-left transition-colors ${darkMode ? 'hover:bg-white/5' : 'hover:bg-gray-50'}`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-sm">
                              {dayOfWeek} {month}/{day}
                              {w.location && <span className={`ml-2 text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>· {w.location}</span>}
                            </div>
                            <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} mt-0.5`}>
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
                          {w.location === 'Day Off' && w.notes ? (
                            <div className={`${darkMode ? 'bg-yellow-900/20 border-yellow-700/50' : 'bg-yellow-50 border-yellow-300'} border rounded-lg p-3`}>
                              <div className="text-sm font-semibold text-yellow-600 mb-2">Rest Day</div>
                              <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{w.notes}</div>
                            </div>
                          ) : (
                            <>
                          {w.exercises.map((ex, ei) => {
                            const totalReps = ex.sets.reduce((sum, s) => sum + (s.reps || 0), 0);
                            return (
                              <div key={ei} className={`${darkMode ? 'bg-gray-700/50' : 'bg-gray-100'} rounded px-2 py-1.5 mb-1`}>
                                <div className="grid grid-cols-[120px_1fr_50px] gap-2 items-start text-xs">
                                  <div className="font-medium truncate">{ex.name}</div>
                                  <div className="flex items-center gap-1 flex-wrap">
                                    {ex.sets.map((s, si) => (
                                      <span key={si} className={`${darkMode ? 'bg-gray-600' : 'bg-gray-300'} px-1.5 py-0.5 rounded text-[11px]`}>
                                        {s.reps}
                                      </span>
                                    ))}
                                  </div>
                                  <div className="text-right font-bold">({totalReps})</div>
                                </div>
                                {ex.notes && (
                                  <div className="text-[10px] text-gray-400 mt-1 text-right">{ex.notes}</div>
                                )}
                              </div>
                            );
                          })}
                          {w.notes && w.location !== 'Day Off' && (
                            <div className="text-xs text-gray-400 mt-2 pt-2 border-t border-gray-700">
                              {w.notes}
                            </div>
                          )}
                            </>
                          )}
                          
                          {/* Collapse button at bottom */}
                          <button
                            onClick={() => setExpandedRecent(null)}
                            className={`w-full mt-3 ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'} py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2`}
                          >
                            <Icons.ChevronDown />
                            Collapse
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
          
          {view === 'list' && (
            <div className="space-y-2.5">
              <div className="flex items-center gap-2 mb-3">
                <div className="relative flex-1 max-w-md">
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search workouts..."
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-2 py-1.5 pl-8 text-sm"
                  />
                  <div className="absolute left-2 top-2 text-gray-400">
                    <Icons.Search />
                  </div>
                </div>
                <button
                  onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
                  className="bg-gray-800 hover:bg-gray-700 px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors"
                >
                  <span>Sort</span>
                  <div className="flex flex-col text-[10px] leading-none">
                    <span>↑</span>
                    <span>↓</span>
                  </div>
                </button>
              </div>
              
              {/* Collapsible Calendar & Expand/Collapse All */}
              <div className="mb-4 flex gap-2">
                <button
                  onClick={() => setShowLogCalendar(!showLogCalendar)}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 p-3 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md"
                >
                  <Icons.Calendar className="w-4 h-4" />
                  <span className="text-sm font-bold">Calendar</span>
                  <div className={`transform transition-transform ${showLogCalendar ? 'rotate-180' : ''}`}>
                    <Icons.ChevronDown className="w-4 h-4" />
                  </div>
                </button>
                <button
                  onClick={() => {
                    const allIndices = filtered().map((_, i) => i);
                    if (expandedLog.size === allIndices.length) {
                      setExpandedLog(new Set());
                    } else {
                      setExpandedLog(new Set(allIndices));
                    }
                  }}
                  className="bg-gray-800 hover:bg-gray-700 px-4 py-3 rounded-xl text-sm font-medium transition-colors whitespace-nowrap"
                >
                  {expandedLog.size === filtered().length ? 'Collapse All' : 'Expand All'}
                </button>
              </div>
              
              {showLogCalendar && (
                <div className="mb-4 mt-3 bg-gray-800 rounded-xl shadow-md overflow-hidden">
                    {/* Month/Year header - sticky */}
                    <div className="sticky top-0 bg-gray-800 border-b border-gray-700 px-4 py-3 z-10">
                      <div className="flex items-center justify-between">
                        <button
                          onClick={() => {
                            const newDate = new Date(logCalendarDate);
                            newDate.setMonth(newDate.getMonth() - 1);
                            setLogCalendarDate(newDate);
                          }}
                          className="bg-gray-700 hover:bg-gray-600 p-2 rounded-lg transition-colors"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                          </svg>
                        </button>
                        <div className="flex items-center gap-2 flex-1 justify-center">
                          <h3 className="font-bold text-lg whitespace-nowrap">
                            {logCalendarDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                          </h3>
                          {(() => {
                            const now = new Date();
                            const isCurrentMonth = logCalendarDate.getMonth() === now.getMonth() && 
                                                  logCalendarDate.getFullYear() === now.getFullYear();
                            if (!isCurrentMonth) {
                              return (
                                <button
                                  onClick={() => setLogCalendarDate(new Date())}
                                  className="bg-blue-600 hover:bg-blue-700 px-2 py-1 rounded text-xs font-medium whitespace-nowrap"
                                >
                                  Today
                                </button>
                              );
                            }
                          })()}
                        </div>
                        <button
                          onClick={() => {
                            const newDate = new Date(logCalendarDate);
                            newDate.setMonth(newDate.getMonth() + 1);
                            setLogCalendarDate(newDate);
                          }}
                          className="bg-gray-700 hover:bg-gray-600 p-2 rounded-lg transition-colors"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    
                    {/* Scrollable calendar content */}
                    <div className="p-3 max-h-[350px] overflow-y-auto">
                      {/* Day headers */}
                      <div className="grid grid-cols-7 gap-1 mb-2">
                        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                          <div key={day} className="text-center text-xs text-gray-500 font-bold uppercase tracking-wider">
                            {day}
                          </div>
                        ))}
                      </div>

                      {/* Calendar days */}
                      <div className="grid grid-cols-7 gap-1">
                      {(() => {
                        const now = new Date();
                        const year = logCalendarDate.getFullYear();
                        const month = logCalendarDate.getMonth();
                        let firstDay = new Date(year, month, 1).getDay();
                        firstDay = firstDay === 0 ? 6 : firstDay - 1;
                        const daysInMonth = new Date(year, month + 1, 0).getDate();
                        const days = [];

                        // Empty cells
                        for (let i = 0; i < firstDay; i++) {
                          days.push(<div key={`empty-${i}`} className="aspect-square" />);
                        }

                        // Days
                        for (let day = 1; day <= daysInMonth; day++) {
                          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                          const dayWorkouts = workouts.filter(w => w.date === dateStr);
                          const hasWorkout = dayWorkouts.length > 0;
                          
                          const locationColors = {
                            'Garage BW': 'border-blue-400',
                            'Manual': 'border-green-400',
                            'Garage 10': 'border-purple-400',
                            'BW-only': 'border-yellow-400',
                          };
                          let borderColor = 'border-gray-600';
                          if (hasWorkout) {
                            borderColor = locationColors[dayWorkouts[0].location] || 'border-gray-600';
                          }

                          // Only highlight today if we're viewing the current month
                          const isToday = day === now.getDate() && 
                                         month === now.getMonth() && 
                                         year === now.getFullYear();

                          days.push(
                            <button
                              key={day}
                              onClick={() => {
                                if (hasWorkout) {
                                  // Set selected day and scroll to workout
                                  setSelectedLogDay(dateStr);
                                  
                                  // Find and expand the workout
                                  const workoutIndex = filtered().findIndex(w => w.date === dateStr);
                                  if (workoutIndex >= 0) {
                                    const newExpanded = new Set(expandedLog);
                                    newExpanded.add(workoutIndex);
                                    setExpandedLog(newExpanded);
                                    
                                    // Scroll to workout after expansion
                                    setTimeout(() => {
                                      const element = document.querySelector(`[data-workout-date="${dateStr}"]`);
                                      if (element) {
                                        const rect = element.getBoundingClientRect();
                                        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
                                        const targetY = rect.top + scrollTop - 80;
                                        window.scrollTo({ top: targetY, behavior: 'smooth' });
                                      }
                                    }, 300);
                                  }
                                }
                              }}
                              className={`aspect-square rounded border-2 flex items-center justify-center text-sm
                                ${hasWorkout ? `${borderColor} bg-gray-700 font-bold` : 'border-gray-700 bg-gray-800'}
                                ${isToday ? 'ring-2 ring-blue-400' : ''}
                                ${selectedLogDay === dateStr ? 'ring-2 ring-white' : ''}
                                ${hasWorkout ? 'hover:bg-gray-600' : ''}
                                transition-colors
                              `}
                            >
                              {day}
                            </button>
                          );
                        }

                        return days;
                      })()}
                    </div>
                    {/* Close scrollable container */}
                  </div>
                  {/* Close outer container */}
                </div>
              )}

              {filtered().map((w, i) => {
                // Parse date without timezone issues
                const [year, month, day] = w.date.split('-');
                const dateObj = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
                const dayOfWeek = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
                const isExpanded = expandedLog.has(i);
                
                // Color-code by workout location
                const locationColors = {
                  'Garage BW': 'border-blue-400',
                  'Manual': 'border-green-400',
                  'Garage 10': 'border-purple-400',
                  'BW-only': 'border-yellow-400',
                };
                const borderColor = locationColors[w.location] || 'border-gray-600';
                
                return (
                  <div key={i} data-workout-date={w.date} className={`${darkMode ? 'bg-gray-800' : 'bg-white border border-gray-200'} rounded-xl border-l-[6px] ${borderColor} shadow-md hover:shadow-lg transition-shadow overflow-hidden`}>
                    <button
                      onClick={(e) => {
                        const newExpanded = new Set(expandedLog);
                        if (newExpanded.has(i)) {
                          newExpanded.delete(i);
                        } else {
                          const element = e.currentTarget.closest('[data-workout-date]');
                          newExpanded.add(i);
                          setExpandedLog(newExpanded);
                          
                          // Scroll this workout to top when expanding - wait for DOM update
                          requestAnimationFrame(() => {
                            requestAnimationFrame(() => {
                              setTimeout(() => {
                                if (element) {
                                  const rect = element.getBoundingClientRect();
                                  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
                                  const targetY = rect.top + scrollTop - 80; // 80px offset from top
                                  window.scrollTo({ top: targetY, behavior: 'smooth' });
                                }
                              }, 100);
                            });
                          });
                          return; // Exit early since we already called setExpandedLog
                        }
                        setExpandedLog(newExpanded);
                      }}
                      className={`w-full p-3 text-left transition-colors ${darkMode ? 'hover:bg-white/5' : 'hover:bg-gray-50'}`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-bold text-base">
                            {dayOfWeek} {month}/{day}
                            {w.location && <span className="ml-2 text-sm font-medium">· {w.location}</span>}
                          </div>
                          <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} mt-0.5`}>
                            {w.exercises.length} exercise{w.exercises.length !== 1 ? 's' : ''}
                          </div>
                        </div>
                        <div className={`transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                          <Icons.ChevronDown />
                        </div>
                      </div>
                    </button>
                    
                    {isExpanded && (
                      <div className={`px-3 pb-3 space-y-2 ${darkMode ? 'border-gray-700' : 'border-gray-200'} border-t pt-2`}>
                        <div className="flex gap-3 mb-2">
                          <button
                            onClick={() => copyToSheets(w)}
                            className="text-blue-400 hover:text-blue-300 p-1 text-xs flex items-center gap-1"
                            title="Copy to clipboard"
                          >
                            <Icons.Copy className="w-4 h-4" />
                            Copy
                          </button>
                          <button
                            onClick={() => editWorkout(i)}
                            className="text-green-400 hover:text-green-300 p-1 text-xs flex items-center gap-1"
                          >
                            <Icons.Edit className="w-4 h-4" />
                            Edit
                          </button>
                          <button
                            onClick={() => setDeleteWorkout(i)}
                            className="text-red-400 hover:text-red-300 p-1 text-xs flex items-center gap-1"
                          >
                            <Icons.Trash className="w-4 h-4" />
                            Delete
                          </button>
                        </div>
                    
                    {w.location === 'Day Off' && w.notes ? (
                      <div className={`${darkMode ? 'bg-yellow-900/20 border-yellow-700/50' : 'bg-yellow-50 border-yellow-300'} border rounded-lg p-3`}>
                        <div className="text-sm font-semibold text-yellow-600 mb-2">Rest Day</div>
                        <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{w.notes}</div>
                      </div>
                    ) : (
                      <>
                    <div className="space-y-1">
                      {w.exercises.map((ex, ei) => {
                        const totalReps = ex.sets.reduce((sum, s) => sum + (s.reps || 0), 0);
                        return (
                          <div key={ei} className={`${darkMode ? 'bg-gray-700/50' : 'bg-gray-100'} rounded px-2 py-1.5`}>
                            <div className="grid grid-cols-[120px_1fr_50px] gap-2 items-start text-xs">
                              <div className="font-medium truncate">{ex.name}</div>
                              <div className="flex items-center gap-1 flex-wrap">
                                {ex.sets.map((s, si) => (
                                  <span key={si} className={`${darkMode ? 'bg-gray-600' : 'bg-gray-300'} px-1.5 py-0.5 rounded text-[11px]`}>
                                    {s.reps}
                                  </span>
                                ))}
                              </div>
                              <div className="text-right font-bold">({totalReps})</div>
                            </div>
                            {ex.notes && (
                              <div className={`text-[10px] ${darkMode ? 'text-gray-400' : 'text-gray-600'} mt-1 text-right`}>{ex.notes}</div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    
                    {w.notes && w.location !== 'Day Off' && (
                      <div className="mt-2 text-xs text-gray-400 border-t border-gray-700 pt-1.5">{w.notes}</div>
                    )}
                      </>
                    )}
                        
                        {/* Collapse button at bottom */}
                        <button
                          onClick={() => {
                            const newExpanded = new Set(expandedLog);
                            newExpanded.delete(i);
                            setExpandedLog(newExpanded);
                          }}
                          className={`w-full mt-3 ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'} py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2`}
                        >
                          <Icons.ChevronDown />
                          Collapse
                        </button>
                      </div>
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
          
          {view === 'settings' && (
            <div className="space-y-3">
              <h2 className="text-base font-semibold mb-2">Settings</h2>
              <div className="flex gap-2 mb-3">
                <label className="cursor-pointer bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 px-4 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 shadow-md transition-all">
                  <Icons.Upload />
                  Import Presets
                  <input type="file" accept=".csv" onChange={importPresets} className="hidden" />
                </label>
                <label className="cursor-pointer bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 px-4 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 shadow-md transition-all">
                  <Icons.Upload />
                  Import Workouts
                  <input type="file" accept=".csv" onChange={importWorkouts} className="hidden" />
                </label>
              </div>
              <div className="flex gap-2 mb-3">
                <button onClick={exportCSV} className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 px-4 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 shadow-md transition-all">
                  <Icons.Download />
                  Export All Data
                </button>
                <button 
                  onClick={() => {
                    const csvContent = exportCSV(true);
                    const subject = encodeURIComponent('GORS LOG - Workout Data');
                    const body = encodeURIComponent(`Here is my workout data from GORS LOG:\n\n${csvContent}`);
                    window.location.href = `mailto:?subject=${subject}&body=${body}`;
                  }}
                  className="bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 px-4 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 shadow-md transition-all"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Email Data
                </button>
              </div>
              <div className="text-xs text-gray-400 mb-3 px-1">
                Email button sends all workout data in CSV format
              </div>
              <div className="bg-gray-800 p-3 rounded-lg mb-3">
                <label className="flex items-center gap-2 cursor-pointer mb-3">
                  <input
                    type="checkbox"
                    checked={autoEmail}
                    onChange={(e) => {
                      setAutoEmail(e.target.checked);
                      save(e.target.checked, 'autoEmail', setAutoEmail);
                    }}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">Auto-email after saving each workout</span>
                </label>
                {autoEmail && (
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Email Address</label>
                    <input
                      type="email"
                      value={emailAddress}
                      onChange={(e) => {
                        setEmailAddress(e.target.value);
                        save(e.target.value, 'emailAddress', setEmailAddress);
                      }}
                      placeholder="your@email.com"
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm"
                    />
                  </div>
                )}
              </div>
              <div className="flex gap-2 mb-3">
                <button onClick={() => setShowClear(true)} className="bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 px-4 py-2.5 rounded-lg text-sm font-semibold shadow-md transition-all w-full">
                  Delete All Workouts
                </button>
              </div>
              
              <div className="mt-4">
                <button
                  onClick={() => setShowPresetsMenu(!showPresetsMenu)}
                  className="w-full bg-gray-800 hover:bg-gray-700 p-3 rounded-lg flex items-center justify-between transition-colors"
                >
                  <span className="text-sm font-semibold">Workout Presets ({presets.length})</span>
                  <div className={`transform transition-transform ${showPresetsMenu ? 'rotate-180' : ''}`}>
                    <Icons.ChevronDown />
                  </div>
                </button>
                
                {showPresetsMenu && (
                  <div className="mt-2 space-y-2">
                    {presets.map((p, i) => (
                      <div key={i} className="bg-gray-800 p-3 rounded-lg flex items-center justify-between shadow-sm">
                        <button
                          onClick={() => {
                            setEditingPreset(i);
                            setEditPresetName(p.name);
                            setEditPresetExercises([...p.exercises]);
                          }}
                          className="flex-1 text-left flex items-center gap-2"
                        >
                          <div className="flex-1">
                            <div className="font-medium">{p.name}</div>
                            <div className="text-xs text-gray-400">{p.exercises.join(', ')}</div>
                          </div>
                          <Icons.Edit className="w-4 h-4 text-gray-400" />
                        </button>
                        <button
                          onClick={() => setDeletePreset(i)}
                          className="text-red-400 hover:text-red-300 ml-2"
                        >
                          <Icons.Trash />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
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
                    <div className="mt-4 text-sm text-gray-400 border-t border-gray-700 pt-3">
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
                      // Reset timer for new workout
                      setWorkoutStarted(false);
                      setWorkoutTimer(0);
                      setTimerRunning(false);
                    }}
                    className="w-full bg-gray-700 hover:bg-gray-600 p-4 rounded-lg text-left"
                  >
                    <div className="font-medium text-base mb-1">{p.name}</div>
                    {p.name === 'Manual' ? (
                      <div className="text-xs text-gray-400">Build your own</div>
                    ) : p.exercises.length > 0 && (
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
            className="fixed inset-0 bg-black bg-opacity-50 z-50"
            onClick={() => {
              if (current.exercises.length > 0) {
                setShowCloseConfirm(true);
              } else {
                setShowWorkoutModal(false);
              }
            }}
          >
            <div 
              className="fixed inset-x-0 top-0 bottom-0 bg-gray-900 overflow-y-auto flex flex-col" 
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
                {/* Hide exercises for Day Off */}
                {current.location !== 'Day Off' && (
                  <>
                {/* View mode toggle */}
                <div className="flex gap-2 bg-gray-800 p-1 rounded-lg">
                  <button
                    onClick={() => setWorkoutViewMode('table')}
                    className={`flex-1 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                      workoutViewMode === 'table' 
                        ? 'bg-blue-600 text-white shadow-md' 
                        : 'text-gray-400 hover:text-gray-200'
                    }`}
                  >
                    Table View
                  </button>
                  <button
                    onClick={() => setWorkoutViewMode('cards')}
                    className={`flex-1 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                      workoutViewMode === 'cards' 
                        ? 'bg-blue-600 text-white shadow-md' 
                        : 'text-gray-400 hover:text-gray-200'
                    }`}
                  >
                    Card View
                  </button>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Date</label>
                    <input
                      type="text"
                      value={current.date}
                      onChange={(e) => setCurrent({ ...current, date: e.target.value })}
                      placeholder="YYYY-MM-DD"
                      className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Workout</label>
                    <select
                      value={current.location}
                      onChange={(e) => {
                        const selectedPreset = presets.find(p => p.name === e.target.value);
                        if (selectedPreset) {
                          loadPreset(selectedPreset);
                        } else {
                          setCurrent({ ...current, location: e.target.value });
                        }
                      }}
                      className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
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
                                disabled={!workoutStarted}
                                placeholder="0"
                                className="w-[40px] bg-gray-800 border border-gray-700 rounded px-1 py-1 text-[11px] text-center flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
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
                                  disabled={!workoutStarted}
                                  placeholder="0"
                                  className="w-12 bg-gray-700 border border-gray-600 rounded px-1 py-1 text-[11px] text-center disabled:opacity-50 disabled:cursor-not-allowed"
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
                              className="flex flex-col items-center justify-end"
                            >
                              <div className="text-[10px] text-transparent mb-0.5">.</div>
                              <div className="text-blue-400 hover:text-blue-300 text-xs px-2 py-1 bg-gray-700 rounded">
                                +
                              </div>
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
                  className="w-full bg-gray-800 hover:bg-gray-700 py-3 rounded-xl border-2 border-dashed border-gray-600 hover:border-blue-500 text-sm font-semibold transition-all flex items-center justify-center gap-2"
                >
                  <span className="text-lg">+</span>
                  Add Exercise
                </button>
                  </>
                )}

                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">
                    {current.location === 'Day Off' ? 'Rest Day Notes' : 'Workout Notes'}
                  </label>
                  <textarea
                    value={current.notes}
                    onChange={(e) => setCurrent({ ...current, notes: e.target.value })}
                    placeholder={current.location === 'Day Off' ? 'Why did you skip today?' : 'How did it go? Any PRs or notes to remember...'}
                    className={`w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors resize-none ${
                      current.location === 'Day Off' ? 'h-40' : 'h-24'
                    }`}
                  />
                </div>
              </div>
              
              {/* Footer with Timer Button */}
              <div className="sticky bottom-0 bg-gradient-to-t from-gray-900 via-gray-900 to-transparent border-t border-gray-700/50 p-4">
                {!workoutStarted ? (
                  <button
                    onClick={() => {
                      setWorkoutStarted(true);
                      setTimerRunning(true);
                    }}
                    className="w-full bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 py-4 rounded-xl font-bold text-lg shadow-lg shadow-green-500/30 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                  >
                    <span className="text-2xl">▶</span>
                    Start Workout
                  </button>
                ) : timerRunning ? (
                  <button
                    onClick={() => {
                      setTimerRunning(false);
                      setShowPauseMenu(true);
                    }}
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 py-4 rounded-xl font-bold text-lg shadow-lg shadow-blue-500/30 transition-all active:scale-[0.98] flex flex-col items-center"
                  >
                    <span className="text-3xl font-mono tracking-wider">{formatTime(workoutTimer)}</span>
                    <span className="text-xs font-normal opacity-75 mt-0.5">Tap to pause</span>
                  </button>
                ) : (
                  <div className="space-y-2">
                    <div className="text-center mb-3">
                      <div className="text-4xl font-mono font-bold text-blue-400">{formatTime(workoutTimer)}</div>
                      <div className="text-xs text-gray-500 mt-1">Workout paused</div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setTimerRunning(true)}
                        className="bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 py-3 rounded-xl font-semibold shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                      >
                        <span className="text-xl">▶</span>
                        Continue
                      </button>
                      <button
                        onClick={() => setShowEndWorkoutConfirm(true)}
                        className="bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 py-3 rounded-xl font-semibold shadow-md transition-all active:scale-[0.98]"
                      >
                        End Workout
                      </button>
                    </div>
                  </div>
                )}
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
                    'Garage BW': 'border-blue-400',
                    'Manual': 'border-green-400',
                    'Garage 10': 'border-purple-400',
                    'BW-only': 'border-yellow-400',
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
        
        {/* Toast Notification */}
        {showToast && (
          <div className="fixed bottom-24 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-4 py-3 rounded-lg shadow-lg z-50 animate-fade-in">
            {toastMessage}
          </div>
        )}
        
        {/* Bottom Navigation */}
        <div className={`fixed bottom-0 left-0 right-0 ${darkMode ? 'bg-gray-800/95 border-gray-700/50' : 'bg-gray-100/95 border-gray-300'} backdrop-blur-sm border-t safe-area-pb shadow-2xl pb-2`}>
          <div className="max-w-4xl mx-auto flex">
            <button
              onClick={() => {
                setView('calendar');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`flex-1 py-4 transition-colors ${view === 'calendar' ? 'text-blue-400' : darkMode ? 'text-gray-500 hover:text-gray-300' : 'text-gray-600 hover:text-gray-800'}`}
            >
              <div className="flex flex-col items-center">
                <Icons.Calendar className={view === 'calendar' ? 'scale-110' : ''} />
                <span className={`text-xs mt-1 font-medium ${view === 'calendar' ? 'font-bold' : ''}`}>Home</span>
              </div>
            </button>
            <button
              onClick={() => {
                setView('list');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`flex-1 py-4 transition-colors ${view === 'list' ? 'text-blue-400' : darkMode ? 'text-gray-500 hover:text-gray-300' : 'text-gray-600 hover:text-gray-800'}`}
            >
              <div className="flex flex-col items-center">
                <Icons.Calendar className={view === 'list' ? 'scale-110' : ''} />
                <span className={`text-xs mt-1 font-medium ${view === 'list' ? 'font-bold' : ''}`}>Log</span>
              </div>
            </button>
            <button
              onClick={() => {
                setView('stats');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`flex-1 py-4 transition-colors ${view === 'stats' ? 'text-blue-400' : darkMode ? 'text-gray-500 hover:text-gray-300' : 'text-gray-600 hover:text-gray-800'}`}
            >
              <div className="flex flex-col items-center">
                <Icons.TrendingUp className={view === 'stats' ? 'scale-110' : ''} />
                <span className={`text-xs mt-1 font-medium ${view === 'stats' ? 'font-bold' : ''}`}>Stats</span>
              </div>
            </button>
            <button
              onClick={() => {
                setView('settings');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`flex-1 py-4 transition-colors ${view === 'settings' ? 'text-blue-400' : darkMode ? 'text-gray-500 hover:text-gray-300' : 'text-gray-600 hover:text-gray-800'}`}
            >
              <div className="flex flex-col items-center">
                <Icons.Settings className={view === 'settings' ? 'scale-110' : ''} />
                <span className={`text-xs mt-1 font-medium ${view === 'settings' ? 'font-bold' : ''}`}>Settings</span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
