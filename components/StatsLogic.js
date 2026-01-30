// This file handles the heavy calculations for your charts and volume trends
export const StatsLogic = {
  // Calculates total reps/volume for a specific exercise over time
  calculateVolume: (workouts, exerciseName) => {
    return workouts.reduce((total, workout) => {
      const exercise = workout.exercises?.find(e => e.name === exerciseName);
      if (exercise) {
        const exerciseVol = exercise.sets?.reduce((s, set) => s + (parseInt(set.reps) || 0), 0);
        return total + (exerciseVol || 0);
      }
      return total;
    }, 0);
  },

  // Groups data by month for your Monthly Volume Widget
  getMonthlyTrends: (workouts) => {
    const months = {};
    workouts.forEach(workout => {
      const month = workout.date.substring(0, 7); // Gets "2026-01"
      if (!months[month]) months[month] = 0;
      // Adds up all reps in that month
      workout.exercises?.forEach(ex => {
        ex.sets?.forEach(set => {
          months[month] += (parseInt(set.reps) || 0);
        });
      });
    });
    return months;
  }
};
