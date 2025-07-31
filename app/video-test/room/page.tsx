'use client';

import { useEffect, useState, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import * as Video from 'twilio-video';

function VideoTestRoomInner() {
  const searchParams = useSearchParams();
  const [isConnecting, setIsConnecting] = useState(true);
  const [error, setError] = useState<string>('');
  const [room, setRoom] = useState<Video.Room | null>(null);
  const localVideoRef = useRef<HTMLDivElement>(null);
  const remoteVideoRef = useRef<HTMLDivElement>(null);

  const token = searchParams.get('token');
  const roomName = searchParams.get('room');
  const role = searchParams.get('role');

  useEffect(() => {
    if (!token || !roomName) {
      setError('Missing token or room name');
      setIsConnecting(false);
      return;
    }

    console.log('[Test Room] Connecting to room:', roomName);
    console.log('[Test Room] Role:', role);
    console.log('[Test Room] Token preview:', token.substring(0, 50) + '...');

    // Log token details for debugging
    console.log('[Test Room] Token length:', token.length);
    console.log('[Test Room] Token starts with eyJ:', token.startsWith('eyJ'));
    
    // Decode and log token payload
    try {
      const parts = token.split('.');
      const payload = JSON.parse(atob(parts[1]));
      console.log('[Test Room] Token payload:', payload);
      console.log('[Test Room] Token expires at:', new Date(payload.exp * 1000).toISOString());
      console.log('[Test Room] Current time:', new Date().toISOString());
    } catch (e) {
      console.error('[Test Room] Failed to decode token:', e);
    }

    Video.connect(token, {
      name: roomName,
      audio: true,
      video: { width: 640 },
    }).then(room => {
      console.log('[Test Room] Successfully connected to room:', room.name);
      setRoom(room);
      setIsConnecting(false);

      // Attach local participant video
      const localParticipant = room.localParticipant;
      console.log('[Test Room] Local participant:', localParticipant.identity);

      localParticipant.videoTracks.forEach(publication => {
        if (publication.track && localVideoRef.current) {
          localVideoRef.current.appendChild(publication.track.attach());
        }
      });

      // Handle remote participants
      room.participants.forEach(participant => {
        handleParticipantConnected(participant);
      });

      room.on('participantConnected', handleParticipantConnected);
      room.on('participantDisconnected', handleParticipantDisconnected);

    }).catch(error => {
      console.error('[Test Room] Connection error:', error);
      setError(`Failed to connect: ${error.message}`);
      setIsConnecting(false);
    });

    return () => {
      if (room) {
        console.log('[Test Room] Disconnecting from room');
        room.disconnect();
      }
    };
  }, [token, roomName, role]);

  const handleParticipantConnected = (participant: Video.RemoteParticipant) => {
    console.log('[Test Room] Participant connected:', participant.identity);
    
    participant.on('trackSubscribed', (track: Video.RemoteTrack) => {
      if (track.kind === 'video' && remoteVideoRef.current) {
        remoteVideoRef.current.appendChild(track.attach());
      }
    });

    participant.videoTracks.forEach(publication => {
      if (publication.isSubscribed && publication.track && remoteVideoRef.current) {
        remoteVideoRef.current.appendChild(publication.track.attach());
      }
    });
  };

  const handleParticipantDisconnected = (participant: Video.RemoteParticipant) => {
    console.log('[Test Room] Participant disconnected:', participant.identity);
  };

  const disconnect = () => {
    if (room) {
      room.disconnect();
      window.location.href = '/video-test';
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-red-900 rounded-lg p-6 max-w-md w-full">
          <h1 className="text-xl font-semibold text-white mb-4">Connection Error</h1>
          <p className="text-red-200 mb-4">{error}</p>
          <button
            onClick={() => window.location.href = '/video-test'}
            className="bg-red-700 hover:bg-red-600 text-white px-4 py-2 rounded"
          >
            Back to Test Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="max-w-6xl mx-auto p-4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Video Test Room</h1>
          <button
            onClick={disconnect}
            className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded"
          >
            Leave Room
          </button>
        </div>

        {isConnecting && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p>Connecting to video room...</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-800 rounded-lg p-4">
            <h2 className="text-lg font-semibold mb-2">Local Video ({role})</h2>
            <div 
              ref={localVideoRef} 
              className="bg-gray-700 rounded aspect-video flex items-center justify-center"
            >
              {!room && <span className="text-gray-400">No video</span>}
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-4">
            <h2 className="text-lg font-semibold mb-2">Remote Video</h2>
            <div 
              ref={remoteVideoRef}
              className="bg-gray-700 rounded aspect-video flex items-center justify-center"
            >
              <span className="text-gray-400">Waiting for other participant...</span>
            </div>
          </div>
        </div>

        {room && (
          <div className="mt-4 bg-gray-800 rounded-lg p-4">
            <h3 className="font-semibold mb-2">Room Info:</h3>
            <p className="text-sm text-gray-300">Room: {room.name}</p>
            <p className="text-sm text-gray-300">SID: {room.sid}</p>
            <p className="text-sm text-gray-300">Local Identity: {room.localParticipant.identity}</p>
            <p className="text-sm text-gray-300">Participants: {room.participants.size}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function VideoTestRoom() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    }>
      <VideoTestRoomInner />
    </Suspense>
  );
}