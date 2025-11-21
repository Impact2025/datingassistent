import { NextRequest, NextResponse } from 'next/server';
import { getFullCourseData } from '@/lib/course-service';

// GET /api/courses/:id - Get a specific course with all modules and lessons
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const courseId = parseInt(params.id);

    if (isNaN(courseId)) {
      return NextResponse.json(
        { error: 'Invalid course ID' },
        { status: 400 }
      );
    }

    const courseData = await getFullCourseData(courseId);

    if (!courseData) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }

    // Only return published courses to regular users
    if (!courseData.is_published) {
      return NextResponse.json(
        { error: 'Course not available' },
        { status: 404 }
      );
    }

    return NextResponse.json(courseData, { status: 200 });
  } catch (error) {
    console.error('Error fetching course:', error);
    return NextResponse.json(
      { error: 'Failed to fetch course' },
      { status: 500 }
    );
  }
}
