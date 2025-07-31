import { NextRequest } from 'next/server';
import { GET, PUT } from '../../../../app/api/video/consultation/[id]/waiting-status/route';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

// Mock dependencies
jest.mock('@/lib/prisma', () => ({
  prisma: {
    consultation: {
      findFirst: jest.fn(),
      update: jest.fn(),
    },
  },
}));

jest.mock('@/lib/auth', () => ({
  auth: jest.fn(),
}));

describe('/api/video/consultation/[id]/waiting-status', () => {
  const mockAppointmentId = 'test-appointment-id';
  const mockSession = { user: { email: 'client@example.com' } };
  
  const mockConsultation = {
    id: 'consultation-id',
    appointmentId: mockAppointmentId,
    waitingRoomStatus: 'client-waiting',
    sessionStartedAt: null,
    sessionEndedAt: null,
    twilioRoomStatus: 'pending',
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
    (auth as jest.Mock).mockResolvedValue(mockSession);
    (prisma.consultation.findFirst as jest.Mock).mockResolvedValue(mockConsultation);
  });

  describe('GET', () => {
    it('should return waiting room status for authorized user', async () => {
      const req = new NextRequest('http://localhost:3000', {
        method: 'GET',
      });

      const response = await GET(req, { params: Promise.resolve({ id: mockAppointmentId }) });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({
        waitingRoomStatus: 'client-waiting',
        sessionStartedAt: null,
        twilioRoomStatus: 'pending',
        isClientWaiting: true,
        isArtistWaiting: false,
        sessionActive: false,
      });
    });

    it('should detect active session', async () => {
      const activeConsultation = {
        ...mockConsultation,
        sessionStartedAt: new Date(),
      };
      (prisma.consultation.findFirst as jest.Mock).mockResolvedValue(activeConsultation);

      const req = new NextRequest('http://localhost:3000', {
        method: 'GET',
      });

      const response = await GET(req, { params: Promise.resolve({ id: mockAppointmentId }) });
      const data = await response.json();

      expect(data.sessionActive).toBe(true);
    });

    it('should reject unauthorized user', async () => {
      (auth as jest.Mock).mockResolvedValue({ user: { email: 'unauthorized@example.com' } });

      const req = new NextRequest('http://localhost:3000', {
        method: 'GET',
      });

      const response = await GET(req, { params: Promise.resolve({ id: mockAppointmentId }) });

      expect(response.status).toBe(403);
    });
  });

  describe('PUT', () => {
    it('should update waiting status when client joins', async () => {
      (prisma.consultation.update as jest.Mock).mockResolvedValue({
        ...mockConsultation,
        waitingRoomStatus: 'client-waiting',
      });

      const req = new NextRequest('http://localhost:3000', {
        method: 'PUT',
        body: JSON.stringify({ action: 'join-waiting' }),
      });

      const response = await PUT(req, { params: Promise.resolve({ id: mockAppointmentId }) });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(prisma.consultation.update).toHaveBeenCalledWith({
        where: { id: 'consultation-id' },
        data: { waitingRoomStatus: 'client-waiting' },
      });
      expect(data.isClientWaiting).toBe(true);
    });

    it('should update waiting status when client leaves', async () => {
      (prisma.consultation.update as jest.Mock).mockResolvedValue({
        ...mockConsultation,
        waitingRoomStatus: 'empty',
      });

      const req = new NextRequest('http://localhost:3000', {
        method: 'PUT',
        body: JSON.stringify({ action: 'leave-waiting' }),
      });

      const response = await PUT(req, { params: Promise.resolve({ id: mockAppointmentId }) });

      expect(prisma.consultation.update).toHaveBeenCalledWith({
        where: { id: 'consultation-id' },
        data: { waitingRoomStatus: 'empty' },
      });
    });

    it('should handle artist joining when client is waiting', async () => {
      (auth as jest.Mock).mockResolvedValue({ user: { email: 'artist@example.com' } });
      
      const req = new NextRequest('http://localhost:3000', {
        method: 'PUT',
        body: JSON.stringify({ action: 'join-waiting' }),
      });

      await PUT(req, { params: Promise.resolve({ id: mockAppointmentId }) });

      // Artist joining shouldn't change status if client is already waiting
      expect(prisma.consultation.update).toHaveBeenCalledWith({
        where: { id: 'consultation-id' },
        data: { waitingRoomStatus: 'client-waiting' },
      });
    });
  });
});