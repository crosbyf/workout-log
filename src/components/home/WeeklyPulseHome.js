'use client';

import { useState, useMemo, useRef, useCallback } from 'react';
import { Plus, X, Dumbbell, Footprints, ChevronLeft, ChevronRight } from 'lucide-react';
import { calculateTotalReps } from '@/utils/exercise';
import { getTodayStr } from '@/utils/format';
import { PRESET_COLORS } from '@/hooks/usePresets';
import CompactWorkoutCard from './CompactWorkoutCard';
import InlineExpandedWorkout from './InlineExpandedWorkout';

const DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const VIEW_LABELS = ['THIS WEEK', 'LAST WEEK', '12-WEEK AVG'];

/**
 * Get Mon–Sun dates for a week offset from today (0 = this week, -1 = last week).
 */
function getWeekDates(offset) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dayOfWeek = (today.getDay() + 6) % 7;
  const monday = new Date(today);
  monday.setDate(today.getDate() - dayOfWeek + offset * 7);

  const dates = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    dates.push(`${y}-${m}-${dd}`);
  }
  return dates;
}

const RUN_COLOR = '#f59e0b';

/**
 * Compute stats for a given set of week dates.
 */
function computeWeekStats(allWorkouts, weekDates, allProteinEntries, presetsList) {
  const weekWorkouts = allWorkouts.filter(
    w => weekDates.includes(w.date) && !w.isDayOff
  );
  const count = weekWorkouts.length;
  const totalReps = weekWorkouts.reduce(
    (sum, w) => sum + calculateTotalReps(w.exercises), 0
  );
  const totalTime = weekWorkouts.reduce(
    (sum, w) => sum + (w.elapsedTime || 0), 0
  );
  const totalMiles = weekWorkouts.reduce(
    (sum, w) => sum + (w.isRun ? (w.runDistance || 0) : 0), 0
  );

  const proteinByDate = {};
  for (const e of allProteinEntries) {
    if (weekDates.includes(e.date)) {
      proteinByDate[e.date] = (proteinByDate[e.date] || 0) + (e.grams || 0);
    }
  }
  const proteinDays = Object.keys(proteinByDate);
  const proteinTotal = proteinDays.reduce((sum, d) => sum + proteinByDate[d], 0);
  const proteinAvg = proteinDays.length > 0 ? Math.round(proteinTotal / proteinDays.length) : 0;

  // Build per-date dot arrays (like CalendarStrip) — supports multiple workouts per day
  const dayOffDateSet = new Set();
  const dateDots = {}; // date → array of { color, isRun }
  for (const w of allWorkouts) {
    if (!weekDates.includes(w.date)) continue;
    if (w.isDayOff) {
      dayOffDateSet.add(w.date);
      continue;
    }
    if (!dateDots[w.date]) dateDots[w.date] = [];
    if (w.isRun) {
      dateDots[w.date].push({ color: RUN_COLOR, isRun: true });
    } else {
      dateDots[w.date].push({ color: getColorForWorkout(w.location, presetsList), isRun: false });
    }
  }

  return { count, totalReps, totalTime, totalMiles, proteinAvg, dayOffDateSet, dateDots };
}

function getColorForWorkout(location, presetsList) {
  if (presetsList && presetsList.length > 0) {
    const preset = presetsList.find(p => p.name === location);
    if (preset && preset.color) {
      return PRESET_COLORS[preset.color] || 'var(--color-accent)';
    }
  }
  return 'var(--color-accent)';
}

export default function WeeklyPulseHome({
  workouts = [],
  onEdit,
  onDelete,
  onStartWorkout,
  proteinData,
  presets = [],
  onOpenProteinDetail,
}) {
  const [expandedId, setExpandedId] = useState(null);
  const [viewIndex, setViewIndex] = useState(0);

  const [showProteinForm, setShowProteinForm] = useState(false);
  const [grams, setGrams] = useState('');
  const [food, setFood] = useState('');

  const proteinEntries = proteinData ? proteinData.entries : [];

  // Swipe handling
  const touchStartX = useRef(0);
  const handleTouchStart = useCallback((e) => {
    touchStartX.current = e.touches[0].clientX;
  }, []);
  const handleTouchEnd = useCallback((e) => {
    const diff = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(diff) > 50) {
      setViewIndex(v => {
        if (diff < 0) return (v + 1) % 3;
        if (diff > 0) return (v + 2) % 3;
        return v;
      });
    }
  }, []);

  const handleToggle = (workoutId) => {
    setExpandedId(prev => prev === workoutId ? null : workoutId);
  };

  const todayStr = getTodayStr();

  const thisWeekDates = useMemo(() => getWeekDates(0), [todayStr]);
  const lastWeekDates = useMemo(() => getWeekDates(-1), [todayStr]);

  const thisWeekStats = useMemo(
    () => computeWeekStats(workouts, thisWeekDates, proteinEntries, presets),
    [workouts, thisWeekDates, proteinEntries, presets]
  );

  const lastWeekStats = useMemo(
    () => computeWeekStats(workouts, lastWeekDates, proteinEntries, presets),
    [workouts, lastWeekDates, proteinEntries, presets]
  );

  const twelveWeekStats = useMemo(() => {
    const allWeeks = [];
    for (let w = 0; w < 12; w++) {
      const dates = getWeekDates(-w);
      allWeeks.push(computeWeekStats(workouts, dates, proteinEntries, presets));
    }
    const activeWeeks = allWeeks.filter(w => w.count > 0);
    const weekCount = activeWeeks.length || 1;
    return {
      count: Math.round(activeWeeks.reduce((s, w) => s + w.count, 0) / weekCount * 10) / 10,
      totalReps: Math.round(activeWeeks.reduce((s, w) => s + w.totalReps, 0) / weekCount),
      totalTime: Math.round(activeWeeks.reduce((s, w) => s + w.totalTime, 0) / weekCount),
      totalMiles: Math.round(activeWeeks.reduce((s, w) => s + w.totalMiles, 0) / weekCount * 10) / 10,
      proteinAvg: Math.round(activeWeeks.reduce((s, w) => s + w.proteinAvg, 0) / weekCount),
      dayOffDateSet: new Set(),
      dateDots: {},
    };
  }, [workouts, proteinEntries, presets]);

  const currentStats = viewIndex === 0
    ? thisWeekStats
    : viewIndex === 1
      ? lastWeekStats
      : twelveWeekStats;

  const currentDates = viewIndex === 0 ? thisWeekDates : viewIndex === 1 ? lastWeekDates : null;
  const showDots = viewIndex < 2;

  const todayProteinTotal = useMemo(() => {
    return proteinEntries
      .filter(e => e.date === todayStr)
      .reduce((sum, e) => sum + (e.grams || 0), 0);
  }, [proteinEntries, todayStr]);

  const recentWorkouts = useMemo(() => {
    return workouts.slice(0, 5);
  }, [workouts]);

  const proteinByDate = useMemo(() => {
    const map = {};
    for (const entry of proteinEntries) {
      map[entry.date] = (map[entry.date] || 0) + (entry.grams || 0);
    }
    return map;
  }, [proteinEntries]);

  const handleProteinSubmit = () => {
    const g = parseInt(grams, 10);
    if (!g || g <= 0) return;
    proteinData.addEntry({ grams: g, food: food.trim() });
    setGrams('');
    setFood('');
    setShowProteinForm(false);
  };

  return (
    <div className="px-3 pb-1 pt-0.5">
      {/* ── Scoreboard ── */}
      <div
        className="rounded-xl px-3 pt-2 pb-1.5 mt-1 mb-2"
        style={{ backgroundColor: 'var(--color-surface)' }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Header with nav arrows — cycle continuously */}
        <div className="flex items-center justify-between mb-1">
          <button
            onClick={() => setViewIndex(v => (v + 2) % 3)}
            className="p-0.5 rounded-lg"
            style={{ color: 'var(--color-accent)' }}
          >
            <ChevronLeft size={16} />
          </button>
          <span
            className="text-[10px] font-bold tracking-wider"
            style={{ color: 'var(--color-text-dim)' }}
          >
            {VIEW_LABELS[viewIndex]}
          </span>
          <button
            onClick={() => setViewIndex(v => (v + 1) % 3)}
            className="p-0.5 rounded-lg"
            style={{ color: 'var(--color-accent)' }}
          >
            <ChevronRight size={16} />
          </button>
        </div>

        {/* Big numbers row: reps, miles, time, avg protein — GORS colors */}
        <div className="flex items-start justify-between mb-0.5">
          <div className="text-center flex-1">
            <div
              className="text-2xl font-bold leading-none"
              style={{ color: '#4a9eff' }}
            >
              {currentStats.totalReps}
            </div>
            <div className="text-[9px] mt-0.5 font-medium" style={{ color: 'var(--color-text-dim)' }}>
              reps
            </div>
          </div>

          <div className="text-center flex-1">
            <div
              className="text-2xl font-bold leading-none"
              style={{ color: '#f59e0b' }}
            >
              {currentStats.totalMiles > 0
                ? (currentStats.totalMiles % 1 === 0
                  ? currentStats.totalMiles
                  : currentStats.totalMiles.toFixed(1))
                : '—'
              }
            </div>
            <div className="text-[9px] mt-0.5 font-medium" style={{ color: 'var(--color-text-dim)' }}>
              miles
            </div>
          </div>

          <div className="text-center flex-1">
            <div
              className="text-2xl font-bold leading-none"
              style={{ color: '#a855f7' }}
            >
              {currentStats.totalTime > 0
                ? `${Math.floor(currentStats.totalTime / 60)}m`
                : '—'
              }
            </div>
            <div className="text-[9px] mt-0.5 font-medium" style={{ color: 'var(--color-text-dim)' }}>
              time
            </div>
          </div>

          <div className="text-center flex-1">
            <div
              className="text-2xl font-bold leading-none"
              style={{ color: '#22c55e' }}
            >
              {currentStats.proteinAvg > 0 ? currentStats.proteinAvg : '—'}
            </div>
            <div className="text-[9px] mt-0.5 font-medium" style={{ color: 'var(--color-text-dim)' }}>
              avg protein
            </div>
          </div>
        </div>

        {/* Week dots (This Week and Last Week only) — multi-dot like CalendarStrip */}
        {showDots && currentDates && (
          <div className="flex items-center justify-between px-1 mt-1.5 mb-0.5">
            {DAYS.map((label, i) => {
              const dateStr = currentDates[i];
              const isToday = dateStr === todayStr;
              const dots = currentStats.dateDots[dateStr] || [];
              const isDayOff = currentStats.dayOffDateSet.has(dateStr);
              const isPast = dateStr < todayStr;
              const hasActivity = dots.length > 0;

              return (
                <div key={i} className="flex flex-col items-center gap-0.5">
                  <span
                    className="text-[9px] font-medium"
                    style={{
                      color: isToday ? 'var(--color-accent)' : 'var(--color-text-dim)',
                      fontWeight: isToday ? 700 : 500,
                    }}
                  >
                    {label}
                  </span>
                  {hasActivity ? (
                    /* Multiple dots stacked/side-by-side for each workout */
                    <div className="w-5 h-5 flex items-center justify-center gap-0.5 flex-wrap">
                      {dots.slice(0, 4).map((dot, di) => (
                        <div
                          key={di}
                          className="rounded-full flex items-center justify-center"
                          style={{
                            width: dots.length === 1 ? '20px' : dots.length <= 2 ? '9px' : '8px',
                            height: dots.length === 1 ? '20px' : dots.length <= 2 ? '9px' : '8px',
                            backgroundColor: dot.color,
                          }}
                        >
                          {dots.length === 1 && (
                            dot.isRun
                              ? <Footprints size={9} color="#ffffff" />
                              : <Dumbbell size={9} color="#ffffff" />
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div
                      className="w-5 h-5 rounded-full flex items-center justify-center"
                      style={{
                        backgroundColor: isDayOff ? 'var(--color-surface-hover)' : 'transparent',
                        border: isToday
                          ? '2px solid var(--color-accent)'
                          : isPast
                            ? '1px solid var(--color-border)'
                            : '1px dashed var(--color-border)',
                      }}
                    >
                      {isDayOff && (
                        <span className="text-[7px]" style={{ color: 'var(--color-text-dim)' }}>—</span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* ── Recent Workouts ── */}
      <div className="mb-2">
        <div className="flex items-center justify-between mb-1 px-1">
          <span
            className="text-xs font-bold tracking-wider"
            style={{ color: 'var(--color-text-dim)' }}
          >
            RECENT
          </span>
        </div>

        {recentWorkouts.length === 0 ? (
          <div
            className="rounded-xl p-6 text-center"
            style={{ backgroundColor: 'var(--color-surface)' }}
          >
            <Dumbbell
              size={24}
              style={{ color: 'var(--color-text-dim)', margin: '0 auto 8px' }}
            />
            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
              No workouts yet
            </p>
            <button
              onClick={onStartWorkout}
              className="mt-3 px-4 py-2 rounded-lg text-sm font-bold"
              style={{ backgroundColor: 'var(--color-accent)', color: '#ffffff' }}
            >
              Start Workout
            </button>
          </div>
        ) : (
          <div>
            {recentWorkouts.map(workout => (
              expandedId === workout.id ? (
                <InlineExpandedWorkout
                  key={workout.id}
                  workout={workout}
                  onToggle={() => handleToggle(workout.id)}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  presets={presets}
                />
              ) : (
                <CompactWorkoutCard
                  key={workout.id}
                  workout={workout}
                  isExpanded={false}
                  onToggle={() => handleToggle(workout.id)}
                  presets={presets}
                  proteinGrams={proteinByDate[workout.date] || 0}
                />
              )
            ))}
          </div>
        )}
      </div>

      {/* ── Protein Today ── */}
      <div
        className="rounded-xl overflow-hidden"
        style={{ backgroundColor: 'var(--color-surface)' }}
      >
        <div className="p-4 flex items-center justify-between">
          <button
            onClick={onOpenProteinDetail}
            className="flex-1 text-left"
            style={{ outline: 'none' }}
          >
            <div className="text-xs font-medium mb-0.5" style={{ color: 'var(--color-text-dim)' }}>
              Protein Today
            </div>
            <div className="text-2xl font-bold" style={{ color: 'var(--color-green, #22c55e)' }}>
              {todayProteinTotal}g
            </div>
          </button>
          <button
            onClick={() => setShowProteinForm(!showProteinForm)}
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ backgroundColor: 'var(--color-green, #22c55e)', color: '#ffffff' }}
          >
            {showProteinForm ? <X size={18} /> : <Plus size={18} />}
          </button>
        </div>

        {showProteinForm && (
          <div className="px-4 pb-3" style={{ borderTop: '1px solid var(--color-border)' }}>
            <div className="flex gap-2 mt-3">
              <input
                type="number"
                value={grams}
                onChange={(e) => setGrams(e.target.value)}
                placeholder="Grams"
                className="w-20 text-sm px-3 py-2 rounded-lg bg-transparent border"
                style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
                inputMode="numeric"
              />
              <input
                type="text"
                value={food}
                onChange={(e) => setFood(e.target.value)}
                placeholder="Food (optional)"
                className="flex-1 text-sm px-3 py-2 rounded-lg bg-transparent border"
                style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
                onKeyDown={(e) => e.key === 'Enter' && handleProteinSubmit()}
              />
            </div>
            <button
              onClick={handleProteinSubmit}
              disabled={!grams || parseInt(grams, 10) <= 0}
              className="w-full mt-2 py-2 rounded-lg text-sm font-bold"
              style={{
                backgroundColor: !grams || parseInt(grams, 10) <= 0
                  ? 'var(--color-surface-hover)'
                  : 'var(--color-green, #22c55e)',
                color: !grams || parseInt(grams, 10) <= 0
                  ? 'var(--color-text-dim)'
                  : '#ffffff',
              }}
            >
              Add Protein
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
