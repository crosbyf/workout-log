'use client';

import { Home, ClipboardList, BarChart3, Settings } from 'lucide-react';

const tabs = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'log', label: 'Log', icon: ClipboardList },
  { id: 'stats', label: 'Stats', icon: BarChart3 },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export default function BottomNav({ activeTab, onTabChange }) {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 flex items-stretch justify-around"
      style={{
        backgroundColor: 'var(--color-nav-bg)',
        borderTop: '1px solid var(--color-border)',
        paddingBottom: 'env(safe-area-inset-bottom)',
        minHeight: 'calc(4rem + env(safe-area-inset-bottom))',
        zIndex: 9990,
      }}
    >
      {tabs.map(({ id, label, icon: Icon }) => {
        const isActive = activeTab === id;
        return (
          <button
            key={id}
            onClick={() => onTabChange(id)}
            className="flex flex-col items-center justify-center gap-1 flex-1 py-2 transition-colors"
            aria-label={label}
            aria-current={isActive ? 'page' : undefined}
          >
            <span
              className="flex items-center justify-center rounded-full transition-colors"
              style={{
                backgroundColor: isActive ? 'var(--color-accent)' : 'transparent',
                padding: '4px 14px',
              }}
            >
              <Icon
                size={20}
                style={{
                  color: isActive ? '#ffffff' : 'var(--color-text-dim)',
                }}
              />
            </span>
            <span
              className="text-[10px] uppercase"
              style={{
                color: isActive ? 'var(--color-accent)' : 'var(--color-text-dim)',
                fontWeight: 700,
                letterSpacing: '0.06em',
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
