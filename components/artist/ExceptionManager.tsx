'use client';

import { useState, useEffect } from 'react';
import { formatTime } from '../../lib/date-utils';

interface AvailabilityException {
  id: string;
  date: string;
  type: 'UNAVAILABLE' | 'CUSTOM_HOURS';
  startTime?: string | null;
  endTime?: string | null;
  reason?: string | null;
}

export function ExceptionManager() {
  const [exceptions, setExceptions] = useState<AvailabilityException[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    date: '',
    type: 'UNAVAILABLE' as 'UNAVAILABLE' | 'CUSTOM_HOURS',
    startTime: '09:00',
    endTime: '17:00',
    reason: ''
  });

  useEffect(() => {
    fetchExceptions();
  }, []);

  const fetchExceptions = async () => {
    try {
      const response = await fetch('/api/artist/availability/exceptions');
      if (response.ok) {
        const data = await response.json();
        setExceptions(data);
      }
    } catch (error) {
      console.error('Error fetching exceptions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/artist/availability/exceptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        await fetchExceptions();
        setShowAddForm(false);
        setFormData({
          date: '',
          type: 'UNAVAILABLE',
          startTime: '09:00',
          endTime: '17:00',
          reason: ''
        });
      } else {
        alert('Failed to add exception');
      }
    } catch (error) {
      console.error('Error adding exception:', error);
      alert('Failed to add exception');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this exception?')) return;
    
    try {
      const response = await fetch(`/api/artist/availability/exceptions?id=${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        await fetchExceptions();
      } else {
        alert('Failed to delete exception');
      }
    } catch (error) {
      console.error('Error deleting exception:', error);
      alert('Failed to delete exception');
    }
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

  if (loading) {
    return <div>Loading exceptions...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Exceptions & Holidays</h3>
          <p className="text-sm text-gray-600 mt-1">
            Mark days when you&apos;re unavailable or have different hours than usual.
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
        >
          {showAddForm ? 'Cancel' : 'Add Exception'}
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleSubmit} className="bg-gray-50 p-4 rounded-lg space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as 'UNAVAILABLE' | 'CUSTOM_HOURS' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="UNAVAILABLE">Unavailable</option>
                <option value="CUSTOM_HOURS">Custom Hours</option>
              </select>
            </div>
          </div>

          {formData.type === 'CUSTOM_HOURS' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Time
                </label>
                <select
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  {generateTimeOptions()}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Time
                </label>
                <select
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  {generateTimeOptions()}
                </select>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Reason (Optional)
            </label>
            <input
              type="text"
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              placeholder="e.g., Vacation, Holiday, Personal day"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>

          <button
            type="submit"
            className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700"
          >
            Add Exception
          </button>
        </form>
      )}

      <div className="space-y-2">
        {exceptions.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No exceptions added yet.</p>
        ) : (
          exceptions.map((exception) => (
            <div key={exception.id} className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg">
              <div>
                <p className="font-medium">
                  {new Date(exception.date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
                <p className="text-sm text-gray-600">
                  {exception.type === 'UNAVAILABLE' ? (
                    'Unavailable'
                  ) : (
                    `Custom hours: ${formatTime(exception.startTime!)} - ${formatTime(exception.endTime!)}`
                  )}
                  {exception.reason && ` • ${exception.reason}`}
                </p>
              </div>
              <button
                onClick={() => handleDelete(exception.id)}
                className="text-red-600 hover:text-red-800"
              >
                Remove
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}