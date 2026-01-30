// components/Calendar.js
// Calendar component for the Home screen

import React from 'react';
import { Icons } from './Icons.js';

export const Calendar = ({
  calendarDate,
  setCalendarDate,
  workouts,
  selectedDay,
  setSelectedDay,
  onDayClick,
  onClose,
  darkMode,
  getPresetColor
}) => {
  const now = new Date();
  const year = calendarDate.getFullYear();
  const month = calendarDate.getMonth();
  
  // Get first day of month (adjusted for Monday start)
  let firstDay = new Date(year, month, 1).getDay();
  firstDay = firstDay === 0 ? 6 : firstDay - 1;
  
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const goToPrevMonth = () => {
    const newDate = new Date(calendarDate);
    newDate.setMonth(newDate.getMonth() - 1);
    setCalendarDate(newDate);
  };

  const goToNextMonth = () => {
    const newDate = new Date(calendarDate);
    newDate.setMonth(newDate.getMonth() + 1);
    setCalendarDate(newDate);
  };

  const goToToday = () => {
    setCalendarDate(new Date());
  };

  const isCurrentMonth = month === now.getMonth() && year === now.getFullYear();

  return (
    <div className={`mb-2 ${darkMode ? 'bg-gradient-to-br from-gray-800 to-gray-900' : 'bg-gradient-to-br from-white to-gray-50 border border-gray-200'} rounded-2xl shadow-lg overflow-hidden`}>
      {/* Header */}
      <div className={`sticky top-0 ${darkMode ? 'bg-gray-800/95 border-gray-700' : 'bg-white/95 border-gray-200'} backdrop-blur-sm border-b px-2 py-1.5 z-[5]`}>
        <div className="flex items-center justify-between gap-1">
          {/* Info button */}
          <button
            className={`${darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'} p-0.5 rounded-lg ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'} transition-colors flex-shrink-0`}
            title="Calendar legend"
          >
            <Icons.Info className="w-3.5 h-3.5" />
          </button>
          
          {/* Month navigation */}
          <div className="flex items-center gap-1 flex-1 justify-center">
            <button
              onClick={goToPrevMonth}
              className={`${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'} p-0.5 rounded transition-colors flex-shrink-0`}
            >
              <Icons.ChevronLeft className="w-3.5 h-3.5" />
            </button>
            
            <div className="text-center min-w-[120px]">
              <div className="font-bold text-xs">
                {calendarDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </div>
              {!isCurrentMonth && (
                <button
                  onClick={goToToday}
                  className="bg-blue-600 hover:bg-blue-700 px-1 py-0.5 rounded text-[9px] font-medium whitespace-nowrap text-white"
                >
                  Today
                </button>
              )}
            </div>
            
            <button
              onClick={goToNextMonth}
              className={`${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'} p-0.5 rounded transition-colors flex-shrink-0`}
            >
              <Icons.ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
          
          {/* Collapse button */}
          {onClose && (
            <button
              onClick={onClose}
              className={`${darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'} p-0.5 rounded-lg ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'} transition-colors flex-shrink-0`}
              title="Hide calendar"
            >
              <div className="transform rotate-180">
                <Icons.ChevronDown className="w-3.5 h-3.5" />
              </div>
            </button>
          )}
        </div>
      </div>
      
      {/* Calendar grid */}
      <div className="p-1.5 max-h-[200px] overflow-y-auto">
        {/* Day headers */}
        <div className="grid grid-cols-7 gap-0.5 mb-0.5">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
            <div key={day} className={`text-center text-[9px] ${darkMode ? 'text-gray-500' : 'text-gray-600'} font-bold uppercase tracking-wide py-0.5`}>
              {day}
            </div>
          ))}
        </div>

        {/* Days */}
        <div className="grid grid-cols-7 gap-0.5">
          {/* Empty cells before first day */}
          {Array(firstDay).fill(null).map((_, i) => (
            <div key={`empty-${i}`} className="h-8" />
          ))}
          
          {/* Day cells */}
          {Array(daysInMonth).fill(null).map((_, i) => {
            const day = i + 1;
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const dayWorkouts = workouts.filter(w => w.date === dateStr);
            const hasWorkout = dayWorkouts.length > 0;
            
            let borderColor = 'border-gray-600';
            if (hasWorkout && getPresetColor) {
              const color = getPresetColor(dayWorkouts[0].location);
              borderColor = color.border;
            }

            const isToday = day === now.getDate() && 
                           month === now.getMonth() && 
                           year === now.getFullYear();

            return (
              <button
                key={day}
                onClick={() => onDayClick && onDayClick(dateStr, hasWorkout)}
                className={`h-8 w-full rounded border flex items-center justify-center text-xs
                  ${hasWorkout ? `${borderColor} ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} font-bold` : darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-300 bg-white'}
                  ${isToday ? 'ring-2 ring-blue-400' : ''}
                  ${selectedDay === dateStr ? 'ring-2 ring-white' : ''}
                  ${hasWorkout ? darkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-200' : ''}
                  transition-colors
                `}
              >
                {day}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
