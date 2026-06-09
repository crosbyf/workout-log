'use client';

import { useState, useCallback, useEffect } from 'react';
import { getItem, setItem } from '@/utils/storage';
import { fetchSettings, upsertSetting, upsertAllSettings } from '@/lib/sync';

const SETTINGS_KEY = 'app-settings';

const DEFAULTS = {
  progressUI: false,
};

/**
 * The settings table also holds system rows (deleted-workout tombstones,
 * diagnostic test rows). Keep those OUT of app-settings state so they are
 * never re-pushed stale by "first sync" or force-push, which could
 * clobber the authoritative tombstone list.
 */
function filterAppSettings(remote) {
  const out = {};
  for (const [key, value] of Object.entries(remote)) {
    if (key === 'deleted_workout_ids' || key.startsWith('diag_')) continue;
    out[key] = value;
  }
  return out;
}

export function useSettings() {
  const [settings, setSettingsState] = useState(() => {
    const saved = getItem(SETTINGS_KEY, {});
    return { ...DEFAULTS, ...saved };
  });

  // Hydrate from Supabase on mount
  useEffect(() => {
    let cancelled = false;
    fetchSettings().then(remote => {
      if (cancelled || !remote) return;
      const appRemote = filterAppSettings(remote);
      if (Object.keys(appRemote).length > 0) {
        const merged = { ...DEFAULTS, ...appRemote };
        setSettingsState(merged);
        setItem(SETTINGS_KEY, merged);
      } else {
        // Push local settings to Supabase (first sync)
        upsertAllSettings(settings);
      }
    });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateSetting = useCallback((key, value) => {
    setSettingsState(prev => {
      const next = { ...prev, [key]: value };
      setItem(SETTINGS_KEY, next);
      upsertSetting(key, value);
      return next;
    });
  }, []);

  return { settings, updateSetting };
}
