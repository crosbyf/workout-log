import { ChevronRight } from 'lucide-react';
import { useThemeStore } from '../../stores/themeStore';
import { usePresetStore } from '../../stores/presetStore';
import { useTrackingStore } from '../../stores/trackingStore';
import { formatDateShort, formatTimeHHMMSS } from '../../lib/formatting';
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

  // Calculate elapsed time from milliseconds
  const elapsedSeconds = workout.elapsedTime ? Math.floor(workout.elapsedTime / 1000) : 0;
  const elapsedTime = formatTimeHHMMSS(elapsedSeconds);

  // Get protein intake for this day
  const dayProteinEntries = proteinEntries.filter((entry) => {
    const entryDate = typeof entry.date === 'string' ? entry.date : new Date(entry.timestamp).toISOString().split('T')[0];
    return entryDate === workout.date;
  });
  const totalProtein = dayProteinEntries.reduce((sum, entry) => sum + (entry.grams || 0), 0);

  // Build metadata line
  const metadataItems = [];
  if (exerciseCount > 0) {
    metadataItems.push(`${exerciseCount} exercise${exerciseCount !== 1 ? 's' : ''}`);
  }
  if (workout.structure) {
    const structureText = workout.structureDuration
      ? `${workout.structure} · ${workout.structureDuration}'`
      : workout.structure;
    metadataItems.push(structureText);
  }
  if (elapsedTime) {
    metadataItems.push(elapsedTime);
  }
  if (totalProtein > 0) {
    metadataItems.push(`${totalProtein}g protein`);
  }

  const metadataString = metadataItems.join(' · ');

  return (
    <button
      onClick={onClick}
      className="w-full rounded-xl transition-all hover:opacity-80 cursor-pointer flex items-center justify-between p-4"
      style={{
        backgroundColor: currentTheme.rawCardBg,
        borderLeft: `4px solid ${borderColor}`,
      }}
    >
      <div className="flex-1 text-left">
        {/* Date and Location */}
        <div style={{ color: currentTheme.rawText }} className="font-semibold">
          {formatDateShort(workout.date)}
          {workout.location && (
            <span className="opacity-75 ml-2">
              · {workout.location}
            </span>
          )}
        </div>

        {/* Subtitle: Exercise count, structure, elapsed time, protein */}
        <div style={{ color: currentTheme.rawText, opacity: 0.6 }} className="text-sm mt-1">
          {metadataString}
        </div>
      </div>

      {/* Right Chevron */}
      <ChevronRight
        size={20}
        style={{ color: currentTheme.rawText, opacity: 0.4 }}
        className="ml-2 flex-shrink-0"
      />
    </button>
  );
}
