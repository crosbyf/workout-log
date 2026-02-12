import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useWorkoutStore } from '../../stores/workoutStore';
import { useUIStore } from '../../stores/uiStore';
import { useThemeStore } from '../../stores/themeStore';
import { getTodayDate, getWeekKey } from '../../lib/formatting';

export default function ExerciseList() {
  const { getCurrentTheme } = useThemeStore();
  const { setStatsView, setSelectedExercise } = useUIStore();
  const { workouts } = useWorkoutStore();
  const currentTheme = getCurrentTheme();
  const [monthOffset, setMonthOffset] = useState(0);

  // Get all unique exercises
  const allExercises = useMemo(() => {
    const exercises = {};
    workouts.forEach((workout) => {
      workout.exercises.forEach((exercise) => {
        if (exercise.name) {
          if (!exercises[exercise.name]) {
            exercises[exercise.name] = {
              name: exercise.name,
              workoutCount: 0,
              totalReps: 0,
            };
          }
          exercises[exercise.name].workoutCount += 1;
          exercises[exercise.name].totalReps += exercise.sets.reduce((sum, set) => sum + (parseInt(set.reps) || 0), 0);
        }
      });
    });

    return Object.values(exercises).sort((a, b) => a.name.localeCompare(b.name));
  }, [workouts]);

  // Get current month for widget
  const today = new Date();
  const currentMonth = new Date(today);
  currentMonth.setMonth(currentMonth.getMonth() - monthOffset);
  const monthYear = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const prevMonthDate = new Date(currentMonth);
  prevMonthDate.setMonth(prevMonthDate.getMonth() - 1);

  // Calculate monthly volume for top 3 exercises
  const getMonthlyVolume = (exerciseName, date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    let volume = 0;
    workouts.forEach((workout) => {
      const workoutDate = new Date(workout.date);
      if (workoutDate.getFullYear() === year && workoutDate.getMonth() === month) {
        const exercise = workout.exercises.find((e) => e.name === exerciseName);
        if (exercise) {
          volume += exercise.sets.reduce((sum, set) => sum + (parseInt(set.reps) || 0), 0);
        }
      }
    });
    return volume;
  };

  const topExercises = useMemo(() => {
    return allExercises.slice(0, 3).map((exercise) => {
      const currentVol = getMonthlyVolume(exercise.name, currentMonth);
      const prevVol = getMonthlyVolume(exercise.name, prevMonthDate);
      const change = prevVol > 0 ? ((currentVol - prevVol) / prevVol) * 100 : currentVol > 0 ? 100 : 0;
      return {
        name: exercise.name,
        currentVolume: currentVol,
        prevVolume: prevVol,
        change,
      };
    });
  }, [allExercises, currentMonth, prevMonthDate]);

  return (
    <div className={`pb-20 px-4 pt-4 ${currentTheme.bg}`} style={{ backgroundColor: currentTheme.rawBg }}>
      {/* Back Button */}
      <button
        onClick={() => setStatsView('menu')}
        className={`flex items-center gap-2 mb-6 font-semibold ${currentTheme.text}`}
      >
        <ChevronLeft size={24} />
        Back
      </button>

      {/* Title */}
      <h2 className={`text-2xl font-bold mb-6 ${currentTheme.text}`}>Exercise Statistics</h2>

      {/* Monthly Volume Widget */}
      <div className={`rounded-xl p-4 mb-6 ${currentTheme.cardBg}`} style={{ backgroundColor: currentTheme.rawCardBg }}>
        <div className="flex items-center justify-between mb-4">
          <h3 className={`text-lg font-bold ${currentTheme.text}`}>{monthYear} Volume</h3>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setMonthOffset(monthOffset + 1)}
              className={`p-1 rounded hover:bg-white hover:bg-opacity-10 transition-all ${currentTheme.text}`}
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={() => setMonthOffset(Math.max(0, monthOffset - 1))}
              className={`p-1 rounded hover:bg-white hover:bg-opacity-10 transition-all ${currentTheme.text} ${monthOffset === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={monthOffset === 0}
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {topExercises.map((exercise) => (
            <div key={exercise.name}>
              <div className="flex items-center justify-between mb-1">
                <span className={`text-sm font-semibold ${currentTheme.text}`}>{exercise.name}</span>
                <span className={`text-sm ${currentTheme.text}`}>{exercise.currentVolume} reps</span>
              </div>
              <div className={`h-2 rounded-full ${currentTheme.cardBorder}`} style={{ backgroundColor: currentTheme.rawCardBorder }}>
                <div
                  className="h-full rounded-full bg-gradient-to-r from-green-600 to-green-400"
                  style={{ width: `${Math.min((exercise.currentVolume / Math.max(...topExercises.map((e) => e.currentVolume), 1)) * 100, 100)}%` }}
                />
              </div>
              {exercise.prevVolume > 0 && (
                <div className={`text-xs mt-1 ${exercise.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {exercise.change >= 0 ? '+' : ''}{exercise.change.toFixed(0)}% from last month
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Exercise List */}
      <div className="space-y-2">
        {allExercises.length === 0 ? (
          <div className={`text-center py-8 ${currentTheme.text} opacity-50`}>
            No exercises tracked yet
          </div>
        ) : (
          allExercises.map((exercise) => (
            <button
              key={exercise.name}
              onClick={() => setSelectedExercise(exercise.name)}
              className={`w-full p-4 rounded-xl flex items-center justify-between transition-all active:scale-95 ${currentTheme.cardBg}`}
              style={{ backgroundColor: currentTheme.rawCardBg }}
            >
              <div className="text-left">
                <div className={`font-semibold ${currentTheme.text}`}>{exercise.name}</div>
                <div className={`text-sm opacity-75 ${currentTheme.text}`}>
                  {exercise.workoutCount} workouts • {exercise.totalReps} reps
                </div>
              </div>
              <ChevronRight className={currentTheme.text} />
            </button>
          ))
        )}
      </div>
    </div>
  );
}
