import { Availability, AvailabilityException, Appointment } from '@prisma/client';
import { getDayOfWeek, isSameDay, parseTime, formatTime24, startOfDay, formatTime, formatDateForAPI } from './date-utils';

export interface TimeSlot {
  time: string;
  available: boolean;
  displayTime: string;
}

export interface AvailabilityData {
  regularSchedule: Availability[];
  exceptions: AvailabilityException[];
  appointments: Appointment[];
}

export function generateTimeSlots(
  startTime: string,
  endTime: string,
  intervalMinutes: number = 30
): string[] {
  const slots: string[] = [];
  const start = parseTime(startTime);
  const end = parseTime(endTime);
  
  let currentHour = start.hour;
  let currentMinute = start.minute;
  
  while (
    currentHour < end.hour ||
    (currentHour === end.hour && currentMinute < end.minute)
  ) {
    slots.push(formatTime24(currentHour, currentMinute));
    
    currentMinute += intervalMinutes;
    if (currentMinute >= 60) {
      currentHour += Math.floor(currentMinute / 60);
      currentMinute = currentMinute % 60;
    }
  }
  
  return slots;
}

export function getAvailableSlots(
  date: Date,
  availabilityData: AvailabilityData,
  clientTimezone: string = 'UTC',
  dateString?: string,
  artistTimezone: string = 'America/Los_Angeles'
): TimeSlot[] {
  const dayOfWeek = getDayOfWeek(date);
  const dateStart = startOfDay(date);
  const APPOINTMENT_DURATION_MINUTES = 60; // All appointments are 1 hour
  
  const exception = availabilityData.exceptions.find(exc =>
    isSameDay(new Date(exc.date), date)
  );
  
  if (exception?.type === 'UNAVAILABLE') {
    return [];
  }
  
  let daySchedule = availabilityData.regularSchedule.find(
    schedule => schedule.dayOfWeek === dayOfWeek && schedule.isActive
  );
  
  if (exception?.type === 'CUSTOM_HOURS' && exception.startTime && exception.endTime) {
    daySchedule = {
      ...daySchedule!,
      startTime: exception.startTime,
      endTime: exception.endTime
    };
  }
  
  if (!daySchedule) {
    return [];
  }
  
  const slots = generateTimeSlots(daySchedule.startTime, daySchedule.endTime);
  
  // Get all blocked time ranges from existing appointments
  const blockedTimeRanges = availabilityData.appointments
    .filter(apt => 
      isSameDay(new Date(apt.scheduledAt), date) &&
      apt.status !== 'CANCELLED'
    )
    .map(apt => {
      const aptDate = new Date(apt.scheduledAt);
      const aptHour = aptDate.getHours();
      const aptMinute = aptDate.getMinutes();
      
      // Calculate the range of slots that would conflict with this appointment
      // An appointment blocks its start time and any slot that would overlap
      const blockedSlots: string[] = [];
      
      // Block the appointment time itself
      blockedSlots.push(formatTime24(aptHour, aptMinute));
      
      // Block slots that would overlap if booked (30 minutes before)
      if (aptMinute >= 30) {
        blockedSlots.push(formatTime24(aptHour, aptMinute - 30));
      } else if (aptHour > 0) {
        blockedSlots.push(formatTime24(aptHour - 1, 30));
      }
      
      // Block slots within the appointment duration (30 minutes after start)
      if (aptMinute < 30) {
        blockedSlots.push(formatTime24(aptHour, aptMinute + 30));
      } else if (aptHour < 23) {
        blockedSlots.push(formatTime24(aptHour + 1, 0));
      }
      
      return blockedSlots;
    })
    .flat();
  
  // Check if we're looking at today's date in the client's timezone
  const now = new Date();
  
  // Get current date in client timezone as YYYY-MM-DD
  const getCurrentDateInTimezone = (tz: string) => {
    const options: Intl.DateTimeFormatOptions = {
      timeZone: tz,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    };
    // This returns MM/DD/YYYY format
    const parts = now.toLocaleDateString('en-US', options).split('/');
    // Convert to YYYY-MM-DD
    return `${parts[2]}-${parts[0].padStart(2, '0')}-${parts[1].padStart(2, '0')}`;
  };
  
  const nowDateStr = getCurrentDateInTimezone(clientTimezone);
  // Use the original date string if provided, otherwise fall back to date conversion
  const requestDateStr = dateString || formatDateForAPI(date);
  
  const isToday = nowDateStr === requestDateStr;
  
  // DEBUG: Enhanced logging for date comparison
  console.log('[availability-utils] Date comparison:', {
    dateParam: date.toISOString(),
    clientTimezone: clientTimezone,
    artistTimezone: artistTimezone,
    nowDateStr: nowDateStr,
    requestDateStr: requestDateStr,
    isToday: isToday,
    serverTime: now.toISOString()
  });
  
  // DEBUG: Log current time and date being checked
  if (isToday) {
    console.log('[availability-utils] Checking slots for today:', {
      currentTime: now.toLocaleTimeString(),
      currentHour: now.getHours(),
      currentMinute: now.getMinutes(),
      dateChecking: date.toDateString()
    });
  }
  
  return slots.map(slot => {
    // Check if slot is blocked by existing appointments
    const isBlocked = blockedTimeRanges.includes(slot);
    
    // Check if slot is in the past (only for today)
    let isPast = false;
    if (isToday) {
      const [slotHour, slotMinute] = slot.split(':').map(Number);
      
      // The slot times (like "09:00") are in the artist's timezone
      // We need to check if this slot is in the past
      
      // Create a Date object for the slot in the artist's timezone
      const slotDateTime = new Date(date);
      slotDateTime.setHours(slotHour, slotMinute, 0, 0);
      
      // Get current time to compare
      // Since we're comparing absolute times, we can just use UTC comparison
      isPast = slotDateTime.getTime() <= now.getTime();
      
      // Add a buffer of 30 minutes to allow for booking preparation time
      const bufferTime = 30 * 60 * 1000; // 30 minutes in milliseconds
      isPast = slotDateTime.getTime() <= (now.getTime() + bufferTime);
      
      // DEBUG: Log first few slots and last few slots
      const slotIndex = slots.indexOf(slot);
      if (slotIndex < 3 || slotIndex >= slots.length - 3) {
        console.log(`[availability-utils] Slot ${slot}:`, {
          slotDateTime: slotDateTime.toISOString(),
          currentTime: now.toISOString(),
          timeDiff: Math.round((slotDateTime.getTime() - now.getTime()) / 60000) + ' minutes',
          isPast,
          isBlocked,
          available: !isBlocked && !isPast
        });
      }
    }
    
    return {
      time: slot,
      available: !isBlocked && !isPast,
      displayTime: formatTime(slot)
    };
  });
}

export function checkSlotAvailable(
  date: Date,
  time: string,
  availabilityData: AvailabilityData,
  clientTimezone: string = 'UTC',
  dateString?: string
): boolean {
  const slots = getAvailableSlots(date, availabilityData, clientTimezone, dateString);
  const slot = slots.find(s => s.time === time);
  return slot?.available || false;
}

export function applyExceptions(
  regularSchedule: Availability[],
  exceptions: AvailabilityException[],
  date: Date
): { startTime: string; endTime: string } | null {
  const dayOfWeek = getDayOfWeek(date);
  const exception = exceptions.find(exc => isSameDay(new Date(exc.date), date));
  
  if (exception?.type === 'UNAVAILABLE') {
    return null;
  }
  
  const daySchedule = regularSchedule.find(
    schedule => schedule.dayOfWeek === dayOfWeek && schedule.isActive
  );
  
  if (!daySchedule) {
    return null;
  }
  
  if (exception?.type === 'CUSTOM_HOURS' && exception.startTime && exception.endTime) {
    return {
      startTime: exception.startTime,
      endTime: exception.endTime
    };
  }
  
  return {
    startTime: daySchedule.startTime,
    endTime: daySchedule.endTime
  };
}

export function getAvailableDatesInRange(
  startDate: Date,
  endDate: Date,
  availabilityData: AvailabilityData
): Date[] {
  const availableDates: Date[] = [];
  const current = new Date(startDate);
  
  while (current <= endDate) {
    const dayOfWeek = getDayOfWeek(current);
    const hasRegularSchedule = availabilityData.regularSchedule.some(
      schedule => schedule.dayOfWeek === dayOfWeek && schedule.isActive
    );
    
    const exception = availabilityData.exceptions.find(exc =>
      isSameDay(new Date(exc.date), current)
    );
    
    if (
      (hasRegularSchedule && exception?.type !== 'UNAVAILABLE') ||
      exception?.type === 'CUSTOM_HOURS'
    ) {
      availableDates.push(new Date(current));
    }
    
    current.setDate(current.getDate() + 1);
  }
  
  return availableDates;
}