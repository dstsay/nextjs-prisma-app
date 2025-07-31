'use client';

import { useState, useEffect, useCallback } from 'react';
import { TimeSlot } from '../../lib/availability-utils';
import { formatDateForAPI } from '../../lib/date-utils';

interface TimeSlotPickerProps {
  artistId: string;
  date: Date;
  onSelectTime: (time: string) => void;
  selectedTime: string | null;
}

export function TimeSlotPicker({ artistId, date, onSelectTime, selectedTime }: TimeSlotPickerProps) {
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTimeSlots = useCallback(async () => {
    setLoading(true);
    try {
      const clientTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const response = await fetch(
        `/api/artists/${artistId}/availability?date=${formatDateForAPI(date)}&timezone=${encodeURIComponent(clientTimezone)}`
      );
      if (response.ok) {
        const data = await response.json();
        setSlots(data.availableSlots || []);
      }
    } catch (error) {
      console.error('Error fetching time slots:', error);
    } finally {
      setLoading(false);
    }
  }, [artistId, date]);

  useEffect(() => {
    fetchTimeSlots();
  }, [fetchTimeSlots]);

  if (loading) {
    return <div className="text-center py-4">Loading available times...</div>;
  }

  if (slots.length === 0) {
    return <div className="text-center py-4 text-gray-500">No available times for this date</div>;
  }

  // Filter to only show available slots
  const availableSlots = slots.filter(slot => slot.available);
  
  // DEBUG: Log filtering results
  console.log('[TimeSlotPicker] Filtering slots:', {
    totalSlots: slots.length,
    availableSlots: availableSlots.length,
    firstFewSlots: slots.slice(0, 5).map(s => ({
      time: s.time,
      available: s.available,
      displayTime: s.displayTime
    })),
    lastFewSlots: slots.slice(-5).map(s => ({
      time: s.time,
      available: s.available,
      displayTime: s.displayTime
    }))
  });

  return (
    <div>
      <p className="text-sm text-gray-600 mb-3">
        Select a start time (appointments are 60 minutes)
      </p>
      {availableSlots.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No available times for this date
        </div>
      ) : (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {availableSlots.map((slot) => (
            <button
              key={slot.time}
              onClick={() => onSelectTime(slot.time)}
              className={`
                w-full py-3 px-4 rounded-md border text-center font-medium transition-colors
                ${selectedTime === slot.time 
                  ? 'border-blue-600 bg-blue-50 text-blue-600' 
                  : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                }
              `}
            >
              <div>
                <div className="font-medium">{slot.displayTime}</div>
                <div className="text-xs text-gray-500 mt-1">
                  60 min consultation
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}