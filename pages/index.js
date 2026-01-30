import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { Icons } from '../components/Icons.js';
import { NutritionLogic } from '../components/Nutrition.js';
import { StatsLogic } from '../components/StatsLogic.js';
import { WorkoutPresets } from '../data/WorkoutPresets.js';
import { StorageService } from '../services/StorageService.js';
import { SettingsView } from '../components/SettingsView.js';

export default function Home() {
  const [workouts, setWorkouts] = useState([]);
  const [presets, setPresets] = useState([]);
  const [exercises, setExercises] = useState([]);
  const [view, setView] = useState('home'); // 'home' (calendar/log), 'stats', 'settings', 'test'
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState('dark'); // 'light', 'dark', 'neon', 'forest'
  const [showHomeV1, setShowHomeV1] = useState(false); // Toggle for old Home view
  const [proteinEntries, setProteinEntries] = useState([]); // Protein tracking: [{date, grams, food, timestamp}]
  const [showNew, setShowNew] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState(null); // For exercise detail view
  const [statsView, setStatsView] = useState('menu'); // 'menu', 'exercises', 'weight', 'protein'
  const [weightEntries, setWeightEntries] = useState([]); // Weight tracking data
  const [showWeightModal, setShowWeightModal] = useState(false);
  const [editingWeight, setEditingWeight] = useState(null);
  const [currentWeight, setCurrentWeight] = useState({ date: '', weight: '', notes: '' });
  const [deleteWeight, setDeleteWeight] = useState(null);
  const [weightCalendarMonth, setWeightCalendarMonth] = useState(new Date().getMonth());
  const [weightCalendarYear, setWeightCalendarYear] = useState(new Date().getFullYear());
  const [editing, setEditing] = useState(null);
  
  // Theme definitions
  const themes = {
    light: {
      name: 'Light',
      bg: 'bg-gray-50',
      text: 'text-gray-900',
      cardBg: 'bg-white',
      cardBorder: 'border-gray-200',
      inputBg: 'bg-white',
      inputBorder: 'border-gray-300',
      headerGradient: 'from-gray-100 to-gray-200',
      headerBorder: 'border-gray-300',
      accent: 'blue',
      isDark: false
    },
    dark: {
      name: 'Dark',
      bg: 'bg-gray-900',
      text: 'text-white',
      cardBg: 'bg-gray-800',
      cardBorder: 'border-gray-700',
      inputBg: 'bg-gray-800',
      inputBorder: 'border-gray-600',
      headerGradient: 'from-gray-800 to-gray-900',
      headerBorder: 'border-gray-700/50',
      accent: 'blue',
      isDark: true
    },
    neon: {
      name: 'Neon',
      bg: 'bg-black',
      text: 'text-green-50',
      cardBg: 'bg-zinc-950',
      cardBorder: 'border-green-500/30',
      inputBg: 'bg-zinc-950',
      inputBorder: 'border-green-500/50',
      headerGradient: 'from-zinc-950 to-black',
      headerBorder: 'border-green-500/50',
      accent: 'green',
      isDark: true
    },
    forest: {
      name: 'Forest',
      bg: 'bg-green-950',
      text: 'text-green-50',
      cardBg: 'bg-green-800',
      cardBorder: 'border-green-600',
      inputBg: 'bg-green-800',
      inputBorder: 'border-green-500',
      headerGradient: 'from-green-700 to-green-900',
      headerBorder: 'border-green-400/50',
      accent: 'green',
      isDark: true
    }
  };
  
  // Safety check - if theme is invalid (e.g., old 'midnight' value), default to 'dark'
  const currentTheme = themes[theme] || themes.dark;
  const darkMode = currentTheme.isDark; // For backwards compatibility
  
  const [showSettings, setShowSettings] = useState(false);
  const [sortOrder, setSortOrder] = useState('desc');
  const [search, setSearch] = useState('');
  const [showClear, setShowClear] = useState(false);
  const [showBackups, setShowBackups] = useState(false);
  const [backupsList, setBackupsList] = useState([]);
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
  
  // Scroll to expanded recent workout
  const [expandedLog, setExpandedLog] = useState(new Set());
  const [showWorkoutModal, setShowWorkoutModal] = useState(false);
  const [showPresetSelector, setShowPresetSelector] = useState(false);
  const [showDataManagement, setShowDataManagement] = useState(false);
  const [showDataDeletion, setShowDataDeletion] = useState(false);
  const [searchExpanded, setSearchExpanded] = useState(false);
  const [showLogCalendar, setShowLogCalendar] = useState(true); // Default to open
  const [logCalendarDate, setLogCalendarDate] = useState(new Date());
  const [showPresetsMenu, setShowPresetsMenu] = useState(false);
  const [showExercisesMenu, setShowExercisesMenu] = useState(false);
  const [showProteinExpanded, setShowProteinExpanded] = useState(false);
  const [editingProteinDate, setEditingProteinDate] = useState(null); // Date string for editing past protein
  const [showAddProtein, setShowAddProtein] = useState(false);
  const [editingProteinEntry, setEditingProteinEntry] = useState(null); // {timestamp, grams, food} for editing
  const [draggedPreset, setDraggedPreset] = useState(null);
  const [selectedLogDay, setSelectedLogDay] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [showCalendarLegend, setShowCalendarLegend] = useState(false);  const [showEndWorkoutConfirm, setShowEndWorkoutConfirm] = useState(false);
  const [editingPreset, setEditingPreset] = useState(null);
  const [editPresetName, setEditPresetName] = useState('');
  const [editPresetExercises, setEditPresetExercises] = useState([]);
  const [editPresetColor, setEditPresetColor] = useState('Blue');
  const [editPresetIncludeInMenu, setEditPresetIncludeInMenu] = useState(true);
  const [showSaveAsPreset, setShowSaveAsPreset] = useState(false);
  const [showCreatePreset, setShowCreatePreset] = useState(false);
  const [newPresetName, setNewPresetName] = useState('');
  const [newPresetExercises, setNewPresetExercises] = useState([]);
  const [newPresetColor, setNewPresetColor] = useState('Blue');
  const [newPresetIncludeInMenu, setNewPresetIncludeInMenu] = useState(true);
  const [volumeWidgetDate, setVolumeWidgetDate] = useState(new Date());
  const [workoutStarted, setWorkoutStarted] = useState(false);
  const [timerRunning, setTimerRunning] = useState(false);
  const [showPauseMenu, setShowPauseMenu] = useState(false);
  const [workoutTimer, setWorkoutTimer] = useState(0);
  const [pausedTime, setPausedTime] = useState(0); // Track accumulated paused time
  const [lastStartTime, setLastStartTime] = useState(null); // Track when timer last started
  
  // Timer effect - properly handles pause/resume
  useEffect(() => {
    let interval;
    if (timerRunning && lastStartTime) {
      const updateTimer = () => {
        const currentElapsed = Math.floor((Date.now() - lastStartTime) / 1000);
        setWorkoutTimer(pausedTime + currentElapsed);
      };
      
      updateTimer(); // Initial update
      interval = setInterval(updateTimer, 1000);
    }
    return () => clearInterval(interval);
  }, [timerRunning, lastStartTime, pausedTime]);
  
  // Format timer display
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${String(secs).padStart(2, '0')}`;
  };
  
  // Format elapsed time as hh:mm:ss
  const formatTimeHHMMSS = (seconds) => {
    if (!seconds) return null;
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };
  
  // Color palette for workout presets
  const presetColors = WorkoutPresets.colors;
  
  // Get color classes for a preset
  const getPresetColor = (presetName) => {
    const preset = presets.find(p => p.name === presetName);
    if (preset && preset.color) {
      return presetColors.find(c => c.name === preset.color) || presetColors[0];
    }
    // Legacy fallback for old presets without colors
    const legacyColors = {
      'Garage BW': presetColors[0], // Blue
      'Manual': presetColors[2], // Green
      'Garage 10': presetColors[1], // Purple
      'BW-only': presetColors[3], // Yellow
    };
    return legacyColors[presetName] || presetColors[0];
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
    location: '',
    structure: '', // 'pairs' or 'circuit'
    structureDuration: '' // '3', '4', '5' for pairs duration
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const loadData = () => {
        const w = localStorage.getItem('workouts');
        const p = localStorage.getItem('presets');
        const e = localStorage.getItem('exercises');
        const t = localStorage.getItem('theme');
        const dm = localStorage.getItem('darkMode'); 
        const we = localStorage.getItem('weightEntries');
        const hv1 = localStorage.getItem('showHomeV1');
        const pe = localStorage.getItem('proteinEntries');

        if (w) setWorkouts(JSON.parse(w));
        
        // Updated Preset Logic
        if (p) {
          setPresets(JSON.parse(p));
        } else {
          setPresets(WorkoutPresets.routines);
        }

        // Updated Exercises Logic
        if (e) {
          setExercises(JSON.parse(e));
        } else {
          setExercises(WorkoutPresets.exerciseLibrary);
        }

        if (t) {
          const loadedTheme = t === 'midnight' ? 'neon' : t;
          setTheme(loadedTheme);
        } else if (dm !== null) {
          setTheme(JSON.parse(dm) ? 'dark' : 'light');
        }
        if (we) setWeightEntries(JSON.parse(we));
        if (hv1) setShowHomeV1(JSON.parse(hv1));
        if (pe) setProteinEntries(JSON.parse(pe));
      };
      
      loadData();
      
      setTimeout(() => {
        setLoading(false);
      }, 2000);
    }
  }, []); // <--- Ensure this line has exactly this: }, []);
  
  // Auto-backup system (every 7 days)
  useEffect(() => {
    if (typeof window === 'undefined' || workouts.length === 0) return;
    
    const createBackup = async () => {
      try {
        const backup = {
          timestamp: Date.now(),
          workouts: workouts,
          presets: presets,
          weightEntries: weightEntries,
          exercises: exercises
        };
        
        // Open IndexedDB
        const request = indexedDB.open('GorsLogBackups', 1);
        
        request.onupgradeneeded = (e) => {
          const db = e.target.result;
          if (!db.objectStoreNames.contains('backups')) {
            db.createObjectStore('backups', { keyPath: 'timestamp' });
          }
        };
        
        request.onsuccess = (e) => {
          const db = e.target.result;
          const transaction = db.transaction(['backups'], 'readwrite');
          const store = transaction.objectStore('backups');
          
          // Add new backup
          store.add(backup);
          
          // Prune old backups (keep last 5)
          const getAllRequest = store.getAll();
          getAllRequest.onsuccess = () => {
            const allBackups = getAllRequest.result.sort((a, b) => b.timestamp - a.timestamp);
            if (allBackups.length > 5) {
              const toDelete = allBackups.slice(5);
              toDelete.forEach(b => {
                store.delete(b.timestamp);
              });
            }
          };
          
         localStorage.setItem('lastBackup', backup.timestamp.toString());
          console.log('Backup created:', new Date(backup.timestamp).toLocaleString());
        };
      } catch (err) {
        console.error('Backup failed:', err);
      }
    };
    createBackup(); // Added this
  }, [workouts, presets, weightEntries, exercises]); // Added this to close the first useEffect
  
  const importWorkouts = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const lines = ev.target.result.split('\n').map(l => l.trim()).filter(l => l);
      const imp = [];
      let currentWorkout = null;
      let workoutLocation = '';
      
      // The rest of your logic follows...
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

  const saveWorkout = (elapsedTime = null) => {
    // Allow Day Off workouts with zero exercises if they have notes or location
    if (!current.exercises.length && !current.notes && current.location !== 'Day Off') return;
    
    // Add elapsed time if provided
    const workoutToSave = elapsedTime !== null ? { ...current, elapsedTime } : current;
    
    let ws;
    if (editing !== null) {
      ws = [...workouts];
      ws[editing] = workoutToSave;
      setEditing(null);
    } else {
      ws = [workoutToSave, ...workouts];
    }
    save(ws, 'workouts', setWorkouts);
    
    setCurrent({
      date: getTodayDate(),
      exercises: [],
      notes: '',
      location: '',
      structure: '',
      structureDuration: ''
    });
    setShowNew(false);
  };

  const editWorkout = (i) => {
    setCurrent(JSON.parse(JSON.stringify(workouts[i])));
    setEditing(i);
    setShowWorkoutModal(true);
    setWorkoutStarted(true); // Enable editing of reps
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

  const shareWorkout = async (w) => {
    // Format workout data in readable format
    const d = new Date(w.date);
    const dateStr = d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
    
    let shareText = `GORS LOG - ${w.location || 'Workout'}\n`;
    shareText += `${dateStr}\n`;
    if (w.elapsedTime) {
      shareText += `Duration: ${formatTimeHHMMSS(w.elapsedTime)}\n`;
    }
    shareText += `\n`;
    
    w.exercises.forEach((ex) => {
      const sets = ex.sets.map(s => s.reps || 0).join(', ');
      const total = ex.sets.reduce((sum, s) => sum + (s.reps || 0), 0);
      shareText += `${ex.name}: ${sets} (Total: ${total})`;
      if (ex.notes) shareText += ` - ${ex.notes}`;
      shareText += `\n`;
    });
    
    if (w.notes) {
      shareText += `\nNotes: ${w.notes}`;
    }
    
    // Try Web Share API (native iOS share sheet)
    if (navigator.share) {
      try {
        await navigator.share({
          title: `GORS LOG - ${w.location || 'Workout'}`,
          text: shareText
        });
      } catch (err) {
        // User cancelled or error - ignore
        if (err.name !== 'AbortError') {
          console.error('Share failed:', err);
          // Fallback to clipboard
          navigator.clipboard.writeText(shareText);
          setToastMessage('Copied to clipboard!');
          setShowToast(true);
          setTimeout(() => setShowToast(false), 3000);
        }
      }
    } else {
      // Fallback for browsers without Web Share API
      navigator.clipboard.writeText(shareText);
      setToastMessage('Copied to clipboard!');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }
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
          // Get start of current week (Monday)
          const dayOfWeek = now.getDay();
          const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // If Sunday, go back 6 days; otherwise back to Monday
          const weekStart = new Date(now);
          weekStart.setDate(now.getDate() + diff);
          weekStart.setHours(0, 0, 0, 0);
          
          return workoutDate >= weekStart && workoutDate <= today;
        } else if (historyFilter === 'month') {
          // Get start of current month
          const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
          
          return workoutDate >= monthStart && workoutDate <= today;
        } else if (historyFilter === 'year') {
          // Get start of current year
          const yearStart = new Date(now.getFullYear(), 0, 1);
          
          return workoutDate >= yearStart && workoutDate <= today;
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
    
    // Always sort newest first
    return [...f].sort((a, b) => b.date.localeCompare(a.date));
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
    // Simple text-only loading screen
    return (
      <div className={`min-h-screen ${currentTheme.bg} ${currentTheme.text} flex flex-col items-center justify-center`}>
        <div className="text-center">
          <h1 className="text-6xl font-black tracking-tight mb-4">
            GORS
          </h1>
          <div className={`w-20 h-1 mx-auto mb-6 ${
            theme === 'neon' ? 'bg-green-500' : 
            theme === 'forest' ? 'bg-emerald-500' : 
            theme === 'sunset' ? 'bg-orange-500' : 
            'bg-blue-500'
          }`}></div>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} font-medium tracking-widest`}>
            BE ABOUT IT
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>GORS LOG</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <style>{`
          @keyframes slowPulse {
            0%, 100% { opacity: 0.3; transform: scale(0.8); }
            50% { opacity: 1; transform: scale(1.3); }
          }
          .loading-dot-1 {
            animation: slowPulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
            animation-delay: 0s;
          }
          .loading-dot-2 {
            animation: slowPulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
            animation-delay: 0.5s;
          }
          .loading-dot-3 {
            animation: slowPulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
            animation-delay: 1s;
          }
          
          /* New loading animations */
          @keyframes spin-slow {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          .animate-spin-slow {
            animation: spin-slow 8s linear infinite;
          }
          
          @keyframes pulse-slow {
            0%, 100% { opacity: 0.3; transform: scale(0.95); }
            50% { opacity: 0.6; transform: scale(1.05); }
          }
          .animate-pulse-slow {
            animation: pulse-slow 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
          }
          
          @keyframes slide-right {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
          }
          .animate-slide-right {
            animation: slide-right 1.5s ease-in-out infinite;
          }
        `}</style>
      </Head>
      
      <div className={`min-h-screen ${currentTheme.bg} ${currentTheme.text}`}>
        {showClear && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 max-w-md border-2 border-red-500/50`}>
              <h3 className="text-2xl font-bold mb-3 text-red-400">⚠️ Delete All Workouts?</h3>
              <p className="mb-2 text-base">This will permanently delete <strong>all {workouts.length} workout{workouts.length !== 1 ? 's' : ''}</strong> from your history.</p>
              <p className={`mb-6 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Your workout presets will NOT be deleted. This action cannot be undone!</p>
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
        
        {/* Backups Modal */}
        {showBackups && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" onClick={() => setShowBackups(false)}>
            <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto`} onClick={(e) => e.stopPropagation()}>
              <h3 className="text-xl font-bold mb-4">Automatic Backups</h3>
              
              {backupsList.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-3">💾</div>
                  <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    No backups yet. Backups are created automatically every 7 days.
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  {backupsList.map((backup) => {
                    const date = new Date(backup.timestamp);
                    return (
                      <div key={backup.timestamp} className={`${darkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-lg p-3`}>
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <div className="font-semibold text-sm">
                              {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </div>
                            <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                              {date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              if (confirm(`Restore backup from ${date.toLocaleDateString()}? Your current data will be replaced.`)) {
                                setWorkouts(backup.workouts || []);
                                setPresets(backup.presets || []);
                                setWeightEntries(backup.weightEntries || []);
                                setExercises(backup.exercises || []);
                                
                                save(backup.workouts || [], 'workouts', setWorkouts);
                                save(backup.presets || [], 'presets', setPresets);
                                save(backup.weightEntries || [], 'weightEntries', setWeightEntries);
                                save(backup.exercises || [], 'exercises', setExercises);
                                
                                setShowBackups(false);
                                setToastMessage('Backup restored successfully!');
                                setShowToast(true);
                                setTimeout(() => setShowToast(false), 3000);
                              }
                            }}
                            className="bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded text-xs font-semibold transition-colors"
                          >
                            Restore
                          </button>
                        </div>
                        <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          {backup.workouts?.length || 0} workouts • {backup.presets?.length || 0} presets • {backup.weightEntries?.length || 0} weight entries
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              
              <button
                onClick={() => setShowBackups(false)}
                className={`w-full mt-4 ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'} py-3 rounded-lg font-semibold transition-colors`}
              >
                Close
              </button>
            </div>
          </div>
        )}

        {/* Delete Workout Confirmation */}
        {deleteWorkout !== null && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 max-w-md`}>
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
                  className={`flex-1 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} py-3 rounded-lg font-semibold`}
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
            <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 max-w-md`}>
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
                  className={`flex-1 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} py-3 rounded-lg font-semibold`}
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
            <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 max-w-md`}>
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
                      location: '',
                      structure: '',
                      structureDuration: ''
                    });
                    setShowCloseConfirm(false);
                    // Reset timer
                    setWorkoutStarted(false);
                    setWorkoutTimer(0);
                    setTimerRunning(false);
                    setPausedTime(0);
                    setLastStartTime(null);
                  }}
                  className="flex-1 bg-red-600 hover:bg-red-700 py-3 rounded-lg font-semibold"
                >
                  Discard
                </button>
                <button
                  onClick={() => setShowCloseConfirm(false)}
                  className={`flex-1 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} py-3 rounded-lg font-semibold`}
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
            <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 max-w-md`}>
              <h3 className="text-xl font-bold mb-4 text-blue-400">Finish Workout?</h3>
              <p className="mb-6">Save this workout to your log?</p>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    // Pass elapsed time directly to saveWorkout
                    saveWorkout(workoutTimer);
                    setShowWorkoutModal(false);
                    setWorkoutStarted(false);
                    setWorkoutTimer(0);
                    setTimerRunning(false);
                    setPausedTime(0);
                    setLastStartTime(null);
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
                  className={`flex-1 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} py-3 rounded-lg font-semibold`}
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
            <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto`}>
              <h3 className="text-xl font-bold mb-4">Edit Preset</h3>
              <div className="space-y-3">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${darkMode ? '' : 'text-gray-700'}`}>Preset Name</label>
                  <input
                    type="text"
                    value={editPresetName}
                    onChange={(e) => setEditPresetName(e.target.value)}
                    className={`w-full ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'} border rounded-lg px-3 py-2`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? '' : 'text-gray-700'}`}>Color</label>
                  <div className="grid grid-cols-4 gap-2">
                    {presetColors.map(color => (
                      <button
                        key={color.name}
                        onClick={() => setEditPresetColor(color.name)}
                        className={`h-10 rounded-lg border-2 transition-all ${
                          editPresetColor === color.name 
                            ? `${color.border} border-opacity-100 scale-105` 
                            : `${color.border} border-opacity-30 hover:border-opacity-60`
                        } ${color.bg}`}
                        title={color.name}
                      >
                        <div className={`text-xs font-semibold ${color.text}`}>{color.name}</div>
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${darkMode ? '' : 'text-gray-700'}`}>Exercises</label>
                  {editPresetExercises.map((ex, i) => (
                    <div key={i} className="flex gap-2 mb-2">
                      <select
                        value={ex}
                        onChange={(e) => {
                          const updated = [...editPresetExercises];
                          updated[i] = e.target.value;
                          setEditPresetExercises(updated);
                        }}
                        className={`flex-1 ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'} border rounded-lg px-3 py-2`}
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
                <div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editPresetIncludeInMenu}
                      onChange={(e) => setEditPresetIncludeInMenu(e.target.checked)}
                      className="w-4 h-4 rounded"
                    />
                    <span className="text-sm">Show in New Workout menu</span>
                  </label>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    const updated = [...presets];
                    updated[editingPreset] = {
                      name: editPresetName,
                      exercises: editPresetExercises,
                      color: editPresetColor,
                      includeInMenu: editPresetIncludeInMenu
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

        {/* Create New Preset Modal */}
        {showCreatePreset && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 max-w-md w-full max-h-[80vh] overflow-y-auto`}>
              <h3 className="text-xl font-bold mb-4">Create New Preset</h3>
              <div className="space-y-3">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${darkMode ? '' : 'text-gray-700'}`}>Preset Name</label>
                  <input
                    type="text"
                    value={newPresetName}
                    onChange={(e) => setNewPresetName(e.target.value)}
                    placeholder="e.g., Upper Body Day"
                    className={`w-full ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'} border rounded-lg px-3 py-2`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? '' : 'text-gray-700'}`}>Color</label>
                  <div className="grid grid-cols-4 gap-2">
                    {presetColors.map(color => (
                      <button
                        key={color.name}
                        onClick={() => setNewPresetColor(color.name)}
                        className={`h-10 rounded-lg border-2 transition-all ${
                          newPresetColor === color.name 
                            ? `${color.border} border-opacity-100 scale-105` 
                            : `${color.border} border-opacity-30 hover:border-opacity-60`
                        } ${color.bg}`}
                      >
                        <div className={`text-xs font-semibold ${color.text}`}>{color.name}</div>
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${darkMode ? '' : 'text-gray-700'}`}>Exercises</label>
                  {newPresetExercises.map((ex, i) => (
                    <div key={i} className="flex gap-2 mb-2">
                      <select
                        value={ex}
                        onChange={(e) => {
                          const updated = [...newPresetExercises];
                          updated[i] = e.target.value;
                          setNewPresetExercises(updated);
                        }}
                        className={`flex-1 ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'} border rounded-lg px-3 py-2`}
                      >
                        {exercises.map((e, ei) => (
                          <option key={ei} value={e}>{e}</option>
                        ))}
                      </select>
                      <button
                        onClick={() => {
                          const updated = newPresetExercises.filter((_, idx) => idx !== i);
                          setNewPresetExercises(updated);
                        }}
                        className="text-red-400 hover:text-red-300"
                      >
                        <Icons.Trash />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => setNewPresetExercises([...newPresetExercises, exercises[0]])}
                    className="text-blue-400 hover:text-blue-300 text-sm"
                  >
                    + Add Exercise
                  </button>
                </div>
                <div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newPresetIncludeInMenu}
                      onChange={(e) => setNewPresetIncludeInMenu(e.target.checked)}
                      className="w-4 h-4 rounded"
                    />
                    <span className="text-sm">Show in New Workout menu</span>
                  </label>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    if (newPresetName.trim() && newPresetExercises.length > 0) {
                      const newPreset = {
                        name: newPresetName.trim(),
                        exercises: newPresetExercises,
                        color: newPresetColor,
                        includeInMenu: newPresetIncludeInMenu
                      };
                      save([...presets, newPreset], 'presets', setPresets);
                      setToastMessage('Preset created!');
                      setShowToast(true);
                      setTimeout(() => setShowToast(false), 3000);
                    }
                    setShowCreatePreset(false);
                  }}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 py-3 rounded-lg font-semibold"
                >
                  Create Preset
                </button>
                <button
                  onClick={() => setShowCreatePreset(false)}
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
            <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 max-w-md w-full`}>
              <h3 className="text-xl font-bold mb-4">Save as Preset?</h3>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-4`}>Would you like to save this workout as a preset for future use?</p>
              <div>
                <label className={`block text-sm font-medium mb-1 ${darkMode ? '' : 'text-gray-700'}`}>Preset Name</label>
                <input
                  type="text"
                  value={newPresetName}
                  onChange={(e) => setNewPresetName(e.target.value)}
                  placeholder="e.g., My Custom Workout"
                  className={`w-full ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'} border rounded-lg px-3 py-2`}
                />
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    if (newPresetName.trim()) {
                      // Find next available color
                      const usedColors = presets.map(p => p.color).filter(Boolean);
                      const availableColor = presetColors.find(c => !usedColors.includes(c.name)) || presetColors[0];
                      
                      const newPreset = {
                        name: newPresetName.trim(),
                        exercises: current.exercises.map(ex => ex.name),
                        color: availableColor.name
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
            <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 max-w-md`}>
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
                  className={`flex-1 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} py-3 rounded-lg font-semibold`}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add/Edit Weight Modal */}
        {showWeightModal && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto`}>
              <h3 className="text-xl font-bold mb-4">{editingWeight !== null ? 'Edit' : 'Add'} Weight Entry</h3>
              <div className="space-y-3">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${darkMode ? '' : 'text-gray-700'}`}>Date</label>
                  <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg p-3`}>
                    {/* Month/Year selector */}
                    <div className="flex items-center justify-between mb-3">
                      <button
                        type="button"
                        onClick={() => {
                          if (weightCalendarMonth === 0) {
                            setWeightCalendarMonth(11);
                            setWeightCalendarYear(weightCalendarYear - 1);
                          } else {
                            setWeightCalendarMonth(weightCalendarMonth - 1);
                          }
                        }}
                        className={`p-1 ${darkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-200'} rounded`}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>
                      <div className="font-semibold">
                        {new Date(weightCalendarYear, weightCalendarMonth).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          if (weightCalendarMonth === 11) {
                            setWeightCalendarMonth(0);
                            setWeightCalendarYear(weightCalendarYear + 1);
                          } else {
                            setWeightCalendarMonth(weightCalendarMonth + 1);
                          }
                        }}
                        className={`p-1 ${darkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-200'} rounded`}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                    
                    {/* Day headers - Monday first */}
                    <div className="grid grid-cols-7 gap-1 mb-1">
                      {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
                        <div key={i} className="text-center text-xs text-gray-500 font-bold">
                          {day}
                        </div>
                      ))}
                    </div>
                    
                    {/* Calendar days */}
                    <div className="grid grid-cols-7 gap-1">
                      {(() => {
                        const firstDay = new Date(weightCalendarYear, weightCalendarMonth, 1).getDay();
                        const adjustedFirstDay = firstDay === 0 ? 6 : firstDay - 1; // Monday = 0
                        const daysInMonth = new Date(weightCalendarYear, weightCalendarMonth + 1, 0).getDate();
                        const today = new Date();
                        
                        const days = [];
                        
                        // Empty cells before first day
                        for (let i = 0; i < adjustedFirstDay; i++) {
                          days.push(<div key={`empty-${i}`} />);
                        }
                        
                        // Days
                        for (let i = 1; i <= daysInMonth; i++) {
                          const day = i;
                          const dateStr = `${weightCalendarYear}-${String(weightCalendarMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                          const isSelected = currentWeight.date === dateStr;
                          const isToday = day === today.getDate() && 
                                        weightCalendarMonth === today.getMonth() && 
                                        weightCalendarYear === today.getFullYear();
                          
                          days.push(
                            <button
                              key={day}
                              type="button"
                              onClick={() => setCurrentWeight({ ...currentWeight, date: dateStr })}
                              className={`
                                aspect-square rounded text-sm font-medium
                                ${isSelected 
                                  ? 'bg-blue-600 text-white' 
                                  : isToday
                                  ? darkMode ? 'bg-gray-600 hover:bg-gray-500' : 'bg-gray-300 hover:bg-gray-400'
                                  : darkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-200'
                                }
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
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${darkMode ? '' : 'text-gray-700'}`}>Weight (lbs)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={currentWeight.weight}
                    onChange={(e) => setCurrentWeight({ ...currentWeight, weight: e.target.value })}
                    placeholder="185.5"
                    className={`w-full ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'} border rounded-lg px-3 py-2`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${darkMode ? '' : 'text-gray-700'}`}>Notes (optional)</label>
                  <textarea
                    value={currentWeight.notes}
                    onChange={(e) => setCurrentWeight({ ...currentWeight, notes: e.target.value })}
                    placeholder="Morning weigh-in, after workout, etc."
                    className={`w-full ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'} border rounded-lg px-3 py-2 resize-none h-20`}
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    if (!currentWeight.date || !currentWeight.weight) return;
                    
                    const entry = {
                      date: currentWeight.date,
                      weight: parseFloat(currentWeight.weight),
                      notes: currentWeight.notes
                    };
                    
                    let updated;
                    if (editingWeight !== null) {
                      updated = [...weightEntries];
                      updated[editingWeight] = entry;
                    } else {
                      updated = [...weightEntries, entry];
                    }
                    
                    save(updated, 'weightEntries', setWeightEntries);
                    setShowWeightModal(false);
                    setCurrentWeight({ date: '', weight: '', notes: '' });
                    setEditingWeight(null);
                  }}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 py-3 rounded-lg font-semibold"
                >
                  {editingWeight !== null ? 'Update' : 'Add'} Entry
                </button>
                <button
                  onClick={() => {
                    setShowWeightModal(false);
                    setCurrentWeight({ date: '', weight: '', notes: '' });
                    setEditingWeight(null);
                  }}
                  className={`flex-1 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} py-3 rounded-lg font-semibold`}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Weight Confirmation */}
        {deleteWeight !== null && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 max-w-md`}>
              <h3 className="text-xl font-bold mb-4 text-red-400">Delete Weight Entry?</h3>
              <p className="mb-6">Are you sure you want to delete this weight entry? This cannot be undone.</p>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    const updated = weightEntries.filter((_, idx) => idx !== deleteWeight);
                    save(updated, 'weightEntries', setWeightEntries);
                    setDeleteWeight(null);
                  }}
                  className="flex-1 bg-red-600 hover:bg-red-700 py-3 rounded-lg font-semibold"
                >
                  Delete
                </button>
                <button
                  onClick={() => setDeleteWeight(null)}
                  className={`flex-1 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} py-3 rounded-lg font-semibold`}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        <div className={`sticky top-0 z-10 bg-gradient-to-b ${currentTheme.headerGradient} ${currentTheme.headerBorder} border-b p-4 shadow-lg`}>
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            {/* Spacer for balance */}
            <div className="w-10"></div>
            
            {/* Centered GORS LOG */}
            <button 
              onClick={() => {
                const themeOrder = ['light', 'dark', 'neon', 'forest'];
                const currentIndex = themeOrder.indexOf(theme);
                const nextTheme = themeOrder[(currentIndex + 1) % themeOrder.length];
                setTheme(nextTheme);
                localStorage.setItem('theme', nextTheme);
              }}
              className="cursor-pointer hover:opacity-80 transition-opacity text-center"
            >
              <h1 className={`text-2xl font-extrabold tracking-tight bg-gradient-to-r ${darkMode ? 'from-white to-gray-300' : 'from-gray-900 to-gray-700'} bg-clip-text text-transparent`}>GORS LOG</h1>
              <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'} -mt-0.5 font-medium`}>Be About It</p>
            </button>
            
            {/* Start Workout Button - only on Home and Home V1 */}
            {(view === 'home' || view === 'homev1') ? (
              <button
                onClick={() => setShowPresetSelector(true)}
                className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 rounded-lg p-2 shadow-lg shadow-blue-500/20 transition-all active:scale-95"
                title="Start Workout"
              >
                <Icons.Plus className="w-5 h-5" />
              </button>
            ) : (
              <div className="w-10"></div>
            )}
          </div>
        </div>

        <div className="max-w-4xl mx-auto p-3 pb-24">

          
          {/* HOME - New sidebar layout */}
          {view === 'home' && (
            <div className="space-y-2.5 pb-32">
              
              {/* Calendar (same as Home) */}
              {showLogCalendar && (
                <div key={JSON.stringify(presets.map(p => ({n: p.name, c: p.color})))} className={`mb-2 ${darkMode ? 'bg-gradient-to-br from-gray-800 to-gray-900' : 'bg-gradient-to-br from-white to-gray-50 border border-gray-200'} rounded-2xl shadow-lg overflow-hidden`}>
                    <div className={`sticky top-0 ${darkMode ? 'bg-gray-800/95 border-gray-700' : 'bg-white/95 border-gray-200'} backdrop-blur-sm border-b px-2 py-1.5 z-[5]`}>
                      <div className="flex items-center justify-between gap-1">
                        <button
                          onClick={() => setShowCalendarLegend(true)}
                          className={`${darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'} p-0.5 rounded-lg ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'} transition-colors flex-shrink-0`}
                          title="Calendar legend"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </button>
                        
                        <div className="flex items-center gap-1 flex-1 justify-center">
                          <button
                            onClick={() => {
                              const newDate = new Date(logCalendarDate);
                              newDate.setMonth(newDate.getMonth() - 1);
                              setLogCalendarDate(newDate);
                            }}
                            className={`${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'} p-0.5 rounded transition-colors flex-shrink-0`}
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                          </button>
                          
                          <div className="text-center min-w-[120px]">
                            <div className="font-bold text-xs">
                              {logCalendarDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                            </div>
                            {(() => {
                              const now = new Date();
                              const isCurrentMonth = logCalendarDate.getMonth() === now.getMonth() && 
                                                    logCalendarDate.getFullYear() === now.getFullYear();
                              if (!isCurrentMonth) {
                                return (
                                  <button
                                    onClick={() => setLogCalendarDate(new Date())}
                                    className="bg-blue-600 hover:bg-blue-700 px-1 py-0.5 rounded text-[9px] font-medium whitespace-nowrap"
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
                            className={`${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'} p-0.5 rounded transition-colors flex-shrink-0`}
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </button>
                        </div>
                        
                        <button
                          onClick={() => setShowLogCalendar(false)}
                          className={`${darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'} p-0.5 rounded-lg ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'} transition-colors flex-shrink-0`}
                          title="Hide calendar"
                        >
                          <div className="transform rotate-180">
                            <Icons.ChevronDown className="w-3.5 h-3.5" />
                          </div>
                        </button>
                      </div>
                    </div>
                    
                    <div className="p-1.5 max-h-[200px] overflow-y-auto">
                      <div className="grid grid-cols-7 gap-0.5 mb-0.5">
                        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                          <div key={day} className={`text-center text-[9px] ${darkMode ? 'text-gray-500' : 'text-gray-600'} font-bold uppercase tracking-wide py-0.5`}>
                            {day}
                          </div>
                        ))}
                      </div>

                      <div className="grid grid-cols-7 gap-0.5">
                      {(() => {
                        const now = new Date();
                        const year = logCalendarDate.getFullYear();
                        const month = logCalendarDate.getMonth();
                        let firstDay = new Date(year, month, 1).getDay();
                        firstDay = firstDay === 0 ? 6 : firstDay - 1;
                        const daysInMonth = new Date(year, month + 1, 0).getDate();
                        const days = [];

                        for (let i = 0; i < firstDay; i++) {
                          days.push(<div key={`empty-${i}`} className="h-8" />);
                        }

                        for (let day = 1; day <= daysInMonth; day++) {
                          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                          const hasWorkout = workouts.some(w => w.date === dateStr);
                          const isToday = dateStr === new Date().toISOString().split('T')[0];
                          
                          const workout = workouts.find(w => w.date === dateStr);
                          const color = workout ? getPresetColor(workout.location) : null;
                          const borderColor = color ? color.border : '';

                          days.push(
                            <button
                              key={day}
                              onClick={() => {
                                if (hasWorkout) {
                                  setSelectedLogDay(dateStr);
                                  const element = document.querySelector(`[data-workout-date="${dateStr}"]`);
                                  if (element) {
                                    setTimeout(() => {
                                      const rect = element.getBoundingClientRect();
                                      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
                                      const targetY = rect.top + scrollTop - 80;
                                      window.scrollTo({ top: targetY, behavior: 'smooth' });
                                    }, 300);
                                  }
                                }
                              }}
                              className={`h-8 w-full rounded border flex items-center justify-center text-xs
                                ${hasWorkout ? `${borderColor} ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} font-bold` : darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-300 bg-white'}
                                ${isToday ? 'ring-2 ring-blue-400' : ''}
                                ${selectedLogDay === dateStr ? 'ring-2 ring-white' : ''}
                                ${hasWorkout ? darkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-200' : ''}
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
                  </div>
                </div>
              )}
              
              {/* Control buttons */}
              <div className="flex items-center gap-2 mb-3">
                {!searchExpanded ? (
                  <button
                    onClick={() => {
                      setSearchExpanded(true);
                      setTimeout(() => {
                        document.documentElement.scrollTop = 0;
                        document.body.scrollTop = 0;
                      }, 50);
                    }}
                    className={`${darkMode ? 'bg-gray-800 hover:bg-gray-700 border-gray-700' : 'bg-white hover:bg-gray-50 border-gray-200'} border p-2 rounded-xl transition-colors shadow-sm`}
                    title="Search workouts"
                  >
                    <Icons.Search className="w-4 h-4" />
                  </button>
                ) : (
                  <div className="relative flex-1">
                    <input
                      ref={(el) => el && el.focus()}
                      type="text"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search workouts..."
                      className={`w-full ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-xl px-3 py-2 pl-9 text-sm shadow-sm`}
                      onBlur={() => {
                        if (!search) setSearchExpanded(false);
                      }}
                    />
                    <Icons.Search className="absolute left-2.5 top-2.5 w-4 h-4 text-gray-400" />
                    {search && (
                      <button
                        onClick={() => {
                          setSearch('');
                          setSearchExpanded(false);
                        }}
                        className={`absolute right-2 top-2 ${darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'} p-0.5`}
                      >
                        <Icons.X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                )}
                
                {!searchExpanded && (
                  <button
                    onClick={() => {
                      const allIndices = filtered().map((_, i) => i);
                      if (expandedLog.size === allIndices.length) {
                        setExpandedLog(new Set());
                      } else {
                        setExpandedLog(new Set(allIndices));
                      }
                    }}
                    className={`${darkMode ? 'bg-gray-800 hover:bg-gray-700 border-gray-700' : 'bg-white hover:bg-gray-50 border-gray-200'} border p-2 rounded-xl transition-colors shadow-sm`}
                    title={expandedLog.size === filtered().length ? 'Collapse all workouts' : 'Expand all workouts'}
                  >
                    {expandedLog.size === filtered().length ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m10 12V8m0 0l-4 4m4-4l4 4" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v12m0 0l-4-4m4 4l4-4m10 4V8m0 0l-4 4m4-4l4 4" />
                      </svg>
                    )}
                  </button>
                )}
                
                {!searchExpanded && (
                  <select
                    value={historyFilter}
                    onChange={(e) => setHistoryFilter(e.target.value)}
                    className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-xl pl-2 pr-5 py-2 text-xs font-medium cursor-pointer transition-colors shadow-sm min-w-0`}
                  >
                    <option value="all">All</option>
                    <option value="day">Today</option>
                    <option value="week">Week</option>
                    <option value="month">Month</option>
                    <option value="year">Year</option>
                  </select>
                )}
                
                {!showLogCalendar && !searchExpanded && (
                  <button
                    onClick={() => setShowLogCalendar(true)}
                    className={`${darkMode ? 'bg-gray-800 hover:bg-gray-700 border-gray-700' : 'bg-white hover:bg-gray-50 border-gray-200'} border p-2 rounded-xl transition-colors shadow-sm`}
                    title="Show calendar"
                  >
                    <Icons.Calendar className="w-4 h-4" />
                  </button>
                )}
              </div>
              
              {/* Workout List with Sidebar Labels */}
              {(() => {
                const workoutList = filtered();
                const now = new Date();
                
                const getWeekStart = (date) => {
                  const d = new Date(date);
                  const day = d.getDay();
                  const diff = day === 0 ? -6 : 1 - day;
                  const weekStart = new Date(d);
                  weekStart.setDate(d.getDate() + diff);
                  weekStart.setHours(0, 0, 0, 0);
                  return weekStart;
                };
                
                const getWeekLabel = (weekStart) => {
                  const weekEnd = new Date(weekStart);
                  weekEnd.setDate(weekStart.getDate() + 6);
                  
                  const currentWeekStart = getWeekStart(now);
                  const lastWeekStart = new Date(currentWeekStart);
                  lastWeekStart.setDate(currentWeekStart.getDate() - 7);
                  
                  const weekStartTime = weekStart.getTime();
                  
                  if (weekStartTime === currentWeekStart.getTime()) {
                    return 'THIS WEEK';
                  }
                  
                  if (weekStartTime === lastWeekStart.getTime()) {
                    return 'LAST WEEK';
                  }
                  
                  const startMonth = weekStart.toLocaleDateString('en-US', { month: 'short' });
                  const startDay = weekStart.getDate();
                  const endMonth = weekEnd.toLocaleDateString('en-US', { month: 'short' });
                  const endDay = weekEnd.getDate();
                  
                  if (startMonth === endMonth) {
                    return `${startMonth.toUpperCase()} ${startDay}-${endDay}`;
                  } else {
                    return `${startMonth.toUpperCase()} ${startDay}-${endMonth.toUpperCase()} ${endDay}`;
                  }
                };
                
                const workoutsByWeek = {};
                workoutList.forEach((w, i) => {
                  const [year, month, day] = w.date.split('-');
                  const workoutDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
                  const weekStart = getWeekStart(workoutDate);
                  const weekKey = weekStart.toISOString().split('T')[0];
                  
                  if (!workoutsByWeek[weekKey]) {
                    workoutsByWeek[weekKey] = {
                      weekStart,
                      label: getWeekLabel(weekStart),
                      workouts: []
                    };
                  }
                  
                  workoutsByWeek[weekKey].workouts.push({ workout: w, index: i });
                });
                
                const sortedWeeks = Object.entries(workoutsByWeek).sort((a, b) => {
                  return new Date(b[0]).getTime() - new Date(a[0]).getTime();
                });
                
                return sortedWeeks.map(([weekKey, { label, workouts }]) => (
                  <div key={weekKey} className="flex gap-0 mb-6">
                    {/* Week Label Sidebar - Theme-aware colors for maximum visibility */}
                    <div className={`w-[25px] flex-shrink-0 flex items-center justify-center border-r-[8px] rounded-l-xl ${
                      darkMode ? 'bg-white border-white' : 'bg-black border-black'
                    }`}>
                      <div className="text-center py-2">
                        <div className={`text-[8px] font-black leading-tight tracking-wider ${
                          darkMode ? 'text-black' : 'text-white'
                        }`} style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}>
                          {label}
                        </div>
                      </div>
                    </div>
                    
                    {/* Workouts for this week */}
                    <div className="flex-1 space-y-2">
                      {workouts.map(({ workout: w, index: i }) => {
                        const [year, month, day] = w.date.split('-');
                        const dateObj = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
                        const dayOfWeek = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
                        const isExpanded = expandedLog.has(i);
                        
                        const color = getPresetColor(w.location);
                        const borderColor = color.border;
                        
                        return (
                          <div key={i} data-workout-date={w.date} className={`${darkMode ? 'bg-gray-800' : 'bg-white border-t border-r border-b border-gray-200'} rounded-r-xl border-l-[6px] ${borderColor} shadow-md hover:shadow-lg transition-shadow overflow-hidden`}>
                            <button
                              onClick={(e) => {
                                const newExpanded = new Set(expandedLog);
                                if (newExpanded.has(i)) {
                                  newExpanded.delete(i);
                                } else {
                                  const element = e.currentTarget.closest('[data-workout-date]');
                                  newExpanded.add(i);
                                  setExpandedLog(newExpanded);
                                  
                                  // Scroll this workout to top when expanding
                                  requestAnimationFrame(() => {
                                    requestAnimationFrame(() => {
                                      setTimeout(() => {
                                        if (element) {
                                          const rect = element.getBoundingClientRect();
                                          const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
                                          const targetY = rect.top + scrollTop - 120;
                                          window.scrollTo({ top: targetY, behavior: 'smooth' });
                                        }
                                      }, 100);
                                    });
                                  });
                                  return;
                                }
                                setExpandedLog(newExpanded);
                              }}
                              className={`w-full p-3 text-left transition-colors ${darkMode ? 'hover:bg-white/5' : 'hover:bg-gray-50'}`}
                            >
                              <div className="flex items-center justify-between">
                                <div>
                                  <div className="font-bold text-base">
                                    {dayOfWeek} {month}/{day}/{year.slice(2)}
                                    {w.location && <span className="ml-2 text-sm font-medium">· {w.location}</span>}
                                  </div>
                                  <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} mt-0.5`}>
                                    {w.exercises.length} exercise{w.exercises.length !== 1 ? 's' : ''}
                                    {w.structure && (
                                      <span className="font-semibold">
                                        {' • '}
                                        {w.structure === 'pairs' ? `Pairs ${w.structureDuration}'` : 'Circuit'}
                                      </span>
                                    )}
                                    {w.elapsedTime && ` • ${formatTimeHHMMSS(w.elapsedTime)}`}
                                    {(() => {
                                      const dayProtein = proteinEntries
                                        .filter(e => e.date === w.date)
                                        .reduce((sum, e) => sum + e.grams, 0);
                                      return dayProtein > 0 ? ` • ${dayProtein}g` : '';
                                    })()}
                                  </div>
                                </div>
                                <div className={`transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                                  <Icons.ChevronDown />
                                </div>
                              </div>
                            </button>
                            
                            {isExpanded && (
                              <div className="px-3 pb-3 space-y-2">
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
                                            <div className="grid grid-cols-[110px_1fr_40px] gap-2 items-start text-xs">
                                              <div className="font-medium truncate">{ex.name}</div>
                                              <div className="flex items-center gap-1 flex-wrap min-w-0">
                                                {ex.sets.map((s, si) => (
                                                  <span 
                                                    key={si} 
                                                    className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} whitespace-nowrap`}
                                                  >
                                                    {s.reps}
                                                    {si < ex.sets.length - 1 && <span className={`${darkMode ? 'text-gray-600' : 'text-gray-400'} mx-0.5`}>·</span>}
                                                  </span>
                                                ))}
                                              </div>
                                              <div className="font-bold text-right">{totalReps}</div>
                                            </div>
                                            {ex.notes && (
                                              <div className={`text-[10px] ${darkMode ? 'text-gray-500' : 'text-gray-600'} mt-0.5 text-right`}>{ex.notes}</div>
                                            )}
                                          </div>
                                        );
                                      })}
                                    </div>
                                    
                                    {w.notes && (
                                      <div className={`${darkMode ? 'bg-blue-900/40 border-blue-500/30' : 'bg-blue-50 border-blue-300'} border rounded-lg p-2`}>
                                        <div className={`text-xs font-semibold mb-1 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>Notes</div>
                                        <div className={`text-xs ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>{w.notes}</div>
                                      </div>
                                    )}
                                    
                                    {/* Action Icons */}
                                    <div className="flex items-center justify-around pt-2 border-t border-gray-600/30">
                                      <button
                                        onClick={() => {
                                          const text = `${w.date}
${w.location}

${w.exercises.map(ex => `${ex.name}
${ex.sets.map(s => s.reps).join(' · ')} = ${ex.sets.reduce((sum, s) => sum + (s.reps || 0), 0)} reps${ex.notes ? '\n' + ex.notes : ''}`).join('\n\n')}${w.notes ? '\n\nNotes: ' + w.notes : ''}`;
                                          navigator.clipboard.writeText(text);
                                        }}
                                        className={`flex flex-col items-center gap-1 ${darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-800'} transition-colors`}
                                      >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                        </svg>
                                        <span className="text-[10px]">Copy</span>
                                      </button>
                                      <button
                                        onClick={() => {
                                          const text = `${w.date}
${w.location}

${w.exercises.map(ex => `${ex.name}
${ex.sets.map(s => s.reps).join(' · ')} = ${ex.sets.reduce((sum, s) => sum + (s.reps || 0), 0)} reps${ex.notes ? '\n' + ex.notes : ''}`).join('\n\n')}${w.notes ? '\n\nNotes: ' + w.notes : ''}`;
                                          if (navigator.share) {
                                            navigator.share({ text });
                                          }
                                        }}
                                        className={`flex flex-col items-center gap-1 ${darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-800'} transition-colors`}
                                      >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                                        </svg>
                                        <span className="text-[10px]">Share</span>
                                      </button>
                                      <button
                                        onClick={() => {
                                          setCurrent(w);
                                          setShowNew(true);
                                        }}
                                        className={`flex flex-col items-center gap-1 ${darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-800'} transition-colors`}
                                      >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        </svg>
                                        <span className="text-[10px]">Edit</span>
                                      </button>
                                      <button
                                        onClick={() => setDeleteWorkout(i)}
                                        className={`flex flex-col items-center gap-1 ${darkMode ? 'text-red-400 hover:text-red-300' : 'text-red-600 hover:text-red-700'} transition-colors`}
                                      >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                        <span className="text-[10px]">Delete</span>
                                      </button>
                                    </div>
                                    
                                    {/* Collapse Button */}
                                    <button
                                      onClick={() => {
                                        const newExpanded = new Set(expandedLog);
                                        newExpanded.delete(i);
                                        setExpandedLog(newExpanded);
                                      }}
                                      className={`w-full ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'} py-2 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1 mt-2`}
                                    >
                                      <div className="transform rotate-180">
                                        <Icons.ChevronDown className="w-3 h-3" />
                                      </div>
                                      Collapse
                                    </button>
                                  </>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ));
              })()}

              {filtered().length === 0 && (
                <div className="text-center text-gray-500 py-8">
                  {search ? 'No workouts found' : 'No workouts yet'}
                </div>
              )}
            </div>
          )}
          
          
          {/* HOME V1 - Original layout (toggle in settings) */}
          {view === 'homev1' && showHomeV1 && (
            <div className="space-y-2.5 pb-32">
              {/* No controls at top - cleaner! */}
              
              {showLogCalendar && (
                <div key={JSON.stringify(presets.map(p => ({n: p.name, c: p.color})))} className={`mb-2 ${darkMode ? 'bg-gradient-to-br from-gray-800 to-gray-900' : 'bg-gradient-to-br from-white to-gray-50 border border-gray-200'} rounded-2xl shadow-lg overflow-hidden`}>
                    {/* Month/Year header - more compressed */}
                    <div className={`sticky top-0 ${darkMode ? 'bg-gray-800/95 border-gray-700' : 'bg-white/95 border-gray-200'} backdrop-blur-sm border-b px-2 py-1.5 z-[5]`}>
                      <div className="flex items-center justify-between gap-1">
                        {/* Info button for legend */}
                        <button
                          onClick={() => setShowCalendarLegend(true)}
                          className={`${darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'} p-0.5 rounded-lg ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'} transition-colors flex-shrink-0`}
                          title="Calendar legend"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </button>
                        
                        {/* Month navigation - centered and compressed */}
                        <div className="flex items-center gap-1 flex-1 justify-center">
                          <button
                            onClick={() => {
                              const newDate = new Date(logCalendarDate);
                              newDate.setMonth(newDate.getMonth() - 1);
                              setLogCalendarDate(newDate);
                            }}
                            className={`${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'} p-0.5 rounded transition-colors flex-shrink-0`}
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                          </button>
                          
                          <div className="text-center min-w-[120px]">
                            <div className="font-bold text-xs">
                              {logCalendarDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                            </div>
                            {(() => {
                              const now = new Date();
                              const isCurrentMonth = logCalendarDate.getMonth() === now.getMonth() && 
                                                    logCalendarDate.getFullYear() === now.getFullYear();
                              if (!isCurrentMonth) {
                                return (
                                  <button
                                    onClick={() => setLogCalendarDate(new Date())}
                                    className="bg-blue-600 hover:bg-blue-700 px-1 py-0.5 rounded text-[9px] font-medium whitespace-nowrap"
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
                            className={`${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'} p-0.5 rounded transition-colors flex-shrink-0`}
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </button>
                        </div>
                        
                        {/* Collapse button */}
                        <button
                          onClick={() => setShowLogCalendar(false)}
                          className={`${darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'} p-0.5 rounded-lg ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'} transition-colors flex-shrink-0`}
                          title="Hide calendar"
                        >
                          <div className="transform rotate-180">
                            <Icons.ChevronDown className="w-3.5 h-3.5" />
                          </div>
                        </button>
                      </div>
                    </div>
                    
                    {/* Scrollable calendar content - expand slightly */}
                    <div className="p-1.5 max-h-[200px] overflow-y-auto">
                      {/* Day headers - smaller */}
                      <div className="grid grid-cols-7 gap-0.5 mb-0.5">
                        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                          <div key={day} className={`text-center text-[9px] ${darkMode ? 'text-gray-500' : 'text-gray-600'} font-bold uppercase tracking-wide py-0.5`}>
                            {day}
                          </div>
                        ))}
                      </div>

                      {/* Calendar days */}
                      <div className="grid grid-cols-7 gap-0.5">
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
                          days.push(<div key={`empty-${i}`} className="h-8" />);
                        }

                        // Days
                        for (let day = 1; day <= daysInMonth; day++) {
                          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                          const dayWorkouts = workouts.filter(w => w.date === dateStr);
                          const hasWorkout = dayWorkouts.length > 0;
                          
                          let borderColor = 'border-gray-600';
                          if (hasWorkout) {
                            const color = getPresetColor(dayWorkouts[0].location);
                            borderColor = color.border;
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
                              className={`h-8 w-full rounded border flex items-center justify-center text-xs
                                ${hasWorkout ? `${borderColor} ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} font-bold` : darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-300 bg-white'}
                                ${isToday ? 'ring-2 ring-blue-400' : ''}
                                ${selectedLogDay === dateStr ? 'ring-2 ring-white' : ''}
                                ${hasWorkout ? darkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-200' : ''}
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
              
              {/* Control buttons below calendar - improved */}
              <div className="flex items-center gap-2 mb-3">
                {/* Search - icon only, expands on tap */}
                {!searchExpanded ? (
                  <button
                    onClick={() => {
                      setSearchExpanded(true);
                      // Force scroll to absolute top
                      setTimeout(() => {
                        document.documentElement.scrollTop = 0;
                        document.body.scrollTop = 0;
                      }, 50);
                    }}
                    className={`${darkMode ? 'bg-gray-800 hover:bg-gray-700 border-gray-700' : 'bg-white hover:bg-gray-50 border-gray-200'} border p-2 rounded-xl transition-colors shadow-sm`}
                    title="Search workouts"
                  >
                    <Icons.Search className="w-4 h-4" />
                  </button>
                ) : (
                  <div className="relative flex-1">
                    <input
                      ref={(el) => el && el.focus()}
                      type="text"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search workouts..."
                      className={`w-full ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-xl px-3 py-2 pl-9 text-sm shadow-sm`}
                      onBlur={() => {
                        if (!search) setSearchExpanded(false);
                      }}
                    />
                    <div className={`absolute left-3 top-2.5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      <Icons.Search className="w-4 h-4" />
                    </div>
                    {search && (
                      <button
                        onClick={() => {
                          setSearch('');
                          setSearchExpanded(false);
                        }}
                        className={`absolute right-2 top-2 ${darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'} p-0.5`}
                      >
                        <Icons.X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                )}
                
                {/* Expand/Collapse All - clearer vertical arrows */}
                {!searchExpanded && (
                  <button
                    onClick={() => {
                      const allIndices = filtered().map((_, i) => i);
                      if (expandedLog.size === allIndices.length) {
                        setExpandedLog(new Set());
                      } else {
                        setExpandedLog(new Set(allIndices));
                      }
                    }}
                    className={`${darkMode ? 'bg-gray-800 hover:bg-gray-700 border-gray-700' : 'bg-white hover:bg-gray-50 border-gray-200'} border p-2 rounded-xl transition-colors shadow-sm`}
                    title={expandedLog.size === filtered().length ? 'Collapse all workouts' : 'Expand all workouts'}
                  >
                    {expandedLog.size === filtered().length ? (
                      // Collapse: arrows pointing at each other vertically
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m10 12V8m0 0l-4 4m4-4l4 4" />
                      </svg>
                    ) : (
                      // Expand: arrows pointing away from each other vertically
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v12m0 0l-4-4m4 4l4-4m10 4V8m0 0l-4 4m4-4l4 4" />
                      </svg>
                    )}
                  </button>
                )}
                
                {/* Filter dropdown - compact labels */}
                {!searchExpanded && (
                  <select
                    value={historyFilter}
                    onChange={(e) => setHistoryFilter(e.target.value)}
                    className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-xl pl-2 pr-5 py-2 text-xs font-medium cursor-pointer transition-colors shadow-sm min-w-0`}
                  >
                    <option value="all">All</option>
                    <option value="day">Today</option>
                    <option value="week">Week</option>
                    <option value="month">Month</option>
                    <option value="year">Year</option>
                  </select>
                )}
                
                {/* Toggle calendar button - condensed when collapsed */}
                {!showLogCalendar && !searchExpanded && (
                  <button
                    onClick={() => setShowLogCalendar(true)}
                    className={`${darkMode ? 'bg-gray-800 hover:bg-gray-700 border-gray-700' : 'bg-white hover:bg-gray-50 border-gray-200'} border px-2 py-2 rounded-xl transition-colors flex items-center gap-1.5 shadow-sm`}
                    title="Show calendar"
                  >
                    <Icons.Calendar className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Workout List with Week Dividers */}
              {(() => {
                const workoutList = filtered();
                const now = new Date();
                
                // Function to get week start (Monday) for a date
                const getWeekStart = (date) => {
                  const d = new Date(date);
                  const day = d.getDay();
                  const diff = day === 0 ? -6 : 1 - day; // If Sunday, go back 6 days; else go back to Monday
                  const weekStart = new Date(d);
                  weekStart.setDate(d.getDate() + diff);
                  weekStart.setHours(0, 0, 0, 0);
                  return weekStart;
                };
                
                // Function to format week label
                const getWeekLabel = (weekStart) => {
                  const weekEnd = new Date(weekStart);
                  weekEnd.setDate(weekStart.getDate() + 6);
                  
                  const currentWeekStart = getWeekStart(now);
                  const lastWeekStart = new Date(currentWeekStart);
                  lastWeekStart.setDate(currentWeekStart.getDate() - 7);
                  
                  const weekStartTime = weekStart.getTime();
                  
                  // This Week
                  if (weekStartTime === currentWeekStart.getTime()) {
                    return 'This Week';
                  }
                  
                  // Last Week
                  if (weekStartTime === lastWeekStart.getTime()) {
                    return 'Last Week';
                  }
                  
                  // Older weeks - show date range with year
                  const startMonth = weekStart.toLocaleDateString('en-US', { month: 'short' });
                  const startDay = weekStart.getDate();
                  const endMonth = weekEnd.toLocaleDateString('en-US', { month: 'short' });
                  const endDay = weekEnd.getDate();
                  const year = weekStart.getFullYear();
                  
                  if (startMonth === endMonth) {
                    return `${startMonth} ${startDay} - ${endDay}, ${year}`;
                  } else {
                    return `${startMonth} ${startDay} - ${endMonth} ${endDay}, ${year}`;
                  }
                };
                
                // Group workouts by week
                const workoutsByWeek = {};
                workoutList.forEach((w, i) => {
                  const [year, month, day] = w.date.split('-');
                  const workoutDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
                  const weekStart = getWeekStart(workoutDate);
                  const weekKey = weekStart.toISOString().split('T')[0];
                  
                  if (!workoutsByWeek[weekKey]) {
                    workoutsByWeek[weekKey] = {
                      weekStart,
                      label: getWeekLabel(weekStart),
                      workouts: []
                    };
                  }
                  
                  workoutsByWeek[weekKey].workouts.push({ workout: w, index: i });
                });
                
                // Sort weeks (newest first)
                const sortedWeeks = Object.entries(workoutsByWeek).sort((a, b) => {
                  return new Date(b[0]).getTime() - new Date(a[0]).getTime();
                });
                
                return sortedWeeks.map(([weekKey, { label, workouts }]) => (
                  <div key={weekKey} className="mb-4">
                    {/* Week Header - Transparent and subtle */}
                    <div className="sticky top-[72px] backdrop-blur-sm border-b border-gray-500/20 z-[4] py-2 px-3 -mx-3">
                      <h3 className={`text-xs font-bold uppercase tracking-wider ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                        {label}
                      </h3>
                    </div>
                    
                    {/* Workouts for this week */}
                    <div className="space-y-2 mt-2">
                      {workouts.map(({ workout: w, index: i }) => {
                        // Parse date without timezone issues
                        const [year, month, day] = w.date.split('-');
                        const dateObj = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
                        const dayOfWeek = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
                        const isExpanded = expandedLog.has(i);
                        
                        // Color-code by workout location
                        const color = getPresetColor(w.location);
                        const borderColor = color.border;
                        
                        return (
                  <div key={i} data-workout-date={w.date} className={`${darkMode ? 'bg-gray-800' : 'bg-white border-t border-r border-b border-gray-200'} rounded-xl border-l-[6px] ${borderColor} shadow-md hover:shadow-lg transition-shadow overflow-hidden`}>
                    <button
                      onClick={(e) => {
                        const newExpanded = new Set(expandedLog);
                        if (newExpanded.has(i)) {
                          newExpanded.delete(i);
                        } else {
                          const element = e.currentTarget.closest('[data-workout-date]');
                          newExpanded.add(i);
                          setExpandedLog(newExpanded);
                          
                          // Scroll this workout to top when expanding
                          requestAnimationFrame(() => {
                            requestAnimationFrame(() => {
                              setTimeout(() => {
                                if (element) {
                                  const rect = element.getBoundingClientRect();
                                  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
                                  const targetY = rect.top + scrollTop - 120;
                                  window.scrollTo({ top: targetY, behavior: 'smooth' });
                                }
                              }, 100);
                            });
                          });
                          return;
                        }
                        setExpandedLog(newExpanded);
                      }}
                      className={`w-full p-3 text-left transition-colors ${darkMode ? 'hover:bg-white/5' : 'hover:bg-gray-50'}`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-bold text-base">
                            {dayOfWeek} {month}/{day}/{year.slice(2)}
                            {w.location && <span className="ml-2 text-sm font-medium">· {w.location}</span>}
                          </div>
                          <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} mt-0.5`}>
                            {w.exercises.length} exercise{w.exercises.length !== 1 ? 's' : ''}
                            {w.structure && (
                              <span className="font-semibold">
                                {' • '}
                                {w.structure === 'pairs' ? `Pairs ${w.structureDuration}'` : 'Circuit'}
                              </span>
                            )}
                            {w.elapsedTime && ` • ${formatTimeHHMMSS(w.elapsedTime)}`}
                            {(() => {
                              const dayProtein = proteinEntries
                                .filter(e => e.date === w.date)
                                .reduce((sum, e) => sum + e.grams, 0);
                              return dayProtein > 0 ? ` • ${dayProtein}g` : '';
                            })()}
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
                            onClick={() => shareWorkout(w)}
                            className="text-purple-400 hover:text-purple-300 p-1 text-xs flex items-center gap-1"
                            title="Share workout"
                          >
                            <Icons.Share className="w-4 h-4" />
                            Share
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
                                  <span 
                                    key={si} 
                                    className={`${
                                      darkMode 
                                        ? 'bg-gray-800 text-blue-300 border border-gray-600' 
                                        : 'bg-white text-gray-900 border border-gray-400'
                                    } px-1.5 py-0.5 rounded font-mono text-xs font-semibold shadow-sm whitespace-nowrap`}
                                  >
                                    {s.reps}
                                  </span>
                                ))}
                              </div>
                              <div className={`text-right font-bold text-xs ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                                ({totalReps})
                              </div>
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
                    </div>
                  </div>
                ));
              })()}

              {filtered().length === 0 && (
                <div className="text-center text-gray-500 py-8">
                  {search ? 'No workouts found' : 'No workouts yet'}
                </div>
              )}
            </div>
          )}
          {view === 'stats' && statsView === 'menu' && (
            <div className="space-y-3">
              <h2 className="text-base font-semibold mb-3">Statistics</h2>
              
              {/* Monthly Volume Widget - Compressed */}
              <div className={`${darkMode ? 'bg-gradient-to-br from-blue-900/30 to-purple-900/30 border-blue-500/30' : 'bg-gradient-to-br from-blue-50 to-purple-50 border-blue-300'} rounded-xl p-2 shadow-xl border-2 mb-3`}>
                {/* Header */}
                <div className="flex items-center justify-between mb-1">
                  <button
                    onClick={() => {
                      const newDate = new Date(volumeWidgetDate);
                      newDate.setMonth(newDate.getMonth() - 1);
                      setVolumeWidgetDate(newDate);
                    }}
                    className={`p-1 ${darkMode ? 'hover:bg-blue-500/20 text-blue-400' : 'hover:bg-blue-100 text-blue-600'} rounded transition-colors`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <h3 className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {volumeWidgetDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </h3>
                  <button
                    onClick={() => {
                      const newDate = new Date(volumeWidgetDate);
                      newDate.setMonth(newDate.getMonth() + 1);
                      setVolumeWidgetDate(newDate);
                    }}
                    className={`p-1 ${darkMode ? 'hover:bg-blue-500/20 text-blue-400' : 'hover:bg-blue-100 text-blue-600'} rounded transition-colors`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
                
                {/* Exercise Cards - Stacked Vertically */}
                <div className="space-y-2">
                  {/* Pull-ups */}
                  {(() => {
                    const monthStr = `${volumeWidgetDate.getFullYear()}-${String(volumeWidgetDate.getMonth() + 1).padStart(2, '0')}`;
                    const monthlyVolume = workouts.filter(w => w.date.startsWith(monthStr)).reduce((total, w) => {
                      const exercise = w.exercises.find(e => e.name === 'Pull-ups');
                      return total + (exercise ? exercise.sets.reduce((sum, s) => sum + (s.reps || 0), 0) : 0);
                    }, 0);
                    
                    const prevMonthDate = new Date(volumeWidgetDate);
                    prevMonthDate.setMonth(prevMonthDate.getMonth() - 1);
                    const prevMonthStr = `${prevMonthDate.getFullYear()}-${String(prevMonthDate.getMonth() + 1).padStart(2, '0')}`;
                    const prevMonthVolume = workouts.filter(w => w.date.startsWith(prevMonthStr)).reduce((total, w) => {
                      const exercise = w.exercises.find(e => e.name === 'Pull-ups');
                      return total + (exercise ? exercise.sets.reduce((sum, s) => sum + (s.reps || 0), 0) : 0);
                    }, 0);
                    
                    const percentage = prevMonthVolume > 0 ? Math.min((monthlyVolume / prevMonthVolume) * 100, 100) : 0;
                    
                    return (
                      <div className={`${darkMode ? 'bg-gray-800/50' : 'bg-white/70'} rounded-lg p-3`}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xl">💪</span>
                            <span className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Pull-ups</span>
                          </div>
                          <div className="text-right">
                            <span className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{monthlyVolume}</span>
                            {prevMonthVolume > 0 && (
                              <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}> / {prevMonthVolume}</span>
                            )}
                          </div>
                        </div>
                        <div className={`w-full h-2 ${darkMode ? 'bg-gray-700' : 'bg-gray-300'} rounded-full overflow-hidden`}>
                          <div className="h-full bg-blue-500 transition-all" style={{ width: `${percentage}%` }}></div>
                        </div>
                      </div>
                    );
                  })()}
                  
                  {/* Dips */}
                  {(() => {
                    const monthStr = `${volumeWidgetDate.getFullYear()}-${String(volumeWidgetDate.getMonth() + 1).padStart(2, '0')}`;
                    const monthlyVolume = workouts.filter(w => w.date.startsWith(monthStr)).reduce((total, w) => {
                      const exercise = w.exercises.find(e => e.name === 'Dips');
                      return total + (exercise ? exercise.sets.reduce((sum, s) => sum + (s.reps || 0), 0) : 0);
                    }, 0);
                    
                    const prevMonthDate = new Date(volumeWidgetDate);
                    prevMonthDate.setMonth(prevMonthDate.getMonth() - 1);
                    const prevMonthStr = `${prevMonthDate.getFullYear()}-${String(prevMonthDate.getMonth() + 1).padStart(2, '0')}`;
                    const prevMonthVolume = workouts.filter(w => w.date.startsWith(prevMonthStr)).reduce((total, w) => {
                      const exercise = w.exercises.find(e => e.name === 'Dips');
                      return total + (exercise ? exercise.sets.reduce((sum, s) => sum + (s.reps || 0), 0) : 0);
                    }, 0);
                    
                    const percentage = prevMonthVolume > 0 ? Math.min((monthlyVolume / prevMonthVolume) * 100, 100) : 0;
                    
                    return (
                      <div className={`${darkMode ? 'bg-gray-800/50' : 'bg-white/70'} rounded-lg p-3`}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xl">🔥</span>
                            <span className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Dips</span>
                          </div>
                          <div className="text-right">
                            <span className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{monthlyVolume}</span>
                            {prevMonthVolume > 0 && (
                              <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}> / {prevMonthVolume}</span>
                            )}
                          </div>
                        </div>
                        <div className={`w-full h-2 ${darkMode ? 'bg-gray-700' : 'bg-gray-300'} rounded-full overflow-hidden`}>
                          <div className="h-full bg-blue-500 transition-all" style={{ width: `${percentage}%` }}></div>
                        </div>
                      </div>
                    );
                  })()}
                  
                  {/* Chin-ups */}
                  {(() => {
                    const monthStr = `${volumeWidgetDate.getFullYear()}-${String(volumeWidgetDate.getMonth() + 1).padStart(2, '0')}`;
                    const monthlyVolume = workouts.filter(w => w.date.startsWith(monthStr)).reduce((total, w) => {
                      const exercise = w.exercises.find(e => e.name === 'Chin-ups');
                      return total + (exercise ? exercise.sets.reduce((sum, s) => sum + (s.reps || 0), 0) : 0);
                    }, 0);
                    
                    const prevMonthDate = new Date(volumeWidgetDate);
                    prevMonthDate.setMonth(prevMonthDate.getMonth() - 1);
                    const prevMonthStr = `${prevMonthDate.getFullYear()}-${String(prevMonthDate.getMonth() + 1).padStart(2, '0')}`;
                    const prevMonthVolume = workouts.filter(w => w.date.startsWith(prevMonthStr)).reduce((total, w) => {
                      const exercise = w.exercises.find(e => e.name === 'Chin-ups');
                      return total + (exercise ? exercise.sets.reduce((sum, s) => sum + (s.reps || 0), 0) : 0);
                    }, 0);
                    
                    const percentage = prevMonthVolume > 0 ? Math.min((monthlyVolume / prevMonthVolume) * 100, 100) : 0;
                    
                    return (
                      <div className={`${darkMode ? 'bg-gray-800/50' : 'bg-white/70'} rounded-lg p-3`}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xl">⚡</span>
                            <span className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Chin-ups</span>
                          </div>
                          <div className="text-right">
                            <span className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{monthlyVolume}</span>
                            {prevMonthVolume > 0 && (
                              <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}> / {prevMonthVolume}</span>
                            )}
                          </div>
                        </div>
                        <div className={`w-full h-2 ${darkMode ? 'bg-gray-700' : 'bg-gray-300'} rounded-full overflow-hidden`}>
                          <div className="h-full bg-blue-500 transition-all" style={{ width: `${percentage}%` }}></div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>
              
              {/* Protein Tracker Card - Compressed */}
              <div className={`${darkMode ? 'bg-gradient-to-br from-green-900/30 to-emerald-900/30 border-green-500/30' : 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-300'} rounded-xl shadow-xl border-2 overflow-hidden`}>
                <button
                  onClick={() => {
                    setStatsView('protein');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="w-full p-3 text-left"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="text-3xl">🥩</div>
                      <div>
                        <h3 className="font-bold text-lg mb-1">Protein Intake</h3>
                        <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          {(() => {
                            const today = getTodayDate();
                            const todayTotal = proteinEntries
                              .filter(e => e.date === today)
                              .reduce((sum, e) => sum + e.grams, 0);
                            return todayTotal > 0 ? `${todayTotal}g` : 'Track daily protein intake';
                          })()}
                        </div>
                      </div>
                    </div>
                    <svg className={`w-6 h-6 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </button>
                
                {/* Quick Add Button - Always visible */}
                <div className="px-3 pb-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowAddProtein(true);
                    }}
                    className="w-full bg-green-600 hover:bg-green-700 px-3 py-2 rounded-lg text-sm font-bold transition-colors flex items-center justify-center gap-1"
                  >
                    <span className="text-lg">+</span>
                    Add Protein
                  </button>
                </div>
              </div>
              
              {/* Body Weight Card */}
              <button
                onClick={() => {
                  setStatsView('weight');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className={`w-full ${darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-50 border border-gray-200'} rounded-xl p-4 text-left transition-colors shadow-md`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-3xl">⚖️</div>
                    <div>
                      <h3 className="font-bold text-lg mb-1">Body Weight</h3>
                      <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {weightEntries.length > 0 
                          ? `${weightEntries[weightEntries.length - 1].weight} lbs • ${weightEntries.length} entries`
                          : 'Track your weight over time'
                        }
                      </div>
                    </div>
                  </div>
                  <svg className={`w-6 h-6 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>
              
              {/* Progress Charts Card */}
              <button
                onClick={() => {
                  setStatsView('progress');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className={`w-full ${darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-50 border border-gray-200'} rounded-xl p-4 text-left transition-colors shadow-md`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-3xl">📈</div>
                    <div>
                      <h3 className="font-bold text-lg mb-1">Progress Charts</h3>
                      <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Volume trends & workout frequency
                      </div>
                    </div>
                  </div>
                  <svg className={`w-6 h-6 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>
              
              {/* Exercise Stats Card */}
              <button
                onClick={() => {
                  setStatsView('exercises');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className={`w-full ${darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-50 border border-gray-200'} rounded-xl p-4 text-left transition-colors shadow-md`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-3xl">📊</div>
                    <div>
                      <h3 className="font-bold text-lg mb-1">Exercise Stats</h3>
                      <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {[...new Set(workouts.flatMap(w => w.exercises.map(ex => ex.name)))].length} exercises tracked
                      </div>
                    </div>
                  </div>
                  <svg className={`w-6 h-6 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>
            </div>
          )}
          
          {/* Exercise List View */}
          {view === 'stats' && statsView === 'exercises' && !selectedExercise && (
            <div 
              className="space-y-3"
              onTouchStart={(e) => {
                e.currentTarget.dataset.swipeStartX = e.touches[0].clientX;
                e.currentTarget.dataset.swipeStartY = e.touches[0].clientY;
              }}
              onTouchMove={(e) => {
                const startX = parseFloat(e.currentTarget.dataset.swipeStartX);
                const startY = parseFloat(e.currentTarget.dataset.swipeStartY);
                const currentX = e.touches[0].clientX;
                const currentY = e.touches[0].clientY;
                const diffX = currentX - startX;
                const diffY = Math.abs(currentY - startY);
                
                if (Math.abs(diffX) > diffY && diffX > 20) {
                  e.currentTarget.style.transform = `translateX(${Math.min(diffX, 100)}px)`;
                  e.currentTarget.style.transition = 'none';
                }
              }}
              onTouchEnd={(e) => {
                const startX = parseFloat(e.currentTarget.dataset.swipeStartX);
                const currentX = e.changedTouches[0].clientX;
                const diffX = currentX - startX;
                
                e.currentTarget.style.transition = 'transform 0.2s ease-out';
                
                if (diffX > 100) {
                  e.currentTarget.style.transform = 'translateX(100%)';
                  setTimeout(() => {
                    setStatsView('menu');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                    e.currentTarget.style.transform = '';
                  }, 200);
                } else {
                  e.currentTarget.style.transform = '';
                }
              }}
            >
              <button
                onClick={() => {
                  setStatsView('menu');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className={`flex items-center gap-2 ${darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'} mb-2`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span className="font-semibold">Back to Stats</span>
              </button>
              
              <h2 className="text-base font-semibold mb-2">Exercise Statistics</h2>
              
              {(() => {
                // Get all unique exercises with total volume
                const allExercises = [...new Set(workouts.flatMap(w => w.exercises.map(ex => ex.name)))].sort();
                
                return allExercises.map(exerciseName => {
                  // Calculate total volume
                  const totalVolume = workouts.reduce((total, w) => {
                    const exercise = w.exercises.find(ex => ex.name === exerciseName);
                    if (exercise) {
                      return total + exercise.sets.reduce((sum, s) => sum + (s.reps || 0), 0);
                    }
                    return total;
                  }, 0);
                  
                  // Count workouts
                  const workoutCount = workouts.filter(w => 
                    w.exercises.some(ex => ex.name === exerciseName)
                  ).length;
                  
                  return (
                    <button
                      key={exerciseName}
                      onClick={() => {
                        setSelectedExercise(exerciseName);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className={`w-full ${darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-50 border border-gray-200'} rounded-xl p-4 text-left transition-colors shadow-md`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-bold text-lg mb-1">{exerciseName}</h3>
                          <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {workoutCount} workout{workoutCount !== 1 ? 's' : ''} • {totalVolume.toLocaleString()} total reps
                          </div>
                        </div>
                        <svg className={`w-6 h-6 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </button>
                  );
                });
              })()}
            </div>
          )}
          
          {/* Exercise Detail View */}
          {view === 'stats' && statsView === 'exercises' && selectedExercise && (() => {
            const stats = (() => {
              const weekly = {};
              const monthly = {};
              
              workouts.forEach(w => {
                // Calculate weekly stats
                const wDate = new Date(w.date);
                const dayOfWeek = wDate.getDay();
                const monday = new Date(wDate);
                monday.setDate(wDate.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
                const weekKey = monday.toISOString().split('T')[0];
                
                // Calculate monthly stats
                const monthKey = w.date.substring(0, 7);
                
                const exercise = w.exercises.find(ex => ex.name === selectedExercise);
                if (exercise) {
                  const reps = exercise.sets.reduce((sum, s) => sum + (s.reps || 0), 0);
                  weekly[weekKey] = (weekly[weekKey] || 0) + reps;
                  monthly[monthKey] = (monthly[monthKey] || 0) + reps;
                }
              });
              
              return { weekly, monthly };
            })();
            
            return (
              <div className="space-y-4">
                {/* Back button */}
                <button
                  onClick={() => setSelectedExercise(null)}
                  className={`flex items-center gap-2 ${darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'}`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  <span className="font-semibold">Back to All Exercises</span>
                </button>
                
                <h2 className="text-2xl font-bold">{selectedExercise}</h2>
                
                {/* Weekly Volume */}
                <div className={`${darkMode ? 'bg-gray-800' : 'bg-white border border-gray-200'} rounded-xl p-4 shadow-md`}>
                  <h3 className="font-bold text-lg mb-3">Weekly Volume</h3>
                  <div className="space-y-2">
                    {Object.entries(stats.weekly)
                      .sort(([a], [b]) => b.localeCompare(a))
                      .map(([week, reps]) => (
                        <button
                          key={week}
                          onClick={() => {
                            const weekDate = new Date(week);
                            setLogCalendarDate(weekDate);
                            setView('home');
                            setTimeout(() => {
                              const weekStart = new Date(week);
                              const weekEnd = new Date(weekStart);
                              weekEnd.setDate(weekEnd.getDate() + 7);
                              
                              const firstWorkout = workouts.find(w => {
                                const wDate = new Date(w.date);
                                return wDate >= weekStart && wDate < weekEnd;
                              });
                              
                              if (firstWorkout) {
                                const element = document.querySelector(`[data-workout-date="${firstWorkout.date}"]`);
                                if (element) {
                                  const rect = element.getBoundingClientRect();
                                  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
                                  const targetY = rect.top + scrollTop - 70;
                                  window.scrollTo({ top: targetY, behavior: 'smooth' });
                                }
                              } else {
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                              }
                            }, 300);
                          }}
                          className={`flex items-center gap-2 w-full ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} rounded px-2 -mx-2 py-1`}
                        >
                          <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} w-24 text-right`}>
                            {new Date(week).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </span>
                          <div className={`flex-1 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded-full h-6 relative overflow-hidden`}>
                            <div
                              className="bg-gradient-to-r from-blue-500 to-purple-500 h-full rounded-full shadow-sm"
                              style={{
                                width: `${(reps / Math.max(...Object.values(stats.weekly))) * 100}%`
                              }}
                            />
                          </div>
                          <span className="text-base font-semibold w-16 text-right">{reps}</span>
                        </button>
                      ))}
                  </div>
                </div>
                
                {/* Monthly Volume */}
                <div className={`${darkMode ? 'bg-gray-800' : 'bg-white border border-gray-200'} rounded-xl p-4 shadow-md`}>
                  <h3 className="font-bold text-lg mb-3">Monthly Volume</h3>
                  <div className="space-y-2">
                    {Object.entries(stats.monthly)
                      .sort(([a], [b]) => b.localeCompare(a))
                      .map(([month, reps]) => (
                        <div key={month} className="flex items-center gap-2">
                          <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} w-24 text-right`}>{month}</span>
                          <div className={`flex-1 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded-full h-6 relative overflow-hidden`}>
                            <div
                              className="bg-green-500 h-full rounded-full"
                              style={{
                                width: `${(reps / Math.max(...Object.values(stats.monthly))) * 100}%`
                              }}
                            />
                          </div>
                          <span className="text-base font-semibold w-16 text-right">{reps}</span>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            );
          })()}
          
          {/* Body Weight View */}
          {view === 'stats' && statsView === 'weight' && (
            <div 
              className="space-y-3"
              onTouchStart={(e) => {
                e.currentTarget.dataset.swipeStartX = e.touches[0].clientX;
                e.currentTarget.dataset.swipeStartY = e.touches[0].clientY;
              }}
              onTouchMove={(e) => {
                const startX = parseFloat(e.currentTarget.dataset.swipeStartX);
                const startY = parseFloat(e.currentTarget.dataset.swipeStartY);
                const currentX = e.touches[0].clientX;
                const currentY = e.touches[0].clientY;
                const diffX = currentX - startX;
                const diffY = Math.abs(currentY - startY);
                
                if (Math.abs(diffX) > diffY && diffX > 20) {
                  e.currentTarget.style.transform = `translateX(${Math.min(diffX, 100)}px)`;
                  e.currentTarget.style.transition = 'none';
                }
              }}
              onTouchEnd={(e) => {
                const startX = parseFloat(e.currentTarget.dataset.swipeStartX);
                const currentX = e.changedTouches[0].clientX;
                const diffX = currentX - startX;
                
                e.currentTarget.style.transition = 'transform 0.2s ease-out';
                
                if (diffX > 100) {
                  e.currentTarget.style.transform = 'translateX(100%)';
                  setTimeout(() => {
                    setStatsView('menu');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                    e.currentTarget.style.transform = '';
                  }, 200);
                } else {
                  e.currentTarget.style.transform = '';
                }
              }}
            >
              <button
                onClick={() => {
                  setStatsView('menu');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className={`flex items-center gap-2 ${darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'} mb-2`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span className="font-semibold">Back to Stats</span>
              </button>
              
              <h2 className="text-base font-semibold mb-2">Body Weight</h2>
              
              {/* Add Weight Button */}
              <button
                onClick={() => {
                  const today = new Date();
                  setCurrentWeight({ date: getTodayDate(), weight: '', notes: '' });
                  setEditingWeight(null);
                  setWeightCalendarMonth(today.getMonth());
                  setWeightCalendarYear(today.getFullYear());
                  setShowWeightModal(true);
                }}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 rounded-xl p-3 mb-3 flex items-center justify-center gap-2 text-lg font-bold shadow-lg shadow-blue-500/30 transition-all active:scale-[0.98]"
              >
                <Icons.Plus className="w-6 h-6" />
                Add Weight Entry
              </button>
              
              {/* Stats Summary */}
              {weightEntries.length > 0 && (() => {
                const sorted = [...weightEntries].sort((a, b) => b.date.localeCompare(a.date));
                const latest = sorted[0];
                const oldest = sorted[sorted.length - 1];
                const change = latest.weight - oldest.weight;
                
                // Calculate weight change rate (lbs/week)
                const oldestDate = new Date(oldest.date);
                const latestDate = new Date(latest.date);
                const daysDiff = (latestDate - oldestDate) / (1000 * 60 * 60 * 24);
                const weeksDiff = daysDiff / 7;
                const changeRate = weeksDiff > 0 ? (change / weeksDiff).toFixed(2) : null;
                
                // Calculate 7-day average
                const sevenDaysAgo = new Date();
                sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
                const sevenDayStr = sevenDaysAgo.toISOString().split('T')[0];
                const recent7 = sorted.filter(e => e.date >= sevenDayStr);
                const avg7 = recent7.length > 0 ? (recent7.reduce((sum, e) => sum + parseFloat(e.weight), 0) / recent7.length).toFixed(1) : null;
                
                // Calculate 30-day average
                const thirtyDaysAgo = new Date();
                thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                const thirtyDayStr = thirtyDaysAgo.toISOString().split('T')[0];
                const recent30 = sorted.filter(e => e.date >= thirtyDayStr);
                const avg30 = recent30.length > 0 ? (recent30.reduce((sum, e) => sum + parseFloat(e.weight), 0) / recent30.length).toFixed(1) : null;
                
                return (
                  <div className={`${darkMode ? 'bg-gray-800' : 'bg-white border border-gray-200'} rounded-xl p-4 shadow-md mb-4`}>
                    <h3 className="font-bold text-lg mb-3">Summary</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'} uppercase tracking-wide mb-1`}>Current</div>
                        <div className="text-2xl font-bold">{latest.weight} <span className="text-sm font-normal">lbs</span></div>
                      </div>
                      <div>
                        <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'} uppercase tracking-wide mb-1`}>Starting</div>
                        <div className="text-2xl font-bold">{oldest.weight} <span className="text-sm font-normal">lbs</span></div>
                      </div>
                      <div>
                        <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'} uppercase tracking-wide mb-1`}>Total Change</div>
                        <div className="text-xl font-bold">
                          {change > 0 ? '+' : ''}{change.toFixed(1)} lbs
                        </div>
                      </div>
                      {changeRate && weeksDiff >= 1 && (
                        <div>
                          <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'} uppercase tracking-wide mb-1`}>Rate</div>
                          <div className="text-xl font-bold">
                            {changeRate > 0 ? '+' : ''}{changeRate} <span className="text-sm font-normal">lbs/week</span>
                          </div>
                        </div>
                      )}
                      <div>
                        <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'} uppercase tracking-wide mb-1`}>Entries</div>
                        <div className="text-xl font-bold">{weightEntries.length}</div>
                      </div>
                      {avg7 && (
                        <div>
                          <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'} uppercase tracking-wide mb-1`}>Avg (Last 7 Days)</div>
                          <div className="text-xl font-bold">{avg7} <span className="text-sm font-normal">lbs</span></div>
                        </div>
                      )}
                      {avg30 && (
                        <div>
                          <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'} uppercase tracking-wide mb-1`}>Avg (Last 30 Days)</div>
                          <div className="text-xl font-bold">{avg30} <span className="text-sm font-normal">lbs</span></div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}
              
              {/* Weight Chart */}
              {weightEntries.length > 1 && (() => {
                const sorted = [...weightEntries].sort((a, b) => a.date.localeCompare(b.date));
                const weights = sorted.map(e => parseFloat(e.weight));
                const dates = sorted.map(e => e.date);
                
                const minWeight = Math.min(...weights);
                const maxWeight = Math.max(...weights);
                const range = maxWeight - minWeight;
                const padding = range * 0.1 || 5; // Add 10% padding or 5 lbs if flat
                const chartMin = minWeight - padding;
                const chartMax = maxWeight + padding;
                const chartRange = chartMax - chartMin;
                
                // Chart dimensions
                const width = 100; // percentage
                const height = 180;
                const pointRadius = 4;
                
                // Generate SVG path
                const points = weights.map((w, i) => {
                  const x = (i / (weights.length - 1)) * 100;
                  const y = ((chartMax - w) / chartRange) * 100;
                  return { x, y, weight: w, date: dates[i] };
                });
                
                const pathData = points.map((p, i) => 
                  `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`
                ).join(' ');
                
                // Create gradient fill path (same as line but closed to bottom)
                const fillPath = `${pathData} L 100 100 L 0 100 Z`;
                
                return (
                  <div className={`${darkMode ? 'bg-gray-800' : 'bg-white border border-gray-200'} rounded-xl p-4 shadow-md mb-4`}>
                    <h3 className="font-bold text-lg mb-3">Weight Trend</h3>
                    <div className="relative" style={{ height: `${height}px` }}>
                      <svg 
                        viewBox="0 0 100 100" 
                        preserveAspectRatio="none"
                        className="absolute inset-0 w-full h-full"
                      >
                        {/* Gradient fill under line */}
                        <defs>
                          <linearGradient id="weightGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
                            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.05" />
                          </linearGradient>
                        </defs>
                        <path
                          d={fillPath}
                          fill="url(#weightGradient)"
                        />
                        {/* Line */}
                        <path
                          d={pathData}
                          fill="none"
                          stroke="#3b82f6"
                          strokeWidth="0.5"
                          vectorEffect="non-scaling-stroke"
                        />
                      </svg>
                      
                      {/* Data points */}
                      <svg 
                        viewBox="0 0 100 100" 
                        className="absolute inset-0 w-full h-full pointer-events-none"
                        preserveAspectRatio="none"
                      >
                        {points.map((p, i) => (
                          <g key={i}>
                            <circle
                              cx={p.x}
                              cy={p.y}
                              r="0.8"
                              fill="#3b82f6"
                              vectorEffect="non-scaling-stroke"
                            />
                          </g>
                        ))}
                      </svg>
                      
                      {/* Y-axis labels */}
                      <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-[10px] text-gray-500 pr-1">
                        <span>{chartMax.toFixed(0)}</span>
                        <span>{((chartMax + chartMin) / 2).toFixed(0)}</span>
                        <span>{chartMin.toFixed(0)}</span>
                      </div>
                      
                      {/* X-axis labels (first and last date) */}
                      <div className="absolute bottom-0 left-0 right-0 flex justify-between text-[10px] text-gray-500 pt-2">
                        <span>{new Date(dates[0]).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                        <span>{new Date(dates[dates.length - 1]).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                      </div>
                    </div>
                    <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'} text-center mt-4`}>
                      {weightEntries.length} data points • Showing all time
                    </div>
                  </div>
                );
              })()}
              
              {/* Recent Entries */}
              <div className="space-y-2">
                <h3 className={`text-sm font-bold ${darkMode ? 'text-gray-300' : 'text-gray-700'} uppercase tracking-wide`}>Weight History</h3>
                {[...weightEntries].sort((a, b) => b.date.localeCompare(a.date)).map((entry, i, arr) => {
                  const [year, month, day] = entry.date.split('-');
                  const dateObj = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
                  const dateStr = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                  
                  // Calculate change from previous entry
                  const prevEntry = arr[i + 1];
                  const change = prevEntry ? (entry.weight - prevEntry.weight) : 0;
                  
                  return (
                    <div key={i} className={`${darkMode ? 'bg-gray-800' : 'bg-white border border-gray-200'} rounded-xl p-3 shadow-md`}>
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-bold">{entry.weight}</span>
                            <span className="text-sm">lbs</span>
                            {prevEntry && (
                              <span className={`text-xs font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                {change > 0 ? '↑' : change < 0 ? '↓' : '→'} {Math.abs(change).toFixed(1)}
                              </span>
                            )}
                          </div>
                          <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} mt-1`}>{dateStr}</div>
                          {entry.notes && (
                            <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'} mt-1`}>{entry.notes}</div>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setCurrentWeight(entry);
                              setEditingWeight(i);
                              // Set calendar to the entry's month
                              const entryDate = new Date(entry.date + 'T00:00:00');
                              setWeightCalendarMonth(entryDate.getMonth());
                              setWeightCalendarYear(entryDate.getFullYear());
                              setShowWeightModal(true);
                            }}
                            className="text-blue-400 hover:text-blue-300 p-2"
                          >
                            <Icons.Edit />
                          </button>
                          <button
                            onClick={() => setDeleteWeight(i)}
                            className="text-red-400 hover:text-red-300 p-2"
                          >
                            <Icons.Trash />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
                
                {weightEntries.length === 0 && (
                  <div className={`${darkMode ? 'bg-gray-800' : 'bg-white border border-gray-200'} rounded-xl p-8 shadow-md text-center`}>
                    <div className="text-4xl mb-3">⚖️</div>
                    <div className={`text-lg font-semibold mb-2`}>No Weight Entries Yet</div>
                    <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Start tracking your weight by adding your first entry above
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Protein View */}
          {view === 'stats' && statsView === 'protein' && (
            <div 
              className="space-y-3"
              onTouchStart={(e) => {
                e.currentTarget.dataset.swipeStartX = e.touches[0].clientX;
              }}
              onTouchEnd={(e) => {
                const startX = parseFloat(e.currentTarget.dataset.swipeStartX);
                const endX = e.changedTouches[0].clientX;
                const diff = endX - startX;
                if (diff > 100) {
                  setStatsView('menu');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }
              }}
            >
              <div className="flex items-center gap-2 mb-2">
                <button
                  onClick={() => {
                    setStatsView('menu');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className={`${darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'} p-1`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <h2 className="text-xl font-bold">🥩 Protein Intake</h2>
              </div>
              
              {/* Quick Add */}
              <button
                onClick={() => setShowAddProtein(true)}
                className="w-full bg-green-600 hover:bg-green-700 px-4 py-3 rounded-xl text-base font-bold transition-colors flex items-center justify-center gap-2 shadow-md"
              >
                <span className="text-xl">+</span>
                Add Protein
              </button>
              
              {/* Last 14 Days with Edit */}
              <div className="space-y-2">
                {(() => {
                  const last14Days = [];
                  const now = new Date();
                  for (let i = 0; i < 14; i++) {
                    const date = new Date(now);
                    date.setDate(now.getDate() - i);
                    const dateStr = date.toISOString().split('T')[0];
                    const dayEntries = proteinEntries.filter(e => e.date === dateStr);
                    const total = dayEntries.reduce((sum, e) => sum + e.grams, 0);
                    const dayName = i === 0 ? 'Today' : i === 1 ? 'Yesterday' : date.toLocaleDateString('en-US', { weekday: 'short' });
                    const dateDisplay = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                    last14Days.push({ date: dateStr, dayName, dateDisplay, total, entries: dayEntries });
                  }
                  
                  return last14Days.map(({ date, dayName, dateDisplay, total, entries }) => (
                    <div key={date} className={`${darkMode ? 'bg-gray-800' : 'bg-white border border-gray-200'} rounded-xl p-3 shadow-md`}>
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <div className="font-bold text-base">{dayName}</div>
                          <div className="text-xs text-gray-500">{dateDisplay}</div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <div className="text-2xl font-black text-green-500">{total}g</div>
                            <div className="text-xs text-gray-500">{entries.length} meal{entries.length !== 1 ? 's' : ''}</div>
                          </div>
                          <button
                            onClick={() => setEditingProteinDate(date)}
                            className={`${darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'} p-2`}
                            title="Edit"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                        </div>
                      </div>
                      
                      {entries.length > 0 && (
                        <div className={`${darkMode ? 'bg-gray-700/50' : 'bg-gray-50'} rounded-lg p-2 space-y-1`}>
                          {entries.map((entry) => (
                            <div key={entry.timestamp} className="flex items-center justify-between text-sm">
                              <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>{entry.food}</span>
                              <span className="font-bold">{entry.grams}g</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ));
                })()}
              </div>
            </div>
          )}
          
          {/* Progress Charts View */}
          {view === 'stats' && statsView === 'progress' && (
            <div 
              className="space-y-3"
              onTouchStart={(e) => {
                e.currentTarget.dataset.swipeStartX = e.touches[0].clientX;
                e.currentTarget.dataset.swipeStartY = e.touches[0].clientY;
              }}
              onTouchMove={(e) => {
                const startX = parseFloat(e.currentTarget.dataset.swipeStartX);
                const startY = parseFloat(e.currentTarget.dataset.swipeStartY);
                const currentX = e.touches[0].clientX;
                const currentY = e.touches[0].clientY;
                const diffX = currentX - startX;
                const diffY = Math.abs(currentY - startY);
                
                // Only swipe if horizontal movement is greater than vertical
                if (Math.abs(diffX) > diffY && diffX > 20) {
                  e.currentTarget.style.transform = `translateX(${Math.min(diffX, 100)}px)`;
                  e.currentTarget.style.transition = 'none';
                }
              }}
              onTouchEnd={(e) => {
                const startX = parseFloat(e.currentTarget.dataset.swipeStartX);
                const currentX = e.changedTouches[0].clientX;
                const diffX = currentX - startX;
                
                e.currentTarget.style.transition = 'transform 0.2s ease-out';
                
                if (diffX > 100) {
                  // Swipe right to go back
                  e.currentTarget.style.transform = 'translateX(100%)';
                  setTimeout(() => {
                    setStatsView('menu');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                    e.currentTarget.style.transform = '';
                  }, 200);
                } else {
                  e.currentTarget.style.transform = '';
                }
              }}
            >
              <div className="flex items-center gap-2 mb-3">
                <button
                  onClick={() => {
                    setStatsView('menu');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="text-blue-400 hover:text-blue-300"
                >
                  ← Back
                </button>
                <h2 className="text-base font-semibold">Progress Charts</h2>
              </div>
              
              {workouts.length === 0 ? (
                <div className={`${darkMode ? 'bg-gray-800' : 'bg-white border border-gray-200'} rounded-xl p-8 text-center shadow-md`}>
                  <div className="text-4xl mb-3">📊</div>
                  <div className="text-lg font-semibold mb-2">No Workout Data</div>
                  <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Start logging workouts to see your progress!
                  </div>
                </div>
              ) : (
                <>
                  {/* Volume Trend Chart */}
                  {(() => {
                    // Get Monday of current week
                    const now = new Date();
                    const currentDay = now.getDay(); // 0 = Sunday
                    const daysToMonday = currentDay === 0 ? 6 : currentDay - 1; // Days since last Monday
                    const thisMonday = new Date(now);
                    thisMonday.setDate(now.getDate() - daysToMonday);
                    thisMonday.setHours(0, 0, 0, 0);
                    
                    const weeklyData = [];
                    for (let i = 11; i >= 0; i--) {
                      const weekStart = new Date(thisMonday);
                      weekStart.setDate(thisMonday.getDate() - (i * 7));
                      const weekEnd = new Date(weekStart);
                      weekEnd.setDate(weekStart.getDate() + 7);
                      
                      const weekWorkouts = workouts.filter(w => {
                        const wDate = new Date(w.date);
                        return wDate >= weekStart && wDate < weekEnd;
                      });
                      
                      const totalReps = weekWorkouts.reduce((sum, w) => {
                        return sum + w.exercises.reduce((exSum, ex) => {
                          return exSum + ex.sets.reduce((setSum, s) => setSum + (s.reps || 0), 0);
                        }, 0);
                      }, 0);
                      
                      weeklyData.push({
                        label: `${weekStart.getMonth() + 1}/${weekStart.getDate()}`,
                        value: totalReps,
                        isCurrentWeek: i === 0
                      });
                    }
                    
                    const maxVolume = Math.max(...weeklyData.map(d => d.value), 1);
                    
                    return (
                      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white border border-gray-200'} rounded-xl p-4 shadow-md`}>
                        <h3 className="font-bold text-lg mb-1">Volume Trend</h3>
                        <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-4`}>
                          Total reps per week (last 12 weeks)
                        </div>
                        
                        {/* Chart */}
                        <div className="h-48 flex items-end gap-1">
                          {weeklyData.map((week, i) => {
                            const height = maxVolume > 0 ? (week.value / maxVolume) * 100 : 0;
                            return (
                              <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
                                <div className="w-full flex flex-col justify-end relative" style={{ height: '170px' }}>
                                  {week.value > 0 && (
                                    <>
                                      <div 
                                        className="w-full bg-gradient-to-t from-blue-600 to-blue-400 rounded-t transition-all hover:opacity-80"
                                        style={{ height: `${height}%` }}
                                      />
                                      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                        {week.value}
                                      </div>
                                    </>
                                  )}
                                </div>
                                <div className={`text-[9px] ${darkMode ? 'text-gray-500' : 'text-gray-600'} truncate w-full text-center ${week.isCurrentWeek ? 'font-bold text-blue-400' : ''}`}>
                                  {week.label}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        
                        <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'} mt-3 text-center`}>
                          This week: {weeklyData[weeklyData.length - 1].value} reps
                        </div>
                      </div>
                    );
                  })()}
                  
                  {/* Workout Frequency Chart */}
                  {(() => {
                    // Get Monday of current week
                    const now = new Date();
                    const currentDay = now.getDay();
                    const daysToMonday = currentDay === 0 ? 6 : currentDay - 1;
                    const thisMonday = new Date(now);
                    thisMonday.setDate(now.getDate() - daysToMonday);
                    thisMonday.setHours(0, 0, 0, 0);
                    
                    const weeklyWorkouts = [];
                    for (let i = 11; i >= 0; i--) {
                      const weekStart = new Date(thisMonday);
                      weekStart.setDate(thisMonday.getDate() - (i * 7));
                      const weekEnd = new Date(weekStart);
                      weekEnd.setDate(weekStart.getDate() + 7);
                      
                      const count = workouts.filter(w => {
                        const wDate = new Date(w.date);
                        return wDate >= weekStart && wDate < weekEnd;
                      }).length;
                      
                      weeklyWorkouts.push({
                        label: `${weekStart.getMonth() + 1}/${weekStart.getDate()}`,
                        count: count,
                        isCurrentWeek: i === 0
                      });
                    }
                    
                    const maxCount = Math.max(...weeklyWorkouts.map(d => d.count), 1);
                    const avgWorkouts = (weeklyWorkouts.reduce((sum, w) => sum + w.count, 0) / 12).toFixed(1);
                    
                    return (
                      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white border border-gray-200'} rounded-xl p-4 shadow-md`}>
                        <h3 className="font-bold text-lg mb-1">Workout Frequency</h3>
                        <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-4`}>
                          Workouts per week (last 12 weeks)
                        </div>
                        
                        {/* Chart */}
                        <div className="h-48 flex items-end gap-1">
                          {weeklyWorkouts.map((week, i) => {
                            const height = maxCount > 0 ? (week.count / maxCount) * 100 : 0;
                            return (
                              <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
                                <div className="w-full flex flex-col justify-end relative" style={{ height: '170px' }}>
                                  {week.count > 0 && (
                                    <>
                                      <div 
                                        className="w-full bg-gradient-to-t from-green-600 to-green-400 rounded-t transition-all hover:opacity-80"
                                        style={{ height: `${height}%` }}
                                      />
                                      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-green-600 text-white text-xs font-bold px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                        {week.count}
                                      </div>
                                    </>
                                  )}
                                </div>
                                <div className={`text-[9px] ${darkMode ? 'text-gray-500' : 'text-gray-600'} truncate w-full text-center ${week.isCurrentWeek ? 'font-bold text-green-400' : ''}`}>
                                  {week.label}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        
                        <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'} mt-3 text-center`}>
                          Average: {avgWorkouts} workouts/week • This week: {weeklyWorkouts[weeklyWorkouts.length - 1].count}
                        </div>
                      </div>
                    );
                  })()}
                </>
              )}
            </div>
          )}
          
      {view === 'settings' && (
          <SettingsView
            darkMode={darkMode}
            workouts={workouts}
            presets={presets}
            exercises={exercises}
            weightEntries={weightEntries}
            proteinEntries={proteinEntries}
            setWorkouts={setWorkouts}
            setPresets={setPresets}
            setExercises={setExercises}
            setWeightEntries={setWeightEntries}
            setProteinEntries={setProteinEntries}
            setTheme={setTheme}
            theme={theme}
            setShowHomeV1={setShowHomeV1}
            showHomeV1={showHomeV1}
            exportCSV={exportCSV}
            importWorkouts={importWorkouts}
            setShowClear={setShowClear}
          />
        )}
      </div> {/* This closes the max-w-4xl container for the views */}

      {/* Day Details Modal */}
      {showDayModal && selectedDay &&
        (() => {
          const workout = workouts.find(w => w.date === selectedDay);
          if (!workout) return null;
        
        {/* Day Details Modal */}
      {showDayModal && selectedDay &&
        (() => {
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
                className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-t-2xl w-full max-h-[80vh] overflow-y-auto pb-8`} 
                onClick={(e) => e.stopPropagation()}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                {/* Drag handle */}
                <div className="flex justify-center pt-3 pb-2">
                  <div className={`w-10 h-1 ${darkMode ? 'bg-gray-600' : 'bg-gray-300'} rounded-full`}></div>
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
{workout.exercises.map((ex, ei) => {
                      const totalReps = ex.sets.reduce((sum, s) => sum + (s.reps || 0), 0);
                      return (
                        <div key={ei} className={`mb-4 last:mb-0 p-3 rounded-xl ${darkMode ? 'bg-gray-700/30' : 'bg-gray-50'}`}>
                          <div className="flex justify-between items-start mb-2">
                            <div className="font-bold text-base">{ex.name}</div>
                            <div className={`text-xs font-bold px-2 py-0.5 rounded-full ${darkMode ? 'bg-blue-900/50 text-blue-300' : 'bg-blue-100 text-blue-700'}`}>
                              {totalReps} Total Reps
                            </div>
                          </div>
                          <div className="grid grid-cols-4 gap-2">
                            {ex.sets.map((set, si) => (
                              <div key={si} className="text-center">
                                <div className="text-[10px] text-gray-500 uppercase font-bold mb-0.5">Set {si + 1}</div>
                                <div className={`text-sm font-black ${set.reps > 0 ? (darkMode ? 'text-white' : 'text-gray-900') : 'text-gray-400'}`}>
                                  {set.reps || 0}
                                  {set.weight ? <span className="text-[10px] ml-0.5 text-blue-400">{set.weight}lb</span> : ''}
                                </div>
                              </div>
                            ))}
                          </div>
                          {ex.notes && (
                            <div className="text-xs text-gray-500 mt-2 italic border-l-2 border-gray-600 pl-2">{ex.notes}</div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  
                  {workout.notes && (
                    <div className="mt-4 text-sm text-gray-400 border-t border-gray-700 pt-3 px-4 italic">
                      {workout.notes}
                    </div>
                  )}
                </div>
              </div>
            );
          })()
        }

        {/* Navigation Bar */}
        <nav className={`fixed bottom-0 left-0 right-0 ${darkMode ? 'bg-gray-900/95 border-gray-800' : 'bg-white/95 border-gray-200'} backdrop-blur-md border-t px-6 pb-safe z-40`}>
          <div className="max-w-lg mx-auto flex justify-between">
            <button 
              onClick={() => setView('home')}
              className={`flex flex-col items-center py-3 px-2 ${view === 'home' ? 'text-blue-500' : 'text-gray-500'}`}
            >
              <Icons.Home className="w-6 h-6" />
              <span className="text-[10px] mt-1 font-bold uppercase tracking-wider">Log</span>
            </button>
            <button 
              onClick={() => setView('stats')}
              className={`flex flex-col items-center py-3 px-2 ${view === 'stats' ? 'text-blue-500' : 'text-gray-500'}`}
            >
              <Icons.Stats className="w-6 h-6" />
              <span className="text-[10px] mt-1 font-bold uppercase tracking-wider">Stats</span>
            </button>
            <button 
              onClick={() => setView('settings')}
              className={`flex flex-col items-center py-3 px-2 ${view === 'settings' ? 'text-blue-500' : 'text-gray-500'}`}
            >
              <Icons.Settings className="w-6 h-6" />
              <span className="text-[10px] mt-1 font-bold uppercase tracking-wider">Settings</span>
            </button>
          </div>
        </nav>
      </div>
    </div>
  );
}
