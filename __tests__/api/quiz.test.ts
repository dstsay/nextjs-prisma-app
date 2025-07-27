import { GET } from '../../app/api/quiz/route';
import { prisma } from '@/lib/db';
import { NextRequest } from 'next/server';

// Mock prisma
jest.mock('@/lib/db', () => ({
  prisma: {
    quiz: {
      findMany: jest.fn(),
    },
  },
}));

describe('/api/quiz', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return active quizzes with questions', async () => {
    const mockQuizzes = [
      {
        id: 'quiz1',
        title: 'Beauty Profile Questionnaire',
        description: 'Test quiz',
        category: 'intake',
        order: 1,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        questions: [
          {
            id: 'q1',
            questionText: 'Test question?',
            questionType: 'MULTIPLE_CHOICE',
            order: 1,
            quizId: 'quiz1',
            answerOptions: [
              {
                id: 'a1',
                optionText: 'Option 1',
                optionValue: 'opt1',
                order: 1,
              },
            ],
          },
        ],
      },
    ];

    (prisma.quiz.findMany as jest.Mock).mockResolvedValue(mockQuizzes);

    const response = await GET();
    const data = await response.json();

    expect(prisma.quiz.findMany).toHaveBeenCalledWith({
      where: {
        isActive: true,
      },
      include: {
        questions: {
          include: {
            answerOptions: true,
          },
          orderBy: {
            order: 'asc',
          },
        },
      },
      orderBy: {
        order: 'asc',
      },
    });

    // Convert dates to strings to match JSON serialization
    const expectedData = JSON.parse(JSON.stringify(mockQuizzes));
    expect(data).toEqual(expectedData);
  });

  it('should return empty array when no active quizzes exist', async () => {
    (prisma.quiz.findMany as jest.Mock).mockResolvedValue([]);

    const response = await GET();
    const data = await response.json();

    expect(data).toEqual([]);
  });

  it('should return empty array on database error', async () => {
    (prisma.quiz.findMany as jest.Mock).mockRejectedValue(new Error('Database error'));

    const response = await GET();
    const data = await response.json();

    expect(data).toEqual([]);
    expect(response.status).toBe(200);
  });

  it('should handle prisma connection errors gracefully', async () => {
    const prismaError = new Error('Unable to connect to database');
    (prisma.quiz.findMany as jest.Mock).mockRejectedValue(prismaError);

    const response = await GET();
    const data = await response.json();

    expect(data).toEqual([]);
  });
});