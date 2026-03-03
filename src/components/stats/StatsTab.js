'use client';

import { useState, useRef, useEffect } from 'react';
import { BarChart3, ChevronRight, X, Drumstick, Scale, Dumbbell, Footprints, Plus, Check } from 'lucide-react';
import EmptyState from '@/components/shared/EmptyState';
import VolumeChart from './VolumeChart';
import RunningStats from './RunningStats';
import ProteinTracker from './ProteinTracker';
import WeightTracker from './WeightTracker';
import ExerciseStats from './ExerciseStats';

/**
 * Summary card that shows a quick stat and opens full detail view on tap.
 */
function StatCard({ icon: Icon, label, value, valueColor, sublabel, onTap, quickAction }) {
  return (
    <div
      className="w-full flex items-center justify-between p-4 rounded-xl mb-2"
      style={{ backgroundColor: 'var(--color-surface)' }}
    >
      <button
        onClick={onTap}
        className="flex items-center gap-3 flex-1 min-w-0"
        style={{ outline: 'none' }}
      >
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
          style={{ backgroundColor: 'var(--color-surface-hover)' }}
        >
          <Icon size={18} style={{ color: valueColor || 'var(--color-accent)' }} />
        </div>
        <div className="text-left">
          <div className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
            {label}
          </div>
          {sublabel && (
            <div className="text-xs" style={{ color: 'var(--color-text-dim)' }}>
              {sublabel}
            </div>
          )}
        </div>
      </button>
      <div className="flex items-center gap-2 shrink-0">
        {quickAction && (
          <button
            onClick={(e) => { e.stopPropagation(); quickAction(); }}
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: 'var(--color-green)' }}
            aria-label="Quick add"
          >
            <Plus size={14} color="#ffffff" />
          </button>
        )}
        <button onClick={onTap} className="flex items-center gap-2" style={{ outline: 'none' }}>
          <span className="text-lg font-bold" style={{ color: valueColor || 'var(--color-accent)' }}>
            {value}
          </span>
          <ChevronRight size={16} style={{ color: 'var(--color-text-dim)' }} />
        </button>
      </div>
    </div>
  );
}

/**
 * Inline quick-add form for protein — shows below the Protein stat card.
 */
function ProteinQuickAdd({ onAdd, onClose }) {
  const [grams, setGrams] = useState('');
  const [food, setFood] = useState('');
  const gramsRef = useRef(null);

  useEffect(() => {
    // Auto-focus the grams input when the form opens
    const timer = setTimeout(() => gramsRef.current?.focus(), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = () => {
    const g = parseInt(grams, 10);
    if (!g || g <= 0) return;
    onAdd({ grams: g, food: food.trim() });
    onClose();
  };

  return (
    <div
      className="rounded-xl mb-2 p-3 overflow-hidden"
      style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-green)' }}
    >
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs font-semibold" style={{ color: 'var(--color-green)' }}>
          Quick Add Protein
        </span>
      </div>
      <div className="flex items-center gap-2">
        <input
          ref={gramsRef}
          type="number"
          inputMode="numeric"
          placeholder="Grams"
          value={grams}
          onChange={(e) => setGrams(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit(); }}
          className="w-20 px-2 py-2 rounded-lg text-sm text-center"
          style={{
            backgroundColor: 'var(--color-surface-hover)',
            color: 'var(--color-text)',
            border: '1px solid var(--color-border)',
            outline: 'none',
          }}
        />
        <input
          type="text"
          placeholder="Food (optional)"
          value={food}
          onChange={(e) => setFood(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit(); }}
          className="flex-1 px-2 py-2 rounded-lg text-sm"
          style={{
            backgroundColor: 'var(--color-surface-hover)',
            color: 'var(--color-text)',
            border: '1px solid var(--color-border)',
            outline: 'none',
          }}
        />
        <button
          onClick={handleSubmit}
          className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
          style={{ backgroundColor: 'var(--color-green)' }}
          aria-label="Add protein"
        >
          <Check size={16} color="#ffffff" />
        </button>
        <button
          onClick={onClose}
          className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
          style={{ backgroundColor: 'var(--color-surface-hover)' }}
          aria-label="Cancel"
        >
          <X size={16} style={{ color: 'var(--color-text-muted)' }} />
        </button>
      </div>
    </div>
  );
}

/**
 * Full-screen detail overlay
 */
function DetailScreen({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 flex flex-col" style={{ backgroundColor: 'var(--color-bg)', zIndex: 10000 }}>
      <div
        className="flex items-center justify-between px-4 py-3 shrink-0"
        style={{
          borderBottom: '1px solid var(--color-border)',
          paddingTop: 'calc(12px + env(safe-area-inset-top))',
        }}
      >
        <span className="text-base font-bold" style={{ color: 'var(--color-text)' }}>
          {title}
        </span>
        <button onClick={onClose} className="p-1" aria-label="Close">
          <X size={20} style={{ color: 'var(--color-text-muted)' }} />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto px-3 py-3">
        {children}
      </div>
    </div>
  );
}

export default function StatsTab({
  workouts = [],
  proteinData = {},
  weightData = {},
  initialDetailView = null,
  onClearInitialView,
}) {
  const [detailView, setDetailView] = useState(initialDetailView); // null | 'running' | 'protein' | 'weight' | 'exercises'
  const [showProteinQuickAdd, setShowProteinQuickAdd] = useState(false);

  // Clear the initial view flag after opening so it doesn't re-trigger
  useEffect(() => {
    if (initialDetailView && onClearInitialView) {
      onClearInitialView();
    }
  }, [initialDetailView, onClearInitialView]);

  const hasWorkouts = workouts.filter(w => !w.isDayOff).length > 0;
  const hasAnyData = hasWorkouts || proteinData.todayTotal > 0 || weightData.latest;

  const exerciseCount = new Set(
    workouts.flatMap(w => w.isDayOff ? [] : w.exercises.map(e => e.name))
  ).size;

  if (!hasAnyData) {
    return (
      <div className="pt-2">
        <EmptyState
          icon={BarChart3}
          message="Log a few workouts to see your stats."
        />
      </div>
    );
  }

  return (
    <div className="pt-2 px-3 pb-4">
      {/* Weekly volume chart — always visible inline */}
      <VolumeChart workouts={workouts} />

      {/* Running summary card */}
      {workouts.some(w => w.isRun) && (
        <StatCard
          icon={Footprints}
          label="Running"
          value={`${workouts.filter(w => w.isRun).reduce((s, w) => s + (w.runDistance || 0), 0).toFixed(1)} mi`}
          valueColor="#f59e0b"
          sublabel="Total miles"
          onTap={() => setDetailView('running')}
        />
      )}

      {/* Protein summary card — with quick-add button */}
      <StatCard
        icon={Drumstick}
        label="Protein"
        value={`${proteinData.todayTotal || 0}g`}
        valueColor="var(--color-green)"
        sublabel="Today"
        onTap={() => setDetailView('protein')}
        quickAction={() => setShowProteinQuickAdd(prev => !prev)}
      />

      {/* Inline protein quick-add form */}
      {showProteinQuickAdd && (
        <ProteinQuickAdd
          onAdd={proteinData.addEntry}
          onClose={() => setShowProteinQuickAdd(false)}
        />
      )}

      {/* Weight summary card */}
      <StatCard
        icon={Scale}
        label="Body Weight"
        value={weightData.latest ? `${weightData.latest.weight} lbs` : '—'}
        valueColor="var(--color-accent)"
        sublabel={weightData.latest ? 'Latest' : 'No entries'}
        onTap={() => setDetailView('weight')}
      />

      {/* Exercise stats summary card */}
      <StatCard
        icon={Dumbbell}
        label="Exercises"
        value={exerciseCount}
        valueColor="var(--color-yellow)"
        sublabel={`${exerciseCount} unique tracked`}
        onTap={() => setDetailView('exercises')}
      />

      {/* Detail overlays */}
      {detailView === 'running' && (
        <DetailScreen title="Running" onClose={() => setDetailView(null)}>
          <RunningStats workouts={workouts} />
        </DetailScreen>
      )}

      {detailView === 'protein' && (
        <DetailScreen title="Protein Tracker" onClose={() => setDetailView(null)}>
          <ProteinTracker
            todayTotal={proteinData.todayTotal || 0}
            entriesByDate={proteinData.entriesByDate || []}
            onAdd={proteinData.addEntry}
            onUpdate={proteinData.updateEntry}
            onDelete={proteinData.deleteEntry}
          />
        </DetailScreen>
      )}

      {detailView === 'weight' && (
        <DetailScreen title="Body Weight" onClose={() => setDetailView(null)}>
          <WeightTracker
            entries={weightData.entries || []}
            latest={weightData.latest}
            onAdd={weightData.addEntry}
            onUpdate={weightData.updateEntry}
            onDelete={weightData.deleteEntry}
          />
        </DetailScreen>
      )}

      {detailView === 'exercises' && (
        <DetailScreen title="Exercise Stats" onClose={() => setDetailView(null)}>
          <ExerciseStats workouts={workouts} />
        </DetailScreen>
      )}
    </div>
  );
}
