import { useState } from 'react';
import { X } from 'lucide-react';
import { useThemeStore } from '../../stores/themeStore';
import { useUIStore } from '../../stores/uiStore';
import { useWorkoutStore } from '../../stores/workoutStore';
import { usePresetStore } from '../../stores/presetStore';
import { useTrackingStore } from '../../stores/trackingStore';

function formatTime(seconds) {
  if (!seconds || seconds < 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${String(secs).padStart(2, '0')}`;
}

export default function ConfirmDialog() {
  const currentTheme = useThemeStore((state) => state.getCurrentTheme());

  const deleteWorkout = useUIStore((state) => state.deleteWorkout);
  const deletePreset = useUIStore((state) => state.deletePreset);
  const deleteExercise = useUIStore((state) => state.deleteExercise);
  const deleteWeight = useUIStore((state) => state.deleteWeight);
  const showClear = useUIStore((state) => state.showClear);
  const showCloseConfirm = useUIStore((state) => state.showCloseConfirm);
  const showEndWorkoutConfirm = useUIStore((state) => state.showEndWorkoutConfirm);
  const showSaveAsPreset = useUIStore((state) => state.showSaveAsPreset);
  const showToastMessage = useUIStore((state) => state.showToastMessage);

  const current = useWorkoutStore((state) => state.current);
  const workoutTimer = useWorkoutStore((state) => state.workoutTimer);
  const saveWorkout = useWorkoutStore((state) => state.saveWorkout);
  const resetCurrent = useWorkoutStore((state) => state.resetCurrent);
  const removeExercise = useWorkoutStore((state) => state.removeExercise);
  const workoutDeleteAction = useWorkoutStore((state) => state.deleteWorkout);
  const setEditing = useWorkoutStore((state) => state.setEditing);

  const presets = usePresetStore((state) => state.presets);
  const deletePresetAction = usePresetStore((state) => state.deletePreset);

  const deleteWeightEntry = useTrackingStore((state) => state.deleteWeightEntry);

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
        title="Delete Workout?"
        message="Are you sure you want to delete this workout? This action cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Keep"
        onConfirm={() => {
          workoutDeleteAction(deleteWorkout);
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
        title="Delete Preset?"
        message={`Delete "${presetName}"? This cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Keep"
        onConfirm={() => {
          deletePresetAction(deletePreset);
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
        title="Remove Exercise?"
        message={`Remove "${exerciseName}" from this workout?`}
        confirmLabel="Remove"
        cancelLabel="Keep"
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
        title="Delete Weight Entry?"
        message="Delete this weight entry? This action cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Keep"
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
        title="Clear All Workouts?"
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
        title="Discard Workout?"
        message="You have unsaved changes. Are you sure you want to close?"
        confirmLabel="Discard"
        cancelLabel="Keep Editing"
        onConfirm={() => {
          resetCurrent();
          useUIStore.setState({ showWorkoutModal: false });
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
        title="Save Workout?"
        message={`Save this workout with ${formatTime(workoutTimer / 1000)} elapsed time?`}
        confirmLabel="Save"
        cancelLabel="Cancel"
        onConfirm={() => {
          saveWorkout(workoutTimer);
          useUIStore.setState({ showWorkoutModal: false });
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
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.75)' }}
    >
      <div
        className="rounded-2xl shadow-2xl mx-4 p-6 max-w-sm w-full"
        style={{ backgroundColor: currentTheme.rawCardBg }}
      >
        {/* Title */}
        <h2
          className="text-xl font-bold mb-4"
          style={{
            color: destructive ? '#fbbf24' : currentTheme.rawText,
          }}
        >
          {title}
        </h2>

        {/* Message */}
        <p
          className="text-sm mb-6"
          style={{
            color: currentTheme.rawText,
            opacity: 0.8,
          }}
        >
          {message}
        </p>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 rounded-xl py-3 font-semibold transition-all duration-200 hover:opacity-80"
            style={{
              backgroundColor: currentTheme.rawInputBg,
              color: currentTheme.rawText,
            }}
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 rounded-xl py-3 font-semibold text-white transition-all duration-200 hover:opacity-90"
            style={{
              backgroundColor: destructive ? '#ef4444' : '#3b82f6',
            }}
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
  const current = useWorkoutStore((state) => state.current);
  const addPreset = usePresetStore((state) => state.addPreset);
  const presets = usePresetStore((state) => state.presets);
  const showToastMessage = useUIStore((state) => state.showToastMessage);

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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.75)' }}
    >
      <div
        className="rounded-2xl shadow-2xl mx-4 p-6 max-w-sm w-full"
        style={{ backgroundColor: currentTheme.rawCardBg }}
      >
        {/* Title */}
        <h2
          className="text-xl font-bold mb-4"
          style={{ color: currentTheme.rawText }}
        >
          Save as Preset
        </h2>

        {/* Message */}
        <p
          className="text-sm mb-4"
          style={{
            color: currentTheme.rawText,
            opacity: 0.8,
          }}
        >
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
          className="w-full px-4 py-2 rounded-lg border mb-6"
          style={{
            backgroundColor: currentTheme.rawInputBg,
            borderColor: currentTheme.rawInputBorder,
            color: currentTheme.rawText,
          }}
        />

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleClose}
            className="flex-1 rounded-xl py-3 font-semibold transition-all duration-200 hover:opacity-80"
            style={{
              backgroundColor: currentTheme.rawInputBg,
              color: currentTheme.rawText,
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 rounded-xl py-3 font-semibold text-white transition-all bg-blue-500 hover:opacity-90"
            style={{
              backgroundColor: '#3b82f6',
            }}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
