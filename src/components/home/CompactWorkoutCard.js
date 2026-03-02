'use client';

import { Coffee, Clock, Footprints } from 'lucide-react';
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
 */
export default function CompactWorkoutCard({ workout, isExpanded, onToggle, presets = [], proteinGrams = 0 }) {
  const color = getColorForWorkout(workout.location, presets);
  const totalReps = calculateTotalReps(workout.exercises);

  const structureLabel = workout.structure !== 'standard'
    ? workout.structure === 'pairs' ? 'P' : 'C'
    : null;

  // Run card — green accent
  if (workout.isRun) {
    return (
      <button
        onClick={onToggle}
        className="w-full text-left rounded-lg overflow-hidden mb-1 flex items-center"
        style={{
          backgroundColor: 'var(--color-surface)',
          outline: 'none',
          border: isExpanded ? '1px solid #f59e0b' : '1px solid transparent',
        }}
      >
        <div className="w-1 self-stretch shrink-0" style={{ backgroundColor: '#f59e0b' }} />
        <div className="flex-1 flex items-center px-3 py-2.5 min-w-0 gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <Footprints size={14} style={{ color: '#f59e0b' }} />
              <span className="text-sm font-semibold truncate" style={{ color: 'var(--color-text)' }}>
                {formatDate(workout.date)}
              </span>
              <span className="text-xs shrink-0" style={{ color: 'var(--color-text-dim)' }}>
                · Run
              </span>
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs" style={{ color: 'var(--color-text-dim)' }}>
                {workout.runDistance} mi
              </span>
              {workout.runTime > 0 && (
                <span className="text-xs flex items-center gap-0.5" style={{ color: 'var(--color-text-dim)' }}>
                  · <Clock size={10} /> {formatDuration(workout.runTime)}
                </span>
              )}
              {workout.runPace && (
                <span className="text-xs" style={{ color: 'var(--color-text-dim)' }}>
                  · {workout.runPace}/mi
                </span>
              )}
            </div>
          </div>
          <div className="shrink-0 text-right">
            <span className="text-xl font-bold" style={{ color: '#f59e0b' }}>
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
        className="w-full text-left rounded-lg mb-1 px-3 py-2.5 flex items-center gap-2"
        style={{
          backgroundColor: 'var(--color-surface)',
          opacity: isExpanded ? 0.8 : 0.5,
          outline: 'none',
          border: isExpanded ? '1px solid var(--color-text-dim)' : '1px solid transparent',
        }}
      >
        <Coffee size={14} style={{ color: 'var(--color-text-dim)' }} />
        <span className="text-sm font-medium" style={{ color: 'var(--color-text-muted)' }}>
          {formatDate(workout.date)}
        </span>
        <span className="text-xs flex-1" style={{ color: 'var(--color-text-dim)' }}>Day Off</span>
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
      className="w-full text-left rounded-lg overflow-hidden mb-1 flex items-center"
      style={{
        backgroundColor: 'var(--color-surface)',
        outline: 'none',
        border: isExpanded ? '1px solid var(--color-accent)' : '1px solid transparent',
      }}
    >
      {/* Color bar */}
      <div className="w-1 self-stretch shrink-0" style={{ backgroundColor: color }} />

      {/* Content */}
      <div className="flex-1 flex items-center px-3 py-2.5 min-w-0 gap-3">
        {/* Date + Location */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-semibold truncate" style={{ color: 'var(--color-text)' }}>
              {formatDate(workout.date)}
            </span>
            <span className="text-xs shrink-0" style={{ color: 'var(--color-text-dim)' }}>
              · {workout.location}
            </span>
          </div>
          {/* Stats row */}
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-xs" style={{ color: 'var(--color-text-dim)' }}>
              {workout.exercises.length} ex
            </span>
            {workout.elapsedTime > 0 && (
              <span className="text-xs flex items-center gap-0.5" style={{ color: 'var(--color-text-dim)' }}>
                · <Clock size={10} /> {formatDuration(workout.elapsedTime)}
              </span>
            )}
            {structureLabel && (
              <span className="text-xs" style={{ color: 'var(--color-text-dim)' }}>
                · {structureLabel}
              </span>
            )}
            {proteinGrams > 0 && (
              <span className="text-xs" style={{ color: 'var(--color-text-dim)' }}>
                · {proteinGrams}g
              </span>
            )}
          </div>
        </div>

        {/* Big rep number */}
        <div className="shrink-0 text-right">
          <span
            className="text-xl font-bold"
            style={{ color: totalReps > 0 ? 'var(--color-accent)' : 'var(--color-text-dim)' }}
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
