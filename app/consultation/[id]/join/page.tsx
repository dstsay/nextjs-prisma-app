'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ClientWaitingRoom } from '../../../../components/video/ClientWaitingRoom';
import { ClientVideoRoom } from '../../../../components/video/ClientVideoRoom';
import { addMinutes, subMinutes, isWithinInterval } from 'date-fns';

interface TokenData {
  token: string;
  identity: string;
  roomName: string;
  appointment: {
    id: string;
    scheduledAt: string;
    duration: number;
  };
  artist: {
    name: string;
    profileImage: string | null;
  };
}

export default function ClientJoinPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [appointmentId, setAppointmentId] = useState<string>('');
  const [tokenData, setTokenData] = useState<TokenData | null>(null);
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [sessionStarted, setSessionStarted] = useState(false);

  useEffect(() => {
    const loadParams = async () => {
      const { id } = await params;
      setAppointmentId(id);
    };
    loadParams();
  }, [params]);

  useEffect(() => {
    if (!appointmentId) return;

    const fetchToken = async () => {
      try {
        const response = await fetch(`/api/video/consultation/${appointmentId}/token`, {
          method: 'POST',
        });

        if (!response.ok) {
          const data = await response.json();
          if (response.status === 403 && data.minutesUntilStart) {
            setError(`You can join ${data.minutesUntilStart} minutes before your appointment.`);
          } else {
            setError(data.error || 'Failed to join consultation');
          }
          setIsLoading(false);
          return;
        }

        const data = await response.json();
        setTokenData(data);
        setIsLoading(false);

        // Update waiting room status
        await fetch(`/api/video/consultation/${appointmentId}/waiting-status`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'join-waiting' }),
        });
      } catch (error) {
        console.error('Failed to fetch token:', error);
        setError('Failed to connect to consultation');
        setIsLoading(false);
      }
    };

    fetchToken();
  }, [appointmentId]);

  const handleSessionStart = useCallback(() => {
    setSessionStarted(true);
  }, []);

  const handleSessionEnd = useCallback(() => {
    router.push(`/client/dashboard?consultation=completed`);
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p>Loading consultation...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full text-center">
          <h1 className="text-xl font-semibold text-white mb-4">Unable to Join</h1>
          <p className="text-gray-300 mb-6">{error}</p>
          <button
            onClick={() => router.push('/client/dashboard')}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!tokenData) {
    return null;
  }

  const appointmentTime = new Date(tokenData.appointment.scheduledAt);

  if (sessionStarted) {
    return (
      <ClientVideoRoom
        token={tokenData.token}
        roomName={tokenData.roomName}
        artistName={tokenData.artist.name}
        appointmentId={appointmentId}
        onSessionEnd={handleSessionEnd}
      />
    );
  }

  return (
    <ClientWaitingRoom
      appointmentTime={appointmentTime}
      artistName={tokenData.artist.name}
      onSessionStart={handleSessionStart}
    />
  );
}