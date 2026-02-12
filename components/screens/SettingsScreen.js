import { useState } from 'react';
import { ChevronUp, ChevronDown, Plus, Trash2, Upload, Download } from 'lucide-react';
import { useThemeStore } from '../../stores/themeStore';
import { usePresetStore } from '../../stores/presetStore';
import { useWorkoutStore } from '../../stores/workoutStore';
import { useUIStore } from '../../stores/uiStore';
import { PRESET_COLORS } from '../../lib/constants';
import { exportWorkoutsCSV, downloadCSV } from '../../lib/csvExport';
import { importPresetsFromCSV, importWorkoutsFromCSV } from '../../lib/csvImport';
import PresetForm from '../settings/PresetForm';
import BackupsModal from '../settings/BackupsModal';

function CollapsibleSection({ title, count, isOpen, onToggle, currentTheme, children }) {
  return (
    <div className={`mb-6 rounded-lg border ${currentTheme.cardBorder} overflow-hidden`} style={{ borderColor: currentTheme.rawCardBorder }}>
      {/* Header */}
      <button
        onClick={onToggle}
        className={`w-full px-6 py-4 flex items-center justify-between ${currentTheme.cardBg} hover:opacity-80 transition-opacity`}
        style={{ backgroundColor: currentTheme.rawCardBg }}
      >
        <div className="flex items-center gap-3">
          <span className={`text-lg font-semibold ${currentTheme.text}`}>{title}</span>
          {count !== undefined && (
            <span className={`text-sm px-2 py-1 rounded ${currentTheme.inputBg} ${currentTheme.text} opacity-70`} style={{ backgroundColor: currentTheme.rawInputBg, color: currentTheme.rawText }}>
              {count}
            </span>
          )}
        </div>
        {isOpen ? (
          <ChevronUp size={20} className={currentTheme.text} />
        ) : (
          <ChevronDown size={20} className={currentTheme.text} />
        )}
      </button>

      {/* Content */}
      {isOpen && (
        <div className={`px-6 py-4 border-t ${currentTheme.cardBorder}`} style={{ borderColor: currentTheme.rawCardBorder }}>
          {children}
        </div>
      )}
    </div>
  );
}

export default function SettingsScreen() {
  const { getCurrentTheme } = useThemeStore();
  const currentTheme = getCurrentTheme();
  const { presets, exercises, addPreset, updatePreset, deletePreset, addExerciseName, deleteExerciseName } = usePresetStore();
  const { workouts } = useWorkoutStore();
  const {
    showPresetsMenu,
    showExercisesMenu,
    showDataManagement,
    showDataDeletion,
    showCreatePreset,
    editingPreset,
    showBackups,
    showToastMessage
  } = useUIStore();

  // Toggle functions
  const togglePresetsMenu = () => {
    useUIStore.setState({ showPresetsMenu: !showPresetsMenu });
  };

  const toggleExercisesMenu = () => {
    useUIStore.setState({ showExercisesMenu: !showExercisesMenu });
  };

  const toggleDataManagement = () => {
    useUIStore.setState({ showDataManagement: !showDataManagement });
  };

  const toggleDataDeletion = () => {
    useUIStore.setState({ showDataDeletion: !showDataDeletion });
  };

  // Preset handlers
  const handleCreatePreset = () => {
    useUIStore.setState({ showCreatePreset: true, editingPreset: null });
  };

  const handleEditPreset = (index) => {
    useUIStore.setState({ editingPreset: index, showCreatePreset: true });
  };

  const handleDeletePreset = (index) => {
    deletePreset(index);
    showToastMessage('Preset deleted');
  };

  const handleMovePresetUp = (index) => {
    if (index > 0) {
      const newPresets = [...presets];
      [newPresets[index - 1], newPresets[index]] = [newPresets[index], newPresets[index - 1]];
      usePresetStore.setState({ presets: newPresets });
    }
  };

  const handleMovePresetDown = (index) => {
    if (index < presets.length - 1) {
      const newPresets = [...presets];
      [newPresets[index], newPresets[index + 1]] = [newPresets[index + 1], newPresets[index]];
      usePresetStore.setState({ presets: newPresets });
    }
  };

  // Exercise handlers
  const handleAddExercise = () => {
    const name = prompt('Enter exercise name:');
    if (name && name.trim()) {
      addExerciseName(name.trim());
      showToastMessage(`${name} added to exercises`);
    }
  };

  const handleDeleteExercise = (name) => {
    if (confirm(`Delete "${name}" from exercises?`)) {
      deleteExerciseName(name);
      showToastMessage(`${name} removed`);
    }
  };

  // CSV Import/Export handlers
  const handleImportPresetsCSV = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result;
        if (typeof content !== 'string') return;

        const { presets: importedPresets, exercises: importedExercises } = importPresetsFromCSV(content);

        // Add all presets
        importedPresets.forEach((preset) => {
          addPreset(preset);
        });

        // Add all exercises
        importedExercises.forEach((exercise) => {
          addExerciseName(exercise);
        });

        showToastMessage(`Imported ${importedPresets.length} preset(s)`);
      } catch (error) {
        showToastMessage('Error importing presets');
        console.error('Import error:', error);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleImportWorkoutsCSV = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result;
        if (typeof content !== 'string') return;

        const importedWorkouts = importWorkoutsFromCSV(content);

        // Import workouts into store
        const currentWorkouts = useWorkoutStore.getState().workouts;
        useWorkoutStore.setState({ workouts: [...importedWorkouts, ...currentWorkouts] });

        showToastMessage(`Imported ${importedWorkouts.length} workout(s)`);
      } catch (error) {
        showToastMessage('Error importing workouts');
        console.error('Import error:', error);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleExportData = () => {
    try {
      const csv = exportWorkoutsCSV(workouts);
      downloadCSV(csv, `gors-workouts-${new Date().toISOString().split('T')[0]}.csv`);
      showToastMessage('Workouts exported');
    } catch (error) {
      showToastMessage('Error exporting data');
      console.error('Export error:', error);
    }
  };

  const handleViewBackups = () => {
    useUIStore.setState({ showBackups: true });
  };

  const handleClearAllWorkouts = () => {
    if (confirm('Are you sure? This will delete all workouts. This action cannot be undone.')) {
      useWorkoutStore.setState({ workouts: [] });
      showToastMessage('All workouts deleted');
    }
  };

  const getPresetColor = (colorName) => {
    return PRESET_COLORS.find((c) => c.name === colorName) || PRESET_COLORS[0];
  };

  return (
    <div className={`min-h-screen ${currentTheme.bg}`}>
      <div className="max-w-2xl mx-auto px-4 py-6 pb-24">
        {/* Header */}
        <div className="mb-8">
          <h1 className={`text-3xl font-bold ${currentTheme.text} mb-2`}>Settings</h1>
          <p className={`${currentTheme.text} opacity-60`}>Manage presets, data, and backups</p>
        </div>

        {/* Workout Presets Section */}
        <CollapsibleSection
          title="💪 Workout Presets"
          count={presets.length}
          isOpen={showPresetsMenu}
          onToggle={togglePresetsMenu}
          currentTheme={currentTheme}
        >
          {presets.length === 0 ? (
            <p className={`${currentTheme.text} opacity-60 py-4`}>No presets yet. Create one to get started!</p>
          ) : (
            <div className="space-y-3 mb-4">
              {presets.map((preset, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border flex items-center justify-between`}
                  style={{ borderColor: getPresetColor(preset.color).border }}
                >
                  <div className="flex-1">
                    <h3 className={`font-semibold ${currentTheme.text}`}>{preset.name}</h3>
                    <p className={`text-sm ${currentTheme.text} opacity-60`}>
                      {preset.exercises.length} exercise{preset.exercises.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleMovePresetUp(index)}
                      disabled={index === 0}
                      className={`p-2 rounded transition-colors ${
                        index === 0
                          ? 'opacity-40 cursor-not-allowed'
                          : `hover:bg-white/10`
                      }`}
                      title="Move up"
                    >
                      <ChevronUp size={18} />
                    </button>
                    <button
                      onClick={() => handleMovePresetDown(index)}
                      disabled={index === presets.length - 1}
                      className={`p-2 rounded transition-colors ${
                        index === presets.length - 1
                          ? 'opacity-40 cursor-not-allowed'
                          : `hover:bg-white/10`
                      }`}
                      title="Move down"
                    >
                      <ChevronDown size={18} />
                    </button>
                    <button
                      onClick={() => handleEditPreset(index)}
                      className={`px-3 py-2 rounded text-sm font-medium ${currentTheme.inputBg} hover:opacity-80 transition-opacity`}
                      style={{ backgroundColor: currentTheme.rawInputBg }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeletePreset(index)}
                      className="p-2 rounded hover:bg-red-500/20 transition-colors text-red-400"
                      title="Delete"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Create New Preset Button */}
          <button
            onClick={handleCreatePreset}
            className={`w-full py-3 px-4 rounded-lg border-2 border-dashed ${currentTheme.cardBorder} ${currentTheme.text} hover:opacity-80 transition-opacity flex items-center justify-center gap-2`}
          >
            <Plus size={20} />
            Create New Preset
          </button>
        </CollapsibleSection>

        {/* Exercise Presets Section */}
        <CollapsibleSection
          title="🏋️ Exercise Presets"
          count={exercises.length}
          isOpen={showExercisesMenu}
          onToggle={toggleExercisesMenu}
          currentTheme={currentTheme}
        >
          {exercises.length === 0 ? (
            <p className={`${currentTheme.text} opacity-60 py-4`}>No exercises yet. Add one to get started!</p>
          ) : (
            <div className="space-y-2 mb-4">
              {exercises.sort().map((exercise) => (
                <div
                  key={exercise}
                  className={`p-3 rounded-lg ${currentTheme.inputBg} flex items-center justify-between`}
                >
                  <span className={`${currentTheme.text} font-medium`}>{exercise}</span>
                  <button
                    onClick={() => handleDeleteExercise(exercise)}
                    className="p-2 rounded hover:bg-red-500/20 transition-colors text-red-400"
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Add Exercise Button */}
          <button
            onClick={handleAddExercise}
            className={`w-full py-3 px-4 rounded-lg border-2 border-dashed ${currentTheme.cardBorder} ${currentTheme.text} hover:opacity-80 transition-opacity flex items-center justify-center gap-2`}
          >
            <Plus size={20} />
            Add Exercise
          </button>
        </CollapsibleSection>

        {/* Data Management Section */}
        <CollapsibleSection
          title="💾 Data Management"
          isOpen={showDataManagement}
          onToggle={toggleDataManagement}
          currentTheme={currentTheme}
        >
          <div className="space-y-3 mb-4">
            {/* Import Presets */}
            <div>
              <label className={`block text-sm font-medium ${currentTheme.text} mb-2`}>
                Import Presets (CSV)
              </label>
              <input
                type="file"
                accept=".csv"
                onChange={handleImportPresetsCSV}
                id="import-presets"
                className="hidden"
              />
              <label
                htmlFor="import-presets"
                className={`flex items-center justify-center gap-2 w-full py-3 px-4 rounded-lg border ${currentTheme.cardBorder} ${currentTheme.text} hover:opacity-80 transition-opacity cursor-pointer`}
              >
                <Upload size={18} />
                Choose Presets File
              </label>
            </div>

            {/* Import Workouts */}
            <div>
              <label className={`block text-sm font-medium ${currentTheme.text} mb-2`}>
                Import Workouts (CSV)
              </label>
              <input
                type="file"
                accept=".csv"
                onChange={handleImportWorkoutsCSV}
                id="import-workouts"
                className="hidden"
              />
              <label
                htmlFor="import-workouts"
                className={`flex items-center justify-center gap-2 w-full py-3 px-4 rounded-lg border ${currentTheme.cardBorder} ${currentTheme.text} hover:opacity-80 transition-opacity cursor-pointer`}
              >
                <Upload size={18} />
                Choose Workouts File
              </label>
            </div>

            {/* Export Data */}
            <button
              onClick={handleExportData}
              className={`w-full py-3 px-4 rounded-lg border ${currentTheme.cardBorder} ${currentTheme.text} hover:opacity-80 transition-opacity flex items-center justify-center gap-2`}
            >
              <Download size={18} />
              Export All Workouts (CSV)
            </button>

            {/* View Backups */}
            <button
              onClick={handleViewBackups}
              className={`w-full py-3 px-4 rounded-lg border ${currentTheme.cardBorder} ${currentTheme.text} hover:opacity-80 transition-opacity flex items-center justify-center gap-2`}
            >
              📦 View Backups
            </button>

            {/* Auto-backup Info */}
            <div className={`p-3 rounded-lg ${currentTheme.inputBg} text-sm ${currentTheme.text} opacity-75`}>
              <p>💡 Automatic backups are created every 7 days and stored locally.</p>
            </div>
          </div>
        </CollapsibleSection>

        {/* Data Deletion Section */}
        <CollapsibleSection
          title="⚠️ Data Deletion"
          isOpen={showDataDeletion}
          onToggle={toggleDataDeletion}
          currentTheme={currentTheme}
        >
          <p className={`${currentTheme.text} opacity-75 text-sm mb-4`}>
            Permanently delete all your workouts. This action cannot be undone.
          </p>
          <button
            onClick={handleClearAllWorkouts}
            className="w-full py-3 px-4 rounded-lg bg-red-500/20 border border-red-500/50 text-red-400 hover:bg-red-500/30 transition-colors flex items-center justify-center gap-2 font-medium"
          >
            <Trash2 size={18} />
            Delete All Workouts
          </button>
        </CollapsibleSection>
      </div>

      {/* Modals */}
      {(showCreatePreset || editingPreset !== null) && <PresetForm />}
      {showBackups && <BackupsModal />}
    </div>
  );
}
