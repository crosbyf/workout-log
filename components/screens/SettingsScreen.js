import { useState } from 'react';
import { ChevronUp, ChevronDown, Plus, Trash2, Upload, Download, Pencil, Cloud, LogOut, RefreshCw } from 'lucide-react';
import { useThemeStore } from '../../stores/themeStore';
import { usePresetStore } from '../../stores/presetStore';
import { useWorkoutStore } from '../../stores/workoutStore';
import { useTrackingStore } from '../../stores/trackingStore';
import { useUIStore } from '../../stores/uiStore';
import { PRESET_COLORS } from '../../lib/constants';
import { exportWorkoutsCSV, downloadCSV } from '../../lib/csvExport';
import { importPresetsFromCSV, importWorkoutsFromCSV } from '../../lib/csvImport';
import { createBackup } from '../../lib/backup';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { useSession, useSyncStatus, initSync, pushAllToCloud } from '../../lib/sync';
import PresetForm from '../settings/PresetForm';
import BackupsModal from '../settings/BackupsModal';

function CollapsibleSection({ title, count, isOpen, onToggle, currentTheme, children, isDanger = false }) {
  return (
    <div
      className={`mb-6 rounded-xl border overflow-hidden ${isDanger ? 'border-red-500/30' : ''}`}
      style={{ borderColor: isDanger ? 'rgba(239, 68, 68, 0.3)' : currentTheme.rawCardBorder }}
    >
      {/* Header */}
      <button
        onClick={onToggle}
        className={`w-full px-6 py-4 flex items-center justify-between hover:opacity-80 transition-opacity`}
        style={{ backgroundColor: currentTheme.rawCardBg }}
      >
        <div className="flex items-center gap-3">
          <span className={`text-lg font-semibold ${isDanger ? 'text-red-400' : currentTheme.text}`} style={{ color: isDanger ? '#f87171' : 'inherit' }}>
            {title}
          </span>
          {count !== undefined && (
            <span className={`text-sm px-2 py-1 rounded ${isDanger ? 'text-red-400' : currentTheme.text} opacity-70`} style={{ backgroundColor: currentTheme.rawInputBg, color: isDanger ? '#f87171' : 'inherit' }}>
              {count}
            </span>
          )}
        </div>
        {isOpen ? (
          <ChevronUp size={20} style={{ color: isDanger ? '#f87171' : currentTheme.rawText }} />
        ) : (
          <ChevronDown size={20} style={{ color: isDanger ? '#f87171' : currentTheme.rawText }} />
        )}
      </button>

      {/* Content */}
      {isOpen && (
        <div className="px-6 py-4 border-t" style={{ borderColor: currentTheme.rawCardBorder }}>
          {children}
        </div>
      )}
    </div>
  );
}

function CloudSyncSection({ currentTheme, showToastMessage }) {
  const { session, loading: authLoading } = useSession();
  const syncStatus = useSyncStatus();
  const [email, setEmail] = useState('');
  const [loginState, setLoginState] = useState('idle'); // 'idle' | 'sending' | 'sent' | 'error'
  const [loginError, setLoginError] = useState('');
  const [showCloudSync, setShowCloudSync] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const handleSignIn = async () => {
    if (!email.trim() || !supabase) return;
    setLoginState('sending');
    setLoginError('');

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          emailRedirectTo: typeof window !== 'undefined' ? window.location.origin : undefined,
        },
      });

      if (error) throw error;
      setLoginState('sent');
    } catch (err) {
      setLoginState('error');
      setLoginError(err.message || 'Failed to send login email');
    }
  };

  const handleSignOut = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    showToastMessage('Signed out');
    setLoginState('idle');
    setEmail('');
  };

  const handleForceSync = async () => {
    setSyncing(true);
    try {
      await initSync();
      showToastMessage('Sync complete');
    } catch (err) {
      showToastMessage('Sync failed');
    }
    setSyncing(false);
  };

  const handlePushToCloud = async () => {
    setSyncing(true);
    try {
      const ok = await pushAllToCloud();
      showToastMessage(ok ? 'Data pushed to cloud' : 'Push failed');
    } catch (err) {
      showToastMessage('Push failed');
    }
    setSyncing(false);
  };

  const statusLabel = {
    idle: 'Not connected',
    syncing: 'Syncing...',
    synced: 'Synced',
    error: 'Sync error',
  };

  const statusColor = {
    idle: currentTheme.rawText,
    syncing: '#facc15',
    synced: '#4ade80',
    error: '#f87171',
  };

  const userEmail = session?.user?.email;
  const isLoggedIn = !!session;

  return (
    <CollapsibleSection
      title={'☁\uFE0F Cloud Sync'}
      isOpen={showCloudSync}
      onToggle={() => setShowCloudSync(!showCloudSync)}
      currentTheme={currentTheme}
    >
      {authLoading ? (
        <p style={{ color: currentTheme.rawText, opacity: 0.6 }} className="py-4">Loading...</p>
      ) : isLoggedIn ? (
        <div className="space-y-4">
          {/* Signed in status */}
          <div className="p-3 rounded-lg" style={{ backgroundColor: currentTheme.rawInputBg }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium" style={{ color: currentTheme.rawText }}>
                  Signed in as
                </p>
                <p className="text-sm" style={{ color: currentTheme.rawText, opacity: 0.7 }}>
                  {userEmail}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: statusColor[syncStatus] || statusColor.idle }}
                />
                <span className="text-xs font-medium" style={{ color: statusColor[syncStatus] || statusColor.idle }}>
                  {statusLabel[syncStatus] || 'Unknown'}
                </span>
              </div>
            </div>
          </div>

          {/* Sync buttons */}
          <button
            onClick={handleForceSync}
            disabled={syncing}
            className="w-full py-3 px-4 rounded-lg border hover:opacity-80 transition-opacity flex items-center justify-center gap-2"
            style={{
              borderColor: currentTheme.rawCardBorder,
              color: currentTheme.rawText,
              opacity: syncing ? 0.5 : 1,
            }}
          >
            <RefreshCw size={18} className={syncing ? 'animate-spin' : ''} />
            {syncing ? 'Syncing...' : 'Sync Now'}
          </button>

          <button
            onClick={handlePushToCloud}
            disabled={syncing}
            className="w-full py-3 px-4 rounded-lg border hover:opacity-80 transition-opacity flex items-center justify-center gap-2"
            style={{
              borderColor: currentTheme.rawCardBorder,
              color: currentTheme.rawText,
              opacity: syncing ? 0.5 : 1,
            }}
          >
            <Cloud size={18} />
            Push Local Data to Cloud
          </button>

          {/* Sign out */}
          <button
            onClick={handleSignOut}
            className="w-full py-3 px-4 rounded-lg border hover:opacity-80 transition-opacity flex items-center justify-center gap-2 text-red-400"
            style={{ borderColor: 'rgba(239, 68, 68, 0.3)' }}
          >
            <LogOut size={18} />
            Sign Out
          </button>

          {/* Info */}
          <div className="p-3 rounded-lg text-sm" style={{ backgroundColor: currentTheme.rawInputBg, color: currentTheme.rawText, opacity: 0.75 }}>
            <p>Your data syncs automatically when you make changes. Use "Sync Now" to pull the latest from the cloud, or "Push" to force-upload your local data.</p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Description */}
          <p className="text-sm" style={{ color: currentTheme.rawText, opacity: 0.7 }}>
            Back up your data to the cloud and access it from any device. Sign in with your email — no password needed.
          </p>

          {loginState === 'sent' ? (
            <div className="p-4 rounded-lg text-center" style={{ backgroundColor: currentTheme.rawInputBg }}>
              <p className="font-medium mb-1" style={{ color: '#4ade80' }}>Check your email!</p>
              <p className="text-sm" style={{ color: currentTheme.rawText, opacity: 0.7 }}>
                We sent a sign-in link to {email}. Click it to log in.
              </p>
              <button
                onClick={() => { setLoginState('idle'); setEmail(''); }}
                className="mt-3 text-sm text-blue-400 hover:underline"
              >
                Use a different email
              </button>
            </div>
          ) : (
            <div>
              <div className="flex gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="flex-1 px-4 py-3 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  style={{
                    borderColor: currentTheme.rawCardBorder,
                    backgroundColor: currentTheme.rawInputBg,
                    color: currentTheme.rawText,
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSignIn();
                  }}
                  disabled={loginState === 'sending'}
                />
                <button
                  onClick={handleSignIn}
                  disabled={loginState === 'sending' || !email.trim()}
                  className="px-4 py-3 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors font-medium text-sm whitespace-nowrap"
                  style={{ opacity: loginState === 'sending' || !email.trim() ? 0.5 : 1 }}
                >
                  {loginState === 'sending' ? 'Sending...' : 'Sign In'}
                </button>
              </div>
              {loginState === 'error' && (
                <p className="mt-2 text-sm text-red-400">{loginError}</p>
              )}
            </div>
          )}
        </div>
      )}
    </CollapsibleSection>
  );
}

export default function SettingsScreen() {
  const { getCurrentTheme } = useThemeStore();
  const currentTheme = getCurrentTheme();
  const { presets, exercises, addPreset, updatePreset, deletePreset, movePresetUp, movePresetDown, addExerciseName, deleteExerciseName } = usePresetStore();
  const { workouts } = useWorkoutStore();
  const { weightEntries, proteinEntries } = useTrackingStore();
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
    movePresetUp(index);
  };

  const handleMovePresetDown = (index) => {
    movePresetDown(index);
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
      if (confirm('This is your second confirmation. Are you ABSOLUTELY sure? This cannot be undone.')) {
        useWorkoutStore.setState({ workouts: [] });
        showToastMessage('All workouts deleted');
      }
    }
  };

  const handleClearWeightEntries = () => {
    if (confirm('Delete all weight entries? This action cannot be undone.')) {
      if (confirm('This is your second confirmation. Are you ABSOLUTELY sure?')) {
        useTrackingStore.setState({ weightEntries: [] });
        showToastMessage('All weight entries deleted');
      }
    }
  };

  const handleClearProteinEntries = () => {
    if (confirm('Delete all protein entries? This action cannot be undone.')) {
      if (confirm('This is your second confirmation. Are you ABSOLUTELY sure?')) {
        useTrackingStore.setState({ proteinEntries: [] });
        showToastMessage('All protein entries deleted');
      }
    }
  };

  const handleResetAllData = () => {
    if (confirm('Reset ALL data? This will delete workouts, presets, exercises, and tracking data. This action CANNOT be undone.')) {
      if (confirm('FINAL WARNING: This is irreversible. Type "reset" to confirm.')) {
        useWorkoutStore.setState({ workouts: [] });
        usePresetStore.setState({ presets: [], exercises: [] });
        useTrackingStore.setState({ weightEntries: [], proteinEntries: [] });
        showToastMessage('All data reset');
      }
    }
  };

  const handleCreateBackup = async () => {
    try {
      const data = {
        workouts,
        presets,
        exercises,
        weightEntries,
        proteinEntries: [],
      };
      await createBackup(data);
      showToastMessage('Backup created successfully');
    } catch (error) {
      showToastMessage('Error creating backup');
      console.error('Backup error:', error);
    }
  };

  const getPresetColor = (colorName) => {
    return PRESET_COLORS.find((c) => c.name === colorName) || PRESET_COLORS[0];
  };

  return (
    <div style={{ backgroundColor: currentTheme.rawBg, minHeight: '100vh' }}>
      <div className="max-w-2xl mx-auto px-4 py-6 pb-24">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-xl font-bold mb-2" style={{ color: currentTheme.rawText }}>Settings</h1>
          <p style={{ color: currentTheme.rawText, opacity: 0.6 }}>Manage presets, data, and backups</p>
        </div>

        {/* Workout Presets Section */}
        <CollapsibleSection
          title="💪 Workout Presets"
          count={`(${presets.length})`}
          isOpen={showPresetsMenu}
          onToggle={togglePresetsMenu}
          currentTheme={currentTheme}
        >
          {presets.length === 0 ? (
            <p style={{ color: currentTheme.rawText, opacity: 0.6 }} className="py-4">No presets yet. Create one to get started!</p>
          ) : (
            <div className="space-y-3 mb-4">
              {presets.map((preset, index) => {
                const presetColor = getPresetColor(preset.color);
                return (
                  <div
                    key={index}
                    className="p-4 rounded-lg border flex items-center justify-between"
                    style={{
                      borderLeft: `4px solid ${presetColor.border.includes('blue') ? '#60a5fa' : presetColor.border.includes('purple') ? '#c084fc' : presetColor.border.includes('green') ? '#4ade80' : presetColor.border.includes('yellow') ? '#facc15' : presetColor.border.includes('red') ? '#f87171' : presetColor.border.includes('pink') ? '#f472b6' : presetColor.border.includes('orange') ? '#fb923c' : '#06b6d4'}`,
                      backgroundColor: currentTheme.rawCardBg,
                      borderColor: currentTheme.rawCardBorder,
                    }}
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{
                          backgroundColor: presetColor.border.includes('blue') ? '#60a5fa' : presetColor.border.includes('purple') ? '#c084fc' : presetColor.border.includes('green') ? '#4ade80' : presetColor.border.includes('yellow') ? '#facc15' : presetColor.border.includes('red') ? '#f87171' : presetColor.border.includes('pink') ? '#f472b6' : presetColor.border.includes('orange') ? '#fb923c' : '#06b6d4',
                        }}
                      />
                      <div>
                        <h3 className="font-semibold" style={{ color: currentTheme.rawText }}>{preset.name}</h3>
                        <p className="text-sm" style={{ color: currentTheme.rawText, opacity: 0.6 }}>
                          {preset.exercises.length} exercise{preset.exercises.length !== 1 ? 's' : ''} · {preset.color}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleMovePresetUp(index)}
                        disabled={index === 0}
                        className="p-2 rounded transition-colors"
                        style={{ opacity: index === 0 ? 0.4 : 1, cursor: index === 0 ? 'not-allowed' : 'pointer', color: currentTheme.rawText }}
                        title="Move up"
                      >
                        <ChevronUp size={18} />
                      </button>
                      <button
                        onClick={() => handleMovePresetDown(index)}
                        disabled={index === presets.length - 1}
                        className="p-2 rounded transition-colors"
                        style={{ opacity: index === presets.length - 1 ? 0.4 : 1, cursor: index === presets.length - 1 ? 'not-allowed' : 'pointer', color: currentTheme.rawText }}
                        title="Move down"
                      >
                        <ChevronDown size={18} />
                      </button>
                      <button
                        onClick={() => handleEditPreset(index)}
                        className="p-2 rounded hover:opacity-80 transition-colors text-blue-400"
                        title="Edit"
                      >
                        <Pencil size={18} />
                      </button>
                      <button
                        onClick={() => handleDeletePreset(index)}
                        className="p-2 rounded hover:opacity-80 transition-colors text-red-400"
                        title="Delete"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Create New Preset Button */}
          <button
            onClick={handleCreatePreset}
            className="w-full py-3 px-4 rounded-lg border-2 border-dashed hover:opacity-80 transition-opacity flex items-center justify-center gap-2 font-medium"
            style={{ borderColor: currentTheme.rawCardBorder, color: currentTheme.rawText }}
          >
            <Plus size={20} />
            Add Preset
          </button>
        </CollapsibleSection>

        {/* Exercise Presets Section */}
        <CollapsibleSection
          title="🏆 Exercise Presets"
          count={`(${exercises.length})`}
          isOpen={showExercisesMenu}
          onToggle={toggleExercisesMenu}
          currentTheme={currentTheme}
        >
          {exercises.length === 0 ? (
            <p style={{ color: currentTheme.rawText, opacity: 0.6 }} className="py-4">No exercises yet. Add one to get started!</p>
          ) : (
            <div className="space-y-2 mb-4">
              {exercises.sort().map((exercise) => (
                <div
                  key={exercise}
                  className="p-3 rounded-lg flex items-center justify-between"
                  style={{ backgroundColor: currentTheme.rawInputBg }}
                >
                  <span className="font-medium" style={{ color: currentTheme.rawText }}>{exercise}</span>
                  <button
                    onClick={() => handleDeleteExercise(exercise)}
                    className="p-2 rounded hover:opacity-80 transition-colors text-red-400"
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Exercise input section */}
          <div className="flex gap-2">
            <input
              type="text"
              id="exercise-input"
              placeholder="Enter exercise name"
              className="flex-1 px-4 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              style={{ borderColor: currentTheme.rawCardBorder, backgroundColor: currentTheme.rawInputBg, color: currentTheme.rawText }}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  const name = e.target.value.trim();
                  if (name) {
                    addExerciseName(name);
                    showToastMessage(`${name} added to exercises`);
                    e.target.value = '';
                  }
                }
              }}
            />
            <button
              onClick={() => {
                const input = document.getElementById('exercise-input');
                const name = input.value.trim();
                if (name) {
                  addExerciseName(name);
                  showToastMessage(`${name} added to exercises`);
                  input.value = '';
                }
              }}
              className="px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors font-medium text-sm"
            >
              Add
            </button>
          </div>
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
              <label className="block text-sm font-medium mb-2" style={{ color: currentTheme.rawText }}>
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
                className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-lg border hover:opacity-80 transition-opacity cursor-pointer"
                style={{ borderColor: currentTheme.rawCardBorder, color: currentTheme.rawText }}
              >
                <Upload size={18} />
                Import Presets
              </label>
            </div>

            {/* Import Workouts */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: currentTheme.rawText }}>
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
                className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-lg border hover:opacity-80 transition-opacity cursor-pointer"
                style={{ borderColor: currentTheme.rawCardBorder, color: currentTheme.rawText }}
              >
                <Upload size={18} />
                Import Workouts
              </label>
            </div>

            {/* Export Data */}
            <button
              onClick={handleExportData}
              className="w-full py-3 px-4 rounded-lg border hover:opacity-80 transition-opacity flex items-center justify-center gap-2"
              style={{ borderColor: currentTheme.rawCardBorder, color: currentTheme.rawText }}
            >
              <Download size={18} />
              Export Workouts (CSV)
            </button>

            {/* Create Backup */}
            <button
              onClick={handleCreateBackup}
              className="w-full py-3 px-4 rounded-lg border hover:opacity-80 transition-opacity flex items-center justify-center gap-2"
              style={{ borderColor: currentTheme.rawCardBorder, color: currentTheme.rawText }}
            >
              📦 Create Backup Now
            </button>

            {/* View Backups */}
            <button
              onClick={handleViewBackups}
              className="w-full py-3 px-4 rounded-lg border hover:opacity-80 transition-opacity flex items-center justify-center gap-2"
              style={{ borderColor: currentTheme.rawCardBorder, color: currentTheme.rawText }}
            >
              📋 View Backups
            </button>

            {/* Auto-backup Info */}
            <div className="p-3 rounded-lg text-sm" style={{ backgroundColor: currentTheme.rawInputBg, color: currentTheme.rawText, opacity: 0.75 }}>
              <p>💡 Automatic backups are created every 7 days and stored locally.</p>
            </div>
          </div>
        </CollapsibleSection>

        {/* Cloud Sync Section — only shown if Supabase is configured */}
        {/* Cloud Sync — temporarily always shown for debugging */}
        <CloudSyncSection currentTheme={currentTheme} showToastMessage={showToastMessage} />
        {/* Debug: remove after testing */}
        <div className="mb-4 p-3 rounded-lg text-xs font-mono" style={{ backgroundColor: currentTheme.rawInputBg, color: currentTheme.rawText, opacity: 0.6 }}>
          Supabase configured: {isSupabaseConfigured() ? 'YES' : 'NO'} | URL set: {process.env.NEXT_PUBLIC_SUPABASE_URL ? 'YES' : 'NO'} | Key set: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'YES' : 'NO'}
        </div>

        {/* Data Deletion Section */}
        <CollapsibleSection
          title="⚠️ Data Deletion"
          isOpen={showDataDeletion}
          onToggle={toggleDataDeletion}
          currentTheme={currentTheme}
          isDanger={true}
        >
          <div className="space-y-3">
            {/* Clear Workouts */}
            <div>
              <p className="text-sm mb-2" style={{ color: '#f87171' }}>Clear All Workouts</p>
              <button
                onClick={handleClearAllWorkouts}
                className="w-full py-3 px-4 rounded-lg border text-red-400 hover:opacity-80 transition-colors flex items-center justify-center gap-2 font-medium"
                style={{ borderColor: 'rgba(239, 68, 68, 0.5)', backgroundColor: 'rgba(239, 68, 68, 0.1)' }}
              >
                <Trash2 size={18} />
                Delete All Workouts
              </button>
            </div>

            {/* Clear Weight Entries */}
            <div>
              <p className="text-sm mb-2" style={{ color: '#f87171' }}>Clear All Weight Entries</p>
              <button
                onClick={handleClearWeightEntries}
                className="w-full py-3 px-4 rounded-lg border text-red-400 hover:opacity-80 transition-colors flex items-center justify-center gap-2 font-medium"
                style={{ borderColor: 'rgba(239, 68, 68, 0.5)', backgroundColor: 'rgba(239, 68, 68, 0.1)' }}
              >
                <Trash2 size={18} />
                Delete Weight Entries
              </button>
            </div>

            {/* Clear Protein Entries */}
            <div>
              <p className="text-sm mb-2" style={{ color: '#f87171' }}>Clear All Protein Entries</p>
              <button
                onClick={handleClearProteinEntries}
                className="w-full py-3 px-4 rounded-lg border text-red-400 hover:opacity-80 transition-colors flex items-center justify-center gap-2 font-medium"
                style={{ borderColor: 'rgba(239, 68, 68, 0.5)', backgroundColor: 'rgba(239, 68, 68, 0.1)' }}
              >
                <Trash2 size={18} />
                Delete Protein Entries
              </button>
            </div>

            {/* Reset All Data */}
            <div>
              <p className="text-sm mb-2" style={{ color: '#f87171' }}>Reset All Data</p>
              <button
                onClick={handleResetAllData}
                className="w-full py-3 px-4 rounded-lg border text-red-400 hover:opacity-80 transition-colors flex items-center justify-center gap-2 font-medium"
                style={{ borderColor: 'rgba(239, 68, 68, 0.5)', backgroundColor: 'rgba(239, 68, 68, 0.1)' }}
              >
                <Trash2 size={18} />
                Reset Everything (Nuclear Option)
              </button>
            </div>
          </div>
        </CollapsibleSection>
      </div>

      {/* Modals */}
      {(showCreatePreset || editingPreset !== null) && <PresetForm />}
      {showBackups && <BackupsModal />}
    </div>
  );
}
