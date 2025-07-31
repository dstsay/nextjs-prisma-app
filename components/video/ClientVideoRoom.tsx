'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { connect, Room, RemoteParticipant, LocalVideoTrack, LocalAudioTrack } from 'twilio-video';
import { FiVideo, FiMic, FiMicOff, FiVideoOff, FiPhoneOff } from 'react-icons/fi';
import { EndSessionModal } from './EndSessionModal';

interface ClientVideoRoomProps {
  token: string;
  roomName: string;
  artistName: string;
  appointmentId: string;
  onSessionEnd: () => void;
}

export function ClientVideoRoom({ 
  token, 
  roomName, 
  artistName,
  appointmentId,
  onSessionEnd 
}: ClientVideoRoomProps) {
  const [room, setRoom] = useState<Room | null>(null);
  const [participants, setParticipants] = useState<RemoteParticipant[]>([]);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [showEndModal, setShowEndModal] = useState(false);
  const [isConnecting, setIsConnecting] = useState(true);
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const remoteAudioRef = useRef<HTMLAudioElement>(null);

  // Connect to Twilio room
  useEffect(() => {
    let roomInstance: Room | null = null;
    let isCancelled = false;

    const connectToRoom = async () => {
      try {
        const room = await connect(token, {
          name: roomName,
          audio: true,
          video: {
            facingMode: 'user',
            width: { ideal: 480 },
            height: { ideal: 640 },
            frameRate: { ideal: 24 }
          },
        });

        // Check if this effect was cancelled while connecting
        if (isCancelled) {
          room.disconnect();
          return;
        }

        roomInstance = room;
        setRoom(room);
        setIsConnecting(false);

        // Handle participants
        const participantConnected = (participant: RemoteParticipant) => {
          setParticipants(prevParticipants => [...prevParticipants, participant]);
        };

        const participantDisconnected = (participant: RemoteParticipant) => {
          setParticipants(prevParticipants =>
            prevParticipants.filter(p => p !== participant)
          );
        };

        room.participants.forEach(participantConnected);
        room.on('participantConnected', participantConnected);
        room.on('participantDisconnected', participantDisconnected);

        // Handle room disconnection
        room.on('disconnected', () => {
          room.participants.forEach(participantDisconnected);
          setRoom(null);
          onSessionEnd();
        });
      } catch (error) {
        if (!isCancelled) {
          console.error('Failed to connect to room:', error);
          setIsConnecting(false);
        }
      }
    };

    connectToRoom();

    // Cleanup function
    return () => {
      isCancelled = true;
      if (roomInstance) {
        roomInstance.disconnect();
      }
    };
  }, [token, roomName, onSessionEnd]);

  // Attach local video
  useEffect(() => {
    if (room && localVideoRef.current) {
      const localParticipant = room.localParticipant;
      const videoTrack = Array.from(localParticipant.videoTracks.values())[0]?.track as LocalVideoTrack;
      
      if (videoTrack) {
        videoTrack.attach(localVideoRef.current);
      }
    }
  }, [room]);

  // Attach remote participant tracks
  useEffect(() => {
    const participant = participants[0]; // Artist is the only other participant
    
    if (participant && remoteVideoRef.current && remoteAudioRef.current) {
      // Subscribe to tracks
      const trackSubscribed = (track: any) => {
        if (track.kind === 'video' && remoteVideoRef.current) {
          track.attach(remoteVideoRef.current);
        } else if (track.kind === 'audio' && remoteAudioRef.current) {
          track.attach(remoteAudioRef.current);
        }
      };

      const trackUnsubscribed = (track: any) => {
        track.detach();
      };

      participant.tracks.forEach(publication => {
        if (publication.isSubscribed && publication.track) {
          trackSubscribed(publication.track);
        }
      });

      participant.on('trackSubscribed', trackSubscribed);
      participant.on('trackUnsubscribed', trackUnsubscribed);

      return () => {
        participant.off('trackSubscribed', trackSubscribed);
        participant.off('trackUnsubscribed', trackUnsubscribed);
      };
    }
  }, [participants]);

  // Toggle video
  const toggleVideo = useCallback(() => {
    if (room) {
      const localParticipant = room.localParticipant;
      const videoTrack = Array.from(localParticipant.videoTracks.values())[0]?.track as LocalVideoTrack;
      
      if (videoTrack) {
        if (videoEnabled) {
          videoTrack.disable();
        } else {
          videoTrack.enable();
        }
        setVideoEnabled(!videoEnabled);
      }
    }
  }, [room, videoEnabled]);

  // Toggle audio
  const toggleAudio = useCallback(() => {
    if (room) {
      const localParticipant = room.localParticipant;
      const audioTrack = Array.from(localParticipant.audioTracks.values())[0]?.track as LocalAudioTrack;
      
      if (audioTrack) {
        if (audioEnabled) {
          audioTrack.disable();
        } else {
          audioTrack.enable();
        }
        setAudioEnabled(!audioEnabled);
      }
    }
  }, [room, audioEnabled]);

  // Handle end session
  const handleEndSession = async () => {
    try {
      await fetch(`/api/video/consultation/${appointmentId}/end-session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirmed: true }),
      });
      
      if (room) {
        room.disconnect();
      }
      onSessionEnd();
    } catch (error) {
      console.error('Failed to end session:', error);
    }
  };

  if (isConnecting) {
    return (
      <div className="fixed inset-0 bg-gray-900 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Connecting to consultation...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="fixed inset-0 bg-black flex flex-col h-screen">
        {/* Remote Video (Full Screen) */}
        <div className="flex-1 relative">
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
          <audio ref={remoteAudioRef} autoPlay />
          
          {/* Artist name overlay */}
          <div className="absolute top-4 left-4 bg-black bg-opacity-50 rounded px-3 py-1">
            <p className="text-white text-sm">{artistName}</p>
          </div>

          {/* Local Video (Picture-in-Picture) */}
          <div className="absolute bottom-20 right-4 w-32 h-44 bg-gray-800 rounded-lg overflow-hidden shadow-lg">
            <video
              ref={localVideoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-cover"
              style={{ transform: 'scaleX(-1)' }}
            />
          </div>
        </div>

        {/* Controls Bar */}
        <div className="bg-gray-900 p-4 flex justify-center items-center space-x-6">
          <button
            onClick={toggleAudio}
            className={`p-4 rounded-full ${
              audioEnabled ? 'bg-gray-700 hover:bg-gray-600' : 'bg-red-600 hover:bg-red-700'
            } text-white transition-colors`}
            aria-label={audioEnabled ? 'Mute' : 'Unmute'}
          >
            {audioEnabled ? <FiMic className="w-6 h-6" /> : <FiMicOff className="w-6 h-6" />}
          </button>

          <button
            onClick={() => setShowEndModal(true)}
            className="p-4 rounded-full bg-red-600 hover:bg-red-700 text-white transition-colors"
            aria-label="End call"
          >
            <FiPhoneOff className="w-6 h-6" />
          </button>

          <button
            onClick={toggleVideo}
            className={`p-4 rounded-full ${
              videoEnabled ? 'bg-gray-700 hover:bg-gray-600' : 'bg-red-600 hover:bg-red-700'
            } text-white transition-colors`}
            aria-label={videoEnabled ? 'Turn off camera' : 'Turn on camera'}
          >
            {videoEnabled ? <FiVideo className="w-6 h-6" /> : <FiVideoOff className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* End Session Confirmation Modal */}
      <EndSessionModal
        isOpen={showEndModal}
        onClose={() => setShowEndModal(false)}
        onConfirm={handleEndSession}
        title="End Consultation?"
        message="Are you sure you want to end this consultation?"
      />
    </>
  );
}