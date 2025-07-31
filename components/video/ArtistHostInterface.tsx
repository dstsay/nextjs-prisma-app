'use client';

import { useState, useEffect, useRef } from 'react';
import { format } from 'date-fns';
import { FiVideo, FiMic, FiMicOff, FiVideoOff, FiPlay, FiUser } from 'react-icons/fi';

interface ArtistHostInterfaceProps {
  appointmentId: string;
  clientName: string;
  appointmentTime: Date;
  onStartSession: () => void;
}

export function ArtistHostInterface({ 
  appointmentId,
  clientName, 
  appointmentTime,
  onStartSession 
}: ArtistHostInterfaceProps) {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [clientWaiting, setClientWaiting] = useState(false);
  const [loading, setLoading] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Initialize local media
  useEffect(() => {
    const initializeMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            frameRate: { ideal: 30 }
          },
          audio: true,
        });
        setLocalStream(stream);
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
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

  // Check waiting room status
  useEffect(() => {
    const checkWaitingStatus = async () => {
      try {
        const response = await fetch(`/api/video/consultation/${appointmentId}/waiting-status`);
        const data = await response.json();
        setClientWaiting(data.isClientWaiting);
      } catch (error) {
        console.error('Failed to check waiting status:', error);
      }
    };

    // Initial check
    checkWaitingStatus();

    // Poll every 3 seconds
    const interval = setInterval(checkWaitingStatus, 3000);

    return () => clearInterval(interval);
  }, [appointmentId]);

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

  // Start session
  const handleStartSession = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/video/consultation/${appointmentId}/start-session`, {
        method: 'POST',
      });

      if (response.ok) {
        onStartSession();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to start session');
      }
    } catch (error) {
      console.error('Failed to start session:', error);
      alert('Failed to start session');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Panel - Appointment Info */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Consultation Details</h2>
              
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Client</p>
                  <p className="font-medium">{clientName}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-600">Scheduled Time</p>
                  <p className="font-medium">{format(appointmentTime, 'h:mm a')}</p>
                  <p className="text-sm text-gray-500">{format(appointmentTime, 'EEEE, MMMM d')}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-600">Duration</p>
                  <p className="font-medium">60 minutes</p>
                </div>
              </div>

              {/* Client Status */}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <FiUser className="w-5 h-5 text-gray-600 mr-2" />
                    <span className="text-sm font-medium">Client Status</span>
                  </div>
                  {clientWaiting ? (
                    <span className="text-sm text-green-600 font-medium">In Waiting Room</span>
                  ) : (
                    <span className="text-sm text-gray-500">Not joined yet</span>
                  )}
                </div>
                
                {clientWaiting && (
                  <div className="mt-3">
                    <button
                      onClick={handleStartSession}
                      disabled={loading}
                      className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <span>Starting...</span>
                      ) : (
                        <>
                          <FiPlay className="w-5 h-5 mr-2" />
                          Start Session
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>

              {/* Pre-session Checklist */}
              <div className="mt-6">
                <h3 className="font-medium mb-3">Pre-Session Checklist</h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    Review client&apos;s quiz responses
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    Prepare product recommendations
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    Check lighting and background
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    Test audio and video
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Right Panel - Video Preview */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Your Video Preview</h2>
              
              {/* Video Preview */}
              <div className="relative bg-black rounded-lg overflow-hidden" style={{ paddingBottom: '56.25%' }}>
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  playsInline
                  className="absolute inset-0 w-full h-full object-cover"
                  style={{ transform: 'scaleX(-1)' }}
                />
                
                {!videoEnabled && (
                  <div className="absolute inset-0 bg-gray-900 flex items-center justify-center">
                    <p className="text-white">Camera is off</p>
                  </div>
                )}
              </div>

              {/* Controls */}
              <div className="mt-6 flex justify-center space-x-4">
                <button
                  onClick={toggleAudio}
                  className={`p-3 rounded-full ${
                    audioEnabled ? 'bg-gray-200 hover:bg-gray-300' : 'bg-red-100 hover:bg-red-200'
                  } transition-colors`}
                  aria-label={audioEnabled ? 'Mute microphone' : 'Unmute microphone'}
                >
                  {audioEnabled ? <FiMic className="w-5 h-5" /> : <FiMicOff className="w-5 h-5 text-red-600" />}
                </button>
                
                <button
                  onClick={toggleVideo}
                  className={`p-3 rounded-full ${
                    videoEnabled ? 'bg-gray-200 hover:bg-gray-300' : 'bg-red-100 hover:bg-red-200'
                  } transition-colors`}
                  aria-label={videoEnabled ? 'Turn off camera' : 'Turn on camera'}
                >
                  {videoEnabled ? <FiVideo className="w-5 h-5" /> : <FiVideoOff className="w-5 h-5 text-red-600" />}
                </button>
              </div>

              {/* Tips */}
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Pro tip:</strong> Position your camera at eye level and ensure good lighting from the front for the best video quality.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}