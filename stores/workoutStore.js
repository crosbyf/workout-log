import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Helper function to get today's date in YYYY-MM-DD format (local time)
export const getTodayDate = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Default current workout structure
const defaultCurrentWorkout = {
  date: getTodayDate(),
  exercises: [],
  notes: '',
  location: '',
  structure: '',
  structureDuration: '',
};

export const useWorkoutStore = create(
  persist(
    (set, get) => ({
      // State
      workouts: [],
      current: { ...defaultCurrentWorkout },
      editing: null,
      workoutStarted: false,
      timerRunning: false,
      workoutTimer: 0,
      pausedTime: 0,
      lastStartTime: null,

      // Actions
      saveWorkout: (elapsedTime = null) => {
        set((state) => {
          const workoutToSave = {
            ...state.current,
            elapsedTime: elapsedTime !== null ? elapsedTime : state.workoutTimer,
          };

          let updatedWorkouts;
          if (state.editing !== null) {
            // Replace workout at index
            updatedWorkouts = [...state.workouts];
            updatedWorkouts[state.editing] = workoutToSave;
          } else {
            // Prepend new workout
            updatedWorkouts = [workoutToSave, ...state.workouts];
          }

          return {
            workouts: updatedWorkouts,
            current: { ...defaultCurrentWorkout },
            editing: null,
            workoutStarted: false,
            timerRunning: false,
            workoutTimer: 0,
            pausedTime: 0,
            lastStartTime: null,
          };
        });
      },

      deleteWorkout: (index) => {
        set((state) => ({
          workouts: state.workouts.filter((_, i) => i !== index),
        }));
      },

      setCurrent: (updates) => {
        set((state) => ({
          current: { ...state.current, ...updates },
        }));
      },

      resetCurrent: () => {
        set(() => ({
          current: { ...defaultCurrentWorkout },
          editing: null,
          workoutStarted: false,
          timerRunning: false,
          workoutTimer: 0,
          pausedTime: 0,
          lastStartTime: null,
        }));
      },

      setEditing: (index) => {
        set((state) => ({
          editing: index,
          current: index !== null ? { ...state.workouts[index] } : { ...defaultCurrentWorkout },
        }));
      },

      addExercise: () => {
        set((state) => ({
          current: {
            ...state.current,
            exercises: [
              ...state.current.exercises,
              { name: '', sets: [{ reps: '', weight: null }], notes: '' },
            ],
          },
        }));
      },

      updateExercise: (exerciseIndex, field, value) => {
        set((state) => {
          const newExercises = [...state.current.exercises];
          newExercises[exerciseIndex] = {
            ...newExercises[exerciseIndex],
            [field]: value,
          };
          return {
            current: { ...state.current, exercises: newExercises },
          };
        });
      },

      updateSet: (exerciseIndex, setIndex, field, value) => {
        set((state) => {
          const newExercises = [...state.current.exercises];
          const newSets = [...newExercises[exerciseIndex].sets];
          newSets[setIndex] = {
            ...newSets[setIndex],
            [field]: value,
          };
          newExercises[exerciseIndex] = {
            ...newExercises[exerciseIndex],
            sets: newSets,
          };
          return {
            current: { ...state.current, exercises: newExercises },
          };
        });
      },

      addSet: (exerciseIndex) => {
        set((state) => {
          const newExercises = [...state.current.exercises];
          newExercises[exerciseIndex] = {
            ...newExercises[exerciseIndex],
            sets: [
              ...newExercises[exerciseIndex].sets,
              { reps: '', weight: null },
            ],
          };
          return {
            current: { ...state.current, exercises: newExercises },
          };
        });
      },

      removeSet: (exerciseIndex, setIndex) => {
        set((state) => {
          const newExercises = [...state.current.exercises];
          newExercises[exerciseIndex] = {
            ...newExercises[exerciseIndex],
            sets: newExercises[exerciseIndex].sets.filter((_, i) => i !== setIndex),
          };
          return {
            current: { ...state.current, exercises: newExercises },
          };
        });
      },

      removeExercise: (exerciseIndex) => {
        set((state) => ({
          current: {
            ...state.current,
            exercises: state.current.exercises.filter((_, i) => i !== exerciseIndex),
          },
        }));
      },

      loadPreset: (preset) => {
        set((state) => ({
          current: {
            ...state.current,
            exercises: preset.exercises.map((name) => ({
              name,
              sets: [{ reps: '', weight: null }],
              notes: '',
            })),
          },
        }));
      },

      startWorkout: () => {
        set(() => ({
          workoutStarted: true,
          timerRunning: true,
          lastStartTime: Date.now(),
          pausedTime: 0,
          workoutTimer: 0,
        }));
      },

      pauseTimer: () => {
        set((state) => {
          const elapsed = state.lastStartTime ? Date.now() - state.lastStartTime : 0;
          return {
            timerRunning: false,
            pausedTime: state.pausedTime + elapsed,
            workoutTimer: state.pausedTime + elapsed,
          };
        });
      },

      resumeTimer: () => {
        set(() => ({
          lastStartTime: Date.now(),
          timerRunning: true,
        }));
      },

      updateTimerDisplay: () => {
        set((state) => {
          if (!state.timerRunning) {
            return { workoutTimer: state.pausedTime };
          }
          const elapsed = state.lastStartTime ? Date.now() - state.lastStartTime : 0;
          return {
            workoutTimer: state.pausedTime + elapsed,
          };
        });
      },

      resetTimer: () => {
        set(() => ({
          workoutTimer: 0,
          pausedTime: 0,
          lastStartTime: null,
          timerRunning: false,
        }));
      },
    }),
    {
      name: 'gors-workout-store',
      partialize: (state) => ({
        workouts: state.workouts,
      }),
      // Migration function for backward compatibility
      migrate: (persistedState, version) => {
        // Read from old localStorage key if it exists
        if (typeof window !== 'undefined') {
          const oldWorkouts = localStorage.getItem('workouts');
          if (oldWorkouts) {
            try {
              const parsed = JSON.parse(oldWorkouts);
              if (Array.isArray(parsed) && parsed.length > 0) {
                persistedState.workouts = parsed;
              }
              // Don't delete old key, keep it for compatibility
            } catch (e) {
              console.error('Failed to migrate old workouts:', e);
            }
          }
        }
        return persistedState;
      },
    }
  )
);
