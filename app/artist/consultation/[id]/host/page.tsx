'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ArtistHostInterface } from '../../../../../components/video/ArtistHostInterface';
import { ArtistVideoRoom } from '../../../../../components/video/ArtistVideoRoom';

interface TokenData {
  token: string;
  identity: string;
  roomName: string;
  isHost: boolean;
  appointment: {
    id: string;
    scheduledAt: string;
    duration: number;
  };
  client: {
    name: string;
  };
}

export default function ArtistHostPage({ params }: { params: Promise<{ id: string }> }) {
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
            setError(`You can join ${data.minutesUntilStart} minutes before the appointment.`);
          } else {
            setError(data.error || 'Failed to access consultation');
          }
          setIsLoading(false);
          return;
        }

        const data = await response.json();
        
        // Verify this is the artist
        if (!data.isHost) {
          setError('Access denied. This page is for artists only.');
          setIsLoading(false);
          return;
        }

        setTokenData(data);
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to fetch token:', error);
        setError('Failed to connect to consultation');
        setIsLoading(false);
      }
    };

    fetchToken();
  }, [appointmentId]);

  const handleStartSession = useCallback(() => {
    setSessionStarted(true);
  }, []);

  const handleSessionEnd = useCallback(() => {
    router.push(`/artist/dashboard?consultation=completed`);
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p>Loading consultation...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow p-6 max-w-md w-full text-center">
          <h1 className="text-xl font-semibold mb-4">Unable to Access</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => router.push('/artist/dashboard')}
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
      <ArtistVideoRoom
        token={tokenData.token}
        roomName={tokenData.roomName}
        clientName={tokenData.client.name}
        appointmentId={appointmentId}
        appointmentTime={appointmentTime}
        onSessionEnd={handleSessionEnd}
      />
    );
  }

  return (
    <ArtistHostInterface
      appointmentId={appointmentId}
      clientName={tokenData.client.name}
      appointmentTime={appointmentTime}
      onStartSession={handleStartSession}
    />
  );
}