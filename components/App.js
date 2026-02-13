import { useState, useEffect } from 'react';
import { useThemeStore } from '../stores/themeStore';
import { useUIStore } from '../stores/uiStore';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { initSync, destroySync } from '../lib/sync';
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
  const { getCurrentTheme } = useThemeStore();
  const { view } = useUIStore();

  // Loading splash
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  // Cloud sync initialization
  useEffect(() => {
    if (!isSupabaseConfigured() || !supabase) return;

    let subscription = null;

    // Check for existing session and start sync
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        initSync();
      }
    });

    // Listen for auth state changes (magic link callback, sign out)
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        initSync();
      } else if (event === 'SIGNED_OUT') {
        destroySync();
      }
    });
    subscription = data.subscription;

    return () => {
      if (subscription) subscription.unsubscribe();
      destroySync();
    };
  }, []);

  if (isLoading) {
    return <LoadingScreen />;
  }

  const currentTheme = getCurrentTheme();

  return (
    <div
      className="min-h-screen transition-colors"
      style={{
        backgroundColor: currentTheme.rawBg,
        color: currentTheme.rawText,
      }}
    >
      <Header />

      <main className="pt-16 pb-20">
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
