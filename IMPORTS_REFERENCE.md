# GORS LOG - Component Imports Reference

## Quick Import Cheat Sheet

### Pages
```javascript
// pages/index.js
import Head from 'next/head';
import App from '../components/App';
```

### Layout Components
```javascript
// In App.js
import Header from './layout/Header';
import BottomNav from './layout/BottomNav';
import LoadingScreen from './layout/LoadingScreen';

// In Header.js
import { Plus, Search } from 'lucide-react';
import { useThemeStore } from '../../stores/themeStore';
import { useUIStore } from '../../stores/uiStore';

// In BottomNav.js
import { Calendar, TrendingUp, Settings } from 'lucide-react';
import { useThemeStore } from '../../stores/themeStore';
import { useUIStore } from '../../stores/uiStore';

// In LoadingScreen.js
import { useThemeStore } from '../../stores/themeStore';
```

### Modal Components
```javascript
// In Toast.js
import { useEffect } from 'react';
import { useUIStore } from '../../stores/uiStore';

// In ConfirmDialog.js
import { X } from 'lucide-react';
import { useThemeStore } from '../../stores/themeStore';

// In BottomSheet.js
import { useState, useRef, useEffect } from 'react';
import { X } from 'lucide-react';
import { useThemeStore } from '../../stores/themeStore';
```

### Screen Components
```javascript
// In HomeScreen.js, StatsScreen.js, SettingsScreen.js
import { useThemeStore } from '../../stores/themeStore';
```

### Main App
```javascript
// In App.js
import { useEffect, useState } from 'react';
import { useThemeStore } from '../stores/themeStore';
import { useUIStore } from '../stores/uiStore';
import Header from './layout/Header';
import BottomNav from './layout/BottomNav';
import LoadingScreen from './layout/LoadingScreen';
import Toast from './modals/Toast';
import ConfirmDialog from './modals/ConfirmDialog';
import HomeScreen from './screens/HomeScreen';
import StatsScreen from './screens/StatsScreen';
import SettingsScreen from './screens/SettingsScreen';
```

---

## Store Hooks Used

### useThemeStore
Used in: App.js, Header.js, BottomNav.js, LoadingScreen.js, ConfirmDialog.js, BottomSheet.js, HomeScreen.js, StatsScreen.js, SettingsScreen.js

```javascript
import { useThemeStore } from '../stores/themeStore';

const { 
  theme,              // Current theme name: 'light' | 'dark' | 'neon' | 'forest'
  setTheme,           // (theme: string) => void
  cycleTheme,         // () => void - cycles to next theme
  getCurrentTheme,    // () => ThemeObject
  isDark              // () => boolean
} = useThemeStore();
```

### useUIStore
Used in: App.js, Header.js, BottomNav.js, Toast.js

```javascript
import { useUIStore } from '../stores/uiStore';

const {
  view,              // Current view: 'home' | 'stats' | 'settings'
  setView,           // (view: 'home' | 'stats' | 'settings') => void
  showToast,         // boolean
  toastMessage,      // string
  showToastMessage   // (show: boolean, message?: string) => void
} = useUIStore();
```

### useWorkoutStore
Available in any component (used in screens/modals)

```javascript
import { useWorkoutStore } from '../stores/workoutStore';

const {
  workouts,          // Workout[]
  addWorkout,        // (workout: Workout) => void
  deleteWorkout,     // (id: string) => void
  updateWorkout,     // (id: string, updates: Partial<Workout>) => void
  // ... other methods
} = useWorkoutStore();
```

### usePresetStore
Available in any component (used in screens/modals)

```javascript
import { usePresetStore } from '../stores/presetStore';

const {
  presets,           // Preset[]
  addPreset,         // (preset: Preset) => void
  deletePreset,      // (id: string) => void
  // ... other methods
} = usePresetStore();
```

### useTrackingStore
Available in any component (used in screens/modals)

```javascript
import { useTrackingStore } from '../stores/trackingStore';

const {
  tracking,          // Tracking object
  logTracking,       // (date: string, data: any) => void
  getTracking,       // (date: string) => any
  // ... other methods
} = useTrackingStore();
```

---

## Lucide React Icons Used

### Imported in Header.js
```javascript
import { Plus, Search } from 'lucide-react';
// <Plus size={24} />
// <Search size={24} />
```

### Imported in BottomNav.js
```javascript
import { Calendar, TrendingUp, Settings } from 'lucide-react';
// <Calendar size={24} />
// <TrendingUp size={24} />
// <Settings size={24} />
```

### Imported in ConfirmDialog.js and BottomSheet.js
```javascript
import { X } from 'lucide-react';
// <X size={20} />
```

### Other Available Icons (for future use)
```javascript
import {
  Plus,
  Minus,
  X,
  Home,
  Settings,
  Menu,
  Search,
  User,
  LogOut,
  Edit,
  Delete,
  Save,
  Check,
  AlertCircle,
  Calendar,
  Clock,
  TrendingUp,
  BarChart,
  PieChart,
  ArrowUp,
  ArrowDown,
  Zap,
  Heart,
  Target,
  // ... and many more
} from 'lucide-react';
```

---

## React Imports Used

### Used in Multiple Components
```javascript
import { useState } from 'react';      // BottomSheet, App
import { useEffect } from 'react';     // BottomSheet, App, Toast
import { useRef } from 'react';        // BottomSheet
```

### Next.js Imports
```javascript
import Head from 'next/head';          // pages/index.js
import { Html, Head, Main, NextScript } from 'next/document';  // pages/_document.js
```

---

## Complete Import Map by File

### pages/_app.js
```javascript
import '../styles/globals.css';
```

### pages/_document.js
```javascript
import { Html, Head, Main, NextScript } from 'next/document';
```

### pages/index.js
```javascript
import Head from 'next/head';
import App from '../components/App';
```

### components/App.js
```javascript
import { useEffect, useState } from 'react';
import { useThemeStore } from '../stores/themeStore';
import { useUIStore } from '../stores/uiStore';
import Header from './layout/Header';
import BottomNav from './layout/BottomNav';
import LoadingScreen from './layout/LoadingScreen';
import Toast from './modals/Toast';
import ConfirmDialog from './modals/ConfirmDialog';
import HomeScreen from './screens/HomeScreen';
import StatsScreen from './screens/StatsScreen';
import SettingsScreen from './screens/SettingsScreen';
```

### components/layout/Header.js
```javascript
import { Plus, Search } from 'lucide-react';
import { useThemeStore } from '../../stores/themeStore';
import { useUIStore } from '../../stores/uiStore';
```

### components/layout/BottomNav.js
```javascript
import { Calendar, TrendingUp, Settings } from 'lucide-react';
import { useThemeStore } from '../../stores/themeStore';
import { useUIStore } from '../../stores/uiStore';
```

### components/layout/LoadingScreen.js
```javascript
import { useThemeStore } from '../../stores/themeStore';
```

### components/modals/Toast.js
```javascript
import { useEffect } from 'react';
import { useUIStore } from '../../stores/uiStore';
```

### components/modals/ConfirmDialog.js
```javascript
import { X } from 'lucide-react';
import { useThemeStore } from '../../stores/themeStore';
```

### components/modals/BottomSheet.js
```javascript
import { useState, useRef, useEffect } from 'react';
import { X } from 'lucide-react';
import { useThemeStore } from '../../stores/themeStore';
```

### components/screens/HomeScreen.js
```javascript
import { useThemeStore } from '../../stores/themeStore';
```

### components/screens/StatsScreen.js
```javascript
import { useThemeStore } from '../../stores/themeStore';
```

### components/screens/SettingsScreen.js
```javascript
import { useThemeStore } from '../../stores/themeStore';
```

### styles/globals.css
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

---

## External Dependencies Required

### npm/package.json

```json
{
  "dependencies": {
    "react": "^18.x.x",
    "react-dom": "^18.x.x",
    "next": "^13.x.x",
    "zustand": "^4.x.x",
    "lucide-react": "^0.x.x"
  },
  "devDependencies": {
    "tailwindcss": "^3.x.x",
    "postcss": "^8.x.x",
    "autoprefixer": "^10.x.x"
  }
}
```

---

## Configuration Files Required

### tailwind.config.js
Must exist in project root

### postcss.config.js
Must exist in project root

### next.config.js
Should exist in project root (can be empty)

---

## Zustand Stores Required

Must exist in `stores/` directory:
- `stores/themeStore.js`
- `stores/uiStore.js`
- `stores/workoutStore.js`
- `stores/presetStore.js`
- `stores/trackingStore.js`

---

## Summary

- **Total imports**: ~15 unique modules
- **Store hooks**: 5 (useThemeStore, useUIStore, useWorkoutStore, usePresetStore, useTrackingStore)
- **Lucide icons**: 6 (Plus, Search, Calendar, TrendingUp, Settings, X)
- **React hooks**: 4 (useState, useEffect, useRef, useContext in stores)
- **Next.js**: Head, Html, Main, NextScript
- **CSS**: globals.css (Tailwind + custom)

All imports are relative paths within the project. No external package imports except Zustand, Lucide React, and Next.js/React.
