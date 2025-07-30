'use client';

interface Availability {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isActive: boolean;
}

interface AvailabilityPresetsProps {
  onApplyPreset: (preset: Availability[]) => void;
}

export function AvailabilityPresets({ onApplyPreset }: AvailabilityPresetsProps) {
  const presets = [
    {
      name: '9 AM - 5 PM, Monday-Friday',
      schedule: [1, 2, 3, 4, 5].map(day => ({
        dayOfWeek: day,
        startTime: '09:00',
        endTime: '17:00',
        isActive: true
      }))
    },
    {
      name: '9 AM - 9 PM, Monday-Friday',
      schedule: [1, 2, 3, 4, 5].map(day => ({
        dayOfWeek: day,
        startTime: '09:00',
        endTime: '21:00',
        isActive: true
      }))
    },
    {
      name: '9 AM - 9 PM, Everyday',
      schedule: [0, 1, 2, 3, 4, 5, 6].map(day => ({
        dayOfWeek: day,
        startTime: '09:00',
        endTime: '21:00',
        isActive: true
      }))
    },
    {
      name: '10 AM - 6 PM, Weekdays + Saturday',
      schedule: [1, 2, 3, 4, 5, 6].map(day => ({
        dayOfWeek: day,
        startTime: '10:00',
        endTime: '18:00',
        isActive: true
      }))
    }
  ];

  return (
    <div className="mb-6">
      <h4 className="text-sm font-medium text-gray-700 mb-3">Quick Presets</h4>
      <div className="flex flex-wrap gap-2">
        {presets.map((preset, index) => (
          <button
            key={index}
            onClick={() => onApplyPreset(preset.schedule)}
            className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors"
          >
            {preset.name}
          </button>
        ))}
        <button
          onClick={() => onApplyPreset([])}
          className="px-4 py-2 text-sm bg-red-50 hover:bg-red-100 text-red-700 rounded-md transition-colors"
        >
          Clear All
        </button>
      </div>
    </div>
  );
}