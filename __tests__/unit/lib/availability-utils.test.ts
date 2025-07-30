import {
  generateTimeSlots,
  getAvailableSlots,
  checkSlotAvailable,
  applyExceptions,
  getAvailableDatesInRange,
  AvailabilityData
} from '../../../lib/availability-utils';
import { Availability, AvailabilityException, Appointment } from '@prisma/client';

describe('availability-utils', () => {
  describe('generateTimeSlots', () => {
    it('should generate hourly slots correctly', () => {
      const slots = generateTimeSlots('09:00', '12:00');
      expect(slots).toEqual(['09:00', '10:00', '11:00']);
    });

    it('should handle same start and end time', () => {
      const slots = generateTimeSlots('09:00', '09:00');
      expect(slots).toEqual([]);
    });

    it('should generate slots across many hours', () => {
      const slots = generateTimeSlots('09:00', '17:00');
      expect(slots).toHaveLength(8);
      expect(slots[0]).toBe('09:00');
      expect(slots[7]).toBe('16:00');
    });

    it('should handle overnight slots', () => {
      const slots = generateTimeSlots('22:00', '23:00');
      expect(slots).toEqual(['22:00']);
    });
  });

  describe('getAvailableSlots', () => {
    const mockAvailability: Availability[] = [
      {
        id: '1',
        artistId: 'artist1',
        dayOfWeek: 1, // Monday
        startTime: '09:00',
        endTime: '17:00',
        isActive: true
      }
    ];

    const mockExceptions: AvailabilityException[] = [];
    const mockAppointments: Appointment[] = [];

    it('should return slots for available day', () => {
      const monday = new Date('2025-02-03T10:00:00'); // Monday
      const availabilityData: AvailabilityData = {
        regularSchedule: mockAvailability,
        exceptions: mockExceptions,
        appointments: mockAppointments
      };

      const slots = getAvailableSlots(monday, availabilityData);
      
      expect(slots).toHaveLength(8);
      expect(slots[0]).toEqual({
        time: '09:00',
        available: true,
        displayTime: '9:00am'
      });
      expect(slots[7]).toEqual({
        time: '16:00',
        available: true,
        displayTime: '4:00pm'
      });
    });

    it('should return empty array for unavailable day', () => {
      const sunday = new Date('2025-02-02T10:00:00'); // Sunday
      const availabilityData: AvailabilityData = {
        regularSchedule: mockAvailability,
        exceptions: mockExceptions,
        appointments: mockAppointments
      };

      const slots = getAvailableSlots(sunday, availabilityData);
      expect(slots).toEqual([]);
    });

    it('should handle unavailable exception', () => {
      const monday = new Date('2025-02-03T10:00:00');
      const exceptionsWithUnavailable: AvailabilityException[] = [
        {
          id: '1',
          artistId: 'artist1',
          date: monday,
          type: 'UNAVAILABLE',
          startTime: null,
          endTime: null,
          reason: 'Holiday',
          createdAt: new Date()
        }
      ];

      const availabilityData: AvailabilityData = {
        regularSchedule: mockAvailability,
        exceptions: exceptionsWithUnavailable,
        appointments: mockAppointments
      };

      const slots = getAvailableSlots(monday, availabilityData);
      expect(slots).toEqual([]);
    });

    it('should handle custom hours exception', () => {
      const monday = new Date('2025-02-03T10:00:00');
      const exceptionsWithCustom: AvailabilityException[] = [
        {
          id: '1',
          artistId: 'artist1',
          date: monday,
          type: 'CUSTOM_HOURS',
          startTime: '10:00',
          endTime: '14:00',
          reason: null,
          createdAt: new Date()
        }
      ];

      const availabilityData: AvailabilityData = {
        regularSchedule: mockAvailability,
        exceptions: exceptionsWithCustom,
        appointments: mockAppointments
      };

      const slots = getAvailableSlots(monday, availabilityData);
      expect(slots).toHaveLength(4);
      expect(slots[0].time).toBe('10:00');
      expect(slots[3].time).toBe('13:00');
    });

    it('should mark booked slots as unavailable', () => {
      const monday = new Date('2025-02-03T10:00:00');
      const appointmentsWithBooking: Appointment[] = [
        {
          id: '1',
          clientId: 'client1',
          artistId: 'artist1',
          scheduledAt: new Date('2025-02-03T10:00:00'),
          duration: 60,
          status: 'CONFIRMED',
          type: 'CONSULTATION',
          notes: null,
          cancelReason: null,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      const availabilityData: AvailabilityData = {
        regularSchedule: mockAvailability,
        exceptions: mockExceptions,
        appointments: appointmentsWithBooking
      };

      const slots = getAvailableSlots(monday, availabilityData);
      const bookedSlot = slots.find(s => s.time === '10:00');
      const availableSlot = slots.find(s => s.time === '11:00');

      expect(bookedSlot?.available).toBe(false);
      expect(availableSlot?.available).toBe(true);
    });
  });

  describe('checkSlotAvailable', () => {
    it('should return true for available slot', () => {
      const monday = new Date('2025-02-03T10:00:00');
      const availabilityData: AvailabilityData = {
        regularSchedule: [
          {
            id: '1',
            artistId: 'artist1',
            dayOfWeek: 1,
            startTime: '09:00',
            endTime: '17:00',
            isActive: true
          }
        ],
        exceptions: [],
        appointments: []
      };

      expect(checkSlotAvailable(monday, '10:00', availabilityData)).toBe(true);
    });

    it('should return false for unavailable slot', () => {
      const monday = new Date('2025-02-03T10:00:00');
      const availabilityData: AvailabilityData = {
        regularSchedule: [
          {
            id: '1',
            artistId: 'artist1',
            dayOfWeek: 1,
            startTime: '09:00',
            endTime: '17:00',
            isActive: true
          }
        ],
        exceptions: [],
        appointments: []
      };

      expect(checkSlotAvailable(monday, '18:00', availabilityData)).toBe(false);
    });
  });

  describe('getAvailableDatesInRange', () => {
    it('should return available dates in range', () => {
      const startDate = new Date('2025-02-03T10:00:00'); // Monday
      const endDate = new Date('2025-02-08T10:00:00'); // Saturday (to include Friday)
      
      const availabilityData: AvailabilityData = {
        regularSchedule: [
          {
            id: '1',
            artistId: 'artist1',
            dayOfWeek: 1, // Monday
            startTime: '09:00',
            endTime: '17:00',
            isActive: true
          },
          {
            id: '2',
            artistId: 'artist1',
            dayOfWeek: 3, // Wednesday
            startTime: '09:00',
            endTime: '17:00',
            isActive: true
          },
          {
            id: '3',
            artistId: 'artist1',
            dayOfWeek: 5, // Friday
            startTime: '09:00',
            endTime: '17:00',
            isActive: true
          }
        ],
        exceptions: [],
        appointments: []
      };

      const availableDates = getAvailableDatesInRange(startDate, endDate, availabilityData);
      
      expect(availableDates).toHaveLength(3);
      expect(availableDates[0].getDay()).toBe(1); // Monday
      expect(availableDates[1].getDay()).toBe(3); // Wednesday
      expect(availableDates[2].getDay()).toBe(5); // Friday
    });
  });
});