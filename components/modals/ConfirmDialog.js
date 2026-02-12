'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { useThemeStore } from '../../stores/themeStore';
import { useUIStore } from '../../stores/uiStore';
import { useWorkoutStore } from '../../stores/workoutStore';
import { usePresetStore } from '../../stores/presetStore';
import { useTrackingStore } from '../../stores/trackingStore';

export default function ConfirmDialog() {
  const { getCurrentTheme } = useThemeStore();
  const currentTheme = getCurrentTheme();

  const {
    deleteWorkout,
    deletePreset,
    deleteExercise,
    deleteWeight,
    showClear,
    showCloseConfirm,
    showEndWorkoutConfirm,
    showSaveAsPreset,
  } = useUIStore();

  const {
    closeModal: closeUIModal,
    showToastMessage,
  } = useUIStore((state) => ({
    closeModal: (name) => state.closeModal(name),
    showToastMessage: (msg) => state.showToastMessage(msg),
  }));

  const { workouts, current, editing, workoutTimer, saveWorkout, resetCurrent, removeExercise } = useWorkoutStore();
  const { presets } = usePresetStore();
  const { deleteWeightEntry } = useTrackingStore();

  // Determine which dialog to show
  let dialogType = null;

  if (deleteWorkout !== null) {
    dialogType = 'deleteWorkout';
  } else if (deletePreset !== null) {
    dialogType = 'deletePreset';
  } else if (deleteExercise !== null) {
    dialogType = 'deleteExercise';
  } else if (deleteWeight !== null) {
    dialogType = 'deleteWeight';
  } else if (showClear) {
    dialogType = 'clearAll';
  } else if (showCloseConfirm) {
    dialogType = 'closeConfirm';
  } else if (showEndWorkoutConfirm) {
    dialogType = 'endWorkoutConfirm';
  } else if (showSaveAsPreset) {
    dialogType = 'saveAsPreset';
  }

  const handleClose = () => {
    useUIStore.setState({
      deleteWorkout: null,
      deletePreset: null,
      deleteExercise: null,
      deleteWeight: null,
      showClear: false,
      showCloseConfirm: false,
      showEndWorkoutConfirm: false,
      showSaveAsPreset: false,
    });
  };

  // Delete Workout
  if (dialogType === 'deleteWorkout') {
    return (
      <BaseDialog
        title="Delete Workout"
        message={`Are you sure you want to delete this workout? This action cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={() => {
          useWorkoutStore.getState().deleteWorkout(deleteWorkout);
          showToastMessage('Workout deleted');
          handleClose();
        }}
        onCancel={handleClose}
        destructive
        currentTheme={currentTheme}
      />
    );
  }

  // Delete Preset
  if (dialogType === 'deletePreset') {
    const presetName = presets[deletePreset]?.name || 'Preset';
    return (
      <BaseDialog
        title="Delete Preset"
        message={`Delete "${presetName}"? This cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={() => {
          usePresetStore.getState().deletePreset(deletePreset);
          showToastMessage('Preset deleted');
          handleClose();
        }}
        onCancel={handleClose}
        destructive
        currentTheme={currentTheme}
      />
    );
  }

  // Delete Exercise from Workout
  if (dialogType === 'deleteExercise') {
    const exerciseName = current.exercises[deleteExercise]?.name || 'Exercise';
    return (
      <BaseDialog
        title="Delete Exercise"
        message={`Remove "${exerciseName}" from this workout?`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={() => {
          removeExercise(deleteExercise);
          showToastMessage('Exercise removed');
          handleClose();
        }}
        onCancel={handleClose}
        destructive
        currentTheme={currentTheme}
      />
    );
  }

  // Delete Weight Entry
  if (dialogType === 'deleteWeight') {
    return (
      <BaseDialog
        title="Delete Weight Entry"
        message="Delete this weight entry? This action cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={() => {
          deleteWeightEntry(deleteWeight);
          showToastMessage('Weight entry deleted');
          handleClose();
        }}
        onCancel={handleClose}
        destructive
        currentTheme={currentTheme}
      />
    );
  }

  // Clear All Workouts
  if (dialogType === 'clearAll') {
    return (
      <BaseDialog
        title="Clear All Workouts"
        message="This will permanently delete all workouts. This action cannot be undone."
        confirmLabel="Clear All"
        cancelLabel="Cancel"
        onConfirm={() => {
          useWorkoutStore.setState({ workouts: [] });
          showToastMessage('All workouts cleared');
          handleClose();
        }}
        onCancel={handleClose}
        destructive
        currentTheme={currentTheme}
      />
    );
  }

  // Close Workout Confirm
  if (dialogType === 'closeConfirm') {
    return (
      <BaseDialog
        title="Close Workout"
        message="Are you sure you want to close this workout without saving? Any unsaved data will be lost."
        confirmLabel="Close"
        cancelLabel="Cancel"
        onConfirm={() => {
          closeUIModal('workoutModal');
          resetCurrent();
          handleClose();
        }}
        onCancel={handleClose}
        destructive
        currentTheme={currentTheme}
      />
    );
  }

  // End Workout Confirm
  if (dialogType === 'endWorkoutConfirm') {
    return (
      <BaseDialog
        title="Save Workout"
        message={`Save this workout with ${formatTime(workoutTimer / 1000)} elapsed time?`}
        confirmLabel="Save"
        cancelLabel="Cancel"
        onConfirm={() => {
          saveWorkout(workoutTimer);
          closeUIModal('workoutModal');
          showToastMessage('Workout saved!');
          handleClose();
        }}
        onCancel={handleClose}
        destructive={false}
        currentTheme={currentTheme}
      />
    );
  }

  // Save as Preset
  if (dialogType === 'saveAsPreset') {
    return <SaveAsPresetDialog handleClose={handleClose} currentTheme={currentTheme} />;
  }

  return null;
}

function BaseDialog({
  title,
  message,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
  destructive,
  currentTheme,
}) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div
        className={`rounded-lg shadow-2xl max-w-sm w-full mx-4 p-6 relative ${currentTheme.cardBg}`}
        style={{ backgroundColor: currentTheme.rawCardBg }}
      >
        {/* Close button */}
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 p-1 hover:bg-white hover:bg-opacity-10 rounded transition-all"
          aria-label="Close dialog"
        >
          <X size={20} />
        </button>

        {/* Title */}
        <h2
          className={`text-xl font-bold mb-4 ${destructive ? 'text-red-500' : currentTheme.text}`}
          style={destructive ? { color: '#ef4444' } : { color: currentTheme.rawText }}
        >
          {title}
        </h2>

        {/* Message */}
        <p className={`mb-6 leading-relaxed ${currentTheme.text} opacity-80`}>
          {message}
        </p>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${currentTheme.inputBg} hover:opacity-80`}
            style={{ backgroundColor: currentTheme.rawInputBg }}
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 px-4 py-2 rounded-lg font-medium text-white transition-all duration-200 ${
              destructive
                ? 'bg-red-500 hover:bg-red-600'
                : 'bg-blue-500 hover:bg-blue-600'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

function SaveAsPresetDialog({ handleClose, currentTheme }) {
  const [presetName, setPresetName] = useState('');
  const { current } = useWorkoutStore();
  const { addPreset, presets } = usePresetStore();
  const { showToastMessage } = useUIStore();

  const handleConfirm = () => {
    if (!presetName.trim()) {
      showToastMessage('Please enter a preset name');
      return;
    }

    if (presets.some((p) => p.name === presetName)) {
      showToastMessage('Preset with this name already exists');
      return;
    }

    const newPreset = {
      name: presetName,
      exercises: current.exercises.map((e) => e.name),
      color: 'Blue',
      includeInMenu: true,
    };

    addPreset(newPreset);
    showToastMessage(`Preset "${presetName}" saved!`);
    handleClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div
        className={`rounded-lg shadow-2xl max-w-sm w-full mx-4 p-6 relative ${currentTheme.cardBg}`}
        style={{ backgroundColor: currentTheme.rawCardBg }}
      >
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-1 hover:bg-white hover:bg-opacity-10 rounded transition-all"
          aria-label="Close dialog"
        >
          <X size={20} />
        </button>

        {/* Title */}
        <h2 className="text-xl font-bold mb-4">Save as Preset</h2>

        {/* Message */}
        <p className={`mb-4 leading-relaxed ${currentTheme.text} opacity-80`}>
          Enter a name for this preset
        </p>

        {/* Input */}
        <input
          type="text"
          value={presetName}
          onChange={(e) => setPresetName(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              handleConfirm();
            }
          }}
          autoFocus
          placeholder="e.g., Push Day"
          className={`w-full px-4 py-2 rounded-lg border ${currentTheme.inputBg} ${currentTheme.inputBorder} mb-6`}
          style={{ borderColor: currentTheme.rawInputBorder }}
        />

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleClose}
            className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${currentTheme.inputBg} hover:opacity-80`}
            style={{ backgroundColor: currentTheme.rawInputBg }}
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 px-4 py-2 rounded-lg font-medium text-white bg-blue-500 hover:bg-blue-600 transition-all"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

function formatTime(seconds) {
  if (!seconds || seconds < 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${String(secs).padStart(2, '0')}`;
}
