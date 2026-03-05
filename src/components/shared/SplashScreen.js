'use client';

import { useState, useEffect } from 'react';

const LETTERS = [
  { char: 'G', bg: '#4a9eff' },
  { char: 'O', bg: '#f59e0b' },
  { char: 'R', bg: '#a855f7' },
  { char: 'S', bg: '#22c55e' },
];

// 2x2 grid positions (relative offsets from center)
const GRID_POSITIONS = [
  { x: -1, y: -1 }, // G top-left
  { x: 1, y: -1 },  // O top-right
  { x: -1, y: 1 },  // R bottom-left
  { x: 1, y: 1 },   // S bottom-right
];

// Final row positions (relative offsets from center, evenly spaced)
const ROW_POSITIONS = [
  { x: -3, y: 0 },  // G
  { x: -1, y: 0 },  // O
  { x: 1, y: 0 },   // R
  { x: 3, y: 0 },   // S
];

export default function SplashScreen({ onComplete }) {
  const [phase, setPhase] = useState('drop');
  // Phases: 'drop' (2x2 falls from top) -> 'bounce' (hits center, squash) -> 'spread' (expands to row) -> 'hold' -> 'exit'

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase('bounce'), 600),   // land at center
      setTimeout(() => setPhase('spread'), 1000),   // bounce done, spread to row
      setTimeout(() => setPhase('hold'), 1500),      // row settled
      setTimeout(() => setPhase('exit'), 2200),       // begin fade
      setTimeout(() => onComplete(), 2600),           // done
    ];
    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  // Block dimensions
  const blockSize = 58;
  const gridGap = 4;  // tight gap in 2x2
  const rowGap = 10;  // wider gap in row

  // Half-unit used to position blocks from center
  const gridUnit = (blockSize + gridGap) / 2;
  const rowUnit = (blockSize + rowGap) / 2;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#0f0f14',
        opacity: phase === 'exit' ? 0 : 1,
        transition: 'opacity 0.4s ease-out',
      }}
    >
      {/* Block container */}
      <div
        style={{
          position: 'relative',
          width: `${blockSize * 4 + rowGap * 3 + 20}px`,
          height: `${blockSize * 2 + gridGap + 40}px`,
          marginBottom: '24px',
        }}
      >
        {LETTERS.map((letter, i) => {
          const grid = GRID_POSITIONS[i];
          const row = ROW_POSITIONS[i];

          // Center of the container
          const cx = (blockSize * 4 + rowGap * 3 + 20) / 2 - blockSize / 2;
          const cy = (blockSize * 2 + gridGap + 40) / 2 - blockSize / 2;

          let x, y, scale, rotate, opacity;

          if (phase === 'drop') {
            // Start in 2x2 formation, high above
            x = cx + grid.x * gridUnit;
            y = -120; // above viewport of container
            scale = 0.8;
            rotate = -8 + i * 4;
            opacity = 0;
          } else if (phase === 'bounce') {
            // Landed at center in 2x2, slight squash
            x = cx + grid.x * gridUnit;
            y = cy + grid.y * gridUnit;
            scale = 1.08;
            rotate = 0;
            opacity = 1;
          } else {
            // 'spread', 'hold', 'exit' — in row formation
            x = cx + row.x * rowUnit;
            y = cy;
            scale = 1;
            rotate = 0;
            opacity = 1;
          }

          // Animation timing per block for stagger effect during drop
          const dropDelay = i * 0.04;

          return (
            <div
              key={letter.char}
              style={{
                position: 'absolute',
                width: `${blockSize}px`,
                height: `${blockSize}px`,
                borderRadius: '14px',
                backgroundColor: letter.bg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                left: `${x}px`,
                top: `${y}px`,
                transform: `scale(${scale}) rotate(${rotate}deg)`,
                opacity,
                transition: phase === 'drop'
                  ? `all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) ${dropDelay}s`
                  : phase === 'bounce'
                    ? 'all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)'
                    : 'all 0.45s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                boxShadow: phase === 'bounce'
                  ? `0 8px 32px ${letter.bg}66`
                  : `0 4px 16px ${letter.bg}33`,
              }}
            >
              <span
                style={{
                  fontSize: '34px',
                  fontWeight: '900',
                  color: '#ffffff',
                  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                  lineHeight: 1,
                  position: 'relative',
                  zIndex: 1,
                }}
              >
                {letter.char}
              </span>
            </div>
          );
        })}
      </div>

      {/* Tagline — fades in after blocks form the row */}
      <p
        style={{
          fontSize: '13px',
          fontWeight: '600',
          letterSpacing: '4px',
          color: '#ffffff',
          textTransform: 'uppercase',
          opacity: phase === 'hold' || phase === 'exit' ? 1 : 0,
          transform: phase === 'hold' || phase === 'exit' ? 'translateY(0)' : 'translateY(12px)',
          transition: 'all 0.5s ease-out',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        }}
      >
        Be About It
      </p>
    </div>
  );
}
