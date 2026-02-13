import React from 'react';

export default function LoadingScreen() {
  return (
    <>
      <style>{`
        @keyframes fadeInSplash {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .splash-container {
          animation: fadeInSplash 0.4s ease-in;
        }
      `}</style>
      <div
        className="splash-container fixed inset-0 flex flex-col items-center justify-center min-h-screen"
        style={{ backgroundColor: '#111827' }}
      >
        <h1 className="text-5xl font-black text-white tracking-wider">GORS</h1>

        <div
          className="h-0.5 w-10 my-4 rounded"
          style={{
            background: 'linear-gradient(to right, #3b82f6, #60a5fa)',
          }}
        />

        <p
          className="text-sm font-bold tracking-widest uppercase"
          style={{ color: '#9ca3af' }}
        >
          BE ABOUT IT
        </p>
      </div>
    </>
  );
}
