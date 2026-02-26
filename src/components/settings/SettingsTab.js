'use client';

import { useTheme, THEMES } from '@/hooks/useTheme';
import { Check, Palette, Database, Dumbbell, BookOpen } from 'lucide-react';

function SettingsSection({ icon: Icon, title, children }) {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-3 px-1">
        <Icon size={16} style={{ color: 'var(--color-text-muted)' }} />
        <h3
          className="text-xs font-semibold uppercase tracking-wider"
          style={{ color: 'var(--color-text-muted)' }}
        >
          {title}
        </h3>
      </div>
      <div
        className="rounded-xl p-4"
        style={{ backgroundColor: 'var(--color-surface)' }}
      >
        {children}
      </div>
    </div>
  );
}

function ThemeOption({ themeId, themeName, isActive, onSelect }) {
  const previewColor = THEMES[themeId].colors['--color-accent'];
  return (
    <button
      onClick={() => onSelect(themeId)}
      className="flex items-center justify-between w-full py-2.5 px-1 transition-colors rounded"
    >
      <div className="flex items-center gap-3">
        <div
          className="w-5 h-5 rounded-full border-2"
          style={{
            backgroundColor: previewColor,
            borderColor: isActive ? previewColor : 'var(--color-border)',
          }}
        />
        <span
          className="text-sm font-medium"
          style={{ color: 'var(--color-text)' }}
        >
          {themeName}
        </span>
      </div>
      {isActive && (
        <Check size={18} style={{ color: 'var(--color-accent)' }} />
      )}
    </button>
  );
}

export default function SettingsTab() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="pt-2 px-4 pb-8">
      {/* Theme Picker */}
      <SettingsSection icon={Palette} title="Appearance">
        <div className="space-y-1">
          {Object.entries(THEMES).map(([id, { name }]) => (
            <ThemeOption
              key={id}
              themeId={id}
              themeName={name}
              isActive={theme === id}
              onSelect={setTheme}
            />
          ))}
        </div>
      </SettingsSection>

      {/* Workout Presets placeholder */}
      <SettingsSection icon={Dumbbell} title="Workout Presets">
        <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
          Preset management coming in Phase 6.
        </p>
      </SettingsSection>

      {/* Exercise Library placeholder */}
      <SettingsSection icon={BookOpen} title="Exercise Library">
        <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
          Exercise library coming in Phase 6.
        </p>
      </SettingsSection>

      {/* Data Management placeholder */}
      <SettingsSection icon={Database} title="Data Management">
        <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
          Export, import, and backup features coming in Phase 6.
        </p>
      </SettingsSection>
    </div>
  );
}
