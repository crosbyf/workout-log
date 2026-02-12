import { create } from 'zustand';

export const useUIStore = create((set, get) => ({
  // State
  view: 'home', // 'home' | 'stats' | 'settings'
  statsView: 'menu', // 'menu' | 'exercises' | 'weight' | 'protein'
  selectedExercise: null,
  showWorkoutModal: false,
  showPresetSelector: false,
  showDayModal: false,
  selectedDay: null,
  showHistoryModal: false,
  showEndWorkoutConfirm: false,
  showCloseConfirm: false,
  showWeightModal: false,
  editingWeight: null,
  deleteWeight: null,
  showAddProtein: false,
  editingProteinDate: null,
  editingProteinEntry: null,
  showCreatePreset: false,
  editingPreset: null,
  showSaveAsPreset: false,
  showCalendarLegend: false,
  showBackups: false,
  showClear: false,
  deleteWorkout: null,
  deletePreset: null,
  deleteExercise: null,
  search: '',
  searchExpanded: false,
  weekOffset: 0,
  workoutViewMode: 'table', // 'table' | 'card'
  quickAddTab: 'workout', // 'workout' | 'weight' | 'protein'
  expandedProteinDays: [], // Array instead of Set for serialization, treat as set
  showPresetsMenu: false,
  showExercisesMenu: false,
  showDataManagement: false,
  showDataDeletion: false,
  showVolumeFilter: false,
  selectedVolumeExercises: [],
  toastMessage: '',
  showToast: false,

  // Actions
  setView: (view) => {
    set({ view });
    // Scroll to top
    if (typeof window !== 'undefined') {
      window.scrollTo(0, 0);
    }
  },

  setStatsView: (view) => {
    set({ statsView: view });
  },

  setSelectedExercise: (name) => {
    set({ selectedExercise: name });
  },

  openModal: (modalName) => {
    const camelCaseName = `show${modalName.charAt(0).toUpperCase()}${modalName.slice(1)}`;
    set({ [camelCaseName]: true });
  },

  closeModal: (modalName) => {
    const camelCaseName = `show${modalName.charAt(0).toUpperCase()}${modalName.slice(1)}`;
    set({ [camelCaseName]: false });
  },

  setSearch: (query) => {
    set({ search: query });
  },

  toggleSearch: () => {
    set((state) => ({
      searchExpanded: !state.searchExpanded,
      search: state.searchExpanded ? '' : state.search,
    }));
  },

  setWeekOffset: (offset) => {
    set({ weekOffset: offset });
  },

  showToastMessage: (message) => {
    set({ toastMessage: message, showToast: true });
    // Auto-hide after 3 seconds
    if (typeof window !== 'undefined') {
      setTimeout(() => {
        set({ showToast: false });
      }, 3000);
    }
  },

  toggleProteinDay: (date) => {
    set((state) => {
      const expanded = [...state.expandedProteinDays];
      const index = expanded.indexOf(date);
      if (index > -1) {
        expanded.splice(index, 1);
      } else {
        expanded.push(date);
      }
      return { expandedProteinDays: expanded };
    });
  },

  setSelectedVolumeExercises: (exercises) => {
    set({ selectedVolumeExercises: exercises });
  },

  reset: () => {
    set({
      showWorkoutModal: false,
      showPresetSelector: false,
      showDayModal: false,
      selectedDay: null,
      showHistoryModal: false,
      showEndWorkoutConfirm: false,
      showCloseConfirm: false,
      showWeightModal: false,
      editingWeight: null,
      deleteWeight: null,
      showAddProtein: false,
      editingProteinDate: null,
      editingProteinEntry: null,
      showCreatePreset: false,
      editingPreset: null,
      showSaveAsPreset: false,
      showCalendarLegend: false,
      showBackups: false,
      showClear: false,
      deleteWorkout: null,
      deletePreset: null,
      deleteExercise: null,
      showPresetsMenu: false,
      showExercisesMenu: false,
      showDataManagement: false,
      showDataDeletion: false,
      showVolumeFilter: false,
    });
  },
}));
