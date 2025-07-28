import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { getTestPrismaClient } from '../utils/integration-test-setup';

// Helper to get prisma client - uses test client in test environment
function getPrisma(): PrismaClient {
  if (process.env.NODE_ENV === 'test') {
    try {
      return getTestPrismaClient();
    } catch {
      // Fallback for tests that don't use the new setup
      const { prisma } = require('@/lib/prisma');
      return prisma;
    }
  }
  const { prisma } = require('@/lib/prisma');
  return prisma;
}

export async function createTestClient(overrides: any = {}) {
  const prisma = getPrisma();
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000);
  return prisma.client.create({
    data: {
      username: `client_${timestamp}_${random}`,
      password: await bcrypt.hash('password123', 10),
      email: `client_${timestamp}_${random}@test.com`,
      name: 'Test Client',
      ...overrides,
    },
  });
}

export async function createTestArtist(overrides: any = {}) {
  const prisma = getPrisma();
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000);
  return prisma.makeupArtist.create({
    data: {
      username: `artist_${timestamp}_${random}`,
      password: await bcrypt.hash('password123', 10),
      email: `artist_${timestamp}_${random}@test.com`,
      name: 'Test Artist',
      specialties: ['Bridal', 'Natural'],
      yearsExperience: 5,
      hourlyRate: 100,
      profileImage: 'goldiegrace/profile-images/test/profile',
      portfolioImages: [
        'goldiegrace/portfolio/test/portfolio1',
        'goldiegrace/portfolio/test/portfolio2',
        'goldiegrace/portfolio/test/portfolio3',
      ],
      location: 'New York, NY',
      badges: ['Certified Pro', 'Best of Beauty 2024'],
      ...overrides,
    },
  });
}

export async function createTestReview(
  clientId: string,
  artistId: string,
  overrides: any = {}
) {
  const prisma = getPrisma();
  return prisma.review.create({
    data: {
      clientId,
      artistId,
      rating: 5,
      comment: 'Great service!',
      isPublished: true,
      ...overrides,
    },
  });
}

export async function createTestQuiz(overrides: any = {}) {
  const prisma = getPrisma();
  const timestamp = Date.now();
  return prisma.quiz.create({
    data: {
      title: `Test Quiz ${timestamp}`,
      category: 'intake',
      questions: {
        create: {
          questionText: 'Test Question',
          questionType: 'MULTIPLE_CHOICE',
          order: 1,
          answerOptions: {
            create: [
              { optionText: 'Option 1', optionValue: 'opt1', order: 1 },
              { optionText: 'Option 2', optionValue: 'opt2', order: 2 },
            ],
          },
        },
      },
      ...overrides,
    },
    include: {
      questions: {
        include: {
          answerOptions: true,
        },
      },
    },
  });
}