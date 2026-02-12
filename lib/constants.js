export const PRESET_COLORS = [
  { name: 'Blue', border: 'border-blue-400', bg: 'bg-blue-500/10', text: 'text-blue-400' },
  { name: 'Purple', border: 'border-purple-400', bg: 'bg-purple-500/10', text: 'text-purple-400' },
  { name: 'Green', border: 'border-green-400', bg: 'bg-green-500/10', text: 'text-green-400' },
  { name: 'Yellow', border: 'border-yellow-400', bg: 'bg-yellow-500/10', text: 'text-yellow-400' },
  { name: 'Red', border: 'border-red-400', bg: 'bg-red-500/10', text: 'text-red-400' },
  { name: 'Pink', border: 'border-pink-400', bg: 'bg-pink-500/10', text: 'text-pink-400' },
  { name: 'Orange', border: 'border-orange-400', bg: 'bg-orange-500/10', text: 'text-orange-400' },
  { name: 'Cyan', border: 'border-cyan-400', bg: 'bg-cyan-500/10', text: 'text-cyan-400' },
];

export const VOLUME_FILTER_EXERCISES = [
  'Pull-ups',
  'Chin-ups',
  'Dips',
  'Push-ups',
  'Inverted rows',
  'Pike push-ups',
  'Decline push-ups',
  'Bicep curls',
  'Hammer curls',
  'Lateral raises',
  'Overhead press',
  'Deadhang',
];

export const EXERCISE_CHART_COLORS = [
  'from-blue-600 to-blue-400',
  'from-purple-600 to-purple-400',
  'from-green-600 to-green-400',
  'from-orange-600 to-orange-400',
  'from-pink-600 to-pink-400',
  'from-cyan-600 to-cyan-400',
  'from-yellow-600 to-yellow-400',
  'from-red-600 to-red-400',
];

export function getPresetColor(presetName, presets) {
  const preset = presets.find((p) => p.name === presetName);
  if (!preset || !preset.color) {
    return PRESET_COLORS[0];
  }
  const color = PRESET_COLORS.find((c) => c.name === preset.color);
  return color || PRESET_COLORS[0];
}
