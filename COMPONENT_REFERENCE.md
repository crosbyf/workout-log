# GORS LOG - Component Reference & Code Snippets

## Quick Component Import Reference

### Pages
```javascript
// pages/index.js
import App from '../components/App';
```

### Layout Components
```javascript
import Header from './layout/Header';
import BottomNav from './layout/BottomNav';
import LoadingScreen from './layout/LoadingScreen';
```

### Modal Components
```javascript
import Toast from './modals/Toast';
import ConfirmDialog from './modals/ConfirmDialog';
import BottomSheet from './modals/BottomSheet';
```

### Screen Components
```javascript
import HomeScreen from './screens/HomeScreen';
import StatsScreen from './screens/StatsScreen';
import SettingsScreen from './screens/SettingsScreen';
```

---

## Component Props Reference

### ConfirmDialog
```javascript
<ConfirmDialog
  isOpen={boolean}              // Required: show/hide dialog
  title={string}                // Required: dialog title
  message={string}              // Required: confirmation message
  confirmLabel={string}         // Optional: confirm button text (default: "Confirm")
  cancelLabel={string}          // Optional: cancel button text (default: "Cancel")
  onConfirm={() => void}        // Required: callback on confirm
  onCancel={() => void}         // Required: callback on cancel
  destructive={boolean}         // Optional: red styling if true (default: false)
/>
```

Example:
```javascript
const [showDelete, setShowDelete] = useState(false);

<ConfirmDialog
  isOpen={showDelete}
  title="Delete Workout?"
  message="This cannot be undone. Delete this workout?"
  confirmLabel="Delete"
  cancelLabel="Cancel"
  destructive={true}
  onConfirm={() => {
    deleteWorkout();
    setShowDelete(false);
  }}
  onCancel={() => setShowDelete(false)}
/>
```

### BottomSheet
```javascript
<BottomSheet
  isOpen={boolean}           // Required: show/hide sheet
  onClose={() => void}       // Required: callback to close
  children={ReactNode}       // Required: sheet content
  title={string}             // Optional: header title
/>
```

Example:
```javascript
const [showForm, setShowForm] = useState(false);

<BottomSheet
  isOpen={showForm}
  onClose={() => setShowForm(false)}
  title="Add New Workout"
>
  <div>
    {/* Your form content here */}
  </div>
</BottomSheet>
```

### Toast
```javascript
// Toast reads from uiStore automatically
// Just render it once in App.js

<Toast />

// To show a toast from any component:
import { useUIStore } from '../stores/uiStore';

export default function MyComponent() {
  const { showToastMessage } = useUIStore();
  
  const handleSuccess = () => {
    showToastMessage(true, 'Workout added successfully!');
    // Auto-hides after 3 seconds
  };
}
```

---

## Store Usage Examples

### useThemeStore
```javascript
import { useThemeStore } from '../stores/themeStore';

export default function MyComponent() {
  const { theme, setTheme, cycleTheme, getCurrentTheme, isDark } = useThemeStore();
  
  // Get current theme object
  const currentTheme = getCurrentTheme();
  
  // Apply colors
  return (
    <div style={{ backgroundColor: currentTheme.cardBg }}>
      <button onClick={cycleTheme}>Cycle Theme</button>
    </div>
  );
}
```

### useUIStore
```javascript
import { useUIStore } from '../stores/uiStore';

export default function MyComponent() {
  const { 
    view,              // Current view: 'home' | 'stats' | 'settings'
    setView,           // Function to change view
    showToast,         // Boolean: is toast visible
    toastMessage,      // String: toast message
    showToastMessage   // Function: (show, message) => void
  } = useUIStore();
  
  return (
    <button onClick={() => setView('stats')}>
      Go to Stats
    </button>
  );
}
```

### useWorkoutStore
```javascript
import { useWorkoutStore } from '../stores/workoutStore';

export default function MyComponent() {
  const { workouts, addWorkout, deleteWorkout, updateWorkout } = useWorkoutStore();
  
  const handleAddWorkout = (workout) => {
    addWorkout(workout);
  };
}
```

### usePresetStore
```javascript
import { usePresetStore } from '../stores/presetStore';

export default function MyComponent() {
  const { presets, addPreset, deletePreset } = usePresetStore();
  
  return (
    <div>
      {presets.map(preset => (
        <div key={preset.id}>{preset.name}</div>
      ))}
    </div>
  );
}
```

### useTrackingStore
```javascript
import { useTrackingStore } from '../stores/trackingStore';

export default function MyComponent() {
  const { tracking, logTracking, getTracking } = useTrackingStore();
  
  const today = new Date().toISOString().split('T')[0];
  const todayTracking = getTracking(today);
}
```

---

## Common Component Patterns

### Adding a Modal to Screen
```javascript
export default function MyScreen() {
  const [showModal, setShowModal] = useState(false);
  
  return (
    <>
      <button onClick={() => setShowModal(true)}>
        Open Modal
      </button>
      
      <BottomSheet
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="My Modal"
      >
        {/* Content */}
      </BottomSheet>
    </>
  );
}
```

### Styling with Theme
```javascript
export default function MyComponent() {
  const { getCurrentTheme } = useThemeStore();
  const currentTheme = getCurrentTheme();
  
  return (
    <div
      className={`rounded-lg ${currentTheme.cardBg}`}
      style={{
        backgroundColor: currentTheme.cardBg,
        color: currentTheme.text,
        borderColor: currentTheme.cardBorder,
      }}
    >
      Content
    </div>
  );
}
```

### Conditional Rendering Based on View
```javascript
export default function MyComponent() {
  const { view } = useUIStore();
  
  return (
    <>
      {view === 'home' && <button>Quick Add</button>}
      {view === 'stats' && <div>Stats Content</div>}
    </>
  );
}
```

### Toast Notifications
```javascript
import { useUIStore } from '../stores/uiStore';

export default function MyComponent() {
  const { showToastMessage } = useUIStore();
  
  const handleSuccess = () => {
    showToastMessage(true, 'Success!');
    // Auto-hides after 3 seconds
  };
  
  const handleError = () => {
    showToastMessage(true, 'Something went wrong');
    // Auto-hides after 3 seconds
  };
  
  return (
    <>
      <button onClick={handleSuccess}>Success</button>
      <button onClick={handleError}>Error</button>
    </>
  );
}
```

### Delete Confirmation
```javascript
const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

<ConfirmDialog
  isOpen={showDeleteConfirm}
  title="Delete?"
  message="Are you sure you want to delete this?"
  confirmLabel="Delete"
  cancelLabel="Cancel"
  destructive={true}
  onConfirm={() => {
    handleDelete();
    setShowDeleteConfirm(false);
  }}
  onCancel={() => setShowDeleteConfirm(false)}
/>
```

---

## Tailwind Classes Used

### Spacing
- `p-2`, `p-4`, `p-6` - Padding
- `pt-20`, `pb-20` - Padding top/bottom
- `px-4`, `px-6` - Padding left/right
- `gap-3`, `gap-6` - Gap between flex items
- `mb-4`, `mb-6` - Margin bottom

### Layout
- `flex`, `flex-col` - Flexbox
- `items-center`, `justify-center` - Alignment
- `justify-between` - Space between items
- `flex-1`, `flex-shrink-0` - Flex properties
- `fixed`, `absolute`, `relative` - Position
- `inset-0`, `top-0`, `bottom-0` - Position values
- `w-10`, `h-10` - Width/height
- `max-w-4xl`, `mx-auto` - Max width and centering
- `z-20`, `z-50` - Z-index

### Colors
- `bg-white`, `bg-black` - Background
- `text-white`, `text-black` - Text
- `bg-opacity-50`, `bg-opacity-75` - Opacity
- `text-blue-400`, `text-red-500` - Colored text
- `bg-gradient-to-r from-blue-500 to-blue-600` - Gradients
- `border-b`, `border-t` - Borders

### Effects
- `rounded`, `rounded-lg`, `rounded-t-2xl` - Border radius
- `shadow-lg`, `shadow-2xl` - Shadows
- `backdrop-blur-sm` - Blur effect
- `opacity-80`, `opacity-50` - Opacity
- `transition-all`, `duration-200`, `duration-300` - Transitions
- `hover:bg-blue-600`, `hover:scale-110` - Hover effects

### Text
- `font-black`, `font-bold`, `font-medium` - Font weight
- `text-xs`, `text-sm`, `text-xl`, `text-2xl`, `text-6xl` - Font size
- `tracking-tight`, `tracking-widest` - Letter spacing
- `uppercase` - Text transform
- `text-center` - Text alignment
- `bg-clip-text`, `text-transparent` - Gradient text

---

## Lucide React Icons Used

```javascript
import {
  Plus,          // Quick add button
  Search,        // Search button
  Calendar,      // Home nav icon
  TrendingUp,    // Stats nav icon
  Settings,      // Settings nav icon
  X,             // Close button
} from 'lucide-react';

// Usage:
<Plus size={24} />
<Search size={20} />
```

More icons available at lucide.dev

---

## CSS Custom Properties (globals.css)

### Safe Area
```css
.safe-area-pb {
  padding-bottom: max(1rem, env(safe-area-inset-bottom));
}

.safe-area-pt {
  padding-top: max(1rem, env(safe-area-inset-top));
}
```

### Animations
```css
@keyframes slide-up {
  from {
    transform: translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.animate-slide-up {
  animation: slide-up 0.3s ease-out;
}
```

---

## File Locations Summary

All files created in: `/sessions/charming-wonderful-newton/gors-log/`

```
gors-log/
├── pages/
│   ├── _app.js
│   ├── _document.js
│   └── index.js
├── components/
│   ├── App.js
│   ├── layout/
│   │   ├── Header.js
│   │   ├── BottomNav.js
│   │   └── LoadingScreen.js
│   ├── modals/
│   │   ├── Toast.js
│   │   ├── ConfirmDialog.js
│   │   └── BottomSheet.js
│   └── screens/
│       ├── HomeScreen.js
│       ├── StatsScreen.js
│       └── SettingsScreen.js
└── styles/
    └── globals.css
```

All components are complete and ready to use with your existing Zustand stores!
