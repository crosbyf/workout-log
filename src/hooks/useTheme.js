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
      '--color-surface-hover': '#242430',
      '--color-border': '#2e2e40',
      '--color-text': '#f0f0f5',
      '--color-text-muted': '#a0a0b8',
      '--color-text-dim': '#6e6e88',
      '--color-accent': '#4a9eff',
      '--color-green': '#22c55e',
      '--color-green-soft': '#2d8a52',
      '--color-red': '#ef4444',
      '--color-yellow': '#f59e0b',
      '--color-sidebar-border': '#ffffff',
      '--color-header-bg': '#0f0f14',
      '--color-nav-bg': '#13131a',
    },
  },
  midnight: {
    name: 'Midnight',
    colors: {
      '--color-bg': '#0d0b1a',
      '--color-surface': '#171430',
      '--color-surface-hover': '#1f1c3a',
      '--color-border': '#2d2850',
      '--color-text': '#eeeeff',
      '--color-text-muted': '#a8a0cc',
      '--color-text-dim': '#6e6690',
      '--color-accent': '#a78bfa',
      '--color-green': '#34d399',
      '--color-green-soft': '#2a9d70',
      '--color-red': '#f87171',
      '--color-yellow': '#fbbf24',
      '--color-sidebar-border': '#ffffff',
      '--color-header-bg': '#0d0b1a',
      '--color-nav-bg': '#100e22',
    },
  },
  ocean: {
    name: 'Ocean',
    colors: {
      '--color-bg': '#0a1018',
      '--color-surface': '#121e2e',
      '--color-surface-hover': '#1a2940',
      '--color-border': '#243550',
      '--color-text': '#e8f0ff',
      '--color-text-muted': '#8eb0d0',
      '--color-text-dim': '#5a7898',
      '--color-accent': '#38bdf8',
      '--color-green': '#22d3ee',
      '--color-green-soft': '#1a9daa',
      '--color-red': '#fb7185',
      '--color-yellow': '#fcd34d',
      '--color-sidebar-border': '#ffffff',
      '--color-header-bg': '#0a1018',
      '--color-nav-bg': '#0e1520',
    },
  },
  aurora: {
    name: 'Aurora',
    colors: {
      '--color-bg': '#0c1014',
      '--color-surface': '#141e24',
      '--color-surface-hover': '#1c2a32',
      '--color-border': '#283840',
      '--color-text': '#e5f5f0',
      '--color-text-muted': '#90c0b0',
      '--color-text-dim': '#5a8878',
      '--color-accent': '#7c3aed',
      '--color-green': '#34d399',
      '--color-green-soft': '#288a65',
      '--color-red': '#f472b6',
      '--color-yellow': '#a3e635',
      '--color-sidebar-border': '#ffffff',
      '--color-header-bg': '#0c1014',
      '--color-nav-bg': '#0f151a',
    },
  },
  light: {
    name: 'Light',
    colors: {
      '--color-bg': '#f5f5f7',
      '--color-surface': '#ffffff',
      '--color-surface-hover': '#ededf0',
      '--color-border': '#d8d8e0',
      '--color-text': '#111122',
      '--color-text-muted': '#555568',
      '--color-text-dim': '#888898',
      '--color-accent': '#2563eb',
      '--color-green': '#16a34a',
      '--color-green-soft': '#16a34a',
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
      '--color-surface-hover': '#1c1c2e',
      '--color-border': '#22223a',
      '--color-text': '#eeeeff',
      '--color-text-muted': '#9898c8',
      '--color-text-dim': '#606088',
      '--color-accent': '#00d4ff',
      '--color-green': '#00ff88',
      '--color-green-soft': '#1a9960',
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
      '--color-surface-hover': '#253022',
      '--color-border': '#2e3e2c',
      '--color-text': '#eaf5ea',
      '--color-text-muted': '#98b898',
      '--color-text-dim': '#608060',
      '--color-accent': '#4ade80',
      '--color-green': '#22c55e',
      '--color-green-soft': '#2d8a52',
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
