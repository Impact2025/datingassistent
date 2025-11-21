import { NextRequest, NextResponse } from 'next/server';
import { QuizService } from '@/lib/course/quiz-service';
import { verifyAuth } from '@/lib/auth';

// GET /api/quizzes/[lessonId] - Get quiz questions for lesson
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ lessonId: string }> }
) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { lessonId: lessonIdStr } = await params;
    const lessonId = parseInt(lessonIdStr);
    if (isNaN(lessonId)) {
      return NextResponse.json(
        { error: 'Invalid lesson ID' },
        { status: 400 }
      );
    }

    const questions = await QuizService.getQuizQuestions(lessonId);

    return NextResponse.json({ questions });
  } catch (error) {
    console.error('Error fetching quiz questions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch quiz questions' },
      { status: 500 }
    );
  }
}