import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Theme definitions
// Each theme has Tailwind class names AND raw CSS hex values (prefixed with "raw")
export const THEMES = {
  light: {
    name: 'Light',
    bg: 'bg-gray-50',
    text: 'text-gray-900',
    cardBg: 'bg-white',
    cardBorder: 'border-gray-200',
    inputBg: 'bg-white',
    inputBorder: 'border-gray-300',
    headerGradient: 'from-gray-100 to-gray-200',
    headerBorder: 'border-gray-300',
    accent: 'blue',
    isDark: false,
    // Raw CSS values for inline styles
    rawBg: '#f9fafb',
    rawText: '#111827',
    rawCardBg: '#ffffff',
    rawCardBorder: '#e5e7eb',
    rawInputBg: '#ffffff',
    rawInputBorder: '#d1d5db',
    rawHeaderBg: 'linear-gradient(to right, #f3f4f6, #e5e7eb)',
    rawHeaderBorder: '#d1d5db',
  },
  dark: {
    name: 'Dark',
    bg: 'bg-gray-900',
    text: 'text-white',
    cardBg: 'bg-gray-800',
    cardBorder: 'border-gray-700',
    inputBg: 'bg-gray-800',
    inputBorder: 'border-gray-600',
    headerGradient: 'from-gray-800 to-gray-900',
    headerBorder: 'border-gray-700/50',
    accent: 'blue',
    isDark: true,
    rawBg: '#111827',
    rawText: '#ffffff',
    rawCardBg: '#1f2937',
    rawCardBorder: '#374151',
    rawInputBg: '#1f2937',
    rawInputBorder: '#4b5563',
    rawHeaderBg: 'linear-gradient(to right, #1f2937, #111827)',
    rawHeaderBorder: 'rgba(55, 65, 81, 0.5)',
  },
  neon: {
    name: 'Neon',
    bg: 'bg-black',
    text: 'text-green-50',
    cardBg: 'bg-zinc-950',
    cardBorder: 'border-green-500/30',
    inputBg: 'bg-zinc-950',
    inputBorder: 'border-green-500/50',
    headerGradient: 'from-zinc-950 to-black',
    headerBorder: 'border-green-500/50',
    accent: 'green',
    isDark: true,
    rawBg: '#000000',
    rawText: '#f0fdf4',
    rawCardBg: '#09090b',
    rawCardBorder: 'rgba(34, 197, 94, 0.3)',
    rawInputBg: '#09090b',
    rawInputBorder: 'rgba(34, 197, 94, 0.5)',
    rawHeaderBg: 'linear-gradient(to right, #09090b, #000000)',
    rawHeaderBorder: 'rgba(34, 197, 94, 0.5)',
  },
  forest: {
    name: 'Forest',
    bg: 'bg-green-950',
    text: 'text-green-50',
    cardBg: 'bg-green-800',
    cardBorder: 'border-green-600',
    inputBg: 'bg-green-800',
    inputBorder: 'border-green-500',
    headerGradient: 'from-green-700 to-green-900',
    headerBorder: 'border-green-400/50',
    accent: 'green',
    isDark: true,
    rawBg: '#052e16',
    rawText: '#f0fdf4',
    rawCardBg: '#166534',
    rawCardBorder: '#16a34a',
    rawInputBg: '#166534',
    rawInputBorder: '#22c55e',
    rawHeaderBg: 'linear-gradient(to right, #15803d, #14532d)',
    rawHeaderBorder: 'rgba(74, 222, 128, 0.5)',
  },
};

const THEME_CYCLE = ['light', 'dark', 'neon', 'forest'];

export const useThemeStore = create(
  persist(
    (set, get) => ({
      // State
      theme: 'dark',

      // Actions
      setTheme: (theme) => {
        if (THEMES[theme]) {
          set({ theme });
        }
      },

      cycleTheme: () => {
        set((state) => {
          const currentIndex = THEME_CYCLE.indexOf(state.theme);
          const nextIndex = (currentIndex + 1) % THEME_CYCLE.length;
          return { theme: THEME_CYCLE[nextIndex] };
        });
      },

      // Getters/Computed
      getCurrentTheme: () => {
        return THEMES[get().theme] || THEMES.dark;
      },

      isDark: () => {
        return get().getCurrentTheme().isDark;
      },
    }),
    {
      name: 'gors-theme',
      partialize: (state) => ({
        theme: state.theme,
      }),
      // Migration function for backward compatibility
      migrate: (persistedState, version) => {
        if (typeof window !== 'undefined') {
          // Read from old 'theme' key
          const oldTheme = localStorage.getItem('theme');
          if (oldTheme) {
            try {
              const theme = oldTheme.replace(/^"(.*)"$/, '$1'); // Remove quotes if present
              // Handle 'midnight' legacy theme → 'neon'
              if (theme === 'midnight') {
                persistedState.theme = 'neon';
              } else if (THEMES[theme]) {
                persistedState.theme = theme;
              }
            } catch (e) {
              console.error('Failed to migrate old theme:', e);
            }
          }

          // Read from old 'darkMode' key (boolean) as fallback
          if (!oldTheme) {
            const oldDarkMode = localStorage.getItem('darkMode');
            if (oldDarkMode) {
              try {
                const isDark = JSON.parse(oldDarkMode);
                persistedState.theme = isDark ? 'dark' : 'light';
              } catch (e) {
                console.error('Failed to migrate old darkMode:', e);
              }
            }
          }
        }
        return persistedState;
      },
    }
  )
);
