'use client';

import { useState, useRef, useEffect } from 'react';
import { Coffee, Clock, X, Copy, Share2, Pencil, Trash2, Check } from 'lucide-react';
import { formatDate, formatDuration } from '@/utils/format';
import { PRESET_COLORS } from '@/hooks/usePresets';
import { isDeadhang, calculateTotalReps, formatRepValue } from '@/utils/exercise';
import CompactWorkoutCard from './CompactWorkoutCard';
import InlineExpandedWorkout from './InlineExpandedWorkout';

function getColorForWorkout(location, presets) {
  if (presets && presets.length > 0) {
    const preset = presets.find(p => p.name === location);
    if (preset && preset.color) {
      return PRESET_COLORS[preset.color] || 'var(--color-accent)';
    }
  }
  const fallback = {
    'Garage A': 'blue', 'Garage B': 'purple', 'BW-only': 'green',
    'GtG': 'yellow', 'Manual': 'red', 'Garage 10': 'pink',
    'Garage 12': 'orange', 'Garage BW': 'cyan',
  };
  return PRESET_COLORS[fallback[location] || 'blue'] || 'var(--color-accent)';
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

function StatsRow({ workout, structureLabel, totalReps, proteinGrams }) {
  return (
    <div className="flex items-center gap-2 text-xs flex-wrap" style={{ color: 'var(--color-text-dim)' }}>
      <span>{workout.exercises.length} exercise{workout.exercises.length !== 1 ? 's' : ''}</span>
      {totalReps > 0 && <span>· {totalReps} reps</span>}
      {workout.elapsedTime > 0 && (
        <span className="flex items-center gap-0.5">
          · <Clock size={10} />
          {formatDuration(workout.elapsedTime)}
        </span>
      )}
      {structureLabel && <span>· {structureLabel}</span>}
      {proteinGrams > 0 && <span>· {proteinGrams}g protein</span>}
    </div>
  );
}

/**
 * Bottom sheet component — mounts only when open, manages its own animation.
 */
function WorkoutBottomSheet({ workout, color, structureLabel, totalReps, proteinGrams, onClose, onEdit, onDelete }) {
  const [visible, setVisible] = useState(false);
  const [copyConfirm, setCopyConfirm] = useState(false);
  const sheetRef = useRef(null);
  const touchStartY = useRef(0);
  const touchCurrentY = useRef(0);

  // Lock body scroll, block touch events on body, slide in
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    const blockTouch = (e) => {
      // Allow scrolling inside .bottom-sheet-scroll, block everything else
      if (!e.target.closest('.bottom-sheet-scroll')) {
        e.preventDefault();
      }
    };
    document.addEventListener('touchmove', blockTouch, { passive: false });
    const timer = window.setTimeout(() => setVisible(true), 20);
    return () => {
      window.clearTimeout(timer);
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
      document.removeEventListener('touchmove', blockTouch);
    };
  }, []);

  const handleClose = () => {
    setVisible(false);
    window.setTimeout(() => onClose(), 250);
  };

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

  const handleEdit = (e) => { e.stopPropagation(); onClose(); onEdit(workout); };
  const handleDelete = (e) => { e.stopPropagation(); onDelete(workout); };

  // Swipe-down handlers
  const onTouchStart = (e) => {
    touchStartY.current = e.touches[0].clientY;
    touchCurrentY.current = e.touches[0].clientY;
  };

  const onTouchMove = (e) => {
    const diff = e.touches[0].clientY - touchStartY.current;
    touchCurrentY.current = e.touches[0].clientY;
    if (diff > 10 && sheetRef.current) {
      sheetRef.current.style.transform = `translateY(${diff}px)`;
      sheetRef.current.style.transition = 'none';
    }
  };

  const onTouchEnd = () => {
    const diff = touchCurrentY.current - touchStartY.current;
    if (sheetRef.current) {
      sheetRef.current.style.transition = 'transform 0.25s ease-out';
      if (diff > 100) {
        sheetRef.current.style.transform = 'translateY(100%)';
        window.setTimeout(() => onClose(), 250);
      } else {
        sheetRef.current.style.transform = 'translateY(0)';
      }
    }
  };

  return (
    <div
      className="bottom-sheet-overlay"
      style={{
        backgroundColor: visible ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0)',
        transition: 'background-color 0.25s ease',
      }}
      onClick={handleClose}
    >
      <div
        ref={sheetRef}
        className="bottom-sheet"
        style={{
          backgroundColor: 'var(--color-surface)',
          transform: visible ? 'translateY(0)' : 'translateY(100%)',
          transition: 'transform 0.25s ease-out',
        }}
        onClick={(e) => e.stopPropagation()}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-2 pb-1 shrink-0">
          <div className="w-10 h-1 rounded-full" style={{ backgroundColor: 'var(--color-border)' }} />
        </div>

        {/* Header — tap to close */}
        <button onClick={handleClose} className="w-full text-left flex shrink-0" style={{ outline: 'none' }}>
          <div className="w-1.5 shrink-0" style={{ backgroundColor: color }} />
          <div className="flex-1 px-4 py-2">
            <div className="flex items-center justify-between mb-0.5">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold" style={{ color: 'var(--color-text)' }}>
                  {formatDate(workout.date)}
                </span>
                <span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                  · {workout.location}
                </span>
              </div>
              <X size={16} style={{ color: 'var(--color-text-dim)' }} />
            </div>
            <StatsRow
              workout={workout}
              structureLabel={structureLabel}
              totalReps={totalReps}
              proteinGrams={proteinGrams}
            />
          </div>
        </button>

        {/* Exercise breakdown — scrollable middle section */}
        <div
          className="bottom-sheet-scroll"
          style={{ borderTop: '1px solid var(--color-border)' }}
        >
          {workout.exercises.map((ex, idx) => {
            const dh = isDeadhang(ex.name);
            const exTotal = ex.sets.reduce((sum, s) => sum + (s.reps || 0), 0);
            const repsStr = ex.sets.map(s => dh ? `${s.reps}s` : s.reps).join(' · ');
            return (
              <div
                key={idx}
                className="px-4 py-2"
                style={idx > 0 ? { borderTop: '1px solid var(--color-border)' } : undefined}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
                      {ex.name}
                    </span>
                    {ex.notes && ex.notes.replace(/,+$/g, '').trim() && (
                      <span className="text-xs italic ml-2" style={{ color: 'var(--color-text-dim)' }}>
                        {ex.notes.replace(/,+$/g, '').trim()}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 shrink-0 ml-3">
                    <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                      {repsStr}
                    </span>
                    <span className="text-base font-bold min-w-[32px] text-right" style={{ color: 'var(--color-accent)' }}>
                      {dh ? `${exTotal}s` : exTotal}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}

          {workout.notes && (
            <div className="mx-4 my-2">
              <div
                className="px-3 py-2 rounded-lg text-xs leading-relaxed"
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

        {/* Action buttons — always pinned at bottom */}
        <div
          className="flex items-center justify-around px-2 py-2 shrink-0"
          style={{
            borderTop: '1px solid var(--color-border)',
            paddingBottom: 'max(8px, env(safe-area-inset-bottom))',
          }}
        >
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium"
            style={{ color: copyConfirm ? 'var(--color-green)' : 'var(--color-text-muted)' }}
          >
            {copyConfirm ? <Check size={14} /> : <Copy size={14} />}
            {copyConfirm ? 'Copied!' : 'Copy'}
          </button>
          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium"
            style={{ color: 'var(--color-text-muted)' }}
          >
            <Share2 size={14} /> Share
          </button>
          <button
            onClick={handleEdit}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium"
            style={{ color: 'var(--color-text-muted)' }}
          >
            <Pencil size={14} /> Edit
          </button>
          <button
            onClick={handleDelete}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium"
            style={{ color: 'var(--color-red)' }}
          >
            <Trash2 size={14} /> Delete
          </button>
        </div>
      </div>

      {/* Copy confirmation toast */}
      {copyConfirm && (
        <div
          className="fixed top-20 left-1/2 px-4 py-2 rounded-full text-sm font-medium z-[60]"
          style={{
            backgroundColor: 'var(--color-green)',
            color: '#ffffff',
            animation: 'fadeInOut 1.5s ease-out',
          }}
        >
          Copied to clipboard
        </div>
      )}
    </div>
  );
}

export default function WorkoutCard({ workout, isExpanded, onToggle, onEdit, onDelete, proteinGrams = 0, presets = [] }) {
  if (workout.isDayOff) {
    return <CompactWorkoutCard workout={workout} isExpanded={false} onToggle={onToggle} presets={presets} proteinGrams={proteinGrams} />;
  }
  if (isExpanded) {
    return <InlineExpandedWorkout workout={workout} onToggle={onToggle} onEdit={onEdit} onDelete={onDelete} presets={presets} />;
  }
  return <CompactWorkoutCard workout={workout} isExpanded={false} onToggle={onToggle} presets={presets} proteinGrams={proteinGrams} />;
}
