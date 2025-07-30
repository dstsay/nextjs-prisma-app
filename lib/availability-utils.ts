import { Availability, AvailabilityException, Appointment } from '@prisma/client';
import { getDayOfWeek, isSameDay, parseTime, formatTime24, startOfDay, formatTime } from './date-utils';

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
  intervalMinutes: number = 60
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
  availabilityData: AvailabilityData
): TimeSlot[] {
  const dayOfWeek = getDayOfWeek(date);
  const dateStart = startOfDay(date);
  
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
  
  const bookedSlots = availabilityData.appointments
    .filter(apt => 
      isSameDay(new Date(apt.scheduledAt), date) &&
      apt.status !== 'CANCELLED'
    )
    .map(apt => {
      const aptDate = new Date(apt.scheduledAt);
      return formatTime24(aptDate.getHours(), aptDate.getMinutes());
    });
  
  return slots.map(slot => ({
    time: slot,
    available: !bookedSlots.includes(slot),
    displayTime: formatTime(slot)
  }));
}

export function checkSlotAvailable(
  date: Date,
  time: string,
  availabilityData: AvailabilityData
): boolean {
  const slots = getAvailableSlots(date, availabilityData);
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