# GORS LOG - Performance Refactoring Plan

## Current State
- **File size**: 3,734 lines in single `index.js`
- **Issues**: Hard to maintain, slow re-renders, difficult debugging
- **Goal**: Break into modular, performant components

---

## Proposed Structure

```
pages/
  index.js                    # Main app orchestrator (200 lines)
  
components/
  Icons.jsx                   # All SVG icons
  Header.jsx                  # App header with title
  Navigation.jsx              # Bottom navigation bar
  Toast.jsx                   # Toast notification component
  
  /home
    HomeView.jsx              # Home tab container
    MonthlyVolume.jsx         # Monthly volume widget
    RecentWorkouts.jsx        # Recent workouts list
    
  /log
    LogView.jsx               # Log tab container
    WorkoutCard.jsx           # Individual workout card
    CalendarWidget.jsx        # Calendar with workout indicators
    SearchBar.jsx             # Search/filter controls
    
  /stats
    StatsView.jsx             # Stats tab container
    StatsMenu.jsx             # Stats menu with cards
    ProgressCharts.jsx        # Volume & frequency charts
    ExerciseStats.jsx         # Exercise list & details
    BodyWeightTracking.jsx    # Weight tracking with chart
    
  /workout
    WorkoutModal.jsx          # Main workout modal
    WorkoutForm.jsx           # Workout input form
    ExerciseRow.jsx           # Single exercise row
    Timer.jsx                 # Workout timer component
    
  /settings
    SettingsView.jsx          # Settings tab container
    PresetManager.jsx         # Workout presets section
    DataManagement.jsx        # Import/export/backup
    
  /modals
    ConfirmDialog.jsx         # Reusable confirmation modal
    BackupsModal.jsx          # View/restore backups
    WeightEntryModal.jsx      # Add weight entry
    PresetSelectorModal.jsx   # Choose workout preset

hooks/
  useWorkouts.js              # Workout CRUD operations
  useStats.js                 # Statistics calculations
  useTimer.js                 # Workout timer logic
  useBackups.js               # Auto-backup system
  useStorage.js               # localStorage wrapper
  
utils/
  storage.js                  # localStorage helpers
  calculations.js             # Volume, stats calculations
  formatters.js               # Date, time formatting
  constants.js                # App constants
```

---

## Implementation Steps

### **Phase 1: Extract Utility Functions** (30 min)
Move pure functions to utils:
- `formatTime()`, `formatTimeHHMMSS()`
- `getTodayDate()`
- `save()` wrapper
- Export/import CSV logic

**Benefits**: Easier to test, reusable

---

### **Phase 2: Extract Custom Hooks** (1 hour)

#### **useStorage Hook**
```javascript
// hooks/useStorage.js
export const useStorage = (key, initialValue) => {
  const [value, setValue] = useState(() => {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : initialValue;
  });
  
  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);
  
  return [value, setValue];
};
```

#### **useWorkouts Hook**
```javascript
// hooks/useWorkouts.js
export const useWorkouts = () => {
  const [workouts, setWorkouts] = useStorage('workouts', []);
  
  const addWorkout = (workout) => {
    setWorkouts([workout, ...workouts]);
  };
  
  const updateWorkout = (index, workout) => {
    const updated = [...workouts];
    updated[index] = workout;
    setWorkouts(updated);
  };
  
  const deleteWorkout = (index) => {
    setWorkouts(workouts.filter((_, i) => i !== index));
  };
  
  return { workouts, addWorkout, updateWorkout, deleteWorkout };
};
```

#### **useTimer Hook**
```javascript
// hooks/useTimer.js
export const useTimer = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [pausedTime, setPausedTime] = useState(0);
  const [lastStart, setLastStart] = useState(null);
  
  useEffect(() => {
    if (!isRunning || !lastStart) return;
    
    const interval = setInterval(() => {
      setElapsed(pausedTime + Math.floor((Date.now() - lastStart) / 1000));
    }, 1000);
    
    return () => clearInterval(interval);
  }, [isRunning, lastStart, pausedTime]);
  
  const start = () => {
    setLastStart(Date.now());
    setIsRunning(true);
  };
  
  const pause = () => {
    setPausedTime(elapsed);
    setIsRunning(false);
  };
  
  const reset = () => {
    setIsRunning(false);
    setElapsed(0);
    setPausedTime(0);
    setLastStart(null);
  };
  
  return { elapsed, isRunning, start, pause, reset };
};
```

#### **useStats Hook**
```javascript
// hooks/useStats.js
export const useStats = (workouts) => {
  return useMemo(() => {
    const totalVolume = workouts.reduce((sum, w) => 
      sum + w.exercises.reduce((exSum, ex) =>
        exSum + ex.sets.reduce((setSum, s) => setSum + (s.reps || 0), 0), 0), 0);
    
    const exerciseList = [...new Set(workouts.flatMap(w => 
      w.exercises.map(ex => ex.name)))];
    
    // ... more calculations
    
    return { totalVolume, exerciseList };
  }, [workouts]);
};
```

---

### **Phase 3: Extract UI Components** (2 hours)

#### **Small Components First**
1. **Icons.jsx** - Just export the Icons object
2. **Toast.jsx** - Notification component
3. **Header.jsx** - App header with dark mode toggle
4. **Navigation.jsx** - Bottom nav bar

#### **Medium Components**
5. **WorkoutCard.jsx** - Individual workout in log
6. **ExerciseRow.jsx** - Exercise input row
7. **Timer.jsx** - Workout timer display

#### **Large Components**
8. **WorkoutModal.jsx** - Full workout modal
9. **StatsView.jsx** - Stats tab
10. **SettingsView.jsx** - Settings tab

---

### **Phase 4: Optimize Performance** (30 min)

#### **Add Memoization**
```javascript
// Memoize expensive calculations
const filteredWorkouts = useMemo(() => 
  workouts.filter(w => w.exercises.some(ex => 
    ex.name.toLowerCase().includes(search.toLowerCase())
  )), [workouts, search]);

// Memoize components that don't need frequent re-renders
const WorkoutCard = React.memo(({ workout, onEdit, onDelete }) => {
  // ...
});
```

#### **Debounce Search**
```javascript
const [search, setSearch] = useState('');
const debouncedSearch = useDebounce(search, 300);
```

#### **Virtual Scrolling** (Optional)
For very long workout lists, consider `react-window`

---

## Expected Benefits

### **Performance**
- ⚡ **Faster re-renders**: Only affected components update
- ⚡ **Smaller bundles**: Code splitting possible
- ⚡ **Better memoization**: Easier to optimize small components

### **Maintainability**
- 📁 **Easy to find**: Each feature in its own file
- 🐛 **Easier debugging**: Isolated components
- ✅ **Testable**: Each piece can be tested independently

### **Developer Experience**
- 🚀 **Faster development**: Work on one component at a time
- 🔄 **Reusable**: Components can be used elsewhere
- 📝 **Clearer**: Each file has single responsibility

---

## Migration Strategy

### **Option A: Big Bang** (Not Recommended)
- Refactor everything at once
- High risk of breaking things
- All-or-nothing approach

### **Option B: Gradual Migration** (Recommended)
1. Start with utils (no dependencies)
2. Extract hooks (use in main file)
3. Extract one component at a time
4. Test after each extraction
5. Keep app working throughout

### **Option C: Feature Freeze** (Safest)
1. Stop adding features
2. Create new branch
3. Refactor completely
4. Test thoroughly
5. Merge when stable

---

## Next Steps

**Immediate (This Session):**
1. ✅ Extract Icons to `components/Icons.jsx`
2. ✅ Extract storage utilities to `utils/storage.js`
3. ✅ Extract formatters to `utils/formatters.js`

**Short Term (Next Session):**
4. Extract useTimer hook
5. Extract useWorkouts hook
6. Extract Header component
7. Extract Navigation component

**Long Term (Future Sessions):**
8. Extract all view components
9. Add performance optimizations
10. Add unit tests

---

## Files to Create (Priority Order)

### **High Priority** (Core improvements)
1. `utils/formatters.js` - formatTime, formatDate, etc.
2. `utils/storage.js` - localStorage wrapper
3. `hooks/useTimer.js` - Timer logic
4. `hooks/useWorkouts.js` - Workout CRUD
5. `components/Icons.jsx` - All icons

### **Medium Priority** (Better organization)
6. `components/Toast.jsx` - Notifications
7. `components/Header.jsx` - App header
8. `components/Navigation.jsx` - Bottom nav
9. `hooks/useStats.js` - Statistics calculations
10. `hooks/useBackups.js` - Backup system

### **Low Priority** (Nice to have)
11. Individual view components
12. Individual modal components
13. Specialized components

---

## Code Example: Before & After

### **Before (Current)**
```javascript
// pages/index.js (3,734 lines)
export default function Home() {
  const [workouts, setWorkouts] = useState([]);
  const [timerRunning, setTimerRunning] = useState(false);
  const [workoutTimer, setWorkoutTimer] = useState(0);
  // ... 100+ more state variables
  
  // ... 50+ functions
  
  return (
    <div>
      {/* 3,500+ lines of JSX */}
    </div>
  );
}
```

### **After (Refactored)**
```javascript
// pages/index.js (200 lines)
import { useWorkouts, useTimer, useStats } from '../hooks';
import { Header, Navigation, Toast } from '../components';
import { HomeView, LogView, StatsView, SettingsView } from '../components/views';

export default function Home() {
  const [view, setView] = useState('calendar');
  const { workouts, addWorkout, updateWorkout, deleteWorkout } = useWorkouts();
  const timer = useTimer();
  const stats = useStats(workouts);
  
  return (
    <>
      <Header />
      <main>
        {view === 'calendar' && <HomeView workouts={workouts} />}
        {view === 'list' && <LogView workouts={workouts} />}
        {view === 'stats' && <StatsView stats={stats} />}
        {view === 'settings' && <SettingsView />}
      </main>
      <Navigation view={view} setView={setView} />
      <Toast />
    </>
  );
}
```

Much cleaner! 🎉

---

## Testing Strategy

### **Unit Tests** (Recommended)
```javascript
// hooks/useTimer.test.js
import { renderHook, act } from '@testing-library/react-hooks';
import { useTimer } from './useTimer';

test('timer starts at 0', () => {
  const { result } = renderHook(() => useTimer());
  expect(result.current.elapsed).toBe(0);
});

test('timer increments when started', async () => {
  const { result } = renderHook(() => useTimer());
  act(() => result.current.start());
  await new Promise(r => setTimeout(r, 1100));
  expect(result.current.elapsed).toBeGreaterThan(0);
});
```

### **Integration Tests** (Optional)
Test that components work together correctly

### **E2E Tests** (Future)
Test full user workflows

---

## Conclusion

This refactoring will transform the codebase from a monolithic 3,734-line file into a clean, modular, performant application. The gradual approach ensures nothing breaks along the way.

**Estimated Time**: 4-6 hours total across multiple sessions
**Risk Level**: Low (with gradual approach)
**Benefit**: High (much easier to maintain and extend)

Ready to start! 🚀
