'use client';

import { useWorkoutStore } from '../../stores/workoutStore';
import { useUIStore } from '../../stores/uiStore';
import { usePresetStore } from '../../stores/presetStore';
import { useThemeStore } from '../../stores/themeStore';
import BottomSheet from '../modals/BottomSheet';
import { getPresetColor } from '../../lib/constants';

export default function HistoryModal() {
  const { getCurrentTheme } = useThemeStore();
  const currentTheme = getCurrentTheme();

  const { workouts } = useWorkoutStore();
  const { showHistoryModal } = useUIStore();
  const { closeModal } = useUIStore((state) => ({
    closeModal: (name) => state.closeModal(name),
  }));

  const { presets } = usePresetStore();

  // Sort workouts newest first
  const sortedWorkouts = [...workouts].reverse();

  const handleClose = () => {
    closeModal('historyModal');
  };

  return (
    <BottomSheet
      isOpen={showHistoryModal}
      onClose={handleClose}
      title="Recent Workouts"
    >
      <div className="space-y-6 pb-4">
        {sortedWorkouts.length === 0 ? (
          <p className="text-center opacity-60 py-8">No workouts yet</p>
        ) : (
          sortedWorkouts.slice(0, 20).map((workout, idx) => {
            const presetColor = getPresetColor(workout.location, presets);
            return (
              <div key={idx} className={`border-l-4 pl-4 space-y-3`} style={{ borderColor: presetColor.text }}>
                {/* Date & Location */}
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-lg">{workout.date}</h3>
                  {workout.location && (
                    <span
                      className={`text-xs font-medium px-2 py-1 rounded-full ${presetColor.bg} ${presetColor.text}`}
                    >
                      {workout.location}
                    </span>
                  )}
                </div>

                {/* Exercises */}
                {workout.exercises && workout.exercises.length > 0 && (
                  <div className="space-y-2">
                    {workout.exercises.map((exercise, ei) => (
                      <div key={ei} className="text-sm">
                        <div className="font-medium mb-1">{exercise.name}</div>
                        <div className="flex gap-4 text-xs opacity-70">
                          <div>
                            Sets:{' '}
                            {exercise.sets.map((set, si) => (
                              <span key={si}>
                                {set.reps}
                                {si < exercise.sets.length - 1 ? ', ' : ''}
                              </span>
                            ))}
                          </div>
                          <div>
                            Total: {exercise.sets.reduce((acc, set) => {
                              const reps = parseInt(set.reps) || 0;
                              return acc + reps;
                            }, 0)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Duration & Notes */}
                {(workout.elapsedTime || workout.notes) && (
                  <div className="text-xs opacity-60 space-y-1">
                    {workout.elapsedTime && (
                      <div>Duration: {formatDuration(workout.elapsedTime)}</div>
                    )}
                    {workout.notes && (
                      <div>Notes: {workout.notes}</div>
                    )}
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
