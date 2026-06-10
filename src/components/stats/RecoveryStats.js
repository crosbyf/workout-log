'use client';

import { useState, useMemo } from 'react';

const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const RANGE_OPTIONS = [
  { key: '1M', months: 1 },
  { key: '3M', months: 3 },
  { key: 'ALL', months: null },
];

const SLEEP_PURPLE = '#a855f7';

const STAGE_DEFS = [
  { key: 'sleepDeepMin', label: 'Deep', color: 'var(--color-accent)' },
  { key: 'sleepCoreMin', label: 'Core', color: SLEEP_PURPLE },
  { key: 'sleepRemMin', label: 'REM', color: 'var(--color-yellow)' },
  { key: 'sleepAwakeMin', label: 'Awake', color: 'var(--color-text-dim)' },
];

function formatShortDate(dateStr) {
  const [, month, day] = dateStr.split('-').map(Number);
  return `${MONTHS_SHORT[month - 1]} ${day}`;
}

/** Minutes → "7h 12m" (or "42m" under an hour). */
function formatSleep(totalMin) {
  const mins = Math.round(totalMin);
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h === 0) return `${m}m`;
  return `${h}h ${m}m`;
}

/** Bed/wake time → "10:42 PM". Accepts ISO timestamps or "HH:MM[:SS]". */
function formatClock(value) {
  if (!value) return null;
  let h, m;
  if (String(value).includes('T')) {
    const d = new Date(value);
    if (isNaN(d.getTime())) return null;
    h = d.getHours();
    m = d.getMinutes();
  } else {
    const match = String(value).match(/^(\d{1,2}):(\d{2})/);
    if (!match) return null;
    h = Number(match[1]);
    m = Number(match[2]);
  }
  const suffix = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, '0')} ${suffix}`;
}

/** Average of the most recent `count` non-null values for a field (days date-desc). */
function recentAvg(days, field, count = 7) {
  const values = [];
  for (const d of days) {
    if (d[field] != null) values.push(d[field]);
    if (values.length >= count) break;
  }
  if (values.length === 0) return null;
  return values.reduce((s, v) => s + v, 0) / values.length;
}

/** Date string (YYYY-MM-DD) for `months` months before today. */
function getCutoffStr(months) {
  const d = new Date();
  d.setMonth(d.getMonth() - months);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** Catmull-Rom → cubic bezier for a gently smoothed line through all points. */
function smoothPath(pts) {
  if (pts.length === 0) return '';
  if (pts.length < 3) {
    return pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
  }
  let d = `M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(pts.length - 1, i + 2)];
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${c1x.toFixed(1)} ${c1y.toFixed(1)}, ${c2x.toFixed(1)} ${c2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  }
  return d;
}

/**
 * Small SVG trend chart in the WeightTracker style — smoothed line, dashed
 * gridlines with labels, emphasized latest point. `data` is [{ date, value }]
 * sorted oldest → newest.
 */
function TrendChart({ title, data, color, formatValue }) {
  if (data.length < 2) {
    return (
      <div className="mb-3">
        <div className="text-[10px] uppercase mb-1" style={{ color: 'var(--color-text-dim)', fontWeight: 700, letterSpacing: '0.15em' }}>
          {title}
        </div>
        <p className="text-xs text-center py-4" style={{ color: 'var(--color-text-dim)', fontWeight: 700 }}>
          Not enough data yet
        </p>
      </div>
    );
  }

  const values = data.map(d => d.value);
  const rawMin = Math.min(...values);
  const rawMax = Math.max(...values);
  // Pad the y-domain so the line never hugs the top/bottom edges
  const domainPad = Math.max(0.6, (rawMax - rawMin) * 0.18);
  const minV = rawMin - domainPad;
  const maxV = rawMax + domainPad;
  const span = maxV - minV || 1;

  const chartW = 320;
  const chartH = 130;
  const padLeft = 10;
  const padRight = 42;  // space for right-aligned gridline labels
  const padTop = 18;
  const padBottom = 24; // space for first/last date labels
  const innerW = chartW - padLeft - padRight;
  const innerH = chartH - padTop - padBottom;

  const points = data.map((d, idx) => {
    const x = padLeft + (idx / (data.length - 1)) * innerW;
    const y = padTop + innerH - ((d.value - minV) / span) * innerH;
    return { x, y };
  });

  const lineD = smoothPath(points);
  const areaD = `${lineD} L ${points[points.length - 1].x.toFixed(1)} ${(padTop + innerH).toFixed(1)} L ${points[0].x.toFixed(1)} ${(padTop + innerH).toFixed(1)} Z`;

  // 3 subtle gridlines: bottom / middle / top of the padded domain
  const gridLines = [0, 0.5, 1].map(frac => ({
    frac,
    label: formatValue(minV + frac * span),
    y: padTop + innerH - frac * innerH,
  }));

  const last = points[points.length - 1];
  const labelY = Math.max(last.y - 9, 11);

  return (
    <div className="mb-3">
      <div className="text-[10px] uppercase mb-1" style={{ color: 'var(--color-text-dim)', fontWeight: 700, letterSpacing: '0.15em' }}>
        {title}
      </div>
      <svg viewBox={`0 0 ${chartW} ${chartH}`} className="w-full h-auto block">
        {/* Gridlines with right-aligned value labels */}
        {gridLines.map(({ frac, label, y }) => (
          <g key={frac}>
            <line
              x1={padLeft} y1={y} x2={chartW - padRight + 4} y2={y}
              stroke="var(--color-border)" strokeWidth="0.75" strokeDasharray="3,3"
            />
            <text
              x={chartW - 2} y={y + 3.5}
              textAnchor="end" fontSize="10" fontWeight="700" fill="var(--color-text-dim)"
            >
              {label}
            </text>
          </g>
        ))}

        {/* Area fill */}
        <path d={areaD} fill={color} opacity="0.08" />

        {/* Smoothed line */}
        <path
          d={lineD}
          fill="none"
          stroke={color}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Data points — only when sparse enough to read */}
        {points.length <= 20 && points.slice(0, -1).map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="2.5" fill={color} />
        ))}

        {/* Latest point: filled dot + subtle outer ring + value */}
        <circle cx={last.x} cy={last.y} r="7" fill="none" stroke={color} strokeWidth="1.5" opacity="0.35" />
        <circle cx={last.x} cy={last.y} r="3.5" fill={color} />
        <text
          x={Math.min(last.x, chartW - padRight)}
          y={labelY}
          textAnchor="end" fontSize="10" fontWeight="800" fill={color}
        >
          {formatValue(data[data.length - 1].value)}
        </text>

        {/* First / last date labels */}
        <text
          x={padLeft} y={chartH - 5}
          textAnchor="start" fontSize="10" fontWeight="700" fill="var(--color-text-dim)"
          style={{ textTransform: 'uppercase', letterSpacing: '0.08em' }}
        >
          {formatShortDate(data[0].date)}
        </text>
        <text
          x={chartW - padRight + 4} y={chartH - 5}
          textAnchor="end" fontSize="10" fontWeight="700" fill="var(--color-text-dim)"
          style={{ textTransform: 'uppercase', letterSpacing: '0.08em' }}
        >
          {formatShortDate(data[data.length - 1].date)}
        </text>
      </svg>
    </div>
  );
}

/** One scoreboard headline cell: dim label, big white value with colored underline, dim sub-line. */
function HeadlineCell({ label, value, unit, underlineColor, subline }) {
  return (
    <div className="flex-1">
      <div className="text-[10px] uppercase mb-0.5" style={{ color: 'var(--color-text-dim)', fontWeight: 700, letterSpacing: '0.15em' }}>
        {label}
      </div>
      <div
        className="flex items-baseline gap-1.5"
        style={{ borderBottom: `3px solid ${underlineColor}`, paddingBottom: '6px', width: 'fit-content' }}
      >
        <span className="text-2xl" style={{ color: 'var(--color-text)', fontWeight: 800 }}>
          {value}
        </span>
        {unit && (
          <span className="text-sm" style={{ color: 'var(--color-text-dim)' }}>
            {unit}
          </span>
        )}
      </div>
      {subline && (
        <div className="text-[10px] uppercase mt-1" style={{ color: 'var(--color-text-dim)', fontWeight: 700, letterSpacing: '0.08em' }}>
          {subline}
        </div>
      )}
    </div>
  );
}

/** Horizontal stacked bar of last night's sleep stages with a small legend. */
function SleepStagesBar({ day }) {
  const stages = STAGE_DEFS
    .map(def => ({ ...def, minutes: day[def.key] }))
    .filter(s => s.minutes != null && s.minutes > 0);
  const stageTotal = stages.reduce((s, st) => s + st.minutes, 0);

  const bedStr = formatClock(day.bedTime);
  const wakeStr = formatClock(day.wakeTime);

  return (
    <div
      className="rounded-xl mb-4 p-4"
      style={{ backgroundColor: 'var(--color-surface)' }}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] uppercase" style={{ color: 'var(--color-text-dim)', fontWeight: 700, letterSpacing: '0.15em' }}>
          Sleep Last Night
        </span>
        <span className="text-[10px] uppercase" style={{ color: 'var(--color-text-dim)', fontWeight: 700, letterSpacing: '0.08em' }}>
          {formatShortDate(day.date)}
        </span>
      </div>

      {stages.length > 0 ? (
        <>
          {/* Stacked bar */}
          <div className="flex w-full h-4 rounded-full overflow-hidden mb-2" style={{ backgroundColor: 'var(--color-surface-hover)' }}>
            {stages.map(s => (
              <div
                key={s.key}
                style={{ width: `${(s.minutes / stageTotal) * 100}%`, backgroundColor: s.color }}
              />
            ))}
          </div>
          {/* Legend */}
          <div className="flex flex-wrap gap-x-3 gap-y-1">
            {stages.map(s => (
              <div key={s.key} className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full inline-block shrink-0" style={{ backgroundColor: s.color }} />
                <span className="text-[10px] uppercase" style={{ color: 'var(--color-text-dim)', fontWeight: 700, letterSpacing: '0.08em' }}>
                  {s.label}
                </span>
                <span className="text-[10px]" style={{ color: 'var(--color-text)', fontWeight: 700 }}>
                  {formatSleep(s.minutes)}
                </span>
              </div>
            ))}
          </div>
        </>
      ) : (
        /* No stage breakdown — just the total */
        <div className="flex items-baseline gap-1.5">
          <span className="text-xl" style={{ color: 'var(--color-text)', fontWeight: 800 }}>
            {day.sleepTotalMin != null ? formatSleep(day.sleepTotalMin) : '—'}
          </span>
          <span className="text-xs" style={{ color: 'var(--color-text-dim)' }}>total</span>
        </div>
      )}

      {(bedStr || wakeStr) && (
        <div className="text-[10px] uppercase mt-2" style={{ color: 'var(--color-text-dim)', fontWeight: 700, letterSpacing: '0.08em' }}>
          {bedStr && `Bed ${bedStr}`}
          {bedStr && wakeStr && ' · '}
          {wakeStr && `Wake ${wakeStr}`}
        </div>
      )}
    </div>
  );
}

/**
 * Recovery detail screen: Apple Health resting HR + sleep. Read-only —
 * `days` comes from useHealthDaily(), sorted date-desc, fields nullable.
 */
export default function RecoveryStats({ days = [] }) {
  const [range, setRange] = useState('1M');

  // Latest non-null readings (days are date-desc)
  const latestHR = useMemo(() => days.find(d => d.restingHR != null) || null, [days]);
  const latestSleep = useMemo(
    () => days.find(d => d.sleepTotalMin != null || STAGE_DEFS.some(s => d[s.key] != null)) || null,
    [days]
  );

  const avgHR = useMemo(() => recentAvg(days, 'restingHR'), [days]);
  const avgSleep = useMemo(() => recentAvg(days, 'sleepTotalMin'), [days]);

  // Trend series, oldest → newest, nulls skipped, windowed by range
  const { hrSeries, sleepSeries } = useMemo(() => {
    const opt = RANGE_OPTIONS.find(o => o.key === range);
    const cutoff = opt && opt.months !== null ? getCutoffStr(opt.months) : null;
    const ascending = [...days].sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
    const windowed = cutoff ? ascending.filter(d => d.date >= cutoff) : ascending;
    return {
      hrSeries: windowed
        .filter(d => d.restingHR != null)
        .map(d => ({ date: d.date, value: d.restingHR })),
      sleepSeries: windowed
        .filter(d => d.sleepTotalMin != null)
        .map(d => ({ date: d.date, value: d.sleepTotalMin / 60 })),
    };
  }, [days, range]);

  if (days.length === 0) {
    return (
      <p className="text-xs text-center py-8" style={{ color: 'var(--color-text-dim)', fontWeight: 700 }}>
        No health data yet
      </p>
    );
  }

  return (
    <div>
      {/* Headline scoreboard */}
      <div
        className="rounded-xl mb-4 p-4 flex gap-4"
        style={{ backgroundColor: 'var(--color-surface)' }}
      >
        <HeadlineCell
          label="Resting HR"
          value={latestHR ? Math.round(latestHR.restingHR) : '—'}
          unit={latestHR ? 'bpm' : null}
          underlineColor="var(--color-red)"
          subline={avgHR != null ? `7D AVG ${Math.round(avgHR)}` : null}
        />
        <HeadlineCell
          label="Sleep"
          value={latestSleep && latestSleep.sleepTotalMin != null ? formatSleep(latestSleep.sleepTotalMin) : '—'}
          underlineColor={SLEEP_PURPLE}
          subline={avgSleep != null ? `7D AVG ${formatSleep(avgSleep)}` : null}
        />
      </div>

      {/* Sleep stage breakdown */}
      {latestSleep && <SleepStagesBar day={latestSleep} />}

      {/* Trends */}
      <div
        className="rounded-xl mb-4 p-4"
        style={{ backgroundColor: 'var(--color-surface)' }}
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] uppercase" style={{ color: 'var(--color-text-dim)', fontWeight: 700, letterSpacing: '0.15em' }}>
            Trends
          </span>
          <div className="flex gap-1">
            {RANGE_OPTIONS.map(opt => (
              <button
                key={opt.key}
                onClick={() => setRange(opt.key)}
                className="text-[10px] px-2.5 py-1 rounded-full uppercase"
                style={{
                  backgroundColor: range === opt.key ? 'var(--color-accent)' : 'var(--color-surface-hover)',
                  color: range === opt.key ? '#ffffff' : 'var(--color-text-dim)',
                  fontWeight: 700,
                }}
              >
                {opt.key}
              </button>
            ))}
          </div>
        </div>

        <TrendChart
          title="Resting HR (bpm)"
          data={hrSeries}
          color="var(--color-red)"
          formatValue={(v) => String(Math.round(v))}
        />
        <TrendChart
          title="Sleep (hours)"
          data={sleepSeries}
          color={SLEEP_PURPLE}
          formatValue={(v) => v.toFixed(1)}
        />
      </div>
    </div>
  );
}
