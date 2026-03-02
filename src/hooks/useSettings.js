'use client';

import { useState, useCallback, useEffect } from 'react';
import { getItem, setItem } from '@/utils/storage';
import { fetchSettings, upsertSetting, upsertAllSettings } from '@/lib/sync';

const SETTINGS_KEY = 'app-settings';

const DEFAULTS = {
  progressUI: false,
};

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
      if (Object.keys(remote).length > 0) {
        const merged = { ...DEFAULTS, ...remote };
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
