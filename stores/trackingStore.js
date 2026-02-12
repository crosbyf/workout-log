import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useTrackingStore = create(
  persist(
    (set, get) => ({
      // State
      weightEntries: [],
      proteinEntries: [],

      // Weight Entry Actions
      addWeightEntry: (entry) => {
        set((state) => ({
          weightEntries: [...state.weightEntries, entry],
        }));
      },

      updateWeightEntry: (index, entry) => {
        set((state) => {
          const newEntries = [...state.weightEntries];
          newEntries[index] = entry;
          return { weightEntries: newEntries };
        });
      },

      deleteWeightEntry: (index) => {
        set((state) => ({
          weightEntries: state.weightEntries.filter((_, i) => i !== index),
        }));
      },

      setWeightEntries: (entries) => {
        set(() => ({ weightEntries: entries }));
      },

      // Protein Entry Actions
      addProteinEntry: (entry) => {
        set((state) => ({
          proteinEntries: [
            ...state.proteinEntries,
            { ...entry, timestamp: entry.timestamp || Date.now() },
          ],
        }));
      },

      updateProteinEntry: (timestamp, updates) => {
        set((state) => ({
          proteinEntries: state.proteinEntries.map((entry) =>
            entry.timestamp === timestamp ? { ...entry, ...updates } : entry
          ),
        }));
      },

      deleteProteinEntry: (timestamp) => {
        set((state) => ({
          proteinEntries: state.proteinEntries.filter(
            (entry) => entry.timestamp !== timestamp
          ),
        }));
      },

      setProteinEntries: (entries) => {
        set(() => ({ proteinEntries: entries }));
      },
    }),
    {
      name: 'tracking-store',
      partialize: (state) => ({
        weightEntries: state.weightEntries,
        proteinEntries: state.proteinEntries,
      }),
      // Migration function for backward compatibility
      migrate: (persistedState, version) => {
        if (typeof window !== 'undefined') {
          // Read from old 'weightEntries' key
          const oldWeightEntries = localStorage.getItem('weightEntries');
          if (oldWeightEntries) {
            try {
              const parsed = JSON.parse(oldWeightEntries);
              if (Array.isArray(parsed) && parsed.length > 0) {
                persistedState.weightEntries = parsed;
              }
            } catch (e) {
              console.error('Failed to migrate old weightEntries:', e);
            }
          }

          // Read from old 'proteinEntries' key
          const oldProteinEntries = localStorage.getItem('proteinEntries');
          if (oldProteinEntries) {
            try {
              const parsed = JSON.parse(oldProteinEntries);
              if (Array.isArray(parsed) && parsed.length > 0) {
                persistedState.proteinEntries = parsed;
              }
            } catch (e) {
              console.error('Failed to migrate old proteinEntries:', e);
            }
          }
        }
        return persistedState;
      },
    }
  )
);
