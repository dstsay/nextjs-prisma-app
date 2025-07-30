'use client';

import { useState, useEffect } from 'react';
import { WeeklySchedule } from './WeeklySchedule';
import { AvailabilityPresets } from './AvailabilityPresets';
import { ExceptionManager } from './ExceptionManager';
import { useCSRFToken } from '@/hooks/useCSRFToken';
import { ConfirmationModal } from '@/components/ui/ConfirmationModal';

interface Availability {
  id?: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isActive: boolean;
}

export function AvailabilityManager() {
  const [schedule, setSchedule] = useState<Availability[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'schedule' | 'exceptions'>('schedule');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'success' | 'error'>('success');
  const [modalMessage, setModalMessage] = useState('');
  const csrfToken = useCSRFToken();

  useEffect(() => {
    fetchAvailability();
  }, []);

  const fetchAvailability = async () => {
    try {
      const response = await fetch('/api/artist/availability');
      if (response.ok) {
        const data = await response.json();
        setSchedule(data);
      }
    } catch (error) {
      console.error('Error fetching availability:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleScheduleChange = (newSchedule: Availability[]) => {
    setSchedule(newSchedule);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/artist/availability', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken
        },
        body: JSON.stringify({ schedule })
      });

      if (response.ok) {
        const data = await response.json();
        setSchedule(data);
        setModalType('success');
        setModalMessage('Your availability has been saved successfully!');
        setShowModal(true);
      } else {
        setModalType('error');
        setModalMessage('Failed to save availability. Please try again.');
        setShowModal(true);
      }
    } catch (error) {
      console.error('Error saving availability:', error);
      setModalType('error');
      setModalMessage('An error occurred while saving. Please try again.');
      setShowModal(true);
    } finally {
      setSaving(false);
    }
  };

  const applyPreset = (preset: Availability[]) => {
    setSchedule(preset);
  };

  if (loading) {
    return <div className="p-6">Loading availability...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Manage Your Availability</h2>
        
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('schedule')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'schedule'
                  ? 'border-green-600 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Weekly Schedule
            </button>
            <button
              onClick={() => setActiveTab('exceptions')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'exceptions'
                  ? 'border-green-600 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Exceptions & Holidays
            </button>
          </nav>
        </div>

        {activeTab === 'schedule' ? (
          <>
            <AvailabilityPresets onApplyPreset={applyPreset} />
            
            <div className="mt-6">
              <WeeklySchedule
                schedule={schedule}
                onChange={handleScheduleChange}
              />
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={handleSave}
                disabled={saving}
                className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Saving...' : 'Save Availability'}
              </button>
            </div>
          </>
        ) : (
          <ExceptionManager />
        )}
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        type={modalType}
        message={modalMessage}
      />
    </div>
  );
}