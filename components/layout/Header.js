import { Plus, Search } from 'lucide-react';
import { useThemeStore } from '../../stores/themeStore';
import { useUIStore } from '../../stores/uiStore';

export default function Header() {
  const { getCurrentTheme, cycleTheme } = useThemeStore();
  const { view } = useUIStore();
  const currentTheme = getCurrentTheme();

  const handleThemeCycle = () => {
    cycleTheme();
  };

  const handleQuickAdd = () => {
    useUIStore.setState({ showPresetSelector: true });
  };

  const handleSearch = () => {
    const { searchExpanded, search } = useUIStore.getState();
    useUIStore.setState({
      searchExpanded: !searchExpanded,
      search: searchExpanded ? '' : search,
    });
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-20 border-b ${currentTheme.headerBorder}`}
      style={{
        background: currentTheme.rawHeaderBg,
        borderColor: currentTheme.rawHeaderBorder,
      }}
    >
      <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between h-20">
        {/* Left: Quick Add Button (Home view only) */}
        <div className="flex-shrink-0">
          {view === 'home' ? (
            <button
              onClick={handleQuickAdd}
              className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white transition-all duration-200 hover:scale-110"
              aria-label="Quick add workout"
            >
              <Plus size={24} />
            </button>
          ) : (
            <div className="w-10 h-10" />
          )}
        </div>

        {/* Center: Logo/Title */}
        <button
          onClick={handleThemeCycle}
          className="flex-1 text-center font-black text-2xl tracking-tight bg-gradient-to-r from-blue-400 via-blue-500 to-purple-500 bg-clip-text text-transparent hover:opacity-80 transition-opacity"
        >
          GORS LOG
        </button>

        {/* Right: Search Button (Home view only) */}
        <div className="flex-shrink-0">
          {view === 'home' ? (
            <button
              onClick={handleSearch}
              className="p-2 rounded-lg hover:bg-white hover:bg-opacity-10 transition-all duration-200 text-white"
              aria-label="Search workouts"
            >
              <Search size={24} />
            </button>
          ) : (
            <div className="w-10 h-10" />
          )}
        </div>
      </div>
    </header>
  );
}
