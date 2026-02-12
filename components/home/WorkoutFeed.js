import { useUIStore } from '../../stores/uiStore';
import { useThemeStore } from '../../stores/themeStore';
import { getWeekKey, getWeekLabel } from '../../lib/formatting';
import WorkoutCard from './WorkoutCard';

export default function WorkoutFeed({ workouts }) {
  const { search } = useUIStore();
  const { getCurrentTheme } = useThemeStore();
  const currentTheme = getCurrentTheme();

  // Filter workouts by search query
  const filteredWorkouts = workouts.filter((workout) => {
    const query = search.toLowerCase();
    if (!query) return true;

    // Search by date
    if (workout.date.includes(query)) return true;

    // Search by location
    if (workout.location && workout.location.toLowerCase().includes(query)) return true;

    // Search by exercise names
    if (
      workout.exercises &&
      workout.exercises.some((ex) =>
        ex.name.toLowerCase().includes(query)
      )
    ) {
      return true;
    }

    // Search by notes
    if (workout.notes && workout.notes.toLowerCase().includes(query)) return true;

    return false;
  });

  // Group workouts by week
  const grouped = {};
  filteredWorkouts.forEach((workout) => {
    const weekKey = getWeekKey(workout.date);
    if (!grouped[weekKey]) {
      grouped[weekKey] = [];
    }
    grouped[weekKey].push(workout);
  });

  // Sort weeks newest first
  const sortedWeeks = Object.keys(grouped).sort((a, b) => {
    return new Date(b) - new Date(a);
  });

  // Empty state
  if (filteredWorkouts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4">
        <p className="text-gray-500 text-center">
          {search ? 'No workouts found' : 'No workouts yet'}
        </p>
      </div>
    );
  }

  return (
    <div className="px-4 space-y-6">
      {sortedWeeks.map((weekKey) => (
        <div key={weekKey}>
          {/* Week Header */}
          <div id={`week-${weekKey}`} className="mb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider opacity-60">
              {getWeekLabel(weekKey)}
            </h3>
          </div>

          {/* Week's Workouts */}
          <div className="space-y-2">
            {grouped[weekKey].map((workout, idx) => (
              <WorkoutCard
                key={`${weekKey}-${idx}`}
                workout={workout}
                onClick={() => {
                  const { setSelectedDay, setShowDayModal } = useUIStore.getState();
                  setSelectedDay(workout);
                  setShowDayModal(true);
                }}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
