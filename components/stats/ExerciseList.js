import { useMemo } from 'react';
import { ChevronLeft } from 'lucide-react';
import { useWorkoutStore } from '../../stores/workoutStore';
import { useUIStore } from '../../stores/uiStore';
import { useThemeStore } from '../../stores/themeStore';

export default function ExerciseList() {
  const { getCurrentTheme } = useThemeStore();
  const { setStatsView, setSelectedExercise } = useUIStore();
  const { workouts } = useWorkoutStore();
  const currentTheme = getCurrentTheme();

  // Get all unique exercises sorted alphabetically
  const allExercises = useMemo(() => {
    const exercises = {};
    workouts.forEach((workout) => {
      workout.exercises.forEach((exercise) => {
        if (exercise.name) {
          if (!exercises[exercise.name]) {
            exercises[exercise.name] = {
              name: exercise.name,
              totalReps: 0,
              lastPerformed: null,
            };
          }
          const reps = exercise.sets.reduce((sum, set) => sum + (parseInt(set.reps) || 0), 0);
          exercises[exercise.name].totalReps += reps;
          exercises[exercise.name].lastPerformed = new Date(workout.date) > (exercises[exercise.name].lastPerformed || new Date(0)) ? workout.date : exercises[exercise.name].lastPerformed;
        }
      });
    });

    return Object.values(exercises).sort((a, b) => a.name.localeCompare(b.name));
  }, [workouts]);

  return (
    <div className={`pb-20 ${currentTheme.bg}`} style={{ backgroundColor: currentTheme.rawBg }}>
      {/* Back Button */}
      <button
        onClick={() => setStatsView('menu')}
        className={`flex items-center gap-2 mb-6 font-semibold ${currentTheme.text} px-4 pt-4`}
      >
        <ChevronLeft size={24} />
        Back
      </button>

      {/* Title */}
      <h2 className={`text-2xl font-bold mb-6 ${currentTheme.text} px-4`}>Exercise Stats</h2>

      {/* Exercise List */}
      <div className="space-y-2 px-4">
        {allExercises.length === 0 ? (
          <div className={`text-center py-8 ${currentTheme.text} opacity-50`}>
            No exercises tracked yet
          </div>
        ) : (
          allExercises.map((exercise) => (
            <button
              key={exercise.name}
              onClick={() => {
                setSelectedExercise(exercise.name);
                setStatsView('exercises');
              }}
              className={`w-full p-4 rounded-xl flex flex-col gap-2 transition-all active:scale-95 ${currentTheme.cardBg}`}
              style={{ backgroundColor: currentTheme.rawCardBg }}
            >
              <div className="text-left">
                <div className={`font-semibold ${currentTheme.text}`}>{exercise.name}</div>
                <div className={`text-sm opacity-75 ${currentTheme.text}`}>
                  {exercise.totalReps} total reps
                </div>
              </div>
              {exercise.lastPerformed && (
                <div className={`text-xs opacity-60 ${currentTheme.text}`}>
                  Last: {exercise.lastPerformed}
                </div>
              )}
            </button>
          ))
        )}
      </div>
    </div>
  );
}
