import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const usePresetStore = create(
  persist(
    (set, get) => ({
      // State
      presets: [],
      exercises: [],

      // Actions
      addPreset: (preset) => {
        set((state) => ({
          presets: [...state.presets, preset],
        }));
      },

      updatePreset: (index, updates) => {
        set((state) => {
          const newPresets = [...state.presets];
          newPresets[index] = { ...newPresets[index], ...updates };
          return { presets: newPresets };
        });
      },

      deletePreset: (index) => {
        set((state) => ({
          presets: state.presets.filter((_, i) => i !== index),
        }));
      },

      reorderPresets: (fromIndex, toIndex) => {
        set((state) => {
          const newPresets = [...state.presets];
          const [movedPreset] = newPresets.splice(fromIndex, 1);
          newPresets.splice(toIndex, 0, movedPreset);
          return { presets: newPresets };
        });
      },

      movePresetUp: (index) => {
        if (index > 0) {
          get().reorderPresets(index, index - 1);
        }
      },

      movePresetDown: (index) => {
        set((state) => {
          if (index < state.presets.length - 1) {
            get().reorderPresets(index, index + 1);
          }
        });
      },

      addExerciseName: (name) => {
        set((state) => {
          if (!state.exercises.includes(name)) {
            return { exercises: [...state.exercises, name].sort() };
          }
          return state;
        });
      },

      deleteExerciseName: (name) => {
        set((state) => ({
          exercises: state.exercises.filter((exercise) => exercise !== name),
        }));
      },

      setPresets: (presets) => {
        set(() => ({ presets }));
      },

      setExercises: (exercises) => {
        set(() => ({ exercises }));
      },
    }),
    {
      name: 'presets-store',
      partialize: (state) => ({
        presets: state.presets,
        exercises: state.exercises,
      }),
      // Migration function for backward compatibility
      migrate: (persistedState, version) => {
        if (typeof window !== 'undefined') {
          // Read from old 'presets' key
          const oldPresets = localStorage.getItem('presets');
          if (oldPresets) {
            try {
              const parsed = JSON.parse(oldPresets);
              if (Array.isArray(parsed) && parsed.length > 0) {
                persistedState.presets = parsed;
              }
            } catch (e) {
              console.error('Failed to migrate old presets:', e);
            }
          }

          // Read from old 'exercises' key
          const oldExercises = localStorage.getItem('exercises');
          if (oldExercises) {
            try {
              const parsed = JSON.parse(oldExercises);
              if (Array.isArray(parsed) && parsed.length > 0) {
                persistedState.exercises = parsed;
              }
            } catch (e) {
              console.error('Failed to migrate old exercises:', e);
            }
          }
        }
        return persistedState;
      },
    }
  )
);
