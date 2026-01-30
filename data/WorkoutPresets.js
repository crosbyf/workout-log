// data/WorkoutPresets.js
// Default workout routines, exercise library, and color palette

export const WorkoutPresets = {
  // Your specific workout routines
  routines: [
    {
      name: "BW-only",
      color: "Yellow",
      includeInMenu: true,
      exercises: ["Pull-ups", "Pike Push-ups", "Inverted Rows", "Dips", "Decline Push-ups", "Deadhang"]
    },
    {
      name: "Garage A",
      color: "Green",
      includeInMenu: true,
      exercises: ["Pull-ups", "Pike Push-ups", "Inverted Rows", "Decline Push-ups", "Lateral Raises", "Hammer Curls", "Deadhangs"]
    },
    {
      name: "Garage B",
      color: "Blue",
      includeInMenu: true,
      exercises: ["Chin-ups", "Dips", "Inverted Rows", "Overhead Press", "Bicep Curls", "Lateral Raises", "Deadhangs"]
    },
    {
      name: "GtG",
      color: "Pink",
      includeInMenu: true,
      exercises: ["Pull-ups", "Chin-ups"]
    },
    {
      name: "Manual",
      color: "Orange",
      includeInMenu: true,
      exercises: []
    },
    {
      name: "Day Off",
      color: "Red",
      includeInMenu: true,
      exercises: []
    },
  ],

  // Master exercise list for autocomplete/search
  exerciseLibrary: [
    "Pull-ups",
    "Chin-ups",
    "Inverted Rows",
    "Dips",
    "Push-ups",
    "Decline Push-ups",
    "Pike Push-ups",
    "Deadhangs",
    "Bicep Curls",
    "Hammer Curls",
    "Lateral Raises",
    "Overhead Press",
    "Squats",
    "Lunges",
    "Calf Raises",
    "Planks",
    "Hollow Body Hold",
    "L-Sits",
  ],

  // Color palette for workout presets
  colors: [
    { name: 'Blue', border: 'border-blue-400', bg: 'bg-blue-500/10', text: 'text-blue-400' },
    { name: 'Purple', border: 'border-purple-400', bg: 'bg-purple-500/10', text: 'text-purple-400' },
    { name: 'Green', border: 'border-green-400', bg: 'bg-green-500/10', text: 'text-green-400' },
    { name: 'Yellow', border: 'border-yellow-400', bg: 'bg-yellow-500/10', text: 'text-yellow-400' },
    { name: 'Red', border: 'border-red-400', bg: 'bg-red-500/10', text: 'text-red-400' },
    { name: 'Pink', border: 'border-pink-400', bg: 'bg-pink-500/10', text: 'text-pink-400' },
    { name: 'Orange', border: 'border-orange-400', bg: 'bg-orange-500/10', text: 'text-orange-400' },
    { name: 'Cyan', border: 'border-cyan-400', bg: 'bg-cyan-500/10', text: 'text-cyan-400' },
  ],

  // Theme definitions
  themes: {
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
      isDark: false
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
      isDark: true
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
      isDark: true
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
      isDark: true
    }
  }
};
