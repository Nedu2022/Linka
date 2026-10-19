const DAY = 24 * 60 * 60 * 1000;

function startOfDay(time: number) {
  const date = new Date(time);
  date.setHours(0, 0, 0, 0);
  return date.getTime();
}

/** "Today", "Yesterday", or "Earlier" — for grouping lists by day. */
export function dayGroup(time: number, now = Date.now()) {
  const today = startOfDay(now);
  if (time >= today) return 'Today';
  if (time >= today - DAY) return 'Yesterday';
  return 'Earlier';
}

export function formatClock(time: number) {
  const date = new Date(time);
  const hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours % 12 || 12}:${minutes} ${hours < 12 ? 'AM' : 'PM'}`;
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function formatDate(time: number) {
  const date = new Date(time);
  return `${date.getDate()} ${MONTHS[date.getMonth()]}`;
}

/** Short time for list rows: "10:24 AM" today, "Yesterday", or "12 Oct". */
export function formatListTime(time: number, now = Date.now()) {
  const group = dayGroup(time, now);
  if (group === 'Today') return formatClock(time);
  if (group === 'Yesterday') return 'Yesterday';
  return formatDate(time);
}

/** Full timestamp for detail screens: "Today, 10:24 AM" or "12 Oct, 9:02 AM". */
export function formatTimestamp(time: number, now = Date.now()) {
  const group = dayGroup(time, now);
  const day = group === 'Earlier' ? formatDate(time) : group;
  return `${day}, ${formatClock(time)}`;
}

/** Relative age for notifications: "Just now", "25m", "3h", "Yesterday", "12 Oct". */
export function formatAge(time: number, now = Date.now()) {
  const minutes = Math.floor((now - time) / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m`;
  if (dayGroup(time, now) === 'Today') return `${Math.floor(minutes / 60)}h`;
  return formatListTime(time, now);
}
