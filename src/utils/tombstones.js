/**
 * Tombstone tracking for deleted record IDs.
 *
 * Deleted IDs are stored in BOTH localStorage (fast) and a Supabase settings
 * row (durable), as { updatedAt, ids }. The newest list wins when local and
 * remote disagree (last-write-wins), which lets explicit restores (JSON
 * import) clear tombstones without a stale device re-deleting the data.
 * Two legacy plain-array lists (no timestamp) are unioned for backward
 * compatibility.
 *
 * Used by useWorkouts, useProtein, and useWeight to stop deleted records
 * from being resurrected by stale localStorage or failed remote deletes.
 */

import { getItem, setItem } from '@/utils/storage';
import { upsertSetting, fetchSettings } from '@/lib/sync';

export function createTombstoneStore(localKey, settingKey) {
  function parse(raw) {
    if (Array.isArray(raw)) return { updatedAt: 0, ids: raw };
    if (raw && Array.isArray(raw.ids)) return { updatedAt: raw.updatedAt || 0, ids: raw.ids };
    return { updatedAt: 0, ids: [] };
  }

  function load() {
    return parse(getItem(localKey, []));
  }

  function save(meta) {
    setItem(localKey, meta);
    // Also persist to Supabase so it survives localStorage wipes
    upsertSetting(settingKey, JSON.stringify(meta));
  }

  return {
    /** Add IDs to the tombstone list (single write + single push). */
    add(idsToAdd) {
      if (!idsToAdd.length) return;
      const meta = load();
      const set = new Set(meta.ids);
      for (const id of idsToAdd) set.add(id);
      save({ updatedAt: Date.now(), ids: [...set] });
    },

    /**
     * Remove IDs from the tombstone list. Used ONLY for explicit restores
     * (JSON import), where the user clearly wants the records to exist again.
     */
    remove(idsToRemove) {
      if (!idsToRemove.length) return;
      const meta = load();
      const drop = new Set(idsToRemove);
      const ids = meta.ids.filter(id => !drop.has(id));
      save({ updatedAt: Date.now(), ids });
    },

    /**
     * Fetch the remote list and reconcile with local (newest wins).
     * Returns the reconciled Set of deleted IDs.
     */
    async fetchAndMerge() {
      const local = load();
      let remote = null;
      try {
        const settings = await fetchSettings();
        if (settings && settings[settingKey] !== undefined) {
          let val = settings[settingKey];
          // Handle both jsonb (already parsed) and text (needs parsing)
          if (typeof val === 'string') {
            try { val = JSON.parse(val); } catch { val = null; }
          }
          if (val !== null && val !== undefined) remote = parse(val);
        }
      } catch {}
      let merged;
      if (!remote) {
        merged = local;
      } else if (local.updatedAt === 0 && remote.updatedAt === 0) {
        merged = { updatedAt: 0, ids: [...new Set([...local.ids, ...remote.ids])] };
      } else {
        merged = remote.updatedAt >= local.updatedAt ? remote : local;
      }
      setItem(localKey, merged);
      return new Set(merged.ids);
    },
  };
}
