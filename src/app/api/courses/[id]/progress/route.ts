import { NextRequest, NextResponse } from 'next/server';
import { ProgressService } from '@/lib/course/progress-service';
import { verifyAuth } from '@/lib/auth';

// GET /api/courses/[id]/progress - Get user's progress for course
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const courseId = parseInt(params.id);
    if (isNaN(courseId)) {
      return NextResponse.json(
        { error: 'Invalid course ID' },
        { status: 400 }
      );
    }

    const progress = await ProgressService.getCourseProgress(user.id, courseId);

    return NextResponse.json(progress);
  } catch (error) {
    console.error('Error fetching course progress:', error);
    return NextResponse.json(
      { error: 'Failed to fetch progress' },
      { status: 500 }
    );
  }
}

// POST /api/courses/[id]/progress - Enroll in course
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const courseId = parseInt(params.id);
    if (isNaN(courseId)) {
      return NextResponse.json(
        { error: 'Invalid course ID' },
        { status: 400 }
      );
    }

    const enrollment = await ProgressService.enrollUserInCourse(user.id, courseId);
    if (!enrollment) {
      return NextResponse.json(
        { error: 'Failed to enroll in course' },
        { status: 500 }
      );
    }

    return NextResponse.json(enrollment);
  } catch (error) {
    console.error('Error enrolling in course:', error);
    return NextResponse.json(
      { error: 'Failed to enroll in course' },
      { status: 500 }
    );
  }
}