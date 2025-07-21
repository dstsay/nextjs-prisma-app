import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function createTestClient(overrides: any = {}) {
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
      ...overrides,
    },
  });
}

export async function createTestQuiz(overrides: any = {}) {
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