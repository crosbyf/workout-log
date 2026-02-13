import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useWorkoutStore } from '../../stores/workoutStore';
import { useUIStore } from '../../stores/uiStore';
import { useThemeStore } from '../../stores/themeStore';
import { usePresetStore } from '../../stores/presetStore';
import { getTodayDate, getWeekKey, getWeekLabel } from '../../lib/formatting';
import { getPresetColor } from '../../lib/constants';

export default function WeeklyCalendar() {
  const { workouts } = useWorkoutStore();
  const { weekOffset, setWeekOffset } = useUIStore();
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
      useUIStore.setState({ selectedDay: dayWorkouts[0], showDayModal: true });
    }
  };

  // Color map for hex values
  const getColorHex = (textClass) => {
    const colorMap = {
      'text-blue-400': '#60a5fa',
      'text-purple-400': '#c084fc',
      'text-green-400': '#4ade80',
      'text-yellow-400': '#facc15',
      'text-red-400': '#f87171',
      'text-pink-400': '#f472b6',
      'text-orange-400': '#fb923c',
      'text-cyan-400': '#22d3ee',
    };
    return colorMap[textClass] || '#60a5fa';
  };

  return (
    <div
      className="sticky z-10 px-4 py-3"
      style={{
        top: '4rem',
        backgroundColor: currentTheme.rawBg,
      }}
    >
      <div className="rounded-xl p-4" style={{ backgroundColor: currentTheme.rawCardBg }}>
        {/* Week Label and Navigation */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => setWeekOffset(weekOffset - 1)}
            className="p-1 transition-all"
            style={{ color: currentTheme.rawText }}
            aria-label="Previous week"
          >
            <ChevronLeft size={20} />
          </button>
          <span className="text-sm font-bold uppercase tracking-wider" style={{ color: currentTheme.rawText }}>
            {getWeekLabel(targetWeekMonday)}
          </span>
          <button
            onClick={() => setWeekOffset(weekOffset + 1)}
            className="p-1 transition-all"
            style={{ color: currentTheme.rawText }}
            aria-label="Next week"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Day Pills */}
        <div className="grid grid-cols-7 gap-2">
          {days.map((day) => {
            const hasWorkout = workoutsByDate[day.dateStr];
            const isToday = day.dateStr === today;
            const dayNum = day.date.getDate();

            // Get color from first workout's location/preset
            let colorHex = '';
            if (hasWorkout && hasWorkout[0]) {
              const color = getPresetColor(hasWorkout[0].location, presets);
              colorHex = getColorHex(color.text);
            }

            return (
              <button
                key={day.dateStr}
                onClick={() => handleDayClick(day.dateStr)}
                className="py-2 rounded-lg text-center transition-all cursor-pointer flex flex-col items-center"
                style={{
                  backgroundColor: currentTheme.rawInputBg,
                  border: isToday ? `2px solid ${colorHex || '#3b82f6'}` : 'none',
                  borderRadius: '0.5rem',
                }}
              >
                <div className="text-xs opacity-60" style={{ color: currentTheme.rawText }}>
                  {day.dayOfWeek}
                </div>
                <div className="text-lg font-semibold mt-1" style={{ color: currentTheme.rawText }}>
                  {dayNum}
                </div>
                {hasWorkout && colorHex && (
                  <div
                    className="w-1.5 h-1.5 rounded-full mt-1"
                    style={{ backgroundColor: colorHex }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
