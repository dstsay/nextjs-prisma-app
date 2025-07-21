import { prisma } from '@/lib/db';
import { QuestionType } from '@prisma/client';
import { createTestClient, createTestQuiz } from '../../fixtures/testData';

describe('Quiz System', () => {
  describe('Quiz Creation', () => {
    it('should create quiz with questions and answer options', async () => {
      const quiz = await prisma.quiz.create({
        data: {
          title: 'Test Quiz',
          description: 'Test Description',
          category: 'intake',
          questions: {
            create: [
              {
                questionText: 'What is your skin type?',
                questionType: QuestionType.MULTIPLE_CHOICE,
                order: 1,
                answerOptions: {
                  create: [
                    {
                      optionText: 'Dry',
                      optionValue: 'dry',
                      optionImage: '/images/dry-skin.jpg',
                      imageAlt: 'Dry skin example',
                      order: 1,
                    },
                    {
                      optionText: 'Oily',
                      optionValue: 'oily',
                      optionImage: '/images/oily-skin.jpg',
                      imageAlt: 'Oily skin example',
                      order: 2,
                    },
                  ],
                },
              },
            ],
          },
        },
        include: {
          questions: {
            include: {
              answerOptions: true,
            },
          },
        },
      });

      expect(quiz.questions).toHaveLength(1);
      expect(quiz.questions[0].answerOptions).toHaveLength(2);
      expect(quiz.questions[0].answerOptions[0].optionImage).toBe('/images/dry-skin.jpg');
      expect(quiz.questions[0].answerOptions[0].imageAlt).toBe('Dry skin example');
    });

    it('should create quiz with different question types', async () => {
      const quiz = await prisma.quiz.create({
        data: {
          title: 'Mixed Question Types Quiz',
          category: 'preferences',
          questions: {
            create: [
              {
                questionText: 'Choose your style',
                questionType: QuestionType.MULTIPLE_CHOICE,
                order: 1,
                answerOptions: {
                  create: [
                    { optionText: 'Natural', optionValue: 'natural', order: 1 },
                    { optionText: 'Glam', optionValue: 'glam', order: 2 },
                  ],
                },
              },
              {
                questionText: 'Describe your ideal look',
                questionType: QuestionType.TEXT,
                order: 2,
              },
              {
                questionText: 'Rate your experience',
                questionType: QuestionType.RATING,
                order: 3,
              },
            ],
          },
        },
        include: { questions: { include: { answerOptions: true } } },
      });

      expect(quiz.questions).toHaveLength(3);
      expect(quiz.questions[0].questionType).toBe(QuestionType.MULTIPLE_CHOICE);
      expect(quiz.questions[1].questionType).toBe(QuestionType.TEXT);
      expect(quiz.questions[2].questionType).toBe(QuestionType.RATING);
    });
  });

  describe('Quiz Response', () => {
    it('should save client quiz responses with multiple choice answers', async () => {
      const client = await createTestClient();
      const quiz = await createTestQuiz();
      const question = quiz.questions[0];
      const selectedOption = question.answerOptions[0];

      const response = await prisma.quizResponse.create({
        data: {
          clientId: client.id,
          quizId: quiz.id,
          answers: {
            create: {
              questionId: question.id,
              answerOptionId: selectedOption.id,
            },
          },
        },
        include: {
          answers: {
            include: {
              answerOption: true,
            },
          },
        },
      });

      expect(response.answers).toHaveLength(1);
      expect(response.answers[0].answerOption?.optionValue).toBe('opt1');
      expect(response.answers[0].answerOptionId).toBe(selectedOption.id);
    });

    it('should handle text answers', async () => {
      const client = await createTestClient();
      const quiz = await prisma.quiz.create({
        data: {
          title: 'Text Quiz',
          category: 'preferences',
          questions: {
            create: {
              questionText: 'Describe your ideal look',
              questionType: QuestionType.TEXT,
              order: 1,
            },
          },
        },
        include: { questions: true },
      });

      const response = await prisma.quizResponse.create({
        data: {
          clientId: client.id,
          quizId: quiz.id,
          answers: {
            create: {
              questionId: quiz.questions[0].id,
              textAnswer: 'Natural glow with subtle highlights',
            },
          },
        },
        include: { answers: true },
      });

      expect(response.answers[0].textAnswer).toBe('Natural glow with subtle highlights');
      expect(response.answers[0].answerOptionId).toBeNull();
    });

    it('should handle rating answers', async () => {
      const client = await createTestClient();
      const quiz = await prisma.quiz.create({
        data: {
          title: 'Rating Quiz',
          category: 'preferences',
          questions: {
            create: {
              questionText: 'Rate your satisfaction',
              questionType: QuestionType.RATING,
              order: 1,
            },
          },
        },
        include: { questions: true },
      });

      const response = await prisma.quizResponse.create({
        data: {
          clientId: client.id,
          quizId: quiz.id,
          answers: {
            create: {
              questionId: quiz.questions[0].id,
              numberAnswer: 4,
            },
          },
        },
        include: { answers: true },
      });

      expect(response.answers[0].numberAnswer).toBe(4);
      expect(response.answers[0].textAnswer).toBeNull();
      expect(response.answers[0].answerOptionId).toBeNull();
    });

    it('should track quiz completion', async () => {
      const client = await createTestClient();
      const quiz = await createTestQuiz();

      const startTime = Date.now();
      const response = await prisma.quizResponse.create({
        data: {
          clientId: client.id,
          quizId: quiz.id,
          completedAt: new Date(startTime + 1), // Ensure completedAt is after startedAt
        },
      });

      expect(response.completedAt).toBeDefined();
      expect(response.startedAt).toBeDefined();
      expect(response.startedAt.getTime()).toBeLessThanOrEqual(response.completedAt!.getTime());
    });
  });

  describe('Cascading Deletes', () => {
    it('should delete related data when quiz is deleted', async () => {
      const quiz = await createTestQuiz();
      const questionId = quiz.questions[0].id;
      const optionId = quiz.questions[0].answerOptions[0].id;

      await prisma.quiz.delete({
        where: { id: quiz.id },
      });

      const question = await prisma.question.findUnique({
        where: { id: questionId },
      });
      const option = await prisma.answerOption.findUnique({
        where: { id: optionId },
      });

      expect(question).toBeNull();
      expect(option).toBeNull();
    });

    it('should delete answers when quiz response is deleted', async () => {
      const client = await createTestClient();
      const quiz = await createTestQuiz();
      
      const response = await prisma.quizResponse.create({
        data: {
          clientId: client.id,
          quizId: quiz.id,
          answers: {
            create: {
              questionId: quiz.questions[0].id,
              answerOptionId: quiz.questions[0].answerOptions[0].id,
            },
          },
        },
        include: { answers: true },
      });

      const answerId = response.answers[0].id;

      await prisma.quizResponse.delete({
        where: { id: response.id },
      });

      const answer = await prisma.answer.findUnique({
        where: { id: answerId },
      });

      expect(answer).toBeNull();
    });
  });

  describe('Quiz Ordering and Filtering', () => {
    it('should order quizzes by order field', async () => {
      await prisma.quiz.create({
        data: { title: 'Quiz 3', category: 'intake', order: 3 },
      });
      await prisma.quiz.create({
        data: { title: 'Quiz 1', category: 'intake', order: 1 },
      });
      await prisma.quiz.create({
        data: { title: 'Quiz 2', category: 'intake', order: 2 },
      });

      const quizzes = await prisma.quiz.findMany({
        orderBy: { order: 'asc' },
      });

      expect(quizzes).toHaveLength(3);
      expect(quizzes[0].title).toBe('Quiz 1');
      expect(quizzes[1].title).toBe('Quiz 2');
      expect(quizzes[2].title).toBe('Quiz 3');
    });

    it('should filter active quizzes', async () => {
      await prisma.quiz.create({
        data: { title: 'Active Quiz', category: 'intake', isActive: true },
      });
      await prisma.quiz.create({
        data: { title: 'Inactive Quiz', category: 'intake', isActive: false },
      });

      const activeQuizzes = await prisma.quiz.findMany({
        where: { isActive: true },
      });

      expect(activeQuizzes).toHaveLength(1);
      expect(activeQuizzes[0].title).toBe('Active Quiz');
    });
  });
});