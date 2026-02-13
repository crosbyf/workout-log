# GORS LOG - Layout Components & Pages Guide

## Quick Start

All files have been created in `/sessions/charming-wonderful-newton/gors-log/` and are ready to use with your existing Zustand stores.

### File Structure
```
gors-log/
├── pages/
│   ├── _app.js                 # Next.js app wrapper
│   ├── _document.js            # Custom document
│   └── index.js                # Home page entry
├── components/
│   ├── App.js                  # Main app shell
│   ├── layout/
│   │   ├── Header.js           # Fixed top nav
│   │   ├── BottomNav.js        # Fixed bottom nav
│   │   └── LoadingScreen.js    # 2-sec splash screen
│   ├── modals/
│   │   ├── Toast.js            # Toast notifications
│   │   ├── ConfirmDialog.js    # Delete confirmations
│   │   └── BottomSheet.js      # Swipe-to-dismiss sheets
│   └── screens/
│       ├── HomeScreen.js       # Home/tracking view
│       ├── StatsScreen.js      # Statistics view
│       └── SettingsScreen.js   # Settings view
└── styles/
    └── globals.css             # Global Tailwind setup
```

## Component Details

### 1. pages/_app.js
**Standard Next.js wrapper**
- Imports globals.css
- Renders Component with pageProps
- No additional config needed (Zustand auto-hydrates)

```javascript
import '../styles/globals.css';

function MyApp({ Component, pageProps }) {
  return <Component {...pageProps} />;
}

export default MyApp;
```

### 2. pages/index.js
**Home page entry point**
- Imports App component from components/App
- Sets up Head with meta tags
- Viewport meta tags for mobile
- Apple PWA meta tags

```javascript
<Head>
  <title>GORS LOG</title>
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
  <meta name="apple-mobile-web-app-capable" content="yes" />
  <meta name="apple-mobile-web-app-status-bar-style" content="default" />
</Head>
```

### 3. components/App.js
**Main app shell**

Features:
- 2-second LoadingScreen on mount
- Theme colors from useThemeStore
- View routing (home/stats/settings) from useUIStore
- Layout structure: Header → Content → BottomNav
- Global modals: Toast, ConfirmDialog

```javascript
const { getCurrentTheme, isDark } = useThemeStore();
const { view } = useUIStore();

// Returns:
// - LoadingScreen (0-2 seconds)
// - Header (fixed top)
// - Main content (conditionally renders screens)
// - BottomNav (fixed bottom)
// - Global modals
```

### 4. components/layout/Header.js
**Fixed top navigation bar**

Layout (3-column):
```
[+] Button    GORS LOG (Gradient)    [🔍] Button
```

Features:
- Blue gradient "+" button (home view only)
  - Triggers QuickAddModal
- "GORS LOG" text (all views)
  - Cycles theme on click
- Search button (home view only)
  - Opens search interface
- Theme gradient background
- Responsive max-w-4xl container

```javascript
const { getCurrentTheme, cycleTheme } = useThemeStore();
const { view } = useUIStore();

// Left button shown only if view === 'home'
// Right button shown only if view === 'home'
// Center title always visible, clickable to cycle theme
```

### 5. components/layout/BottomNav.js
**Fixed bottom navigation bar**

3 Tabs:
- 🗓️ Home (Calendar icon)
- 📈 Stats (TrendingUp icon)
- ⚙️ Settings (Settings icon)

Features:
- Active tab highlighted (blue-400, scale-110)
- Backdrop blur effect
- Safe area padding for notch
- Calls setView() and scrolls to top on tab click
- Theme-aware styling

```javascript
const tabs = [
  { id: 'home', label: 'Home', icon: Calendar },
  { id: 'stats', label: 'Stats', icon: TrendingUp },
  { id: 'settings', label: 'Settings', icon: Settings },
];

// Click handler:
const handleTabClick = (tabId) => {
  setView(tabId);
  window.scrollTo({ top: 0, behavior: 'smooth' });
};
```

### 6. components/layout/LoadingScreen.js
**2-second splash screen**

Display:
```
        GORS
    ─────────
   BE ABOUT IT
```

Features:
- Full screen centered
- Theme colors (bg, text)
- Colored line (blue for light/dark, green for neon/forest)
- Auto-hides after 2 seconds (in App.js)
- "GORS" in text-6xl font-black
- "BE ABOUT IT" in text-sm tracking-widest

```javascript
const getLineColor = () => {
  const themeName = currentTheme.name || 'light';
  if (themeName === 'neon') return 'bg-green-400';
  if (themeName === 'forest') return 'bg-green-500';
  return 'bg-blue-400';
};
```

### 7. components/modals/Toast.js
**Toast notification component**

Features:
- Fixed bottom-24 (above BottomNav)
- Green background, white text
- Auto-hides after 3 seconds
- Uses uiStore.showToast and toastMessage
- Only renders when showToast === true

Usage (from stores):
```javascript
const { showToastMessage } = useUIStore();
showToastMessage(true, 'Your message here');
// Auto-hides after 3 seconds
```

### 8. components/modals/ConfirmDialog.js
**Reusable confirmation modal**

Props:
```javascript
{
  isOpen: boolean,
  title: string,
  message: string,
  confirmLabel: string = 'Confirm',
  cancelLabel: string = 'Cancel',
  onConfirm: () => void,
  onCancel: () => void,
  destructive: boolean = false
}
```

Features:
- Full screen overlay (bg-black bg-opacity-75)
- Centered card with theme background
- Title (red if destructive)
- Confirm button (blue or red if destructive)
- Cancel button (secondary style)
- Close button (X icon)
- Only renders when isOpen === true

Example usage:
```javascript
<ConfirmDialog
  isOpen={showDeleteConfirm}
  title="Delete Workout?"
  message="This action cannot be undone."
  confirmLabel="Delete"
  cancelLabel="Cancel"
  destructive={true}
  onConfirm={handleDelete}
  onCancel={() => setShowDeleteConfirm(false)}
/>
```

### 9. components/modals/BottomSheet.js
**Swipe-to-dismiss bottom sheet modal**

Props:
```javascript
{
  isOpen: boolean,
  onClose: () => void,
  children: ReactNode,
  title: string (optional)
}
```

Features:
- Slides up from bottom (rounded-t-2xl)
- Drag handle (visual indicator at top)
- Touch gestures:
  - Swipe down to dismiss
  - Snap back if not dragged far enough
- Max height 85vh with scrolling
- Sticky header with close button (if title provided)
- Click overlay to dismiss
- Auto-hides body overflow
- Safe area padding for notch

Touch handling:
```javascript
const handleTouchStart = (e) => {
  setStartY(e.touches[0].clientY);
  setScrollTop(contentRef.current.scrollTop);
};

const handleTouchMove = (e) => {
  // Only drag if at top of scroll and dragging down
  if (scrollTop === 0 && diff > 0) {
    setTranslateY(diff);
  }
};

const handleTouchEnd = () => {
  // Dismiss if dragged > 100px
  if (translateY > 100) {
    onClose();
  }
};
```

Example usage:
```javascript
<BottomSheet
  isOpen={showAddWorkout}
  onClose={() => setShowAddWorkout(false)}
  title="Add Workout"
>
  {/* Form content here */}
</BottomSheet>
```

### 10. components/screens/HomeScreen.js
**Home/workout tracking view**
- Placeholder component (ready to populate)
- Uses theme cardBg styling
- To add: calendar, workout list, quick stats

### 11. components/screens/StatsScreen.js
**Statistics and progress view**
- Placeholder component (ready to populate)
- Uses theme cardBg styling
- To add: charts, metrics, achievements, streaks

### 12. components/screens/SettingsScreen.js
**Settings and preferences view**
- Placeholder component (ready to populate)
- Uses theme cardBg styling
- To add: theme selector, backup/restore, app settings

### 13. styles/globals.css
**Global styles and Tailwind setup**

Includes:
- Tailwind directives (@tailwind base/components/utilities)
- Global reset (margin, padding, box-sizing)
- Font family and smoothing (-webkit-font-smoothing)
- Safe area support (.safe-area-pb, .safe-area-pt)
- Custom animations (@keyframes slide-up)
- Smooth scrolling behavior
- Placeholder and selection styling

## Store Integration

### useThemeStore
```javascript
const { theme, setTheme, cycleTheme, getCurrentTheme, isDark } = useThemeStore();

// getCurrentTheme() returns:
{
  bg: 'bg-white',              // Tailwind bg class
  text: 'text-black',          // Tailwind text class
  cardBg: '#f5f5f5',           // Inline color
  cardBorder: '#e0e0e0',       // Inline color
  inputBg: '#f0f0f0',          // Inline color
  inputBorder: '#d0d0d0',      // Inline color
  headerGradient: 'linear-gradient(...)',
  headerBorder: '#e0e0e0',
  accent: '#3b82f6',           // Blue
  isDark: false,
  name: 'light'                // 'light', 'dark', 'neon', 'forest'
}

// isDark() returns boolean for dark mode check
// cycleTheme() rotates through theme options
```

### useUIStore
```javascript
const { view, setView, showToast, toastMessage, showToastMessage } = useUIStore();

// view: 'home' | 'stats' | 'settings'
// setView(view) - changes active view
// showToast: boolean
// toastMessage: string
// showToastMessage(show: boolean, message?: string) - shows/hides toast
```

## Styling Approach

### Theme Application
Components use both Tailwind classes and inline styles for dynamic colors:

```javascript
const currentTheme = getCurrentTheme();

// Using inline styles for colors that can't be Tailwind classes:
<div style={{ backgroundColor: currentTheme.cardBg }}>
  {/* Content */}
</div>

// Using Tailwind for fixed classes:
<button className="bg-blue-500 hover:bg-blue-600">
  Action
</button>
```

### Mobile Considerations
- Viewport meta tags prevent zoom on input focus
- Safe area support for notched phones (safe-area-pb, safe-area-pt)
- Bottom sheet swipe gestures for natural mobile interaction
- Header/Nav fixed positioning keeps content accessible
- Touch-friendly button sizes (minimum 44x44 px)
- Max-width 4xl for optimal reading on larger screens

## Next Steps to Complete App

1. **HomeScreen**
   - Add calendar component
   - Add workout list
   - Add quick stats

2. **Modal Components**
   - QuickAddModal (fast entry form)
   - WorkoutModal (detailed editor)
   - DayDetailModal (view day details)

3. **Form Components**
   - Input fields with validation
   - Select dropdowns
   - Date pickers
   - Number inputs

4. **StatsScreen**
   - Weekly chart
   - Monthly summary
   - Achievement badges
   - Streak counter

5. **SettingsScreen**
   - Theme selector button
   - Backup/restore buttons
   - Reset/clear data options
   - App info

6. **uiStore Integration**
   - Connect modal open/close to uiStore
   - Connect form state to trackingStore
   - Connect search functionality

## Testing Notes

All components use:
- React hooks (useState, useEffect, useRef, useContext)
- Lucide React icons
- Tailwind CSS classes
- Zustand store hooks

To test:
1. Verify stores are initialized correctly
2. Check theme switching works
3. Test modal open/close
4. Verify navigation between views
5. Test touch gestures on mobile device

## Notes for Developers

- All modals are global and controlled via uiStore
- ConfirmDialog reuses for all deletions/confirmations
- BottomSheet reuses for all sheet modals
- Header changes based on view (buttons hide on non-home views)
- LoadingScreen auto-hides after 2 seconds
- Theme colors apply dynamically via getCurrentTheme()
- Safe area padding handled for notched devices
- All components follow accessibility standards (aria labels, roles)
