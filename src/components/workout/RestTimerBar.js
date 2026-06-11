'use client';

import { useState, useEffect } from 'react';
import { formatDuration } from '@/utils/format';

const DURATION_OPTIONS = [30, 60, 90, 120, 180, 240]; // seconds — duration pills cycle through these
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
 *  - Idle:    big elapsed time + optional structure badge + cycling duration
 *             pill(s). Standard shows one "REST m:ss" pill (the `main`
 *             duration); pairs show two compact pills — "REST m:ss" (within a
 *             pair) and "PAIR m:ss" (after a completed pair); circuit shows
 *             two compact pills — "EX m:ss" (rest between exercises) and
 *             "RND m:ss" (rest at the end of a round).
 *             Tapping a pill cycles 0:30 → 1:00 → 1:30 → 2:00 → 3:00 → 4:00.
 *  - Resting: big orange countdown + next-exercise hint + draining bar.
 *             Tapping either timer TOGGLES which one is featured (rest big /
 *             elapsed small ↔ elapsed big / rest small) — the countdown keeps
 *             running underneath. Skipping is the explicit SKIP pill only.
 *             Each new rest starts rest-featured.
 *  - GO:      green "GO" + full green bar for ~4s, then auto-clears via onSkip
 *             (tapping GO dismisses early)
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
  structure = 'standard',     // 'standard' | 'pairs' | 'circuit' — picks the idle pill layout
  restDurations = null,       // { main, ex, round, pair } seconds
  onSelectDuration = null,    // (key, seconds) — key is 'main' | 'ex' | 'round' | 'pair'
  onSkip,          // clears the countdown (tap-to-skip and GO expiry)
  structureLabel = null, // e.g. "Pairs 4'" / "Circuit" — small read-only badge (idle state, normal variant)
  condensed = false,
}) {
  const [now, setNow] = useState(() => Date.now());

  // Which timer is featured (big) while resting. Keyed to the current
  // countdown's restEndsAt so every NEW rest starts rest-featured without
  // needing a reset effect.
  const [featuredState, setFeaturedState] = useState({ key: null, value: 'rest' });
  const featured = featuredState.key === restEndsAt ? featuredState.value : 'rest';
  const toggleFeatured = () =>
    setFeaturedState({ key: restEndsAt, value: featured === 'rest' ? 'elapsed' : 'rest' });

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

  // Cycling duration pill (idle state). `compact` tightens padding so the two
  // circuit pills fit alongside the badge without widening the bar.
  const cycleDuration = (key) => {
    if (!onSelectDuration || !restDurations) return;
    const idx = DURATION_OPTIONS.indexOf(restDurations[key]);
    onSelectDuration(key, DURATION_OPTIONS[(idx + 1) % DURATION_OPTIONS.length]);
  };
  const renderDurationPill = (key, label, compact = false) => (
    <button
      onClick={() => cycleDuration(key)}
      className={`uppercase rounded-full text-[11px] transition-colors ${compact ? 'px-2' : 'px-3'}`}
      style={{
        minHeight: 32,
        fontWeight: 700,
        letterSpacing: '0.06em',
        color: 'var(--color-text-dim)',
        backgroundColor: 'var(--color-surface-hover)',
      }}
      aria-label={`${label} duration ${formatRest(restDurations?.[key] ?? 0)}, tap to change`}
    >
      {label} {formatRest(restDurations?.[key] ?? 0)}
    </button>
  );
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
            onClick={go ? onSkip : toggleFeatured}
            className="flex items-baseline gap-2 min-w-0 w-full text-left"
            aria-label={go ? 'Dismiss' : 'Swap featured timer'}
          >
            <span
              className="font-mono shrink-0"
              style={{
                fontSize: 16,
                fontWeight: 800,
                color: go
                  ? 'var(--color-green)'
                  : featured === 'rest' ? REST_COLOR : 'var(--color-text)',
                lineHeight: 1.1,
              }}
            >
              {go
                ? 'GO'
                : featured === 'rest' ? formatRest(remainingSec) : formatDuration(elapsedSeconds)}
            </span>
            <span
              className="uppercase truncate"
              style={{ fontSize: 10, fontWeight: 700, color: 'var(--color-text-dim)', letterSpacing: '0.12em' }}
            >
              {go
                ? (nextName ? `Next: ${nextName}` : 'Go')
                : featured === 'rest'
                  ? (nextName ? `Next: ${nextName}` : 'Rest')
                  : `Elapsed · rest ${formatRest(remainingSec)}`}
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
        ) : go ? (
          <button onClick={onSkip} className="text-left min-w-0" aria-label="Dismiss">
            <div
              className="font-mono"
              style={{ fontSize: 24, fontWeight: 800, color: 'var(--color-green)', lineHeight: 1.05 }}
            >
              GO
            </div>
            <div
              className="uppercase truncate"
              style={{ fontSize: 10, fontWeight: 700, color: 'var(--color-text-dim)', letterSpacing: '0.12em' }}
            >
              {nextName ? `Next: ${nextName}` : 'Go'}
            </div>
          </button>
        ) : (
          <button onClick={toggleFeatured} className="text-left min-w-0" aria-label="Swap featured timer">
            {featured === 'rest' ? (
              <>
                <div
                  className="font-mono"
                  style={{ fontSize: 24, fontWeight: 800, color: REST_COLOR, lineHeight: 1.05 }}
                >
                  {formatRest(remainingSec)}
                </div>
                <div
                  className="uppercase truncate"
                  style={{ fontSize: 10, fontWeight: 700, color: 'var(--color-text-dim)', letterSpacing: '0.12em' }}
                >
                  {nextName ? `Rest · Next: ${nextName}` : 'Rest'}
                </div>
              </>
            ) : (
              <>
                <div
                  className="font-mono"
                  style={{ fontSize: 24, fontWeight: 800, color: 'var(--color-text)', lineHeight: 1.05 }}
                >
                  {formatDuration(elapsedSeconds)}
                </div>
                <div
                  className="uppercase truncate"
                  style={{ fontSize: 10, fontWeight: 700, color: 'var(--color-text-dim)', letterSpacing: '0.12em' }}
                >
                  Elapsed
                </div>
              </>
            )}
          </button>
        )}

        {/* Right: structure badge + cycling duration pill(s) (idle) or shrunk elapsed.
            Standard: one REST pill (main). Pairs: compact REST + PAIR pills.
            Circuit: compact EX + RND pills. */}
        {!restEndsAt ? (
          <div className="flex items-center gap-1.5 shrink-0">
            {structureLabel && (
              <span
                className="uppercase rounded-full px-2.5 py-1"
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: '0.06em',
                  color: 'var(--color-text-dim)',
                  backgroundColor: 'var(--color-surface-hover)',
                }}
              >
                {structureLabel}
              </span>
            )}
            {structure === 'circuit' ? (
              <>
                {renderDurationPill('ex', 'Ex', true)}
                {renderDurationPill('round', 'Rnd', true)}
              </>
            ) : structure === 'pairs' ? (
              <>
                {renderDurationPill('main', 'Rest', true)}
                {renderDurationPill('pair', 'Pair', true)}
              </>
            ) : (
              renderDurationPill('main', 'Rest')
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2 shrink-0">
            {/* Shrunk counterpart timer — tap swaps which one is featured */}
            {!go && (
              <button
                onClick={toggleFeatured}
                className="font-mono"
                style={{
                  fontSize: 15,
                  fontWeight: 800,
                  color: featured === 'rest' ? 'var(--color-text-dim)' : REST_COLOR,
                  minHeight: 32,
                }}
                aria-label="Swap featured timer"
              >
                {featured === 'rest' ? formatDuration(elapsedSeconds) : formatRest(remainingSec)}
              </button>
            )}
            {go && (
              <span
                className="font-mono"
                style={{ fontSize: 15, fontWeight: 800, color: 'var(--color-text-dim)' }}
              >
                {formatDuration(elapsedSeconds)}
              </span>
            )}
            {!go && (
              <button
                onClick={onSkip}
                className="uppercase rounded-full px-2.5"
                style={{
                  minHeight: 32,
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: '0.06em',
                  color: 'var(--color-text-dim)',
                  backgroundColor: 'var(--color-surface-hover)',
                }}
                aria-label="Skip rest"
              >
                Skip
              </button>
            )}
          </div>
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
