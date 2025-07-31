'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { differenceInMinutes, format, isPast, isWithinInterval, subMinutes } from 'date-fns';
import { formatDuration } from '../../lib/date-utils';

interface AppointmentCardProps {
  appointment: {
    id: string;
    scheduledAt: Date | string;
    status: string;
    type: string;
    duration?: number;
    artist: {
      name: string;
      profileImage?: string | null;
    };
    consultation?: {
      id: string;
    } | null;
  };
}

export function AppointmentCard({ appointment }: AppointmentCardProps) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [canJoin, setCanJoin] = useState(false);
  const [timeUntilJoin, setTimeUntilJoin] = useState<number | null>(null);

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
    // Check if user can join (within 10 minutes of appointment)
    const now = currentTime;
    const tenMinutesBefore = subMinutes(appointmentDate, 10);
    const sixtyMinutesAfter = new Date(appointmentDate.getTime() + 60 * 60 * 1000);

    const withinJoinWindow = isWithinInterval(now, {
      start: tenMinutesBefore,
      end: sixtyMinutesAfter,
    });

    setCanJoin(withinJoinWindow && isConfirmed && hasConsultation);

    // Calculate minutes until user can join
    if (now < tenMinutesBefore) {
      setTimeUntilJoin(differenceInMinutes(tenMinutesBefore, now));
    } else {
      setTimeUntilJoin(null);
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

  const getJoinButton = () => {
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

    if (canJoin) {
      return (
        <Link
          href={`/consultation/${appointment.id}/join`}
          className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 transition-colors"
        >
          Join Session Now
        </Link>
      );
    }

    if (timeUntilJoin !== null) {
      return (
        <button disabled className="px-4 py-2 text-sm font-medium text-gray-500 bg-gray-200 rounded-md cursor-not-allowed">
          Join in {formatDuration(timeUntilJoin)}
        </button>
      );
    }

    return null;
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-4 mb-3">
            {appointment.artist.profileImage ? (
              <img
                src={appointment.artist.profileImage}
                alt={appointment.artist.name}
                className="h-12 w-12 rounded-full object-cover"
              />
            ) : (
              <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
                <span className="text-lg font-medium text-gray-600">
                  {appointment.artist.name.charAt(0)}
                </span>
              </div>
            )}
            <div>
              <h3 className="text-lg font-medium text-gray-900">
                {appointment.artist.name}
              </h3>
              <p className="text-sm text-gray-600 capitalize">
                {appointment.type.toLowerCase().replace('_', ' ')}
              </p>
            </div>
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
            {getJoinButton()}
          </div>
        </div>
      </div>
    </div>
  );
}