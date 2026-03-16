'use client';

import { Check, Plus, X, Minus, ChevronDown } from 'lucide-react';
import { isDeadhang } from '@/utils/exercise';

/**
 * Two-row exercise card for the workout entry screen.
 * Row 1: Status indicator + exercise name (full, no truncation) + total reps + delete
 * Row 2: Set input pills + add/remove set buttons
 * Row 3: Always-visible notes field
 */
export default function ProgressExerciseCard({
  exercise,
  index,
  isActive,
  onUpdate,
  onRemove,
  onRename,
  disabled = false,
  activeSetCol = -1,  // circuit mode: which set column is active
}) {
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
      className="rounded-lg mb-1.5 overflow-hidden"
      style={{
        backgroundColor: 'var(--color-surface)',
        border: isActive ? '1px solid var(--color-accent)' : '1px solid var(--color-border)',
        opacity: cardOpacity,
      }}
    >
      <div style={{ borderLeft: allFilled ? '3px solid var(--color-green)' : '3px solid transparent' }}>
        {/* Row 1: Status + Name + Total + Delete */}
        <div className="flex items-center gap-2 px-2.5 pt-2 pb-0.5">
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

          {/* Exercise name — full width, no truncation fight with pills */}
          <div className="flex-1 min-w-0">
            {onRename ? (
              <button
                onClick={() => onRename(exercise.name)}
                className="text-sm font-semibold text-left flex items-center gap-1 max-w-full"
                style={{ color: 'var(--color-text)' }}
              >
                <span className="truncate">{exercise.name}</span>
                <ChevronDown size={10} className="shrink-0" style={{ color: 'var(--color-text-dim)', opacity: 0.6 }} />
              </button>
            ) : (
              <span
                className="text-sm font-semibold truncate block"
                style={{ color: 'var(--color-text)' }}
              >
                {exercise.name}
              </span>
            )}
          </div>

          {/* Total reps */}
          <span
            className="text-xs font-bold shrink-0"
            style={{ color: totalReps > 0 ? 'var(--color-accent)' : 'var(--color-text-dim)' }}
          >
            {deadhang ? `${totalReps}s` : totalReps}
          </span>

          {/* Delete exercise */}
          {onRemove && (
            <button
              onClick={() => onRemove(exercise.name)}
              className="p-0.5 shrink-0"
              aria-label={`Remove ${exercise.name}`}
            >
              <X size={12} style={{ color: 'var(--color-text-dim)' }} />
            </button>
          )}
        </div>

        {/* Row 2: Set pills + Add/Remove */}
        <div className="flex items-center gap-1.5 px-2.5 py-1.5 pl-10 flex-wrap">
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
                className="w-11 h-8 text-center text-sm font-semibold rounded-md border-0 outline-none"
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
            className="w-7 h-7 rounded-md flex items-center justify-center shrink-0"
            style={{ backgroundColor: 'var(--color-surface-hover)' }}
            aria-label="Add set"
          >
            <Plus size={11} style={{ color: 'var(--color-text-muted)' }} />
          </button>

          {/* Remove last set */}
          {sets.length > 1 && (
            <button
              onClick={handleRemoveLastSet}
              className="w-7 h-7 rounded-md flex items-center justify-center shrink-0"
              style={{ backgroundColor: 'var(--color-surface-hover)' }}
              aria-label="Remove last set"
            >
              <Minus size={11} style={{ color: 'var(--color-text-dim)' }} />
            </button>
          )}
        </div>

        {/* Row 3: Always-visible notes field */}
        <div className="px-2.5 pb-2 pl-10">
          <input
            type="text"
            value={exercise.notes || ''}
            onChange={(e) => handleNoteChange(e.target.value)}
            placeholder="Note..."
            className="w-full text-xs py-1 px-0 border-0 outline-none"
            style={{
              backgroundColor: 'transparent',
              color: exercise.notes ? 'var(--color-text-muted)' : 'var(--color-text-dim)',
              borderBottom: exercise.notes ? '1px solid var(--color-border)' : '1px solid transparent',
              fontStyle: exercise.notes ? 'normal' : 'italic',
              opacity: exercise.notes ? 1 : 0.5,
            }}
          />
        </div>
      </div>
    </div>
  );
}
