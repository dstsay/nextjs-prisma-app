import { prisma } from '@/lib/db';
import { AppointmentStatus, AppointmentType } from '@prisma/client';
import { createTestClient, createTestArtist } from '../../fixtures/testData';

describe('Appointment Model', () => {
  describe('Creation', () => {
    it('should create appointment with default values', async () => {
      const client = await createTestClient();
      const artist = await createTestArtist();

      const appointment = await prisma.appointment.create({
        data: {
          clientId: client.id,
          artistId: artist.id,
          scheduledAt: new Date('2024-12-25T10:00:00Z'),
        },
      });

      expect(appointment.duration).toBe(30); // default
      expect(appointment.status).toBe(AppointmentStatus.PENDING); // default
      expect(appointment.type).toBe(AppointmentType.CONSULTATION); // default
      expect(appointment.createdAt).toBeDefined();
      expect(appointment.updatedAt).toBeDefined();
    });

    it('should create appointment with custom values', async () => {
      const client = await createTestClient();
      const artist = await createTestArtist();

      const appointment = await prisma.appointment.create({
        data: {
          clientId: client.id,
          artistId: artist.id,
          scheduledAt: new Date('2024-12-25T10:00:00Z'),
          duration: 90,
          status: AppointmentStatus.CONFIRMED,
          type: AppointmentType.SPECIAL_EVENT,
          notes: 'Special occasion makeup',
        },
      });

      expect(appointment.duration).toBe(90);
      expect(appointment.status).toBe(AppointmentStatus.CONFIRMED);
      expect(appointment.type).toBe(AppointmentType.SPECIAL_EVENT);
      expect(appointment.notes).toBe('Special occasion makeup');
    });
  });

  describe('Status Management', () => {
    it('should update appointment status', async () => {
      const client = await createTestClient();
      const artist = await createTestArtist();

      const appointment = await prisma.appointment.create({
        data: {
          clientId: client.id,
          artistId: artist.id,
          scheduledAt: new Date('2024-12-25T10:00:00Z'),
        },
      });

      expect(appointment.status).toBe(AppointmentStatus.PENDING);

      const updated = await prisma.appointment.update({
        where: { id: appointment.id },
        data: { status: AppointmentStatus.CONFIRMED },
      });

      expect(updated.status).toBe(AppointmentStatus.CONFIRMED);
      expect(updated.updatedAt.getTime()).toBeGreaterThan(appointment.updatedAt.getTime());
    });

    it('should handle cancellation with reason', async () => {
      const client = await createTestClient();
      const artist = await createTestArtist();

      const appointment = await prisma.appointment.create({
        data: {
          clientId: client.id,
          artistId: artist.id,
          scheduledAt: new Date('2024-12-25T10:00:00Z'),
          status: AppointmentStatus.CONFIRMED,
        },
      });

      const cancelled = await prisma.appointment.update({
        where: { id: appointment.id },
        data: {
          status: AppointmentStatus.CANCELLED,
          cancelReason: 'Client had to reschedule due to emergency',
        },
      });

      expect(cancelled.status).toBe(AppointmentStatus.CANCELLED);
      expect(cancelled.cancelReason).toBe('Client had to reschedule due to emergency');
    });
  });

  describe('Relations', () => {
    it('should include client and artist information', async () => {
      const client = await createTestClient({ name: 'Jane Doe' });
      const artist = await createTestArtist({ name: 'Sarah Beauty' });

      const appointment = await prisma.appointment.create({
        data: {
          clientId: client.id,
          artistId: artist.id,
          scheduledAt: new Date('2024-12-25T10:00:00Z'),
        },
        include: {
          client: true,
          artist: true,
        },
      });

      expect(appointment.client.name).toBe('Jane Doe');
      expect(appointment.artist.name).toBe('Sarah Beauty');
    });

    it('should create appointment with consultation', async () => {
      const client = await createTestClient();
      const artist = await createTestArtist();

      const appointment = await prisma.appointment.create({
        data: {
          clientId: client.id,
          artistId: artist.id,
          scheduledAt: new Date('2024-12-25T10:00:00Z'),
          consultation: {
            create: {
              clientId: client.id,
              artistId: artist.id,
              videoRoomUrl: 'https://video.example.com/room/123',
            },
          },
        },
        include: {
          consultation: true,
        },
      });

      expect(appointment.consultation).toBeDefined();
      expect(appointment.consultation!.videoRoomUrl).toBe('https://video.example.com/room/123');
    });
  });

  describe('Queries and Filtering', () => {
    it('should find appointments by date range', async () => {
      const client = await createTestClient();
      const artist = await createTestArtist();

      // Create appointments on different dates
      await prisma.appointment.create({
        data: {
          clientId: client.id,
          artistId: artist.id,
          scheduledAt: new Date('2024-12-20T10:00:00Z'),
        },
      });

      await prisma.appointment.create({
        data: {
          clientId: client.id,
          artistId: artist.id,
          scheduledAt: new Date('2024-12-25T10:00:00Z'),
        },
      });

      await prisma.appointment.create({
        data: {
          clientId: client.id,
          artistId: artist.id,
          scheduledAt: new Date('2024-12-30T10:00:00Z'),
        },
      });

      const appointmentsInRange = await prisma.appointment.findMany({
        where: {
          scheduledAt: {
            gte: new Date('2024-12-24T00:00:00Z'),
            lte: new Date('2024-12-26T23:59:59Z'),
          },
        },
      });

      expect(appointmentsInRange).toHaveLength(1);
      expect(appointmentsInRange[0].scheduledAt).toEqual(new Date('2024-12-25T10:00:00Z'));
    });

    it('should find appointments by status', async () => {
      const client = await createTestClient();
      const artist = await createTestArtist();

      await prisma.appointment.create({
        data: {
          clientId: client.id,
          artistId: artist.id,
          scheduledAt: new Date('2024-12-25T10:00:00Z'),
          status: AppointmentStatus.PENDING,
        },
      });

      await prisma.appointment.create({
        data: {
          clientId: client.id,
          artistId: artist.id,
          scheduledAt: new Date('2024-12-26T10:00:00Z'),
          status: AppointmentStatus.CONFIRMED,
        },
      });

      const confirmedAppointments = await prisma.appointment.findMany({
        where: { status: AppointmentStatus.CONFIRMED },
      });

      expect(confirmedAppointments).toHaveLength(1);
      expect(confirmedAppointments[0].status).toBe(AppointmentStatus.CONFIRMED);
    });

    it('should find upcoming appointments for client', async () => {
      const client = await createTestClient();
      const artist = await createTestArtist();
      const now = new Date();
      const future = new Date(now.getTime() + 24 * 60 * 60 * 1000); // tomorrow
      const past = new Date(now.getTime() - 24 * 60 * 60 * 1000); // yesterday

      // Past appointment
      await prisma.appointment.create({
        data: {
          clientId: client.id,
          artistId: artist.id,
          scheduledAt: past,
        },
      });

      // Future appointment
      await prisma.appointment.create({
        data: {
          clientId: client.id,
          artistId: artist.id,
          scheduledAt: future,
        },
      });

      const upcomingAppointments = await prisma.appointment.findMany({
        where: {
          clientId: client.id,
          scheduledAt: { gt: now },
        },
        orderBy: { scheduledAt: 'asc' },
      });

      expect(upcomingAppointments).toHaveLength(1);
      expect(upcomingAppointments[0].scheduledAt.getTime()).toBeGreaterThan(now.getTime());
    });
  });
});