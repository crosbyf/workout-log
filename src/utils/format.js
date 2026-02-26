/**
 * Formatting helpers for dates, times, and numbers
 */

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const DAYS_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/**
 * Format a date string (YYYY-MM-DD) to display format
 * e.g., "Mon 01/28/26"
 */
export function formatDate(dateStr) {
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  const dayName = DAYS_SHORT[date.getDay()];
  const m = String(month).padStart(2, '0');
  const d = String(day).padStart(2, '0');
  const y = String(year).slice(-2);
  return `${dayName} ${m}/${d}/${y}`;
}

/**
 * Format a date string to full day name
 * e.g., "Wednesday, 02/11/26"
 */
export function formatDateFull(dateStr) {
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  const dayName = DAYS[date.getDay()];
  const m = String(month).padStart(2, '0');
  const d = String(day).padStart(2, '0');
  const y = String(year).slice(-2);
  return `${dayName}, ${m}/${d}/${y}`;
}

/**
 * Format elapsed seconds to HH:MM:SS or MM:SS
 */
export function formatDuration(totalSeconds) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const mm = String(minutes).padStart(2, '0');
  const ss = String(seconds).padStart(2, '0');
  if (hours > 0) {
    return `${String(hours).padStart(2, '0')}:${mm}:${ss}`;
  }
  return `${mm}:${ss}`;
}

/**
 * Get today's date as YYYY-MM-DD
 */
export function getTodayStr() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Get the day of week name from a date string
 */
export function getDayOfWeek(dateStr) {
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return DAYS[date.getDay()];
}

/**
 * Get short month name from date string
 */
export function getMonthShort(dateStr) {
  const month = parseInt(dateStr.split('-')[1], 10);
  return MONTHS_SHORT[month - 1];
}
