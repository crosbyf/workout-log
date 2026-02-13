import { useMemo } from 'react';
import { ChevronLeft } from 'lucide-react';
import { useWorkoutStore } from '../../stores/workoutStore';
import { useUIStore } from '../../stores/uiStore';
import { useThemeStore } from '../../stores/themeStore';
import { getWeekKey, getWeekLabel } from '../../lib/formatting';

export default function ExerciseDetail() {
  const { getCurrentTheme } = useThemeStore();
  const { selectedExercise, setSelectedExercise } = useUIStore();
  const { workouts } = useWorkoutStore();
  const currentTheme = getCurrentTheme();

  // Get data for this exercise
  const exerciseData = useMemo(() => {
    const weeks = {};
    const months = {};

    workouts.forEach((workout) => {
      const exercise = workout.exercises.find((e) => e.name === selectedExercise);
      if (exercise) {
        const reps = exercise.sets.reduce((sum, set) => sum + (parseInt(set.reps) || 0), 0);
        if (reps > 0) {
          // Weekly data
          const weekKey = getWeekKey(workout.date);
          weeks[weekKey] = (weeks[weekKey] || 0) + reps;

          // Monthly data
          const [year, month] = workout.date.split('-');
          const monthKey = `${year}-${month}`;
          months[monthKey] = (months[monthKey] || 0) + reps;
        }
      }
    });

    return { weeks, months };
  }, [workouts, selectedExercise]);

  // Sort weeks (newest first)
  const sortedWeeks = useMemo(() => {
    return Object.entries(exerciseData.weeks)
      .sort(([keyA], [keyB]) => keyB.localeCompare(keyA))
      .slice(0, 12);
  }, [exerciseData.weeks]);

  // Sort months (newest first)
  const sortedMonths = useMemo(() => {
    return Object.entries(exerciseData.months)
      .sort(([keyA], [keyB]) => keyB.localeCompare(keyA))
      .slice(0, 12);
  }, [exerciseData.months]);

  const maxWeeklyVolume = Math.max(...sortedWeeks.map(([, vol]) => vol), 1);
  const maxMonthlyVolume = Math.max(...sortedMonths.map(([, vol]) => vol), 1);

  return (
    <div className={`pb-20 ${currentTheme.bg}`} style={{ backgroundColor: currentTheme.rawBg }}>
      {/* Back Button */}
      <button
        onClick={() => setSelectedExercise(null)}
        className={`flex items-center gap-2 mb-6 font-semibold ${currentTheme.text} px-4 pt-4`}
      >
        <ChevronLeft size={24} />
        Back
      </button>

      {/* Title */}
      <h2 className={`text-2xl font-bold mb-6 ${currentTheme.text} px-4`}>{selectedExercise}</h2>

      {/* Weekly Volume */}
      <div className={`rounded-xl p-4 mb-6 ${currentTheme.cardBg} mx-4`} style={{ backgroundColor: currentTheme.rawCardBg }}>
        <h3 className={`text-lg font-bold mb-4 ${currentTheme.text}`}>Weekly Volume</h3>

        {sortedWeeks.length === 0 ? (
          <div className={`text-center py-6 ${currentTheme.text} opacity-50`}>
            No data available
          </div>
        ) : (
          <div className="space-y-2">
            {sortedWeeks.map(([weekKey, volume]) => {
              const heightPercent = (volume / maxWeeklyVolume) * 100;
              const label = getWeekLabel(weekKey);
              return (
                <div key={weekKey}>
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-sm font-semibold ${currentTheme.text}`}>{label}</span>
                    <span className={`text-sm font-semibold ${currentTheme.text}`}>{volume} reps</span>
                  </div>
                  <div className={`h-8 rounded-lg overflow-hidden flex items-center pl-2 bg-gradient-to-r from-blue-600 to-blue-400`}>
                    <span className="text-white text-xs font-bold">{volume}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Monthly Volume */}
      <div className={`rounded-xl p-4 mb-6 ${currentTheme.cardBg} mx-4`} style={{ backgroundColor: currentTheme.rawCardBg }}>
        <h3 className={`text-lg font-bold mb-4 ${currentTheme.text}`}>Monthly Volume</h3>

        {sortedMonths.length === 0 ? (
          <div className={`text-center py-6 ${currentTheme.text} opacity-50`}>
            No data available
          </div>
        ) : (
          <div className="space-y-2">
            {sortedMonths.map(([monthKey, volume]) => {
              const [year, month] = monthKey.split('-');
              const monthName = new Date(year, parseInt(month) - 1).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
              const heightPercent = (volume / maxMonthlyVolume) * 100;
              return (
                <div key={monthKey}>
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-sm font-semibold ${currentTheme.text}`}>{monthName}</span>
                    <span className={`text-sm font-semibold ${currentTheme.text}`}>{volume} reps</span>
                  </div>
                  <div className={`h-8 rounded-lg overflow-hidden flex items-center pl-2 bg-gradient-to-r from-green-600 to-green-400`}>
                    <span className="text-white text-xs font-bold">{volume}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
