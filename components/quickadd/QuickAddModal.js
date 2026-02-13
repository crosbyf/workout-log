'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { useUIStore } from '../../stores/uiStore';
import { usePresetStore } from '../../stores/presetStore';
import { useTrackingStore } from '../../stores/trackingStore';
import { useWorkoutStore } from '../../stores/workoutStore';
import { useThemeStore } from '../../stores/themeStore';
import { getTodayDate } from '../../lib/formatting';
import { getPresetColor } from '../../lib/constants';

export default function QuickAddModal() {
  const { getCurrentTheme } = useThemeStore();
  const currentTheme = getCurrentTheme();

  const { showPresetSelector, quickAddTab } = useUIStore();

  if (!showPresetSelector) return null;

  const closeModal = () => {
    useUIStore.setState({ showPresetSelector: false });
  };

  const setQuickAddTab = (tab) => {
    useUIStore.setState({ quickAddTab: tab });
  };

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)' }}
    >
      <div
        className="rounded-2xl max-w-md w-full max-h-[80vh] overflow-y-auto"
        style={{ backgroundColor: currentTheme.rawCardBg }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4 border-b"
          style={{ borderColor: currentTheme.rawCardBorder }}
        >
          <h2 className="text-lg font-bold">Quick Add</h2>
          <button
            onClick={closeModal}
            className="p-1 hover:opacity-70 transition-opacity"
          >
            <X size={24} />
          </button>
        </div>

        {/* Tabs */}
        <div
          className="flex border-b"
          style={{ borderColor: currentTheme.rawCardBorder }}
        >
          <TabButton
            label="🏆 Workout"
            isActive={quickAddTab === 'workout'}
            onClick={() => setQuickAddTab('workout')}
          />
          <TabButton
            label="🥩 Protein"
            isActive={quickAddTab === 'protein'}
            onClick={() => setQuickAddTab('protein')}
          />
          <TabButton
            label="⚖️ Weight"
            isActive={quickAddTab === 'weight'}
            onClick={() => setQuickAddTab('weight')}
          />
        </div>

        {/* Tab Content */}
        <div className="px-6 py-6">
          {quickAddTab === 'workout' && (
            <WorkoutTab
              closeModal={closeModal}
              currentTheme={currentTheme}
            />
          )}
          {quickAddTab === 'protein' && (
            <ProteinTab
              closeModal={closeModal}
              currentTheme={currentTheme}
            />
          )}
          {quickAddTab === 'weight' && (
            <WeightTab
              closeModal={closeModal}
              currentTheme={currentTheme}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function TabButton({ label, isActive, onClick }) {
  const { getCurrentTheme } = useThemeStore();
  const currentTheme = getCurrentTheme();

  return (
    <button
      onClick={onClick}
      className="flex-1 px-4 py-3 font-medium transition-all border-b-2"
      style={{
        borderColor: isActive ? '#3b82f6' : 'transparent',
        color: isActive ? '#3b82f6' : 'inherit',
        opacity: isActive ? 1 : 0.6,
      }}
    >
      {label}
    </button>
  );
}

function WorkoutTab({ closeModal, currentTheme }) {
  const { presets } = usePresetStore();
  const { setCurrent, loadPreset, resetCurrent } = useWorkoutStore();

  const handleSelectPreset = (preset) => {
    resetCurrent();
    setCurrent({ location: preset.name });
    loadPreset(preset);
    useUIStore.setState({ showPresetSelector: false, showWorkoutModal: true });
  };

  const handleManual = () => {
    resetCurrent();
    useUIStore.setState({ showPresetSelector: false, showWorkoutModal: true });
  };

  const handleDayOff = () => {
    resetCurrent();
    setCurrent({ location: 'Day Off' });
    useUIStore.setState({ showPresetSelector: false, showWorkoutModal: true });
  };

  const menuPresets = presets.filter((p) => p.includeInMenu !== false);

  return (
    <div className="space-y-3 max-h-96 overflow-y-auto">
      {menuPresets.length === 0 ? (
        <p className="text-center opacity-60 py-8">No presets available</p>
      ) : (
        menuPresets.map((preset, idx) => {
          const color = getPresetColor(preset.name, presets);
          const exerciseCount = preset.exercises ? preset.exercises.length : 0;

          return (
            <button
              key={idx}
              onClick={() => handleSelectPreset(preset)}
              className="w-full text-left p-4 rounded-xl transition-all hover:opacity-80 border-l-4"
              style={{
                backgroundColor: currentTheme.rawInputBg,
                borderColor: color?.text || '#666',
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: color?.text || '#666' }}
                />
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm">{preset.name}</div>
                  <div className="text-xs opacity-60">
                    {exerciseCount} exercise{exerciseCount !== 1 ? 's' : ''}
                  </div>
                </div>
              </div>
            </button>
          );
        })
      )}

      {/* Manual & Day Off Options */}
      <button
        onClick={handleManual}
        className="w-full text-left p-4 rounded-xl transition-all hover:opacity-80"
        style={{ backgroundColor: currentTheme.rawInputBg }}
      >
        <div className="font-semibold text-sm">Manual Workout</div>
      </button>

      <button
        onClick={handleDayOff}
        className="w-full text-left p-4 rounded-xl transition-all hover:opacity-80"
        style={{ backgroundColor: currentTheme.rawInputBg }}
      >
        <div className="font-semibold text-sm">Day Off</div>
      </button>
    </div>
  );
}

function ProteinTab({ closeModal, currentTheme }) {
  const [grams, setGrams] = useState('');
  const [food, setFood] = useState('');
  const { addProteinEntry } = useTrackingStore();

  const handleSubmit = () => {
    if (!grams || isNaN(parseFloat(grams))) {
      useUIStore.setState({
        toastMessage: 'Please enter a valid amount',
        showToast: true,
      });
      return;
    }

    const entry = {
      date: getTodayDate(),
      grams: parseFloat(grams),
      description: food || 'Protein',
      timestamp: Date.now(),
    };

    addProteinEntry(entry);
    useUIStore.setState({
      toastMessage: 'Protein logged!',
      showToast: true,
    });
    closeModal();
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">Grams</label>
        <input
          type="number"
          value={grams}
          onChange={(e) => setGrams(e.target.value)}
          autoFocus
          placeholder="30"
          className="w-full px-4 py-2 rounded-lg border"
          style={{
            backgroundColor: currentTheme.rawInputBg,
            borderColor: currentTheme.rawInputBorder,
            color: currentTheme.rawText,
          }}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Food</label>
        <input
          type="text"
          value={food}
          onChange={(e) => setFood(e.target.value)}
          placeholder="Chicken, Whey shake..."
          className="w-full px-4 py-2 rounded-lg border"
          style={{
            backgroundColor: currentTheme.rawInputBg,
            borderColor: currentTheme.rawInputBorder,
            color: currentTheme.rawText,
          }}
        />
      </div>

      <button
        onClick={handleSubmit}
        className="w-full px-4 py-2 rounded-lg font-medium text-white transition-all"
        style={{ backgroundColor: '#22c55e' }}
      >
        Add
      </button>
    </div>
  );
}

function WeightTab({ closeModal, currentTheme }) {
  const [weight, setWeight] = useState('');
  const { addWeightEntry } = useTrackingStore();

  const handleSubmit = () => {
    if (!weight || isNaN(parseFloat(weight))) {
      useUIStore.setState({
        toastMessage: 'Please enter a valid weight',
        showToast: true,
      });
      return;
    }

    const entry = {
      date: getTodayDate(),
      weight: parseFloat(weight),
      timestamp: Date.now(),
    };

    addWeightEntry(entry);
    useUIStore.setState({
      toastMessage: 'Weight logged!',
      showToast: true,
    });
    closeModal();
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">Weight</label>
        <input
          type="number"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
          autoFocus
          step="0.1"
          placeholder="175.5"
          className="w-full px-4 py-2 rounded-lg border"
          style={{
            backgroundColor: currentTheme.rawInputBg,
            borderColor: currentTheme.rawInputBorder,
            color: currentTheme.rawText,
          }}
        />
      </div>

      <button
        onClick={handleSubmit}
        className="w-full px-4 py-2 rounded-lg font-medium text-white transition-all"
        style={{ backgroundColor: '#3b82f6' }}
      >
        Add
      </button>
    </div>
  );
}
