import React from 'react';
import { Plus, Search } from 'lucide-react';
import { useThemeStore } from '../../stores/themeStore';
import { useUIStore } from '../../stores/uiStore';

export default function Header() {
  const { view } = useUIStore();
  const { getCurrentTheme, cycleTheme } = useThemeStore();
  const currentTheme = getCurrentTheme();

  const handleAddWorkout = () => {
    useUIStore.setState({ showPresetSelector: true });
  };

  const handleToggleSearch = () => {
    const { toggleSearch } = useUIStore.getState();
    toggleSearch();
  };

  return (
    <header
      className="fixed top-0 w-full z-30 border-b"
      style={{
        background: currentTheme.rawHeaderBg,
        borderBottomColor: currentTheme.rawHeaderBorder,
      }}
    >
      <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Left: Plus button (home only) */}
        <div className="w-10">
          {view === 'home' ? (
            <button
              onClick={handleAddWorkout}
              className="flex items-center justify-center rounded-lg p-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:opacity-90 transition-opacity"
              aria-label="Add workout"
            >
              <Plus size={20} className="text-white" />
            </button>
          ) : null}
        </div>

        {/* Center: Title */}
        <button
          onClick={cycleTheme}
          className="font-black text-2xl tracking-tight cursor-pointer transition-opacity hover:opacity-80"
          style={{
            backgroundImage: 'linear-gradient(to right, #60a5fa, #3b82f6, #a855f7)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
          aria-label="GORS LOG - Click to cycle theme"
        >
          GORS LOG
        </button>

        {/* Right: Search button (home only) */}
        <div className="w-10">
          {view === 'home' ? (
            <button
              onClick={handleToggleSearch}
              className="flex items-center justify-center rounded-lg p-2 hover:opacity-60 transition-opacity"
              style={{ color: currentTheme.rawText }}
              aria-label="Search workouts"
            >
              <Search size={20} />
            </button>
          ) : null}
        </div>
      </div>
    </header>
  );
}
