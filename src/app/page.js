'use client';

import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { useTheme } from '@/hooks/useTheme';
import SplashScreen from '@/components/shared/SplashScreen';
import { usePresets } from '@/hooks/usePresets';
import { useWorkouts } from '@/hooks/useWorkouts';
import { useProtein } from '@/hooks/useProtein';
import { useWeight } from '@/hooks/useWeight';
import { useSettings } from '@/hooks/useSettings';
import Header from '@/components/layout/Header';
import BottomNav from '@/components/layout/BottomNav';
import WeeklyPulseHome from '@/components/home/WeeklyPulseHome';
import LogTab from '@/components/home/LogTab';
import StatsTab from '@/components/stats/StatsTab';
import SettingsTab from '@/components/settings/SettingsTab';
import PresetSelector from '@/components/workout/PresetSelector';
import WorkoutEntry from '@/components/workout/WorkoutEntry';
import DayOffEntry from '@/components/workout/DayOffEntry';
import RunEntry from '@/components/workout/RunEntry';

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [showSplash, setShowSplash] = useState(true);
  const handleSplashComplete = useCallback(() => setShowSplash(false), []);
  const { mounted } = useTheme();
  const presetData = usePresets();
  const { presets, exercises } = presetData;
  const { workouts, addWorkout, updateWorkout, deleteWorkout, importWorkouts, deleteAllWorkouts } = useWorkouts();
  const proteinData = useProtein();
  const weightData = useWeight();
  const { settings, updateSetting } = useSettings();

  // Workout flow state: null | 'select-preset' | 'entry' | 'day-off' | 'run'
  const [workoutView, setWorkoutView] = useState(null);
  const [selectedPreset, setSelectedPreset] = useState(null);
  const [editingWorkout, setEditingWorkout] = useState(null);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');

  // Calendar date filter state (null = show all)
  const [selectedDate, setSelectedDate] = useState(null);

  // Delete confirmation state
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Counter that increments on same-tab taps (used to tell child components to reset/close)
  const [tabTapCount, setTabTapCount] = useState(0);

  // Smart tab change: if same tab, scroll to top; if different tab, switch
  const handleTabChange = useCallback((tabId) => {
    if (tabId === activeTab) {
      // Same tab — scroll to top and signal children to close sub-views
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setTabTapCount(c => c + 1);
    } else {
      setActiveTab(tabId);
    }
  }, [activeTab]);

  // Scroll to top on tab change
  const mainRef = useRef(null);
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [activeTab]);

  // Filter workouts by search query
  const filteredWorkouts = useMemo(() => {
    if (!searchQuery.trim()) return workouts;
    const q = searchQuery.toLowerCase().trim();
    return workouts.filter(w => {
      // Match preset/location name
      if (w.location && w.location.toLowerCase().includes(q)) return true;
      // Match exercise names
      if (w.exercises.some(ex => ex.name.toLowerCase().includes(q))) return true;
      // Match notes
      if (w.notes && w.notes.toLowerCase().includes(q)) return true;
      // Match exercise notes
      if (w.exercises.some(ex => ex.notes && ex.notes.toLowerCase().includes(q))) return true;
      return false;
    });
  }, [workouts, searchQuery]);

  const handleStartWorkout = () => {
    setWorkoutView('select-preset');
  };

  const handleSelectPreset = (preset) => {
    if (preset.isRun) {
      setWorkoutView('run');
    } else if (preset.isDayOff) {
      setWorkoutView('day-off');
    } else {
      setSelectedPreset(preset);
      setWorkoutView('entry');
    }
  };

  const handleSaveWorkout = (workoutData) => {
    if (editingWorkout) {
      updateWorkout(editingWorkout.id, workoutData);
      setEditingWorkout(null);
    } else {
      addWorkout(workoutData);
    }
    setWorkoutView(null);
    setSelectedPreset(null);
    setActiveTab('log');
  };

  const handleCancelWorkout = () => {
    setWorkoutView(null);
    setSelectedPreset(null);
    setEditingWorkout(null);
  };

  const handleEditWorkout = (workout) => {
    if (workout.isRun) {
      setEditingWorkout(workout);
      setWorkoutView('run');
      return;
    }
    // Find the matching preset by location name
    const matchingPreset = presets.find(p => p.name === workout.location);
    if (matchingPreset) {
      setEditingWorkout(workout);
      setSelectedPreset(matchingPreset);
      setWorkoutView('entry');
    }
  };

  const handleDeleteWorkout = (workout) => {
    setDeleteTarget(workout);
  };

  const confirmDelete = () => {
    if (deleteTarget) {
      deleteWorkout(deleteTarget.id);
      setDeleteTarget(null);
    }
  };

  // Prevent flash of unstyled content before theme loads
  if (!mounted) {
    return (
      <div
        className="min-h-screen"
        style={{ backgroundColor: '#0f0f14' }}
      />
    );
  }

  // Show splash screen on first load
  if (showSplash) {
    return <SplashScreen onComplete={handleSplashComplete} />;
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-bg)' }}>
      <Header
        activeTab={activeTab}
        onStartWorkout={handleStartWorkout}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Main content area */}
      <main
        ref={mainRef}
        style={{
          paddingTop: 'calc(3.5rem + env(safe-area-inset-top))',
          paddingBottom: 'calc(4rem + env(safe-area-inset-bottom))',
        }}
      >
        {activeTab === 'home' && (
          <WeeklyPulseHome
            workouts={workouts}
            onEdit={handleEditWorkout}
            onDelete={handleDeleteWorkout}
            onStartWorkout={handleStartWorkout}
            proteinData={proteinData}
            presets={presets}
          />
        )}
        {activeTab === 'log' && (
          <LogTab
            workouts={filteredWorkouts}
            allWorkouts={workouts}
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
            onEdit={handleEditWorkout}
            onDelete={handleDeleteWorkout}
            onStartWorkout={handleStartWorkout}
            proteinEntries={proteinData.entries}
            presets={presets}
          />
        )}
        {activeTab === 'stats' && (
          <StatsTab
            key={`stats-${tabTapCount}`}
            workouts={workouts}
            proteinData={proteinData}
            weightData={weightData}
          />
        )}
        {activeTab === 'settings' && (
          <SettingsTab
            presetData={presetData}
            workouts={workouts}
            proteinEntries={proteinData.entries}
            weightEntries={weightData.entries}
            onImportWorkouts={importWorkouts}
            onDeleteAllWorkouts={deleteAllWorkouts}
            proteinData={proteinData}
            weightData={weightData}
            settings={settings}
            onUpdateSetting={updateSetting}
          />
        )}
      </main>

      <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />

      {/* Workout flow overlays */}
      {workoutView === 'select-preset' && (
        <PresetSelector
          presets={presets}
          onSelect={handleSelectPreset}
          onClose={handleCancelWorkout}
        />
      )}

      {workoutView === 'entry' && selectedPreset && (
        <WorkoutEntry
          preset={selectedPreset}
          exercises={exercises}
          workouts={workouts}
          onSave={handleSaveWorkout}
          onCancel={handleCancelWorkout}
          existingWorkout={editingWorkout}
        />
      )}

      {workoutView === 'day-off' && (
        <DayOffEntry
          onSave={handleSaveWorkout}
          onCancel={handleCancelWorkout}
        />
      )}

      {workoutView === 'run' && (
        <RunEntry
          onSave={handleSaveWorkout}
          onCancel={handleCancelWorkout}
          existingWorkout={editingWorkout}
        />
      )}

      {/* Delete confirmation modal */}
      {deleteTarget && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center px-6"
          style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
        >
          <div
            className="w-full max-w-sm rounded-xl p-5"
            style={{ backgroundColor: 'var(--color-surface)' }}
          >
            <h3
              className="text-lg font-bold mb-2"
              style={{ color: 'var(--color-red, #ef4444)' }}
            >
              Delete Workout?
            </h3>
            <p className="text-sm mb-5" style={{ color: 'var(--color-text-muted)' }}>
              This will permanently remove this workout from your log. This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={confirmDelete}
                className="flex-1 py-2.5 rounded-lg text-sm font-bold"
                style={{ backgroundColor: 'var(--color-red, #ef4444)', color: '#ffffff' }}
              >
                Delete
              </button>
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 py-2.5 rounded-lg text-sm font-medium"
                style={{ backgroundColor: 'var(--color-surface-hover)', color: 'var(--color-text)' }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
