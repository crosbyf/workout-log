import { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { useThemeStore } from '../../stores/themeStore';
import { usePresetStore } from '../../stores/presetStore';
import { useUIStore } from '../../stores/uiStore';
import { PRESET_COLORS } from '../../lib/constants';

export default function PresetForm() {
  const { getCurrentTheme } = useThemeStore();
  const currentTheme = getCurrentTheme();
  const { presets, addPreset, updatePreset } = usePresetStore();
  const { editingPreset, showToastMessage } = useUIStore();

  const [name, setName] = useState('');
  const [color, setColor] = useState('Blue');
  const [exercisesList, setExercisesList] = useState([]);
  const [includeInMenu, setIncludeInMenu] = useState(true);
  const [selectedExercise, setSelectedExercise] = useState('');

  const { exercises } = usePresetStore();

  // Initialize form when editing
  useEffect(() => {
    if (editingPreset !== null && presets[editingPreset]) {
      const preset = presets[editingPreset];
      setName(preset.name);
      setColor(preset.color || 'Blue');
      setExercisesList(preset.exercises || []);
      setIncludeInMenu(preset.includeInMenu !== false);
      setSelectedExercise('');
    } else {
      resetForm();
    }
  }, [editingPreset, presets]);

  const resetForm = () => {
    setName('');
    setColor('Blue');
    setExercisesList([]);
    setIncludeInMenu(true);
    setSelectedExercise('');
  };

  const handleAddExercise = () => {
    if (selectedExercise && !exercisesList.includes(selectedExercise)) {
      setExercisesList([...exercisesList, selectedExercise]);
      setSelectedExercise('');
    }
  };

  const handleRemoveExercise = (index) => {
    setExercisesList(exercisesList.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    if (!name.trim()) {
      showToastMessage('Please enter a preset name');
      return;
    }

    if (exercisesList.length === 0) {
      showToastMessage('Please add at least one exercise');
      return;
    }

    const preset = {
      name: name.trim(),
      color,
      exercises: exercisesList,
      includeInMenu,
    };

    if (editingPreset !== null) {
      updatePreset(editingPreset, preset);
      showToastMessage('Preset updated');
    } else {
      addPreset(preset);
      showToastMessage('Preset created');
    }

    handleClose();
  };

  const handleClose = () => {
    resetForm();
    useUIStore.setState({ showCreatePreset: false, editingPreset: null });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div
        className={`rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto ${currentTheme.cardBg}`}
        style={{ backgroundColor: currentTheme.rawCardBg }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`sticky top-0 flex items-center justify-between px-6 py-4 border-b`} style={{ borderColor: currentTheme.rawCardBorder }}>
          <h2 className={`text-xl font-bold ${currentTheme.text}`}>
            {editingPreset !== null ? 'Edit Preset' : 'Create New Preset'}
          </h2>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-white/10 rounded transition-colors"
            aria-label="Close"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-6 space-y-6">
          {/* Preset Name */}
          <div>
            <label className={`block text-sm font-medium ${currentTheme.text} mb-2`}>
              Preset Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Upper Body, Leg Day"
              className={`w-full px-4 py-2 rounded-lg border ${currentTheme.cardBorder} ${currentTheme.inputBg} ${currentTheme.text} focus:outline-none focus:ring-2 focus:ring-blue-500`}
              style={{ borderColor: currentTheme.rawCardBorder, backgroundColor: currentTheme.rawInputBg, color: currentTheme.rawText }}
            />
          </div>

          {/* Color Selector */}
          <div>
            <label className={`block text-sm font-medium ${currentTheme.text} mb-3`}>
              Preset Color
            </label>
            <div className="grid grid-cols-4 gap-3">
              {PRESET_COLORS.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => setColor(preset.name)}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    color === preset.name
                      ? `border-${preset.name.toLowerCase()}-400 scale-105`
                      : `border-transparent opacity-60 hover:opacity-80`
                  }`}
                  style={{
                    backgroundColor: preset.bg,
                    borderColor: color === preset.name ? preset.border.replace('border-', '').replace('-400', '') : 'transparent',
                  }}
                  title={preset.name}
                >
                  <div className={`text-xs font-medium ${preset.text}`}>{preset.name}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Exercises List */}
          <div>
            <label className={`block text-sm font-medium ${currentTheme.text} mb-3`}>
              Exercises *
            </label>

            {/* Exercise Input */}
            <div className="flex gap-2 mb-4">
              <select
                value={selectedExercise}
                onChange={(e) => setSelectedExercise(e.target.value)}
                className={`flex-1 px-4 py-2 rounded-lg border ${currentTheme.cardBorder} ${currentTheme.inputBg} ${currentTheme.text} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                style={{ borderColor: currentTheme.rawCardBorder, backgroundColor: currentTheme.rawInputBg, color: currentTheme.rawText }}
              >
                <option value="">Select an exercise...</option>
                {exercises.map((ex) => (
                  <option key={ex} value={ex}>
                    {ex}
                  </option>
                ))}
              </select>
              <button
                onClick={handleAddExercise}
                disabled={!selectedExercise || exercisesList.includes(selectedExercise)}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition-colors ${
                  !selectedExercise || exercisesList.includes(selectedExercise)
                    ? 'opacity-50 cursor-not-allowed'
                    : `${currentTheme.inputBg} hover:opacity-80`
                }`}
                style={(!selectedExercise || exercisesList.includes(selectedExercise)) ? {} : { backgroundColor: currentTheme.rawInputBg }}
              >
                <Plus size={18} />
                Add
              </button>
            </div>

            {/* Selected Exercises List */}
            {exercisesList.length > 0 ? (
              <div className="space-y-2">
                {exercisesList.map((exercise, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg ${currentTheme.inputBg} flex items-center justify-between`}
                    style={{ backgroundColor: currentTheme.rawInputBg }}
                  >
                    <span className={`${currentTheme.text} font-medium`}>{exercise}</span>
                    <button
                      onClick={() => handleRemoveExercise(index)}
                      className="p-2 rounded hover:bg-red-500/20 transition-colors text-red-400"
                      title="Remove"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className={`${currentTheme.text} opacity-60 text-sm italic`}>
                Add exercises to your preset
              </p>
            )}
          </div>

          {/* Show in Menu Checkbox */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="include-menu"
              checked={includeInMenu}
              onChange={(e) => setIncludeInMenu(e.target.checked)}
              className="w-4 h-4 rounded cursor-pointer"
            />
            <label
              htmlFor="include-menu"
              className={`text-sm font-medium ${currentTheme.text} cursor-pointer`}
            >
              Show in New Workout menu
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className={`sticky bottom-0 flex gap-3 px-6 py-4 border-t`} style={{ borderColor: currentTheme.rawCardBorder }}>
          <button
            onClick={handleClose}
            className={`flex-1 px-4 py-2 rounded-lg border ${currentTheme.cardBorder} ${currentTheme.text} hover:opacity-80 transition-colors font-medium`}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors font-medium"
          >
            {editingPreset !== null ? 'Update' : 'Create'}
          </button>
        </div>
      </div>
    </div>
  );
}
