'use client';

import { useState } from 'react';
import { useTheme, THEMES } from '@/hooks/useTheme';
import { Check, Palette, Database, Dumbbell, BookOpen, ChevronDown, ChevronRight, Cloud } from 'lucide-react';
import PresetEditor from './PresetEditor';
import ExerciseLibrary from './ExerciseLibrary';
import DataManagement from './DataManagement';
import { runSyncDiagnostic, forcePushAll } from '@/lib/sync';

function SettingsSection({ icon: Icon, title, children }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="mb-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-2 px-4 py-3 rounded-xl"
        style={{ backgroundColor: 'var(--color-surface)' }}
      >
        <Icon size={16} style={{ color: 'var(--color-text-muted)' }} />
        <h3
          className="text-sm font-semibold flex-1 text-left"
          style={{ color: 'var(--color-text)' }}
        >
          {title}
        </h3>
        {isOpen
          ? <ChevronDown size={16} style={{ color: 'var(--color-text-dim)' }} />
          : <ChevronRight size={16} style={{ color: 'var(--color-text-dim)' }} />
        }
      </button>
      {isOpen && (
        <div
          className="rounded-b-xl px-4 pb-4 pt-3 -mt-1"
          style={{
            backgroundColor: 'var(--color-surface)',
            borderTop: '1px solid var(--color-border)',
          }}
        >
          {children}
        </div>
      )}
    </div>
  );
}

function ThemeOption({ themeId, themeName, isActive, onSelect }) {
  const previewColor = THEMES[themeId].colors['--color-accent'];
  return (
    <button
      onClick={() => onSelect(themeId)}
      className="flex items-center justify-between w-full py-2.5 px-1 transition-colors rounded"
    >
      <div className="flex items-center gap-3">
        <div
          className="w-5 h-5 rounded-full border-2"
          style={{
            backgroundColor: previewColor,
            borderColor: isActive ? previewColor : 'var(--color-border)',
          }}
        />
        <span
          className="text-sm font-medium"
          style={{ color: 'var(--color-text)' }}
        >
          {themeName}
        </span>
      </div>
      {isActive && (
        <Check size={18} style={{ color: 'var(--color-accent)' }} />
      )}
    </button>
  );
}

function ToggleSwitch({ enabled, onToggle }) {
  return (
    <button
      onClick={onToggle}
      className="w-11 h-6 rounded-full relative transition-colors shrink-0"
      style={{ backgroundColor: enabled ? 'var(--color-green)' : 'var(--color-surface-hover)' }}
      role="switch"
      aria-checked={enabled}
    >
      <div
        className="w-5 h-5 rounded-full absolute top-0.5 transition-all"
        style={{
          backgroundColor: '#ffffff',
          left: enabled ? 'calc(100% - 22px)' : '2px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
        }}
      />
    </button>
  );
}

function CloudSyncPanel({ workouts, proteinEntries, weightEntries, presets, exercises, settings }) {
  const [diagResult, setDiagResult] = useState(null);
  const [diagLoading, setDiagLoading] = useState(false);
  const [pushResult, setPushResult] = useState(null);
  const [pushLoading, setPushLoading] = useState(false);

  const handleTest = async () => {
    setDiagLoading(true);
    setDiagResult(null);
    try {
      const result = await runSyncDiagnostic();
      setDiagResult(result);
    } catch (err) {
      setDiagResult({ success: false, steps: [{ step: 'Error', ok: false, detail: err.message }] });
    }
    setDiagLoading(false);
  };

  const handleForcePush = async () => {
    setPushLoading(true);
    setPushResult(null);
    try {
      const result = await forcePushAll({
        workouts,
        proteinEntries,
        weightEntries,
        presets,
        exercises,
        settings,
      });
      setPushResult(result);
    } catch (err) {
      setPushResult({ success: false, counts: {}, error: err.message });
    }
    setPushLoading(false);
  };

  return (
    <div>
      <p className="text-xs mb-3" style={{ color: 'var(--color-text-dim)' }}>
        Test your Supabase connection or force-push all local data to the cloud.
      </p>

      <div className="flex gap-2 mb-3">
        <button
          onClick={handleTest}
          disabled={diagLoading}
          className="flex-1 py-2.5 rounded-lg text-xs font-bold"
          style={{ backgroundColor: 'var(--color-accent)', color: '#ffffff', opacity: diagLoading ? 0.6 : 1 }}
        >
          {diagLoading ? 'Testing...' : 'Test Connection'}
        </button>
        <button
          onClick={handleForcePush}
          disabled={pushLoading}
          className="flex-1 py-2.5 rounded-lg text-xs font-bold"
          style={{ backgroundColor: 'var(--color-green, #22c55e)', color: '#ffffff', opacity: pushLoading ? 0.6 : 1 }}
        >
          {pushLoading ? 'Pushing...' : 'Push All Data'}
        </button>
      </div>

      {diagResult && (
        <div
          className="rounded-lg p-3 mb-2"
          style={{ backgroundColor: diagResult.success ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)' }}
        >
          <div
            className="text-xs font-bold mb-1"
            style={{ color: diagResult.success ? 'var(--color-green, #22c55e)' : 'var(--color-red, #ef4444)' }}
          >
            {diagResult.success ? 'Connection OK' : 'Connection Failed'}
          </div>
          {diagResult.steps.map((s, i) => (
            <div key={i} className="text-[10px] flex items-center gap-1" style={{ color: 'var(--color-text-dim)' }}>
              <span>{s.ok ? '\u2705' : '\u274C'}</span>
              <span>{s.step}: {s.detail}</span>
            </div>
          ))}
        </div>
      )}

      {pushResult && (
        <div
          className="rounded-lg p-3 mb-2"
          style={{ backgroundColor: pushResult.success ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)' }}
        >
          <div
            className="text-xs font-bold mb-1"
            style={{ color: pushResult.success ? 'var(--color-green, #22c55e)' : 'var(--color-red, #ef4444)' }}
          >
            {pushResult.success ? 'Push Complete' : 'Push Failed'}
          </div>
          {Object.entries(pushResult.counts).map(([key, val]) => (
            <div key={key} className="text-[10px] flex items-center gap-1" style={{ color: 'var(--color-text-dim)' }}>
              <span>{val.ok ? '\u2705' : '\u274C'}</span>
              <span>{key}: {val.count} items</span>
            </div>
          ))}
          {pushResult.error && (
            <div className="text-[10px] mt-1" style={{ color: 'var(--color-red, #ef4444)' }}>
              {pushResult.error}
            </div>
          )}
        </div>
      )}

      <div className="text-[10px] mt-2" style={{ color: 'var(--color-text-dim)', opacity: 0.6 }}>
        Local: {workouts.length} workouts, {proteinEntries.length} protein, {weightEntries.length} weight, {presets.length} presets, {exercises.length} exercises
      </div>
    </div>
  );
}

export default function SettingsTab({
  presetData = {},
  workouts = [],
  proteinEntries = [],
  weightEntries = [],
  onImportWorkouts,
  onDeleteAllWorkouts,
  proteinData = {},
  weightData = {},
  settings = {},
  onUpdateSetting,
}) {
  const { theme, setTheme } = useTheme();

  return (
    <div className="pt-2 px-4 pb-8">
      {/* Theme Picker */}
      <SettingsSection icon={Palette} title="Appearance">
        <div className="space-y-1">
          {Object.entries(THEMES).map(([id, { name }]) => (
            <ThemeOption
              key={id}
              themeId={id}
              themeName={name}
              isActive={theme === id}
              onSelect={setTheme}
            />
          ))}
        </div>
      </SettingsSection>

      {/* Workout Presets */}
      <SettingsSection icon={Dumbbell} title="Workout Presets">
        <PresetEditor
          presets={presetData.presets || []}
          exercises={presetData.exercises || []}
          onAdd={presetData.addPreset}
          onUpdate={presetData.updatePreset}
          onDelete={presetData.deletePreset}
        />
      </SettingsSection>

      {/* Exercise Library */}
      <SettingsSection icon={BookOpen} title="Exercise Library">
        <ExerciseLibrary
          exercises={presetData.exercises || []}
          onAdd={presetData.addExercise}
          onDelete={presetData.deleteExercise}
        />
      </SettingsSection>

      {/* Data Management */}
      <SettingsSection icon={Database} title="Data Management">
        <DataManagement
          workouts={workouts}
          proteinEntries={proteinEntries}
          weightEntries={weightEntries}
          onImportWorkouts={onImportWorkouts}
          onImportPresets={presetData.replaceAllPresets}
          onDeleteAllWorkouts={onDeleteAllWorkouts}
          proteinData={proteinData}
          weightData={weightData}
        />
      </SettingsSection>

      {/* Cloud Sync */}
      <SettingsSection icon={Cloud} title="Cloud Sync">
        <CloudSyncPanel
          workouts={workouts}
          proteinEntries={proteinEntries}
          weightEntries={weightEntries}
          presets={presetData.presets || []}
          exercises={presetData.exercises || []}
          settings={settings}
        />
      </SettingsSection>
    </div>
  );
}
