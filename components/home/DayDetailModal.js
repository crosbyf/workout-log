import { Copy, Share2, Pencil, Trash2 } from 'lucide-react';
import BottomSheet from '../modals/BottomSheet';
import { useUIStore } from '../../stores/uiStore';
import { useThemeStore } from '../../stores/themeStore';
import { useWorkoutStore } from '../../stores/workoutStore';
import { usePresetStore } from '../../stores/presetStore';
import { useTrackingStore } from '../../stores/trackingStore';
import { formatDateLong, formatTimeHHMMSS } from '../../lib/formatting';
import { getPresetColor } from '../../lib/constants';
import { copyToSheets, shareWorkout } from '../../lib/sharing';

export default function DayDetailModal() {
  const showDayModal = useUIStore((state) => state.showDayModal);
  const selectedDay = useUIStore((state) => state.selectedDay);
  const showToastMessage = useUIStore((state) => state.showToastMessage);
  const currentTheme = useThemeStore((state) => state.getCurrentTheme());
  const workouts = useWorkoutStore((state) => state.workouts);
  const setEditing = useWorkoutStore((state) => state.setEditing);
  const deleteWorkoutAction = useWorkoutStore((state) => state.deleteWorkout);
  const presets = usePresetStore((state) => state.presets);
  const proteinEntries = useTrackingStore((state) => state.proteinEntries);

  const closeDayModal = () => {
    useUIStore.setState({ showDayModal: false, selectedDay: null });
  };

  if (!selectedDay) return null;

  const workout = selectedDay;
  const color = getPresetColor(workout.location, presets);

  // Map color names to actual hex/rgb values
  const colorMap = {
    'text-blue-400': '#60a5fa',
    'text-purple-400': '#c084fc',
    'text-green-400': '#4ade80',
    'text-yellow-400': '#facc15',
    'text-red-400': '#f87171',
    'text-pink-400': '#f472b6',
    'text-orange-400': '#fb923c',
    'text-cyan-400': '#22d3ee',
  };

  const colorValue = colorMap[color.text] || '#60a5fa';

  // Find workout index for delete action
  const workoutIndex = workouts.findIndex(
    (w) => w.date === workout.date && w.exercises?.length === workout.exercises?.length
  );

  // Get protein intake for this day
  const dayProteinEntries = proteinEntries.filter((entry) => {
    const entryDate = typeof entry.date === 'string' ? entry.date : new Date(entry.timestamp).toISOString().split('T')[0];
    return entryDate === workout.date;
  });
  const totalProtein = dayProteinEntries.reduce((sum, entry) => sum + (entry.grams || 0), 0);

  const handleCopy = async () => {
    try {
      await copyToSheets(workout);
      showToastMessage('Copied to clipboard');
    } catch (err) {
      showToastMessage('Failed to copy');
    }
  };

  const handleShare = async () => {
    try {
      await shareWorkout(workout);
      showToastMessage('Shared successfully');
    } catch (err) {
      showToastMessage('Failed to share');
    }
  };

  const handleEdit = () => {
    closeDayModal();
    setEditing(workoutIndex);
    useUIStore.setState({ showWorkoutModal: true });
  };

  const handleDelete = () => {
    useUIStore.setState({ deleteWorkout: workoutIndex });
  };

  const exerciseCount = workout.exercises?.length || 0;
  const elapsedTime = formatTimeHHMMSS(workout.elapsedTime || 0);

  return (
    <BottomSheet
      isOpen={showDayModal}
      onClose={closeDayModal}
      title={formatDateLong(workout.date)}
    >
      <div className="pb-6">
        {/* Header: Colored left border, location, close button */}
        <div
          className="mb-4 pb-4 border-b flex items-start justify-between"
          style={{ borderColor: currentTheme.rawCardBorder }}
        >
          <div>
            <div
              className="text-sm font-semibold mb-2 flex items-center"
              style={{ color: colorValue }}
            >
              <span
                style={{
                  display: 'inline-block',
                  width: '4px',
                  height: '16px',
                  backgroundColor: colorValue,
                  marginRight: '8px',
                  borderRadius: '2px',
                }}
              />
              {workout.location ? `· ${workout.location}` : 'No location'}
            </div>
            {/* Info line */}
            <div
              className="text-xs"
              style={{
                color: currentTheme.rawText,
                opacity: 0.6,
              }}
            >
              {exerciseCount > 0 && (
                <span>{exerciseCount} exercise{exerciseCount !== 1 ? 's' : ''}</span>
              )}
              {workout.structure && (
                <span> · {workout.structure}</span>
              )}
              {elapsedTime && (
                <span> · {elapsedTime}</span>
              )}
              {totalProtein > 0 && (
                <span> · {totalProtein}g protein</span>
              )}
            </div>
          </div>
        </div>

        {/* Exercises Table */}
        {workout.exercises && workout.exercises.length > 0 && (
          <div className="mb-6">
            <div className="space-y-0">
              {workout.exercises.map((exercise, idx) => (
                <div
                  key={idx}
                  className="py-3 flex justify-between items-start"
                  style={{
                    borderBottomColor: currentTheme.rawCardBorder,
                    borderBottomWidth: idx < workout.exercises.length - 1 ? '1px' : '0',
                  }}
                >
                  <div>
                    <div
                      className="font-semibold text-sm"
                      style={{ color: currentTheme.rawText }}
                    >
                      {exercise.name}
                    </div>
                    {exercise.notes && (
                      <div
                        className="text-xs italic mt-1"
                        style={{
                          color: currentTheme.rawText,
                          opacity: 0.6,
                        }}
                      >
                        {exercise.notes}
                      </div>
                    )}
                  </div>
                  <div
                    className="text-sm"
                    style={{ color: currentTheme.rawText }}
                  >
                    {exercise.sets && exercise.sets.length > 0 ? (
                      <>
                        <span className="opacity-75">
                          {exercise.sets.map((set) => set.reps).join(' · ')}
                        </span>
                        {exercise.sets.some((s) => s.reps) && (
                          <span className="font-bold ml-2">
                            {exercise.sets.reduce((sum, set) => sum + (parseInt(set.reps) || 0), 0)}
                          </span>
                        )}
                      </>
                    ) : (
                      <span className="opacity-60">No sets</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Notes Section */}
        {workout.notes && (
          <div
            className="mb-6 p-4 rounded-lg"
            style={{
              backgroundColor: `rgba(96, 165, 250, 0.1)`,
              borderLeftWidth: '4px',
              borderLeftColor: colorValue,
            }}
          >
            <h3
              className="text-xs font-bold uppercase tracking-wider mb-2"
              style={{ color: colorValue }}
            >
              Notes
            </h3>
            <p
              className="text-sm"
              style={{
                color: currentTheme.rawText,
                opacity: 0.8,
              }}
            >
              {workout.notes}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-4 gap-2">
          <button
            onClick={handleCopy}
            className="flex flex-col items-center justify-center py-3 rounded-xl hover:opacity-80 transition-all"
            style={{ backgroundColor: currentTheme.rawInputBg }}
            title="Copy to clipboard"
          >
            <Copy size={20} className="mb-1" style={{ color: currentTheme.rawText }} />
            <span
              className="text-xs font-semibold"
              style={{ color: currentTheme.rawText }}
            >
              Copy
            </span>
          </button>
          <button
            onClick={handleShare}
            className="flex flex-col items-center justify-center py-3 rounded-xl hover:opacity-80 transition-all"
            style={{ backgroundColor: currentTheme.rawInputBg }}
            title="Share workout"
          >
            <Share2 size={20} className="mb-1" style={{ color: currentTheme.rawText }} />
            <span
              className="text-xs font-semibold"
              style={{ color: currentTheme.rawText }}
            >
              Share
            </span>
          </button>
          <button
            onClick={handleEdit}
            className="flex flex-col items-center justify-center py-3 rounded-xl hover:opacity-80 transition-all"
            style={{ backgroundColor: currentTheme.rawInputBg }}
            title="Edit workout"
          >
            <Pencil size={20} className="mb-1" style={{ color: currentTheme.rawText }} />
            <span
              className="text-xs font-semibold"
              style={{ color: currentTheme.rawText }}
            >
              Edit
            </span>
          </button>
          <button
            onClick={handleDelete}
            className="flex flex-col items-center justify-center py-3 rounded-xl hover:opacity-80 transition-all"
            style={{ backgroundColor: currentTheme.rawInputBg }}
            title="Delete workout"
          >
            <Trash2 size={20} className="mb-1" style={{ color: '#f87171' }} />
            <span
              className="text-xs font-semibold"
              style={{ color: '#f87171' }}
            >
              Delete
            </span>
          </button>
        </div>
      </div>
    </BottomSheet>
  );
}
