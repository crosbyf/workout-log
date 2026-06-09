'use client';

import { useState, useMemo } from 'react';
import { BarChart3 } from 'lucide-react';
import { getWeekKey, getWeekLabel } from '@/utils/format';

const WEEK_OPTIONS = [6, 8, 12];

/**
 * Build weekly volume data from workouts.
 * Returns array of { weekKey, label, total, exercises: { name: reps } }
 */
function buildWeeklyVolume(workouts, numWeeks) {
  // Generate week keys going back from today
  const now = new Date();
  const weekKeys = [];
  for (let i = numWeeks - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i * 7);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const key = getWeekKey(`${y}-${m}-${day}`);
    if (!weekKeys.includes(key)) weekKeys.push(key);
  }

  // Build a map of weekKey → { total, exercises }
  const weekMap = {};
  for (const key of weekKeys) {
    weekMap[key] = { total: 0, exercises: {} };
  }

  for (const w of workouts) {
    if (w.isDayOff) continue;
    const key = getWeekKey(w.date);
    if (!weekMap[key]) continue; // Outside range
    for (const ex of w.exercises) {
      const exReps = ex.sets.reduce((sum, s) => sum + (s.reps || 0), 0);
      weekMap[key].total += exReps;
      weekMap[key].exercises[ex.name] = (weekMap[key].exercises[ex.name] || 0) + exReps;
    }
  }

  return weekKeys.map(key => ({
    weekKey: key,
    ...weekMap[key],
  }));
}

export default function VolumeChart({ workouts = [] }) {
  const [numWeeks, setNumWeeks] = useState(8);

  const weeklyData = useMemo(
    () => buildWeeklyVolume(workouts, numWeeks),
    [workouts, numWeeks]
  );

  const maxTotal = useMemo(
    () => Math.max(...weeklyData.map(w => w.total), 1),
    [weeklyData]
  );

  if (workouts.filter(w => !w.isDayOff).length === 0) {
    return null;
  }

  return (
    <div
      className="rounded-xl p-4 mb-4"
      style={{ backgroundColor: 'var(--color-surface)' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <BarChart3 size={16} style={{ color: 'var(--color-accent)' }} />
          <span className="text-sm font-bold" style={{ color: 'var(--color-text)' }}>
            Weekly Volume
          </span>
        </div>
        <div className="flex gap-1">
          {WEEK_OPTIONS.map(n => (
            <button
              key={n}
              onClick={() => setNumWeeks(n)}
              className="text-xs px-2 py-1 rounded-md font-medium"
              style={{
                backgroundColor: numWeeks === n ? 'var(--color-accent)' : 'var(--color-surface-hover)',
                color: numWeeks === n ? '#ffffff' : 'var(--color-text-dim)',
              }}
            >
              {n}w
            </button>
          ))}
        </div>
      </div>

      {/* Bar chart */}
      <div className="flex items-end gap-1" style={{ height: '120px' }}>
        {weeklyData.map((week, idx) => {
          const heightPct = week.total > 0 ? (week.total / maxTotal) * 100 : 0;
          return (
            <div
              key={idx}
              className="flex-1 flex flex-col items-center justify-end h-full"
            >
              {/* Reps label on top of bar */}
              {week.total > 0 && (
                <span
                  className="text-[8px] font-medium mb-0.5"
                  style={{ color: 'var(--color-text-dim)' }}
                >
                  {week.total}
                </span>
              )}
              {/* Bar */}
              <div
                className="w-full rounded-t-sm transition-all"
                style={{
                  height: `${Math.max(heightPct, 2)}%`,
                  backgroundColor: week.total > 0 ? 'var(--color-accent)' : 'var(--color-surface-hover)',
                  opacity: week.total > 0 ? 1 : 0.3,
                  minHeight: '2px',
                }}
              />
            </div>
          );
        })}
      </div>

      {/* Week labels */}
      <div className="flex gap-1 mt-1">
        {weeklyData.map((week, idx) => (
          <div key={idx} className="flex-1 text-center">
            <span
              className="text-[7px]"
              style={{ color: 'var(--color-text-dim)' }}
            >
              W{week.weekKey.split('-W')[1]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
