'use client';

import { useState } from 'react';
import { X, Coffee } from 'lucide-react';
import { getTodayStr } from '@/utils/format';

export default function DayOffEntry({ onSave, onCancel }) {
  const [notes, setNotes] = useState('');

  const handleSave = () => {
    onSave({
      date: getTodayStr(),
      exercises: [],
      notes: notes.trim(),
      location: 'Day Off',
      structure: 'standard',
      structureDuration: null,
      elapsedTime: 0,
      isDayOff: true,
    });
  };

  return (
    <div
      className="fixed inset-0 flex flex-col"
      style={{ backgroundColor: 'var(--color-bg)', zIndex: 10000 }}
    >
      {/* Header — with safe area padding for notch/status bar */}
      <div
        className="flex items-center justify-between px-4 py-3 shrink-0"
        style={{
          borderBottom: '1px solid var(--color-border)',
          paddingTop: 'max(12px, env(safe-area-inset-top))',
        }}
      >
        <div className="flex items-center gap-2">
          <Coffee size={18} style={{ color: 'var(--color-text-muted)' }} />
          <span className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
            Day Off
          </span>
        </div>
        <button onClick={onCancel} className="p-1" aria-label="Cancel">
          <X size={20} style={{ color: 'var(--color-text-muted)' }} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 px-4 py-6">
        <p className="text-sm mb-6" style={{ color: 'var(--color-text-muted)' }}>
          Log a rest day. Add optional notes about recovery, how you&apos;re feeling, or plans for tomorrow.
        </p>

        <label
          className="text-xs font-semibold uppercase tracking-wider mb-1.5 block"
          style={{ color: 'var(--color-text-muted)' }}
        >
          Notes (optional)
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Active recovery, stretching, rest..."
          rows={4}
          className="w-full text-sm py-3 px-3 rounded-lg border-0 outline-none resize-none"
          style={{
            backgroundColor: 'var(--color-surface)',
            color: 'var(--color-text)',
          }}
          autoFocus
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
          className="flex-1 py-3 rounded-lg text-sm font-bold"
          style={{
            backgroundColor: 'var(--color-accent)',
            color: '#ffffff',
          }}
        >
          Save Day Off
        </button>
      </div>
    </div>
  );
}
