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
  const {
    closeModal: closeUIModal,
    showToastMessage,
  } = useUIStore((state) => ({
    closeModal: (name) => state.closeModal(name),
    showToastMessage: (msg) => state.showToastMessage(msg),
  }));

  const setQuickAddTab = (tab) => {
    useUIStore.setState({ quickAddTab: tab });
  };

  if (!showPresetSelector) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div
        className={`rounded-lg shadow-2xl max-w-sm w-full ${currentTheme.cardBg}`}
        style={{ backgroundColor: currentTheme.rawCardBg }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: currentTheme.rawCardBorder }}>
          <h2 className="text-2xl font-bold">Quick Add</h2>
          <button
            onClick={() => closeUIModal('presetSelector')}
            className="p-1 hover:bg-white hover:bg-opacity-10 rounded transition-all"
          >
            <X size={24} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b" style={{ borderColor: currentTheme.rawCardBorder }}>
          <TabButton
            label="Workout"
            isActive={quickAddTab === 'workout'}
            onClick={() => setQuickAddTab('workout')}
            color="blue"
          />
          <TabButton
            label="Protein"
            isActive={quickAddTab === 'protein'}
            onClick={() => setQuickAddTab('protein')}
            color="green"
          />
          <TabButton
            label="Weight"
            isActive={quickAddTab === 'weight'}
            onClick={() => setQuickAddTab('weight')}
            color="purple"
          />
        </div>

        {/* Tab Content */}
        <div className="px-6 py-6">
          {quickAddTab === 'workout' && <WorkoutTab closeModal={() => closeUIModal('presetSelector')} showToast={showToastMessage} />}
          {quickAddTab === 'protein' && <ProteinTab closeModal={() => closeUIModal('presetSelector')} showToast={showToastMessage} />}
          {quickAddTab === 'weight' && <WeightTab closeModal={() => closeUIModal('presetSelector')} showToast={showToastMessage} />}
        </div>
      </div>
    </div>
  );
}

function TabButton({ label, isActive, onClick, color }) {
  const colorMap = {
    blue: 'text-blue-500 border-blue-500',
    green: 'text-green-500 border-green-500',
    purple: 'text-purple-500 border-purple-500',
  };

  return (
    <button
      onClick={onClick}
      className={`flex-1 px-4 py-3 font-medium transition-all border-b-2 ${
        isActive
          ? `${colorMap[color]} bg-white bg-opacity-5`
          : 'border-transparent opacity-60 hover:opacity-80'
      }`}
    >
      {label}
    </button>
  );
}

function WorkoutTab({ closeModal, showToast }) {
  const { presets } = usePresetStore();
  const {
    openModal: openUIModal,
    closeModal: closeUIModal,
  } = useUIStore((state) => ({
    openModal: (name) => state.openModal(name),
    closeModal: (name) => state.closeModal(name),
  }));

  const { loadPreset } = useWorkoutStore();

  const handleSelectPreset = (preset) => {
    loadPreset(preset);
    closeUIModal('presetSelector');
    openUIModal('workoutModal');
  };

  // Filter presets that should appear in menu
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
              className={`w-full text-left p-3 rounded-lg border-l-4 transition-all hover:opacity-80 ${color.bg}`}
              style={{ borderColor: color.text }}
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: color.text }}
                />
                <div className="flex-1">
                  <div className="font-medium">{preset.name}</div>
                  <div className="text-xs opacity-60">
                    {exerciseCount} exercise{exerciseCount !== 1 ? 's' : ''}
                  </div>
                </div>
              </div>
            </button>
          );
        })
      )}
    </div>
  );
}

function ProteinTab({ closeModal, showToast }) {
  const { getCurrentTheme } = useThemeStore();
  const currentTheme = getCurrentTheme();

  const [grams, setGrams] = useState('');
  const [description, setDescription] = useState('');

  const { addProteinEntry } = useTrackingStore();

  const handleSubmit = () => {
    if (!grams || isNaN(parseFloat(grams))) {
      showToast('Please enter a valid amount');
      return;
    }

    const entry = {
      date: getTodayDate(),
      grams: parseFloat(grams),
      description: description || 'Protein',
      timestamp: Date.now(),
    };

    addProteinEntry(entry);
    showToast('Protein logged!');
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
          className={`w-full px-4 py-2 rounded-lg border ${currentTheme.inputBg} ${currentTheme.inputBorder}`}
          style={{ borderColor: currentTheme.rawInputBorder, backgroundColor: currentTheme.rawInputBg, color: currentTheme.rawText }}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Description</label>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="e.g., Chicken, Whey shake"
          className={`w-full px-4 py-2 rounded-lg border ${currentTheme.inputBg} ${currentTheme.inputBorder}`}
          style={{ borderColor: currentTheme.rawInputBorder, backgroundColor: currentTheme.rawInputBg, color: currentTheme.rawText }}
        />
      </div>

      <button
        onClick={handleSubmit}
        className="w-full px-4 py-2 rounded-lg font-medium text-white bg-green-500 hover:bg-green-600 transition-all"
      >
        Add Protein
      </button>
    </div>
  );
}

function WeightTab({ closeModal, showToast }) {
  const { getCurrentTheme } = useThemeStore();
  const currentTheme = getCurrentTheme();

  const [weight, setWeight] = useState('');
  const [notes, setNotes] = useState('');

  const { addWeightEntry } = useTrackingStore();

  const handleSubmit = () => {
    if (!weight || isNaN(parseFloat(weight))) {
      showToast('Please enter a valid weight');
      return;
    }

    const entry = {
      date: getTodayDate(),
      weight: parseFloat(weight),
      notes: notes || '',
      timestamp: Date.now(),
    };

    addWeightEntry(entry);
    showToast('Weight logged!');
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
          className={`w-full px-4 py-2 rounded-lg border ${currentTheme.inputBg} ${currentTheme.inputBorder}`}
          style={{ borderColor: currentTheme.rawInputBorder, backgroundColor: currentTheme.rawInputBg, color: currentTheme.rawText }}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Notes</label>
        <input
          type="text"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="e.g., Morning, Fasted"
          className={`w-full px-4 py-2 rounded-lg border ${currentTheme.inputBg} ${currentTheme.inputBorder}`}
          style={{ borderColor: currentTheme.rawInputBorder, backgroundColor: currentTheme.rawInputBg, color: currentTheme.rawText }}
        />
      </div>

      <button
        onClick={handleSubmit}
        className="w-full px-4 py-2 rounded-lg font-medium text-white bg-purple-500 hover:bg-purple-600 transition-all"
      >
        Log Weight
      </button>
    </div>
  );
}
