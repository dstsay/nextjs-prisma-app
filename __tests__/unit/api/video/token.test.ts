import { NextRequest } from 'next/server';
import { POST } from '../../../../app/api/video/consultation/[id]/token/route';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { jwt } from 'twilio';

// Mock dependencies
jest.mock('@/lib/prisma', () => ({
  prisma: {
    appointment: {
      findUnique: jest.fn(),
    },
    consultation: {
      update: jest.fn(),
    },
  },
}));

jest.mock('@/lib/auth', () => ({
  auth: jest.fn(),
}));

jest.mock('twilio', () => {
  const mockAccessToken = jest.fn().mockImplementation(() => ({
    addGrant: jest.fn(),
    toJwt: jest.fn().mockReturnValue('mock-jwt-token'),
  }));
  
  mockAccessToken.VideoGrant = jest.fn().mockImplementation(() => ({}));
  
  return {
    jwt: {
      AccessToken: mockAccessToken,
    },
  };
});

describe('/api/video/consultation/[id]/token', () => {
  const mockAppointmentId = 'test-appointment-id';
  const mockSession = { user: { email: 'client@example.com' } };
  
  const mockAppointment = {
    id: mockAppointmentId,
    scheduledAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes from now
    status: 'CONFIRMED',
    duration: 60,
    consultation: {
      id: 'consultation-id',
      twilioRoomName: 'consultation-test-appointment-id',
      waitingRoomStatus: 'empty',
    },
    client: {
      id: 'client-id',
      email: 'client@example.com',
      firstName: 'John',
      name: 'John Doe',
    },
    artist: {
      id: 'artist-id',
      email: 'artist@example.com',
      name: 'Jane Doe',
      profileImage: null,
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (auth as jest.Mock).mockResolvedValue(mockSession);
    (prisma.appointment.findUnique as jest.Mock).mockResolvedValue(mockAppointment);
    (prisma.consultation.update as jest.Mock).mockResolvedValue({});
  });

  it('should generate token for authorized client', async () => {
    const req = new NextRequest('http://localhost:3000', {
      method: 'POST',
    });

    const response = await POST(req, { params: Promise.resolve({ id: mockAppointmentId }) });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({
      token: 'mock-jwt-token',
      identity: expect.stringContaining('client-'),
      roomName: 'consultation-test-appointment-id',
      isHost: false,
      appointment: {
        id: mockAppointmentId,
        scheduledAt: expect.any(String),
        duration: 60,
      },
      artist: {
        name: 'Jane Doe',
        profileImage: null,
      },
      client: {
        name: 'John Doe',
      },
    });
  });

  it('should generate token for authorized artist', async () => {
    (auth as jest.Mock).mockResolvedValue({ user: { email: 'artist@example.com' } });

    const req = new NextRequest('http://localhost:3000', {
      method: 'POST',
    });

    const response = await POST(req, { params: Promise.resolve({ id: mockAppointmentId }) });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.isHost).toBe(true);
    expect(data.identity).toContain('artist-');
  });

  it('should reject if user is not authorized', async () => {
    (auth as jest.Mock).mockResolvedValue({ user: { email: 'unauthorized@example.com' } });

    const req = new NextRequest('http://localhost:3000', {
      method: 'POST',
    });

    const response = await POST(req, { params: Promise.resolve({ id: mockAppointmentId }) });

    expect(response.status).toBe(403);
    const data = await response.json();
    expect(data.error).toBe('Unauthorized for this appointment');
  });

  it('should reject if outside 10-minute window', async () => {
    const futureAppointment = {
      ...mockAppointment,
      scheduledAt: new Date(Date.now() + 20 * 60 * 1000), // 20 minutes from now
    };
    (prisma.appointment.findUnique as jest.Mock).mockResolvedValue(futureAppointment);

    const req = new NextRequest('http://localhost:3000', {
      method: 'POST',
    });

    const response = await POST(req, { params: Promise.resolve({ id: mockAppointmentId }) });

    expect(response.status).toBe(403);
    const data = await response.json();
    expect(data.error).toBe('Outside allowed time window');
    expect(data.minutesUntilStart).toBeGreaterThan(0);
  });

  it('should update waiting room status for client', async () => {
    const req = new NextRequest('http://localhost:3000', {
      method: 'POST',
    });

    await POST(req, { params: Promise.resolve({ id: mockAppointmentId }) });

    expect(prisma.consultation.update).toHaveBeenCalledWith({
      where: { id: 'consultation-id' },
      data: { waitingRoomStatus: 'client-waiting' },
    });
  });
});