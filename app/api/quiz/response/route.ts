import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { questionId, answerOptionId, textAnswer, numberAnswer, quizResponseId } = body;

    // Get the question to find the quiz ID
    const question = await prisma.question.findUnique({
      where: { id: questionId },
      select: { quizId: true },
    });

    if (!question) {
      return NextResponse.json(
        { error: 'Question not found' },
        { status: 404 }
      );
    }

    let responseId = quizResponseId;

    // Create quiz response if it doesn't exist
    if (!responseId) {
      // For now, create a temporary client ID (in production, this would come from auth)
      const tempClientId = 'temp-client-' + Date.now();
      
      // Check if a temp client exists or create one
      let client = await prisma.client.findFirst({
        where: { username: tempClientId },
      });

      if (!client) {
        client = await prisma.client.create({
          data: {
            username: tempClientId,
            email: `${tempClientId}@temp.com`,
            password: 'temp-password-hash',
          },
        });
      }

      const quizResponse = await prisma.quizResponse.create({
        data: {
          clientId: client.id,
          quizId: question.quizId,
        },
      });

      responseId = quizResponse.id;
    }

    // Create the answer
    const answer = await prisma.answer.create({
      data: {
        responseId,
        questionId,
        answerOptionId,
        textAnswer,
        numberAnswer,
      },
    });

    return NextResponse.json({
      answer,
      quizResponseId: responseId,
    });
  } catch (error) {
    console.error('Error saving answer:', error);
    return NextResponse.json(
      { error: 'Failed to save answer' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const responseId = searchParams.get('responseId');

    if (!responseId) {
      return NextResponse.json(
        { error: 'Response ID required' },
        { status: 400 }
      );
    }

    const quizResponse = await prisma.quizResponse.findUnique({
      where: { id: responseId },
      include: {
        answers: {
          include: {
            question: true,
            answerOption: true,
          },
        },
        quiz: true,
        client: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!quizResponse) {
      return NextResponse.json(
        { error: 'Quiz response not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(quizResponse);
  } catch (error) {
    console.error('Error fetching quiz response:', error);
    return NextResponse.json(
      { error: 'Failed to fetch quiz response' },
      { status: 500 }
    );
  }
}