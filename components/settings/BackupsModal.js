import { useEffect, useState } from 'react';
import { X, Download } from 'lucide-react';
import { useThemeStore } from '../../stores/themeStore';
import { useUIStore } from '../../stores/uiStore';
import { useWorkoutStore } from '../../stores/workoutStore';
import { usePresetStore } from '../../stores/presetStore';
import { useTrackingStore } from '../../stores/trackingStore';
import { loadBackups, restoreBackup } from '../../lib/backup';

export default function BackupsModal() {
  const { getCurrentTheme } = useThemeStore();
  const currentTheme = getCurrentTheme();
  const { showToastMessage } = useUIStore();
  const [backups, setBackups] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBackupsData();
  }, []);

  const loadBackupsData = async () => {
    try {
      setLoading(true);
      const backupsList = await loadBackups();
      setBackups(backupsList);
    } catch (error) {
      console.error('Error loading backups:', error);
      showToastMessage('Error loading backups');
    } finally {
      setLoading(false);
    }
  };

  const handleRestoreBackup = (backup) => {
    if (!confirm(`Restore backup from ${new Date(backup.timestamp).toLocaleString()}? Current data will be replaced.`)) {
      return;
    }

    try {
      const restored = restoreBackup(backup);

      // Restore to all stores
      useWorkoutStore.setState({ workouts: restored.workouts });
      usePresetStore.setState({
        presets: restored.presets,
        exercises: restored.exercises,
      });

      if (restored.weightEntries) {
        useTrackingStore.setState({ weightEntries: restored.weightEntries });
      }

      showToastMessage('Backup restored successfully');
      handleClose();
    } catch (error) {
      console.error('Error restoring backup:', error);
      showToastMessage('Error restoring backup');
    }
  };

  const handleClose = () => {
    useUIStore.setState({ showBackups: false });
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div
        className="rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        style={{ backgroundColor: currentTheme.rawCardBg }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="sticky top-0 flex items-center justify-between px-6 py-4 border-b"
          style={{ borderColor: currentTheme.rawCardBorder }}
        >
          <h2 className="text-xl font-bold" style={{ color: currentTheme.rawText }}>Backups</h2>
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
        <div className="px-6 py-6">
          {loading ? (
            <div className="text-center py-12" style={{ color: currentTheme.rawText, opacity: 0.6 }}>
              <p>Loading backups...</p>
            </div>
          ) : backups.length === 0 ? (
            <div className="text-center py-12" style={{ color: currentTheme.rawText, opacity: 0.6 }}>
              <p>No backups found.</p>
              <p className="text-sm mt-2">Backups are created automatically every 7 days.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {backups.map((backup, index) => (
                <div
                  key={index}
                  className="p-4 rounded-lg border flex items-start justify-between"
                  style={{ borderColor: currentTheme.rawCardBorder }}
                >
                  <div className="flex-1">
                    <p className="font-semibold" style={{ color: currentTheme.rawText }}>
                      {formatDate(backup.timestamp)}
                    </p>
                    <div className="text-sm mt-2 space-y-1" style={{ color: currentTheme.rawText, opacity: 0.7 }}>
                      <p>📝 Workouts: {backup.workouts?.length || 0}</p>
                      <p>💪 Presets: {backup.presets?.length || 0}</p>
                      <p>⚖️ Weight entries: {backup.weightEntries?.length || 0}</p>
                      <p>🏋️ Exercises: {backup.exercises?.length || 0}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRestoreBackup(backup)}
                    className="ml-4 px-4 py-2 rounded-lg border text-green-400 hover:opacity-80 transition-colors flex items-center gap-2 font-medium whitespace-nowrap"
                    style={{ borderColor: 'rgba(74, 222, 128, 0.5)', backgroundColor: 'rgba(74, 222, 128, 0.1)' }}
                  >
                    <Download size={18} />
                    Restore
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Info */}
          <div className="mt-6 p-4 rounded-lg text-sm" style={{ backgroundColor: currentTheme.rawInputBg, color: currentTheme.rawText, opacity: 0.75 }}>
            <p className="font-medium mb-2">ℹ️ About Backups</p>
            <ul className="space-y-1 text-xs">
              <li>• Automatic backups are created every 7 days</li>
              <li>• Up to 5 backups are kept locally</li>
              <li>• Backups are stored in your browser's IndexedDB</li>
              <li>• Restoring a backup will replace current data</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div
          className="sticky bottom-0 flex gap-3 px-6 py-4 border-t"
          style={{ borderColor: currentTheme.rawCardBorder }}
        >
          <button
            onClick={handleClose}
            className="flex-1 px-4 py-2 rounded-lg border hover:opacity-80 transition-colors font-medium"
            style={{ borderColor: currentTheme.rawCardBorder, color: currentTheme.rawText }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
