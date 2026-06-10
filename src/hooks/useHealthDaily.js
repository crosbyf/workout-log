'use client';

import { useState, useMemo, useEffect } from 'react';
import { getItem, setItem } from '@/utils/storage';
import { fetchHealthDaily } from '@/lib/sync';

const HEALTH_KEY = 'health_daily';

/** True when a day has at least one non-null metric beyond its date. */
function hasAnyData(day) {
  return Object.entries(day).some(([key, value]) => key !== 'date' && value != null);
}

/**
 * Read-only Apple Health daily metrics (resting HR, HRV, sleep stages).
 * Data flows one way: Supabase → localStorage cache → state. There is no
 * add/update/delete — the health_daily table is written by an external sync.
 * If the table doesn't exist yet, fetchHealthDaily() returns null and we
 * silently keep whatever (possibly empty) cache we have.
 */
export function useHealthDaily() {
  const [days, setDays] = useState(() => getItem(HEALTH_KEY, []));

  // Hydrate from Supabase on mount
  useEffect(() => {
    let cancelled = false;
    fetchHealthDaily().then(remote => {
      if (cancelled || !remote) return;
      setDays(remote);
      setItem(HEALTH_KEY, remote);
    });
    return () => { cancelled = true; };
  }, []);

  // Most recent day that has any metric at all (days are sorted date-desc)
  const latest = useMemo(() => {
    return days.find(hasAnyData) || null;
  }, [days]);

  return { days, latest };
}
