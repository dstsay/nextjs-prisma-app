'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { differenceInMinutes, format, isPast, isWithinInterval, subMinutes } from 'date-fns';

interface ArtistAppointmentCardProps {
  appointment: {
    id: string;
    scheduledAt: Date | string;
    status: string;
    type: string;
    duration?: number;
    client: {
      name?: string | null;
      username: string;
      email: string;
    };
    consultation?: {
      id: string;
    } | null;
  };
}

export function ArtistAppointmentCard({ appointment }: ArtistAppointmentCardProps) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [canHost, setCanHost] = useState(false);
  const [timeUntilHost, setTimeUntilHost] = useState<number | null>(null);

  const appointmentDate = new Date(appointment.scheduledAt);
  const isConfirmed = appointment.status === 'CONFIRMED';
  const hasConsultation = !!appointment.consultation;

  useEffect(() => {
    // Update current time every minute
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // Check if artist can host (within 10 minutes of appointment)
    const now = currentTime;
    const tenMinutesBefore = subMinutes(appointmentDate, 10);
    const sixtyMinutesAfter = new Date(appointmentDate.getTime() + 60 * 60 * 1000);

    const withinHostWindow = isWithinInterval(now, {
      start: tenMinutesBefore,
      end: sixtyMinutesAfter,
    });

    setCanHost(withinHostWindow && isConfirmed && hasConsultation);

    // Calculate minutes until artist can host
    if (now < tenMinutesBefore) {
      setTimeUntilHost(differenceInMinutes(tenMinutesBefore, now));
    } else {
      setTimeUntilHost(null);
    }
  }, [currentTime, appointmentDate, isConfirmed, hasConsultation]);

  const getStatusBadge = () => {
    const statusColors = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      CONFIRMED: 'bg-green-100 text-green-800',
      IN_PROGRESS: 'bg-blue-100 text-blue-800',
      COMPLETED: 'bg-gray-100 text-gray-800',
      CANCELLED: 'bg-red-100 text-red-800',
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[appointment.status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'}`}>
        {appointment.status}
      </span>
    );
  };

  const getHostButton = () => {
    if (!isConfirmed || !hasConsultation) {
      return null;
    }

    if (isPast(new Date(appointmentDate.getTime() + 60 * 60 * 1000))) {
      return (
        <button disabled className="px-4 py-2 text-sm font-medium text-gray-400 bg-gray-100 rounded-md cursor-not-allowed">
          Session Ended
        </button>
      );
    }

    if (canHost) {
      return (
        <Link
          href={`/artist/consultation/${appointment.id}/host`}
          className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 transition-colors"
        >
          Host Session Now
        </Link>
      );
    }

    if (timeUntilHost !== null) {
      return (
        <button disabled className="px-4 py-2 text-sm font-medium text-gray-500 bg-gray-200 rounded-md cursor-not-allowed">
          Host in {timeUntilHost} minute{timeUntilHost !== 1 ? 's' : ''}
        </button>
      );
    }

    return null;
  };

  const clientName = appointment.client.name || appointment.client.username;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="mb-3">
            <h3 className="text-lg font-medium text-gray-900">
              {clientName}
            </h3>
            <p className="text-sm text-gray-600">
              {appointment.client.email}
            </p>
            <p className="text-sm text-gray-600 capitalize mt-1">
              {appointment.type.toLowerCase().replace('_', ' ')}
            </p>
          </div>

          <div className="space-y-2 mb-4">
            <p className="text-sm text-gray-600">
              <span className="font-medium">Date:</span>{' '}
              {format(appointmentDate, 'EEEE, MMMM d, yyyy')}
            </p>
            <p className="text-sm text-gray-600">
              <span className="font-medium">Time:</span>{' '}
              {format(appointmentDate, 'h:mm a')}
            </p>
            <p className="text-sm text-gray-600">
              <span className="font-medium">Duration:</span>{' '}
              {appointment.duration || 60} minutes
            </p>
          </div>

          <div className="flex items-center justify-between">
            {getStatusBadge()}
            {getHostButton()}
          </div>
        </div>
      </div>
    </div>
  );
}