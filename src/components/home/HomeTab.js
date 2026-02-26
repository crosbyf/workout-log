'use client';

import { Dumbbell } from 'lucide-react';
import EmptyState from '@/components/shared/EmptyState';

export default function HomeTab() {
  return (
    <div className="pt-2">
      {/* Calendar strip will go here in Phase 4 */}

      {/* Workout feed */}
      <EmptyState
        icon={Dumbbell}
        message="No workouts yet. Start your first one!"
      />
    </div>
  );
}
