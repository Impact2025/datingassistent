import { NextRequest, NextResponse } from 'next/server';
import { getAllCourses, createCourse } from '@/lib/course-service';
import { checkAdminAuth } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';

// GET /api/admin/courses - Get all courses
export async function GET() {
  try {
    const authResult = await checkAdminAuth();

    if (!authResult.isAdmin) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
    }

    const courses = await getAllCourses();
    return NextResponse.json(courses);
  } catch (error) {
    console.error('Error fetching courses:', error);
    return NextResponse.json({ error: 'Failed to fetch courses' }, { status: 500 });
  }
}

// POST /api/admin/courses - Create a new course
export async function POST(request: NextRequest) {
  try {
    const authResult = await checkAdminAuth();

    if (!authResult.isAdmin) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
    }

    const body = await request.json();

    if (!body.title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    const course = await createCourse(body);

    if (!course) {
      return NextResponse.json({ error: 'Failed to create course' }, { status: 500 });
    }

    return NextResponse.json(course);
  } catch (error) {
    console.error('Error creating course:', error);
    return NextResponse.json({ error: 'Failed to create course' }, { status: 500 });
  }
}
