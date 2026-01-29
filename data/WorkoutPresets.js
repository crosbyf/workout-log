// data/WorkoutPresets.js

export const WorkoutPresets = {
  // 1. YOUR SPECIFIC ROUTINES (Hardcoded so they never disappear)
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
      exercises: ["Pull-ups", "Pike push-ups", "Inverted Rows", "Decline push-ups", "Lateral Raises", "Hammer Curls", "Deadhangs"]
    },
    {
      name: "Garage B",
      color: "Blue",
      includeInMenu: true,
      exercises: ["Chin-ups", "Dips", "Inverted Rows", "Overhead Press", "Bicep curls", "Lateral Raises", "Deadhangs"]
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
      exercises: ["Pull-ups", "Chin-ups"]
    },
   {
      name: "Day Off",
      color: "Red",
      includeInMenu: true,
      exercises: []
    },
  ],

  // 2. MASTER EXERCISE LIST (For the search/autocomplete feature)
  // You can paste your full exercise list here
  exerciseLibrary: [
    "Pull-ups", "Inverted Rows", "Dips", "Decline Push-ups", "Deadhangs", "Pike push-ups", "Push-ups", "Chin-ups", "Bicep Curls", "Hammer Curls", "Lateral Raises", "Overhead Press", 
  ],

  // 3. COLOR PALETTE (Moved from index.js to keep it clean)
  colors: [
    { name: 'Blue', border: 'border-blue-400', bg: 'bg-blue-500/10', text: 'text-blue-400' },
    { name: 'Purple', border: 'border-purple-400', bg: 'bg-purple-500/10', text: 'text-purple-400' },
    { name: 'Green', border: 'border-green-400', bg: 'bg-green-500/10', text: 'text-green-400' },
    { name: 'Yellow', border: 'border-yellow-400', bg: 'bg-yellow-500/10', text: 'text-yellow-400' },
    { name: 'Red', border: 'border-red-400', bg: 'bg-red-500/10', text: 'text-red-400' },
    { name: 'Pink', border: 'border-pink-400', bg: 'bg-pink-500/10', text: 'text-pink-400' },
    { name: 'Orange', border: 'border-orange-400', bg: 'bg-orange-500/10', text: 'text-orange-400' },
    { name: 'Cyan', border: 'border-cyan-400', bg: 'bg-cyan-500/10', text: 'text-cyan-400' },
  ]
};
