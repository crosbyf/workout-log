'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Live elapsed time counter that survives screen-off / background tabs.
 * Uses Date.now() for the real elapsed time rather than counting setInterval ticks.
 * When the screen wakes back up, the timer catches up instantly.
 */
export function useTimer(isRunning = false) {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const startTimeRef = useRef(null);        // Date.now() when the timer started
  const accumulatedRef = useRef(0);          // seconds accumulated before last pause
  const intervalRef = useRef(null);

  // Start / stop based on isRunning
  useEffect(() => {
    if (isRunning) {
      // Record when this run started
      startTimeRef.current = Date.now();

      const tick = () => {
        const now = Date.now();
        const currentRun = Math.floor((now - startTimeRef.current) / 1000);
        setElapsedSeconds(accumulatedRef.current + currentRun);
      };

      // Tick once immediately, then every second
      tick();
      intervalRef.current = window.setInterval(tick, 1000);

      // Also recalculate when the page becomes visible again (screen wake-up)
      const onVisibility = () => {
        if (document.visibilityState === 'visible') {
          tick();
        }
      };
      document.addEventListener('visibilitychange', onVisibility);

      return () => {
        // Accumulate the time from this run
        if (startTimeRef.current !== null) {
          const runSeconds = Math.floor((Date.now() - startTimeRef.current) / 1000);
          accumulatedRef.current += runSeconds;
          startTimeRef.current = null;
        }
        if (intervalRef.current !== null) {
          window.clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        document.removeEventListener('visibilitychange', onVisibility);
      };
    }
  }, [isRunning]);

  const reset = useCallback(() => {
    accumulatedRef.current = 0;
    startTimeRef.current = isRunning ? Date.now() : null;
    setElapsedSeconds(0);
  }, [isRunning]);

  return { elapsedSeconds, reset };
}
