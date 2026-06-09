'use client';

import { useMemo, useRef, useCallback } from 'react';
import { ChevronLeft, ChevronRight, ChevronDown, ChevronUp } from 'lucide-react';
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

function toDateStr(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function getMonthGrid(year, month) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  let startDow = firstDay.getDay() - 1;
  if (startDow < 0) startDow = 6;

  const days = [];

  for (let i = startDow - 1; i >= 0; i--) {
    const d = new Date(year, month, -i);
    days.push({ date: d, currentMonth: false });
  }

  for (let i = 1; i <= lastDay.getDate(); i++) {
    days.push({ date: new Date(year, month, i), currentMonth: true });
  }

  const rows = Math.ceil(days.length / 7);
  const targetCells = rows * 7;
  let nextDay = 1;
  while (days.length < targetCells) {
    days.push({ date: new Date(year, month + 1, nextDay++), currentMonth: false });
  }

  return days;
}

export default function CalendarStrip({ workouts = [], selectedDate, onSelectDate, monthOffset = 0, onMonthChange, presets = [], collapsed = false, onToggleCollapse }) {
  const touchStartX = useRef(null);
  const touchStartY = useRef(null);

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const { year, month } = useMemo(() => {
    const d = new Date(today.getFullYear(), today.getMonth() + monthOffset, 1);
    return { year: d.getFullYear(), month: d.getMonth() };
  }, [today, monthOffset]);

  const monthGrid = useMemo(() => getMonthGrid(year, month), [year, month]);

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

  // Swipe handling
  const handleTouchStart = useCallback((e) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  }, []);

  const handleTouchEnd = useCallback((e) => {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const dy = e.changedTouches[0].clientY - touchStartY.current;
    touchStartX.current = null;
    touchStartY.current = null;

    // Only count horizontal swipes (dx > dy, and enough distance)
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      if (dx < 0) {
        // Swipe left = next month (only if not at current month)
        if (monthOffset < 0) onMonthChange(monthOffset + 1);
      } else {
        // Swipe right = previous month
        onMonthChange(monthOffset - 1);
      }
    }
  }, [monthOffset, onMonthChange]);

  const todayStr = toDateStr(today);

  return (
    <div
      className="px-3 pt-1.5 pb-1"
      style={{ backgroundColor: 'var(--color-bg)' }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
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

        <div className="flex items-center gap-1">
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
          {onToggleCollapse && (
            <button
              onClick={onToggleCollapse}
              className="p-0.5 rounded"
              style={{ color: 'var(--color-text-dim)' }}
              aria-label={collapsed ? 'Expand calendar' : 'Collapse calendar'}
            >
              {collapsed ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
            </button>
          )}
        </div>

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

      {/* Collapsed: just show month nav, no grid */}
      {!collapsed && (
        <>
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
        </>
      )}
    </div>
  );
}
