import { useWorkoutStore } from '../../stores/workoutStore';
import { useUIStore } from '../../stores/uiStore';
import { useThemeStore } from '../../stores/themeStore';
import SearchBar from '../home/SearchBar';
import WeeklyCalendar from '../home/WeeklyCalendar';
import WorkoutFeed from '../home/WorkoutFeed';

export default function HomeScreen() {
  const { workouts } = useWorkoutStore();
  const { searchExpanded } = useUIStore();
  const { getCurrentTheme } = useThemeStore();
  const currentTheme = getCurrentTheme();

  return (
    <div className={`flex flex-col min-h-screen ${currentTheme.bg}`}>
      {/* Search Bar - shown only when expanded */}
      {searchExpanded && <SearchBar />}

      {/* Weekly Calendar - sticky below header */}
      <WeeklyCalendar />

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto pb-24">
        <div className="px-4">
          <WorkoutFeed />
        </div>
      </div>
    </div>
  );
}
