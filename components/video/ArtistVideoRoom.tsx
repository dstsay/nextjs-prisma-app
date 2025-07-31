'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { connect, Room, RemoteParticipant, LocalVideoTrack, LocalAudioTrack } from 'twilio-video';
import { FiVideo, FiMic, FiMicOff, FiVideoOff, FiPhoneOff, FiMonitor, FiMessageSquare, FiClock } from 'react-icons/fi';
import { EndSessionModal } from './EndSessionModal';
import { format } from 'date-fns';

interface ArtistVideoRoomProps {
  token: string;
  roomName: string;
  clientName: string;
  appointmentId: string;
  appointmentTime: Date;
  onSessionEnd: () => void;
}

export function ArtistVideoRoom({ 
  token, 
  roomName, 
  clientName,
  appointmentId,
  appointmentTime,
  onSessionEnd 
}: ArtistVideoRoomProps) {
  const [room, setRoom] = useState<Room | null>(null);
  const [participants, setParticipants] = useState<RemoteParticipant[]>([]);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [showEndModal, setShowEndModal] = useState(false);
  const [isConnecting, setIsConnecting] = useState(true);
  const [sessionDuration, setSessionDuration] = useState(0);
  const [showNotes, setShowNotes] = useState(false);
  const [notes, setNotes] = useState('');
  
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
            width: { ideal: 1280 },
            height: { ideal: 720 },
            frameRate: { ideal: 30 }
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

  // Session timer
  useEffect(() => {
    const interval = setInterval(() => {
      setSessionDuration(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

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
    const participant = participants[0]; // Client is the only other participant
    
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

  // Handle screen share
  const handleScreenShare = async () => {
    // Screen sharing implementation would go here
    alert('Screen sharing feature coming soon!');
  };

  // Handle end session
  const handleEndSession = async () => {
    try {
      // Save notes if any
      if (notes) {
        // TODO: Save notes to consultation record
      }

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

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (isConnecting) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p>Connecting to consultation...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="h-screen bg-gray-900 flex">
        {/* Main Video Area */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="bg-gray-800 px-6 py-3 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-white font-medium">Consultation with {clientName}</h1>
              <div className="flex items-center text-gray-300 text-sm">
                <FiClock className="w-4 h-4 mr-1" />
                {formatDuration(sessionDuration)}
              </div>
            </div>
            <div className="text-gray-300 text-sm">
              Started at {format(appointmentTime, 'h:mm a')}
            </div>
          </div>

          {/* Video Grid */}
          <div className="flex-1 p-4 grid grid-cols-2 gap-4">
            {/* Remote Video (Client) */}
            <div className="relative bg-black rounded-lg overflow-hidden">
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
              <audio ref={remoteAudioRef} autoPlay />
              <div className="absolute bottom-4 left-4 bg-black bg-opacity-50 rounded px-3 py-1">
                <p className="text-white text-sm">{clientName}</p>
              </div>
            </div>

            {/* Local Video (Artist) */}
            <div className="relative bg-black rounded-lg overflow-hidden">
              <video
                ref={localVideoRef}
                autoPlay
                muted
                playsInline
                className="w-full h-full object-cover"
                style={{ transform: 'scaleX(-1)' }}
              />
              <div className="absolute bottom-4 left-4 bg-black bg-opacity-50 rounded px-3 py-1">
                <p className="text-white text-sm">You</p>
              </div>
            </div>
          </div>

          {/* Controls Bar */}
          <div className="bg-gray-800 px-6 py-4 flex items-center justify-center space-x-4">
            <button
              onClick={toggleAudio}
              className={`p-3 rounded-full ${
                audioEnabled ? 'bg-gray-700 hover:bg-gray-600' : 'bg-red-600 hover:bg-red-700'
              } text-white transition-colors`}
              aria-label={audioEnabled ? 'Mute' : 'Unmute'}
            >
              {audioEnabled ? <FiMic className="w-5 h-5" /> : <FiMicOff className="w-5 h-5" />}
            </button>

            <button
              onClick={toggleVideo}
              className={`p-3 rounded-full ${
                videoEnabled ? 'bg-gray-700 hover:bg-gray-600' : 'bg-red-600 hover:bg-red-700'
              } text-white transition-colors`}
              aria-label={videoEnabled ? 'Turn off camera' : 'Turn on camera'}
            >
              {videoEnabled ? <FiVideo className="w-5 h-5" /> : <FiVideoOff className="w-5 h-5" />}
            </button>

            <button
              onClick={handleScreenShare}
              className="p-3 rounded-full bg-gray-700 hover:bg-gray-600 text-white transition-colors"
              aria-label="Share screen"
            >
              <FiMonitor className="w-5 h-5" />
            </button>

            <button
              onClick={() => setShowNotes(!showNotes)}
              className={`p-3 rounded-full ${
                showNotes ? 'bg-purple-600' : 'bg-gray-700 hover:bg-gray-600'
              } text-white transition-colors`}
              aria-label="Toggle notes"
            >
              <FiMessageSquare className="w-5 h-5" />
            </button>

            <button
              onClick={() => setShowEndModal(true)}
              className="p-3 rounded-full bg-red-600 hover:bg-red-700 text-white transition-colors ml-8"
              aria-label="End call"
            >
              <FiPhoneOff className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Sidebar (Notes/Chat) */}
        {showNotes && (
          <div className="w-96 bg-gray-800 border-l border-gray-700 flex flex-col">
            <div className="p-4 border-b border-gray-700">
              <h2 className="text-white font-medium">Session Notes</h2>
            </div>
            <div className="flex-1 p-4">
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add notes about the consultation..."
                className="w-full h-full bg-gray-900 text-white p-3 rounded resize-none focus:outline-none focus:ring-2 focus:ring-purple-600"
              />
            </div>
          </div>
        )}
      </div>

      {/* End Session Confirmation Modal */}
      <EndSessionModal
        isOpen={showEndModal}
        onClose={() => setShowEndModal(false)}
        onConfirm={handleEndSession}
        title="End Consultation?"
        message="Are you sure you want to end this consultation? Make sure to save any important notes."
      />
    </>
  );
}