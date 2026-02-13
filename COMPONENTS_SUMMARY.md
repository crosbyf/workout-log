# GORS LOG - Layout Components, Modals & Pages Summary

## Files Created

### Pages (Next.js Entry Points)
**Location:** `/pages/`

1. **_app.js** - Next.js app wrapper
   - Imports global styles (`styles/globals.css`)
   - Renders Component with pageProps
   - Zustand stores auto-hydrate

2. **_document.js** - Custom Next.js document
   - Sets `lang="en"` on html tag
   - Standard Next.js document structure

3. **index.js** - Home page entry point
   - Renders App component
   - Sets up Head with title "GORS LOG"
   - Includes viewport meta tags for mobile
   - Includes apple-mobile-web-app meta tags for PWA support

### Layout Components
**Location:** `/components/layout/`

1. **Header.js** - Fixed top navigation bar
   - Fixed position (z-20)
   - Uses theme headerGradient background
   - Left: Quick Add button (+) - only shows on 'home' view
     - Blue gradient background
     - Opens QuickAddModal on click
   - Center: "GORS LOG" title button
     - Gradient text effect
     - Cycles theme on click via useThemeStore.cycleTheme()
   - Right: Search button - only shows on 'home' view
     - Opens search interface on click
   - Responsive layout with max-w-4xl container

2. **BottomNav.js** - Fixed bottom navigation bar
   - Fixed position (z-20)
   - Backdrop blur effect with semi-transparent cardBg
   - 3 navigation tabs:
     - Home (Calendar icon)
     - Stats (TrendingUp icon)
     - Settings (Settings icon)
   - Active tab highlighted with blue-400 color and scale-110
   - Each tab calls uiStore.setView() and scrolls to top
   - Includes safe-area-pb for bottom notch support

3. **LoadingScreen.js** - 2-second splash screen
   - Full screen centered loading animation
   - Shows on app mount for 2 seconds
   - Displays:
     - "GORS" in text-6xl font-black tracking-tight
     - Colored line below (blue for light/dark, green for neon/forest themes)
     - "BE ABOUT IT" tagline in text-sm tracking-widest
   - Uses theme colors (getCurrentTheme)
   - Vertically and horizontally centered

### Modal Components
**Location:** `/components/modals/`

1. **Toast.js** - Toast notification modal
   - Fixed position (bottom-24, centered horizontally)
   - Green background with white text
   - Displays toastMessage from uiStore
   - Auto-hides after 3 seconds
   - Only renders when showToast is true
   - Shadow and rounded styling

2. **ConfirmDialog.js** - Reusable confirmation modal
   - Props: isOpen, title, message, confirmLabel, cancelLabel, onConfirm, onCancel, destructive
   - Full screen overlay (bg-black bg-opacity-75, z-50)
   - Centered card with theme cardBg
   - Title with conditional red color if destructive=true
   - Message paragraph
   - Two buttons:
     - Cancel button (inputBg color)
     - Confirm button (blue or red if destructive)
   - Close button (X icon) in top-right
   - Only renders when isOpen is true

3. **BottomSheet.js** - Reusable swipe-dismissible bottom sheet
   - Props: isOpen, onClose, children, title
   - Full screen overlay with bg-black bg-opacity-50 (z-50)
   - Content slides up from bottom with animate-slide-up
   - Rounded top corners (rounded-t-2xl)
   - Drag handle bar (w-10 h-1 centered) at top
   - Touch gesture handlers:
     - onTouchStart: records startY and scrollTop
     - onTouchMove: translates element when at top of scroll and dragging down
     - onTouchEnd: dismisses if dragged > 100px, otherwise snaps back
   - Max height 85vh with overflow-y-auto
   - Optional sticky header with title and close button
   - Clicking overlay dismisses
   - Safe area padding (h-8) at bottom for notch
   - Auto-hides body overflow when open

### Screen Components
**Location:** `/components/screens/`

1. **HomeScreen.js** - Home/workout tracking view
   - Placeholder content showing welcome message
   - Uses theme cardBg for styling
   - To be populated with calendar, workout list, and tracking UI

2. **StatsScreen.js** - Statistics and progress view
   - Placeholder content showing stats message
   - Uses theme cardBg for styling
   - To be populated with charts, metrics, and progress tracking

3. **SettingsScreen.js** - Settings and preferences view
   - Placeholder content showing settings message
   - Uses theme cardBg for styling
   - To be populated with theme selector, backup/restore, and app settings

### Main App Component
**Location:** `/components/App.js`

- Top-level app shell component
- Manages loading state (2-second LoadingScreen on mount)
- Uses useThemeStore for theme classes and colors
- Uses useUIStore for view routing (home/stats/settings)
- Renders layout structure:
  - Header (fixed top)
  - Main content area (conditional screens based on view)
  - BottomNav (fixed bottom)
- Global modals rendered at app level:
  - Toast
  - ConfirmDialog
  - Placeholder comments for QuickAddModal, WorkoutModal, DayDetailModal (to be added)
- Applies dynamic theme colors via inline styles
- Transition animation for theme changes (duration-300)

### Styles
**Location:** `/styles/globals.css`

- Tailwind imports (@tailwind directives)
- Global reset (margin, padding, box-sizing)
- Font family and smoothing setup
- Safe area support for notched devices (.safe-area-pb, .safe-area-pt)
- Custom animations (@keyframes slide-up, .animate-slide-up)
- Smooth scrolling
- Placeholder and selection styling

## Architecture Overview

### Component Hierarchy
```
App (main shell)
├── Header (fixed top)
│   ├── Quick Add Button (+)
│   ├── GORS LOG Title (theme cycler)
│   └── Search Button
├── Main Content Area
│   ├── HomeScreen (view === 'home')
│   ├── StatsScreen (view === 'stats')
│   └── SettingsScreen (view === 'settings')
├── BottomNav (fixed bottom)
│   ├── Home Tab
│   ├── Stats Tab
│   └── Settings Tab
└── Global Modals
    ├── Toast
    ├── ConfirmDialog
    ├── QuickAddModal (placeholder)
    ├── WorkoutModal (placeholder)
    └── DayDetailModal (placeholder)
```

### State Management
- **useThemeStore**: theme, setTheme, cycleTheme, getCurrentTheme, isDark
- **useUIStore**: view, setView, showToast, toastMessage, showToastMessage
- **useWorkoutStore**: (available for screens/modals)
- **usePresetStore**: (available for screens/modals)
- **useTrackingStore**: (available for screens/modals)

### Styling Approach
- Tailwind CSS for utility classes
- Dynamic theme colors from useThemeStore.getCurrentTheme()
- Inline styles for dynamic colors that can't be class-based
- Theme structure: { bg, text, cardBg, cardBorder, inputBg, inputBorder, headerGradient, headerBorder, accent, isDark, name }

## Mobile Considerations
- Viewport meta tags set for mobile optimization
- Safe area support for notched devices (safe-area-pb, safe-area-pt)
- Apple PWA meta tags included
- Bottom sheet swipe-to-dismiss gesture handling
- Touch-friendly button sizes (min 44px)
- Responsive layout (max-w-4xl centered)
- Header and nav take 20px/80px (pt-20 pb-20)

## Next Steps
1. Implement HomeScreen with calendar and workout list
2. Create QuickAddModal for fast workout entry
3. Create WorkoutModal for detailed workout editing
4. Create DayDetailModal for viewing daily details
5. Implement StatsScreen with charts and metrics
6. Implement SettingsScreen with preferences
7. Connect modal states to uiStore
8. Add form components and input handlers
