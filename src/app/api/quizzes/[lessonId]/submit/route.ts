import { NextRequest, NextResponse } from 'next/server';
import { QuizService } from '@/lib/course/quiz-service';
import { verifyAuth } from '@/lib/auth';

// POST /api/quizzes/[lessonId]/submit - Submit quiz answers
export async function POST(
  request: NextRequest,
  { params }: { params: { lessonId: string } }
) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const lessonId = parseInt(params.lessonId);
    if (isNaN(lessonId)) {
      return NextResponse.json(
        { error: 'Invalid lesson ID' },
        { status: 400 }
      );
    }

    const { answers } = await request.json();
    if (!answers || typeof answers !== 'object') {
      return NextResponse.json(
        { error: 'Invalid answers format' },
        { status: 400 }
      );
    }

    const result = await QuizService.submitQuiz(user.id, lessonId, answers);
    if (!result) {
      return NextResponse.json(
        { error: 'Failed to submit quiz' },
        { status: 500 }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error submitting quiz:', error);
    return NextResponse.json(
      { error: 'Failed to submit quiz' },
      { status: 500 }
    );
  }
}

// GET /api/quizzes/[lessonId]/submit - Get user's quiz result
export async function GET(
  request: NextRequest,
  { params }: { params: { lessonId: string } }
) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const lessonId = parseInt(params.lessonId);
    if (isNaN(lessonId)) {
      return NextResponse.json(
        { error: 'Invalid lesson ID' },
        { status: 400 }
      );
    }

    const result = await QuizService.getQuizResult(user.id, lessonId);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching quiz result:', error);
    return NextResponse.json(
      { error: 'Failed to fetch quiz result' },
      { status: 500 }
    );
  }
}