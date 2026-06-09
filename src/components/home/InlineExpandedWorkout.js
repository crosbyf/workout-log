'use client';

import { useState } from 'react';
import { Copy, Share2, Pencil, Trash2, Check, Clock, ChevronUp, Coffee } from 'lucide-react';
import { formatDate, formatDuration } from '@/utils/format';
import { PRESET_COLORS } from '@/hooks/usePresets';
import { isDeadhang, calculateTotalReps } from '@/utils/exercise';

function getColorForWorkout(location, presets) {
  if (presets && presets.length > 0) {
    const preset = presets.find(p => p.name === location);
    if (preset && preset.color) {
      return PRESET_COLORS[preset.color] || 'var(--color-accent)';
    }
  }
  return 'var(--color-accent)';
}

function formatWorkoutText(workout) {
  const lines = [];
  lines.push(`${formatDate(workout.date)} — ${workout.location}`);
  if (workout.structure !== 'standard') {
    const label = workout.structure === 'pairs' ? 'Pairs' : 'Circuit';
    lines.push(`Structure: ${label}${workout.structureDuration ? ` ${workout.structureDuration}'` : ''}`);
  }
  if (workout.elapsedTime > 0) {
    lines.push(`Duration: ${formatDuration(workout.elapsedTime)}`);
  }
  lines.push('');
  workout.exercises.forEach(ex => {
    const dh = isDeadhang(ex.name);
    const reps = ex.sets.map(s => dh ? `${s.reps}s` : s.reps).join(' · ');
    const total = ex.sets.reduce((sum, s) => sum + (s.reps || 0), 0);
    lines.push(`${ex.name}: ${reps} (${total}${dh ? 's' : ''})`);
    if (ex.notes) lines.push(`  Note: ${ex.notes}`);
  });
  if (workout.notes) {
    lines.push('');
    lines.push(`Notes: ${workout.notes}`);
  }
  return lines.join('\n');
}

/**
 * Inline expansion for workout cards — no bottom sheet, no overlay.
 * Expands in-place with full exercise breakdown and action buttons.
 */
export default function InlineExpandedWorkout({ workout, onToggle, onEdit, onDelete, presets = [] }) {
  const [copyConfirm, setCopyConfirm] = useState(false);

  // Day Off expanded view
  if (workout.isDayOff) {
    return (
      <div
        className="rounded-lg overflow-hidden mb-1.5"
        style={{
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-text-dim)',
        }}
      >
        <button
          onClick={onToggle}
          className="w-full text-left flex items-center px-3 py-2.5"
          style={{ outline: 'none' }}
        >
          <Coffee size={14} style={{ color: 'var(--color-text-dim)' }} className="shrink-0 mr-2" />
          <span className="text-sm font-semibold" style={{ color: 'var(--color-text-muted)' }}>
            {formatDate(workout.date)}
          </span>
          <span className="text-xs ml-1.5" style={{ color: 'var(--color-text-dim)' }}>· Day Off</span>
          <ChevronUp size={14} style={{ color: 'var(--color-text-dim)' }} className="ml-auto" />
        </button>

        {workout.notes && (
          <div className="mx-3 mb-2" style={{ borderTop: '1px solid var(--color-border)' }}>
            <div
              className="px-2.5 py-1.5 mt-2 rounded-lg text-xs leading-relaxed"
              style={{
                backgroundColor: 'var(--color-surface-hover)',
                color: 'var(--color-text-muted)',
                borderLeft: '3px solid var(--color-text-dim)',
              }}
            >
              {workout.notes}
            </div>
          </div>
        )}

        <div
          className="flex items-center justify-around px-2 py-1.5"
          style={{ borderTop: '1px solid var(--color-border)' }}
        >
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(workout); }}
            className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-[10px] font-medium"
            style={{ color: 'var(--color-red)' }}
          >
            <Trash2 size={12} /> Delete
          </button>
        </div>
      </div>
    );
  }

  // Run expanded view
  if (workout.isRun) {
    return (
      <div
        className="rounded-lg overflow-hidden mb-1.5"
        style={{
          backgroundColor: 'var(--color-surface)',
          border: '1px solid #f59e0b',
        }}
      >
        <button
          onClick={onToggle}
          className="w-full text-left flex items-center px-3 py-2.5"
          style={{ outline: 'none' }}
        >
          <span className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
            {formatDate(workout.date)}
          </span>
          <span className="text-sm font-semibold ml-1.5" style={{ color: 'var(--color-text)' }}>· Run</span>
          <ChevronUp size={14} style={{ color: 'var(--color-text-dim)' }} className="ml-auto" />
        </button>

        <div className="px-3 pb-2" style={{ borderTop: '1px solid var(--color-border)' }}>
          <div className="flex items-center justify-around py-3">
            <div className="text-center">
              <span className="text-2xl font-bold block" style={{ color: '#f59e0b' }}>
                {workout.runDistance}
              </span>
              <span className="text-[10px]" style={{ color: 'var(--color-text-dim)' }}>miles</span>
            </div>
            <div className="text-center">
              <span className="text-2xl font-bold block" style={{ color: 'var(--color-accent)' }}>
                {formatDuration(workout.runTime || workout.elapsedTime)}
              </span>
              <span className="text-[10px]" style={{ color: 'var(--color-text-dim)' }}>time</span>
            </div>
            <div className="text-center">
              <span className="text-2xl font-bold block" style={{ color: 'var(--color-accent)' }}>
                {workout.runPace || '—'}
              </span>
              <span className="text-[10px]" style={{ color: 'var(--color-text-dim)' }}>pace</span>
            </div>
          </div>
        </div>

        {workout.notes && (
          <div className="mx-3 mb-2">
            <div
              className="px-2.5 py-1.5 rounded-lg text-xs leading-relaxed"
              style={{
                backgroundColor: 'var(--color-surface-hover)',
                color: 'var(--color-text-muted)',
                borderLeft: '3px solid #f59e0b',
              }}
            >
              {workout.notes}
            </div>
          </div>
        )}

        <div
          className="flex items-center justify-around px-2 py-1.5"
          style={{ borderTop: '1px solid var(--color-border)' }}
        >
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(workout); }}
            className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-[10px] font-medium"
            style={{ color: 'var(--color-red)' }}
          >
            <Trash2 size={12} /> Delete
          </button>
        </div>
      </div>
    );
  }

  const color = getColorForWorkout(workout.location, presets);
  const totalReps = calculateTotalReps(workout.exercises);

  const structureLabel = workout.structure !== 'standard'
    ? `${workout.structure === 'pairs' ? 'Pairs' : 'Circuit'}${workout.structureDuration ? ` ${workout.structureDuration}'` : ''}`
    : null;

  const handleCopy = async (e) => {
    e.stopPropagation();
    const text = formatWorkoutText(workout);
    try {
      await navigator.clipboard.writeText(text);
      setCopyConfirm(true);
      window.setTimeout(() => setCopyConfirm(false), 1500);
    } catch {}
  };

  const handleShare = async (e) => {
    e.stopPropagation();
    const text = formatWorkoutText(workout);
    if (navigator.share) {
      try { await navigator.share({ title: `Workout — ${formatDate(workout.date)}`, text }); } catch {}
    } else {
      await handleCopy(e);
    }
  };

  const handleEdit = (e) => { e.stopPropagation(); onEdit(workout); };
  const handleDelete = (e) => { e.stopPropagation(); onDelete(workout); };

  return (
    <div
      className="rounded-lg overflow-hidden mb-1"
      style={{
        backgroundColor: 'var(--color-surface)',
        border: '1px solid var(--color-accent)',
      }}
    >
      {/* Header — tap to collapse */}
      <button
        onClick={onToggle}
        className="w-full text-left flex items-center"
        style={{ outline: 'none' }}
      >
        <div className="w-1 self-stretch shrink-0" style={{ backgroundColor: color }} />
        <div className="flex-1 px-3 py-2.5 min-w-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold" style={{ color: 'var(--color-text)' }}>
                {formatDate(workout.date)}
              </span>
              <span className="text-xs font-semibold" style={{ color: 'var(--color-text)' }}>
                · {workout.location}
              </span>
            </div>
            <ChevronUp size={14} style={{ color: 'var(--color-text-dim)' }} />
          </div>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-[10px]" style={{ color: 'var(--color-text-dim)' }}>
              {workout.exercises.length} exercises
            </span>
            {totalReps > 0 && <span className="text-[10px]" style={{ color: 'var(--color-text-dim)' }}>· {totalReps} reps</span>}
            {workout.elapsedTime > 0 && (
              <span className="text-[10px] flex items-center gap-0.5" style={{ color: 'var(--color-text-dim)' }}>
                · <Clock size={8} /> {formatDuration(workout.elapsedTime)}
              </span>
            )}
            {structureLabel && <span className="text-[10px]" style={{ color: 'var(--color-text-dim)' }}>· {structureLabel}</span>}
          </div>
        </div>
      </button>

      {/* Exercise breakdown */}
      <div style={{ borderTop: '1px solid var(--color-border)' }}>
        {workout.exercises.map((ex, idx) => {
          const dh = isDeadhang(ex.name);
          const exTotal = ex.sets.reduce((sum, s) => sum + (s.reps || 0), 0);
          const repsStr = ex.sets.map(s => dh ? `${s.reps}s` : s.reps).join(' · ');
          return (
            <div
              key={idx}
              className="px-4 py-1.5"
              style={idx > 0 ? { borderTop: '1px solid var(--color-border)' } : undefined}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <span className="text-xs font-semibold" style={{ color: 'var(--color-text)' }}>
                    {ex.name}
                  </span>
                  {ex.notes && ex.notes.replace(/,+$/g, '').trim() && (
                    <span className="text-[10px] italic ml-1.5" style={{ color: 'var(--color-text-dim)' }}>
                      {ex.notes.replace(/,+$/g, '').trim()}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-2">
                  <span className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>
                    {repsStr}
                  </span>
                  <span className="text-sm font-bold min-w-[28px] text-right" style={{ color: 'var(--color-accent)' }}>
                    {dh ? `${exTotal}s` : exTotal}
                  </span>
                </div>
              </div>
            </div>
          );
        })}

        {workout.notes && (
          <div className="mx-3 my-2">
            <div
              className="px-2.5 py-1.5 rounded-lg text-[10px] leading-relaxed"
              style={{
                backgroundColor: 'var(--color-surface-hover)',
                color: 'var(--color-text-muted)',
                borderLeft: '3px solid #7c8fa0',
              }}
            >
              {workout.notes}
            </div>
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div
        className="flex items-center justify-around px-2 py-1.5"
        style={{ borderTop: '1px solid var(--color-border)' }}
      >
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-[10px] font-medium"
          style={{ color: copyConfirm ? 'var(--color-green)' : 'var(--color-text-muted)' }}
        >
          {copyConfirm ? <Check size={12} /> : <Copy size={12} />}
          {copyConfirm ? 'Copied' : 'Copy'}
        </button>
        <button
          onClick={handleShare}
          className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-[10px] font-medium"
          style={{ color: 'var(--color-text-muted)' }}
        >
          <Share2 size={12} /> Share
        </button>
        <button
          onClick={handleEdit}
          className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-[10px] font-medium"
          style={{ color: 'var(--color-text-muted)' }}
        >
          <Pencil size={12} /> Edit
        </button>
        <button
          onClick={handleDelete}
          className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-[10px] font-medium"
          style={{ color: 'var(--color-red)' }}
        >
          <Trash2 size={12} /> Delete
        </button>
      </div>
    </div>
  );
}
