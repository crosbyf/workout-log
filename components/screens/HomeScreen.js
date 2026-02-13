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
    <div className="min-h-screen pt-16 pb-24" style={{ backgroundColor: currentTheme.rawBg }}>
      {/* Search Bar - shown only when expanded */}
      {searchExpanded && <SearchBar />}

      {/* Weekly Calendar - sticky below header */}
      <WeeklyCalendar />

      {/* Main Content Area */}
      <div className="px-4 pt-4">
        <WorkoutFeed />
      </div>
    </div>
  );
}
