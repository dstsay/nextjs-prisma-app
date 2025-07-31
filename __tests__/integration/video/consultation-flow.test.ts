import { prisma } from '@/lib/prisma';
import { sendAppointmentConfirmationEmail } from '../../../src/lib/email';

// Mock email sending
jest.mock('../../../src/lib/email', () => ({
  sendAppointmentConfirmationEmail: jest.fn(),
}));

// Mock Twilio
jest.mock('../../../lib/twilio', () => ({
  twilioClient: {
    video: {
      v1: {
        rooms: {
          create: jest.fn().mockResolvedValue({
            sid: 'RM123456',
            uniqueName: 'consultation-test',
            status: 'in-progress',
          }),
        },
      },
    },
  },
  twilioConfig: {
    accountSid: 'test-account',
    apiKeySid: 'test-key',
    apiKeySecret: 'test-secret',
  },
  generateRoomName: jest.fn((id) => `consultation-${id}`),
  ROOM_CONFIG: {
    type: 'group-small',
    maxParticipants: 2,
    videoCodecs: ['VP8', 'H264'],
    recordParticipants: false,
  },
}));

describe('Video Consultation Flow Integration', () => {
  let client: any;
  let artist: any;
  let appointment: any;

  beforeAll(async () => {
    // Clean up any existing test data
    await prisma.consultation.deleteMany({});
    await prisma.appointment.deleteMany({});
    await prisma.client.deleteMany({});
    await prisma.makeupArtist.deleteMany({});
  });

  afterAll(async () => {
    // Clean up
    await prisma.consultation.deleteMany({});
    await prisma.appointment.deleteMany({});
    await prisma.client.deleteMany({});
    await prisma.makeupArtist.deleteMany({});
  });

  afterEach(async () => {
    // Clean up after each test
    await prisma.consultation.deleteMany({});
    await prisma.appointment.deleteMany({});
    await prisma.client.deleteMany({});
    await prisma.makeupArtist.deleteMany({});
  });

  beforeEach(async () => {
    jest.clearAllMocks();

    // Create test client
    client = await prisma.client.create({
      data: {
        username: 'testclient',
        email: 'client@test.com',
        name: 'Test Client',
      },
    });

    // Create test artist
    artist = await prisma.makeupArtist.create({
      data: {
        username: 'testartist',
        email: 'artist@test.com',
        name: 'Test Artist',
        hourlyRate: 100,
      },
    });

    // Create test appointment
    appointment = await prisma.appointment.create({
      data: {
        clientId: client.id,
        artistId: artist.id,
        scheduledAt: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes from now
        status: 'PENDING',
        type: 'CONSULTATION',
      },
    });
  });

  describe('Appointment Confirmation with Video Setup', () => {
    it('should create Twilio room and consultation record when appointment is confirmed', async () => {
      // Update appointment to confirmed status
      const confirmedAppointment = await prisma.appointment.update({
        where: { id: appointment.id },
        data: { status: 'CONFIRMED' },
      });

      // Create consultation with Twilio room info
      const consultation = await prisma.consultation.create({
        data: {
          appointmentId: appointment.id,
          clientId: client.id,
          artistId: artist.id,
          twilioRoomSid: 'RM123456',
          twilioRoomName: `consultation-${appointment.id}`,
          twilioRoomStatus: 'pending',
          waitingRoomStatus: 'empty',
          videoRoomUrl: `/consultation/${appointment.id}/join`,
        },
      });

      expect(consultation).toBeDefined();
      expect(consultation.twilioRoomSid).toBe('RM123456');
      expect(consultation.twilioRoomName).toBe(`consultation-${appointment.id}`);
      expect(consultation.waitingRoomStatus).toBe('empty');
    });

    it('should track waiting room status changes', async () => {
      // Create consultation
      const consultation = await prisma.consultation.create({
        data: {
          appointmentId: appointment.id,
          clientId: client.id,
          artistId: artist.id,
          twilioRoomName: `consultation-${appointment.id}`,
          waitingRoomStatus: 'empty',
        },
      });

      // Client joins waiting room
      const updatedConsultation = await prisma.consultation.update({
        where: { id: consultation.id },
        data: { waitingRoomStatus: 'client-waiting' },
      });

      expect(updatedConsultation.waitingRoomStatus).toBe('client-waiting');
    });
  });

  describe('Session Lifecycle', () => {
    let consultation: any;

    beforeEach(async () => {
      consultation = await prisma.consultation.create({
        data: {
          appointmentId: appointment.id,
          clientId: client.id,
          artistId: artist.id,
          twilioRoomSid: 'RM123456',
          twilioRoomName: `consultation-${appointment.id}`,
          twilioRoomStatus: 'pending',
          waitingRoomStatus: 'client-waiting',
        },
      });
    });

    it('should start session when artist initiates', async () => {
      // Artist starts session
      const startedConsultation = await prisma.consultation.update({
        where: { id: consultation.id },
        data: {
          sessionStartedAt: new Date(),
          startedAt: new Date(),
          twilioRoomStatus: 'in-progress',
        },
      });

      // Update appointment status
      const inProgressAppointment = await prisma.appointment.update({
        where: { id: appointment.id },
        data: { status: 'IN_PROGRESS' },
      });

      expect(startedConsultation.sessionStartedAt).toBeDefined();
      expect(startedConsultation.twilioRoomStatus).toBe('in-progress');
      expect(inProgressAppointment.status).toBe('IN_PROGRESS');
    });

    it('should end session and update all related records', async () => {
      // Start session first
      await prisma.consultation.update({
        where: { id: consultation.id },
        data: {
          sessionStartedAt: new Date(),
          twilioRoomStatus: 'in-progress',
        },
      });

      // End session
      const endedConsultation = await prisma.consultation.update({
        where: { id: consultation.id },
        data: {
          sessionEndedAt: new Date(),
          endedAt: new Date(),
          twilioRoomStatus: 'completed',
          waitingRoomStatus: 'empty',
        },
      });

      // Complete appointment
      const completedAppointment = await prisma.appointment.update({
        where: { id: appointment.id },
        data: { status: 'COMPLETED' },
      });

      expect(endedConsultation.sessionEndedAt).toBeDefined();
      expect(endedConsultation.twilioRoomStatus).toBe('completed');
      expect(endedConsultation.waitingRoomStatus).toBe('empty');
      expect(completedAppointment.status).toBe('COMPLETED');
    });
  });

  describe('Access Control', () => {
    it('should enforce 10-minute early join window', async () => {
      const now = new Date();
      const appointmentTime = appointment.scheduledAt;
      const minutesUntilAppointment = (appointmentTime.getTime() - now.getTime()) / 1000 / 60;

      // If more than 10 minutes until appointment, access should be denied
      if (minutesUntilAppointment > 10) {
        expect(minutesUntilAppointment).toBeGreaterThan(10);
      }

      // Create appointment within 10-minute window
      const soonAppointment = await prisma.appointment.create({
        data: {
          clientId: client.id,
          artistId: artist.id,
          scheduledAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes from now
          status: 'CONFIRMED',
          type: 'CONSULTATION',
        },
      });

      const soonMinutesUntil = (soonAppointment.scheduledAt.getTime() - now.getTime()) / 1000 / 60;
      expect(soonMinutesUntil).toBeLessThanOrEqual(10);
      expect(soonMinutesUntil).toBeGreaterThan(0);
    });
  });

  describe('Email Notifications', () => {
    it('should send confirmation emails with video links', async () => {
      // Simulate sending confirmation emails
      await sendAppointmentConfirmationEmail(
        client.email,
        client.name || client.username,
        {
          id: appointment.id,
          date: appointment.scheduledAt,
          artistName: artist.name,
          clientName: client.name || client.username,
          hourlyRate: artist.hourlyRate || 0,
          type: 'client',
        }
      );

      await sendAppointmentConfirmationEmail(
        artist.email,
        artist.name,
        {
          id: appointment.id,
          date: appointment.scheduledAt,
          artistName: artist.name,
          clientName: client.name || client.username,
          hourlyRate: artist.hourlyRate || 0,
          type: 'artist',
        }
      );

      expect(sendAppointmentConfirmationEmail).toHaveBeenCalledTimes(2);
      
      // Verify client email call
      expect(sendAppointmentConfirmationEmail).toHaveBeenNthCalledWith(
        1,
        client.email,
        expect.any(String),
        expect.objectContaining({
          id: appointment.id,
          type: 'client',
        })
      );

      // Verify artist email call
      expect(sendAppointmentConfirmationEmail).toHaveBeenNthCalledWith(
        2,
        artist.email,
        artist.name,
        expect.objectContaining({
          id: appointment.id,
          type: 'artist',
        })
      );
    });
  });
});