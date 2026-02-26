/**
 * localStorage helpers with gorslog_ namespace
 */

const PREFIX = 'gorslog_';

export function getItem(key, fallback = null) {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(PREFIX + key);
    if (raw === null) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export function setItem(key, value) {
  if (typeof window === 'undefined') return false;
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
    return true;
  } catch (err) {
    if (err.name === 'QuotaExceededError' || err.code === 22) {
      console.error('localStorage quota exceeded');
    }
    return false;
  }
}

export function removeItem(key) {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(PREFIX + key);
}

/**
 * Returns approximate localStorage usage in bytes for gorslog_ keys
 */
export function getStorageUsage() {
  if (typeof window === 'undefined') return 0;
  let total = 0;
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(PREFIX)) {
      total += key.length + (localStorage.getItem(key)?.length || 0);
    }
  }
  return total * 2; // UTF-16 = 2 bytes per char
}
