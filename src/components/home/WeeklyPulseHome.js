'use client';

import { useState, useMemo, useRef, useCallback, useEffect } from 'react';
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
  const gramsInputRef = useRef(null);

  // Lock body scroll when protein overlay is open
  useEffect(() => {
    if (showProteinForm) {
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = ''; };
    }
  }, [showProteinForm]);

  // Hidden proxy input that lives in the DOM permanently.
  // We focus it synchronously on tap (keeps iOS gesture chain alive),
  // then transfer focus to the real grams input after the overlay renders.
  const proxyInputRef = useRef(null);

  const handleOpenProteinForm = useCallback(() => {
    // Step 1: Synchronously focus the hidden proxy — this "activates" the keyboard on iOS
    if (proxyInputRef.current) {
      proxyInputRef.current.focus();
    }
    // Step 2: Open the overlay (React will re-render)
    setShowProteinForm(true);
  }, []);

  // Callback ref on the real grams input: transfer focus from proxy once mounted
  const gramsRefCallback = useCallback((node) => {
    if (node) {
      gramsInputRef.current = node;
      // Transfer focus from proxy to real input
      requestAnimationFrame(() => {
        node.focus();
      });
    }
  }, []);

  const proteinEntries = useMemo(() => proteinData ? proteinData.entries : [], [proteinData]);

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

  // Refs for scrolling to expanded card
  const cardRefs = useRef({});

  const handleToggle = (workoutId) => {
    setExpandedId(prev => {
      const next = prev === workoutId ? null : workoutId;
      // After React renders the expanded card, scroll it into view
      if (next !== null) {
        requestAnimationFrame(() => {
          setTimeout(() => {
            const el = cardRefs.current[next];
            if (el) {
              // Measure the actual fixed header height (includes safe-area-inset-top)
              const header = document.querySelector('header');
              const headerHeight = header ? header.getBoundingClientRect().height : 56;
              const gap = 8; // small gap below header
              const elRect = el.getBoundingClientRect();
              // scrollBy the distance from card top to just below header
              window.scrollBy({ top: elRect.top - headerHeight - gap, behavior: 'smooth' });
            }
          }, 50);
        });
      }
      return next;
    });
  };

  const todayStr = getTodayStr();

  const thisWeekDates = useMemo(() => getWeekDates(0), []);
  const lastWeekDates = useMemo(() => getWeekDates(-1), []);

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
    <div
      className="px-3 pt-0.5 flex flex-col"
      style={{ minHeight: 'calc(100dvh - 3.5rem - 4rem - env(safe-area-inset-top) - env(safe-area-inset-bottom))' }}
    >
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
      <div className="flex-1 flex flex-col mb-1.5">
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
            className="rounded-xl p-6 text-center flex-1 flex flex-col items-center justify-center"
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
          <div className={expandedId ? "flex flex-col gap-1" : "flex-1 flex flex-col gap-1"}>
            {recentWorkouts.map(workout => (
              <div
                key={workout.id}
                ref={el => { cardRefs.current[workout.id] = el; }}
                className={expandedId ? "flex flex-col" : "flex-1 flex flex-col min-h-0"}
              >
                {expandedId === workout.id ? (
                  <InlineExpandedWorkout
                    workout={workout}
                    onToggle={() => handleToggle(workout.id)}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    presets={presets}
                  />
                ) : (
                  <CompactWorkoutCard
                    workout={workout}
                    isExpanded={false}
                    onToggle={() => handleToggle(workout.id)}
                    presets={presets}
                    proteinGrams={proteinByDate[workout.date] || 0}
                    fillHeight={!expandedId}
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Protein Today ── */}
      <div
        className="rounded-xl overflow-hidden mb-1.5"
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
            onClick={() => showProteinForm ? setShowProteinForm(false) : handleOpenProteinForm()}
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ backgroundColor: 'var(--color-green, #22c55e)', color: '#ffffff' }}
          >
            {showProteinForm ? <X size={18} /> : <Plus size={18} />}
          </button>
        </div>
      </div>

      {/* Hidden proxy input — always in DOM so we can focus it synchronously on tap
           to keep iOS keyboard gesture chain alive */}
      <input
        ref={proxyInputRef}
        type="number"
        inputMode="numeric"
        aria-hidden="true"
        tabIndex={-1}
        style={{ position: 'fixed', left: -9999, top: -9999, opacity: 0, width: 0, height: 0, pointerEvents: 'none' }}
      />

      {/* ── Protein Quick-Add Overlay ── */}
      {showProteinForm && (
        <>
          {/* Backdrop — covers everything including header and nav */}
          <div
            className="fixed inset-0"
            style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 10010 }}
            onClick={() => setShowProteinForm(false)}
          />
          {/* Form panel — fixed at bottom, covers nav */}
          <div
            className="fixed left-0 right-0 px-4 pt-4 rounded-t-2xl"
            style={{
              bottom: 0,
              paddingBottom: 'calc(1rem + env(safe-area-inset-bottom))',
              backgroundColor: 'var(--color-surface)',
              zIndex: 10011,
              boxShadow: '0 -4px 20px rgba(0,0,0,0.3)',
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-bold" style={{ color: 'var(--color-green, #22c55e)' }}>
                Quick Add Protein
              </span>
              <button
                onClick={() => setShowProteinForm(false)}
                className="p-1 rounded-lg"
              >
                <X size={16} style={{ color: 'var(--color-text-dim)' }} />
              </button>
            </div>
            <div className="flex gap-2">
              <input
                ref={gramsRefCallback}
                type="number"
                value={grams}
                onChange={(e) => setGrams(e.target.value)}
                placeholder="Grams"
                className="w-20 text-sm px-3 py-2.5 rounded-lg bg-transparent border"
                style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
                inputMode="numeric"
                autoFocus
              />
              <input
                type="text"
                value={food}
                onChange={(e) => setFood(e.target.value)}
                placeholder="Food (optional)"
                className="flex-1 text-sm px-3 py-2.5 rounded-lg bg-transparent border"
                style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
                onKeyDown={(e) => e.key === 'Enter' && handleProteinSubmit()}
              />
            </div>
            <button
              onClick={handleProteinSubmit}
              disabled={!grams || parseInt(grams, 10) <= 0}
              className="w-full mt-3 py-2.5 rounded-lg text-sm font-bold"
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
        </>
      )}

    </div>
  );
}
