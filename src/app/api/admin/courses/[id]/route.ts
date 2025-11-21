import { NextRequest, NextResponse } from 'next/server';
import { getCourseById, updateCourse, deleteCourse, getFullCourseData } from '@/lib/course-service';
import { checkAdminAuth } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';

// GET /api/admin/courses/[id] - Get full course data with modules and lessons
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await checkAdminAuth();

    if (!authResult.isAdmin) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
    }

    const params = await context.params;
    const id = parseInt(params.id);

    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid course ID' }, { status: 400 });
    }

    const courseData = await getFullCourseData(id);

    if (!courseData) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    return NextResponse.json(courseData);
  } catch (error) {
    console.error('Error fetching course:', error);
    return NextResponse.json({ error: 'Failed to fetch course' }, { status: 500 });
  }
}

// PUT /api/admin/courses/[id] - Update a course
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await checkAdminAuth();

    if (!authResult.isAdmin) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
    }

    const params = await context.params;
    const id = parseInt(params.id);

    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid course ID' }, { status: 400 });
    }

    const body = await request.json();
    const success = await updateCourse(id, body);

    if (!success) {
      return NextResponse.json({ error: 'Failed to update course' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating course:', error);
    return NextResponse.json({ error: 'Failed to update course' }, { status: 500 });
  }
}

// DELETE /api/admin/courses/[id] - Delete a course
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await checkAdminAuth();

    if (!authResult.isAdmin) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
    }

    const params = await context.params;
    const id = parseInt(params.id);

    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid course ID' }, { status: 400 });
    }

    const success = await deleteCourse(id);

    if (!success) {
      return NextResponse.json({ error: 'Failed to delete course' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting course:', error);
    return NextResponse.json({ error: 'Failed to delete course' }, { status: 500 });
  }
}
