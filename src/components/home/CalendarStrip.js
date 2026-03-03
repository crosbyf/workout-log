'use client';

import { useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { PRESET_COLORS } from '@/hooks/usePresets';

const DAYS_LETTER = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

const MONTHS_FULL = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

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
 * Format Date object to YYYY-MM-DD string
 */
function toDateStr(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Get the grid of day objects for a month view (6 rows x 7 cols, Mon-Sun)
 */
function getMonthGrid(year, month) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  // Day of week for the 1st (0=Sun, convert to Mon=0)
  let startDow = firstDay.getDay() - 1;
  if (startDow < 0) startDow = 6; // Sunday becomes 6

  const days = [];

  // Previous month fill
  for (let i = startDow - 1; i >= 0; i--) {
    const d = new Date(year, month, -i);
    days.push({ date: d, currentMonth: false });
  }

  // Current month
  for (let i = 1; i <= lastDay.getDate(); i++) {
    days.push({ date: new Date(year, month, i), currentMonth: true });
  }

  // Next month fill (always pad to 42 = 6 rows, but trim if 5 rows suffice)
  const rows = Math.ceil(days.length / 7);
  const targetCells = rows * 7;
  let nextDay = 1;
  while (days.length < targetCells) {
    days.push({ date: new Date(year, month + 1, nextDay++), currentMonth: false });
  }

  return days;
}

export default function CalendarStrip({ workouts = [], selectedDate, onSelectDate, monthOffset = 0, onMonthChange, presets = [] }) {
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  // Calculate target month/year from offset
  const { year, month } = useMemo(() => {
    const d = new Date(today.getFullYear(), today.getMonth() + monthOffset, 1);
    return { year: d.getFullYear(), month: d.getMonth() };
  }, [today, monthOffset]);

  const monthGrid = useMemo(() => getMonthGrid(year, month), [year, month]);

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

  const monthLabel = `${MONTHS_FULL[month]} ${year}`;

  const handlePrevMonth = () => onMonthChange(monthOffset - 1);
  const handleNextMonth = () => onMonthChange(monthOffset + 1);
  const handleGoToday = () => {
    onMonthChange(0);
    onSelectDate(null);
  };

  const todayStr = toDateStr(today);

  return (
    <div
      className="px-3 pt-1.5 pb-1"
      style={{ backgroundColor: 'var(--color-bg)' }}
    >
      {/* Month navigation row */}
      <div className="flex items-center justify-between mb-1">
        <button
          onClick={handlePrevMonth}
          className="w-8 h-8 flex items-center justify-center rounded-lg"
          style={{ color: 'var(--color-text-muted)' }}
          aria-label="Previous month"
        >
          <ChevronLeft size={18} />
        </button>

        <button
          onClick={handleGoToday}
          className="text-xs font-semibold tracking-wide px-3 py-0.5 rounded-full"
          style={{
            color: monthOffset === 0 ? 'var(--color-accent)' : 'var(--color-text-muted)',
            backgroundColor: monthOffset === 0 ? 'transparent' : 'var(--color-surface)',
          }}
        >
          {monthLabel}
        </button>

        <button
          onClick={handleNextMonth}
          className="w-8 h-8 flex items-center justify-center rounded-lg"
          style={{
            color: monthOffset >= 0 ? 'var(--color-text-dim)' : 'var(--color-text-muted)',
            opacity: monthOffset >= 0 ? 0.4 : 1,
          }}
          aria-label="Next month"
          disabled={monthOffset >= 0}
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-0 mb-0.5">
        {DAYS_LETTER.map((letter, idx) => (
          <div
            key={idx}
            className="text-center"
            style={{ fontSize: '8px', fontWeight: 600, color: 'var(--color-text-dim)', lineHeight: '12px' }}
          >
            {letter}
          </div>
        ))}
      </div>

      {/* Month grid */}
      <div className="grid grid-cols-7 gap-0">
        {monthGrid.map((dayObj, idx) => {
          const dateStr = toDateStr(dayObj.date);
          const isToday = dateStr === todayStr;
          const isSelected = selectedDate === dateStr;
          const isFuture = dayObj.date > today;
          const isCurrentMonth = dayObj.currentMonth;
          const dots = workoutDotMap[dateStr] || [];

          return (
            <button
              key={idx}
              onClick={() => {
                if (isFuture || !isCurrentMonth) return;
                onSelectDate(isSelected ? null : dateStr);
              }}
              className="flex flex-col items-center justify-center rounded-lg"
              style={{
                padding: '3px 0 2px',
                minHeight: '30px',
                backgroundColor: isSelected
                  ? 'var(--color-accent)'
                  : isToday
                    ? 'var(--color-surface)'
                    : 'transparent',
                opacity: !isCurrentMonth ? 0.2 : isFuture ? 0.3 : 1,
                transition: 'background-color 0.15s ease',
                cursor: (isFuture || !isCurrentMonth) ? 'default' : 'pointer',
              }}
              disabled={isFuture || !isCurrentMonth}
            >
              {/* Day number */}
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: isToday ? 800 : 600,
                  lineHeight: '14px',
                  color: isSelected
                    ? '#ffffff'
                    : isToday
                      ? 'var(--color-accent)'
                      : 'var(--color-text)',
                }}
              >
                {dayObj.date.getDate()}
              </span>

              {/* Workout dots */}
              <div className="flex gap-px mt-px" style={{ height: '4px' }}>
                {dots.slice(0, 3).map((color, di) => (
                  <div
                    key={di}
                    style={{
                      width: '3px',
                      height: '3px',
                      borderRadius: '50%',
                      backgroundColor: isSelected ? 'rgba(255,255,255,0.9)' : color,
                      boxShadow: isSelected ? 'none' : `0 0 2px ${color}`,
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
