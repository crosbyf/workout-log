'use client';

import { Plus, Search } from 'lucide-react';

export default function Header({ activeTab, onStartWorkout, onSearch }) {
  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 h-14"
      style={{
        backgroundColor: 'var(--color-header-bg)',
        borderBottom: '1px solid var(--color-border)',
        paddingTop: 'env(safe-area-inset-top)',
      }}
    >
      {/* Left: Start Workout button (only on Home tab) */}
      <div className="w-10 flex items-center justify-center">
        {activeTab === 'home' && (
          <button
            onClick={onStartWorkout}
            className="w-9 h-9 rounded-lg flex items-center justify-center transition-colors"
            style={{ backgroundColor: 'var(--color-accent)' }}
            aria-label="Start new workout"
          >
            <Plus size={20} color="#ffffff" strokeWidth={2.5} />
          </button>
        )}
      </div>

      {/* Center: Branding */}
      <h1
        className="text-lg font-bold tracking-wider select-none"
        style={{ color: 'var(--color-text)' }}
      >
        GORS LOG
      </h1>

      {/* Right: Search (only on Home tab) */}
      <div className="w-10 flex items-center justify-center">
        {activeTab === 'home' && (
          <button
            onClick={onSearch}
            className="w-9 h-9 rounded-lg flex items-center justify-center transition-colors"
            aria-label="Search workouts"
          >
            <Search size={20} style={{ color: 'var(--color-text-muted)' }} />
          </button>
        )}
      </div>
    </header>
  );
}
