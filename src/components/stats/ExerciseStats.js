'use client';

import { useState, useMemo } from 'react';
import { ChevronRight, ArrowLeft, TrendingUp, TrendingDown } from 'lucide-react';
import { getWeekKey } from '@/utils/format';

/**
 * Calculate stats for each exercise from all workouts.
 * Returns array of { name, sessions, avgReps, trend, totalReps }
 */
function calculateExerciseStats(workouts) {
  const exerciseMap = {};

  for (const w of workouts) {
    if (w.isDayOff) continue;
    for (const ex of w.exercises) {
      if (!exerciseMap[ex.name]) {
        exerciseMap[ex.name] = { sessions: [], totalReps: 0 };
      }
      const exReps = ex.sets.reduce((sum, s) => sum + (s.reps || 0), 0);
      exerciseMap[ex.name].sessions.push({ date: w.date, reps: exReps });
      exerciseMap[ex.name].totalReps += exReps;
    }
  }

  return Object.entries(exerciseMap)
    .map(([name, data]) => {
      const avgReps = Math.round(data.totalReps / data.sessions.length);

      // Trend: compare last 3 sessions avg to prior 3 sessions avg
      const sorted = data.sessions.sort((a, b) => b.date.localeCompare(a.date));
      let trend = null;
      if (sorted.length >= 4) {
        const recent3 = sorted.slice(0, 3).reduce((s, x) => s + x.reps, 0) / 3;
        const prior3 = sorted.slice(3, 6).reduce((s, x) => s + x.reps, 0) / Math.min(sorted.length - 3, 3);
        const diff = recent3 - prior3;
        trend = {
          direction: diff > 1 ? 'up' : diff < -1 ? 'down' : 'flat',
          delta: Math.round(Math.abs(diff)),
        };
      }

      return {
        name,
        sessions: data.sessions.length,
        avgReps,
        totalReps: data.totalReps,
        trend,
        sortedSessions: sorted,
      };
    })
    .sort((a, b) => b.sessions - a.sessions); // Most-used first
}

/**
 * Build weekly volume for a single exercise (last 12 weeks)
 */
function buildExerciseWeekly(sessions) {
  const now = new Date();
  const weekKeys = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i * 7);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const key = getWeekKey(`${y}-${m}-${day}`);
    if (!weekKeys.includes(key)) weekKeys.push(key);
  }

  const weekMap = {};
  for (const key of weekKeys) weekMap[key] = 0;

  for (const s of sessions) {
    const key = getWeekKey(s.date);
    if (weekMap[key] !== undefined) weekMap[key] += s.reps;
  }

  return weekKeys.map(key => ({ weekKey: key, reps: weekMap[key] }));
}

export default function ExerciseStats({ workouts = [] }) {
  const [selectedExercise, setSelectedExercise] = useState(null);

  const stats = useMemo(() => calculateExerciseStats(workouts), [workouts]);

  // Detail view for a single exercise
  if (selectedExercise) {
    const ex = stats.find(s => s.name === selectedExercise);
    if (!ex) {
      setSelectedExercise(null);
      return null;
    }

    const weeklyData = buildExerciseWeekly(ex.sortedSessions);
    const maxWeekly = Math.max(...weeklyData.map(w => w.reps), 1);

    // Personal record (highest single-session reps)
    const pr = Math.max(...ex.sortedSessions.map(s => s.reps));

    return (
      <div
        className="rounded-xl mb-4 overflow-hidden"
        style={{ backgroundColor: 'var(--color-surface)' }}
      >
        {/* Back header */}
        <button
          onClick={() => setSelectedExercise(null)}
          className="w-full flex items-center gap-2 p-4"
          style={{ borderBottom: '1px solid var(--color-border)' }}
        >
          <ArrowLeft size={16} style={{ color: 'var(--color-accent)' }} />
          <span className="text-sm font-bold" style={{ color: 'var(--color-text)' }}>
            {ex.name}
          </span>
        </button>

        {/* Summary stats */}
        <div className="grid grid-cols-3 gap-2 p-4">
          <div className="text-center">
            <div className="text-lg font-bold" style={{ color: 'var(--color-text)' }}>{ex.sessions}</div>
            <div className="text-[10px]" style={{ color: 'var(--color-text-dim)' }}>Sessions</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold" style={{ color: 'var(--color-text)' }}>{ex.avgReps}</div>
            <div className="text-[10px]" style={{ color: 'var(--color-text-dim)' }}>Avg Reps</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold" style={{ color: 'var(--color-yellow)' }}>{pr}</div>
            <div className="text-[10px]" style={{ color: 'var(--color-text-dim)' }}>PR</div>
          </div>
        </div>

        {/* Mini weekly bar chart */}
        <div className="px-4 pb-4">
          <div className="text-xs font-medium mb-2" style={{ color: 'var(--color-text-dim)' }}>
            Weekly Volume (12 weeks)
          </div>
          <div className="flex items-end gap-0.5" style={{ height: '64px' }}>
            {weeklyData.map((week, idx) => {
              const heightPct = week.reps > 0 ? (week.reps / maxWeekly) * 100 : 0;
              return (
                <div
                  key={idx}
                  className="flex-1 flex flex-col items-center justify-end h-full"
                >
                  {week.reps > 0 && (
                    <span className="text-[7px] mb-0.5" style={{ color: 'var(--color-text-dim)' }}>
                      {week.reps}
                    </span>
                  )}
                  <div
                    className="w-full rounded-t-sm"
                    style={{
                      height: `${Math.max(heightPct, 2)}%`,
                      backgroundColor: week.reps > 0 ? 'var(--color-accent)' : 'var(--color-surface-hover)',
                      opacity: week.reps > 0 ? 1 : 0.3,
                      minHeight: '2px',
                    }}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent sessions */}
        <div className="px-4 pb-3" style={{ borderTop: '1px solid var(--color-border)' }}>
          <div className="text-xs font-medium mt-3 mb-2" style={{ color: 'var(--color-text-dim)' }}>
            Last 10 Sessions
          </div>
          {ex.sortedSessions.slice(0, 10).map((session, idx) => (
            <div key={idx} className="flex items-center justify-between py-1">
              <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                {session.date}
              </span>
              <span
                className="text-xs font-medium"
                style={{
                  color: session.reps === pr ? 'var(--color-yellow)' : 'var(--color-text)',
                }}
              >
                {session.reps} reps {session.reps === pr ? '★' : ''}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Exercise list view
  if (stats.length === 0) return null;

  return (
    <div
      className="rounded-xl mb-4 overflow-hidden"
      style={{ backgroundColor: 'var(--color-surface)' }}
    >
      <div className="p-4 pb-2">
        <span className="text-sm font-bold" style={{ color: 'var(--color-text)' }}>
          Exercise Stats
        </span>
      </div>

      {stats.map((ex, idx) => (
        <button
          key={ex.name}
          onClick={() => setSelectedExercise(ex.name)}
          className="w-full flex items-center justify-between px-4 py-2.5"
          style={{
            borderTop: idx > 0 ? '1px solid var(--color-border)' : 'none',
          }}
        >
          <div className="flex-1 text-left">
            <div className="text-sm" style={{ color: 'var(--color-text)' }}>
              {ex.name}
            </div>
            <div className="text-xs" style={{ color: 'var(--color-text-dim)' }}>
              {ex.sessions} sessions · {ex.avgReps} avg reps
            </div>
          </div>
          <div className="flex items-center gap-2">
            {ex.trend && ex.trend.direction !== 'flat' && (
              <span
                className="flex items-center gap-0.5 text-xs font-medium"
                style={{
                  color: ex.trend.direction === 'up' ? 'var(--color-green)' : 'var(--color-red)',
                }}
              >
                {ex.trend.direction === 'up' ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                {ex.trend.delta}
              </span>
            )}
            <ChevronRight size={14} style={{ color: 'var(--color-text-dim)' }} />
          </div>
        </button>
      ))}
    </div>
  );
}
