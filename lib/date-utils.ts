export function formatTime(time: string): string {
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'pm' : 'am';
  const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return `${hour12}:${minutes}${ampm}`;
}

export function formatTime24(hour: number, minute: number = 0): string {
  return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
}

export function parseTime(time: string): { hour: number; minute: number } {
  const [hours, minutes] = time.split(':').map(Number);
  return { hour: hours, minute: minutes };
}

export function getDayOfWeek(date: Date): number {
  return date.getDay();
}

export function getDateRange(startDate: Date, days: number): Date[] {
  const dates: Date[] = [];
  const current = new Date(startDate);
  
  for (let i = 0; i < days; i++) {
    dates.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }
  
  return dates;
}

export function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

export function startOfDay(date: Date): Date {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
}

export function addHours(date: Date, hours: number): Date {
  const result = new Date(date);
  result.setHours(result.getHours() + hours);
  return result;
}

export function getMonthName(monthIndex: number): string {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return months[monthIndex];
}

export function getDayName(dayIndex: number): string {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[dayIndex];
}

export function getShortDayName(dayIndex: number): string {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return days[dayIndex];
}

export function formatDuration(totalMinutes: number): string {
  if (totalMinutes <= 0) return '0 minutes';
  
  const days = Math.floor(totalMinutes / (24 * 60));
  const hours = Math.floor((totalMinutes % (24 * 60)) / 60);
  const minutes = totalMinutes % 60;
  
  const parts: string[] = [];
  
  if (days > 0) {
    parts.push(`${days} day${days !== 1 ? 's' : ''}`);
  }
  
  if (hours > 0) {
    parts.push(`${hours} hour${hours !== 1 ? 's' : ''}`);
  }
  
  if (minutes > 0) {
    parts.push(`${minutes} minute${minutes !== 1 ? 's' : ''}`);
  }
  
  // Join with commas and 'and' for the last item
  if (parts.length === 1) {
    return parts[0];
  } else if (parts.length === 2) {
    return parts.join(' and ');
  } else {
    const lastPart = parts.pop();
    return `${parts.join(', ')} and ${lastPart}`;
  }
}