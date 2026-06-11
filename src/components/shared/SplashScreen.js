'use client';

import { useState, useEffect } from 'react';

const LETTERS = [
  { char: 'G', color: '#4a9eff' },
  { char: 'O', color: '#f59e0b' },
  { char: 'R', color: '#a855f7' },
  { char: 'S', color: '#22c55e' },
];

/**
 * Splash — matches the B2 app icon: bold white letters drop in staggered,
 * then each letter's colored underline sweeps in beneath it, tagline fades,
 * exit. Slightly shorter than the old block animation (2.2s vs 2.6s).
 */
export default function SplashScreen({ onComplete }) {
  const [phase, setPhase] = useState('drop');
  // Phases: 'drop' (letters above, transparent) -> 'land' (letters settle)
  //         -> 'lines' (underlines sweep in) -> 'hold' (tagline) -> 'exit'

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase('land'), 60),
      setTimeout(() => setPhase('lines'), 650),
      setTimeout(() => setPhase('hold'), 1100),
      setTimeout(() => setPhase('exit'), 1800),
      setTimeout(() => onComplete(), 2200),
    ];
    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  const landed = phase !== 'drop';
  const linesIn = phase === 'lines' || phase === 'hold' || phase === 'exit';
  const taglineIn = phase === 'hold' || phase === 'exit';

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
        backgroundColor: '#000000',
        opacity: phase === 'exit' ? 0 : 1,
        transition: 'opacity 0.4s ease-out',
      }}
    >
      <div style={{ display: 'flex', gap: '18px', marginBottom: '28px' }}>
        {LETTERS.map((letter, i) => (
          <div key={letter.char} style={{ textAlign: 'center' }}>
            <div
              style={{
                fontSize: '56px',
                fontWeight: 800,
                color: '#ffffff',
                lineHeight: 1,
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                transform: landed ? 'translateY(0)' : 'translateY(-48px)',
                opacity: landed ? 1 : 0,
                transition: `transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) ${i * 0.07}s, opacity 0.35s ease-out ${i * 0.07}s`,
              }}
            >
              {letter.char}
            </div>
            <div
              style={{
                width: '42px',
                height: '6px',
                borderRadius: '3px',
                backgroundColor: letter.color,
                margin: '12px auto 0',
                transform: linesIn ? 'scaleX(1)' : 'scaleX(0)',
                transition: `transform 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94) ${i * 0.06}s`,
              }}
            />
          </div>
        ))}
      </div>

      {/* Tagline — fades in after the underlines land */}
      <p
        style={{
          fontSize: '13px',
          fontWeight: 700,
          letterSpacing: '4px',
          color: '#6b6b73',
          textTransform: 'uppercase',
          opacity: taglineIn ? 1 : 0,
          transform: taglineIn ? 'translateY(0)' : 'translateY(12px)',
          transition: 'all 0.5s ease-out',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        }}
      >
        Be About It
      </p>
    </div>
  );
}
