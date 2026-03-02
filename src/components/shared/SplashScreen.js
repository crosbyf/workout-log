'use client';

import { useState, useEffect } from 'react';

const LETTERS = [
  { char: 'G', bg: '#4a9eff' },
  { char: 'O', bg: '#f59e0b' },
  { char: 'R', bg: '#a855f7' },
  { char: 'S', bg: '#22c55e' },
];

export default function SplashScreen({ onComplete }) {
  const [phase, setPhase] = useState('enter'); // 'enter' | 'hold' | 'exit'

  useEffect(() => {
    const holdTimer = window.setTimeout(() => setPhase('hold'), 1200);
    const exitTimer = window.setTimeout(() => setPhase('exit'), 1800);
    const doneTimer = window.setTimeout(() => onComplete(), 2200);

    return () => {
      window.clearTimeout(holdTimer);
      window.clearTimeout(exitTimer);
      window.clearTimeout(doneTimer);
    };
  }, [onComplete]);

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
      {/* Animated boxed letters */}
      <div
        style={{
          display: 'flex',
          gap: '10px',
          marginBottom: '28px',
        }}
      >
        {LETTERS.map((letter, i) => (
          <div
            key={letter.char}
            style={{
              width: '68px',
              height: '68px',
              borderRadius: '14px',
              backgroundColor: letter.bg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              animation: `splash-drop-bounce 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) ${i * 0.12}s both`,
            }}
          >
            <span
              style={{
                fontSize: '40px',
                fontWeight: '900',
                color: '#ffffff',
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                lineHeight: 1,
              }}
            >
              {letter.char}
            </span>
          </div>
        ))}
      </div>

      {/* Subtitle — fades in after blocks land */}
      <p
        style={{
          fontSize: '13px',
          fontWeight: '600',
          letterSpacing: '4px',
          color: '#6366f1',
          textTransform: 'uppercase',
          animation: 'splash-fade-up 0.5s ease-out 0.7s both',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        }}
      >
        Be About It
      </p>

      <style>{`
        @keyframes splash-drop-bounce {
          0% {
            transform: translateY(-120px) scale(0.6) rotate(-12deg);
            opacity: 0;
          }
          50% {
            opacity: 1;
          }
          70% {
            transform: translateY(8px) scale(1.05) rotate(2deg);
          }
          85% {
            transform: translateY(-4px) scale(0.98) rotate(-1deg);
          }
          100% {
            transform: translateY(0) scale(1) rotate(0deg);
            opacity: 1;
          }
        }
        @keyframes splash-fade-up {
          from {
            transform: translateY(12px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
