'use client';

import { Coffee } from 'lucide-react';
import { formatDate, formatDuration } from '@/utils/format';
import { PRESET_COLORS } from '@/hooks/usePresets';
import { calculateTotalReps } from '@/utils/exercise';

function getColorForWorkout(location, presets) {
  if (presets && presets.length > 0) {
    const preset = presets.find(p => p.name === location);
    if (preset && preset.color) {
      return PRESET_COLORS[preset.color] || 'var(--color-accent)';
    }
  }
  return 'var(--color-accent)';
}

/**
 * Compact workout card for the home/log feed.
 * [4px color bar] [Day · Location] [summary stats] [BIG rep number]
 * fillHeight: when true, card stretches to fill parent flex container (Home tab)
 */
export default function CompactWorkoutCard({ workout, isExpanded, onToggle, presets = [], proteinGrams = 0, fillHeight = false }) {
  const color = getColorForWorkout(workout.location, presets);
  const totalReps = calculateTotalReps(workout.exercises);

  const structureLabel = workout.structure !== 'standard'
    ? workout.structure === 'pairs' ? 'Pairs' : 'Circuit'
    : null;

  // When fillHeight is true, remove mb and add flex:1
  const mbClass = fillHeight ? '' : 'mb-1';
  const fillStyle = fillHeight ? { flex: 1 } : {};

  // Run card
  if (workout.isRun) {
    return (
      <button
        onClick={onToggle}
        className={`w-full text-left rounded-lg overflow-hidden ${mbClass} flex items-center`}
        style={{
          backgroundColor: 'var(--color-surface)',
          outline: 'none',
          border: isExpanded ? '1px solid #f59e0b' : '1px solid transparent',
          ...fillStyle,
        }}
      >
        <div className="w-1.5 self-stretch shrink-0" style={{ backgroundColor: '#f59e0b' }} />
        <div className="flex-1 flex items-center px-3 py-2.5 min-w-0 gap-3">
          <div className="flex-1 min-w-0">
            <div
              className="text-[13px] uppercase truncate"
              style={{ color: 'var(--color-text)', fontWeight: 800, letterSpacing: '0.04em' }}
            >
              Run
            </div>
            {/* Stats row — single line, truncates instead of wrapping */}
            <div className="text-xs truncate mt-0.5" style={{ color: 'var(--color-text-dim)' }}>
              {[
                formatDate(workout.date),
                workout.runTime > 0 ? formatDuration(workout.runTime) : null,
                workout.runPace ? `${workout.runPace}/mi` : null,
                proteinGrams > 0 ? `${proteinGrams}g` : null,
              ].filter(Boolean).join(' · ')}
            </div>
          </div>
          <div className="shrink-0 text-right">
            <span className="text-xl" style={{ color: '#f59e0b', fontWeight: 800 }}>
              {workout.runDistance}
            </span>
            <span className="text-[10px] block -mt-1" style={{ color: 'var(--color-text-dim)' }}>
              mi
            </span>
          </div>
        </div>
      </button>
    );
  }

  // Day Off card — dimmed, tappable
  if (workout.isDayOff) {
    return (
      <button
        onClick={onToggle}
        className={`w-full text-left rounded-lg ${mbClass} px-3 py-2.5 flex items-center gap-2`}
        style={{
          backgroundColor: 'var(--color-surface)',
          opacity: isExpanded ? 0.8 : 0.5,
          outline: 'none',
          border: isExpanded ? '1px solid var(--color-text-dim)' : '1px solid transparent',
          ...fillStyle,
        }}
      >
        <Coffee size={14} style={{ color: 'var(--color-text-dim)' }} />
        <span className="text-sm font-medium" style={{ color: 'var(--color-text-muted)' }}>
          {formatDate(workout.date)}
        </span>
        <span
          className="text-xs flex-1 uppercase"
          style={{ color: 'var(--color-text-dim)', fontWeight: 700, letterSpacing: '0.06em' }}
        >
          Day Off
        </span>
        {workout.notes && (
          <span className="text-[10px] truncate max-w-[100px]" style={{ color: 'var(--color-text-dim)' }}>
            {workout.notes}
          </span>
        )}
      </button>
    );
  }

  return (
    <button
      onClick={onToggle}
      className={`w-full text-left rounded-lg overflow-hidden ${mbClass} flex items-center`}
      style={{
        backgroundColor: 'var(--color-surface)',
        outline: 'none',
        border: isExpanded ? '1px solid var(--color-accent)' : '1px solid transparent',
        ...fillStyle,
      }}
    >
      {/* Color bar */}
      <div className="w-1.5 self-stretch shrink-0" style={{ backgroundColor: color }} />

      {/* Content */}
      <div className="flex-1 flex items-center px-3 py-2.5 min-w-0 gap-3">
        {/* Location title + date/stats */}
        <div className="flex-1 min-w-0">
          <div
            className="text-[13px] uppercase truncate"
            style={{ color: 'var(--color-text)', fontWeight: 800, letterSpacing: '0.04em' }}
          >
            {workout.location || 'Workout'}
          </div>
          {/* Stats row — single line, truncates instead of wrapping */}
          <div className="text-xs truncate mt-0.5" style={{ color: 'var(--color-text-dim)' }}>
            {[
              formatDate(workout.date),
              `${workout.exercises.length} exercises`,
              workout.elapsedTime > 0 ? formatDuration(workout.elapsedTime) : null,
              structureLabel,
              proteinGrams > 0 ? `${proteinGrams}g` : null,
            ].filter(Boolean).join(' · ')}
          </div>
        </div>

        {/* Big rep number — matches preset color */}
        <div className="shrink-0 text-right">
          <span
            className="text-xl"
            style={{ color: totalReps > 0 ? color : 'var(--color-text-dim)', fontWeight: 800 }}
          >
            {totalReps}
          </span>
          {totalReps > 0 && (
            <span className="text-[10px] block -mt-1" style={{ color: 'var(--color-text-dim)' }}>
              reps
            </span>
          )}
        </div>
      </div>
    </button>
  );
}
