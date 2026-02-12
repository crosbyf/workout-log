import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useWorkoutStore } from '../../stores/workoutStore';
import { useUIStore } from '../../stores/uiStore';
import { useThemeStore } from '../../stores/themeStore';
import { usePresetStore } from '../../stores/presetStore';
import { getTodayDate, getWeekKey, getWeekLabel } from '../../lib/formatting';
import { getPresetColor } from '../../lib/constants';

export default function WeeklyCalendar() {
  const { workouts } = useWorkoutStore();
  const { weekOffset, setWeekOffset, setSelectedDay, setShowDayModal } = useUIStore();
  const { getCurrentTheme } = useThemeStore();
  const { presets } = usePresetStore();
  const currentTheme = getCurrentTheme();

  // Calculate the Monday of the target week
  const today = getTodayDate();
  const todayWeekMonday = getWeekKey(today);

  // Calculate target week's Monday
  const targetDate = new Date(todayWeekMonday);
  targetDate.setDate(targetDate.getDate() + weekOffset * 7);
  const targetYear = targetDate.getFullYear();
  const targetMonth = String(targetDate.getMonth() + 1).padStart(2, '0');
  const targetDay = String(targetDate.getDate()).padStart(2, '0');
  const targetWeekMonday = `${targetYear}-${targetMonth}-${targetDay}`;

  // Get days of the week
  const getDaysOfWeek = () => {
    const days = [];
    const startDate = new Date(targetWeekMonday);
    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;
      days.push({
        dateStr,
        date,
        dayOfWeek: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i],
      });
    }
    return days;
  };

  const days = getDaysOfWeek();

  // Get workouts by date
  const workoutsByDate = {};
  workouts.forEach((workout) => {
    if (!workoutsByDate[workout.date]) {
      workoutsByDate[workout.date] = [];
    }
    workoutsByDate[workout.date].push(workout);
  });

  const handleDayClick = (dateStr) => {
    const dayWorkouts = workoutsByDate[dateStr];
    if (dayWorkouts && dayWorkouts.length > 0) {
      // Open modal for the first workout of that day (or most recent)
      setSelectedDay(dayWorkouts[0]);
      setShowDayModal(true);
    }
  };

  return (
    <div
      className={`sticky top-12 z-10 px-4 py-4 border-b`}
      style={{
        backgroundColor: currentTheme.rawCardBg,
        borderColor: currentTheme.rawCardBorder
      }}
    >
      {/* Week Label and Navigation */}
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={() => setWeekOffset(weekOffset - 1)}
          className="p-1 hover:bg-white hover:bg-opacity-10 rounded transition-all"
          aria-label="Previous week"
        >
          <ChevronLeft size={20} />
        </button>
        <span className="text-sm font-semibold uppercase tracking-wider">
          {getWeekLabel(targetWeekMonday)}
        </span>
        <button
          onClick={() => setWeekOffset(weekOffset + 1)}
          className="p-1 hover:bg-white hover:bg-opacity-10 rounded transition-all"
          aria-label="Next week"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Day Pills */}
      <div className="flex justify-between gap-1">
        {days.map((day) => {
          const hasWorkout = workoutsByDate[day.dateStr];
          const isToday = day.dateStr === today;
          const dayNum = day.date.getDate();

          // Get color from first workout's location/preset
          let colorClass = '';
          if (hasWorkout && hasWorkout[0]) {
            const color = getPresetColor(hasWorkout[0].location, presets);
            colorClass = color.text;
          }

          return (
            <button
              key={day.dateStr}
              onClick={() => handleDayClick(day.dateStr)}
              className={`flex-1 py-2 rounded text-center transition-all cursor-pointer ${
                isToday ? 'ring-2 ring-blue-500' : ''
              } ${hasWorkout ? 'opacity-100' : 'opacity-60'}`}
              style={{
                backgroundColor: currentTheme.rawInputBg,
              }}
            >
              <div className="text-xs font-semibold opacity-75">
                {day.dayOfWeek}
              </div>
              <div className="text-sm font-bold mt-1">
                {dayNum}
              </div>
              {hasWorkout && colorClass && (
                <div
                  className={`w-1.5 h-1.5 rounded-full mx-auto mt-1 ${colorClass}`}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
