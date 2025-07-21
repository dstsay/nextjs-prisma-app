import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    // Debug queries
    const allQuizzes = await prisma.quiz.findMany();
    const activeQuizzes = await prisma.quiz.findMany({
      where: { isActive: true }
    });
    const quizzesWithQuestions = await prisma.quiz.findMany({
      where: { isActive: true },
      include: {
        questions: {
          include: {
            answerOptions: true,
          },
        },
      },
    });

    return NextResponse.json({
      totalQuizzes: allQuizzes.length,
      activeQuizzes: activeQuizzes.length,
      quizzesWithQuestions: quizzesWithQuestions,
      firstQuiz: allQuizzes[0] || null,
    });
  } catch (error) {
    console.error('Debug error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}