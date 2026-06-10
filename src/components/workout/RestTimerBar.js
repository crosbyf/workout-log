'use client';

import { useState, useEffect } from 'react';
import { formatDuration } from '@/utils/format';

const DURATION_OPTIONS = [60, 120, 180, 240]; // seconds
const GO_HOLD_MS = 4000; // how long the GO state lingers after the countdown ends
const REST_COLOR = '#f59e0b'; // hardcoded run/rest orange (matches run accents)

function formatRest(totalSeconds) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

/**
 * Slim rest-interval bar for the workout entry sheet.
 *
 * Presentational + tick logic only — WorkoutEntry owns the state values.
 * Wall-clock based like useTimer: the end timestamp is the source of truth,
 * a 500ms interval just recomputes remaining, and visibilitychange resyncs
 * after screen-off so the countdown stays correct in the background.
 *
 * States:
 *  - Idle:    big elapsed time + duration pills
 *  - Resting: big orange countdown + next-exercise hint + draining bar;
 *             tapping the countdown skips the rest
 *  - GO:      green "GO" + full green bar for ~4s, then auto-clears via onSkip
 *
 * `condensed` renders a single-line (~36px) variant used while the iOS
 * keyboard is up: countdown/elapsed + next-exercise hint inline, thin
 * progress track below, no duration pills.
 */
export default function RestTimerBar({
  restEndsAt,      // timestamp | null
  restTotalSec,    // total seconds of the running countdown (for progress %)
  elapsedSeconds,  // workout elapsed time from WorkoutEntry's existing timer
  nextName,        // next exercise hint (string | null)
  restDuration,    // currently selected duration in seconds
  onSelectDuration,
  onSkip,          // clears the countdown (tap-to-skip and GO expiry)
  condensed = false,
}) {
  const [now, setNow] = useState(() => Date.now());

  // Tick while a countdown (or its GO hold) is active
  useEffect(() => {
    if (!restEndsAt) return;
    const tick = () => setNow(Date.now());
    tick();
    const id = window.setInterval(tick, 500);
    const onVisibility = () => {
      if (document.visibilityState === 'visible') tick();
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      window.clearInterval(id);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [restEndsAt]);

  const remainingMs = restEndsAt ? restEndsAt - now : 0;
  const resting = !!restEndsAt && remainingMs > 0;
  const go = !!restEndsAt && remainingMs <= 0;

  // After the GO hold elapses, return to idle. Wall-clock safe: waking the
  // screen long after expiry jumps straight back to idle on the first tick.
  useEffect(() => {
    if (restEndsAt && now - restEndsAt >= GO_HOLD_MS) onSkip();
  }, [restEndsAt, now, onSkip]);

  const remainingSec = Math.max(0, Math.ceil(remainingMs / 1000));
  const progress = resting && restTotalSec > 0
    ? Math.min(100, Math.max(0, (remainingMs / (restTotalSec * 1000)) * 100))
    : go ? 100 : 0;

  // Condensed single-line variant (keyboard-open mode)
  if (condensed) {
    return (
      <div
        className="px-4 shrink-0"
        style={{ paddingTop: 6, paddingBottom: 6, borderBottom: '1px solid var(--color-border)' }}
      >
        {!restEndsAt ? (
          <div className="flex items-baseline gap-2 min-w-0">
            <span
              className="font-mono shrink-0"
              style={{ fontSize: 16, fontWeight: 800, color: 'var(--color-text)', lineHeight: 1.1 }}
            >
              {formatDuration(elapsedSeconds)}
            </span>
            <span
              className="uppercase truncate"
              style={{ fontSize: 10, fontWeight: 700, color: 'var(--color-text-dim)', letterSpacing: '0.12em' }}
            >
              Elapsed
            </span>
          </div>
        ) : (
          <button
            onClick={onSkip}
            className="flex items-baseline gap-2 min-w-0 w-full text-left"
            aria-label="Skip rest"
          >
            <span
              className="font-mono shrink-0"
              style={{ fontSize: 16, fontWeight: 800, color: go ? 'var(--color-green)' : REST_COLOR, lineHeight: 1.1 }}
            >
              {go ? 'GO' : formatRest(remainingSec)}
            </span>
            <span
              className="uppercase truncate"
              style={{ fontSize: 10, fontWeight: 700, color: 'var(--color-text-dim)', letterSpacing: '0.12em' }}
            >
              {go
                ? (nextName ? `Next: ${nextName}` : 'Go')
                : (nextName ? `Next: ${nextName}` : 'Rest')}
            </span>
          </button>
        )}

        {/* Thin progress track — transparent when idle so the height stays stable */}
        <div
          className="mt-1 rounded-full overflow-hidden"
          style={{ height: 3, backgroundColor: restEndsAt ? 'var(--color-surface-hover)' : 'transparent' }}
        >
          <div
            className="h-full rounded-full"
            style={{ width: `${progress}%`, backgroundColor: go ? 'var(--color-green)' : REST_COLOR }}
          />
        </div>
      </div>
    );
  }

  return (
    <div
      className="px-4 pt-1.5 pb-1.5 shrink-0"
      style={{ borderBottom: '1px solid var(--color-border)' }}
    >
      <div className="flex items-center justify-between gap-2">
        {/* Left: elapsed (idle) or countdown / GO */}
        {!restEndsAt ? (
          <div>
            <div
              className="font-mono"
              style={{ fontSize: 24, fontWeight: 800, color: 'var(--color-text)', lineHeight: 1.05 }}
            >
              {formatDuration(elapsedSeconds)}
            </div>
            <div
              className="uppercase"
              style={{ fontSize: 10, fontWeight: 700, color: 'var(--color-text-dim)', letterSpacing: '0.12em' }}
            >
              Elapsed
            </div>
          </div>
        ) : (
          <button onClick={onSkip} className="text-left min-w-0" aria-label="Skip rest">
            <div
              className="font-mono"
              style={{ fontSize: 24, fontWeight: 800, color: go ? 'var(--color-green)' : REST_COLOR, lineHeight: 1.05 }}
            >
              {go ? 'GO' : formatRest(remainingSec)}
            </div>
            <div
              className="uppercase truncate"
              style={{ fontSize: 10, fontWeight: 700, color: 'var(--color-text-dim)', letterSpacing: '0.12em' }}
            >
              {go
                ? (nextName ? `Next: ${nextName}` : 'Go')
                : (nextName ? `Rest · Next: ${nextName}` : 'Rest')}
            </div>
          </button>
        )}

        {/* Right: duration pills (idle) or shrunk elapsed */}
        {!restEndsAt ? (
          <div className="flex gap-1 shrink-0">
            {DURATION_OPTIONS.map(sec => (
              <button
                key={sec}
                onClick={() => onSelectDuration(sec)}
                className="px-2 py-1 text-[11px] rounded-full transition-colors"
                style={{
                  backgroundColor: restDuration === sec ? 'var(--color-accent)' : 'var(--color-surface-hover)',
                  color: restDuration === sec ? '#ffffff' : 'var(--color-text-dim)',
                  fontWeight: 700,
                }}
              >
                {formatRest(sec)}
              </button>
            ))}
          </div>
        ) : (
          <span
            className="font-mono shrink-0"
            style={{ fontSize: 15, fontWeight: 800, color: 'var(--color-text-dim)' }}
          >
            {formatDuration(elapsedSeconds)}
          </span>
        )}
      </div>

      {/* 4px progress track — always rendered (transparent when idle) so the bar height never jumps */}
      <div
        className="mt-1 rounded-full overflow-hidden"
        style={{ height: 4, backgroundColor: restEndsAt ? 'var(--color-surface-hover)' : 'transparent' }}
      >
        <div
          className="h-full rounded-full"
          style={{ width: `${progress}%`, backgroundColor: go ? 'var(--color-green)' : REST_COLOR }}
        />
      </div>
    </div>
  );
}
