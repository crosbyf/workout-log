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
        className="rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
        style={{ backgroundColor: currentTheme.rawCardBg }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: currentTheme.rawCardBorder }}>
          <h2 className="text-xl font-bold" style={{ color: currentTheme.rawText }}>
            {editingPreset !== null ? 'Edit Preset' : 'Create Preset'}
          </h2>
          <button
            onClick={handleClose}
            className="p-1 hover:opacity-70 rounded transition-colors"
            aria-label="Close"
            style={{ color: currentTheme.rawText }}
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-6 space-y-6">
          {/* Preset Name */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: currentTheme.rawText }}>
              Preset Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Upper Body, Leg Day"
              className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500"
              style={{ borderColor: currentTheme.rawCardBorder, backgroundColor: currentTheme.rawInputBg, color: currentTheme.rawText }}
            />
          </div>

          {/* Color Selector */}
          <div>
            <label className="block text-sm font-medium mb-3" style={{ color: currentTheme.rawText }}>
              Preset Color
            </label>
            <div className="grid grid-cols-4 gap-3">
              {PRESET_COLORS.map((preset) => {
                const colorMap = {
                  'Blue': '#60a5fa',
                  'Purple': '#c084fc',
                  'Green': '#4ade80',
                  'Yellow': '#facc15',
                  'Red': '#f87171',
                  'Pink': '#f472b6',
                  'Orange': '#fb923c',
                  'Cyan': '#06b6d4',
                };
                return (
                  <button
                    key={preset.name}
                    onClick={() => setColor(preset.name)}
                    className="p-3 rounded-lg border-2 transition-all"
                    style={{
                      backgroundColor: preset.bg,
                      borderColor: color === preset.name ? colorMap[preset.name] : 'transparent',
                      opacity: color === preset.name ? 1 : 0.6,
                      transform: color === preset.name ? 'scale(1.05)' : 'scale(1)',
                    }}
                    title={preset.name}
                  >
                    <div className="text-xs font-medium" style={{ color: colorMap[preset.name] }}>{preset.name}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Exercises List */}
          <div>
            <label className="block text-sm font-medium mb-3" style={{ color: currentTheme.rawText }}>
              Exercises
            </label>

            {/* Exercise Input */}
            <div className="flex gap-2 mb-4">
              <select
                value={selectedExercise}
                onChange={(e) => setSelectedExercise(e.target.value)}
                className="flex-1 px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                className="px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition-colors"
                style={{
                  backgroundColor: (!selectedExercise || exercisesList.includes(selectedExercise)) ? currentTheme.rawInputBg : currentTheme.rawInputBg,
                  opacity: (!selectedExercise || exercisesList.includes(selectedExercise)) ? 0.5 : 1,
                  cursor: (!selectedExercise || exercisesList.includes(selectedExercise)) ? 'not-allowed' : 'pointer',
                  color: currentTheme.rawText,
                }}
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
                    className="p-3 rounded-lg flex items-center justify-between"
                    style={{ backgroundColor: currentTheme.rawInputBg }}
                  >
                    <span className="font-medium" style={{ color: currentTheme.rawText }}>{exercise}</span>
                    <button
                      onClick={() => handleRemoveExercise(index)}
                      className="p-2 rounded hover:opacity-80 transition-colors text-red-400"
                      title="Remove"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm italic" style={{ color: currentTheme.rawText, opacity: 0.6 }}>
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
              className="text-sm font-medium cursor-pointer"
              style={{ color: currentTheme.rawText }}
            >
              Include in Quick Add menu
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 flex gap-3 px-6 py-4 border-t" style={{ borderColor: currentTheme.rawCardBorder }}>
          <button
            onClick={handleClose}
            className="flex-1 px-4 py-2 rounded-lg border hover:opacity-80 transition-colors font-medium"
            style={{ borderColor: currentTheme.rawCardBorder, color: currentTheme.rawText }}
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
