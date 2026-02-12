import { useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';
import { useUIStore } from '../../stores/uiStore';
import { useThemeStore } from '../../stores/themeStore';

export default function SearchBar() {
  const { search, setSearch, toggleSearch } = useUIStore();
  const { getCurrentTheme } = useThemeStore();
  const inputRef = useRef(null);
  const currentTheme = getCurrentTheme();

  // Auto-focus when opened
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleClear = () => {
    setSearch('');
    toggleSearch();
  };

  return (
    <div
      className={`sticky top-0 z-20 px-4 py-3 border-b`}
      style={{
        backgroundColor: currentTheme.rawCardBg,
        borderColor: currentTheme.rawCardBorder
      }}
    >
      <div className="flex items-center gap-2">
        <Search size={20} className="opacity-50" />
        <input
          ref={inputRef}
          type="text"
          placeholder="Search workouts..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={`flex-1 bg-transparent outline-none placeholder-gray-500`}
          style={{ color: currentTheme.rawText }}
        />
        <button
          onClick={handleClear}
          className="p-1 hover:bg-white hover:bg-opacity-10 rounded transition-all"
          aria-label="Clear search"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
}
