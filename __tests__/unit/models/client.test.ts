import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { createTestClient, createTestArtist } from '../../fixtures/testData';

describe('Client Model', () => {
  beforeEach(async () => {
    // Clean up the database before each test - order matters due to foreign keys
    await prisma.consultation.deleteMany({});
    await prisma.appointment.deleteMany({});
    await prisma.answer.deleteMany({});
    await prisma.quizResponse.deleteMany({});
    await prisma.review.deleteMany({});
    await prisma.availability.deleteMany({});
    await prisma.client.deleteMany({});
    await prisma.makeupArtist.deleteMany({});
  });

  afterAll(async () => {
    // Clean up after all tests and disconnect
    await prisma.consultation.deleteMany({});
    await prisma.appointment.deleteMany({});
    await prisma.answer.deleteMany({});
    await prisma.quizResponse.deleteMany({});
    await prisma.review.deleteMany({});
    await prisma.availability.deleteMany({});
    await prisma.client.deleteMany({});
    await prisma.makeupArtist.deleteMany({});
    await prisma.$disconnect();
  });
  describe('Creation', () => {
    it('should create a client with valid data', async () => {
      const timestamp = Date.now();
      const hashedPassword = await bcrypt.hash('password123', 10);
      const client = await prisma.client.create({
        data: {
          username: `testuser_${timestamp}`,
          password: hashedPassword,
          email: `test_${timestamp}@example.com`,
          name: 'Test User',
          phone: '+1234567890',
        },
      });

      expect(client).toBeDefined();
      expect(client.username).toBe(`testuser_${timestamp}`);
      expect(client.email).toBe(`test_${timestamp}@example.com`);
      expect(client.id).toBeDefined();
      expect(client.createdAt).toBeDefined();
      expect(client.updatedAt).toBeDefined();
    });

    it('should enforce unique username constraint', async () => {
      const timestamp = Date.now();
      const hashedPassword = await bcrypt.hash('password123', 10);
      
      await prisma.client.create({
        data: {
          username: `testuser_unique_${timestamp}`,
          password: hashedPassword,
          email: `test1_${timestamp}@example.com`,
        },
      });

      await expect(
        prisma.client.create({
          data: {
            username: `testuser_unique_${timestamp}`,
            password: hashedPassword,
            email: `test2_${timestamp}@example.com`,
          },
        })
      ).rejects.toThrow();
    });

    it('should enforce unique email constraint', async () => {
      const timestamp = Date.now();
      const hashedPassword = await bcrypt.hash('password123', 10);
      
      await prisma.client.create({
        data: {
          username: `testuser1_${timestamp}`,
          password: hashedPassword,
          email: `test_unique_${timestamp}@example.com`,
        },
      });

      await expect(
        prisma.client.create({
          data: {
            username: `testuser2_${timestamp}`,
            password: hashedPassword,
            email: `test_unique_${timestamp}@example.com`,
          },
        })
      ).rejects.toThrow();
    });
  });

  describe('Relations', () => {
    it('should create client with appointments', async () => {
      const artist = await createTestArtist();
      const timestamp = Date.now();
      const client = await prisma.client.create({
        data: {
          username: `testuser_rel_${timestamp}`,
          password: await bcrypt.hash('password123', 10),
          email: `test_rel_${timestamp}@example.com`,
          appointments: {
            create: {
              artistId: artist.id,
              scheduledAt: new Date('2024-12-25T10:00:00Z'),
              duration: 60,
            },
          },
        },
        include: {
          appointments: true,
        },
      });

      expect(client.appointments).toHaveLength(1);
      expect(client.appointments[0].duration).toBe(60);
      expect(client.appointments[0].artistId).toBe(artist.id);
    });

    it('should delete client after removing related data', async () => {
      const client = await createTestClient();
      const artist = await createTestArtist();

      // Create related data
      const appointment = await prisma.appointment.create({
        data: {
          clientId: client.id,
          artistId: artist.id,
          scheduledAt: new Date('2024-12-25T10:00:00Z'),
        },
      });

      const review = await prisma.review.create({
        data: {
          clientId: client.id,
          artistId: artist.id,
          rating: 5,
        },
      });

      // Delete related data first to avoid foreign key constraints
      await prisma.appointment.delete({
        where: { id: appointment.id },
      });
      await prisma.review.delete({
        where: { id: review.id },
      });

      // Now delete client
      await prisma.client.delete({
        where: { id: client.id },
      });

      // Verify client is deleted
      const foundClient = await prisma.client.findUnique({
        where: { id: client.id },
      });
      expect(foundClient).toBeNull();
    });
  });

  describe('Password Security', () => {
    it('should never return raw password in queries', async () => {
      const hashedPassword = await bcrypt.hash('password123', 10);
      
      const client = await prisma.client.create({
        data: {
          username: 'testuser',
          password: hashedPassword,
          email: 'test@example.com',
        },
      });

      expect(client.password).toBe(hashedPassword);
      expect(client.password).not.toBe('password123');
      expect(await bcrypt.compare('password123', client.password)).toBe(true);
    });

    it('should validate password hashing', async () => {
      const plainPassword = 'mySecretPassword';
      const hashedPassword = await bcrypt.hash(plainPassword, 10);

      const client = await prisma.client.create({
        data: {
          username: 'testuser',
          password: hashedPassword,
          email: 'test@example.com',
        },
      });

      // Should be able to verify password
      expect(await bcrypt.compare(plainPassword, client.password)).toBe(true);
      expect(await bcrypt.compare('wrongPassword', client.password)).toBe(false);
    });
  });

  describe('Validation', () => {
    it('should require username', async () => {
      const timestamp = Date.now();
      await expect(
        prisma.client.create({
          data: {
            password: await bcrypt.hash('password123', 10),
            email: `test_val1_${timestamp}@example.com`,
          } as any,
        })
      ).rejects.toThrow();
    });

    it('should require email', async () => {
      const timestamp = Date.now();
      await expect(
        prisma.client.create({
          data: {
            username: `testuser_val2_${timestamp}`,
            password: await bcrypt.hash('password123', 10),
          } as any,
        })
      ).rejects.toThrow();
    });

    it('should require password', async () => {
      const timestamp = Date.now();
      await expect(
        prisma.client.create({
          data: {
            username: `testuser_val3_${timestamp}`,
            email: `test_val3_${timestamp}@example.com`,
          } as any,
        })
      ).rejects.toThrow();
    });
  });
});