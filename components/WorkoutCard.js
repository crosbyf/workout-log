// components/WorkoutCard.js
// Individual workout card component

import React from 'react';
import { Icons } from './Icons.js';
import { formatTimeHHMMSS, calculateTotalReps } from '../utils/helpers.js';

export const WorkoutCard = ({
  workout,
  index,
  isExpanded,
  onToggleExpand,
  onEdit,
  onDelete,
  onCopy,
  onShare,
  darkMode,
  getPresetColor,
  proteinEntries = []
}) => {
  const [year, month, day] = workout.date.split('-');
  const dateObj = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  const dayOfWeek = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
  
  const color = getPresetColor ? getPresetColor(workout.location) : { border: 'border-blue-400' };
  const borderColor = color.border;
  
  // Calculate day's protein
  const dayProtein = proteinEntries
    .filter(e => e.date === workout.date)
    .reduce((sum, e) => sum + e.grams, 0);

  return (
    <div 
      data-workout-date={workout.date} 
      className={`${darkMode ? 'bg-gray-800' : 'bg-white border-t border-r border-b border-gray-200'} rounded-r-xl border-l-[6px] ${borderColor} shadow-md hover:shadow-lg transition-shadow overflow-hidden`}
    >
      {/* Header - always visible */}
      <button
        onClick={onToggleExpand}
        className={`w-full p-3 text-left transition-colors ${darkMode ? 'hover:bg-white/5' : 'hover:bg-gray-50'}`}
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="font-bold text-base">
              {dayOfWeek} {month}/{day}/{year.slice(2)}
              {workout.location && <span className="ml-2 text-sm font-medium">· {workout.location}</span>}
            </div>
            <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} mt-0.5`}>
              {workout.exercises.length} exercise{workout.exercises.length !== 1 ? 's' : ''}
              {workout.structure && (
                <span className="font-semibold">
                  {' • '}
                  {workout.structure === 'pairs' ? `Pairs ${workout.structureDuration}'` : 'Circuit'}
                </span>
              )}
              {workout.elapsedTime && ` • ${formatTimeHHMMSS(workout.elapsedTime)}`}
              {dayProtein > 0 && ` • ${dayProtein}g`}
            </div>
          </div>
          <div className={`transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
            <Icons.ChevronDown />
          </div>
        </div>
      </button>
      
      {/* Expanded content */}
      {isExpanded && (
        <div className="px-3 pb-3 space-y-2">
          {workout.location === 'Day Off' && workout.notes ? (
            <div className={`${darkMode ? 'bg-yellow-900/20 border-yellow-700/50' : 'bg-yellow-50 border-yellow-300'} border rounded-lg p-3`}>
              <div className="text-sm font-semibold text-yellow-600 mb-2">Rest Day</div>
              <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{workout.notes}</div>
            </div>
          ) : (
            <>
              {/* Exercise list */}
              <div className="space-y-1">
                {workout.exercises.map((ex, ei) => {
                  const totalReps = calculateTotalReps(ex.sets);
                  return (
                    <div key={ei} className={`${darkMode ? 'bg-gray-700/50' : 'bg-gray-100'} rounded px-2 py-1.5`}>
                      <div className="grid grid-cols-[110px_1fr_40px] gap-2 items-start text-xs">
                        <div className="font-medium truncate">{ex.name}</div>
                        <div className="flex items-center gap-1 flex-wrap min-w-0">
                          {ex.sets.map((s, si) => (
                            <span 
                              key={si} 
                              className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} whitespace-nowrap`}
                            >
                              {s.reps}
                              {si < ex.sets.length - 1 && <span className={`${darkMode ? 'text-gray-600' : 'text-gray-400'} mx-0.5`}>·</span>}
                            </span>
                          ))}
                        </div>
                        <div className="font-bold text-right">{totalReps}</div>
                      </div>
                      {ex.notes && (
                        <div className={`text-[10px] ${darkMode ? 'text-gray-500' : 'text-gray-600'} mt-0.5 text-right`}>{ex.notes}</div>
                      )}
                    </div>
                  );
                })}
              </div>
              
              {/* Workout notes */}
              {workout.notes && (
                <div className={`${darkMode ? 'bg-blue-900/40 border-blue-500/30' : 'bg-blue-50 border-blue-300'} border rounded-lg p-2`}>
                  <div className={`text-xs font-semibold mb-1 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>Notes</div>
                  <div className={`text-xs ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>{workout.notes}</div>
                </div>
              )}
              
              {/* Action buttons */}
              <div className="flex items-center justify-around pt-2 border-t border-gray-600/30">
                <button
                  onClick={() => onCopy && onCopy(workout)}
                  className={`flex flex-col items-center gap-1 ${darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-800'} transition-colors`}
                >
                  <Icons.Copy className="w-5 h-5" />
                  <span className="text-[10px]">Copy</span>
                </button>
                <button
                  onClick={() => onShare && onShare(workout)}
                  className={`flex flex-col items-center gap-1 ${darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-800'} transition-colors`}
                >
                  <Icons.Share className="w-5 h-5" />
                  <span className="text-[10px]">Share</span>
                </button>
                <button
                  onClick={() => onEdit && onEdit(index)}
                  className={`flex flex-col items-center gap-1 ${darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-800'} transition-colors`}
                >
                  <Icons.Edit className="w-5 h-5" />
                  <span className="text-[10px]">Edit</span>
                </button>
                <button
                  onClick={() => onDelete && onDelete(index)}
                  className={`flex flex-col items-center gap-1 ${darkMode ? 'text-red-400 hover:text-red-300' : 'text-red-600 hover:text-red-700'} transition-colors`}
                >
                  <Icons.Trash className="w-5 h-5" />
                  <span className="text-[10px]">Delete</span>
                </button>
              </div>
              
              {/* Collapse button */}
              <button
                onClick={onToggleExpand}
                className={`w-full ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'} py-2 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1 mt-2`}
              >
                <div className="transform rotate-180">
                  <Icons.ChevronDown className="w-3 h-3" />
                </div>
                Collapse
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};
