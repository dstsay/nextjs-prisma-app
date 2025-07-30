import {
  formatTime,
  formatTime24,
  parseTime,
  getDayOfWeek,
  getDateRange,
  isSameDay,
  startOfDay,
  addHours,
  getMonthName,
  getDayName,
  getShortDayName
} from '../../../lib/date-utils';

describe('date-utils', () => {
  describe('formatTime', () => {
    it('should format morning times correctly', () => {
      expect(formatTime('09:00')).toBe('9:00am');
      expect(formatTime('00:00')).toBe('12:00am');
      expect(formatTime('11:30')).toBe('11:30am');
    });

    it('should format afternoon times correctly', () => {
      expect(formatTime('12:00')).toBe('12:00pm');
      expect(formatTime('13:00')).toBe('1:00pm');
      expect(formatTime('23:30')).toBe('11:30pm');
    });
  });

  describe('formatTime24', () => {
    it('should format single digit hours with leading zero', () => {
      expect(formatTime24(9)).toBe('09:00');
      expect(formatTime24(9, 30)).toBe('09:30');
    });

    it('should format double digit hours correctly', () => {
      expect(formatTime24(13)).toBe('13:00');
      expect(formatTime24(23, 45)).toBe('23:45');
    });
  });

  describe('parseTime', () => {
    it('should parse time string correctly', () => {
      expect(parseTime('09:30')).toEqual({ hour: 9, minute: 30 });
      expect(parseTime('23:45')).toEqual({ hour: 23, minute: 45 });
      expect(parseTime('00:00')).toEqual({ hour: 0, minute: 0 });
    });
  });

  describe('getDayOfWeek', () => {
    it('should return correct day of week', () => {
      expect(getDayOfWeek(new Date('2025-01-29'))).toBe(2); // Tuesday
      expect(getDayOfWeek(new Date('2025-01-26'))).toBe(6); // Saturday
      expect(getDayOfWeek(new Date('2025-01-27'))).toBe(0); // Sunday
    });
  });

  describe('getDateRange', () => {
    it('should generate correct date range', () => {
      const startDate = new Date('2025-01-01');
      const range = getDateRange(startDate, 3);
      
      expect(range).toHaveLength(3);
      expect(range[0].toISOString()).toBe(new Date('2025-01-01').toISOString());
      expect(range[1].toISOString()).toBe(new Date('2025-01-02').toISOString());
      expect(range[2].toISOString()).toBe(new Date('2025-01-03').toISOString());
    });
  });

  describe('isSameDay', () => {
    it('should return true for same day', () => {
      const date1 = new Date('2025-01-30T10:00:00');
      const date2 = new Date('2025-01-30T15:00:00');
      expect(isSameDay(date1, date2)).toBe(true);
    });

    it('should return false for different days', () => {
      const date1 = new Date('2025-01-30');
      const date2 = new Date('2025-01-31');
      expect(isSameDay(date1, date2)).toBe(false);
    });
  });

  describe('startOfDay', () => {
    it('should reset time to start of day', () => {
      const date = new Date('2025-01-30T15:30:45.123Z');
      const result = startOfDay(date);
      
      expect(result.getHours()).toBe(0);
      expect(result.getMinutes()).toBe(0);
      expect(result.getSeconds()).toBe(0);
      expect(result.getMilliseconds()).toBe(0);
      expect(result.getDate()).toBe(30);
    });
  });

  describe('addHours', () => {
    it('should add hours correctly', () => {
      const date = new Date('2025-01-30T10:00:00');
      const result = addHours(date, 5);
      
      expect(result.getHours()).toBe(15);
      expect(result.getDate()).toBe(30);
    });

    it('should handle day rollover', () => {
      const date = new Date('2025-01-30T22:00:00');
      const result = addHours(date, 5);
      
      expect(result.getHours()).toBe(3);
      expect(result.getDate()).toBe(31);
    });
  });

  describe('getMonthName', () => {
    it('should return correct month names', () => {
      expect(getMonthName(0)).toBe('January');
      expect(getMonthName(5)).toBe('June');
      expect(getMonthName(11)).toBe('December');
    });
  });

  describe('getDayName', () => {
    it('should return correct day names', () => {
      expect(getDayName(0)).toBe('Sunday');
      expect(getDayName(3)).toBe('Wednesday');
      expect(getDayName(6)).toBe('Saturday');
    });
  });

  describe('getShortDayName', () => {
    it('should return correct short day names', () => {
      expect(getShortDayName(0)).toBe('Sun');
      expect(getShortDayName(3)).toBe('Wed');
      expect(getShortDayName(6)).toBe('Sat');
    });
  });
});