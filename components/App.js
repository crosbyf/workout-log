import { useEffect, useState } from 'react';
import { useThemeStore, THEMES } from '../stores/themeStore';
import { useUIStore } from '../stores/uiStore';
import Header from './layout/Header';
import BottomNav from './layout/BottomNav';
import LoadingScreen from './layout/LoadingScreen';
import Toast from './modals/Toast';
import ConfirmDialog from './modals/ConfirmDialog';
import HomeScreen from './screens/HomeScreen';
import StatsScreen from './screens/StatsScreen';
import SettingsScreen from './screens/SettingsScreen';
import WorkoutModal from './workout/WorkoutModal';
import QuickAddModal from './quickadd/QuickAddModal';
import DayDetailModal from './home/DayDetailModal';
import HistoryModal from './workout/HistoryModal';

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const { getCurrentTheme, isDark, theme } = useThemeStore();
  const { view } = useUIStore();

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <LoadingScreen />;
  }

  const currentTheme = getCurrentTheme();

  return (
    <div
      className={`min-h-screen ${currentTheme.bg} ${currentTheme.text} transition-colors duration-300`}
      style={{
        backgroundColor: currentTheme.rawBg,
        color: currentTheme.rawText,
      }}
    >
      <Header />

      <main className="pt-20 pb-20 px-4 max-w-4xl mx-auto">
        {view === 'home' && <HomeScreen />}
        {view === 'stats' && <StatsScreen />}
        {view === 'settings' && <SettingsScreen />}
      </main>

      <BottomNav />

      {/* Global Modals */}
      <Toast />
      <ConfirmDialog />
      <WorkoutModal />
      <QuickAddModal />
      <DayDetailModal />
      <HistoryModal />
    </div>
  );
}
