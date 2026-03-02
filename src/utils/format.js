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

/**
 * Get ISO week key for grouping workouts (Mon-Sun weeks)
 * Returns "YYYY-WNN" format, e.g. "2026-W09"
 */
export function getWeekKey(dateStr) {
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  // Shift so Monday = 0
  const dayOfWeek = (date.getDay() + 6) % 7;
  // Find the Thursday of this ISO week
  const thursday = new Date(date);
  thursday.setDate(date.getDate() - dayOfWeek + 3);
  // ISO year is the year of that Thursday
  const isoYear = thursday.getFullYear();
  // Jan 4 is always in week 1
  const jan4 = new Date(isoYear, 0, 4);
  const jan4DayOfWeek = (jan4.getDay() + 6) % 7;
  const startOfWeek1 = new Date(jan4);
  startOfWeek1.setDate(jan4.getDate() - jan4DayOfWeek);
  const weekNum = Math.round((thursday - startOfWeek1) / (7 * 24 * 60 * 60 * 1000)) + 1;
  return `${isoYear}-W${String(weekNum).padStart(2, '0')}`;
}

/**
 * Get a human-readable week label
 * Returns "THIS WEEK", "LAST WEEK", or "Week of Jan 15"
 */
/**
 * Get the Monday date string (YYYY-MM-DD) for the week containing dateStr
 */
export function getMondayStr(dateStr) {
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  const dayOfWeek = (date.getDay() + 6) % 7; // Mon=0
  const monday = new Date(date);
  monday.setDate(date.getDate() - dayOfWeek);
  const y = monday.getFullYear();
  const m = String(monday.getMonth() + 1).padStart(2, '0');
  const d = String(monday.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Get the Mon–Sun date range string for a week, e.g. "Feb 24 – Mar 2"
 */
function getWeekRange(dateStr) {
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  const dayOfWeek = (date.getDay() + 6) % 7; // Mon=0
  const monday = new Date(date);
  monday.setDate(date.getDate() - dayOfWeek);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  const monMonth = MONTHS_SHORT[monday.getMonth()];
  const sunMonth = MONTHS_SHORT[sunday.getMonth()];

  if (monMonth === sunMonth) {
    return `${monMonth} ${monday.getDate()} – ${sunday.getDate()}`;
  }
  return `${monMonth} ${monday.getDate()} – ${sunMonth} ${sunday.getDate()}`;
}

export function getWeekLabel(dateStr) {
  const todayKey = getWeekKey(getTodayStr());
  const weekKey = getWeekKey(dateStr);
  const range = getWeekRange(dateStr);

  if (weekKey === todayKey) return `THIS WEEK \u00b7 ${range}`;

  // Calculate last week's key
  const today = new Date();
  const lastWeekDate = new Date(today);
  lastWeekDate.setDate(today.getDate() - 7);
  const lastWeekStr = `${lastWeekDate.getFullYear()}-${String(lastWeekDate.getMonth() + 1).padStart(2, '0')}-${String(lastWeekDate.getDate()).padStart(2, '0')}`;
  const lastWeekKey = getWeekKey(lastWeekStr);

  if (weekKey === lastWeekKey) return `LAST WEEK \u00b7 ${range}`;

  return range.toUpperCase();
}
