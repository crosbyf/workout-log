'use client';

import { useState } from 'react';
import { X, ChevronDown } from 'lucide-react';
import { getTodayStr } from '@/utils/format';

function formatPace(miles, totalMinutes) {
  if (!miles || miles <= 0 || !totalMinutes || totalMinutes <= 0) return '—';
  const paceMin = totalMinutes / miles;
  const min = Math.floor(paceMin);
  const sec = Math.round((paceMin - min) * 60);
  return `${min}:${String(sec).padStart(2, '0')}`;
}

function formatDateLabel(dateStr) {
  const today = getTodayStr();
  if (dateStr === today) return 'Today';
  const d = new Date(dateStr + 'T12:00:00');
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;
  if (dateStr === yStr) return 'Yesterday';
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

export default function RunEntry({ onSave, onCancel, existingWorkout }) {
  const isEditing = !!existingWorkout;
  const [date, setDate] = useState(existingWorkout ? existingWorkout.date : getTodayStr());
  const [distance, setDistance] = useState(existingWorkout ? String(existingWorkout.runDistance || '') : '');
  const [minutes, setMinutes] = useState(
    existingWorkout && existingWorkout.runTime
      ? String(Math.floor(existingWorkout.runTime / 60))
      : ''
  );
  const [seconds, setSeconds] = useState(
    existingWorkout && existingWorkout.runTime
      ? String(existingWorkout.runTime % 60)
      : ''
  );
  const [notes, setNotes] = useState(existingWorkout ? (existingWorkout.notes || '') : '');

  const distanceNum = parseFloat(distance) || 0;
  const totalMinutes = (parseInt(minutes, 10) || 0) + (parseInt(seconds, 10) || 0) / 60;
  const pace = formatPace(distanceNum, totalMinutes);
  const totalSeconds = (parseInt(minutes, 10) || 0) * 60 + (parseInt(seconds, 10) || 0);
  const canSave = distanceNum > 0 && totalSeconds > 0;

  const handleSave = () => {
    if (!canSave) return;
    onSave({
      date,
      exercises: [],
      notes: notes.trim(),
      location: 'Run',
      structure: 'standard',
      structureDuration: null,
      elapsedTime: totalSeconds,
      isRun: true,
      runDistance: distanceNum,
      runTime: totalSeconds,
      runPace: pace,
    });
  };

  return (
    <div
      className="fixed inset-0 flex flex-col"
      style={{ backgroundColor: 'var(--color-bg)', zIndex: 10000 }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 shrink-0"
        style={{
          borderBottom: '1px solid var(--color-border)',
          paddingTop: 'max(12px, env(safe-area-inset-top))',
        }}
      >
        <span className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
          {isEditing ? 'Edit Run' : 'Log Run'}
        </span>
        <button onClick={onCancel} className="p-1" aria-label="Cancel">
          <X size={20} style={{ color: 'var(--color-text-muted)' }} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 px-4 py-6 overflow-y-auto">
        {/* Date */}
        <label
          className="text-xs font-semibold uppercase tracking-wider mb-1.5 block"
          style={{ color: 'var(--color-text-muted)' }}
        >
          Date
        </label>
        <div className="relative mb-5">
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            max={getTodayStr()}
            className="w-full text-sm font-semibold py-3 px-3 rounded-lg border-0 outline-none appearance-none"
            style={{
              backgroundColor: 'var(--color-surface)',
              color: 'var(--color-text)',
              colorScheme: 'dark',
            }}
          />
          <div
            className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none flex items-center gap-1"
          >
            <span className="text-xs" style={{ color: '#f59e0b' }}>{formatDateLabel(date)}</span>
            <ChevronDown size={14} style={{ color: 'var(--color-text-dim)' }} />
          </div>
        </div>

        {/* Distance */}
        <label
          className="text-xs font-semibold uppercase tracking-wider mb-1.5 block"
          style={{ color: 'var(--color-text-muted)' }}
        >
          Distance (miles)
        </label>
        <input
          type="number"
          value={distance}
          onChange={(e) => setDistance(e.target.value)}
          placeholder="3.1"
          step="0.01"
          inputMode="decimal"
          className="w-full text-2xl font-bold py-3 px-3 rounded-lg border-0 outline-none mb-5"
          style={{
            backgroundColor: 'var(--color-surface)',
            color: 'var(--color-accent)',
          }}
          autoFocus={!isEditing}
        />

        {/* Time */}
        <label
          className="text-xs font-semibold uppercase tracking-wider mb-1.5 block"
          style={{ color: 'var(--color-text-muted)' }}
        >
          Time
        </label>
        <div className="flex items-center gap-2 mb-5">
          <div className="flex-1">
            <input
              type="number"
              value={minutes}
              onChange={(e) => setMinutes(e.target.value)}
              placeholder="0"
              inputMode="numeric"
              className="w-full text-2xl font-bold py-3 px-3 rounded-lg border-0 outline-none text-center"
              style={{
                backgroundColor: 'var(--color-surface)',
                color: 'var(--color-accent)',
              }}
            />
            <span className="text-[10px] text-center block mt-1" style={{ color: 'var(--color-text-dim)' }}>
              min
            </span>
          </div>
          <span className="text-2xl font-bold" style={{ color: 'var(--color-text-dim)' }}>:</span>
          <div className="flex-1">
            <input
              type="number"
              value={seconds}
              onChange={(e) => {
                const val = e.target.value;
                if (val === '' || (parseInt(val, 10) >= 0 && parseInt(val, 10) < 60)) {
                  setSeconds(val);
                }
              }}
              placeholder="00"
              inputMode="numeric"
              className="w-full text-2xl font-bold py-3 px-3 rounded-lg border-0 outline-none text-center"
              style={{
                backgroundColor: 'var(--color-surface)',
                color: 'var(--color-accent)',
              }}
            />
            <span className="text-[10px] text-center block mt-1" style={{ color: 'var(--color-text-dim)' }}>
              sec
            </span>
          </div>
        </div>

        {/* Live pace calculation */}
        <div
          className="rounded-xl p-4 mb-5 text-center"
          style={{ backgroundColor: 'var(--color-surface)' }}
        >
          <span className="text-[10px] uppercase tracking-wider font-medium block mb-1" style={{ color: 'var(--color-text-dim)' }}>
            Pace
          </span>
          <span className="text-3xl font-bold" style={{ color: canSave ? '#f59e0b' : 'var(--color-text-dim)' }}>
            {pace}
          </span>
          {canSave && (
            <span className="text-xs block mt-0.5" style={{ color: 'var(--color-text-dim)' }}>
              min/mile
            </span>
          )}
        </div>

        {/* Notes */}
        <label
          className="text-xs font-semibold uppercase tracking-wider mb-1.5 block"
          style={{ color: 'var(--color-text-muted)' }}
        >
          Notes (optional)
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Route, conditions, how it felt..."
          rows={3}
          className="w-full text-sm py-3 px-3 rounded-lg border-0 outline-none resize-none"
          style={{
            backgroundColor: 'var(--color-surface)',
            color: 'var(--color-text)',
          }}
        />
      </div>

      {/* Bottom action bar */}
      <div
        className="flex gap-3 px-4 py-3 shrink-0"
        style={{
          borderTop: '1px solid var(--color-border)',
          paddingBottom: 'max(12px, env(safe-area-inset-bottom))',
        }}
      >
        <button
          onClick={onCancel}
          className="flex-1 py-3 rounded-lg text-sm font-medium"
          style={{
            backgroundColor: 'var(--color-surface)',
            color: 'var(--color-text-muted)',
          }}
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={!canSave}
          className="flex-1 py-3 rounded-lg text-sm font-bold"
          style={{
            backgroundColor: canSave ? '#f59e0b' : 'var(--color-surface-hover)',
            color: canSave ? '#ffffff' : 'var(--color-text-dim)',
          }}
        >
          {isEditing ? 'Update Run' : 'Save Run'}
        </button>
      </div>
    </div>
  );
}
