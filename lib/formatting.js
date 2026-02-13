export function getTodayDate() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

export function formatTime(seconds) {
  if (!seconds || seconds < 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${String(secs).padStart(2, '0')}`;
}

export function formatTimeHHMMSS(seconds) {
  if (!seconds) return null;
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export function parseDate(str) {
  if (!str) return '';
  const parts = str.split('-');
  if (parts.length === 3) {
    const [month, day, year] = parts;
    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  }
  return str;
}

export function formatDateShort(dateStr) {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-');
  const date = new Date(year, parseInt(month) - 1, parseInt(day));
  const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
  const shortYear = year.slice(-2);
  return `${dayName} ${parseInt(month)}/${parseInt(day)}/${shortYear}`;
}

export function formatDateLong(dateStr) {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-');
  const date = new Date(year, parseInt(month) - 1, parseInt(day));
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function getWeekKey(dateStr) {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-');
  const date = new Date(year, parseInt(month) - 1, parseInt(day));
  const dayOfWeek = date.getDay();
  const diff = date.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
  const monday = new Date(date.setDate(diff));
  const mondayYear = monday.getFullYear();
  const mondayMonth = String(monday.getMonth() + 1).padStart(2, '0');
  const mondayDay = String(monday.getDate()).padStart(2, '0');
  return `${mondayYear}-${mondayMonth}-${mondayDay}`;
}

export function getWeekLabel(mondayStr) {
  if (!mondayStr) return '';
  const today = getTodayDate();
  const currentWeekMonday = getWeekKey(today);
  if (mondayStr === currentWeekMonday) {
    return 'THIS WEEK';
  }
  const currentDate = new Date(currentWeekMonday);
  const comparisonDate = new Date(mondayStr);
  const diffTime = currentDate.getTime() - comparisonDate.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  if (diffDays === 7) {
    return 'LAST WEEK';
  }
  const [year, month, day] = mondayStr.split('-');
  const startDate = new Date(year, parseInt(month) - 1, parseInt(day));
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + 6);
  const monthName = startDate.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
  const startDay = parseInt(day);
  const endDay = endDate.getDate();
  return `${monthName} ${startDay}-${endDay}`;
}
