import { z } from 'zod';

export const timeFormatRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;

export const availabilitySlotSchema = z.object({
  id: z.string().optional(),
  dayOfWeek: z.number().min(0).max(6),
  startTime: z.string().regex(timeFormatRegex, 'Invalid time format (HH:MM)'),
  endTime: z.string().regex(timeFormatRegex, 'Invalid time format (HH:MM)'),
  isActive: z.boolean().optional().default(true)
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

export const availabilityScheduleSchema = z.object({
  schedule: z.array(availabilitySlotSchema).min(1)
});

export const availabilityUpdateSchema = z.object({
  id: z.string(),
  dayOfWeek: z.number().min(0).max(6).optional(),
  startTime: z.string().regex(timeFormatRegex, 'Invalid time format (HH:MM)').optional(),
  endTime: z.string().regex(timeFormatRegex, 'Invalid time format (HH:MM)').optional(),
  isActive: z.boolean().optional()
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