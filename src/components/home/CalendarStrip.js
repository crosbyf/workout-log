'use client';

import { useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { PRESET_COLORS } from '@/hooks/usePresets';

const DAYS_SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const LOCATION_COLOR_MAP = {
  'Garage A': 'blue',
  'Garage B': 'purple',
  'BW-only': 'green',
  'GtG': 'yellow',
  'Manual': 'red',
  'Garage 10': 'pink',
  'Garage 12': 'orange',
  'Garage BW': 'cyan',
};

/**
 * Get the Monday of the week containing the given date
 */
function getMonday(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = (day === 0 ? -6 : 1) - day; // Monday = 1
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Format Date object to YYYY-MM-DD string
 */
function toDateStr(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Get array of 7 Date objects for Mon-Sun of the week containing the given date
 */
function getWeekDays(referenceDate) {
  const monday = getMonday(referenceDate);
  const days = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    days.push(d);
  }
  return days;
}

const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function CalendarStrip({ workouts = [], selectedDate, onSelectDate, weekOffset = 0, onWeekChange, presets = [] }) {
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const weekDays = useMemo(() => {
    const ref = new Date(today);
    ref.setDate(ref.getDate() + weekOffset * 7);
    return getWeekDays(ref);
  }, [today, weekOffset]);

  // Build a map of date string → workout colors for dot indicators
  const workoutDotMap = useMemo(() => {
    const map = {};
    for (const w of workouts) {
      if (!map[w.date]) map[w.date] = [];
      if (w.isDayOff) {
        map[w.date].push('var(--color-text-dim)');
      } else if (w.isRun) {
        map[w.date].push('#f59e0b');
      } else {
        // Check presets first, fall back to hardcoded map
        let colorKey = LOCATION_COLOR_MAP[w.location] || 'blue';
        if (presets && presets.length > 0) {
          const preset = presets.find(p => p.name === w.location);
          if (preset && preset.color) {
            colorKey = preset.color;
          }
        }
        map[w.date].push(PRESET_COLORS[colorKey] || 'var(--color-accent)');
      }
    }
    return map;
  }, [workouts, presets]);

  // Week label: "Feb 2026" or "Feb 24 – Mar 2"
  const weekLabel = useMemo(() => {
    const first = weekDays[0];
    const last = weekDays[6];
    if (first.getMonth() === last.getMonth()) {
      return `${MONTHS_SHORT[first.getMonth()]} ${first.getFullYear()}`;
    }
    return `${MONTHS_SHORT[first.getMonth()]} ${first.getDate()} – ${MONTHS_SHORT[last.getMonth()]} ${last.getDate()}`;
  }, [weekDays]);

  const handlePrevWeek = () => onWeekChange(weekOffset - 1);
  const handleNextWeek = () => onWeekChange(weekOffset + 1);
  const handleGoToday = () => {
    onWeekChange(0);
    onSelectDate(null); // Clear date filter to show all
  };

  const todayStr = toDateStr(today);

  return (
    <div
      className="px-3 pt-2 pb-1"
      style={{ backgroundColor: 'var(--color-bg)' }}
    >
      {/* Week navigation row */}
      <div className="flex items-center justify-between mb-2">
        <button
          onClick={handlePrevWeek}
          className="w-8 h-8 flex items-center justify-center rounded-lg"
          style={{ color: 'var(--color-text-muted)' }}
          aria-label="Previous week"
        >
          <ChevronLeft size={18} />
        </button>

        <button
          onClick={handleGoToday}
          className="text-xs font-semibold tracking-wide px-3 py-1 rounded-full"
          style={{
            color: weekOffset === 0 ? 'var(--color-accent)' : 'var(--color-text-muted)',
            backgroundColor: weekOffset === 0 ? 'transparent' : 'var(--color-surface)',
          }}
        >
          {weekLabel}
        </button>

        <button
          onClick={handleNextWeek}
          className="w-8 h-8 flex items-center justify-center rounded-lg"
          style={{
            color: weekOffset >= 0 ? 'var(--color-text-dim)' : 'var(--color-text-muted)',
            opacity: weekOffset >= 0 ? 0.4 : 1,
          }}
          aria-label="Next week"
          disabled={weekOffset >= 0}
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7 gap-1">
        {weekDays.map((day, idx) => {
          const dateStr = toDateStr(day);
          const isToday = dateStr === todayStr;
          const isSelected = selectedDate === dateStr;
          const isFuture = day > today;
          const dots = workoutDotMap[dateStr] || [];

          return (
            <button
              key={idx}
              onClick={() => {
                if (isFuture) return;
                // Toggle: tap selected day again to deselect
                onSelectDate(isSelected ? null : dateStr);
              }}
              className="flex flex-col items-center py-1.5 rounded-xl"
              style={{
                backgroundColor: isSelected
                  ? 'var(--color-accent)'
                  : isToday
                    ? 'var(--color-surface)'
                    : 'transparent',
                opacity: isFuture ? 0.3 : 1,
                transition: 'background-color 0.15s ease, opacity 0.15s ease',
              }}
              disabled={isFuture}
            >
              {/* Day name */}
              <span
                className="text-[10px] font-medium mb-0.5"
                style={{
                  color: isSelected ? '#ffffff' : 'var(--color-text-dim)',
                }}
              >
                {DAYS_SHORT[idx]}
              </span>

              {/* Day number */}
              <span
                className="text-sm font-bold leading-tight"
                style={{
                  color: isSelected
                    ? '#ffffff'
                    : isToday
                      ? 'var(--color-accent)'
                      : 'var(--color-text)',
                }}
              >
                {day.getDate()}
              </span>

              {/* Workout dots */}
              <div className="flex gap-0.5 mt-1 h-2">
                {dots.slice(0, 3).map((color, di) => (
                  <div
                    key={di}
                    className="w-2 h-2 rounded-full"
                    style={{
                      backgroundColor: isSelected ? 'rgba(255,255,255,0.9)' : color,
                      boxShadow: isSelected ? 'none' : `0 0 3px ${color}`,
                    }}
                  />
                ))}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
