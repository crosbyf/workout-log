'use client';

import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { Dumbbell, GitCompareArrows, X, Check, Footprints } from 'lucide-react';
import EmptyState from '@/components/shared/EmptyState';
import WorkoutCard from './WorkoutCard';
import CalendarStrip from './CalendarStrip';
import WorkoutCompare from './WorkoutCompare';
import { getWeekKey, getWeekLabel } from '@/utils/format';

/**
 * Group workouts by ISO week (Mon-Sun), preserving date-descending order.
 */
function groupByWeek(workouts) {
  const groups = [];
  let currentKey = null;
  let currentGroup = null;

  for (const workout of workouts) {
    const key = getWeekKey(workout.date);
    if (key !== currentKey) {
      currentKey = key;
      currentGroup = {
        weekKey: key,
        label: getWeekLabel(workout.date),
        firstDate: workout.date,
        workouts: [],
      };
      groups.push(currentGroup);
    }
    currentGroup.workouts.push(workout);
  }

  return groups;
}

/**
 * Filter workouts by type: 'all', 'runs', or 'strength'
 * Day offs are always included.
 */
function filterByType(workouts, filter) {
  if (filter === 'all') return workouts;
  if (filter === 'runs') return workouts.filter(w => w.isRun || w.isDayOff);
  if (filter === 'strength') return workouts.filter(w => (!w.isRun && !w.isDayOff) || w.isDayOff);
  return workouts;
}

/**
 * Calculate month offset from today for a given date string
 */
function calcMonthOffset(dateStr) {
  const today = new Date();
  const [y, m] = dateStr.split('-').map(Number);
  return (y - today.getFullYear()) * 12 + (m - 1 - today.getMonth());
}

export default function LogTab({ workouts = [], allWorkouts = [], selectedDate, onSelectDate, onEdit, onDelete, onStartWorkout, proteinEntries = [], presets = [], workoutTypeFilter = 'all', onWorkoutTypeFilterChange }) {
  const [expandedId, setExpandedId] = useState(null);
  const [monthOffset, setMonthOffset] = useState(0);
  const [calendarCollapsed, setCalendarCollapsed] = useState(false);

  const setWorkoutTypeFilter = onWorkoutTypeFilterChange || (() => {});

  // Compare mode state
  const [compareMode, setCompareMode] = useState(false);
  const [compareSelections, setCompareSelections] = useState([]);
  const [showCompare, setShowCompare] = useState(false);

  // Scroll-sync refs
  const weekGroupRefs = useRef({});
  const isUserScrolling = useRef(true);
  const rafRef = useRef(null);
  const lastSyncedOffset = useRef(0);

  const handleToggleCompareMode = useCallback(() => {
    setCompareMode(prev => {
      if (prev) {
        setCompareSelections([]);
        return false;
      }
      setExpandedId(null);
      return true;
    });
  }, []);

  const handleCompareSelect = useCallback((workoutId) => {
    setCompareSelections(prev => {
      if (prev.includes(workoutId)) {
        return prev.filter(id => id !== workoutId);
      }
      if (prev.length >= 2) return prev;
      const next = [...prev, workoutId];
      if (next.length === 2) {
        window.setTimeout(() => setShowCompare(true), 150);
      }
      return next;
    });
  }, []);

  const handleCloseCompare = useCallback(() => {
    setShowCompare(false);
    setCompareSelections([]);
    setCompareMode(false);
  }, []);

  // Refs for scrolling to expanded card
  const logCardRefs = useRef({});
  const stickyBarRef = useRef(null);

  const handleToggle = (workoutId) => {
    if (expandedId === workoutId) {
      // Collapsing
      setExpandedId(null);
    } else {
      // Expanding — collapse calendar to give more room
      setExpandedId(workoutId);
      setCalendarCollapsed(true);
      // After React renders the expanded card, scroll it into view
      // Use 150ms to let the calendar collapse settle
      requestAnimationFrame(() => {
        setTimeout(() => {
          const el = logCardRefs.current[workoutId];
          if (el) {
            // Measure the bottom of the sticky bar (header + calendar + filters)
            const stickyBar = stickyBarRef.current;
            const stickyBottom = stickyBar
              ? stickyBar.getBoundingClientRect().bottom
              : 120; // fallback
            const gap = 8;
            const elRect = el.getBoundingClientRect();
            // Scroll so the card top sits just below the sticky bar
            window.scrollBy({ top: elRect.top - stickyBottom - gap, behavior: 'smooth' });
          }
        }, 150);
      });
    }
  };

  const handleMonthChange = useCallback((newOffset) => {
    isUserScrolling.current = false;
    setMonthOffset(newOffset);
    lastSyncedOffset.current = newOffset;
    const timer = window.setTimeout(() => {
      isUserScrolling.current = true;
    }, 600);
    return () => window.clearTimeout(timer);
  }, []);

  const handleToggleCollapse = useCallback(() => {
    setCalendarCollapsed(prev => !prev);
  }, []);

  // Apply type filter + date filter to feed workouts
  const displayWorkouts = useMemo(() => {
    let filtered = filterByType(workouts, workoutTypeFilter);
    if (selectedDate) {
      filtered = filtered.filter(w => w.date === selectedDate);
    }
    return filtered;
  }, [workouts, workoutTypeFilter, selectedDate]);

  // Apply type filter to calendar dot workouts
  const calendarWorkouts = useMemo(() => {
    return filterByType(allWorkouts, workoutTypeFilter);
  }, [allWorkouts, workoutTypeFilter]);

  // Build protein-by-date lookup
  const proteinByDate = useMemo(() => {
    const map = {};
    for (const entry of proteinEntries) {
      map[entry.date] = (map[entry.date] || 0) + (entry.grams || 0);
    }
    return map;
  }, [proteinEntries]);

  const weekGroups = groupByWeek(displayWorkouts);

  // Scroll-sync: update calendar month based on feed scroll position
  useEffect(() => {
    if (selectedDate) return;

    const handleScroll = () => {
      if (!isUserScrolling.current) return;
      if (rafRef.current) return;

      rafRef.current = window.requestAnimationFrame(() => {
        rafRef.current = null;

        const refs = weekGroupRefs.current;
        const targetY = 180; // Just below sticky area
        let activeKey = null;

        Object.entries(refs).forEach(([key, el]) => {
          if (!el) return;
          const rect = el.getBoundingClientRect();
          if (rect.top <= targetY && rect.bottom > targetY) {
            activeKey = key;
          }
        });

        if (!activeKey) {
          let bestKey = null;
          let bestTop = Infinity;
          Object.entries(refs).forEach(([key, el]) => {
            if (!el) return;
            const rect = el.getBoundingClientRect();
            if (rect.bottom > 0 && rect.top < bestTop) {
              bestTop = rect.top;
              bestKey = key;
            }
          });
          activeKey = bestKey;
        }

        if (activeKey) {
          const el = refs[activeKey];
          const dateStr = el?.dataset?.weekDate;
          if (dateStr) {
            const offset = calcMonthOffset(dateStr);
            if (offset !== lastSyncedOffset.current) {
              lastSyncedOffset.current = offset;
              setMonthOffset(offset);
            }
          }
        }
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafRef.current) {
        window.cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [weekGroups, selectedDate]);

  // Empty state message based on filter
  const emptyMessage = useMemo(() => {
    if (selectedDate) return 'No workouts on this day.';
    if (workoutTypeFilter === 'runs') return 'No runs logged yet.';
    if (workoutTypeFilter === 'strength') return 'No strength workouts logged yet.';
    return 'No workouts yet. Start your first one!';
  }, [selectedDate, workoutTypeFilter]);

  return (
    <div>
      {/* Calendar + filter bar — pinned below header */}
      <div
        ref={stickyBarRef}
        className="sticky z-20"
        style={{
          top: 'calc(3.5rem + env(safe-area-inset-top))',
          backgroundColor: 'var(--color-bg)',
        }}
      >
        <CalendarStrip
          workouts={calendarWorkouts}
          selectedDate={selectedDate}
          presets={presets}
          onSelectDate={onSelectDate}
          monthOffset={monthOffset}
          onMonthChange={handleMonthChange}
          collapsed={calendarCollapsed}
          onToggleCollapse={handleToggleCollapse}
        />

        {/* Compare mode bar */}
        {compareMode && (
          <div
            className="flex items-center justify-between px-4 py-2"
            style={{
              backgroundColor: 'var(--color-surface)',
              borderBottom: '1px solid var(--color-border)',
            }}
          >
            <span className="text-xs font-medium" style={{ color: 'var(--color-accent)' }}>
              {compareSelections.length === 0
                ? 'Tap two workouts to compare'
                : compareSelections.length === 1
                  ? 'Tap one more workout'
                  : 'Comparing...'}
            </span>
            <button
              onClick={handleToggleCompareMode}
              className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium"
              style={{ color: 'var(--color-text-muted)' }}
            >
              <X size={14} /> Cancel
            </button>
          </div>
        )}

        {/* Filter bar + Compare button */}
        {!compareMode && (
          <div
            className="flex items-center justify-between"
            style={{
              backgroundColor: 'var(--color-bg)',
              paddingLeft: '12px',
              paddingRight: '12px',
              paddingTop: '4px',
              paddingBottom: '6px',
              borderBottom: '1px solid var(--color-border)',
            }}
          >
            {/* Segmented filter control */}
            <div
              className="flex gap-0.5 p-0.5 rounded-lg"
              style={{ backgroundColor: 'var(--color-surface)' }}
            >
              {[
                { key: 'all', label: 'All' },
                { key: 'runs', label: 'Runs' },
                { key: 'strength', label: 'Strength' },
              ].map(({ key, label }) => {
                const isActive = workoutTypeFilter === key;
                let activeColor = 'var(--color-accent)';
                if (key === 'runs') activeColor = '#f59e0b';

                return (
                  <button
                    key={key}
                    onClick={() => setWorkoutTypeFilter(key)}
                    className="px-2.5 py-1 rounded-md text-[11px] font-semibold"
                    style={{
                      backgroundColor: isActive ? activeColor : 'transparent',
                      color: isActive ? '#ffffff' : 'var(--color-text-dim)',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {label}
                  </button>
                );
              })}
            </div>

            {/* Compare button */}
            <button
              onClick={handleToggleCompareMode}
              className="flex items-center gap-1 px-2 py-1 rounded-lg"
              style={{
                color: 'var(--color-text-dim)',
                opacity: workoutTypeFilter === 'runs' ? 0.3 : 1,
              }}
              aria-label="Compare workouts"
              disabled={workoutTypeFilter === 'runs'}
            >
              <GitCompareArrows size={14} />
              <span className="text-[10px] font-medium">Compare</span>
            </button>
          </div>
        )}
      </div>

      {/* Workout list */}
      {displayWorkouts.length === 0 ? (
        <div className="pt-6">
          <EmptyState
            icon={workoutTypeFilter === 'runs' ? Footprints : Dumbbell}
            message={emptyMessage}
            actionLabel={workoutTypeFilter === 'all' && !selectedDate ? "Start Workout" : undefined}
            onAction={workoutTypeFilter === 'all' && !selectedDate ? onStartWorkout : undefined}
          />
        </div>
      ) : (
        <div className="px-3 pb-4">
          {weekGroups.map((group, groupIdx) => (
            <div
              key={group.weekKey}
              ref={el => { weekGroupRefs.current[group.weekKey] = el; }}
              data-week-date={group.firstDate}
              data-week-label={group.label}
              style={{ marginTop: groupIdx > 0 ? '0' : '4px' }}
            >
              {/* Week header label */}
              {!selectedDate && (
                <div
                  style={{
                    paddingTop: groupIdx > 0 ? '10px' : '4px',
                    paddingBottom: '6px',
                    paddingLeft: '1px',
                  }}
                >
                  <span
                    className="text-xs font-bold tracking-wider"
                    style={{ color: 'var(--color-text-dim)' }}
                  >
                    {group.label}
                  </span>
                </div>
              )}

              {/* Workout cards for this week */}
              {group.workouts.map(workout => {
                const isSelected = compareSelections.includes(workout.id);
                const isComparable = !workout.isDayOff;

                if (compareMode && isComparable) {
                  return (
                    <button
                      key={workout.id}
                      onClick={() => handleCompareSelect(workout.id)}
                      className="w-full text-left relative"
                    >
                      <WorkoutCard
                        workout={workout}
                        isExpanded={false}
                        onToggle={() => {}}
                        onEdit={onEdit}
                        onDelete={onDelete}
                        proteinGrams={proteinByDate[workout.date] || 0}
                        presets={presets}
                      />
                      {isSelected && (
                        <div
                          className="absolute inset-0 rounded-xl flex items-center justify-center pointer-events-none"
                          style={{
                            backgroundColor: 'rgba(74, 158, 255, 0.12)',
                            border: '2px solid var(--color-accent)',
                            borderRadius: '12px',
                          }}
                        >
                          <div
                            className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center"
                            style={{ backgroundColor: 'var(--color-accent)' }}
                          >
                            <Check size={12} color="#ffffff" strokeWidth={3} />
                          </div>
                        </div>
                      )}
                    </button>
                  );
                }

                return (
                  <div key={workout.id} ref={el => { logCardRefs.current[workout.id] = el; }}>
                    <WorkoutCard
                      workout={workout}
                      isExpanded={expandedId === workout.id}
                      onToggle={() => handleToggle(workout.id)}
                      onEdit={onEdit}
                      onDelete={onDelete}
                      proteinGrams={proteinByDate[workout.date] || 0}
                      presets={presets}
                    />
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      )}

      {/* Compare overlay */}
      {showCompare && compareSelections.length === 2 && (() => {
        const wA = workouts.find(w => w.id === compareSelections[0]);
        const wB = workouts.find(w => w.id === compareSelections[1]);
        if (!wA || !wB) return null;
        return (
          <WorkoutCompare
            workoutA={wA}
            workoutB={wB}
            presets={presets}
            onClose={handleCloseCompare}
          />
        );
      })()}
    </div>
  );
}
