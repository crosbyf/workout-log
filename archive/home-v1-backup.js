 {/* HOME V1 - Original layout (toggle in settings) */}
          {view === 'homev1' && showHomeV1 && (
            <div className="space-y-2.5 pb-32">
              {/* No controls at top - cleaner! */}
              
              {showLogCalendar && (
                <div key={JSON.stringify(presets.map(p => ({n: p.name, c: p.color})))} className={`mb-2 ${darkMode ? 'bg-gradient-to-br from-gray-800 to-gray-900' : 'bg-gradient-to-br from-white to-gray-50 border border-gray-200'} rounded-2xl shadow-lg overflow-hidden`}>
                    {/* Month/Year header - more compressed */}
                    <div className={`sticky top-0 ${darkMode ? 'bg-gray-800/95 border-gray-700' : 'bg-white/95 border-gray-200'} backdrop-blur-sm border-b px-2 py-1.5 z-[5]`}>
                      <div className="flex items-center justify-between gap-1">
                        {/* Info button for legend */}
                        <button
                          onClick={() => setShowCalendarLegend(true)}
                          className={`${darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'} p-0.5 rounded-lg ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'} transition-colors flex-shrink-0`}
                          title="Calendar legend"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </button>
                        
                        {/* Month navigation - centered and compressed */}
                        <div className="flex items-center gap-1 flex-1 justify-center">
                          <button
                            onClick={() => {
                              const newDate = new Date(logCalendarDate);
                              newDate.setMonth(newDate.getMonth() - 1);
                              setLogCalendarDate(newDate);
                            }}
                            className={`${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'} p-0.5 rounded transition-colors flex-shrink-0`}
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                          </button>
                          
                          <div className="text-center min-w-[120px]">
                            <div className="font-bold text-xs">
                              {logCalendarDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                            </div>
                            {(() => {
                              const now = new Date();
                              const isCurrentMonth = logCalendarDate.getMonth() === now.getMonth() && 
                                                    logCalendarDate.getFullYear() === now.getFullYear();
                              if (!isCurrentMonth) {
                                return (
                                  <button
                                    onClick={() => setLogCalendarDate(new Date())}
                                    className="bg-blue-600 hover:bg-blue-700 px-1 py-0.5 rounded text-[9px] font-medium whitespace-nowrap"
                                  >
                                    Today
                                  </button>
                                );
                              }
                            })()}
                          </div>
                          
                          <button
                            onClick={() => {
                              const newDate = new Date(logCalendarDate);
                              newDate.setMonth(newDate.getMonth() + 1);
                              setLogCalendarDate(newDate);
                            }}
                            className={`${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'} p-0.5 rounded transition-colors flex-shrink-0`}
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </button>
                        </div>
                        
                        {/* Collapse button */}
                        <button
                          onClick={() => setShowLogCalendar(false)}
                          className={`${darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'} p-0.5 rounded-lg ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'} transition-colors flex-shrink-0`}
                          title="Hide calendar"
                        >
                          <div className="transform rotate-180">
                            <Icons.ChevronDown className="w-3.5 h-3.5" />
                          </div>
                        </button>
                      </div>
                    </div>
                    
                    {/* Scrollable calendar content - expand slightly */}
                    <div className="p-1.5 max-h-[200px] overflow-y-auto">
                      {/* Day headers - smaller */}
                      <div className="grid grid-cols-7 gap-0.5 mb-0.5">
                        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                          <div key={day} className={`text-center text-[9px] ${darkMode ? 'text-gray-500' : 'text-gray-600'} font-bold uppercase tracking-wide py-0.5`}>
                            {day}
                          </div>
                        ))}
                      </div>

                      {/* Calendar days */}
                      <div className="grid grid-cols-7 gap-0.5">
                      {(() => {
                        const now = new Date();
                        const year = logCalendarDate.getFullYear();
                        const month = logCalendarDate.getMonth();
                        let firstDay = new Date(year, month, 1).getDay();
                        firstDay = firstDay === 0 ? 6 : firstDay - 1;
                        const daysInMonth = new Date(year, month + 1, 0).getDate();
                        const days = [];

                        // Empty cells
                        for (let i = 0; i < firstDay; i++) {
                          days.push(<div key={`empty-${i}`} className="h-8" />);
                        }

                        // Days
                        for (let day = 1; day <= daysInMonth; day++) {
                          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                          const dayWorkouts = workouts.filter(w => w.date === dateStr);
                          const hasWorkout = dayWorkouts.length > 0;
                          
                          let borderColor = 'border-gray-600';
                          if (hasWorkout) {
                            const color = getPresetColor(dayWorkouts[0].location);
                            borderColor = color.border;
                          }

                          // Only highlight today if we're viewing the current month
                          const isToday = day === now.getDate() && 
                                         month === now.getMonth() && 
                                         year === now.getFullYear();

                          days.push(
                            <button
                              key={day}
                              onClick={() => {
                                if (hasWorkout) {
                                  // Set selected day and scroll to workout
                                  setSelectedLogDay(dateStr);
                                  
                                  // Find and expand the workout
                                  const workoutIndex = filtered().findIndex(w => w.date === dateStr);
                                  if (workoutIndex >= 0) {
                                    const newExpanded = new Set(expandedLog);
                                    newExpanded.add(workoutIndex);
                                    setExpandedLog(newExpanded);
                                    
                                    // Scroll to workout after expansion
                                    setTimeout(() => {
                                      const element = document.querySelector(`[data-workout-date="${dateStr}"]`);
                                      if (element) {
                                        const rect = element.getBoundingClientRect();
                                        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
                                        const targetY = rect.top + scrollTop - 80;
                                        window.scrollTo({ top: targetY, behavior: 'smooth' });
                                      }
                                    }, 300);
                                  }
                                }
                              }}
                              className={`h-8 w-full rounded border flex items-center justify-center text-xs
                                ${hasWorkout ? `${borderColor} ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} font-bold` : darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-300 bg-white'}
                                ${isToday ? 'ring-2 ring-blue-400' : ''}
                                ${selectedLogDay === dateStr ? 'ring-2 ring-white' : ''}
                                ${hasWorkout ? darkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-200' : ''}
                                transition-colors
                              `}
                            >
                              {day}
                            </button>
                          );
                        }

                        return days;
                      })()}
                    </div>
                    {/* Close scrollable container */}
                  </div>
                  {/* Close outer container */}
                </div>
              )}
              
              {/* Control buttons below calendar - improved */}
              <div className="flex items-center gap-2 mb-3">
                {/* Search - icon only, expands on tap */}
                {!searchExpanded ? (
                  <button
                    onClick={() => {
                      setSearchExpanded(true);
                      // Force scroll to absolute top
                      setTimeout(() => {
                        document.documentElement.scrollTop = 0;
                        document.body.scrollTop = 0;
                      }, 50);
                    }}
                    className={`${darkMode ? 'bg-gray-800 hover:bg-gray-700 border-gray-700' : 'bg-white hover:bg-gray-50 border-gray-200'} border p-2 rounded-xl transition-colors shadow-sm`}
                    title="Search workouts"
                  >
                    <Icons.Search className="w-4 h-4" />
                  </button>
                ) : (
                  <div className="relative flex-1">
                    <input
                      ref={(el) => el && el.focus()}
                      type="text"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search workouts..."
                      className={`w-full ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-xl px-3 py-2 pl-9 text-sm shadow-sm`}
                      onBlur={() => {
                        if (!search) setSearchExpanded(false);
                      }}
                    />
                    <div className={`absolute left-3 top-2.5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      <Icons.Search className="w-4 h-4" />
                    </div>
                    {search && (
                      <button
                        onClick={() => {
                          setSearch('');
                          setSearchExpanded(false);
                        }}
                        className={`absolute right-2 top-2 ${darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'} p-0.5`}
                      >
                        <Icons.X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                )}
                
                {/* Expand/Collapse All - clearer vertical arrows */}
                {!searchExpanded && (
                  <button
                    onClick={() => {
                      const allIndices = filtered().map((_, i) => i);
                      if (expandedLog.size === allIndices.length) {
                        setExpandedLog(new Set());
                      } else {
                        setExpandedLog(new Set(allIndices));
                      }
                    }}
                    className={`${darkMode ? 'bg-gray-800 hover:bg-gray-700 border-gray-700' : 'bg-white hover:bg-gray-50 border-gray-200'} border p-2 rounded-xl transition-colors shadow-sm`}
                    title={expandedLog.size === filtered().length ? 'Collapse all workouts' : 'Expand all workouts'}
                  >
                    {expandedLog.size === filtered().length ? (
                      // Collapse: arrows pointing at each other vertically
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m10 12V8m0 0l-4 4m4-4l4 4" />
                      </svg>
                    ) : (
                      // Expand: arrows pointing away from each other vertically
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v12m0 0l-4-4m4 4l4-4m10 4V8m0 0l-4 4m4-4l4 4" />
                      </svg>
                    )}
                  </button>
                )}
                
                {/* Filter dropdown - compact labels */}
                {!searchExpanded && (
                  <select
                    value={historyFilter}
                    onChange={(e) => setHistoryFilter(e.target.value)}
                    className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-xl pl-2 pr-5 py-2 text-xs font-medium cursor-pointer transition-colors shadow-sm min-w-0`}
                  >
                    <option value="all">All</option>
                    <option value="day">Today</option>
                    <option value="week">Week</option>
                    <option value="month">Month</option>
                    <option value="year">Year</option>
                  </select>
                )}
                
                {/* Toggle calendar button - condensed when collapsed */}
                {!showLogCalendar && !searchExpanded && (
                  <button
                    onClick={() => setShowLogCalendar(true)}
                    className={`${darkMode ? 'bg-gray-800 hover:bg-gray-700 border-gray-700' : 'bg-white hover:bg-gray-50 border-gray-200'} border px-2 py-2 rounded-xl transition-colors flex items-center gap-1.5 shadow-sm`}
                    title="Show calendar"
                  >
                    <Icons.Calendar className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Workout List with Week Dividers */}
              {(() => {
                const workoutList = filtered();
                const now = new Date();
                
                // Function to get week start (Monday) for a date
                const getWeekStart = (date) => {
                  const d = new Date(date);
                  const day = d.getDay();
                  const diff = day === 0 ? -6 : 1 - day; // If Sunday, go back 6 days; else go back to Monday
                  const weekStart = new Date(d);
                  weekStart.setDate(d.getDate() + diff);
                  weekStart.setHours(0, 0, 0, 0);
                  return weekStart;
                };
                
                // Function to format week label
                const getWeekLabel = (weekStart) => {
                  const weekEnd = new Date(weekStart);
                  weekEnd.setDate(weekStart.getDate() + 6);
                  
                  const currentWeekStart = getWeekStart(now);
                  const lastWeekStart = new Date(currentWeekStart);
                  lastWeekStart.setDate(currentWeekStart.getDate() - 7);
                  
                  const weekStartTime = weekStart.getTime();
                  
                  // This Week
                  if (weekStartTime === currentWeekStart.getTime()) {
                    return 'This Week';
                  }
                  
                  // Last Week
                  if (weekStartTime === lastWeekStart.getTime()) {
                    return 'Last Week';
                  }
                  
                  // Older weeks - show date range with year
                  const startMonth = weekStart.toLocaleDateString('en-US', { month: 'short' });
                  const startDay = weekStart.getDate();
                  const endMonth = weekEnd.toLocaleDateString('en-US', { month: 'short' });
                  const endDay = weekEnd.getDate();
                  const year = weekStart.getFullYear();
                  
                  if (startMonth === endMonth) {
                    return `${startMonth} ${startDay} - ${endDay}, ${year}`;
                  } else {
                    return `${startMonth} ${startDay} - ${endMonth} ${endDay}, ${year}`;
                  }
                };
                
                // Group workouts by week
                const workoutsByWeek = {};
                workoutList.forEach((w, i) => {
                  const [year, month, day] = w.date.split('-');
                  const workoutDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
                  const weekStart = getWeekStart(workoutDate);
                  const weekKey = weekStart.toISOString().split('T')[0];
                  
                  if (!workoutsByWeek[weekKey]) {
                    workoutsByWeek[weekKey] = {
                      weekStart,
                      label: getWeekLabel(weekStart),
                      workouts: []
                    };
                  }
                  
                  workoutsByWeek[weekKey].workouts.push({ workout: w, index: i });
                });
                
                // Sort weeks (newest first)
                const sortedWeeks = Object.entries(workoutsByWeek).sort((a, b) => {
                  return new Date(b[0]).getTime() - new Date(a[0]).getTime();
                });
                
                return sortedWeeks.map(([weekKey, { label, workouts }]) => (
                  <div key={weekKey} className="mb-4">
                    {/* Week Header - Transparent and subtle */}
                    <div className="sticky top-[72px] backdrop-blur-sm border-b border-gray-500/20 z-[4] py-2 px-3 -mx-3">
                      <h3 className={`text-xs font-bold uppercase tracking-wider ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                        {label}
                      </h3>
                    </div>
                    
                    {/* Workouts for this week */}
                    <div className="space-y-2 mt-2">
                      {workouts.map(({ workout: w, index: i }) => {
                        // Parse date without timezone issues
                        const [year, month, day] = w.date.split('-');
                        const dateObj = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
                        const dayOfWeek = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
                        const isExpanded = expandedLog.has(i);
                        
                        // Color-code by workout location
                        const color = getPresetColor(w.location);
                        const borderColor = color.border;
                        
                        return (
                  <div key={i} data-workout-date={w.date} className={`${darkMode ? 'bg-gray-800' : 'bg-white border-t border-r border-b border-gray-200'} rounded-xl border-l-[6px] ${borderColor} shadow-md hover:shadow-lg transition-shadow overflow-hidden`}>
                    <button
                      onClick={(e) => {
                        const newExpanded = new Set(expandedLog);
                        if (newExpanded.has(i)) {
                          newExpanded.delete(i);
                        } else {
                          const element = e.currentTarget.closest('[data-workout-date]');
                          newExpanded.add(i);
                          setExpandedLog(newExpanded);
                          
                          // Scroll this workout to top when expanding
                          requestAnimationFrame(() => {
                            requestAnimationFrame(() => {
                              setTimeout(() => {
                                if (element) {
                                  const rect = element.getBoundingClientRect();
                                  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
                                  const targetY = rect.top + scrollTop - 120;
                                  window.scrollTo({ top: targetY, behavior: 'smooth' });
                                }
                              }, 100);
                            });
                          });
                          return;
                        }
                        setExpandedLog(newExpanded);
                      }}
                      className={`w-full p-3 text-left transition-colors ${darkMode ? 'hover:bg-white/5' : 'hover:bg-gray-50'}`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-bold text-base">
                            {dayOfWeek} {month}/{day}/{year.slice(2)}
                            {w.location && <span className="ml-2 text-sm font-medium">· {w.location}</span>}
                          </div>
                          <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} mt-0.5`}>
                            {w.exercises.length} exercise{w.exercises.length !== 1 ? 's' : ''}
                            {w.structure && (
                              <span className="font-semibold">
                                {' • '}
                                {w.structure === 'pairs' ? `Pairs ${w.structureDuration}'` : 'Circuit'}
                              </span>
                            )}
                            {w.elapsedTime && ` • ${formatTimeHHMMSS(w.elapsedTime)}`}
                            {(() => {
                              const dayProtein = proteinEntries
                                .filter(e => e.date === w.date)
                                .reduce((sum, e) => sum + e.grams, 0);
                              return dayProtein > 0 ? ` • ${dayProtein}g` : '';
                            })()}
                          </div>
                        </div>
                        <div className={`transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                          <Icons.ChevronDown />
                        </div>
                      </div>
                    </button>
                    
                    {isExpanded && (
                      <div className={`px-3 pb-3 space-y-2 ${darkMode ? 'border-gray-700' : 'border-gray-200'} border-t pt-2`}>
                        {/* Action Buttons */}
                                    <div className="flex gap-3 mb-2">
                                      <button
                                        onClick={() => copyToSheets(w)}
                                        className="text-blue-400 hover:text-blue-300 p-1 text-xs flex items-center gap-1"
                                        title="Copy to clipboard"
                                      >
                                        <Icons.Copy className="w-4 h-4" />
                                        Copy
                                      </button>
                                      <button
                                        onClick={() => shareWorkout(w)}
                                        className="text-purple-400 hover:text-purple-300 p-1 text-xs flex items-center gap-1"
                                        title="Share workout"
                                      >
                                        <Icons.Share className="w-4 h-4" />
                                        Share
                                      </button>
                                      <button
                                        onClick={() => editWorkout(i)}
                                        className="text-green-400 hover:text-green-300 p-1 text-xs flex items-center gap-1"
                                      >
                                        <Icons.Edit className="w-4 h-4" />
                                        Edit
                                      </button>
                                      <button
                                        onClick={() => setDeleteWorkout(i)}
                                        className="text-red-400 hover:text-red-300 p-1 text-xs flex items-center gap-1"
                                      >
                                        <Icons.Trash className="w-4 h-4" />
                                        Delete
                                      </button>
                                    </div>
                    
                    {w.location === 'Day Off' && w.notes ? (
                      <div className={`${darkMode ? 'bg-yellow-900/20 border-yellow-700/50' : 'bg-yellow-50 border-yellow-300'} border rounded-lg p-3`}>
                        <div className="text-sm font-semibold text-yellow-600 mb-2">Rest Day</div>
                        <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{w.notes}</div>
                      </div>
                    ) : (
                      <>
                    <div className="space-y-1">
                      {w.exercises.map((ex, ei) => {
                        const totalReps = ex.sets.reduce((sum, s) => sum + (s.reps || 0), 0);
                        return (
                          <div key={ei} className={`${darkMode ? 'bg-gray-700/50' : 'bg-gray-100'} rounded px-2 py-1.5`}>
                            <div className="grid grid-cols-[120px_1fr_50px] gap-2 items-start text-xs">
                              <div className="font-medium truncate">{ex.name}</div>
                              <div className="flex items-center gap-1 flex-wrap">
                                {ex.sets.map((s, si) => (
                                  <span 
                                    key={si} 
                                    className={`${
                                      darkMode 
                                        ? 'bg-gray-800 text-blue-300 border border-gray-600' 
                                        : 'bg-white text-gray-900 border border-gray-400'
                                    } px-1.5 py-0.5 rounded font-mono text-xs font-semibold shadow-sm whitespace-nowrap`}
                                  >
                                    {s.reps}
                                  </span>
                                ))}
                              </div>
                              <div className={`text-right font-bold text-xs ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                                ({totalReps})
                              </div>
                            </div>
                            {ex.notes && (
                              <div className={`text-[10px] ${darkMode ? 'text-gray-400' : 'text-gray-600'} mt-1 text-right`}>{ex.notes}</div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    
                    {w.notes && w.location !== 'Day Off' && (
                      <div className="mt-2 text-xs text-gray-400 border-t border-gray-700 pt-1.5">{w.notes}</div>
                    )}
                      </>
                    )}
                        
                        {/* Collapse button at bottom */}
                        <button
                          onClick={() => {
                            const newExpanded = new Set(expandedLog);
                            newExpanded.delete(i);
                            setExpandedLog(newExpanded);
                          }}
                          className={`w-full mt-3 ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'} py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2`}
                        >
                          <Icons.ChevronDown />
                          Collapse
                        </button>
                      </div>
                    )}
                  </div>
                );
                      })}
                    </div>
                  </div>
                ));
              })()}

              {filtered().length === 0 && (
                <div className="text-center text-gray-500 py-8">
                  {search ? 'No workouts found' : 'No workouts yet'}
                </div>
              )}
            </div>
          )}
