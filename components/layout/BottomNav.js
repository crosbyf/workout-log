import React from 'react';
import { Calendar, TrendingUp, SlidersHorizontal } from 'lucide-react';
import { useThemeStore } from '../../stores/themeStore';
import { useUIStore } from '../../stores/uiStore';

export default function BottomNav() {
  const { getCurrentTheme } = useThemeStore();
  const { view, setView } = useUIStore();
  const currentTheme = getCurrentTheme();

  const tabs = [
    { id: 'home', label: 'Home', icon: Calendar },
    { id: 'stats', label: 'Stats', icon: TrendingUp },
    { id: 'settings', label: 'Settings', icon: SlidersHorizontal },
  ];

  const handleTabClick = (tabId) => {
    setView(tabId);
  };

  return (
    <nav
      className="fixed bottom-0 w-full z-30 border-t safe-area-pb"
      style={{
        background: currentTheme.rawCardBg,
        borderTopColor: currentTheme.rawCardBorder,
      }}
    >
      <div className="max-w-4xl mx-auto flex">
        {tabs.map(({ id, label, icon: Icon }) => {
          const isActive = view === id;
          return (
            <button
              key={id}
              onClick={() => handleTabClick(id)}
              className="flex-1 flex flex-col items-center py-2 gap-1 transition-colors"
              style={{
                color: isActive ? '#3b82f6' : `${currentTheme.rawText}99`,
              }}
              aria-label={label}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon size={22} />
              <span className="text-xs font-medium">{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
