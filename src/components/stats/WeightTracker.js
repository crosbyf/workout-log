'use client';

import { useState, useMemo } from 'react';
import { Plus, X, Trash2, Pencil, Check } from 'lucide-react';
import { formatDate, getTodayStr } from '@/utils/format';

const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const RANGE_OPTIONS = [
  { key: '1M', months: 1 },
  { key: '3M', months: 3 },
  { key: '6M', months: 6 },
  { key: 'ALL', months: null },
];

function formatShortDate(dateStr) {
  const [, month, day] = dateStr.split('-').map(Number);
  return `${MONTHS_SHORT[month - 1]} ${day}`;
}

function round1(n) {
  // `+ 0` normalizes -0 so deltas never render as "-0.0"
  return Math.round(n * 10) / 10 + 0;
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
 * SVG line chart for weight over time — smoothed accent line, subtle gridlines,
 * emphasized latest point, and a 1M/3M/6M/ALL range selector.
 */
function WeightChart({ entries }) {
  const [range, setRange] = useState('3M');

  // All entries sorted oldest → newest (duplicate dates kept in stable order)
  const sortedAll = useMemo(() => {
    return [...entries].sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
  }, [entries]);

  const { data, usedFallback } = useMemo(() => {
    const opt = RANGE_OPTIONS.find(o => o.key === range);
    if (!opt || opt.months === null) return { data: sortedAll, usedFallback: false };
    const cutoff = getCutoffStr(opt.months);
    const windowed = sortedAll.filter(e => e.date >= cutoff);
    if (windowed.length >= 2) return { data: windowed, usedFallback: false };
    // Window too sparse — fall back to all-time so the chart never goes blank
    return { data: sortedAll, usedFallback: true };
  }, [sortedAll, range]);

  if (sortedAll.length === 0) return null;

  if (sortedAll.length < 2) {
    return (
      <div className="px-4 pb-4">
        <p className="text-xs text-center py-4" style={{ color: 'var(--color-text-dim)', fontWeight: 700 }}>
          Add one more entry to see the trend
        </p>
      </div>
    );
  }

  const weights = data.map(e => e.weight);
  const rawMin = Math.min(...weights);
  const rawMax = Math.max(...weights);
  // Pad the y-domain so the line never hugs the top/bottom edges
  const domainPad = Math.max(0.6, (rawMax - rawMin) * 0.18);
  const minW = rawMin - domainPad;
  const maxW = rawMax + domainPad;
  const span = maxW - minW || 1;

  const chartW = 320;
  const chartH = 150;
  const padLeft = 10;
  const padRight = 42;  // space for right-aligned gridline labels
  const padTop = 18;
  const padBottom = 24; // space for first/last date labels
  const innerW = chartW - padLeft - padRight;
  const innerH = chartH - padTop - padBottom;

  const points = data.map((entry, idx) => {
    const x = padLeft + (data.length === 1 ? 0.5 : idx / (data.length - 1)) * innerW;
    const y = padTop + innerH - ((entry.weight - minW) / span) * innerH;
    return { x, y, entry };
  });

  const lineD = smoothPath(points);
  const areaD = `${lineD} L ${points[points.length - 1].x.toFixed(1)} ${(padTop + innerH).toFixed(1)} L ${points[0].x.toFixed(1)} ${(padTop + innerH).toFixed(1)} Z`;

  // 3 subtle gridlines: bottom / middle / top of the padded domain
  const gridFracs = [0, 0.5, 1];
  const gridLines = gridFracs.map(frac => ({
    frac,
    label: round1(minW + frac * span).toFixed(1),
    y: padTop + innerH - frac * innerH,
  }));

  const last = points[points.length - 1];
  const labelY = Math.max(last.y - 9, 11);

  return (
    <div className="pb-3">
      {/* Range pills */}
      <div className="px-4 flex items-center justify-between mb-1">
        <span className="text-[10px] uppercase" style={{ color: 'var(--color-text-dim)', fontWeight: 700, letterSpacing: '0.15em' }}>
          Trend
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

      <div className="px-4">
        <svg viewBox={`0 0 ${chartW} ${chartH}`} className="w-full h-auto block">
          {/* Gridlines with right-aligned weight labels */}
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
          <path d={areaD} fill="var(--color-accent)" opacity="0.08" />

          {/* Smoothed line */}
          <path
            d={lineD}
            fill="none"
            stroke="var(--color-accent)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data points — only when sparse enough to read */}
          {points.length <= 20 && points.slice(0, -1).map((p, i) => (
            <circle key={i} cx={p.x} cy={p.y} r="2.5" fill="var(--color-accent)" />
          ))}

          {/* Latest point: filled dot + subtle outer ring + value */}
          <circle cx={last.x} cy={last.y} r="7" fill="none" stroke="var(--color-accent)" strokeWidth="1.5" opacity="0.35" />
          <circle cx={last.x} cy={last.y} r="3.5" fill="var(--color-accent)" />
          <text
            x={Math.min(last.x, chartW - padRight)}
            y={labelY}
            textAnchor="end" fontSize="10" fontWeight="800" fill="var(--color-accent)"
          >
            {round1(data[data.length - 1].weight)}
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

        {usedFallback && (
          <p className="text-[10px] text-center mt-1" style={{ color: 'var(--color-text-dim)', fontWeight: 700 }}>
            Not enough entries in {range} — showing all time
          </p>
        )}
      </div>
    </div>
  );
}

export default function WeightTracker({ entries = [], latest, onAdd, onUpdate, onDelete }) {
  const [showForm, setShowForm] = useState(false);
  const [weight, setWeight] = useState('');
  const [entryDate, setEntryDate] = useState(getTodayStr());
  const [showHistory, setShowHistory] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editWeight, setEditWeight] = useState('');
  const [editDate, setEditDate] = useState('');

  const handleSubmit = () => {
    const w = parseFloat(weight);
    if (!w || w <= 0) return;
    onAdd({ weight: w, date: entryDate });
    setWeight('');
    setEntryDate(getTodayStr());
    setShowForm(false);
  };

  const handleStartEdit = (entry) => {
    setEditingId(entry.id);
    setEditWeight(String(entry.weight));
    setEditDate(entry.date);
  };

  const handleSaveEdit = () => {
    const w = parseFloat(editWeight);
    if (!w || w <= 0) return;
    onUpdate(editingId, { weight: w, date: editDate });
    setEditingId(null);
    setEditWeight('');
    setEditDate('');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditWeight('');
    setEditDate('');
  };

  // History rows: newest first, each with a delta vs the previous entry chronologically
  const historyRows = useMemo(() => {
    const sorted = [...entries].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
    return sorted.slice(0, 30).map((entry, idx) => {
      const prev = sorted[idx + 1]; // older neighbor
      const delta = prev ? round1(entry.weight - prev.weight) : null;
      return { entry, delta };
    });
  }, [entries]);

  // Simple trend: compare latest to 7-day-old entry
  const trend = useMemo(() => {
    if (entries.length < 2) return null;
    const newest = entries[0].weight;
    const newestDate = new Date(entries[0].date);
    const older = entries.find(e => {
      const d = new Date(e.date);
      return (newestDate - d) >= 7 * 24 * 60 * 60 * 1000;
    });
    if (!older) return null;
    const diff = newest - older.weight;
    return { diff: diff.toFixed(1), direction: diff > 0 ? 'up' : diff < 0 ? 'down' : 'flat' };
  }, [entries]);

  return (
    <div
      className="rounded-xl mb-4 overflow-hidden"
      style={{ backgroundColor: 'var(--color-surface)' }}
    >
      {/* Header */}
      <div className="p-4 flex items-center justify-between">
        <div>
          <div className="text-[10px] uppercase mb-0.5" style={{ color: 'var(--color-text-dim)', fontWeight: 700, letterSpacing: '0.15em' }}>
            Body Weight
          </div>
          <div
            className="flex items-baseline gap-2"
            style={{ borderBottom: '3px solid var(--color-accent)', paddingBottom: '6px', width: 'fit-content' }}
          >
            <span className="text-2xl" style={{ color: 'var(--color-text)', fontWeight: 800 }}>
              {latest ? `${latest.weight}` : '\u2014'}
            </span>
            {latest && (
              <span className="text-sm" style={{ color: 'var(--color-text-dim)' }}>
                {latest.unit}
              </span>
            )}
            {trend && (
              <span
                className="text-xs font-medium"
                style={{
                  color: trend.direction === 'down' ? 'var(--color-green)' : trend.direction === 'up' ? 'var(--color-red)' : 'var(--color-text-dim)',
                }}
              >
                {trend.direction === 'up' ? '\u2191' : trend.direction === 'down' ? '\u2193' : '\u2192'}{Math.abs(trend.diff)}
              </span>
            )}
          </div>
          {latest && (
            <span className="text-[10px] block mt-1 truncate" style={{ color: 'var(--color-text-dim)' }}>
              Last weighed {formatShortDate(latest.date)} {'\u00b7'} {entries.length} total
            </span>
          )}
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: 'var(--color-accent)', color: '#ffffff' }}
        >
          {showForm ? <X size={18} /> : <Plus size={18} />}
        </button>
      </div>

      {/* Chart */}
      <WeightChart entries={entries} />

      {/* Add form */}
      {showForm && (
        <div className="px-4 pb-3" style={{ borderTop: '1px solid var(--color-border)' }}>
          <div className="flex gap-2 mt-3">
            <input
              type="number"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="Weight (lbs)"
              step="0.1"
              className="flex-1 text-sm px-3 py-2 rounded-lg bg-transparent border"
              style={{
                borderColor: 'var(--color-border)',
                color: 'var(--color-text)',
              }}
              inputMode="decimal"
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            />
            <input
              type="date"
              value={entryDate}
              onChange={(e) => setEntryDate(e.target.value)}
              max={getTodayStr()}
              className="text-sm px-2 py-2 rounded-lg bg-transparent border"
              style={{
                borderColor: 'var(--color-border)',
                color: 'var(--color-text)',
                colorScheme: 'dark',
              }}
            />
          </div>
          <button
            onClick={handleSubmit}
            disabled={!weight || parseFloat(weight) <= 0}
            className="w-full mt-2 py-2 rounded-lg text-sm font-bold"
            style={{
              backgroundColor: !weight || parseFloat(weight) <= 0
                ? 'var(--color-surface-hover)'
                : 'var(--color-accent)',
              color: !weight || parseFloat(weight) <= 0
                ? 'var(--color-text-dim)'
                : '#ffffff',
            }}
          >
            Save
          </button>
        </div>
      )}

      {/* History toggle */}
      {entries.length > 0 && (
        <div style={{ borderTop: '1px solid var(--color-border)' }}>
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="w-full py-2 text-xs text-center"
            style={{ color: 'var(--color-text-dim)' }}
          >
            {showHistory ? 'Hide history' : 'Show history'}
          </button>
          {showHistory && (
            <div className="px-4 pb-3">
              {historyRows.map(({ entry, delta }, idx) => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between"
                  style={{
                    minHeight: '40px',
                    borderBottom: idx < historyRows.length - 1 ? '1px solid var(--color-border)' : 'none',
                  }}
                >
                  {editingId === entry.id ? (
                    /* Editing mode */
                    <div className="flex items-center gap-2 flex-1">
                      <input
                        type="date"
                        value={editDate}
                        onChange={(e) => setEditDate(e.target.value)}
                        max={getTodayStr()}
                        className="text-xs px-1.5 py-1 rounded bg-transparent border"
                        style={{
                          borderColor: 'var(--color-border)',
                          color: 'var(--color-text)',
                          colorScheme: 'dark',
                          width: '120px',
                        }}
                      />
                      <input
                        type="number"
                        value={editWeight}
                        onChange={(e) => setEditWeight(e.target.value)}
                        step="0.1"
                        className="text-xs px-1.5 py-1 rounded bg-transparent border"
                        style={{
                          borderColor: 'var(--color-border)',
                          color: 'var(--color-text)',
                          width: '70px',
                        }}
                        inputMode="decimal"
                        onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit()}
                      />
                      <button onClick={handleSaveEdit} className="p-1">
                        <Check size={14} style={{ color: 'var(--color-green)' }} />
                      </button>
                      <button onClick={handleCancelEdit} className="p-1">
                        <X size={14} style={{ color: 'var(--color-text-dim)' }} />
                      </button>
                    </div>
                  ) : (
                    /* Display mode */
                    <>
                      <span className="text-xs" style={{ color: 'var(--color-text-dim)', fontWeight: 700 }}>
                        {formatDate(entry.date)}
                      </span>
                      <div className="flex items-center gap-2">
                        {delta !== null && (
                          <span
                            className="text-xs"
                            style={{
                              fontWeight: 700,
                              // Body weight: down = green, up = red
                              color: delta < 0
                                ? 'var(--color-green)'
                                : delta > 0
                                  ? 'var(--color-red)'
                                  : 'var(--color-text-dim)',
                            }}
                          >
                            {delta > 0 ? `+${delta.toFixed(1)}` : delta.toFixed(1)}
                          </span>
                        )}
                        <span className="text-xs" style={{ color: 'var(--color-text)', fontWeight: 700 }}>
                          {round1(entry.weight)} {entry.unit}
                        </span>
                        <button
                          onClick={() => handleStartEdit(entry)}
                          className="p-1 opacity-50"
                        >
                          <Pencil size={10} style={{ color: 'var(--color-accent)' }} />
                        </button>
                        {deleteConfirmId === entry.id ? (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => { onDelete(entry.id); setDeleteConfirmId(null); }}
                              className="text-[10px] font-bold px-1.5 py-0.5 rounded"
                              style={{ backgroundColor: 'var(--color-red)', color: '#ffffff' }}
                            >
                              Delete
                            </button>
                            <button
                              onClick={() => setDeleteConfirmId(null)}
                              className="text-[10px] px-1.5 py-0.5 rounded"
                              style={{ backgroundColor: 'var(--color-surface-hover)', color: 'var(--color-text-dim)' }}
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setDeleteConfirmId(entry.id)}
                            className="p-1 opacity-50"
                          >
                            <Trash2 size={10} style={{ color: 'var(--color-red)' }} />
                          </button>
                        )}
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
