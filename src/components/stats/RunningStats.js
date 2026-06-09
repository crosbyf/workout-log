'use client';

import { useMemo } from 'react';
import { Footprints, TrendingUp, Clock } from 'lucide-react';

const RUN_COLOR = '#f59e0b';

/**
 * Get Mon–Sun dates for a week offset from today.
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

function formatWeekLabel(dates) {
  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const first = new Date(dates[0] + 'T12:00:00');
  const last = new Date(dates[6] + 'T12:00:00');
  if (first.getMonth() === last.getMonth()) {
    return `${MONTHS[first.getMonth()]} ${first.getDate()}–${last.getDate()}`;
  }
  return `${MONTHS[first.getMonth()]} ${first.getDate()} – ${MONTHS[last.getMonth()]} ${last.getDate()}`;
}

function formatDuration(totalSeconds) {
  if (!totalSeconds || totalSeconds <= 0) return '—';
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

export default function RunningStats({ workouts = [] }) {
  const runs = useMemo(
    () => workouts.filter(w => w.isRun),
    [workouts]
  );

  // Build 12 weeks of data
  const weeklyData = useMemo(() => {
    const weeks = [];
    for (let w = 0; w < 12; w++) {
      const dates = getWeekDates(-w);
      const weekRuns = runs.filter(r => dates.includes(r.date));
      const miles = weekRuns.reduce((sum, r) => sum + (r.runDistance || 0), 0);
      const time = weekRuns.reduce((sum, r) => sum + (r.runTime || 0), 0);
      const count = weekRuns.length;
      weeks.push({ dates, miles, time, count, label: formatWeekLabel(dates) });
    }
    return weeks;
  }, [runs]);

  const thisWeek = weeklyData[0];
  const lastWeek = weeklyData[1];

  // Find the max mileage for scaling the bars
  const maxMiles = Math.max(...weeklyData.map(w => w.miles), 1);

  // Total all-time stats
  const totalMiles = runs.reduce((sum, r) => sum + (r.runDistance || 0), 0);
  const totalTime = runs.reduce((sum, r) => sum + (r.runTime || 0), 0);
  const totalRuns = runs.length;

  if (totalRuns === 0) {
    return (
      <div className="text-center py-8">
        <Footprints size={28} style={{ color: 'var(--color-text-dim)', margin: '0 auto 8px' }} />
        <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
          No runs logged yet.
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* This week summary */}
      <div
        className="rounded-xl p-4 mb-3"
        style={{ backgroundColor: 'var(--color-surface)' }}
      >
        <div className="flex items-center gap-2 mb-3">
          <Footprints size={16} style={{ color: RUN_COLOR }} />
          <span className="text-xs font-bold tracking-wider" style={{ color: 'var(--color-text-dim)' }}>
            THIS WEEK
          </span>
        </div>
        <div className="flex items-start justify-around">
          <div className="text-center">
            <div className="text-3xl font-bold" style={{ color: RUN_COLOR }}>
              {thisWeek.miles > 0
                ? (thisWeek.miles % 1 === 0 ? thisWeek.miles : thisWeek.miles.toFixed(1))
                : '0'}
            </div>
            <div className="text-[10px] mt-0.5" style={{ color: 'var(--color-text-dim)' }}>miles</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold" style={{ color: 'var(--color-text-muted)' }}>
              {formatDuration(thisWeek.time)}
            </div>
            <div className="text-[10px] mt-0.5" style={{ color: 'var(--color-text-dim)' }}>time</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold" style={{ color: 'var(--color-text-muted)' }}>
              {thisWeek.count}
            </div>
            <div className="text-[10px] mt-0.5" style={{ color: 'var(--color-text-dim)' }}>runs</div>
          </div>
        </div>
      </div>

      {/* Weekly mileage chart (12 weeks) */}
      <div
        className="rounded-xl p-4 mb-3"
        style={{ backgroundColor: 'var(--color-surface)' }}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <TrendingUp size={14} style={{ color: RUN_COLOR }} />
            <span className="text-xs font-bold tracking-wider" style={{ color: 'var(--color-text-dim)' }}>
              WEEKLY MILEAGE
            </span>
          </div>
          <span className="text-[10px]" style={{ color: 'var(--color-text-dim)' }}>
            12 weeks
          </span>
        </div>

        {/* Bar chart */}
        <div className="flex items-end gap-1" style={{ height: '120px' }}>
          {weeklyData.slice().reverse().map((week, idx) => {
            const height = maxMiles > 0 ? Math.max((week.miles / maxMiles) * 100, week.miles > 0 ? 4 : 0) : 0;
            const isThisWeek = idx === weeklyData.length - 1;
            return (
              <div
                key={idx}
                className="flex-1 flex flex-col items-center justify-end h-full"
              >
                <div
                  className="w-full rounded-t-sm"
                  style={{
                    height: `${height}%`,
                    backgroundColor: isThisWeek ? RUN_COLOR : 'rgba(245, 158, 11, 0.35)',
                    minHeight: week.miles > 0 ? '4px' : '0',
                    transition: 'height 0.3s ease',
                  }}
                />
              </div>
            );
          })}
        </div>

        {/* Week labels (first, middle, last) */}
        <div className="flex justify-between mt-1">
          <span className="text-[9px]" style={{ color: 'var(--color-text-dim)' }}>
            {weeklyData[11]?.label || ''}
          </span>
          <span className="text-[9px]" style={{ color: 'var(--color-text-dim)' }}>
            {weeklyData[5]?.label || ''}
          </span>
          <span className="text-[9px] font-medium" style={{ color: RUN_COLOR }}>
            Now
          </span>
        </div>
      </div>

      {/* All-time totals */}
      <div
        className="rounded-xl p-4"
        style={{ backgroundColor: 'var(--color-surface)' }}
      >
        <span className="text-xs font-bold tracking-wider block mb-2" style={{ color: 'var(--color-text-dim)' }}>
          ALL TIME
        </span>
        <div className="flex items-center justify-around">
          <div className="text-center">
            <div className="text-lg font-bold" style={{ color: RUN_COLOR }}>
              {totalMiles % 1 === 0 ? totalMiles : totalMiles.toFixed(1)}
            </div>
            <div className="text-[10px]" style={{ color: 'var(--color-text-dim)' }}>miles</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold" style={{ color: 'var(--color-text-muted)' }}>
              {formatDuration(totalTime)}
            </div>
            <div className="text-[10px]" style={{ color: 'var(--color-text-dim)' }}>time</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold" style={{ color: 'var(--color-text-muted)' }}>
              {totalRuns}
            </div>
            <div className="text-[10px]" style={{ color: 'var(--color-text-dim)' }}>runs</div>
          </div>
        </div>
      </div>
    </div>
  );
}
