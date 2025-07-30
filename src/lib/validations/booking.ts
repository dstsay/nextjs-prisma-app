import { z } from 'zod';

export const appointmentSchema = z.object({
  artistId: z.string().min(1, 'Artist ID is required'),
  date: z.string().refine((date) => {
    const parsed = Date.parse(date);
    return !isNaN(parsed) && new Date(date) >= new Date();
  }, 'Invalid date or date is in the past'),
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)'),
  endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)'),
  service: z.string().min(1, 'Service is required'),
  location: z.string().min(1, 'Location is required'),
  notes: z.string().optional()
}).refine(data => {
  const [startHour, startMin] = data.startTime.split(':').map(Number);
  const [endHour, endMin] = data.endTime.split(':').map(Number);
  const startMinutes = startHour * 60 + startMin;
  const endMinutes = endHour * 60 + endMin;
  return endMinutes > startMinutes;
}, {
  message: "End time must be after start time",
  path: ["endTime"]
});

export const appointmentStatusSchema = z.object({
  appointmentId: z.string().min(1, 'Appointment ID is required'),
  status: z.enum(['confirmed', 'cancelled', 'completed', 'no_show']),
  reason: z.string().optional()
});

export const availabilityExceptionSchema = z.object({
  date: z.string().refine((date) => {
    const parsed = Date.parse(date);
    return !isNaN(parsed);
  }, 'Invalid date'),
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)').optional(),
  endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)').optional(),
  isUnavailable: z.boolean(),
  reason: z.string().optional()
}).refine(data => {
  if (data.startTime && data.endTime) {
    const [startHour, startMin] = data.startTime.split(':').map(Number);
    const [endHour, endMin] = data.endTime.split(':').map(Number);
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;
    return endMinutes > startMinutes;
  }
  return true;
}, {
  message: "End time must be after start time",
  path: ["endTime"]
});