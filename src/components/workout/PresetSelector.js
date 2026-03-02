'use client';

import { useEffect, useState } from 'react';
import { Coffee, Footprints } from 'lucide-react';
import { PRESET_COLORS } from '@/hooks/usePresets';

export default function PresetSelector({ presets, onSelect, onClose }) {
  const [visible, setVisible] = useState(false);

  // Lock body scroll + animate in
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    const timer = window.setTimeout(() => setVisible(true), 10);
    return () => {
      window.clearTimeout(timer);
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, []);

  const handleClose = () => {
    setVisible(false);
    window.setTimeout(() => onClose(), 200);
  };

  // Split presets: regular workouts first, Day Off last
  const visiblePresets = presets.filter(p => !p.hidden && !p.isDayOff);
  const dayOffPreset = presets.find(p => p.isDayOff);

  // Total items: visiblePresets + Run + Day Off
  const totalItems = visiblePresets.length + (dayOffPreset ? 2 : 1);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0"
        style={{
          backgroundColor: visible ? 'rgba(0,0,0,0.4)' : 'rgba(0,0,0,0)',
          transition: 'background-color 0.2s ease',
          touchAction: 'none',
          zIndex: 10000,
        }}
        onClick={handleClose}
      />

      {/* Dropdown menu — positioned from top-left where the + button is */}
      <div
        style={{
          position: 'fixed',
          zIndex: 10001,
          top: 'calc(env(safe-area-inset-top) + 3.5rem + 4px)',
          left: '12px',
          width: '220px',
          maxHeight: '70vh',
          backgroundColor: 'var(--color-surface)',
          borderRadius: '14px',
          overflow: 'hidden',
          boxShadow: '0 8px 32px rgba(0,0,0,0.35), 0 2px 8px rgba(0,0,0,0.2)',
          transform: visible ? 'scale(1) translateY(0)' : 'scale(0.9) translateY(-8px)',
          opacity: visible ? 1 : 0,
          transition: 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.15s ease',
          transformOrigin: 'top left',
        }}
      >
        {/* Scrollable preset list */}
        <div
          className="overflow-y-auto"
          style={{
            WebkitOverflowScrolling: 'touch',
            maxHeight: '70vh',
          }}
        >
          {/* Workout presets */}
          {visiblePresets.map((preset, idx) => {
            const color = PRESET_COLORS[preset.color];
            return (
              <button
                key={preset.id}
                onClick={() => {
                  handleClose();
                  window.setTimeout(() => onSelect(preset), 200);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 text-left active:opacity-70"
                style={{ borderBottom: '1px solid var(--color-border)' }}
              >
                <div
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ backgroundColor: color || 'var(--color-accent)' }}
                />
                <div>
                  <span className="text-sm font-semibold block" style={{ color: 'var(--color-text)' }}>
                    {preset.name}
                  </span>
                  <span className="text-[10px]" style={{ color: 'var(--color-text-dim)' }}>
                    {preset.exercises.length} exercise{preset.exercises.length !== 1 ? 's' : ''}
                  </span>
                </div>
              </button>
            );
          })}

          {/* Run option — above Day Off */}
          <button
            onClick={() => {
              handleClose();
              window.setTimeout(() => onSelect({ isRun: true }), 200);
            }}
            className="w-full flex items-center gap-3 px-4 py-3 text-left active:opacity-70"
            style={{ borderBottom: dayOffPreset ? '1px solid var(--color-border)' : 'none' }}
          >
            <Footprints size={16} style={{ color: '#f59e0b' }} />
            <div>
              <span className="text-sm font-semibold block" style={{ color: 'var(--color-text)' }}>
                Run
              </span>
              <span className="text-[10px]" style={{ color: 'var(--color-text-dim)' }}>
                Distance, time &amp; pace
              </span>
            </div>
          </button>

          {/* Day Off — always last */}
          {dayOffPreset && (
            <button
              onClick={() => {
                handleClose();
                window.setTimeout(() => onSelect(dayOffPreset), 200);
              }}
              className="w-full flex items-center gap-3 px-4 py-3 text-left active:opacity-70"
            >
              <Coffee size={16} style={{ color: 'var(--color-text-muted)' }} />
              <div>
                <span className="text-sm font-semibold block" style={{ color: 'var(--color-text)' }}>
                  Day Off
                </span>
                <span className="text-[10px]" style={{ color: 'var(--color-text-dim)' }}>
                  Log a rest day
                </span>
              </div>
            </button>
          )}
        </div>
      </div>
    </>
  );
}
