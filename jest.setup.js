const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Reset database between tests
beforeEach(async () => {
  await prisma.$transaction([
    prisma.answer.deleteMany(),
    prisma.quizResponse.deleteMany(),
    prisma.answerOption.deleteMany(),
    prisma.question.deleteMany(),
    prisma.quiz.deleteMany(),
    prisma.consultation.deleteMany(),
    prisma.appointment.deleteMany(),
    prisma.review.deleteMany(),
    prisma.availability.deleteMany(),
    prisma.client.deleteMany(),
    prisma.makeupArtist.deleteMany(),
  ]);
});

afterAll(async () => {
  await prisma.$disconnect();
});