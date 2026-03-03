'use client';

import { useState, useMemo } from 'react';
import { Plus, X, Trash2, Pencil, Check } from 'lucide-react';
import { formatDate, getTodayStr } from '@/utils/format';

const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function formatShortDate(dateStr) {
  const [, month, day] = dateStr.split('-').map(Number);
  return `${MONTHS_SHORT[month - 1]} ${day}`;
}

/**
 * SVG line chart for weight over time — with Y-axis weight labels and date axis.
 */
function WeightChart({ entries }) {
  // Show up to last 30 entries, oldest first
  const data = entries.slice(0, 30).reverse();
  if (data.length < 2) return null;

  const weights = data.map(e => e.weight);
  const rawMin = Math.min(...weights);
  const rawMax = Math.max(...weights);
  // Round min/max to whole numbers for clean axis labels, with padding
  const minW = Math.floor(rawMin - 0.5);
  const maxW = Math.ceil(rawMax + 0.5);
  const range = maxW - minW || 1;

  const chartW = 320;
  const chartH = 140;
  const padLeft = 36;  // space for Y-axis labels
  const padRight = 10;
  const padTop = 12;
  const padBottom = 22; // space for X-axis date labels
  const innerW = chartW - padLeft - padRight;
  const innerH = chartH - padTop - padBottom;

  const points = data.map((entry, idx) => {
    const x = padLeft + (idx / (data.length - 1)) * innerW;
    const y = padTop + innerH - ((entry.weight - minW) / range) * innerH;
    return { x, y, entry };
  });

  const pathD = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    .join(' ');

  // Area fill
  const areaD = `${pathD} L ${points[points.length - 1].x.toFixed(1)} ${padTop + innerH} L ${points[0].x.toFixed(1)} ${padTop + innerH} Z`;

  // Y-axis: 5 evenly spaced labels
  const yTicks = [0, 0.25, 0.5, 0.75, 1];
  const yLabels = yTicks.map(frac => {
    const val = minW + frac * range;
    return { frac, label: Math.round(val * 10) / 10, y: padTop + innerH - frac * innerH };
  });

  // X-axis: show first, middle, and last dates
  const xDates = [];
  if (data.length >= 3) {
    const midIdx = Math.floor(data.length / 2);
    xDates.push({ idx: 0, label: formatShortDate(data[0].date) });
    xDates.push({ idx: midIdx, label: formatShortDate(data[midIdx].date) });
    xDates.push({ idx: data.length - 1, label: formatShortDate(data[data.length - 1].date) });
  } else {
    xDates.push({ idx: 0, label: formatShortDate(data[0].date) });
    xDates.push({ idx: data.length - 1, label: formatShortDate(data[data.length - 1].date) });
  }

  return (
    <div className="px-4 pb-3">
      <svg viewBox={`0 0 ${chartW} ${chartH}`} className="w-full" style={{ height: '140px' }}>
        {/* Grid lines + Y-axis labels */}
        {yLabels.map(({ frac, label, y }) => (
          <g key={frac}>
            <line
              x1={padLeft} y1={y} x2={chartW - padRight} y2={y}
              stroke="var(--color-border)" strokeWidth="0.5" strokeDasharray="2,2"
            />
            <text
              x={padLeft - 4} y={y + 3}
              textAnchor="end" fontSize="8" fill="var(--color-text-dim)"
            >
              {label}
            </text>
          </g>
        ))}

        {/* Area fill */}
        <path d={areaD} fill="var(--color-accent)" opacity="0.1" />

        {/* Line */}
        <path d={pathD} fill="none" stroke="var(--color-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

        {/* Data points */}
        {points.map((p, i) => (
          <circle
            key={i}
            cx={p.x} cy={p.y} r="2.5"
            fill="var(--color-accent)"
          />
        ))}

        {/* Highlight latest point */}
        {points.length > 0 && (
          <>
            <circle
              cx={points[points.length - 1].x} cy={points[points.length - 1].y} r="4"
              fill="var(--color-accent)" opacity="0.3"
            />
            <text
              x={points[points.length - 1].x}
              y={points[points.length - 1].y - 7}
              textAnchor="middle" fontSize="8" fontWeight="bold" fill="var(--color-accent)"
            >
              {data[data.length - 1].weight}
            </text>
          </>
        )}

        {/* X-axis date labels */}
        {xDates.map(({ idx, label }) => {
          const x = padLeft + (idx / (data.length - 1)) * innerW;
          const anchor = idx === 0 ? 'start' : idx === data.length - 1 ? 'end' : 'middle';
          return (
            <text
              key={idx}
              x={x} y={chartH - 4}
              textAnchor={anchor} fontSize="8" fill="var(--color-text-dim)"
            >
              {label}
            </text>
          );
        })}
      </svg>
    </div>
  );
}

export default function WeightTracker({ entries = [], latest, onAdd, onUpdate, onDelete }) {
  const [showForm, setShowForm] = useState(false);
  const [weight, setWeight] = useState('');
  const [entryDate, setEntryDate] = useState(getTodayStr());
  const [showHistory, setShowHistory] = useState(false);
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
          <div className="text-xs font-medium mb-0.5" style={{ color: 'var(--color-text-dim)' }}>
            Body Weight
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>
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
            <span className="text-[10px]" style={{ color: 'var(--color-text-dim)' }}>
              Last weighed {formatShortDate(latest.date)} \u00b7 {entries.length} total
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
              {entries.slice(0, 30).map(entry => (
                <div key={entry.id} className="flex items-center justify-between py-1.5">
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
                      <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                        {formatDate(entry.date)}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium" style={{ color: 'var(--color-text)' }}>
                          {entry.weight} {entry.unit}
                        </span>
                        <button
                          onClick={() => handleStartEdit(entry)}
                          className="p-1 opacity-50"
                        >
                          <Pencil size={10} style={{ color: 'var(--color-accent)' }} />
                        </button>
                        <button
                          onClick={() => onDelete(entry.id)}
                          className="p-1 opacity-50"
                        >
                          <Trash2 size={10} style={{ color: 'var(--color-red)' }} />
                        </button>
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
