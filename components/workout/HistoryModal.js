'use client';

import { useWorkoutStore } from '../../stores/workoutStore';
import { useUIStore } from '../../stores/uiStore';
import { usePresetStore } from '../../stores/presetStore';
import { useThemeStore } from '../../stores/themeStore';
import { getPresetColor } from '../../lib/constants';
import BottomSheet from '../modals/BottomSheet';

export default function HistoryModal() {
  const { getCurrentTheme } = useThemeStore();
  const currentTheme = getCurrentTheme();

  const { workouts } = useWorkoutStore();
  const { showHistoryModal } = useUIStore();

  const closeModal = () => {
    useUIStore.setState({ showHistoryModal: false });
  };

  const { presets } = usePresetStore();

  // Sort workouts newest first and take last 20
  const sortedWorkouts = [...workouts].reverse().slice(0, 20);

  return (
    <BottomSheet
      isOpen={showHistoryModal}
      onClose={closeModal}
      title="Recent Workouts"
    >
      <div className="space-y-4 pb-4">
        {sortedWorkouts.length === 0 ? (
          <p className="text-center opacity-60 py-8">No workouts yet</p>
        ) : (
          sortedWorkouts.map((workout, idx) => {
            const presetColor = getPresetColor(workout.location, presets);

            return (
              <div
                key={idx}
                className="border-l-4 pl-4 py-3 space-y-2"
                style={{ borderColor: presetColor?.text || '#666' }}
              >
                {/* Date & Location */}
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-bold text-sm">{workout.date}</h3>
                  {workout.location && (
                    <span className="text-xs font-medium px-2 py-1 rounded-full">
                      {workout.location}
                    </span>
                  )}
                </div>

                {/* Exercise Summary */}
                {workout.exercises && workout.exercises.length > 0 && (
                  <div className="text-xs space-y-1">
                    <div className="opacity-70">
                      {workout.exercises.length} exercise{workout.exercises.length !== 1 ? 's' : ''}
                    </div>
                    {workout.exercises.slice(0, 3).map((exercise, ei) => (
                      <div key={ei} className="opacity-60">
                        {exercise.name}: {exercise.sets.reduce((acc, set) => {
                          const reps = parseInt(set.reps) || 0;
                          return acc + reps;
                        }, 0)} total reps
                      </div>
                    ))}
                    {workout.exercises.length > 3 && (
                      <div className="opacity-50">
                        +{workout.exercises.length - 3} more
                      </div>
                    )}
                  </div>
                )}

                {/* Duration */}
                {workout.elapsedTime && (
                  <div className="text-xs opacity-60">
                    Duration: {formatDuration(workout.elapsedTime)}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </BottomSheet>
  );
}

function formatDuration(ms) {
  if (!ms) return '0:00';
  const totalSeconds = Math.floor(ms / 1000);
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${mins}:${String(secs).padStart(2, '0')}`;
}
