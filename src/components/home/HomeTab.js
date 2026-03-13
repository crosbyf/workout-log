'use client';

import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { Dumbbell } from 'lucide-react';
import EmptyState from '@/components/shared/EmptyState';
import WorkoutCard from './WorkoutCard';
import CalendarStrip from './CalendarStrip';
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
 * Calculate week offset from today for a given date string
 */
function calcWeekOffset(dateStr) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayDay = (today.getDay() + 6) % 7;
  const todayMonday = new Date(today);
  todayMonday.setDate(today.getDate() - todayDay);

  const [y, m, d] = dateStr.split('-').map(Number);
  const target = new Date(y, m - 1, d);
  const targetDay = (target.getDay() + 6) % 7;
  const targetMonday = new Date(target);
  targetMonday.setDate(target.getDate() - targetDay);

  const diffMs = targetMonday.getTime() - todayMonday.getTime();
  return Math.round(diffMs / (7 * 24 * 60 * 60 * 1000));
}

export default function HomeTab({ workouts = [], allWorkouts = [], selectedDate, onSelectDate, onEdit, onDelete, onStartWorkout, proteinEntries = [], presets = [] }) {
  const [expandedId, setExpandedId] = useState(null);
  const [weekOffset, setWeekOffset] = useState(0);
  const [activeWeekLabel, setActiveWeekLabel] = useState(null);
  const weekGroupRefs = useRef({});
  const isUserScrolling = useRef(true);
  const rafRef = useRef(null);
  const lastSyncedOffset = useRef(0);

  const handleToggle = (workoutId) => {
    setExpandedId(prev => prev === workoutId ? null : workoutId);
  };

  // When user taps a calendar arrow or "today", don't sync from scroll briefly
  const handleWeekChange = useCallback((newOffset) => {
    isUserScrolling.current = false;
    setWeekOffset(newOffset);
    lastSyncedOffset.current = newOffset;
    const timer = window.setTimeout(() => {
      isUserScrolling.current = true;
    }, 600);
    return () => window.clearTimeout(timer);
  }, []);

  // Apply date filter from calendar
  const displayWorkouts = useMemo(() => {
    if (!selectedDate) return workouts;
    return workouts.filter(w => w.date === selectedDate);
  }, [workouts, selectedDate]);

  // Build protein-by-date lookup
  const proteinByDate = useMemo(() => {
    const map = {};
    for (const entry of proteinEntries) {
      map[entry.date] = (map[entry.date] || 0) + (entry.grams || 0);
    }
    return map;
  }, [proteinEntries]);

  const weekGroups = groupByWeek(displayWorkouts);

  // Derive the displayed week label: use scroll-synced label if set, otherwise first group
  const displayedWeekLabel = activeWeekLabel || (weekGroups.length > 0 ? weekGroups[0].label : '');

  // Smooth scroll-sync: update calendar week AND the fixed week label
  useEffect(() => {
    if (selectedDate) return;

    const handleScroll = () => {
      if (!isUserScrolling.current) return;
      if (rafRef.current) return;

      rafRef.current = window.requestAnimationFrame(() => {
        rafRef.current = null;

        const refs = weekGroupRefs.current;
        // Find the group whose container actually spans the area just below
        // the sticky header. Use a high-enough threshold so the label only
        // changes once the group has scrolled up to the header region.
        const targetY = 240;
        let activeKey = null;

        // Walk groups: pick the one whose top is AT or ABOVE the target
        // line AND whose bottom is still below it (i.e. it spans the line).
        Object.entries(refs).forEach(([key, el]) => {
          if (!el) return;
          const rect = el.getBoundingClientRect();
          if (rect.top <= targetY && rect.bottom > targetY) {
            activeKey = key;
          }
        });

        // Fallback: if nothing spans the target line (e.g. first group
        // is still below it), use the first visible group
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
          const label = el?.dataset?.weekLabel;
          if (dateStr) {
            const offset = calcWeekOffset(dateStr);
            if (offset !== lastSyncedOffset.current) {
              lastSyncedOffset.current = offset;
              setWeekOffset(offset);
            }
          }
          if (label) {
            setActiveWeekLabel(label);
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

  return (
    <div>
      {/* Calendar strip + fixed week label — pinned below header */}
      <div
        className="sticky z-20"
        style={{
          top: 'calc(3.5rem + env(safe-area-inset-top))',
          backgroundColor: 'var(--color-bg)',
        }}
      >
        <CalendarStrip
          workouts={allWorkouts}
          selectedDate={selectedDate}
          presets={presets}
          onSelectDate={onSelectDate}
          weekOffset={weekOffset}
          onWeekChange={handleWeekChange}
        />
        {/* Fixed week label — always visible, updates on scroll */}
        {!selectedDate && weekGroups.length > 0 && (
          <div
            style={{
              backgroundColor: 'var(--color-bg)',
              paddingLeft: '16px',
              paddingRight: '16px',
              paddingTop: '6px',
              paddingBottom: '6px',
              borderBottom: '1px solid var(--color-border)',
            }}
          >
            <span
              className="text-xs font-bold tracking-wider"
              style={{ color: 'var(--color-text-dim)' }}
            >
              {displayedWeekLabel}
            </span>
          </div>
        )}
        {/* Divider line (only when no week label shown) */}
        {(selectedDate || weekGroups.length === 0) && (
          <div style={{ borderBottom: '1px solid var(--color-border)' }} />
        )}
      </div>

      {/* Workout list */}
      {displayWorkouts.length === 0 ? (
        <div className="pt-6">
          <EmptyState
            icon={Dumbbell}
            message={selectedDate
              ? "No workouts on this day."
              : "No workouts yet. Start your first one!"
            }
            actionLabel={!selectedDate ? "Start Workout" : undefined}
            onAction={!selectedDate ? onStartWorkout : undefined}
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
              {/* Inline week separator (non-sticky, between groups) — always rendered for layout stability, visually hidden when it matches the fixed label */}
              {!selectedDate && groupIdx > 0 && (
                <div
                  style={{
                    paddingTop: '10px',
                    paddingBottom: '6px',
                    paddingLeft: '1px',
                    visibility: group.label === displayedWeekLabel ? 'hidden' : 'visible',
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
              {group.workouts.map(workout => (
                <WorkoutCard
                  key={workout.id}
                  workout={workout}
                  isExpanded={expandedId === workout.id}
                  onToggle={() => handleToggle(workout.id)}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  proteinGrams={proteinByDate[workout.date] || 0}
                  presets={presets}
                />
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
