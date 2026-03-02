'use client';

import { useState } from 'react';
import { X, Plus, Pencil } from 'lucide-react';
import { isDeadhang, formatRepValue } from '@/utils/exercise';

export default function ExerciseCard({ exercise, onUpdate, onRemove, disabled = false }) {
  const [showNote, setShowNote] = useState(!!exercise.notes);

  const sets = exercise.sets || [];
  const deadhang = isDeadhang(exercise.name);
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

  return (
    <div
      className="py-1.5 px-3 rounded-lg mb-1"
      style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
    >
      {/* Header row: name + set labels + total + remove */}
      <div className="flex items-center justify-between">
        <span
          className="text-sm font-semibold truncate flex-1 min-w-0"
          style={{ color: 'var(--color-text)' }}
        >
          {exercise.name}
        </span>
        <span
          className="text-sm font-bold min-w-[32px] text-right mr-1.5"
          style={{ color: totalReps > 0 ? 'var(--color-accent)' : 'var(--color-text-dim)' }}
        >
          {deadhang ? `${totalReps}s` : totalReps}
        </span>
        <button
          onClick={() => onRemove(exercise.name)}
          className="p-0.5 rounded"
          aria-label={`Remove ${exercise.name}`}
        >
          <X size={12} style={{ color: 'var(--color-text-dim)' }} />
        </button>
      </div>

      {/* Set inputs in a single row — no separate label row */}
      <div className="flex items-center gap-1 mt-1 flex-wrap">
        {sets.map((set, i) => {
          const filled = set.reps !== '' && set.reps !== 0 && set.reps !== null;
          return (
            <input
              key={i}
              type="number"
              inputMode="numeric"
              value={set.reps === '' || set.reps === null ? '' : set.reps}
              onChange={(e) => handleSetChange(i, e.target.value)}
              disabled={disabled}
              className="w-10 h-8 text-center text-sm font-semibold rounded-md border-0 outline-none"
              style={{
                backgroundColor: filled ? 'var(--color-green-soft)' : 'var(--color-surface-hover)',
                color: filled ? '#ffffff' : 'var(--color-text)',
                border: filled ? 'none' : '1px solid var(--color-border)',
                opacity: disabled ? 0.4 : 1,
              }}
              placeholder={deadhang ? 's' : '0'}
            />
          );
        })}

        {/* Add set button */}
        <button
          onClick={handleAddSet}
          className="w-7 h-7 rounded-md flex items-center justify-center"
          style={{ backgroundColor: 'var(--color-surface-hover)' }}
          aria-label="Add set"
        >
          <Plus size={12} style={{ color: 'var(--color-text-muted)' }} />
        </button>

        {/* Remove last set (only if more than 1) */}
        {sets.length > 1 && (
          <button
            onClick={handleRemoveLastSet}
            className="w-7 h-7 rounded-md flex items-center justify-center"
            style={{ backgroundColor: 'var(--color-surface-hover)' }}
            aria-label="Remove last set"
          >
            <X size={10} style={{ color: 'var(--color-text-dim)' }} />
          </button>
        )}

        {/* Inline note toggle */}
        {!showNote && (
          <button
            onClick={() => setShowNote(true)}
            className="ml-auto"
          >
            <Pencil size={10} style={{ color: 'var(--color-text-dim)', opacity: 0.6 }} />
          </button>
        )}
      </div>

      {/* Note field — only when toggled open */}
      {showNote && (
        <input
          type="text"
          value={exercise.notes || ''}
          onChange={(e) => handleNoteChange(e.target.value)}
          placeholder="Note..."
          className="w-full text-xs py-1 px-2 mt-1 rounded border-0 outline-none"
          style={{
            backgroundColor: 'var(--color-surface-hover)',
            color: 'var(--color-text-muted)',
          }}
        />
      )}
    </div>
  );
}
