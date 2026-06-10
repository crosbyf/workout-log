/**
 * Google Sheet push sync.
 *
 * Strength workouts and day-offs are queued locally on save, then POSTed to
 * an Apps Script web app that writes them into the user's Google Sheet in
 * its existing format. Queue survives offline saves and app restarts; the
 * sheet-side script dedupes by workout id, so retries can never duplicate.
 *
 * The webhook URL (including its ?key= secret) lives in app settings
 * ('sheetWebhookUrl'); an empty value disables the feature entirely.
 */

import { getItem, setItem } from '@/utils/storage';

const QUEUE_KEY = 'sheet_queue';

export function queueForSheet(workout) {
  if (!workout || !workout.id) return;
  const q = getItem(QUEUE_KEY, []);
  if (!q.some(w => w.id === workout.id)) {
    q.push(workout);
    setItem(QUEUE_KEY, q);
  }
}

export async function flushSheetQueue(webhookUrl) {
  if (!webhookUrl) return;
  const q = getItem(QUEUE_KEY, []);
  if (q.length === 0) return;
  try {
    const res = await fetch(webhookUrl, {
      method: 'POST',
      // text/plain keeps this a "simple" cross-origin request — Apps Script
      // web apps can't answer the preflight a JSON content-type would trigger
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ workouts: q }),
    });
    const data = await res.json().catch(() => null);
    if (res.ok && data && data.ok) {
      setItem(QUEUE_KEY, []);
    } else {
      console.error('flushSheetQueue: sheet rejected payload', data);
    }
  } catch (err) {
    // Stays queued; retried on next save or next app launch
    console.error('flushSheetQueue:', err);
  }
}
