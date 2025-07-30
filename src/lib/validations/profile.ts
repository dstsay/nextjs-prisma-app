import { z } from 'zod';

export const artistProfileSchema = z.object({
  bio: z.string().max(1000, 'Bio must be less than 1000 characters').optional(),
  specialties: z.array(z.string()).optional(),
  yearsExperience: z.number().min(0).max(50).optional(),
  location: z.string().max(100).optional(),
  hourlyRate: z.number().min(0).max(10000).optional(),
  isAvailable: z.boolean().optional()
});

export const clientProfileSchema = z.object({
  firstName: z.string().min(1).max(50).optional(),
  lastName: z.string().min(1).max(50).optional(),
  phone: z.string().regex(/^\+?[\d\s-()]+$/, 'Invalid phone number').optional(),
  email: z.string().email('Invalid email address').optional()
});

export const uploadImageSchema = z.object({
  purpose: z.enum(['profile', 'portfolio']),
  index: z.number().min(0).max(10).optional()
});

export const portfolioImageSchema = z.object({
  action: z.enum(['add', 'remove', 'reorder']),
  imageUrl: z.string().url().optional(),
  index: z.number().min(0).max(10).optional(),
  newOrder: z.array(z.number()).optional()
});