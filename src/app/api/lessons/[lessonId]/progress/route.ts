import { NextRequest, NextResponse } from 'next/server';
import { ProgressService } from '@/lib/course/progress-service';
import { verifyAuth } from '@/lib/auth';

// GET /api/lessons/[lessonId]/progress - Get user's progress for lesson
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

    const progress = await ProgressService.getLessonProgress(user.id, lessonId);

    return NextResponse.json(progress);
  } catch (error) {
    console.error('Error fetching lesson progress:', error);
    return NextResponse.json(
      { error: 'Failed to fetch progress' },
      { status: 500 }
    );
  }
}

// PUT /api/lessons/[lessonId]/progress - Update lesson progress
export async function PUT(
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

    const data = await request.json();
    const { is_completed, watch_time_seconds } = data;

    const progress = await ProgressService.updateLessonProgress(user.id, lessonId, {
      is_completed: is_completed || false,
      watch_time_seconds: watch_time_seconds || 0
    });

    if (!progress) {
      return NextResponse.json(
        { error: 'Failed to update progress' },
        { status: 500 }
      );
    }

    return NextResponse.json(progress);
  } catch (error) {
    console.error('Error updating lesson progress:', error);
    return NextResponse.json(
      { error: 'Failed to update progress' },
      { status: 500 }
    );
  }
}