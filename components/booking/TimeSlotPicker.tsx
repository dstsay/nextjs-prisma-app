'use client';

import { useState, useEffect, useCallback } from 'react';
import { TimeSlot } from '../../lib/availability-utils';

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
      const response = await fetch(
        `/api/artists/${artistId}/availability?date=${date.toISOString()}`
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

  return (
    <div className="space-y-2 max-h-96 overflow-y-auto">
      {slots.map((slot) => (
        <button
          key={slot.time}
          onClick={() => onSelectTime(slot.time)}
          disabled={!slot.available}
          className={`
            w-full py-3 px-4 rounded-md border text-center font-medium transition-colors
            ${selectedTime === slot.time 
              ? 'border-blue-600 bg-blue-50 text-blue-600' 
              : slot.available
                ? 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                : 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
            }
          `}
        >
          {slot.displayTime}
        </button>
      ))}
    </div>
  );
}