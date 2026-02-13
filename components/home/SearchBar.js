import { useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';
import { useUIStore } from '../../stores/uiStore';
import { useThemeStore } from '../../stores/themeStore';

export default function SearchBar() {
  const { search, setSearch } = useUIStore();
  const { getCurrentTheme } = useThemeStore();
  const inputRef = useRef(null);
  const currentTheme = getCurrentTheme();

  // Auto-focus when opened
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  return (
    <div
      className="sticky top-0 z-20 w-full px-4 py-3 animate-slideDown"
      style={{
        backgroundColor: currentTheme.rawCardBg,
      }}
    >
      <div className="flex items-center gap-3">
        <Search size={18} style={{ color: currentTheme.rawText, opacity: 0.6 }} />
        <input
          ref={inputRef}
          type="text"
          placeholder="Search workouts..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 outline-none placeholder-opacity-40"
          style={{
            backgroundColor: 'transparent',
            color: currentTheme.rawText,
            borderRadius: '0.5rem',
            padding: '0.5rem 0.75rem',
          }}
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="p-1 transition-all"
            style={{ color: currentTheme.rawText, opacity: 0.6 }}
            aria-label="Clear search"
          >
            <X size={18} />
          </button>
        )}
      </div>
    </div>
  );
}
