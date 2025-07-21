import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const quizzes = await prisma.quiz.findMany({
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

    // Ensure we always return an array
    return NextResponse.json(quizzes || []);
  } catch (error) {
    console.error('Error fetching quizzes:', error);
    
    // Return empty array on error
    return NextResponse.json([], { status: 200 });
  }
}