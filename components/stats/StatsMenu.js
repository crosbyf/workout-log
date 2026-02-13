import { useState, useMemo } from 'react';
import { ChevronRight, Plus } from 'lucide-react';
import { useWorkoutStore } from '../../stores/workoutStore';
import { useTrackingStore } from '../../stores/trackingStore';
import { useUIStore } from '../../stores/uiStore';
import { useThemeStore } from '../../stores/themeStore';
import { getTodayDate, getWeekKey } from '../../lib/formatting';
import { VOLUME_FILTER_EXERCISES, EXERCISE_CHART_COLORS } from '../../lib/constants';
import { ChevronLeft } from 'lucide-react';

export default function StatsMenu() {
  const { getCurrentTheme } = useThemeStore();
  const { setStatsView, showVolumeFilter, selectedVolumeExercises, toggleProteinDay, openModal: openUIModal } = useUIStore();
  const { workouts } = useWorkoutStore();
  const { weightEntries, proteinEntries } = useTrackingStore();
  const currentTheme = getCurrentTheme();

  const [showFilter, setShowFilter] = useState(false);

  // Get all unique exercises from workouts and filter by selected
  const getSelectedExercises = () => {
    if (selectedVolumeExercises.length === 0) {
      return VOLUME_FILTER_EXERCISES;
    }
    return selectedVolumeExercises.filter((name) => VOLUME_FILTER_EXERCISES.includes(name));
  };

  // Calculate volume data for last 12 weeks
  const volumeData = useMemo(() => {
    const today = new Date();
    const weeks = [];

    // Get last 12 weeks starting from current week
    for (let i = 0; i < 12; i++) {
      const weekStart = new Date(today);
      weekStart.setDate(weekStart.getDate() - (today.getDay() === 0 ? 6 : today.getDay() - 1) - i * 7);
      const weekKey = getWeekKey(
        `${weekStart.getFullYear()}-${String(weekStart.getMonth() + 1).padStart(2, '0')}-${String(weekStart.getDate()).padStart(2, '0')}`
      );
      weeks.push({
        weekKey,
        startDate: new Date(weekStart),
        volumes: {},
      });
    }

    weeks.reverse(); // Oldest to newest

    const selectedExercises = getSelectedExercises();

    // Sum volumes for each week
    workouts.forEach((workout) => {
      const workoutWeekKey = getWeekKey(workout.date);
      const week = weeks.find((w) => w.weekKey === workoutWeekKey);
      if (week) {
        workout.exercises.forEach((exercise) => {
          if (selectedExercises.includes(exercise.name)) {
            const reps = exercise.sets.reduce((sum, set) => sum + (parseInt(set.reps) || 0), 0);
            if (reps > 0) {
              week.volumes[exercise.name] = (week.volumes[exercise.name] || 0) + reps;
            }
          }
        });
      }
    });

    return weeks;
  }, [workouts, selectedVolumeExercises]);

  // Get current week data
  const currentWeekData = volumeData[volumeData.length - 1];
  const currentWeekTotal = currentWeekData
    ? Object.values(currentWeekData.volumes).reduce((sum, vol) => sum + vol, 0)
    : 0;

  // Get max volume across all weeks for scaling
  const maxVolume = Math.max(
    ...volumeData.map((w) => Object.values(w.volumes).reduce((sum, v) => sum + v, 0)),
    1
  );

  // Get today's protein total
  const today = getTodayDate();
  const todayProtein = proteinEntries
    .filter((entry) => {
      const entryDate = new Date(entry.timestamp).toISOString().split('T')[0];
      return entryDate === today;
    })
    .reduce((sum, entry) => sum + (entry.grams || 0), 0);

  // Get latest weight
  const latestWeight = weightEntries.length > 0 ? weightEntries[weightEntries.length - 1].weight : null;

  // Get unique exercise count
  const uniqueExercises = new Set();
  workouts.forEach((workout) => {
    workout.exercises.forEach((exercise) => {
      if (exercise.name) {
        uniqueExercises.add(exercise.name);
      }
    });
  });

  const toggleVolumeExercise = (exerciseName) => {
    const { selectedVolumeExercises, setSelectedVolumeExercises } = useUIStore.getState();
    const newSelected = selectedVolumeExercises.includes(exerciseName)
      ? selectedVolumeExercises.filter((name) => name !== exerciseName)
      : [...selectedVolumeExercises, exerciseName];
    setSelectedVolumeExercises(newSelected);
  };

  return (
    <div className={`pb-20 ${currentTheme.bg}`} style={{ backgroundColor: currentTheme.rawBg }}>
      {/* Volume Trend Chart */}
      <div className={`rounded-xl p-5 mb-6 ${currentTheme.cardBg}`} style={{ backgroundColor: currentTheme.rawCardBg }}>
        {/* Header with filter button */}
        <div className="flex items-center justify-between mb-2">
          <h3 className={`text-lg font-bold ${currentTheme.text}`}>Volume Trend</h3>
          <button
            onClick={() => setShowFilter(!showFilter)}
            className={`px-3 py-1 rounded-lg text-sm font-semibold transition-all border ${currentTheme.text}`}
            style={{
              backgroundColor: showFilter ? '#3b82f6' : 'transparent',
              color: showFilter ? '#ffffff' : currentTheme.rawText,
              borderColor: showFilter ? '#3b82f6' : currentTheme.rawCardBorder,
            }}
          >
            Filter
          </button>
        </div>

        {/* Subtitle */}
        <p className={`text-sm opacity-60 mb-4 ${currentTheme.text}`}>Total reps per week (last 12 weeks)</p>

        {/* Filter Pills */}
        {showFilter && (
          <div className="mb-4 pb-4 border-b" style={{ borderColor: currentTheme.rawCardBorder }}>
            <div className="flex flex-wrap gap-2">
              {VOLUME_FILTER_EXERCISES.map((exerciseName) => {
                const isSelected = getSelectedExercises().includes(exerciseName);
                const colorIndex = VOLUME_FILTER_EXERCISES.indexOf(exerciseName);
                const gradientColor = EXERCISE_CHART_COLORS[colorIndex % EXERCISE_CHART_COLORS.length];
                return (
                  <button
                    key={exerciseName}
                    onClick={() => toggleVolumeExercise(exerciseName)}
                    className={`px-3 py-1 rounded-full text-sm font-semibold transition-all ${
                      isSelected
                        ? `bg-gradient-to-r ${gradientColor} text-white`
                        : `${currentTheme.cardBorder} ${currentTheme.text}`
                    }`}
                    style={{
                      backgroundColor: !isSelected ? 'transparent' : undefined,
                      border: !isSelected ? `1px solid ${currentTheme.cardBorder}` : undefined,
                    }}
                  >
                    {exerciseName}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Chart */}
        <div className="flex items-end justify-between gap-1 h-40 mb-4">
          {volumeData.map((week, index) => {
            const isCurrentWeek = index === volumeData.length - 1;
            const weekTotal = Object.values(week.volumes).reduce((sum, v) => sum + v, 0);
            const heightPercent = maxVolume > 0 ? (weekTotal / maxVolume) * 100 : 0;
            const selectedExercises = getSelectedExercises();
            const exercisesInWeek = selectedExercises.filter((name) => week.volumes[name]);

            return (
              <div key={week.weekKey} className="flex-1 relative group">
                {/* Stacked bars for multiple exercises */}
                <div className="flex flex-col justify-end h-full gap-px">
                  {exercisesInWeek.length === 0 ? (
                    <div className={`flex-1 rounded-t ${currentTheme.cardBorder} opacity-30`} style={{ backgroundColor: currentTheme.rawCardBorder, minHeight: '4px' }} />
                  ) : (
                    exercisesInWeek.map((exerciseName, exIdx) => {
                      const colorIndex = selectedExercises.indexOf(exerciseName);
                      const color = EXERCISE_CHART_COLORS[colorIndex % EXERCISE_CHART_COLORS.length];
                      const exerciseVolume = week.volumes[exerciseName] || 0;
                      const exerciseHeightPercent = maxVolume > 0 ? (exerciseVolume / maxVolume) * 100 : 0;
                      return (
                        <div
                          key={exerciseName}
                          className={`flex-1 rounded-t ${exIdx === 0 ? 'rounded-t' : ''} bg-gradient-to-r ${color}`}
                          style={{
                            minHeight: '2px',
                          }}
                        />
                      );
                    })
                  )}
                </div>

                {/* Tooltip */}
                <div className="invisible group-hover:visible absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-black bg-opacity-80 text-white px-2 py-1 rounded text-xs whitespace-nowrap z-10">
                  {weekTotal} reps
                </div>

                {/* Current week indicator */}
                {isCurrentWeek && (
                  <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs font-semibold text-blue-500">
                    NOW
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Current week total */}
        <div className={`text-center text-sm font-semibold pt-2 border-t`} style={{ borderColor: currentTheme.rawCardBorder, color: currentTheme.rawText }}>
          This Week: {currentWeekTotal} reps
        </div>
      </div>

      {/* Navigation Cards */}
      <div className="space-y-3">
        {/* Protein Card */}
        <button
          onClick={() => setStatsView('protein')}
          className={`w-full rounded-xl p-4 flex items-center gap-4 transition-all active:scale-95 ${currentTheme.cardBg}`}
          style={{ backgroundColor: currentTheme.rawCardBg }}
        >
          <div className="text-3xl">🥩</div>
          <div className="flex-1 text-left">
            <div className={`text-sm ${currentTheme.text}`}>Protein Intake</div>
            <div className={`font-semibold ${currentTheme.text}`}>{todayProtein}g today</div>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              openUIModal('addProtein');
            }}
            className="px-4 py-1.5 rounded-lg text-sm font-semibold bg-green-500 text-white hover:bg-green-600 transition-all"
          >
              + Add
          </button>
        </button>

        {/* Weight Card */}
        <button
          onClick={() => setStatsView('weight')}
          className={`w-full rounded-xl p-4 flex items-center gap-4 transition-all active:scale-95 ${currentTheme.cardBg}`}
          style={{ backgroundColor: currentTheme.rawCardBg }}
        >
          <div className="text-3xl">⚖️</div>
          <div className="flex-1 text-left">
            <div className={`text-sm ${currentTheme.text}`}>Body Weight</div>
            <div className={`font-semibold ${currentTheme.text}`}>{latestWeight ? `${latestWeight} lbs` : 'No entries'} · {weightEntries.length} entries</div>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              openUIModal('weightModal');
            }}
            className="px-4 py-1.5 rounded-lg text-sm font-semibold bg-blue-500 text-white hover:bg-blue-600 transition-all"
          >
              + Add
          </button>
        </button>

        {/* Exercise Stats Card */}
        <button
          onClick={() => setStatsView('exercises')}
          className={`w-full rounded-xl p-4 flex items-center gap-4 transition-all active:scale-95 ${currentTheme.cardBg}`}
          style={{ backgroundColor: currentTheme.rawCardBg }}
        >
          <div className="text-3xl">📊</div>
          <div className="flex-1 text-left">
            <div className={`text-sm ${currentTheme.text}`}>Exercise Stats</div>
            <div className={`font-semibold ${currentTheme.text}`}>{uniqueExercises.size} exercises tracked</div>
          </div>
          <ChevronRight className={currentTheme.text} size={24} />
        </button>
      </div>
    </div>
  );
}
