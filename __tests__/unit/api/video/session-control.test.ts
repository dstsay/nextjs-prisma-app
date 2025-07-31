import { NextRequest } from 'next/server';
import { POST as startSession } from '../../../../app/api/video/consultation/[id]/start-session/route';
import { POST as endSession } from '../../../../app/api/video/consultation/[id]/end-session/route';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { twilioClient } from '@/lib/twilio';

// Mock dependencies
jest.mock('@/lib/prisma', () => ({
  prisma: {
    consultation: {
      findFirst: jest.fn(),
      update: jest.fn(),
    },
    appointment: {
      update: jest.fn(),
    },
  },
}));

jest.mock('@/lib/auth', () => ({
  auth: jest.fn(),
}));

jest.mock('../../../../lib/twilio', () => ({
  twilioClient: {
    video: {
      v1: {
        rooms: jest.fn(() => ({
          update: jest.fn(),
        })),
      },
    },
  },
}));

describe('Video Session Control APIs', () => {
  const mockAppointmentId = 'test-appointment-id';
  const mockArtistSession = { user: { email: 'artist@example.com' } };
  const mockClientSession = { user: { email: 'client@example.com' } };
  
  const mockConsultation = {
    id: 'consultation-id',
    appointmentId: mockAppointmentId,
    waitingRoomStatus: 'client-waiting',
    sessionStartedAt: null,
    sessionEndedAt: null,
    twilioRoomSid: 'RM123456',
    appointment: {
      client: {
        email: 'client@example.com',
      },
      artist: {
        email: 'artist@example.com',
      },
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('/api/video/consultation/[id]/start-session', () => {
    beforeEach(() => {
      (auth as jest.Mock).mockResolvedValue(mockArtistSession);
      (prisma.consultation.findFirst as jest.Mock).mockResolvedValue(mockConsultation);
      (prisma.consultation.update as jest.Mock).mockResolvedValue({
        ...mockConsultation,
        sessionStartedAt: new Date(),
      });
    });

    it('should start session when artist initiates', async () => {
      const req = new NextRequest('http://localhost:3000', {
        method: 'POST',
      });

      const response = await startSession(req, { params: Promise.resolve({ id: mockAppointmentId }) });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.message).toBe('Session started successfully');
      
      expect(prisma.consultation.update).toHaveBeenCalledWith({
        where: { id: 'consultation-id' },
        data: {
          sessionStartedAt: expect.any(Date),
          twilioRoomStatus: 'in-progress',
          startedAt: expect.any(Date),
        },
      });

      expect(prisma.appointment.update).toHaveBeenCalledWith({
        where: { id: mockAppointmentId },
        data: { status: 'IN_PROGRESS' },
      });
    });

    it('should reject if client is not waiting', async () => {
      (prisma.consultation.findFirst as jest.Mock).mockResolvedValue({
        ...mockConsultation,
        waitingRoomStatus: 'empty',
      });

      const req = new NextRequest('http://localhost:3000', {
        method: 'POST',
      });

      const response = await startSession(req, { params: Promise.resolve({ id: mockAppointmentId }) });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toBe('Client is not in waiting room');
    });

    it('should reject if client tries to start session', async () => {
      (auth as jest.Mock).mockResolvedValue(mockClientSession);

      const req = new NextRequest('http://localhost:3000', {
        method: 'POST',
      });

      const response = await startSession(req, { params: Promise.resolve({ id: mockAppointmentId }) });

      expect(response.status).toBe(403);
      const data = await response.json();
      expect(data.error).toBe('Only artists can start sessions');
    });
  });

  describe('/api/video/consultation/[id]/end-session', () => {
    const activeConsultation = {
      ...mockConsultation,
      sessionStartedAt: new Date(),
    };

    beforeEach(() => {
      (auth as jest.Mock).mockResolvedValue(mockClientSession);
      (prisma.consultation.findFirst as jest.Mock).mockResolvedValue(activeConsultation);
      (prisma.consultation.update as jest.Mock).mockResolvedValue({
        ...activeConsultation,
        sessionEndedAt: new Date(),
      });
    });

    it('should end session with confirmation', async () => {
      const mockRoomUpdate = jest.fn();
      (twilioClient.video.v1.rooms as jest.Mock).mockReturnValue({
        update: mockRoomUpdate,
      });

      const req = new NextRequest('http://localhost:3000', {
        method: 'POST',
        body: JSON.stringify({ confirmed: true }),
      });

      const response = await endSession(req, { params: Promise.resolve({ id: mockAppointmentId }) });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.endedBy).toBe('client');

      expect(mockRoomUpdate).toHaveBeenCalledWith({ status: 'completed' });
      
      expect(prisma.consultation.update).toHaveBeenCalledWith({
        where: { id: 'consultation-id' },
        data: {
          sessionEndedAt: expect.any(Date),
          endedAt: expect.any(Date),
          twilioRoomStatus: 'completed',
          waitingRoomStatus: 'empty',
        },
      });

      expect(prisma.appointment.update).toHaveBeenCalledWith({
        where: { id: mockAppointmentId },
        data: { status: 'COMPLETED' },
      });
    });

    it('should require confirmation', async () => {
      const req = new NextRequest('http://localhost:3000', {
        method: 'POST',
        body: JSON.stringify({ confirmed: false }),
      });

      const response = await endSession(req, { params: Promise.resolve({ id: mockAppointmentId }) });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toBe('Confirmation required');
    });

    it('should reject if no active session', async () => {
      (prisma.consultation.findFirst as jest.Mock).mockResolvedValue(mockConsultation);

      const req = new NextRequest('http://localhost:3000', {
        method: 'POST',
        body: JSON.stringify({ confirmed: true }),
      });

      const response = await endSession(req, { params: Promise.resolve({ id: mockAppointmentId }) });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toBe('No active session');
    });

    it('should handle artist ending session', async () => {
      (auth as jest.Mock).mockResolvedValue(mockArtistSession);

      const req = new NextRequest('http://localhost:3000', {
        method: 'POST',
        body: JSON.stringify({ confirmed: true }),
      });

      const response = await endSession(req, { params: Promise.resolve({ id: mockAppointmentId }) });
      const data = await response.json();

      expect(data.endedBy).toBe('artist');
    });
  });
});