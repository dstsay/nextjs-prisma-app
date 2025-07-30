import {
  validateTimeSlot,
  validateBookingTime,
  validateTimeFormat,
  validateTimeRange,
  validateBooking
} from '../../../lib/booking-validation';

describe('booking-validation', () => {
  describe('validateTimeSlot', () => {
    it('should return true for 60-minute duration', () => {
      expect(validateTimeSlot('09:00', 60)).toBe(true);
    });

    it('should return false for non-60-minute duration', () => {
      expect(validateTimeSlot('09:00', 30)).toBe(false);
      expect(validateTimeSlot('09:00', 90)).toBe(false);
      expect(validateTimeSlot('09:00', 120)).toBe(false);
    });
  });

  describe('validateBookingTime', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should return true for booking more than 1 hour in advance', () => {
      const now = new Date('2025-01-30T10:00:00');
      jest.setSystemTime(now);

      const bookingTime = new Date('2025-01-30T12:00:00');
      expect(validateBookingTime(bookingTime)).toBe(true);
    });

    it('should return false for booking less than 1 hour in advance', () => {
      const now = new Date('2025-01-30T10:00:00');
      jest.setSystemTime(now);

      const bookingTime = new Date('2025-01-30T10:30:00');
      expect(validateBookingTime(bookingTime)).toBe(false);
    });

    it('should return false for past booking time', () => {
      const now = new Date('2025-01-30T10:00:00');
      jest.setSystemTime(now);

      const bookingTime = new Date('2025-01-30T09:00:00');
      expect(validateBookingTime(bookingTime)).toBe(false);
    });
  });

  describe('validateTimeFormat', () => {
    it('should return true for valid time formats', () => {
      expect(validateTimeFormat('09:00')).toBe(true);
      expect(validateTimeFormat('23:59')).toBe(true);
      expect(validateTimeFormat('00:00')).toBe(true);
      expect(validateTimeFormat('12:30')).toBe(true);
    });

    it('should return false for invalid time formats', () => {
      expect(validateTimeFormat('25:00')).toBe(false);
      expect(validateTimeFormat('12:60')).toBe(false);
      expect(validateTimeFormat('9:00')).toBe(false);
      expect(validateTimeFormat('12:5')).toBe(false);
      expect(validateTimeFormat('abc')).toBe(false);
    });
  });

  describe('validateTimeRange', () => {
    it('should return true for valid time ranges', () => {
      expect(validateTimeRange('09:00', '17:00')).toBe(true);
      expect(validateTimeRange('00:00', '23:59')).toBe(true);
      expect(validateTimeRange('12:00', '12:01')).toBe(true);
    });

    it('should return false for invalid time ranges', () => {
      expect(validateTimeRange('17:00', '09:00')).toBe(false);
      expect(validateTimeRange('12:00', '12:00')).toBe(false);
      expect(validateTimeRange('23:59', '00:00')).toBe(false);
    });

    it('should return false for invalid time formats', () => {
      expect(validateTimeRange('25:00', '26:00')).toBe(false);
      expect(validateTimeRange('09:00', '25:00')).toBe(false);
    });
  });

  describe('validateBooking', () => {
    beforeEach(() => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2025-01-30T10:00:00'));
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should return valid for correct booking', () => {
      const date = new Date('2025-01-30T00:00:00');
      const time = '14:00';
      const artistId = 'artist123';
      const clientId = 'client123';

      const result = validateBooking(date, time, artistId, clientId);
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should return error for invalid date', () => {
      const date = new Date('invalid');
      const time = '14:00';
      const artistId = 'artist123';
      const clientId = 'client123';

      const result = validateBooking(date, time, artistId, clientId);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Invalid date');
    });

    it('should return error for invalid time format', () => {
      const date = new Date('2025-01-30');
      const time = 'invalid';
      const artistId = 'artist123';
      const clientId = 'client123';

      const result = validateBooking(date, time, artistId, clientId);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Invalid time format');
    });

    it('should return error for booking less than 1 hour in advance', () => {
      const date = new Date('2025-01-30');
      const time = '10:30';
      const artistId = 'artist123';
      const clientId = 'client123';

      const result = validateBooking(date, time, artistId, clientId);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Booking must be at least 1 hour in advance');
    });

    it('should return error for missing IDs', () => {
      const date = new Date('2025-01-30');
      const time = '14:00';

      const result1 = validateBooking(date, time, '', 'client123');
      expect(result1.valid).toBe(false);
      expect(result1.error).toBe('Artist and client IDs are required');

      const result2 = validateBooking(date, time, 'artist123', '');
      expect(result2.valid).toBe(false);
      expect(result2.error).toBe('Artist and client IDs are required');
    });
  });
});