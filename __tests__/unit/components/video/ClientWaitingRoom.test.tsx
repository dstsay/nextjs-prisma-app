import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ClientWaitingRoom } from '../../../../components/video/ClientWaitingRoom';

// Mock navigator.mediaDevices
const mockGetUserMedia = jest.fn();
Object.defineProperty(navigator, 'mediaDevices', {
  writable: true,
  value: {
    getUserMedia: mockGetUserMedia,
  },
});

// Mock fetch
global.fetch = jest.fn();

describe('ClientWaitingRoom', () => {
  const mockOnSessionStart = jest.fn();
  const mockAppointmentTime = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes from now
  
  const mockMediaStream = {
    getTracks: jest.fn().mockReturnValue([]),
    getVideoTracks: jest.fn().mockReturnValue([{
      enabled: true,
      stop: jest.fn(),
    }]),
    getAudioTracks: jest.fn().mockReturnValue([{
      enabled: true,
      stop: jest.fn(),
    }]),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetUserMedia.mockResolvedValue(mockMediaStream);
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ sessionActive: false }),
    });
    
    // Mock window.location.pathname
    Object.defineProperty(window, 'location', {
      writable: true,
      value: { pathname: '/consultation/test-id/join' },
    });
  });

  it('should render waiting room with artist name', () => {
    render(
      <ClientWaitingRoom
        appointmentTime={mockAppointmentTime}
        artistName="Jane Doe"
        onSessionStart={mockOnSessionStart}
      />
    );

    expect(screen.getByText('Waiting for Jane Doe')).toBeInTheDocument();
    expect(screen.getByText(/Appointment at/)).toBeInTheDocument();
  });

  it('should show time until appointment', () => {
    render(
      <ClientWaitingRoom
        appointmentTime={mockAppointmentTime}
        artistName="Jane Doe"
        onSessionStart={mockOnSessionStart}
      />
    );

    expect(screen.getByText(/in \d+ minutes/)).toBeInTheDocument();
  });

  it('should request camera and microphone access', async () => {
    render(
      <ClientWaitingRoom
        appointmentTime={mockAppointmentTime}
        artistName="Jane Doe"
        onSessionStart={mockOnSessionStart}
      />
    );

    await waitFor(() => {
      expect(mockGetUserMedia).toHaveBeenCalledWith({
        video: {
          facingMode: 'user',
          width: { ideal: 480 },
          height: { ideal: 640 },
        },
        audio: true,
      });
    });
  });

  it('should toggle video when video button is clicked', async () => {
    const mockVideoTrack = {
      enabled: true,
      stop: jest.fn(),
    };
    mockMediaStream.getVideoTracks.mockReturnValue([mockVideoTrack]);

    render(
      <ClientWaitingRoom
        appointmentTime={mockAppointmentTime}
        artistName="Jane Doe"
        onSessionStart={mockOnSessionStart}
      />
    );

    await waitFor(() => {
      const videoButton = screen.getByLabelText('Turn off camera');
      fireEvent.click(videoButton);
    });

    expect(mockVideoTrack.enabled).toBe(false);
  });

  it('should toggle audio when audio button is clicked', async () => {
    const mockAudioTrack = {
      enabled: true,
      stop: jest.fn(),
    };
    mockMediaStream.getAudioTracks.mockReturnValue([mockAudioTrack]);

    render(
      <ClientWaitingRoom
        appointmentTime={mockAppointmentTime}
        artistName="Jane Doe"
        onSessionStart={mockOnSessionStart}
      />
    );

    await waitFor(() => {
      const audioButton = screen.getByLabelText('Mute microphone');
      fireEvent.click(audioButton);
    });

    expect(mockAudioTrack.enabled).toBe(false);
  });

  it('should poll for session status', async () => {
    jest.useFakeTimers();

    render(
      <ClientWaitingRoom
        appointmentTime={mockAppointmentTime}
        artistName="Jane Doe"
        onSessionStart={mockOnSessionStart}
      />
    );

    // Fast forward 3 seconds
    jest.advanceTimersByTime(3000);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/video/consultation/test-id/waiting-status'
      );
    });

    jest.useRealTimers();
  });

  it('should call onSessionStart when session becomes active', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ sessionActive: true }),
    });

    render(
      <ClientWaitingRoom
        appointmentTime={mockAppointmentTime}
        artistName="Jane Doe"
        onSessionStart={mockOnSessionStart}
      />
    );

    await waitFor(() => {
      expect(mockOnSessionStart).toHaveBeenCalled();
    });
  });

  it('should cleanup media stream on unmount', async () => {
    const mockTrack = {
      stop: jest.fn(),
    };
    mockMediaStream.getTracks.mockReturnValue([mockTrack]);

    const { unmount } = render(
      <ClientWaitingRoom
        appointmentTime={mockAppointmentTime}
        artistName="Jane Doe"
        onSessionStart={mockOnSessionStart}
      />
    );

    await waitFor(() => {
      expect(mockGetUserMedia).toHaveBeenCalled();
    });

    unmount();

    expect(mockTrack.stop).toHaveBeenCalled();
  });
});