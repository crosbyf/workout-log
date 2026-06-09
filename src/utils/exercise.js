/**
 * Exercise-specific utilities — deadhang detection and rep calculations.
 */

/**
 * Check if an exercise is a deadhang (timed in seconds, not reps).
 */
export function isDeadhang(exerciseName) {
  return exerciseName?.toLowerCase() === 'deadhang';
}

/**
 * Format a rep value — appends "s" for deadhang exercises.
 */
export function formatRepValue(value, exerciseName) {
  if (isDeadhang(exerciseName)) return `${value}s`;
  return String(value);
}

/**
 * Calculate total reps for an array of exercises, excluding deadhang seconds.
 */
export function calculateTotalReps(exercises) {
  return exercises.reduce((sum, ex) => {
    if (isDeadhang(ex.name)) return sum;
    return sum + ex.sets.reduce((s, set) => s + (Number(set.reps) || 0), 0);
  }, 0);
}
