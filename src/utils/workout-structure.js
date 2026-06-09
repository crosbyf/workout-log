/**
 * Workout structure utilities — pairs/circuit highlighting logic.
 */

/**
 * Get the pair indices that the active exercise belongs to.
 * Pairs: (0,1), (2,3), (4,5), etc.
 * If odd count, last exercise is a standalone finisher.
 * Returns [startIdx, endIdx] (inclusive).
 */
export function getActivePairIndices(totalExercises, activeExerciseIndex) {
  if (activeExerciseIndex < 0) return [-1, -1];

  // If this is the last exercise and total is odd, it's a standalone finisher
  if (totalExercises % 2 === 1 && activeExerciseIndex === totalExercises - 1) {
    return [activeExerciseIndex, activeExerciseIndex];
  }

  const pairStart = Math.floor(activeExerciseIndex / 2) * 2;
  const pairEnd = Math.min(pairStart + 1, totalExercises - 1);
  return [pairStart, pairEnd];
}

/**
 * For circuit mode, find the active set column index.
 * In a circuit, you do set 1 of all exercises, then set 2 of all, etc.
 * The active set column is the first unfilled set across all exercises.
 */
export function getActiveSetColumn(exercises) {
  if (!exercises || exercises.length === 0) return 0;

  // Find the maximum number of sets across all exercises
  const maxSets = Math.max(...exercises.map(ex => ex.sets?.length || 0));

  // Find the first set column that has ANY unfilled entries
  for (let col = 0; col < maxSets; col++) {
    const allFilledInCol = exercises.every(ex => {
      const set = ex.sets?.[col];
      if (!set) return true; // No set at this column = skip
      return set.reps !== '' && set.reps !== 0 && set.reps !== null;
    });
    if (!allFilledInCol) return col;
  }

  return maxSets; // All filled
}
