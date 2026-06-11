'use client';

import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { X, Plus, Play, Pause } from 'lucide-react';
import { useTimer } from '@/hooks/useTimer';
import { getTodayStr } from '@/utils/format';
import { getItem, setItem, removeItem } from '@/utils/storage';
import { PRESET_COLORS } from '@/hooks/usePresets';
import ProgressExerciseCard from './ProgressExerciseCard';
import RestTimerBar from './RestTimerBar';
import { getActivePairIndices, getActiveSetColumn } from '@/utils/workout-structure';

const STRUCTURES = [
  { id: 'pairs', label: 'Pairs' },
  { id: 'circuit', label: 'Circuit' },
];

const INTERVALS = [3, 4, 5];

// localStorage key (via storage.js wrapper) for the in-progress workout snapshot
const SNAPSHOT_KEY = 'inprogress_workout';

function createExerciseSets(name, numSets = 4) {
  return {
    name,
    sets: Array.from({ length: numSets }, () => ({ reps: '', weight: null })),
    notes: '',
  };
}

/**
 * Renders ProgressExerciseCards with pairs grouping or circuit column highlighting.
 */
function ProgressExerciseList({ exercises, structure, activeExerciseIndex, onUpdate, onRemove, onRename, disabled, lastSessionMap }) {
  const activeSetCol = structure === 'circuit' ? getActiveSetColumn(exercises) : -1;
  const [pairStart, pairEnd] = structure === 'pairs'
    ? getActivePairIndices(exercises.length, activeExerciseIndex)
    : [-1, -1];

  // Group exercises into pairs for visual grouping
  if (structure === 'pairs') {
    const groups = [];
    for (let i = 0; i < exercises.length; i += 2) {
      const pair = exercises.slice(i, Math.min(i + 2, exercises.length));
      const groupStart = i;
      const isActivePair = groupStart >= pairStart && groupStart <= pairEnd;
      groups.push({ exercises: pair, startIdx: i, isActivePair });
    }

    return groups.map((group) => {
      const isActive = group.isActivePair && activeExerciseIndex >= 0;
      return (
        <div
          key={group.startIdx}
          className="rounded-lg mb-1.5"
          style={{
            border: isActive ? '2px solid var(--color-accent)' : '2px solid transparent',
            padding: isActive ? '2px' : '2px',
          }}
        >
          {group.exercises.map((exercise, i) => {
            const idx = group.startIdx + i;
            return (
              <ProgressExerciseCard
                key={exercise.name}
                exercise={exercise}
                index={idx}
                isActive={idx === activeExerciseIndex}
                onUpdate={onUpdate}
                onRemove={onRemove}
                onRename={onRename}
                disabled={disabled}
                activeSetCol={-1}
                lastSession={lastSessionMap?.[exercise.name] || null}
              />
            );
          })}
        </div>
      );
    });
  }

  // Circuit or standard — render flat list with activeSetCol
  return exercises.map((exercise, idx) => (
    <ProgressExerciseCard
      key={exercise.name}
      exercise={exercise}
      index={idx}
      isActive={idx === activeExerciseIndex}
      onUpdate={onUpdate}
      onRemove={onRemove}
      onRename={onRename}
      disabled={disabled}
      activeSetCol={activeSetCol}
      lastSession={lastSessionMap?.[exercise.name] || null}
    />
  ));
}

export default function WorkoutEntry({ preset, exercises: exerciseLibrary, workouts, onSave, onCancel, existingWorkout, restoredSnapshot = null, minimized = false, onMinimize }) {
  const isEditing = !!existingWorkout;

  const [workoutStarted, setWorkoutStarted] = useState(() => (restoredSnapshot ? !!restoredSnapshot.workoutStarted : isEditing));
  // When restoring a snapshot, resume the timer paused at its last persisted value —
  // the user taps resume; dead time while the PWA was evicted is not counted.
  const [paused, setPaused] = useState(() => (restoredSnapshot ? !!restoredSnapshot.workoutStarted && !isEditing : false));
  const { elapsedSeconds } = useTimer(workoutStarted && !paused && !isEditing, restoredSnapshot?.timer?.elapsed || 0);

  // Rest-interval countdown. State lives here (not in RestTimerBar) so it
  // survives minimize — this component returns null when minimized but stays mounted.
  // Duration is remembered per preset; snapshot value wins when restoring.
  const [restDuration, setRestDuration] = useState(() => {
    if (restoredSnapshot?.restDuration) return restoredSnapshot.restDuration;
    const map = getItem('rest_durations', null);
    return (map && map[preset.name]) || 180;
  });
  const [restEndsAt, setRestEndsAt] = useState(null);   // deliberately NOT persisted in the snapshot
  const [restTotalSec, setRestTotalSec] = useState(180);
  const [restExerciseName, setRestExerciseName] = useState(null); // exercise whose set edit started the rest

  const [workoutExercises, setWorkoutExercises] = useState(() => {
    if (restoredSnapshot && restoredSnapshot.exercises && restoredSnapshot.exercises.length > 0) {
      return restoredSnapshot.exercises.map(ex => ({
        name: ex.name,
        sets: (ex.sets || []).map(s => ({ reps: s.reps !== null && s.reps !== undefined ? s.reps : '', weight: s.weight || null })),
        notes: ex.notes || '',
      }));
    }
    if (existingWorkout) {
      return existingWorkout.exercises.map(ex => ({
        name: ex.name,
        sets: ex.sets.map(s => ({ reps: s.reps !== null && s.reps !== undefined ? String(s.reps) : '', weight: s.weight || null })),
        notes: ex.notes || '',
      }));
    }
    return preset.exercises.map(name => createExerciseSets(name));
  });
  const [structure, setStructure] = useState(() => {
    if (restoredSnapshot) return restoredSnapshot.structure || 'standard';
    return existingWorkout ? existingWorkout.structure || 'standard' : 'standard';
  });
  const [structureDuration, setStructureDuration] = useState(() => {
    if (restoredSnapshot) return restoredSnapshot.structureDuration || 4;
    return existingWorkout ? existingWorkout.structureDuration || 4 : 4;
  });
  const [workoutNotes, setWorkoutNotes] = useState(() => {
    if (restoredSnapshot) return restoredSnapshot.notes || '';
    return existingWorkout ? existingWorkout.notes || '' : '';
  });
  const [showAddExercise, setShowAddExercise] = useState(false);
  const [addExerciseSearch, setAddExerciseSearch] = useState('');
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null); // exercise name pending delete confirmation

  const presetColor = PRESET_COLORS[preset.color] || 'var(--color-accent)';

  // Lock body scroll when workout overlay is visible (not minimized)
  const savedScrollRef = useRef(0);
  useEffect(() => {
    if (minimized) {
      // Restore body when minimized
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.left = '';
      document.body.style.right = '';
      document.body.style.overflow = '';
      window.scrollTo(0, savedScrollRef.current);
      return;
    }
    // Lock body in place
    savedScrollRef.current = window.scrollY;
    document.body.style.position = 'fixed';
    document.body.style.top = `-${savedScrollRef.current}px`;
    document.body.style.left = '0';
    document.body.style.right = '0';
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.left = '';
      document.body.style.right = '';
      document.body.style.overflow = '';
      window.scrollTo(0, savedScrollRef.current);
    };
  }, [minimized]);

  // Detect virtual keyboard open via visualViewport API.
  // NOTE: comparing against window.innerHeight does NOT work in standalone
  // PWA mode — iOS shrinks innerHeight together with the visual viewport, so
  // the difference stays ~0. Instead compare against the LARGEST viewport
  // height seen (the keyboard-closed baseline): a 150px+ drop = keyboard.
  const [keyboardOpen, setKeyboardOpen] = useState(false);
  const vvBaselineRef = useRef(0);
  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;
    const check = () => {
      vvBaselineRef.current = Math.max(vvBaselineRef.current, vv.height);
      setKeyboardOpen(vvBaselineRef.current - vv.height > 150);
    };
    check();
    vv.addEventListener('resize', check);
    vv.addEventListener('scroll', check);
    return () => {
      vv.removeEventListener('resize', check);
      vv.removeEventListener('scroll', check);
    };
  }, []);

  // While the keyboard is up, the rest timer bar is re-rendered in a fixed
  // top:0 wrapper pinned to the VISUAL viewport: iOS pans the visual viewport
  // to keep the focused input in view, so we translate the wrapper down by
  // visualViewport.offsetTop on every vv resize/scroll event. The transform is
  // written straight to the DOM node (no state) so tracking is re-render free.
  // The wrapper's CSS top is env(safe-area-inset-top) (same as the sheet), so
  // the translate is clamped to never lift the bar into the notch when
  // offsetTop is 0 or smaller than the inset (keyboard open but little/no pan).
  const pinnedBarRef = useRef(null);
  const positionPinnedBar = useCallback((node) => {
    if (!node || typeof window === 'undefined' || !window.visualViewport) return;
    const safeTop = parseFloat(window.getComputedStyle(node).top) || 0;
    const y = Math.max(0, window.visualViewport.offsetTop - safeTop);
    node.style.transform = `translate3d(0, ${y}px, 0)`;
  }, []);
  // Callback ref: position immediately when the wrapper mounts (keyboard just opened)
  const setPinnedBarRef = useCallback((node) => {
    pinnedBarRef.current = node;
    positionPinnedBar(node);
  }, [positionPinnedBar]);
  useEffect(() => {
    if (typeof window === 'undefined' || !window.visualViewport) return;
    const vv = window.visualViewport;
    const reposition = () => positionPinnedBar(pinnedBarRef.current);
    vv.addEventListener('resize', reposition);
    vv.addEventListener('scroll', reposition);
    return () => {
      vv.removeEventListener('resize', reposition);
      vv.removeEventListener('scroll', reposition);
    };
  }, [positionPinnedBar]);

  // Last-session ghosts: for each exercise in the entry, find the most recent
  // workout (not a run / day off, not the workout being edited) containing it.
  const lastSessionMap = useMemo(() => {
    const map = {};
    if (!workouts || workouts.length === 0) return map;
    for (const ex of workoutExercises) {
      // workouts is sorted date-desc, so the first match is the most recent
      const prevWorkout = workouts.find(w => {
        if (w.isRun || w.isDayOff) return false;
        if (existingWorkout) {
          if (w.id === existingWorkout.id) return false;
          if (w.date > existingWorkout.date) return false;
        }
        return (w.exercises || []).some(e => e.name === ex.name);
      });
      if (prevWorkout) {
        const prevEx = prevWorkout.exercises.find(e => e.name === ex.name);
        const reps = (prevEx.sets || []).map(s => Number(s.reps) || 0);
        if (reps.length > 0) {
          map[ex.name] = { reps, total: reps.reduce((sum, r) => sum + r, 0) };
        }
      }
    }
    return map;
  }, [workouts, workoutExercises, existingWorkout]);

  // Persist an in-progress snapshot so the session survives iOS PWA eviction.
  // Don't write anything for an untouched fresh form.
  const hasInteracted = workoutStarted
    || workoutNotes.trim() !== ''
    || workoutExercises.some(ex => ex.sets.some(s => s.reps !== '' && s.reps !== null));
  useEffect(() => {
    if (!hasInteracted) return;
    setItem(SNAPSHOT_KEY, {
      presetName: preset.name,
      exercises: workoutExercises,
      notes: workoutNotes,
      structure,
      structureDuration,
      workoutStarted,
      timer: { elapsed: elapsedSeconds, isPaused: paused },
      editingWorkoutId: existingWorkout?.id || null,
      restDuration,
      savedAt: Date.now(),
    });
  }, [hasInteracted, preset.name, workoutExercises, workoutNotes, structure, structureDuration, workoutStarted, elapsedSeconds, paused, existingWorkout, restDuration]);

  const handleSelectRestDuration = useCallback((seconds) => {
    setRestDuration(seconds);
    const map = getItem('rest_durations', {}) || {};
    map[preset.name] = seconds;
    setItem('rest_durations', map);
  }, [preset.name]);

  const handleRestClear = useCallback(() => {
    setRestEndsAt(null);
  }, []);

  // Ref mirror of the exercises state — handleExerciseUpdate compares incoming
  // updates against it to detect rep changes without touching ProgressExerciseCard.
  const prevExercisesRef = useRef(workoutExercises);
  useEffect(() => {
    prevExercisesRef.current = workoutExercises;
  }, [workoutExercises]);

  // Next-exercise hint: the exercise after the one just edited that still has
  // at least one empty set, wrapping around (the edited one itself is the last candidate).
  const nextRestName = useMemo(() => {
    if (!restExerciseName) return null;
    const idx = workoutExercises.findIndex(ex => ex.name === restExerciseName);
    if (idx === -1) return null;
    const n = workoutExercises.length;
    for (let off = 1; off <= n; off++) {
      const ex = workoutExercises[(idx + off) % n];
      if (ex.sets.some(s => s.reps === '' || s.reps === null || s.reps === 0)) return ex.name;
    }
    return null;
  }, [workoutExercises, restExerciseName]);

  // Central hook point for all set/note changes coming up from ProgressExerciseCard.
  // Auto-trigger: whenever a set's reps value changes to a number > 0 while the
  // workout is running (and not paused / not editing), (re)start the rest countdown.
  const handleExerciseUpdate = useCallback((updated) => {
    const prevEx = prevExercisesRef.current.find(ex => ex.name === updated.name);
    setWorkoutExercises(prev =>
      prev.map(ex => ex.name === updated.name ? updated : ex)
    );
    if (!workoutStarted || isEditing || paused || !prevEx) return;
    for (let i = 0; i < updated.sets.length; i++) {
      const newReps = updated.sets[i].reps;
      if (newReps !== prevEx.sets[i]?.reps && Number(newReps) > 0) {
        setRestExerciseName(updated.name);
        setRestTotalSec(restDuration);
        setRestEndsAt(Date.now() + restDuration * 1000);
        return;
      }
    }
  }, [workoutStarted, isEditing, paused, restDuration]);

  const handleExerciseRemoveRequest = useCallback((name) => {
    setDeleteTarget(name);
  }, []);

  const handleExerciseRemoveConfirm = useCallback(() => {
    if (!deleteTarget) return;
    setWorkoutExercises(prev => prev.filter(ex => ex.name !== deleteTarget));
    setDeleteTarget(null);
  }, [deleteTarget]);

  // Rename picker state
  const [renameTarget, setRenameTarget] = useState(null); // name of exercise being renamed
  const [renameSearch, setRenameSearch] = useState('');

  const handleRenameStart = useCallback((currentName) => {
    setRenameTarget(currentName);
    setRenameSearch('');
  }, []);

  const handleRenameConfirm = useCallback((newName) => {
    if (!renameTarget || newName === renameTarget) {
      setRenameTarget(null);
      return;
    }
    setWorkoutExercises(prev =>
      prev.map(ex => ex.name === renameTarget ? { ...ex, name: newName } : ex)
    );
    setRenameTarget(null);
    setRenameSearch('');
  }, [renameTarget]);

  const handleAddExercise = useCallback((name) => {
    setWorkoutExercises(prev => [...prev, createExerciseSets(name)]);
    setShowAddExercise(false);
    setAddExerciseSearch('');
  }, []);

  const handleSave = () => {
    const filledExercises = workoutExercises
      .map(ex => ({
        name: ex.name,
        sets: ex.sets
          .filter(s => s.reps !== '' && s.reps !== null)
          .map(s => ({ reps: Number(s.reps) || 0, weight: s.weight })),
        notes: ex.notes || '',
      }))
      .filter(ex => ex.sets.length > 0);

    removeItem(SNAPSHOT_KEY);
    onSave({
      date: isEditing ? existingWorkout.date : getTodayStr(),
      exercises: filledExercises,
      notes: workoutNotes.trim(),
      location: preset.name,
      structure,
      structureDuration: structure !== 'standard' ? Number(structureDuration) : null,
      elapsedTime: isEditing ? existingWorkout.elapsedTime : elapsedSeconds,
      isDayOff: false,
    });
  };

  const handleClose = () => {
    if (workoutStarted) {
      setShowCancelConfirm(true);
    } else {
      removeItem(SNAPSHOT_KEY);
      onCancel();
    }
  };

  const handleDiscardConfirm = useCallback(() => {
    removeItem(SNAPSHOT_KEY);
    onCancel();
  }, [onCancel]);

  // Available exercises to add (not already in workout)
  const currentNames = new Set(workoutExercises.map(e => e.name));
  const availableExercises = (exerciseLibrary || [])
    .filter(name => !currentNames.has(name))
    .filter(name => !addExerciseSearch || name.toLowerCase().includes(addExerciseSearch.toLowerCase()));

  // Progress tracking for progress UI mode
  const totalExercises = workoutExercises.length;
  const completedExercises = workoutExercises.filter(ex =>
    ex.sets.length > 0 && ex.sets.every(s => s.reps !== '' && s.reps !== 0 && s.reps !== null)
  ).length;
  // First exercise that isn't fully filled = active
  const activeExerciseIndex = workoutExercises.findIndex(ex =>
    !ex.sets.every(s => s.reps !== '' && s.reps !== 0 && s.reps !== null)
  );

  // Compact structure badge shown inside the rest timer bar once the workout
  // is running (the interactive structure row is hidden after start).
  const structureLabel = structure === 'standard'
    ? null
    : structure === 'pairs'
      ? (structureDuration ? `Pairs ${structureDuration}'` : 'Pairs')
      : 'Circuit';

  // Swipe-down gesture for minimizing
  const touchStartRef = useRef(null);
  const handleSwipeStart = useCallback((e) => {
    touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  }, []);
  const handleSwipeEnd = useCallback((e) => {
    if (!touchStartRef.current || !onMinimize) return;
    const dx = e.changedTouches[0].clientX - touchStartRef.current.x;
    const dy = e.changedTouches[0].clientY - touchStartRef.current.y;
    touchStartRef.current = null;
    // Swipe down: dy > 80px and mostly vertical
    if (dy > 80 && Math.abs(dy) > Math.abs(dx) * 1.5) {
      // Dismiss keyboard before minimizing
      if (document.activeElement) document.activeElement.blur();
      onMinimize();
    }
  }, [onMinimize]);

  // When minimized, render nothing — component stays mounted so timer & state persist
  if (minimized) return null;

  return (
    <>
    {/* Backdrop — must be above bottom nav (z-9990) */}
    <div
      className="fixed inset-0"
      style={{ backgroundColor: 'rgba(0,0,0,0.5)', touchAction: 'none', zIndex: 10000 }}
    />
    {/* Sheet — above nav and backdrop */}
    <div
      className="fixed flex flex-col"
      style={{
        top: 'env(safe-area-inset-top)',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'var(--color-bg)',
        overscrollBehavior: 'contain',
        borderRadius: '1rem 1rem 0 0',
        zIndex: 10001,
      }}
    >
      {/* Drag handle + Header — swipeable area for minimizing */}
      <div
        className="shrink-0"
        onTouchStart={handleSwipeStart}
        onTouchEnd={handleSwipeEnd}
      >
      <div className="flex justify-center pt-2 pb-1">
        <div className="w-10 h-1 rounded-full" style={{ backgroundColor: 'var(--color-border)' }} />
      </div>

      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3"
        style={{ borderBottom: '1px solid var(--color-border)' }}
      >
        <div className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: presetColor }}
          />
          <span className="text-[13px] uppercase" style={{ color: 'var(--color-text)', fontWeight: 800, letterSpacing: '0.04em' }}>
            {preset.name}
          </span>
        </div>
        <div className="flex items-center gap-3">
          {workoutStarted && !isEditing && (
            /* Pause/Resume button — elapsed time now lives in the rest timer bar */
            <button
              onClick={() => { if (!paused) setRestEndsAt(null); setPaused(p => !p); }}
              className="w-8 h-8 rounded-md flex items-center justify-center"
              style={{
                backgroundColor: paused ? 'var(--color-green)' : 'var(--color-surface-hover)',
              }}
              aria-label={paused ? 'Resume timer' : 'Pause timer'}
            >
              {paused
                ? <Play size={13} color="#ffffff" />
                : <Pause size={15} style={{ color: 'var(--color-text-muted)' }} />
              }
            </button>
          )}
          {isEditing && (
            <span
              className="text-[10px] uppercase px-2 py-1 rounded-full"
              style={{ backgroundColor: 'var(--color-surface-hover)', color: 'var(--color-text-muted)', fontWeight: 700, letterSpacing: '0.06em' }}
            >
              Editing
            </span>
          )}
          <button onClick={handleClose} className="p-1" aria-label="Close workout">
            <X size={20} style={{ color: 'var(--color-text-muted)' }} />
          </button>
        </div>
      </div>
      </div>{/* end swipeable area */}

      {/* Rest timer bar — only while a live workout is running, never in edit mode.
          When the iOS keyboard pans the visual viewport, the bar moves into a
          fixed wrapper pinned to the visible area (condensed single-line variant);
          when the keyboard closes it returns to its normal in-flow position. */}
      {workoutStarted && !isEditing && (
        keyboardOpen ? (
          <div
            ref={setPinnedBarRef}
            className="fixed left-0 right-0 safe-top"
            style={{
              top: 0, // .safe-top pads below the status bar (handles standalone mode where env() is 0)
              zIndex: 80, // above sheet content, below the 10003 modals in this stacking context
              backgroundColor: 'var(--color-bg)',
              willChange: 'transform',
            }}
          >
            <RestTimerBar
              condensed
              restEndsAt={restEndsAt}
              restTotalSec={restTotalSec}
              elapsedSeconds={elapsedSeconds}
              nextName={nextRestName}
              restDuration={restDuration}
              onSelectDuration={handleSelectRestDuration}
              onSkip={handleRestClear}
            />
          </div>
        ) : (
          <RestTimerBar
            restEndsAt={restEndsAt}
            restTotalSec={restTotalSec}
            elapsedSeconds={elapsedSeconds}
            nextName={nextRestName}
            restDuration={restDuration}
            onSelectDuration={handleSelectRestDuration}
            onSkip={handleRestClear}
            structureLabel={structureLabel}
          />
        )
      )}

      {/* Structure bar — pre-start (and edit mode) only. Once the workout is
          running it collapses into a read-only badge inside the rest timer bar,
          so structure can no longer be changed mid-workout (accepted). */}
      {!(workoutStarted && !isEditing) && (
      <div
        className="flex items-center gap-2 px-4 py-2 shrink-0"
        style={{ borderBottom: '1px solid var(--color-border)' }}
      >
        <div className="flex gap-1">
          {STRUCTURES.map(s => (
            <button
              key={s.id}
              onClick={() => setStructure(prev => prev === s.id ? 'standard' : s.id)}
              className="px-3 py-1.5 text-[11px] uppercase rounded-full transition-colors"
              style={{
                backgroundColor: structure === s.id ? 'var(--color-accent)' : 'var(--color-surface)',
                color: structure === s.id ? '#ffffff' : 'var(--color-text-dim)',
                fontWeight: 700,
                letterSpacing: '0.04em',
              }}
            >
              {s.label}
            </button>
          ))}
        </div>
        {structure === 'pairs' && (
          <div className="flex gap-1 ml-2">
            {INTERVALS.map(min => (
              <button
                key={min}
                onClick={() => { setStructureDuration(min); handleSelectRestDuration(min * 60); }}
                className="px-2.5 py-1.5 text-[11px] rounded-full transition-colors"
                style={{
                  backgroundColor: structureDuration === min ? 'var(--color-accent)' : 'var(--color-surface)',
                  color: structureDuration === min ? '#ffffff' : 'var(--color-text-dim)',
                  fontWeight: 700,
                }}
              >
                {min}&apos;
              </button>
            ))}
          </div>
        )}
      </div>
      )}

      {/* Progress bar — visible when workout is active */}
      {workoutStarted && (
        <div
          className="flex items-center gap-2 px-4 py-2 shrink-0"
          style={{ borderBottom: '1px solid var(--color-border)' }}
        >
          <span className="text-[10px] uppercase" style={{ color: 'var(--color-text-dim)', fontWeight: 700, letterSpacing: '0.1em' }}>
            {completedExercises}/{totalExercises} done
          </span>
          <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--color-surface-hover)' }}>
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: totalExercises > 0 ? `${(completedExercises / totalExercises) * 100}%` : '0%',
                backgroundColor: 'var(--color-green)',
              }}
            />
          </div>
        </div>
      )}

      {/* Exercise list (scrollable) */}
      <div className="workout-sheet-scroll flex-1 overflow-y-auto px-2 py-1">
        <ProgressExerciseList
          exercises={workoutExercises}
          structure={structure}
          activeExerciseIndex={activeExerciseIndex}
          onUpdate={handleExerciseUpdate}
          onRemove={handleExerciseRemoveRequest}
          onRename={handleRenameStart}
          disabled={!workoutStarted}
          lastSessionMap={lastSessionMap}
        />

        {/* Add Exercise button */}
        {!showAddExercise ? (
          <button
            onClick={() => setShowAddExercise(true)}
            className="w-full py-3 mt-2 rounded-lg border-2 border-dashed flex items-center justify-center gap-2 text-xs uppercase transition-colors"
            style={{
              borderColor: 'var(--color-border)',
              color: 'var(--color-text-dim)',
              fontWeight: 700,
              letterSpacing: '0.06em',
            }}
          >
            <Plus size={16} />
            Add Exercise
          </button>
        ) : (
          <div
            className="mt-2 rounded-lg p-3"
            style={{ backgroundColor: 'var(--color-surface)' }}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[13px] uppercase" style={{ color: 'var(--color-text)', fontWeight: 800, letterSpacing: '0.04em' }}>
                Add Exercise
              </span>
              <button
                onClick={() => { setShowAddExercise(false); setAddExerciseSearch(''); }}
                className="p-0.5"
              >
                <X size={16} style={{ color: 'var(--color-text-muted)' }} />
              </button>
            </div>
            <input
              type="text"
              value={addExerciseSearch}
              onChange={(e) => setAddExerciseSearch(e.target.value)}
              placeholder="Search exercises..."
              className="w-full text-sm py-2 px-3 rounded-md border-0 outline-none mb-2"
              style={{
                backgroundColor: 'var(--color-surface-hover)',
                color: 'var(--color-text)',
              }}
              autoFocus
            />
            <div className="max-h-40 overflow-y-auto">
              {availableExercises.map(name => (
                <button
                  key={name}
                  onClick={() => handleAddExercise(name)}
                  className="w-full text-left text-sm py-2 px-2 rounded transition-colors"
                  style={{ color: 'var(--color-text)' }}
                >
                  {name}
                </button>
              ))}
              {availableExercises.length === 0 && (
                <p className="text-xs py-2 text-center" style={{ color: 'var(--color-text-dim)' }}>
                  No matching exercises
                </p>
              )}
            </div>
          </div>
        )}

        {/* Workout Notes */}
        <div className="mt-2 mb-1 px-1">
          <label
            className="text-[10px] uppercase mb-1 block"
            style={{ color: 'var(--color-text-dim)', fontWeight: 700, letterSpacing: '0.15em' }}
          >
            Notes
          </label>
          <textarea
            value={workoutNotes}
            onChange={(e) => setWorkoutNotes(e.target.value)}
            placeholder="How did it go?"
            rows={2}
            className="w-full text-xs py-1.5 px-2.5 rounded-lg border-0 outline-none resize-none"
            style={{
              backgroundColor: 'var(--color-surface)',
              color: 'var(--color-text)',
            }}
          />
        </div>
      </div>

      {/* Bottom action bar — hidden when keyboard is open */}
      {!keyboardOpen && (
        <div
          className="flex gap-3 px-4 py-3 shrink-0"
          style={{
            borderTop: '1px solid var(--color-border)',
            paddingBottom: 'max(12px, env(safe-area-inset-bottom))',
          }}
        >
          {!workoutStarted ? (
            <button
              onClick={() => setWorkoutStarted(true)}
              className="flex-1 py-3 rounded-lg text-sm uppercase transition-colors flex items-center justify-center gap-2"
              style={{ backgroundColor: 'var(--color-green)', color: '#ffffff', fontWeight: 800, letterSpacing: '0.04em' }}
            >
              <Play size={16} />
              Start Workout
            </button>
          ) : (
            <button
              onClick={() => setShowSaveConfirm(true)}
              className="flex-1 py-3 rounded-lg text-sm uppercase transition-colors"
              style={{ backgroundColor: 'var(--color-accent)', color: '#ffffff', fontWeight: 800, letterSpacing: '0.04em' }}
            >
              {isEditing ? 'Update Workout' : 'Save Workout'}
            </button>
          )}
        </div>
      )}

      {/* Discard confirmation modal */}
      {showCancelConfirm && (
        <div className="fixed inset-0 flex items-center justify-center px-6"
          style={{ backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 10003 }}
        >
          <div
            className="w-full max-w-sm rounded-xl p-5"
            style={{ backgroundColor: 'var(--color-surface)' }}
          >
            <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--color-yellow)' }}>
              Discard Workout?
            </h3>
            <p className="text-sm mb-5" style={{ color: 'var(--color-text-muted)' }}>
              Your workout is in progress. Are you sure you want to discard it?
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleDiscardConfirm}
                className="flex-1 py-2.5 rounded-lg text-sm uppercase"
                style={{ backgroundColor: 'var(--color-red)', color: '#ffffff', fontWeight: 800, letterSpacing: '0.04em' }}
              >
                Discard
              </button>
              <button
                onClick={() => setShowCancelConfirm(false)}
                className="flex-1 py-2.5 rounded-lg text-sm font-medium"
                style={{ backgroundColor: 'var(--color-surface-hover)', color: 'var(--color-text)' }}
              >
                Keep Going
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Save confirmation modal */}
      {showSaveConfirm && (
        <div className="fixed inset-0 flex items-center justify-center px-6"
          style={{ backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 10003 }}
        >
          <div
            className="w-full max-w-sm rounded-xl p-5"
            style={{ backgroundColor: 'var(--color-surface)' }}
          >
            <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--color-accent)' }}>
              {isEditing ? 'Update Workout?' : 'Save Workout?'}
            </h3>
            <p className="text-sm mb-5" style={{ color: 'var(--color-text-muted)' }}>
              {isEditing
                ? 'Save the changes to this workout?'
                : 'End the workout and save your results?'
              }
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => { setShowSaveConfirm(false); handleSave(); }}
                className="flex-1 py-2.5 rounded-lg text-sm uppercase"
                style={{ backgroundColor: 'var(--color-green)', color: '#ffffff', fontWeight: 800, letterSpacing: '0.04em' }}
              >
                {isEditing ? 'Update' : 'Save'}
              </button>
              <button
                onClick={() => setShowSaveConfirm(false)}
                className="flex-1 py-2.5 rounded-lg text-sm font-medium"
                style={{ backgroundColor: 'var(--color-surface-hover)', color: 'var(--color-text)' }}
              >
                Keep Going
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete exercise confirmation modal */}
      {deleteTarget && (
        <div className="fixed inset-0 flex items-center justify-center px-6"
          style={{ backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 10003 }}
        >
          <div
            className="w-full max-w-sm rounded-xl p-5"
            style={{ backgroundColor: 'var(--color-surface)' }}
          >
            <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--color-yellow)' }}>
              Remove Exercise?
            </h3>
            <p className="text-sm mb-5" style={{ color: 'var(--color-text-muted)' }}>
              Remove &ldquo;{deleteTarget}&rdquo; and its set data from this workout?
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleExerciseRemoveConfirm}
                className="flex-1 py-2.5 rounded-lg text-sm uppercase"
                style={{ backgroundColor: 'var(--color-red)', color: '#ffffff', fontWeight: 800, letterSpacing: '0.04em' }}
              >
                Remove
              </button>
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 py-2.5 rounded-lg text-sm font-medium"
                style={{ backgroundColor: 'var(--color-surface-hover)', color: 'var(--color-text)' }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Exercise rename picker modal */}
      {renameTarget && (() => {
        const currentNames = new Set(workoutExercises.map(e => e.name));
        const renameOptions = (exerciseLibrary || [])
          .filter(name => name !== renameTarget && !currentNames.has(name))
          .filter(name => !renameSearch || name.toLowerCase().includes(renameSearch.toLowerCase()));

        return (
          <div
            className="fixed inset-0 flex items-end justify-center"
            style={{ backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 10003 }}
            onClick={() => setRenameTarget(null)}
          >
            <div
              className="w-full max-w-md rounded-t-xl overflow-hidden"
              style={{ backgroundColor: 'var(--color-bg)', maxHeight: '70vh' }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div
                className="flex items-center justify-between px-4 py-3"
                style={{ borderBottom: '1px solid var(--color-border)' }}
              >
                <div>
                  <span className="text-[13px] uppercase" style={{ color: 'var(--color-text)', fontWeight: 800, letterSpacing: '0.04em' }}>
                    Change Exercise
                  </span>
                  <span
                    className="text-xs ml-2"
                    style={{ color: 'var(--color-text-dim)' }}
                  >
                    {renameTarget}
                  </span>
                </div>
                <button
                  onClick={() => setRenameTarget(null)}
                  className="p-1"
                >
                  <X size={18} style={{ color: 'var(--color-text-muted)' }} />
                </button>
              </div>

              {/* Search */}
              <div className="px-4 py-2">
                <input
                  type="text"
                  value={renameSearch}
                  onChange={(e) => setRenameSearch(e.target.value)}
                  placeholder="Search exercises..."
                  className="w-full text-sm py-2 px-3 rounded-md border-0 outline-none"
                  style={{
                    backgroundColor: 'var(--color-surface)',
                    color: 'var(--color-text)',
                  }}
                  autoFocus
                />
              </div>

              {/* Exercise list */}
              <div
                className="overflow-y-auto px-2 pb-4"
                style={{
                  maxHeight: 'calc(70vh - 120px)',
                  paddingBottom: 'max(16px, env(safe-area-inset-bottom))',
                }}
              >
                {renameOptions.map(name => (
                  <button
                    key={name}
                    onClick={() => handleRenameConfirm(name)}
                    className="w-full text-left text-sm py-2.5 px-3 rounded-lg transition-colors"
                    style={{ color: 'var(--color-text)' }}
                  >
                    {name}
                  </button>
                ))}
                {renameOptions.length === 0 && (
                  <p className="text-xs py-4 text-center" style={{ color: 'var(--color-text-dim)' }}>
                    No matching exercises
                  </p>
                )}
              </div>
            </div>
          </div>
        );
      })()}

    </div>
    </>
  );
}
