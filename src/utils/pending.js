/**
 * Pending-sync tracking.
 *
 * Tracks IDs whose latest local change has NOT yet been confirmed by Supabase.
 * While an ID is pending, the LOCAL version wins during hydrate merges
 * (instead of the default "remote wins"), and the item is re-pushed.
 * IDs are removed only after a successful upsert.
 *
 * This prevents offline/failed edits from being silently reverted by
 * stale remote data on the next app launch.
 */

import { getItem, setItem } from '@/utils/storage';

export function getPendingIds(key) {
  return new Set(getItem(key, []));
}

export function addPendingIds(key, ids) {
  if (!ids.length) return;
  const set = getPendingIds(key);
  for (const id of ids) set.add(id);
  setItem(key, [...set]);
}

export function removePendingIds(key, ids) {
  if (!ids.length) return;
  const set = getPendingIds(key);
  for (const id of ids) set.delete(id);
  setItem(key, [...set]);
}
