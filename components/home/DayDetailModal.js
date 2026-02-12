import { Copy, Share2, Pencil, Trash2 } from 'lucide-react';
import BottomSheet from '../modals/BottomSheet';
import { useUIStore } from '../../stores/uiStore';
import { useThemeStore } from '../../stores/themeStore';
import { useWorkoutStore } from '../../stores/workoutStore';
import { usePresetStore } from '../../stores/presetStore';
import { useTrackingStore } from '../../stores/trackingStore';
import { formatDateLong, formatTime } from '../../lib/formatting';
import { getPresetColor } from '../../lib/constants';
import { copyToSheets, shareWorkout } from '../../lib/sharing';

export default function DayDetailModal() {
  const { showDayModal, selectedDay, showToastMessage } = useUIStore();
  const { getCurrentTheme } = useThemeStore();
  const { workouts, setEditing, deleteWorkout } = useWorkoutStore();

  const closeDayModal = () => {
    useUIStore.setState({ showDayModal: false, selectedDay: null });
  };
  const { presets } = usePresetStore();
  const { proteinEntries } = useTrackingStore();
  const currentTheme = getCurrentTheme();

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
    if (workoutIndex !== -1) {
      deleteWorkout(workoutIndex);
      closeDayModal();
      showToastMessage('Workout deleted');
    }
  };

  const exerciseCount = workout.exercises?.length || 0;
  const elapsedTime = formatTime(workout.elapsedTime || 0);

  return (
    <BottomSheet
      isOpen={showDayModal}
      onClose={() => closeDayModal()}
      title={formatDateLong(workout.date)}
    >
      <div className="pb-6">
        {/* Header: Day name, date, location */}
        <div className="mb-4 pb-4 border-b" style={{ borderColor: currentTheme.rawCardBorder }}>
          <div
            className="text-sm font-semibold opacity-75 mb-2"
            style={{ color: colorValue }}
          >
            {workout.location || 'No location'}
          </div>
          <div className="text-xs opacity-60 space-x-2">
            {exerciseCount > 0 && (
              <span>{exerciseCount} exercise{exerciseCount !== 1 ? 's' : ''}</span>
            )}
            {workout.structure && (
              <span>· {workout.structure}</span>
            )}
            {elapsedTime !== '0:00' && (
              <span>· {elapsedTime}</span>
            )}
            {totalProtein > 0 && (
              <span>· {totalProtein}g protein</span>
            )}
          </div>
        </div>

        {/* Exercises Table */}
        {workout.exercises && workout.exercises.length > 0 && (
          <div className="mb-6">
            <h3 className="text-xs font-bold uppercase tracking-wider opacity-60 mb-3">
              Exercises
            </h3>
            <div className="space-y-3">
              {workout.exercises.map((exercise, idx) => (
                <div key={idx} className="pb-3 border-b" style={{ borderColor: currentTheme.rawCardBorder }}>
                  <div className="font-semibold text-sm mb-2">
                    {exercise.name}
                  </div>
                  {exercise.sets && exercise.sets.length > 0 && (
                    <div className="text-xs opacity-75 space-y-1">
                      {exercise.sets.map((set, setIdx) => (
                        <div key={setIdx}>
                          Set {setIdx + 1}: {set.reps}
                          {set.weight ? ` @ ${set.weight}` : ''}
                        </div>
                      ))}
                    </div>
                  )}
                  {exercise.notes && (
                    <div className="text-xs opacity-60 mt-2 italic">
                      {exercise.notes}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Notes Section */}
        {workout.notes && (
          <div className="mb-6 pb-4 border-b" style={{ borderColor: currentTheme.rawCardBorder }}>
            <h3 className="text-xs font-bold uppercase tracking-wider opacity-60 mb-2">
              Notes
            </h3>
            <p className="text-sm opacity-75">
              {workout.notes}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-4 gap-2">
          <button
            onClick={handleCopy}
            className="flex flex-col items-center justify-center py-3 rounded-lg hover:opacity-80 transition-all"
            style={{ backgroundColor: currentTheme.rawInputBg }}
            title="Copy to clipboard"
          >
            <Copy size={20} className="mb-1" />
            <span className="text-xs font-semibold">Copy</span>
          </button>
          <button
            onClick={handleShare}
            className="flex flex-col items-center justify-center py-3 rounded-lg hover:opacity-80 transition-all"
            style={{ backgroundColor: currentTheme.rawInputBg }}
            title="Share workout"
          >
            <Share2 size={20} className="mb-1" />
            <span className="text-xs font-semibold">Share</span>
          </button>
          <button
            onClick={handleEdit}
            className="flex flex-col items-center justify-center py-3 rounded-lg hover:opacity-80 transition-all"
            style={{ backgroundColor: currentTheme.rawInputBg }}
            title="Edit workout"
          >
            <Pencil size={20} className="mb-1" />
            <span className="text-xs font-semibold">Edit</span>
          </button>
          <button
            onClick={handleDelete}
            className="flex flex-col items-center justify-center py-3 rounded-lg hover:opacity-80 transition-all text-red-400"
            style={{ backgroundColor: currentTheme.rawInputBg }}
            title="Delete workout"
          >
            <Trash2 size={20} className="mb-1" />
            <span className="text-xs font-semibold">Delete</span>
          </button>
        </div>
      </div>
    </BottomSheet>
  );
}
