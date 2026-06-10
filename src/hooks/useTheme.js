'use client';

import { useState, useCallback, useEffect, useSyncExternalStore } from 'react';
import { getItem, setItem } from '@/utils/storage';

const THEME_KEY = 'theme';
const DEFAULT_THEME = 'dark';

export const THEMES = {
  dark: {
    name: 'Black',
    colors: {
      '--color-bg': '#000000',
      '--color-surface': '#111113',
      '--color-surface-hover': '#1d1d20',
      '--color-border': '#232328',
      '--color-text': '#ffffff',
      '--color-text-muted': '#9a9aa3',
      '--color-text-dim': '#6b6b73',
      '--color-accent': '#4a9eff',
      '--color-green': '#22c55e',
      '--color-green-soft': '#2d8a52',
      '--color-red': '#ef4444',
      '--color-yellow': '#f59e0b',
      '--color-sidebar-border': '#ffffff',
      '--color-header-bg': '#000000',
      '--color-nav-bg': '#000000',
    },
  },
  ocean: {
    name: 'Blue',
    colors: {
      '--color-bg': '#04080f',
      '--color-surface': '#0d1726',
      '--color-surface-hover': '#16243a',
      '--color-border': '#1e3050',
      '--color-text': '#f0f6ff',
      '--color-text-muted': '#8eb0d0',
      '--color-text-dim': '#5a7898',
      '--color-accent': '#38bdf8',
      '--color-green': '#22c55e',
      '--color-green-soft': '#1d8a4c',
      '--color-red': '#fb7185',
      '--color-yellow': '#fcd34d',
      '--color-sidebar-border': '#ffffff',
      '--color-header-bg': '#04080f',
      '--color-nav-bg': '#04080f',
    },
  },
  light: {
    name: 'White',
    colors: {
      '--color-bg': '#e2e3e8',
      '--color-surface': '#f6f6f8',
      '--color-surface-hover': '#e9e9ee',
      '--color-border': '#cdced6',
      '--color-text': '#15151c',
      '--color-text-muted': '#56565f',
      '--color-text-dim': '#84848f',
      '--color-accent': '#2563eb',
      '--color-green': '#15803d',
      '--color-green-soft': '#15803d',
      '--color-red': '#dc2626',
      '--color-yellow': '#b45309',
      '--color-sidebar-border': '#374151',
      '--color-header-bg': '#ececed',
      '--color-nav-bg': '#ececed',
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
