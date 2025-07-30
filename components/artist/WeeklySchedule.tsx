'use client';

import { getDayName } from '../../lib/date-utils';

interface Availability {
  id?: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isActive: boolean;
}

interface WeeklyScheduleProps {
  schedule: Availability[];
  onChange: (schedule: Availability[]) => void;
}

export function WeeklySchedule({ schedule, onChange }: WeeklyScheduleProps) {
  const days = [0, 1, 2, 3, 4, 5, 6]; // Sunday to Saturday

  const getScheduleForDay = (dayOfWeek: number) => {
    return schedule.find(s => s.dayOfWeek === dayOfWeek) || {
      dayOfWeek,
      startTime: '09:00',
      endTime: '17:00',
      isActive: false
    };
  };

  const updateDay = (dayOfWeek: number, field: keyof Availability, value: any) => {
    const newSchedule = [...schedule];
    const existingIndex = newSchedule.findIndex(s => s.dayOfWeek === dayOfWeek);
    
    if (existingIndex >= 0) {
      newSchedule[existingIndex] = {
        ...newSchedule[existingIndex],
        [field]: value
      };
    } else {
      newSchedule.push({
        dayOfWeek,
        startTime: '09:00',
        endTime: '17:00',
        isActive: false,
        [field]: value
      });
    }
    
    onChange(newSchedule);
  };

  const generateTimeOptions = () => {
    const options = [];
    for (let hour = 0; hour < 24; hour++) {
      options.push(
        <option key={hour} value={`${hour.toString().padStart(2, '0')}:00`}>
          {hour === 0 ? '12:00 AM' : hour < 12 ? `${hour}:00 AM` : hour === 12 ? '12:00 PM' : `${hour - 12}:00 PM`}
        </option>
      );
    }
    return options;
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900">Set Your Weekly Hours</h3>
      <p className="text-sm text-gray-600">All appointments are 1-hour blocks.</p>
      
      <div className="space-y-3">
        {days.map(day => {
          const daySchedule = getScheduleForDay(day);
          return (
            <div key={day} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
              <div className="w-24">
                <input
                  type="checkbox"
                  id={`day-${day}`}
                  checked={daySchedule.isActive}
                  onChange={(e) => updateDay(day, 'isActive', e.target.checked)}
                  className="mr-2"
                />
                <label htmlFor={`day-${day}`} className="font-medium">
                  {getDayName(day)}
                </label>
              </div>
              
              <div className="flex items-center space-x-2 flex-1">
                <label className="text-sm text-gray-600">From:</label>
                <select
                  value={daySchedule.startTime}
                  onChange={(e) => updateDay(day, 'startTime', e.target.value)}
                  disabled={!daySchedule.isActive}
                  className="px-3 py-1 border border-gray-300 rounded-md disabled:bg-gray-100 disabled:text-gray-400"
                >
                  {generateTimeOptions()}
                </select>
                
                <label className="text-sm text-gray-600 ml-4">To:</label>
                <select
                  value={daySchedule.endTime}
                  onChange={(e) => updateDay(day, 'endTime', e.target.value)}
                  disabled={!daySchedule.isActive}
                  className="px-3 py-1 border border-gray-300 rounded-md disabled:bg-gray-100 disabled:text-gray-400"
                >
                  {generateTimeOptions()}
                </select>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}