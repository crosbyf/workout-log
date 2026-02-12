import { ChevronRight } from 'lucide-react';
import { useThemeStore } from '../../stores/themeStore';
import { usePresetStore } from '../../stores/presetStore';
import { useTrackingStore } from '../../stores/trackingStore';
import { formatDateShort, formatTime } from '../../lib/formatting';
import { getPresetColor } from '../../lib/constants';

export default function WorkoutCard({ workout, onClick }) {
  const { getCurrentTheme } = useThemeStore();
  const { presets } = usePresetStore();
  const { proteinEntries } = useTrackingStore();
  const currentTheme = getCurrentTheme();

  // Get color from preset
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

  const borderColor = colorMap[color.text] || '#60a5fa';

  // Count exercises
  const exerciseCount = workout.exercises?.length || 0;

  // Calculate elapsed time
  const elapsedTime = formatTime(workout.elapsedTime || 0);

  // Get protein intake for this day
  const dayProteinEntries = proteinEntries.filter((entry) => {
    // Parse entry date if it's a timestamp
    const entryDate = typeof entry.date === 'string' ? entry.date : new Date(entry.timestamp).toISOString().split('T')[0];
    return entryDate === workout.date;
  });
  const totalProtein = dayProteinEntries.reduce((sum, entry) => sum + (entry.grams || 0), 0);

  return (
    <button
      onClick={onClick}
      className={`w-full px-4 py-3 rounded-lg border transition-all hover:opacity-80 cursor-pointer flex items-center justify-between`}
      style={{
        backgroundColor: currentTheme.rawCardBg,
        borderColor: currentTheme.rawCardBorder,
        borderLeft: `3px solid ${borderColor}`,
      }}
    >
      <div className="flex-1 text-left">
        {/* Date and Location */}
        <div className="text-sm font-semibold">
          {formatDateShort(workout.date)}
          {workout.location && (
            <span className="opacity-75 ml-2">
              · {workout.location}
            </span>
          )}
        </div>

        {/* Subtitle: Exercise count, structure, elapsed time, protein */}
        <div className="text-xs opacity-60 mt-1 space-x-2">
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

      {/* Right Chevron */}
      <ChevronRight size={20} className="opacity-50 ml-2 flex-shrink-0" />
    </button>
  );
}
