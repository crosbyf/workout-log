'use client';

import { useEffect, useState } from 'react';
import { X, Calendar, Play, Pause, Plus, Trash2, MoreVertical } from 'lucide-react';
import { useWorkoutStore } from '../../stores/workoutStore';
import { useUIStore } from '../../stores/uiStore';
import { usePresetStore } from '../../stores/presetStore';
import { useThemeStore } from '../../stores/themeStore';
import { formatTime, getTodayDate } from '../../lib/formatting';
import { getPresetColor } from '../../lib/constants';

export default function WorkoutModal() {
  const { getCurrentTheme } = useThemeStore();
  const currentTheme = getCurrentTheme();

  // Store hooks
  const {
    current,
    editing,
    workoutStarted,
    timerRunning,
    workoutTimer,
    addExercise,
    updateExercise,
    updateSet,
    addSet,
    removeSet,
    removeExercise,
    setCurrent,
    resetCurrent,
    saveWorkout,
    startWorkout,
    pauseTimer,
    resumeTimer,
    updateTimerDisplay,
  } = useWorkoutStore();

  const {
    showWorkoutModal,
    workoutViewMode,
    deleteExercise: deleteExerciseIdx,
  } = useUIStore();

  const closeUIModal = (name) => useUIStore.setState({ [name]: false });
  const openUIModal = (name) => useUIStore.setState({ [name]: true });

  const { presets } = usePresetStore();

  const [timerDisplay, setTimerDisplay] = useState('0:00');
  const [expandedExercise, setExpandedExercise] = useState(null);

  // Timer effect with 100ms interval
  useEffect(() => {
    if (!timerRunning && !workoutStarted) return;

    const interval = setInterval(() => {
      updateTimerDisplay();
      setTimerDisplay(formatTime(useWorkoutStore.getState().workoutTimer / 1000));
    }, 100);

    return () => clearInterval(interval);
  }, [timerRunning, workoutStarted, updateTimerDisplay]);

  if (!showWorkoutModal) return null;

  const handleClose = () => {
    if (current.exercises.length > 0 || current.notes) {
      useUIStore.setState({ showCloseConfirm: true });
    } else {
      closeUIModal('showWorkoutModal');
      resetCurrent();
    }
  };

  const handleSaveWorkout = () => {
    useUIStore.setState({ showEndWorkoutConfirm: true });
  };

  const handleStartWorkout = () => {
    startWorkout();
  };

  const handleDateChange = (e) => {
    setCurrent({ date: e.target.value });
  };

  const handleLocationChange = (e) => {
    const location = e.target.value;
    setCurrent({ location });
    if (location) {
      const preset = presets.find((p) => p.name === location);
      if (preset) {
        useWorkoutStore.getState().loadPreset(preset);
      }
    }
  };

  const handleStructureToggle = (structure) => {
    setCurrent({ structure: current.structure === structure ? '' : structure });
  };

  const handleNotesChange = (e) => {
    setCurrent({ notes: e.target.value });
  };

  const isEditing = editing !== null;
  const isDayOff = current.location === 'Day Off';

  return (
    <div
      className="fixed inset-0 z-40 overflow-y-auto flex flex-col"
      style={{ backgroundColor: currentTheme.rawBg }}
    >
      {/* Header */}
      <div
        className="sticky top-0 px-6 py-4 border-b z-10 flex items-center justify-between"
        style={{
          backgroundColor: currentTheme.rawCardBg,
          borderColor: currentTheme.rawCardBorder,
        }}
      >
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-bold">
            {isEditing ? 'Edit Workout' : 'New Workout'}
          </h1>

          {workoutStarted && (
            <div className="flex items-center gap-2 px-3 py-1 rounded-lg ml-4">
              <span className="font-mono text-lg font-bold text-red-500">
                {timerDisplay}
              </span>
              <button
                onClick={() => (timerRunning ? pauseTimer() : resumeTimer())}
                className="p-1 hover:opacity-70 transition-opacity"
                title={timerRunning ? 'Pause' : 'Resume'}
              >
                {timerRunning ? <Pause size={16} /> : <Play size={16} />}
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => openUIModal('showHistoryModal')}
            className="p-2 hover:bg-white hover:bg-opacity-10 rounded transition-all"
            title="View history"
          >
            <Calendar size={20} />
          </button>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-white hover:bg-opacity-10 rounded transition-all"
            title="Close"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Body - Scrollable */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-6 py-6 space-y-6">
          {/* View Mode Toggle */}
          <div className="flex gap-2">
            {['table', 'card'].map((mode) => (
              <button
                key={mode}
                onClick={() => useUIStore.setState({ workoutViewMode: mode })}
                className="px-4 py-2 rounded-full font-medium transition-all"
                style={{
                  backgroundColor:
                    workoutViewMode === mode ? '#3b82f6' : currentTheme.rawInputBg,
                  color: workoutViewMode === mode ? 'white' : 'inherit',
                  borderColor: currentTheme.rawInputBorder,
                }}
              >
                {mode === 'table' ? 'Table View' : 'Card View'}
              </button>
            ))}
          </div>

          {/* Date */}
          <div>
            <label
              className="block text-xs uppercase tracking-wider opacity-50 mb-2"
            >
              Date
            </label>
            <input
              type="date"
              value={current.date}
              onChange={handleDateChange}
              className="w-full px-4 py-2 rounded-lg border"
              style={{
                backgroundColor: currentTheme.rawInputBg,
                borderColor: currentTheme.rawInputBorder,
                color: currentTheme.rawText,
              }}
            />
          </div>

          {/* Workout & Structure */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium">WORKOUT & STRUCTURE</h3>

            {/* Preset Dropdown */}
            <div>
              <label className="block text-sm mb-2">Preset</label>
              <select
                value={current.location}
                onChange={handleLocationChange}
                className="w-full px-4 py-2 rounded-lg border"
                style={{
                  backgroundColor: currentTheme.rawInputBg,
                  borderColor: currentTheme.rawInputBorder,
                  color: currentTheme.rawText,
                }}
              >
                <option value="">-- Select Preset --</option>
                {presets
                  .filter((p) => p.includeInMenu !== false)
                  .map((preset) => (
                    <option key={preset.name} value={preset.name}>
                      {preset.name}
                    </option>
                  ))}
                <option value="Day Off">Day Off</option>
              </select>
            </div>

            {/* Structure Toggles */}
            {!isDayOff && (
              <div>
                <label className="block text-sm mb-2">Structure</label>
                <div className="flex gap-2">
                  {['Pairs', 'Circuit'].map((structure) => (
                    <button
                      key={structure}
                      onClick={() => handleStructureToggle(structure)}
                      className="flex-1 px-4 py-2 rounded-lg font-medium transition-all border"
                      style={{
                        backgroundColor:
                          current.structure === structure
                            ? '#3b82f6'
                            : 'transparent',
                        color:
                          current.structure === structure
                            ? 'white'
                            : 'inherit',
                        borderColor:
                          current.structure === structure
                            ? '#3b82f6'
                            : currentTheme.rawInputBorder,
                      }}
                    >
                      {structure}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Exercise Table */}
          {!isDayOff && current.exercises.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold">Exercises</h2>
              {workoutViewMode === 'table' ? (
                <ExercisesTableView
                  expandedExercise={expandedExercise}
                  setExpandedExercise={setExpandedExercise}
                  currentTheme={currentTheme}
                />
              ) : (
                <ExercisesCardView currentTheme={currentTheme} />
              )}
            </div>
          )}

          {/* Add Exercise Button */}
          {!isDayOff && (
            <button
              onClick={addExercise}
              className="w-full px-4 py-3 rounded-xl border-2 border-dashed font-medium transition-all"
              style={{
                borderColor: currentTheme.rawInputBorder,
                color: 'inherit',
              }}
            >
              <Plus size={20} className="inline mr-2" />
              Add Exercise
            </button>
          )}

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium mb-2">
              {isDayOff ? 'Notes (Day Off)' : 'Notes'}
            </label>
            <textarea
              value={current.notes}
              onChange={handleNotesChange}
              placeholder="How did it go? Any PRs or notes to remember..."
              className="w-full px-4 py-3 rounded-lg border resize-none"
              rows={4}
              style={{
                backgroundColor: currentTheme.rawInputBg,
                borderColor: currentTheme.rawInputBorder,
                color: currentTheme.rawText,
              }}
            />
          </div>
        </div>
      </div>

      {/* Footer - Sticky */}
      <div
        className="sticky bottom-0 px-6 py-4 border-t flex gap-3"
        style={{
          backgroundColor: currentTheme.rawCardBg,
          borderColor: currentTheme.rawCardBorder,
        }}
      >
        {!workoutStarted && !isEditing && (
          <>
            <button
              onClick={handleClose}
              className="flex-1 px-4 py-2 rounded-lg font-medium transition-all opacity-70 hover:opacity-100"
            >
              Cancel
            </button>
            <button
              onClick={handleStartWorkout}
              className="flex-1 px-4 py-2 rounded-lg font-medium text-white transition-all"
              style={{ backgroundColor: '#22c55e' }}
            >
              ▶ Start Workout
            </button>
          </>
        )}
        {workoutStarted && (
          <>
            <button
              onClick={handleClose}
              className="flex-1 px-4 py-2 rounded-lg font-medium transition-all opacity-70 hover:opacity-100"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveWorkout}
              className="flex-1 px-4 py-2 rounded-lg font-medium text-white transition-all"
              style={{ backgroundColor: '#3b82f6' }}
            >
              Save Workout
            </button>
          </>
        )}
        {isEditing && (
          <>
            <button
              onClick={handleClose}
              className="flex-1 px-4 py-2 rounded-lg font-medium transition-all opacity-70 hover:opacity-100"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveWorkout}
              className="flex-1 px-4 py-2 rounded-lg font-medium text-white transition-all"
              style={{ backgroundColor: '#3b82f6' }}
            >
              Update
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function ExercisesTableView({ expandedExercise, setExpandedExercise, currentTheme }) {
  const {
    current,
    updateExercise,
    updateSet,
    addSet,
    removeSet,
    removeExercise,
  } = useWorkoutStore();
  const { workoutStarted } = useWorkoutStore();

  return (
    <div className="space-y-4">
      {current.exercises.map((exercise, ei) => {
        const totalReps = exercise.sets.reduce((sum, set) => {
          const reps = parseInt(set.reps) || 0;
          return sum + reps;
        }, 0);

        return (
          <div
            key={ei}
            className="border rounded-lg overflow-hidden"
            style={{ borderColor: currentTheme.rawCardBorder }}
          >
            {/* Exercise Row */}
            <div className="px-4 py-3 flex items-center gap-3 bg-opacity-50">
              <input
                type="text"
                value={exercise.name}
                onChange={(e) =>
                  updateExercise(ei, 'name', e.target.value)
                }
                placeholder="Exercise name"
                list="exercises"
                className="flex-1 px-3 py-1 rounded border text-sm"
                style={{
                  backgroundColor: currentTheme.rawInputBg,
                  borderColor: currentTheme.rawInputBorder,
                  color: currentTheme.rawText,
                }}
              />

              {/* Set Inputs */}
              {[0, 1, 2, 3].map((si) => (
                <input
                  key={si}
                  type="number"
                  value={exercise.sets[si]?.reps || ''}
                  onChange={(e) =>
                    updateSet(ei, si, 'reps', e.target.value)
                  }
                  placeholder="0"
                  disabled={!workoutStarted}
                  className="w-12 px-2 py-1 rounded text-center text-sm"
                  style={{
                    backgroundColor: workoutStarted
                      ? currentTheme.rawInputBg
                      : '#d1d5db',
                    borderColor: currentTheme.rawInputBorder,
                    color: currentTheme.rawText,
                    opacity: !workoutStarted ? 0.5 : 1,
                  }}
                />
              ))}

              {/* Total */}
              <div className="w-12 text-center font-bold text-sm">
                {totalReps}
              </div>

              {/* More Options */}
              <button
                onClick={() =>
                  setExpandedExercise(
                    expandedExercise === ei ? null : ei
                  )
                }
                className="p-1 rounded hover:opacity-70 transition-opacity"
              >
                <MoreVertical size={18} />
              </button>
            </div>

            {/* Expanded Options */}
            {expandedExercise === ei && (
              <div
                className="px-4 py-3 space-y-2 border-t"
                style={{ borderColor: currentTheme.rawCardBorder }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm">Add/Remove Sets</span>
                  <div className="flex gap-2">
                    {exercise.sets.map((_, si) => (
                      <button
                        key={si}
                        onClick={() => removeSet(ei, si)}
                        className="px-2 py-1 rounded text-xs text-red-500 hover:bg-red-500 hover:bg-opacity-10"
                      >
                        <X size={14} />
                      </button>
                    ))}
                    <button
                      onClick={() => addSet(ei)}
                      className="px-2 py-1 rounded text-xs text-blue-500 hover:bg-blue-500 hover:bg-opacity-10"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>

                <button
                  onClick={() => removeExercise(ei)}
                  className="w-full px-3 py-2 rounded text-sm text-red-500 hover:bg-red-500 hover:bg-opacity-10 transition-all"
                >
                  <Trash2 size={16} className="inline mr-2" />
                  Delete Exercise
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function ExercisesCardView({ currentTheme }) {
  const {
    current,
    updateExercise,
    updateSet,
    addSet,
    removeSet,
    removeExercise,
  } = useWorkoutStore();
  const { workoutStarted } = useWorkoutStore();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {current.exercises.map((exercise, ei) => {
        const totalReps = exercise.sets.reduce((sum, set) => {
          const reps = parseInt(set.reps) || 0;
          return sum + reps;
        }, 0);

        return (
          <div
            key={ei}
            className="border rounded-lg p-4"
            style={{ borderColor: currentTheme.rawCardBorder }}
          >
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={exercise.name}
                onChange={(e) =>
                  updateExercise(ei, 'name', e.target.value)
                }
                placeholder="Exercise name"
                list="exercises"
                className="flex-1 px-3 py-2 rounded border"
                style={{
                  backgroundColor: currentTheme.rawInputBg,
                  borderColor: currentTheme.rawInputBorder,
                  color: currentTheme.rawText,
                }}
              />
              <button
                onClick={() => removeExercise(ei)}
                className="p-2 text-red-500 hover:bg-red-500 hover:bg-opacity-10 rounded transition-all"
              >
                <Trash2 size={20} />
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex gap-2 flex-wrap items-center">
                {exercise.sets.map((set, si) => (
                  <div key={si} className="flex flex-col items-center gap-1">
                    <label className="text-xs font-medium opacity-70">
                      S{si + 1}
                    </label>
                    <input
                      type="number"
                      value={set.reps}
                      onChange={(e) =>
                        updateSet(ei, si, 'reps', e.target.value)
                      }
                      placeholder="0"
                      disabled={!workoutStarted}
                      className="w-12 px-2 py-1 rounded border text-center"
                      style={{
                        backgroundColor: workoutStarted
                          ? currentTheme.rawInputBg
                          : '#d1d5db',
                        borderColor: currentTheme.rawInputBorder,
                        color: currentTheme.rawText,
                        opacity: !workoutStarted ? 0.5 : 1,
                      }}
                    />
                    <button
                      onClick={() => removeSet(ei, si)}
                      className="text-red-500 hover:opacity-70 transition-opacity text-xs"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => addSet(ei)}
                  className="px-3 py-1 text-blue-500 hover:bg-blue-500 hover:bg-opacity-10 rounded transition-all"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t text-center font-bold">
              Total: {totalReps} reps
            </div>
          </div>
        );
      })}
    </div>
  );
}

