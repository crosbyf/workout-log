'use client';

import { useEffect, useState } from 'react';
import { X, Calendar, Play, Pause, Plus, Trash2, ChevronDown } from 'lucide-react';
import { useWorkoutStore } from '../../stores/workoutStore';
import { useUIStore } from '../../stores/uiStore';
import { usePresetStore } from '../../stores/presetStore';
import { useThemeStore } from '../../stores/themeStore';
import { formatTime } from '../../lib/formatting';
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
  } = useWorkoutStore();

  const {
    showWorkoutModal,
    workoutViewMode,
    deleteExercise: deleteExerciseIdx,
    showCloseConfirm,
    showEndWorkoutConfirm,
  } = useUIStore();

  const {
    closeModal: closeUIModal,
    openModal: openUIModal,
    setWorkoutViewMode,
  } = useUIStore((state) => ({
    closeModal: (name) => state.closeModal(name),
    openModal: (name) => state.openModal(name),
    setWorkoutViewMode: (mode) => {
      useUIStore.setState({ workoutViewMode: mode });
    },
  }));

  const { presets } = usePresetStore();

  const [timerDisplay, setTimerDisplay] = useState('0:00');

  // Update timer display
  useEffect(() => {
    const interval = setInterval(() => {
      if (timerRunning) {
        useWorkoutStore.getState().updateTimerDisplay();
        setTimerDisplay(formatTime(useWorkoutStore.getState().workoutTimer / 1000));
      } else if (workoutStarted) {
        setTimerDisplay(formatTime(workoutTimer / 1000));
      }
    }, 100);
    return () => clearInterval(interval);
  }, [timerRunning, workoutStarted, workoutTimer]);

  if (!showWorkoutModal) return null;

  const handleClose = () => {
    if (current.exercises.length > 0) {
      openUIModal('closeConfirm');
    } else {
      closeUIModal('workoutModal');
      resetCurrent();
    }
  };

  const handleSaveWorkout = () => {
    openUIModal('endWorkoutConfirm');
  };

  const handleStartWorkout = () => {
    startWorkout();
  };

  const handleExerciseDelete = (idx) => {
    useUIStore.setState({ deleteExercise: idx });
    openUIModal('confirmDialog');
  };

  const handleDateChange = (e) => {
    setCurrent({ date: e.target.value });
  };

  const handleLocationChange = (e) => {
    setCurrent({ location: e.target.value });
  };

  const handleStructureChange = (e) => {
    setCurrent({ structure: e.target.value });
  };

  const handleDurationChange = (duration) => {
    setCurrent({ structureDuration: duration });
  };

  const handleNotesChange = (e) => {
    setCurrent({ notes: e.target.value });
  };

  const handlePresetLoad = (presetName) => {
    const preset = presets.find((p) => p.name === presetName);
    if (preset) {
      useWorkoutStore.getState().loadPreset(preset);
    }
  };

  const isEditing = editing !== null;
  const isDayOff = current.location === 'Day Off';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex flex-col">
      {/* Header */}
      <div
        className="sticky top-0 px-6 py-4 border-b flex items-center justify-between z-10"
        style={{ borderColor: currentTheme.rawCardBorder, backgroundColor: currentTheme.rawCardBg }}
      >
        <div className="flex items-center gap-4 flex-1">
          <h1 className="text-2xl font-bold">
            {isEditing ? 'Edit Workout' : 'New Workout'}
          </h1>

          {workoutStarted && !isEditing && (
            <div className="flex items-center gap-2 px-3 py-1 rounded-lg" style={{ backgroundColor: currentTheme.rawInputBg }}>
              <span className="font-mono text-lg font-bold">{timerDisplay}</span>
              <button
                onClick={() => (timerRunning ? pauseTimer() : resumeTimer())}
                className="p-1 hover:opacity-70 transition-opacity"
              >
                {timerRunning ? <Pause size={16} /> : <Play size={16} />}
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => openUIModal('historyModal')}
            className="p-2 hover:bg-white hover:bg-opacity-10 rounded transition-all"
            title="View history"
          >
            <Calendar size={20} />
          </button>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-white hover:bg-opacity-10 rounded transition-all"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto" style={{ backgroundColor: currentTheme.rawBg }}>
        <div className="max-w-4xl mx-auto px-6 py-6 space-y-6">
          {/* View Mode Toggle */}
          <div className="flex gap-2">
            <button
              onClick={() => setWorkoutViewMode('table')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                workoutViewMode === 'table'
                  ? 'bg-blue-500 text-white'
                  : `${currentTheme.inputBg}`
              }`}
              style={workoutViewMode !== 'table' ? { backgroundColor: currentTheme.rawInputBg } : {}}
            >
              Table View
            </button>
            <button
              onClick={() => setWorkoutViewMode('card')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                workoutViewMode === 'card'
                  ? 'bg-blue-500 text-white'
                  : `${currentTheme.inputBg}`
              }`}
              style={workoutViewMode !== 'card' ? { backgroundColor: currentTheme.rawInputBg } : {}}
            >
              Card View
            </button>
          </div>

          {/* Date Input */}
          <div>
            <label className="block text-sm font-medium mb-2">Date</label>
            <input
              type="date"
              value={current.date}
              onChange={handleDateChange}
              className={`w-full px-4 py-2 rounded-lg border ${currentTheme.inputBg} ${currentTheme.inputBorder}`}
              style={{ borderColor: currentTheme.rawInputBorder, backgroundColor: currentTheme.rawInputBg, color: currentTheme.rawText }}
            />
          </div>

          {/* Workout & Structure */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Preset</label>
              <select
                value={current.location}
                onChange={handleLocationChange}
                className={`w-full px-4 py-2 rounded-lg border ${currentTheme.inputBg} ${currentTheme.inputBorder}`}
                style={{ borderColor: currentTheme.rawInputBorder, backgroundColor: currentTheme.rawInputBg, color: currentTheme.rawText }}
              >
                <option value="">-- Select Preset --</option>
                {presets.map((preset) => (
                  <option key={preset.name} value={preset.name}>
                    {preset.name}
                  </option>
                ))}
                <option value="Day Off">Day Off</option>
              </select>
            </div>

            {!isDayOff && (
              <div>
                <label className="block text-sm font-medium mb-2">Structure</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleStructureChange('Pairs')}
                    className={`flex-1 px-3 py-2 rounded-lg font-medium transition-all ${
                      current.structure === 'Pairs'
                        ? 'bg-blue-500 text-white'
                        : `${currentTheme.inputBg}`
                    }`}
                    style={current.structure !== 'Pairs' ? { backgroundColor: currentTheme.rawInputBg } : {}}
                  >
                    Pairs
                  </button>
                  <button
                    onClick={() => handleStructureChange('Circuit')}
                    className={`flex-1 px-3 py-2 rounded-lg font-medium transition-all ${
                      current.structure === 'Circuit'
                        ? 'bg-blue-500 text-white'
                        : `${currentTheme.inputBg}`
                    }`}
                    style={current.structure !== 'Circuit' ? { backgroundColor: currentTheme.rawInputBg } : {}}
                  >
                    Circuit
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Duration Selector for Pairs */}
          {current.structure === 'Pairs' && !isDayOff && (
            <div>
              <label className="block text-sm font-medium mb-2">Duration</label>
              <div className="flex gap-2">
                {['3', '4', '5'].map((duration) => (
                  <button
                    key={duration}
                    onClick={() => handleDurationChange(duration)}
                    className={`flex-1 px-3 py-2 rounded-lg font-medium transition-all ${
                      current.structureDuration === duration
                        ? 'bg-blue-500 text-white'
                        : `${currentTheme.inputBg}`
                    }`}
                    style={current.structureDuration !== duration ? { backgroundColor: currentTheme.rawInputBg } : {}}
                  >
                    {duration}'
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Exercises Section */}
          {!isDayOff && current.exercises.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold">Exercises</h2>
              {workoutViewMode === 'table' ? (
                <ExercisesTableView />
              ) : (
                <ExercisesCardView />
              )}
            </div>
          )}

          {/* Add Exercise Button */}
          {!isDayOff && (
            <button
              onClick={addExercise}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-all font-medium"
            >
              <Plus size={20} /> Add Exercise
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
              placeholder="Add any notes about this workout..."
              className={`w-full px-4 py-3 rounded-lg border ${currentTheme.inputBg} ${currentTheme.inputBorder} resize-none`}
              rows={isDayOff ? 8 : 4}
              style={{ borderColor: currentTheme.rawInputBorder, backgroundColor: currentTheme.rawInputBg, color: currentTheme.rawText }}
            />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div
        className="sticky bottom-0 px-6 py-4 border-t flex gap-3"
        style={{ borderColor: currentTheme.rawCardBorder, backgroundColor: currentTheme.rawCardBg }}
      >
        {isEditing ? (
          <>
            <button
              onClick={handleClose}
              className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${currentTheme.inputBg} hover:opacity-80`}
              style={{ backgroundColor: currentTheme.rawInputBg }}
            >
              Cancel
            </button>
            <button
              onClick={handleSaveWorkout}
              className="flex-1 px-4 py-2 rounded-lg font-medium text-white bg-blue-500 hover:bg-blue-600 transition-all"
            >
              Update
            </button>
          </>
        ) : workoutStarted ? (
          <>
            <button
              onClick={handleClose}
              className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${currentTheme.inputBg} hover:opacity-80`}
              style={{ backgroundColor: currentTheme.rawInputBg }}
            >
              Cancel
            </button>
            <button
              onClick={handleSaveWorkout}
              className="flex-1 px-4 py-2 rounded-lg font-medium text-white bg-blue-500 hover:bg-blue-600 transition-all"
            >
              Save Workout
            </button>
          </>
        ) : (
          <>
            <button
              onClick={handleClose}
              className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${currentTheme.inputBg} hover:opacity-80`}
              style={{ backgroundColor: currentTheme.rawInputBg }}
            >
              Cancel
            </button>
            <button
              onClick={handleStartWorkout}
              className="flex-1 px-4 py-2 rounded-lg font-medium text-white bg-green-500 hover:bg-green-600 transition-all"
            >
              Start Workout
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function ExercisesTableView() {
  const { getCurrentTheme } = useThemeStore();
  const currentTheme = getCurrentTheme();

  const { current, updateExercise, updateSet, addSet, removeSet, removeExercise } = useWorkoutStore();
  const { workoutStarted } = useWorkoutStore();
  const { openModal } = useUIStore();

  return (
    <div className="space-y-4">
      {current.exercises.map((exercise, ei) => (
        <div key={ei} className={`border rounded-lg p-4 ${currentTheme.cardBorder}`} style={{ borderColor: currentTheme.rawCardBorder }}>
          {/* Exercise Name & Delete */}
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={exercise.name}
              onChange={(e) => updateExercise(ei, 'name', e.target.value)}
              placeholder="Exercise name"
              className={`flex-1 px-3 py-2 rounded-lg border ${currentTheme.inputBg} ${currentTheme.inputBorder}`}
              style={{ borderColor: currentTheme.rawInputBorder, backgroundColor: currentTheme.rawInputBg, color: currentTheme.rawText }}
            />
            <button
              onClick={() => {
                useUIStore.setState({ deleteExercise: ei });
                openModal('confirmDialog');
              }}
              className="p-2 text-red-500 hover:bg-red-500 hover:bg-opacity-10 rounded transition-all"
            >
              <Trash2 size={20} />
            </button>
          </div>

          {/* Sets */}
          <div className="flex gap-2 items-center flex-wrap mb-4">
            {exercise.sets.map((set, si) => (
              <div key={si} className="flex gap-2 items-center">
                <input
                  type="text"
                  value={set.reps}
                  onChange={(e) => updateSet(ei, si, 'reps', e.target.value)}
                  placeholder="Reps"
                  disabled={!workoutStarted}
                  className={`w-12 px-2 py-1 rounded-lg border text-center ${
                    workoutStarted ? currentTheme.inputBg : 'bg-gray-300 opacity-50'
                  } ${currentTheme.inputBorder}`}
                  style={{ borderColor: currentTheme.rawInputBorder, backgroundColor: workoutStarted ? currentTheme.rawInputBg : '#d1d5db', color: currentTheme.rawText }}
                />
                {si === exercise.sets.length - 1 && (
                  <button
                    onClick={() => removeSet(ei, si)}
                    className="text-red-500 hover:opacity-70 transition-opacity"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            ))}
            <button
              onClick={() => addSet(ei)}
              className="ml-auto px-2 py-1 text-blue-500 hover:bg-blue-500 hover:bg-opacity-10 rounded transition-all"
            >
              <Plus size={16} />
            </button>
          </div>

          {/* Notes */}
          <input
            type="text"
            value={exercise.notes}
            onChange={(e) => updateExercise(ei, 'notes', e.target.value)}
            placeholder="Notes"
            className={`w-full px-3 py-2 rounded-lg border ${currentTheme.inputBg} ${currentTheme.inputBorder}`}
            style={{ borderColor: currentTheme.rawInputBorder, backgroundColor: currentTheme.rawInputBg, color: currentTheme.rawText }}
          />
        </div>
      ))}
    </div>
  );
}

function ExercisesCardView() {
  const { getCurrentTheme } = useThemeStore();
  const currentTheme = getCurrentTheme();

  const { current, updateExercise, updateSet, addSet, removeSet, removeExercise } = useWorkoutStore();
  const { workoutStarted } = useWorkoutStore();
  const { openModal } = useUIStore();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {current.exercises.map((exercise, ei) => (
        <div
          key={ei}
          className={`border rounded-lg p-4 ${currentTheme.cardBorder}`}
          style={{ borderColor: currentTheme.rawCardBorder }}
        >
          {/* Exercise Name & Delete */}
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={exercise.name}
              onChange={(e) => updateExercise(ei, 'name', e.target.value)}
              placeholder="Exercise name"
              className={`flex-1 px-3 py-2 rounded-lg border ${currentTheme.inputBg} ${currentTheme.inputBorder}`}
              style={{ borderColor: currentTheme.rawInputBorder, backgroundColor: currentTheme.rawInputBg, color: currentTheme.rawText }}
            />
            <button
              onClick={() => {
                useUIStore.setState({ deleteExercise: ei });
                openModal('confirmDialog');
              }}
              className="p-2 text-red-500 hover:bg-red-500 hover:bg-opacity-10 rounded transition-all"
            >
              <Trash2 size={20} />
            </button>
          </div>

          {/* Sets Grid */}
          <div className="space-y-3">
            <div className="flex gap-2 flex-wrap items-center">
              {exercise.sets.map((set, si) => (
                <div key={si} className="flex flex-col items-center gap-1">
                  <label className="text-xs font-medium opacity-70">S{si + 1}</label>
                  <input
                    type="text"
                    value={set.reps}
                    onChange={(e) => updateSet(ei, si, 'reps', e.target.value)}
                    placeholder="Reps"
                    disabled={!workoutStarted}
                    className={`w-12 px-2 py-1 rounded-lg border text-center ${
                      workoutStarted ? currentTheme.inputBg : 'bg-gray-300 opacity-50'
                    } ${currentTheme.inputBorder}`}
                    style={{ borderColor: currentTheme.rawInputBorder, backgroundColor: workoutStarted ? currentTheme.rawInputBg : '#d1d5db', color: currentTheme.rawText }}
                  />
                  {si === exercise.sets.length - 1 && (
                    <button
                      onClick={() => removeSet(ei, si)}
                      className="text-red-500 hover:opacity-70 transition-opacity text-xs mt-1"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              ))}
              <button
                onClick={() => addSet(ei)}
                className="px-2 py-1 ml-2 text-blue-500 hover:bg-blue-500 hover:bg-opacity-10 rounded transition-all"
              >
                <Plus size={16} />
              </button>
            </div>

            {/* Notes */}
            <input
              type="text"
              value={exercise.notes}
              onChange={(e) => updateExercise(ei, 'notes', e.target.value)}
              placeholder="Notes"
              className={`w-full px-3 py-2 rounded-lg border text-sm ${currentTheme.inputBg} ${currentTheme.inputBorder}`}
              style={{ borderColor: currentTheme.rawInputBorder, backgroundColor: currentTheme.rawInputBg, color: currentTheme.rawText }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
