'use client';

import { useState } from 'react';
import { Check, Pencil, Plus, X, Minus } from 'lucide-react';
import { isDeadhang } from '@/utils/exercise';

/**
 * Progress Bars variant of ExerciseCard.
 * Shows a compact row with status indicator, exercise name, and pill-style rep inputs.
 * Supports add/remove sets, delete exercise, pairs/circuit highlighting, and deadhang.
 */
export default function ProgressExerciseCard({
  exercise,
  index,
  isActive,
  onUpdate,
  onRemove,
  disabled = false,
  activeSetCol = -1,  // circuit mode: which set column is active
}) {
  const [showNote, setShowNote] = useState(!!exercise.notes);

  const sets = exercise.sets || [];
  const deadhang = isDeadhang(exercise.name);
  const filledCount = sets.filter(s => s.reps !== '' && s.reps !== 0 && s.reps !== null).length;
  const allFilled = filledCount === sets.length && sets.length > 0;
  const totalReps = sets.reduce((sum, s) => sum + (Number(s.reps) || 0), 0);

  const handleSetChange = (setIndex, value) => {
    const newSets = sets.map((s, i) =>
      i === setIndex ? { ...s, reps: value === '' ? '' : Number(value) || 0 } : s
    );
    onUpdate({ ...exercise, sets: newSets });
  };

  const handleAddSet = () => {
    const newSets = [...sets, { reps: '', weight: null }];
    onUpdate({ ...exercise, sets: newSets });
  };

  const handleRemoveLastSet = () => {
    if (sets.length <= 1) return;
    const newSets = sets.slice(0, -1);
    onUpdate({ ...exercise, sets: newSets });
  };

  const handleNoteChange = (value) => {
    onUpdate({ ...exercise, notes: value });
  };

  // Status indicator styles
  let statusBg, statusBorder, statusContent;
  if (allFilled) {
    statusBg = 'var(--color-green)';
    statusBorder = 'var(--color-green)';
    statusContent = <Check size={10} color="#ffffff" />;
  } else if (isActive || filledCount > 0) {
    statusBg = 'transparent';
    statusBorder = 'var(--color-accent)';
    statusContent = <span style={{ fontSize: 9, color: 'var(--color-accent)', fontWeight: 700 }}>{index + 1}</span>;
  } else {
    statusBg = 'transparent';
    statusBorder = 'var(--color-border)';
    statusContent = <span style={{ fontSize: 9, color: 'var(--color-text-dim)' }}>{index + 1}</span>;
  }

  const isUpcoming = !allFilled && filledCount === 0 && !isActive;
  const cardOpacity = isUpcoming ? 0.5 : 1;

  return (
    <div
      className="rounded-lg mb-1 overflow-hidden"
      style={{
        backgroundColor: 'var(--color-surface)',
        border: isActive ? '1px solid var(--color-accent)' : '1px solid var(--color-border)',
        opacity: cardOpacity,
      }}
    >
      {/* Completed exercises get a green left border */}
      <div style={{ borderLeft: allFilled ? '3px solid var(--color-green)' : '3px solid transparent' }}>
        <div className="flex items-center gap-2 px-2 py-1.5">
          {/* Status indicator */}
          <div
            className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
            style={{
              backgroundColor: statusBg,
              border: `2px solid ${statusBorder}`,
            }}
          >
            {statusContent}
          </div>

          {/* Exercise name + total */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1">
              <span
                className="text-xs font-semibold truncate"
                style={{ color: 'var(--color-text)' }}
              >
                {exercise.name}
              </span>
              {totalReps > 0 && (
                <span className="text-[10px] font-bold shrink-0" style={{ color: 'var(--color-accent)' }}>
                  {deadhang ? `${totalReps}s` : totalReps}
                </span>
              )}
            </div>
            {exercise.notes && !showNote && (
              <span className="text-[10px] italic truncate block" style={{ color: 'var(--color-text-dim)' }}>
                {exercise.notes}
              </span>
            )}
          </div>

          {/* Rep pills */}
          <div className="flex gap-1 shrink-0 items-center">
            {sets.map((set, i) => {
              const filled = set.reps !== '' && set.reps !== 0 && set.reps !== null;
              const isActiveCol = activeSetCol === i;
              return (
                <input
                  key={i}
                  type="number"
                  inputMode="numeric"
                  value={set.reps === '' || set.reps === null ? '' : set.reps}
                  onChange={(e) => handleSetChange(i, e.target.value)}
                  disabled={disabled}
                  className="w-9 h-7 text-center text-xs font-semibold rounded-md border-0 outline-none"
                  style={{
                    backgroundColor: filled ? 'var(--color-green-soft)' : 'var(--color-surface-hover)',
                    color: filled ? '#ffffff' : 'var(--color-text)',
                    border: isActiveCol && !filled
                      ? '2px solid var(--color-accent)'
                      : isActive && !filled
                        ? '1px solid var(--color-accent)'
                        : 'none',
                    opacity: disabled ? 0.4 : 1,
                  }}
                  placeholder={deadhang ? 's' : ''}
                />
              );
            })}

            {/* Add set */}
            <button
              onClick={handleAddSet}
              className="w-6 h-6 rounded-md flex items-center justify-center shrink-0"
              style={{ backgroundColor: 'var(--color-surface-hover)' }}
              aria-label="Add set"
            >
              <Plus size={10} style={{ color: 'var(--color-text-muted)' }} />
            </button>

            {/* Remove last set */}
            {sets.length > 1 && (
              <button
                onClick={handleRemoveLastSet}
                className="w-6 h-6 rounded-md flex items-center justify-center shrink-0"
                style={{ backgroundColor: 'var(--color-surface-hover)' }}
                aria-label="Remove last set"
              >
                <Minus size={10} style={{ color: 'var(--color-text-dim)' }} />
              </button>
            )}
          </div>

          {/* Delete exercise */}
          {onRemove && (
            <button
              onClick={() => onRemove(exercise.name)}
              className="p-0.5 shrink-0"
              aria-label={`Remove ${exercise.name}`}
            >
              <X size={11} style={{ color: 'var(--color-text-dim)' }} />
            </button>
          )}

          {/* Note toggle */}
          {!showNote && !exercise.notes && (
            <button
              onClick={() => setShowNote(true)}
              className="p-0.5 shrink-0"
            >
              <Pencil size={9} style={{ color: 'var(--color-text-dim)', opacity: 0.5 }} />
            </button>
          )}
        </div>

        {/* Inline note field */}
        {showNote && (
          <input
            type="text"
            value={exercise.notes || ''}
            onChange={(e) => handleNoteChange(e.target.value)}
            placeholder="Note..."
            className="w-full text-[10px] py-1 px-3 border-0 outline-none"
            style={{
              backgroundColor: 'var(--color-surface-hover)',
              color: 'var(--color-text-muted)',
              borderTop: '1px solid var(--color-border)',
            }}
          />
        )}
      </div>
    </div>
  );
}
