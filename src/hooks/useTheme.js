'use client';

import { useState, useCallback, useEffect, useSyncExternalStore } from 'react';
import { getItem, setItem } from '@/utils/storage';

const THEME_KEY = 'theme';
const DEFAULT_THEME = 'dark';

export const THEMES = {
  dark: {
    name: 'Dark',
    colors: {
      '--color-bg': '#0f0f14',
      '--color-surface': '#1a1a24',
      '--color-surface-hover': '#22222e',
      '--color-border': '#2a2a3a',
      '--color-text': '#e8e8ed',
      '--color-text-muted': '#8888a0',
      '--color-text-dim': '#55556a',
      '--color-accent': '#4a9eff',
      '--color-green': '#22c55e',
      '--color-red': '#ef4444',
      '--color-yellow': '#f59e0b',
      '--color-sidebar-border': '#ffffff',
      '--color-header-bg': '#0f0f14',
      '--color-nav-bg': '#13131a',
    },
  },
  light: {
    name: 'Light',
    colors: {
      '--color-bg': '#f5f5f7',
      '--color-surface': '#ffffff',
      '--color-surface-hover': '#f0f0f2',
      '--color-border': '#e0e0e5',
      '--color-text': '#1a1a2e',
      '--color-text-muted': '#6b6b80',
      '--color-text-dim': '#9999aa',
      '--color-accent': '#2563eb',
      '--color-green': '#16a34a',
      '--color-red': '#dc2626',
      '--color-yellow': '#d97706',
      '--color-sidebar-border': '#374151',
      '--color-header-bg': '#ffffff',
      '--color-nav-bg': '#ffffff',
    },
  },
  neon: {
    name: 'Neon',
    colors: {
      '--color-bg': '#0a0a12',
      '--color-surface': '#12121e',
      '--color-surface-hover': '#1a1a2a',
      '--color-border': '#1f1f35',
      '--color-text': '#e0e0ff',
      '--color-text-muted': '#8080b0',
      '--color-text-dim': '#505070',
      '--color-accent': '#00d4ff',
      '--color-green': '#00ff88',
      '--color-red': '#ff3366',
      '--color-yellow': '#ffcc00',
      '--color-sidebar-border': '#ffffff',
      '--color-header-bg': '#0a0a12',
      '--color-nav-bg': '#0e0e18',
    },
  },
  forest: {
    name: 'Forest',
    colors: {
      '--color-bg': '#0f1410',
      '--color-surface': '#1a2218',
      '--color-surface-hover': '#222e20',
      '--color-border': '#2a3a28',
      '--color-text': '#e0ede0',
      '--color-text-muted': '#88a088',
      '--color-text-dim': '#556a55',
      '--color-accent': '#4ade80',
      '--color-green': '#22c55e',
      '--color-red': '#ef4444',
      '--color-yellow': '#facc15',
      '--color-sidebar-border': '#ffffff',
      '--color-header-bg': '#0f1410',
      '--color-nav-bg': '#121a14',
    },
  },
};

function applyThemeToDOM(themeId) {
  const theme = THEMES[themeId] || THEMES[DEFAULT_THEME];
  const root = document.documentElement;
  Object.entries(theme.colors).forEach(([prop, value]) => {
    root.style.setProperty(prop, value);
  });
  root.setAttribute('data-theme', themeId);
}

function getInitialTheme() {
  if (typeof window === 'undefined') return DEFAULT_THEME;
  const saved = getItem(THEME_KEY, DEFAULT_THEME);
  return THEMES[saved] ? saved : DEFAULT_THEME;
}

// Track client-side mount status without setState in effects
const subscribeToNothing = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

export function useTheme() {
  const [theme, setThemeState] = useState(getInitialTheme);

  // Detect if we're mounted on the client (no setState needed)
  const mounted = useSyncExternalStore(subscribeToNothing, getClientSnapshot, getServerSnapshot);

  // Apply theme to DOM whenever it changes
  useEffect(() => {
    applyThemeToDOM(theme);
  }, [theme]);

  const setTheme = useCallback((newTheme) => {
    if (!THEMES[newTheme]) return;
    setThemeState(newTheme);
    setItem(THEME_KEY, newTheme);
  }, []);

  return { theme, setTheme, mounted, themes: THEMES };
}
