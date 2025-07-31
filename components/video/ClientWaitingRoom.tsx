'use client';

import { useState, useEffect } from 'react';
import { format, differenceInMinutes } from 'date-fns';
import { FiVideo, FiMic, FiMicOff, FiVideoOff } from 'react-icons/fi';

interface ClientWaitingRoomProps {
  appointmentTime: Date;
  artistName: string;
  onSessionStart: () => void;
}

export function ClientWaitingRoom({ 
  appointmentTime, 
  artistName,
  onSessionStart 
}: ClientWaitingRoomProps) {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [timeUntilAppointment, setTimeUntilAppointment] = useState<number>(0);

  // Initialize local video preview
  useEffect(() => {
    const initializeMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'user',
            width: { ideal: 480 },
            height: { ideal: 640 },
          },
          audio: true,
        });
        setLocalStream(stream);
      } catch (error) {
        console.error('Failed to access camera/microphone:', error);
      }
    };

    initializeMedia();

    return () => {
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Update time countdown
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const minutes = differenceInMinutes(appointmentTime, now);
      setTimeUntilAppointment(minutes);
    };

    updateTime();
    const interval = setInterval(updateTime, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, [appointmentTime]);

  // Toggle video
  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setVideoEnabled(videoTrack.enabled);
      }
    }
  };

  // Toggle audio
  const toggleAudio = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setAudioEnabled(audioTrack.enabled);
      }
    }
  };

  // Poll for session start
  useEffect(() => {
    const checkSessionStatus = async () => {
      try {
        const appointmentId = window.location.pathname.split('/')[2];
        const response = await fetch(`/api/video/consultation/${appointmentId}/waiting-status`);
        const data = await response.json();
        
        if (data.sessionActive) {
          onSessionStart();
        }
      } catch (error) {
        console.error('Failed to check session status:', error);
      }
    };

    const interval = setInterval(checkSessionStatus, 3000); // Check every 3 seconds

    return () => clearInterval(interval);
  }, [onSessionStart]);

  return (
    <div className="fixed inset-0 bg-gray-900 flex flex-col h-screen">
      {/* Header */}
      <div className="bg-gray-800 p-4 text-white">
        <h1 className="text-lg font-semibold">Waiting for {artistName}</h1>
        <p className="text-sm text-gray-300">
          Appointment at {format(appointmentTime, 'h:mm a')}
          {timeUntilAppointment > 0 && ` (in ${timeUntilAppointment} minutes)`}
        </p>
      </div>

      {/* Video Preview */}
      <div className="flex-1 relative bg-black">
        {localStream && (
          <video
            autoPlay
            muted
            playsInline
            className="w-full h-full object-cover"
            style={{ transform: 'scaleX(-1)' }} // Mirror for selfie view
            ref={(video) => {
              if (video && localStream) {
                video.srcObject = localStream;
              }
            }}
          />
        )}
        
        {/* Waiting Message Overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-black bg-opacity-70 rounded-lg p-6 text-center">
            <div className="animate-pulse mb-4">
              <div className="w-16 h-16 bg-purple-600 rounded-full mx-auto flex items-center justify-center">
                <FiVideo className="w-8 h-8 text-white" />
              </div>
            </div>
            <h2 className="text-white text-xl font-medium mb-2">
              Waiting for your artist to start the session
            </h2>
            <p className="text-gray-300 text-sm">
              They&apos;ll be with you shortly
            </p>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-gray-800 p-4">
        <div className="flex justify-center space-x-4">
          <button
            onClick={toggleAudio}
            className={`p-4 rounded-full ${
              audioEnabled ? 'bg-gray-700' : 'bg-red-600'
            } text-white transition-colors`}
            aria-label={audioEnabled ? 'Mute microphone' : 'Unmute microphone'}
          >
            {audioEnabled ? <FiMic className="w-6 h-6" /> : <FiMicOff className="w-6 h-6" />}
          </button>
          
          <button
            onClick={toggleVideo}
            className={`p-4 rounded-full ${
              videoEnabled ? 'bg-gray-700' : 'bg-red-600'
            } text-white transition-colors`}
            aria-label={videoEnabled ? 'Turn off camera' : 'Turn on camera'}
          >
            {videoEnabled ? <FiVideo className="w-6 h-6" /> : <FiVideoOff className="w-6 h-6" />}
          </button>
        </div>
        
        <p className="text-center text-gray-400 text-sm mt-4">
          Make sure you&apos;re in a well-lit area
        </p>
      </div>
    </div>
  );
}