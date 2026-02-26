'use client';

import { useState } from 'react';
import { useTheme } from '@/hooks/useTheme';
import Header from '@/components/layout/Header';
import BottomNav from '@/components/layout/BottomNav';
import HomeTab from '@/components/home/HomeTab';
import StatsTab from '@/components/stats/StatsTab';
import SettingsTab from '@/components/settings/SettingsTab';

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const { mounted } = useTheme();

  const handleStartWorkout = () => {
    // Phase 2: Open preset selection screen
    console.log('Start workout tapped');
  };

  const handleSearch = () => {
    // Phase 3: Open search
    console.log('Search tapped');
  };

  // Prevent flash of unstyled content before theme loads
  if (!mounted) {
    return (
      <div
        className="min-h-screen"
        style={{ backgroundColor: '#0f0f14' }}
      />
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-bg)' }}>
      <Header
        activeTab={activeTab}
        onStartWorkout={handleStartWorkout}
        onSearch={handleSearch}
      />

      {/* Main content area: padded for header and bottom nav */}
      <main className="pt-14 pb-16">
        {activeTab === 'home' && <HomeTab />}
        {activeTab === 'stats' && <StatsTab />}
        {activeTab === 'settings' && <SettingsTab />}
      </main>

      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}
