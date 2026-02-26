'use client';

import { Home, BarChart3, Settings } from 'lucide-react';

const tabs = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'stats', label: 'Stats', icon: BarChart3 },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export default function BottomNav({ activeTab, onTabChange }) {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around h-16"
      style={{
        backgroundColor: 'var(--color-nav-bg)',
        borderTop: '1px solid var(--color-border)',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      {tabs.map(({ id, label, icon: Icon }) => {
        const isActive = activeTab === id;
        return (
          <button
            key={id}
            onClick={() => onTabChange(id)}
            className="flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-colors"
            aria-label={label}
            aria-current={isActive ? 'page' : undefined}
          >
            <Icon
              size={22}
              style={{
                color: isActive ? 'var(--color-accent)' : 'var(--color-text-dim)',
              }}
            />
            <span
              className="text-[10px] font-medium"
              style={{
                color: isActive ? 'var(--color-accent)' : 'var(--color-text-dim)',
              }}
            >
              {label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
