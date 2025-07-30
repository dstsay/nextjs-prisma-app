import { parseTime } from './date-utils';

export function validateTimeSlot(startTime: string, duration: number): boolean {
  return duration === 60;
}

export function validateBookingTime(
  bookingTime: Date,
  minAdvanceHours: number = 1
): boolean {
  const now = new Date();
  const minBookingTime = new Date(now.getTime() + minAdvanceHours * 60 * 60 * 1000);
  return bookingTime >= minBookingTime;
}

export function validateTimeFormat(time: string): boolean {
  const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;
  return timeRegex.test(time);
}

export function validateTimeRange(startTime: string, endTime: string): boolean {
  if (!validateTimeFormat(startTime) || !validateTimeFormat(endTime)) {
    return false;
  }
  
  const start = parseTime(startTime);
  const end = parseTime(endTime);
  
  const startMinutes = start.hour * 60 + start.minute;
  const endMinutes = end.hour * 60 + end.minute;
  
  return endMinutes > startMinutes;
}

export interface BookingValidationResult {
  valid: boolean;
  error?: string;
}

export function validateBooking(
  date: Date,
  time: string,
  artistId: string,
  clientId: string
): BookingValidationResult {
  if (!artistId || !clientId) {
    return { valid: false, error: 'Artist and client IDs are required' };
  }
  
  if (!date || isNaN(date.getTime())) {
    return { valid: false, error: 'Invalid date' };
  }
  
  if (!validateTimeFormat(time)) {
    return { valid: false, error: 'Invalid time format' };
  }
  
  const bookingDateTime = new Date(date);
  const [hours, minutes] = time.split(':').map(Number);
  bookingDateTime.setHours(hours, minutes, 0, 0);
  
  if (!validateBookingTime(bookingDateTime)) {
    return { valid: false, error: 'Booking must be at least 1 hour in advance' };
  }
  
  return { valid: true };
}