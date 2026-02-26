'use client';

import { BarChart3 } from 'lucide-react';
import EmptyState from '@/components/shared/EmptyState';

export default function StatsTab() {
  return (
    <div className="pt-2">
      <EmptyState
        icon={BarChart3}
        message="Log a few workouts to see your stats."
      />
    </div>
  );
}
