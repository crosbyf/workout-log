'use client';

import { useState, useCallback, useEffect } from 'react';
import { X, Plus, Play, Pause, History, Clock, ChevronDown } from 'lucide-react';
import { useTimer } from '@/hooks/useTimer';
import { getTodayStr, formatDate, formatDuration } from '@/utils/format';
import { PRESET_COLORS } from '@/hooks/usePresets';
import ProgressExerciseCard from './ProgressExerciseCard';
import { getActivePairIndices, getActiveSetColumn } from '@/utils/workout-structure';
import { isDeadhang, calculateTotalReps } from '@/utils/exercise';

const STRUCTURES = [
  { id: 'pairs', label: 'Pairs' },
  { id: 'circuit', label: 'Circuit' },
];

const INTERVALS = [3, 4, 5];

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
function ProgressExerciseList({ exercises, structure, activeExerciseIndex, onUpdate, onRemove, onRename, disabled }) {
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
    />
  ));
}

export default function WorkoutEntry({ preset, exercises: exerciseLibrary, onSave, onCancel, existingWorkout, workouts = [] }) {
  const isEditing = !!existingWorkout;

  const [workoutStarted, setWorkoutStarted] = useState(isEditing);
  const [paused, setPaused] = useState(false);
  const { elapsedSeconds } = useTimer(workoutStarted && !paused && !isEditing);

  const [workoutExercises, setWorkoutExercises] = useState(() => {
    if (existingWorkout) {
      return existingWorkout.exercises.map(ex => ({
        name: ex.name,
        sets: ex.sets.map(s => ({ reps: s.reps !== null && s.reps !== undefined ? String(s.reps) : '', weight: s.weight || null })),
        notes: ex.notes || '',
      }));
    }
    return preset.exercises.map(name => createExerciseSets(name));
  });
  const [structure, setStructure] = useState(existingWorkout ? existingWorkout.structure || 'standard' : 'standard');
  const [structureDuration, setStructureDuration] = useState(existingWorkout ? existingWorkout.structureDuration || 4 : 4);
  const [workoutNotes, setWorkoutNotes] = useState(existingWorkout ? existingWorkout.notes || '' : '');
  const [showAddExercise, setShowAddExercise] = useState(false);
  const [addExerciseSearch, setAddExerciseSearch] = useState('');
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const presetColor = PRESET_COLORS[preset.color] || 'var(--color-accent)';

  // Lock body scroll and block background touch when workout overlay is mounted
  // Lock body in place — position:fixed prevents ALL background scrolling on iOS
  useEffect(() => {
    const scrollY = window.scrollY;
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.left = '0';
    document.body.style.right = '0';
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.left = '';
      document.body.style.right = '';
      document.body.style.overflow = '';
      // Restore scroll position
      window.scrollTo(0, scrollY);
    };
  }, []);

  // Detect virtual keyboard open via visualViewport API
  const [keyboardOpen, setKeyboardOpen] = useState(false);
  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;
    const check = () => {
      // If the visual viewport height is significantly less than window height, keyboard is open
      const heightDiff = window.innerHeight - vv.height;
      setKeyboardOpen(heightDiff > 150);
    };
    vv.addEventListener('resize', check);
    vv.addEventListener('scroll', check);
    return () => {
      vv.removeEventListener('resize', check);
      vv.removeEventListener('scroll', check);
    };
  }, []);

  const handleExerciseUpdate = useCallback((updated) => {
    setWorkoutExercises(prev =>
      prev.map(ex => ex.name === updated.name ? updated : ex)
    );
  }, []);

  const handleExerciseRemove = useCallback((name) => {
    setWorkoutExercises(prev => prev.filter(ex => ex.name !== name));
  }, []);

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
      onCancel();
    }
  };

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

  // Past workouts for the history viewer (non-day-off, most recent first)
  const pastWorkouts = workouts.filter(w => !w.isDayOff).slice(0, 20);

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
        top: 'calc(3.5rem + env(safe-area-inset-top))',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'var(--color-bg)',
        overscrollBehavior: 'contain',
        borderRadius: '1rem 1rem 0 0',
        zIndex: 10001,
      }}
    >
      {/* Drag handle */}
      <div className="flex justify-center pt-2 pb-1 shrink-0">
        <div className="w-10 h-1 rounded-full" style={{ backgroundColor: 'var(--color-border)' }} />
      </div>

      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 shrink-0"
        style={{ borderBottom: '1px solid var(--color-border)' }}
      >
        <div className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: presetColor }}
          />
          <span className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
            {preset.name}
          </span>
        </div>
        <div className="flex items-center gap-3">
          {workoutStarted && !isEditing && (
            <>
              {/* Pause/Resume button */}
              <button
                onClick={() => setPaused(p => !p)}
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
              <span
                className="text-sm font-mono font-bold"
                style={{ color: paused ? 'var(--color-yellow)' : 'var(--color-accent)' }}
              >
                {formatDuration(elapsedSeconds)}
              </span>
            </>
          )}
          {isEditing && (
            <span
              className="text-xs font-medium px-2 py-1 rounded"
              style={{ backgroundColor: 'var(--color-surface-hover)', color: 'var(--color-text-muted)' }}
            >
              Editing
            </span>
          )}
          {/* History button — available before and during workout */}
          {!isEditing && (
            <button
              onClick={() => setShowHistory(true)}
              className="w-8 h-8 rounded-md flex items-center justify-center"
              style={{ backgroundColor: 'var(--color-surface-hover)' }}
              aria-label="View past workouts"
            >
              <History size={15} style={{ color: 'var(--color-text-muted)' }} />
            </button>
          )}
          <button onClick={handleClose} className="p-1" aria-label="Close workout">
            <X size={20} style={{ color: 'var(--color-text-muted)' }} />
          </button>
        </div>
      </div>

      {/* Structure bar */}
      <div
        className="flex items-center gap-2 px-4 py-2 shrink-0"
        style={{ borderBottom: '1px solid var(--color-border)' }}
      >
        <div className="flex gap-1">
          {STRUCTURES.map(s => (
            <button
              key={s.id}
              onClick={() => setStructure(prev => prev === s.id ? 'standard' : s.id)}
              className="px-3 py-1.5 text-xs font-medium rounded-md transition-colors"
              style={{
                backgroundColor: structure === s.id ? 'var(--color-accent)' : 'var(--color-surface)',
                color: structure === s.id ? '#ffffff' : 'var(--color-text-muted)',
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
                onClick={() => setStructureDuration(min)}
                className="px-2 py-1.5 text-xs font-medium rounded-md transition-colors"
                style={{
                  backgroundColor: structureDuration === min ? 'var(--color-accent)' : 'var(--color-surface)',
                  color: structureDuration === min ? '#ffffff' : 'var(--color-text-muted)',
                }}
              >
                {min}&apos;
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Progress bar — visible when workout is active */}
      {workoutStarted && (
        <div
          className="flex items-center gap-2 px-4 py-2 shrink-0"
          style={{ borderBottom: '1px solid var(--color-border)' }}
        >
          <span className="text-[10px] font-medium" style={{ color: 'var(--color-text-dim)' }}>
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
          onRemove={handleExerciseRemove}
          onRename={handleRenameStart}
          disabled={!workoutStarted}
        />

        {/* Add Exercise button */}
        {!showAddExercise ? (
          <button
            onClick={() => setShowAddExercise(true)}
            className="w-full py-3 mt-2 rounded-lg border-2 border-dashed flex items-center justify-center gap-2 text-sm font-medium transition-colors"
            style={{
              borderColor: 'var(--color-border)',
              color: 'var(--color-text-muted)',
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
              <span className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>
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
            className="text-[10px] font-semibold uppercase tracking-wider mb-1 block"
            style={{ color: 'var(--color-text-muted)' }}
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
              className="flex-1 py-3 rounded-lg text-sm font-bold transition-colors flex items-center justify-center gap-2"
              style={{ backgroundColor: 'var(--color-green)', color: '#ffffff' }}
            >
              <Play size={16} />
              Start Workout
            </button>
          ) : (
            <button
              onClick={() => setShowSaveConfirm(true)}
              className="flex-1 py-3 rounded-lg text-sm font-bold transition-colors"
              style={{ backgroundColor: 'var(--color-accent)', color: '#ffffff' }}
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
                onClick={onCancel}
                className="flex-1 py-2.5 rounded-lg text-sm font-bold"
                style={{ backgroundColor: 'var(--color-red)', color: '#ffffff' }}
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
                className="flex-1 py-2.5 rounded-lg text-sm font-bold"
                style={{ backgroundColor: 'var(--color-green)', color: '#ffffff' }}
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
                  <span className="text-sm font-bold" style={{ color: 'var(--color-text)' }}>
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

      {/* Historical workout viewer overlay */}
      {showHistory && (
        <div
          className="fixed inset-0 flex flex-col"
          style={{ backgroundColor: 'var(--color-bg)', zIndex: 10003 }}
        >
          {/* History header — with safe area top padding */}
          <div
            className="flex items-center justify-between px-4 py-3 shrink-0"
            style={{
              borderBottom: '1px solid var(--color-border)',
              paddingTop: 'calc(12px + env(safe-area-inset-top))',
            }}
          >
            <div className="flex items-center gap-2">
              <History size={16} style={{ color: 'var(--color-accent)' }} />
              <span className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
                Past Workouts
              </span>
            </div>
            <button onClick={() => setShowHistory(false)} className="p-1">
              <X size={20} style={{ color: 'var(--color-text-muted)' }} />
            </button>
          </div>

          {/* Scrollable workout list */}
          <div className="flex-1 overflow-y-auto px-3 py-2">
            {pastWorkouts.length === 0 ? (
              <p className="text-sm text-center py-8" style={{ color: 'var(--color-text-dim)' }}>
                No past workouts yet.
              </p>
            ) : (
              pastWorkouts.map(workout => (
                <HistoryCard key={workout.id} workout={workout} />
              ))
            )}
          </div>
        </div>
      )}
    </div>
    </>
  );
}

/**
 * Expanded workout card for the history viewer (read-only)
 */
const HISTORY_COLOR_MAP = {
  'Garage A': 'blue',
  'Garage B': 'purple',
  'BW-only': 'green',
  'GtG': 'yellow',
  'Manual': 'red',
  'Garage 10': 'pink',
  'Garage 12': 'orange',
  'Garage BW': 'cyan',
};

function HistoryCard({ workout }) {
  const [expanded, setExpanded] = useState(true);

  const totalReps = calculateTotalReps(workout.exercises);

  const colorKey = HISTORY_COLOR_MAP[workout.location] || 'blue';
  const sidebarColor = PRESET_COLORS[colorKey] || 'var(--color-accent)';

  return (
    <div
      className="rounded-xl overflow-hidden mb-2 flex"
      style={{ backgroundColor: 'var(--color-surface)' }}
    >
      {/* Color sidebar */}
      <div
        className="w-2 shrink-0"
        style={{ backgroundColor: sidebarColor }}
      />

      <div className="flex-1 min-w-0">
      {/* Header — tap to collapse/expand */}
      <button
        onClick={() => setExpanded(e => !e)}
        className="w-full text-left px-4 py-3"
      >
        <div className="flex items-center justify-between mb-0.5">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
              {formatDate(workout.date)}
            </span>
            <span
              className="text-xs font-medium px-1.5 py-0.5 rounded"
              style={{ backgroundColor: 'var(--color-surface-hover)', color: 'var(--color-text-muted)' }}
            >
              {workout.location}
            </span>
          </div>
          <ChevronDown
            size={14}
            style={{
              color: 'var(--color-text-dim)',
              transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s ease',
            }}
          />
        </div>
        <div className="flex items-center gap-3 text-xs" style={{ color: 'var(--color-text-dim)' }}>
          <span>{workout.exercises.length} exercises</span>
          {workout.elapsedTime > 0 && (
            <span className="flex items-center gap-0.5">
              <Clock size={10} />
              {formatDuration(workout.elapsedTime)}
            </span>
          )}
          {totalReps > 0 && <span>{totalReps} reps</span>}
        </div>
      </button>

      {/* Expanded exercise detail */}
      {expanded && (
        <div className="px-4 pb-3" style={{ borderTop: '1px solid var(--color-border)' }}>
          <div className="mt-2 space-y-1.5">
            {workout.exercises.map((ex, idx) => {
              const dh = isDeadhang(ex.name);
              const exTotal = ex.sets.reduce((sum, s) => sum + (s.reps || 0), 0);
              const repsStr = ex.sets.map(s => dh ? `${s.reps}s` : s.reps).join(' \u00b7 ');
              return (
                <div key={idx}>
                  <div className="flex items-baseline justify-between">
                    <span className="text-sm" style={{ color: 'var(--color-text)' }}>{ex.name}</span>
                    <span className="text-sm font-bold" style={{ color: 'var(--color-text)' }}>{dh ? `${exTotal}s` : exTotal}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs" style={{ color: 'var(--color-text-dim)' }}>{repsStr}</span>
                    {ex.notes && (
                      <span className="text-xs italic ml-2" style={{ color: 'var(--color-text-dim)' }}>{ex.notes}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          {workout.notes && (
            <div
              className="mt-2 px-3 py-2 rounded-lg text-xs"
              style={{
                backgroundColor: 'var(--color-surface-hover)',
                color: 'var(--color-text-muted)',
                borderLeft: '3px solid #7c8fa0',
              }}
            >
              {workout.notes}
            </div>
          )}
        </div>
      )}
      </div>
    </div>
  );
}
