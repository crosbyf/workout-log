'use client';

import { useEffect, useState, useRef, useMemo } from 'react';
import { X, Clock } from 'lucide-react';
import { formatDate, formatDuration } from '@/utils/format';
import { PRESET_COLORS } from '@/hooks/usePresets';
import { isDeadhang, calculateTotalReps } from '@/utils/exercise';

function getColor(location, presets) {
  const preset = presets.find(p => p.name === location);
  if (preset && preset.color) return PRESET_COLORS[preset.color] || 'var(--color-accent)';
  return 'var(--color-accent)';
}

/**
 * Full-screen comparison overlay showing two workouts side by side.
 */
export default function WorkoutCompare({ workoutA, workoutB, presets, onClose }) {
  const [visible, setVisible] = useState(false);
  const sheetRef = useRef(null);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    const timer = window.setTimeout(() => setVisible(true), 20);
    return () => {
      window.clearTimeout(timer);
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, []);

  const handleClose = () => {
    setVisible(false);
    window.setTimeout(() => onClose(), 250);
  };

  const colorA = getColor(workoutA.location, presets);
  const colorB = getColor(workoutB.location, presets);
  const totalRepsA = calculateTotalReps(workoutA.exercises);
  const totalRepsB = calculateTotalReps(workoutB.exercises);

  // Build a unified exercise list (union of both workouts)
  const exerciseComparison = useMemo(() => {
    const allNames = new Set();
    workoutA.exercises.forEach(ex => allNames.add(ex.name));
    workoutB.exercises.forEach(ex => allNames.add(ex.name));

    return [...allNames].map(name => {
      const exA = workoutA.exercises.find(e => e.name === name);
      const exB = workoutB.exercises.find(e => e.name === name);
      const dh = isDeadhang(name);

      const totalA = exA ? exA.sets.reduce((sum, s) => sum + (s.reps || 0), 0) : 0;
      const totalB = exB ? exB.sets.reduce((sum, s) => sum + (s.reps || 0), 0) : 0;
      const setsA = exA ? exA.sets.length : 0;
      const setsB = exB ? exB.sets.length : 0;

      const diff = totalB - totalA;
      return { name, totalA, totalB, setsA, setsB, diff, dh };
    });
  }, [workoutA, workoutB]);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0"
        style={{
          backgroundColor: visible ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0)',
          transition: 'background-color 0.25s ease',
          touchAction: 'none',
          zIndex: 10000,
        }}
        onClick={handleClose}
      />
      {/* Sheet */}
      <div
        ref={sheetRef}
        className="fixed"
        style={{
          zIndex: 10001,
          bottom: 0,
          left: 0,
          right: 0,
          maxHeight: '90vh',
          backgroundColor: 'var(--color-bg)',
          borderRadius: '1rem 1rem 0 0',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          transform: visible ? 'translateY(0)' : 'translateY(100%)',
          transition: 'transform 0.25s ease-out',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-2 pb-1" style={{ flexShrink: 0 }}>
          <div className="w-10 h-1 rounded-full" style={{ backgroundColor: 'var(--color-border)' }} />
        </div>

        {/* Header */}
        <div
          className="flex items-center justify-between px-4 py-2"
          style={{ borderBottom: '1px solid var(--color-border)', flexShrink: 0 }}
        >
          <h2 className="text-sm font-bold" style={{ color: 'var(--color-text)' }}>
            Compare Workouts
          </h2>
          <button onClick={handleClose} className="p-1" aria-label="Close">
            <X size={20} style={{ color: 'var(--color-text-muted)' }} />
          </button>
        </div>

        {/* Workout headers — two columns */}
        <div className="flex" style={{ borderBottom: '1px solid var(--color-border)', flexShrink: 0 }}>
          <div className="flex-1 px-3 py-2" style={{ borderRight: '1px solid var(--color-border)' }}>
            <div className="flex items-center gap-1.5 mb-0.5">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: colorA }} />
              <span className="text-xs font-bold" style={{ color: 'var(--color-text)' }}>
                {workoutA.location}
              </span>
            </div>
            <span className="text-[10px]" style={{ color: 'var(--color-text-dim)' }}>
              {formatDate(workoutA.date)}
            </span>
            <div className="flex items-center gap-2 mt-1 text-[10px]" style={{ color: 'var(--color-text-dim)' }}>
              <span>{totalRepsA} reps</span>
              {workoutA.elapsedTime > 0 && (
                <span className="flex items-center gap-0.5">
                  <Clock size={8} /> {formatDuration(workoutA.elapsedTime)}
                </span>
              )}
            </div>
          </div>
          <div className="flex-1 px-3 py-2">
            <div className="flex items-center gap-1.5 mb-0.5">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: colorB }} />
              <span className="text-xs font-bold" style={{ color: 'var(--color-text)' }}>
                {workoutB.location}
              </span>
            </div>
            <span className="text-[10px]" style={{ color: 'var(--color-text-dim)' }}>
              {formatDate(workoutB.date)}
            </span>
            <div className="flex items-center gap-2 mt-1 text-[10px]" style={{ color: 'var(--color-text-dim)' }}>
              <span>{totalRepsB} reps</span>
              {workoutB.elapsedTime > 0 && (
                <span className="flex items-center gap-0.5">
                  <Clock size={8} /> {formatDuration(workoutB.elapsedTime)}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Exercise comparison — scrollable */}
        <div
          className="overflow-y-auto"
          style={{
            WebkitOverflowScrolling: 'touch',
            paddingBottom: 'max(16px, env(safe-area-inset-bottom))',
          }}
        >
          {exerciseComparison.map((row, idx) => {
            const diffLabel = row.diff > 0
              ? `+${row.diff}${row.dh ? 's' : ''}`
              : row.diff < 0
                ? `${row.diff}${row.dh ? 's' : ''}`
                : '—';
            const diffColor = row.diff > 0
              ? 'var(--color-green, #22c55e)'
              : row.diff < 0
                ? 'var(--color-red, #ef4444)'
                : 'var(--color-text-dim)';

            return (
              <div
                key={row.name}
                style={{
                  borderBottom: idx < exerciseComparison.length - 1 ? '1px solid var(--color-border)' : 'none',
                }}
              >
                {/* Exercise name row */}
                <div className="px-3 pt-2 pb-1">
                  <span className="text-xs font-semibold" style={{ color: 'var(--color-text)' }}>
                    {row.name}
                  </span>
                </div>
                {/* Values row */}
                <div className="flex items-center px-3 pb-2">
                  <div className="flex-1 text-center">
                    <span
                      className="text-lg font-bold"
                      style={{ color: row.totalA > 0 ? 'var(--color-accent)' : 'var(--color-text-dim)' }}
                    >
                      {row.totalA > 0 ? `${row.totalA}${row.dh ? 's' : ''}` : '—'}
                    </span>
                    {row.totalA > 0 && (
                      <span className="text-[10px] ml-1" style={{ color: 'var(--color-text-dim)' }}>
                        ({row.setsA}s)
                      </span>
                    )}
                  </div>
                  <div
                    className="px-2 py-0.5 rounded-full text-[10px] font-bold"
                    style={{
                      color: diffColor,
                      backgroundColor: row.diff !== 0 ? `${diffColor}15` : 'transparent',
                    }}
                  >
                    {diffLabel}
                  </div>
                  <div className="flex-1 text-center">
                    <span
                      className="text-lg font-bold"
                      style={{ color: row.totalB > 0 ? 'var(--color-accent)' : 'var(--color-text-dim)' }}
                    >
                      {row.totalB > 0 ? `${row.totalB}${row.dh ? 's' : ''}` : '—'}
                    </span>
                    {row.totalB > 0 && (
                      <span className="text-[10px] ml-1" style={{ color: 'var(--color-text-dim)' }}>
                        ({row.setsB}s)
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Summary row */}
          <div
            className="px-3 py-3"
            style={{ borderTop: '2px solid var(--color-border)' }}
          >
            <div className="flex items-center">
              <div className="flex-1 text-center">
                <span className="text-xl font-bold" style={{ color: 'var(--color-accent)' }}>
                  {totalRepsA}
                </span>
                <span className="text-[10px] ml-1" style={{ color: 'var(--color-text-dim)' }}>total</span>
              </div>
              <div
                className="px-2 py-0.5 rounded-full text-xs font-bold"
                style={{
                  color: totalRepsB - totalRepsA > 0
                    ? 'var(--color-green, #22c55e)'
                    : totalRepsB - totalRepsA < 0
                      ? 'var(--color-red, #ef4444)'
                      : 'var(--color-text-dim)',
                }}
              >
                {totalRepsB - totalRepsA > 0 ? `+${totalRepsB - totalRepsA}` : totalRepsB - totalRepsA < 0 ? `${totalRepsB - totalRepsA}` : '='}
              </div>
              <div className="flex-1 text-center">
                <span className="text-xl font-bold" style={{ color: 'var(--color-accent)' }}>
                  {totalRepsB}
                </span>
                <span className="text-[10px] ml-1" style={{ color: 'var(--color-text-dim)' }}>total</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
