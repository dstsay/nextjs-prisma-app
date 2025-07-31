'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { getMonthName, getShortDayName, getDayOfWeek } from '../../lib/date-utils';
import { TimeSlotPicker } from './TimeSlotPicker';

interface BookingCalendarProps {
  artistId: string;
}

export function BookingCalendar({ artistId }: BookingCalendarProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [availableDates, setAvailableDates] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [bookingInProgress, setBookingInProgress] = useState(false);

  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  // Check for stored booking details on mount (for post-auth redirect)
  useEffect(() => {
    const storedBooking = sessionStorage.getItem('pendingBooking');
    if (storedBooking && status === 'authenticated') {
      try {
        const booking = JSON.parse(storedBooking);
        if (booking.artistId === artistId) {
          setSelectedDate(new Date(booking.date));
          setSelectedTime(booking.time);
          // Clear stored booking
          sessionStorage.removeItem('pendingBooking');
          // Auto-trigger booking after state is set
          setTimeout(() => {
            const confirmButton = document.querySelector('[data-confirm-booking]') as HTMLButtonElement;
            if (confirmButton) {
              confirmButton.click();
            }
          }, 500);
        }
      } catch (error) {
        console.error('Error restoring booking:', error);
        sessionStorage.removeItem('pendingBooking');
      }
    }
  }, [artistId, status]);

  const fetchMonthAvailability = useCallback(async () => {
    setLoading(true);
    try {
      const firstDay = new Date(currentYear, currentMonth, 1);
      const lastDay = new Date(currentYear, currentMonth + 1, 0);
      const dates = new Set<string>();

      for (let d = new Date(firstDay); d <= lastDay; d.setDate(d.getDate() + 1)) {
        const response = await fetch(
          `/api/artists/${artistId}/availability?date=${d.toISOString()}`
        );
        if (response.ok) {
          const data = await response.json();
          if (data.availableSlots && data.availableSlots.length > 0) {
            dates.add(d.toDateString());
          }
        }
      }

      setAvailableDates(dates);
    } catch (error) {
      console.error('Error fetching availability:', error);
    } finally {
      setLoading(false);
    }
  }, [currentMonth, currentYear, artistId]);

  useEffect(() => {
    fetchMonthAvailability();
  }, [fetchMonthAvailability]);

  const getDaysInMonth = () => {
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: (Date | null)[] = [];
    
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(currentYear, currentMonth, i));
    }

    return days;
  };

  const handlePreviousMonth = () => {
    const today = new Date();
    const previousMonth = new Date(currentYear, currentMonth - 1);
    
    // Don't allow navigating to months before current month
    if (previousMonth.getFullYear() < today.getFullYear() || 
        (previousMonth.getFullYear() === today.getFullYear() && 
         previousMonth.getMonth() < today.getMonth())) {
      return;
    }
    
    setCurrentDate(previousMonth);
    setSelectedDate(null);
    setSelectedTime(null);
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1));
    setSelectedDate(null);
    setSelectedTime(null);
  };

  const handleDateClick = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (date < today) return;
    if (!availableDates.has(date.toDateString())) return;
    
    setSelectedDate(date);
    setSelectedTime(null);
    
    // Auto-scroll to bottom on mobile after time slots appear
    if (window.innerWidth < 1024) { // lg breakpoint
      setTimeout(() => {
        window.scrollTo({
          top: document.documentElement.scrollHeight,
          behavior: 'smooth'
        });
      }, 100);
    }
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
  };

  const handleConfirm = async () => {
    if (!selectedDate || !selectedTime) return;

    // Check if user is authenticated
    if (status === 'unauthenticated' || !session) {
      // Store booking details in sessionStorage
      const bookingDetails = {
        artistId,
        date: selectedDate.toISOString(),
        time: selectedTime,
        returnUrl: window.location.pathname
      };
      sessionStorage.setItem('pendingBooking', JSON.stringify(bookingDetails));
      
      // Redirect to client login with return URL
      router.push(`/auth/client/login?callbackUrl=${encodeURIComponent(window.location.pathname)}`);
      return;
    }

    // User is authenticated, proceed with booking
    setBookingInProgress(true);
    
    try {
      const response = await fetch('/api/appointments/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          artistId,
          date: selectedDate.toISOString(),
          time: selectedTime,
          type: 'CONSULTATION',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create appointment');
      }

      // Success! Redirect to confirmation or appointments page
      router.push(`/appointments/${data.appointment.id}/confirmation`);
    } catch (error) {
      console.error('Booking error:', error);
      alert(error instanceof Error ? error.message : 'Failed to book appointment. Please try again.');
    } finally {
      setBookingInProgress(false);
    }
  };

  const isDateAvailable = (date: Date) => {
    return availableDates.has(date.toDateString());
  };

  const isDatePast = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const days = getDaysInMonth();
  const weekDays = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  
  // Check if we can navigate to previous month
  const today = new Date();
  const canGoPrevious = currentYear > today.getFullYear() || 
                        (currentYear === today.getFullYear() && currentMonth > today.getMonth());

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <div className="flex-1">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">
            {getMonthName(currentMonth)} {currentYear}
          </h3>
          <div className="flex gap-2">
            <button
              onClick={handlePreviousMonth}
              className={`p-2 rounded-md ${canGoPrevious && !loading ? 'hover:bg-gray-100' : 'opacity-50 cursor-not-allowed'}`}
              disabled={loading || !canGoPrevious}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={handleNextMonth}
              className="p-2 hover:bg-gray-100 rounded-md"
              disabled={loading}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-2">
          {weekDays.map(day => (
            <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
              {day}
            </div>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-8">Loading availability...</div>
        ) : (
          <div className="grid grid-cols-7 gap-1">
            {days.map((date, index) => {
              if (!date) {
                return <div key={`empty-${index}`} className="aspect-square" />;
              }

              const isAvailable = isDateAvailable(date);
              const isPast = isDatePast(date);
              const isSelected = selectedDate?.toDateString() === date.toDateString();
              const isToday = new Date().toDateString() === date.toDateString();

              return (
                <button
                  key={date.toISOString()}
                  onClick={() => handleDateClick(date)}
                  disabled={!isAvailable || isPast}
                  className={`
                    aspect-square p-2 rounded-md text-sm font-medium transition-colors
                    ${isSelected ? 'bg-blue-600 text-white' : ''}
                    ${isAvailable && !isPast && !isSelected ? 'bg-blue-50 text-blue-900 hover:bg-blue-100' : ''}
                    ${!isAvailable || isPast ? 'text-gray-300 cursor-not-allowed' : ''}
                    ${isToday && !isSelected ? 'ring-2 ring-blue-400' : ''}
                  `}
                >
                  {date.getDate()}
                </button>
              );
            })}
          </div>
        )}

        <div className="mt-4 pt-4 border-t">
          <p className="text-sm text-gray-600">
            <span className="font-medium">Time zone</span><br />
            {Intl.DateTimeFormat().resolvedOptions().timeZone}
          </p>
        </div>
      </div>

      <div className="flex-1">
        {selectedDate ? (
          <>
            <h3 className="text-lg font-semibold mb-4">
              {selectedDate.toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric'
              })}
            </h3>
            <TimeSlotPicker
              artistId={artistId}
              date={selectedDate}
              onSelectTime={handleTimeSelect}
              selectedTime={selectedTime}
            />
            <button
              onClick={handleConfirm}
              disabled={!selectedTime || bookingInProgress}
              data-confirm-booking
              className={`
                mt-6 w-full py-3 rounded-md font-medium transition-colors
                ${selectedTime && !bookingInProgress
                  ? 'bg-green-600 text-white hover:bg-green-700' 
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'}
              `}
            >
              {bookingInProgress ? 'Booking...' : 'Confirm Booking'}
            </button>
          </>
        ) : (
          <div className="text-center text-gray-500 py-8">
            <p>Select a date to view available times</p>
          </div>
        )}
      </div>
    </div>
  );
}