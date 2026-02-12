import { Calendar, TrendingUp, Settings } from 'lucide-react';
import { useThemeStore } from '../../stores/themeStore';
import { useUIStore } from '../../stores/uiStore';

export default function BottomNav() {
  const { getCurrentTheme } = useThemeStore();
  const { view, setView } = useUIStore();
  const currentTheme = getCurrentTheme();

  const tabs = [
    { id: 'home', label: 'Home', icon: Calendar },
    { id: 'stats', label: 'Stats', icon: TrendingUp },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const handleTabClick = (tabId) => {
    setView(tabId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <nav
      className={`fixed bottom-0 left-0 right-0 z-20 border-t backdrop-blur-sm safe-area-pb ${currentTheme.headerBorder}`}
      style={{
        borderColor: currentTheme.rawHeaderBorder,
        backgroundColor: `${currentTheme.rawCardBg}dd`, // Semi-transparent
      }}
    >
      <div className="max-w-4xl mx-auto px-4 flex items-center justify-around h-20">
        {tabs.map(({ id, label, icon: Icon }) => {
          const isActive = view === id;
          return (
            <button
              key={id}
              onClick={() => handleTabClick(id)}
              className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-all duration-200 ${
                isActive ? 'text-blue-400 scale-110' : `${currentTheme.text} opacity-60 hover:opacity-100`
              }`}
              aria-label={label}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon size={24} />
              <span className="text-xs font-medium">{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
