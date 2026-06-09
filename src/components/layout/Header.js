'use client';

import { useState, useRef, useEffect } from 'react';
import { Plus, Search, X } from 'lucide-react';

export default function Header({ activeTab, onStartWorkout, searchQuery, onSearchChange }) {
  const [showSearch, setShowSearch] = useState(false);
  const inputRef = useRef(null);

  const showHeaderActions = activeTab === 'home';
  const showSearchBar = activeTab === 'log';

  useEffect(() => {
    if (showSearch && inputRef.current) {
      inputRef.current.focus();
    }
  }, [showSearch]);

  const handleToggleSearch = () => {
    if (showSearch) {
      // Close search and clear query
      setShowSearch(false);
      onSearchChange('');
    } else {
      setShowSearch(true);
    }
  };

  const handleClear = () => {
    onSearchChange('');
    if (inputRef.current) inputRef.current.focus();
  };

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50"
      style={{
        backgroundColor: 'var(--color-header-bg)',
        paddingTop: 'env(safe-area-inset-top)',
        boxShadow: '0 1px 3px rgba(0,0,0,0.25), 0 4px 12px rgba(0,0,0,0.15)',
      }}
    >
      {/* Main header row */}
      <div
        className="flex items-center justify-between px-4 h-14"
        style={{
          borderBottom: showSearch ? 'none' : '1px solid var(--color-border)',
        }}
      >
        {/* Left: Start Workout button (Home + Log tabs) */}
        <div className="w-10 flex items-center justify-center">
          {showHeaderActions && (
            <button
              onClick={onStartWorkout}
              className="w-9 h-9 rounded-lg flex items-center justify-center transition-colors"
              style={{ backgroundColor: '#3a3a44' }}
              aria-label="Start new workout"
            >
              <Plus size={20} color="#ffffff" strokeWidth={2.5} />
            </button>
          )}
        </div>

        {/* Center: Branding — GORS toy blocks */}
        <h1 className="flex items-center gap-1 select-none">
          {[
            { char: 'G', bg: '#4a9eff' },
            { char: 'O', bg: '#f59e0b' },
            { char: 'R', bg: '#a855f7' },
            { char: 'S', bg: '#22c55e' },
          ].map(({ char, bg }) => (
            <span
              key={char}
              className="inline-flex items-center justify-center rounded-[5px]"
              style={{
                width: '26px',
                height: '26px',
                backgroundColor: bg,
                fontSize: '15px',
                fontWeight: 900,
                color: '#ffffff',
                lineHeight: 1,
              }}
            >
              {char}
            </span>
          ))}
        </h1>

        {/* Right: Search toggle (Log tab only) */}
        <div className="w-10 flex items-center justify-center">
          {showSearchBar && (
            <button
              onClick={handleToggleSearch}
              className="w-9 h-9 rounded-lg flex items-center justify-center transition-colors"
              aria-label={showSearch ? 'Close search' : 'Search workouts'}
            >
              {showSearch ? (
                <X size={20} style={{ color: 'var(--color-text-muted)' }} />
              ) : (
                <Search size={20} style={{ color: 'var(--color-text-muted)' }} />
              )}
            </button>
          )}
        </div>
      </div>

      {/* Search bar (slides in below header) */}
      {showSearch && showSearchBar && (
        <div
          className="px-4 py-2"
          style={{ borderBottom: '1px solid var(--color-border)' }}
        >
          <div
            className="flex items-center gap-2 px-3 py-2 rounded-lg"
            style={{ backgroundColor: 'var(--color-surface)' }}
          >
            <Search size={16} style={{ color: 'var(--color-text-dim)' }} />
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search exercises, presets, notes..."
              className="flex-1 text-sm bg-transparent border-0 outline-none"
              style={{ color: 'var(--color-text)' }}
            />
            {searchQuery && (
              <button onClick={handleClear} className="p-0.5">
                <X size={14} style={{ color: 'var(--color-text-dim)' }} />
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
