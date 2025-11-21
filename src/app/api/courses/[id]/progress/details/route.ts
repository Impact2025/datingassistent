import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { verifyAuth } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const courseId = parseInt(id);
    if (isNaN(courseId)) {
      return NextResponse.json(
        { error: 'Invalid course ID' },
        { status: 400 }
      );
    }

    // Get course info
    const courseResult = await sql`
      SELECT id, title, description, level, duration_hours, thumbnail_url
      FROM courses
      WHERE id = ${courseId}
    `;

    if (courseResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }

    const course = courseResult.rows[0];

    // Get module progress with lesson completion counts
    const modulesResult = await sql`
      SELECT
        cm.id,
        cm.title,
        cm.position,
        COUNT(cl.id) as total_lessons,
        COUNT(ulp.id) as lessons_completed
      FROM course_modules cm
      JOIN course_lessons cl ON cm.id = cl.module_id
      LEFT JOIN user_lesson_progress ulp ON cl.id = ulp.lesson_id
        AND ulp.user_id = ${user.id}
        AND ulp.is_completed = true
      WHERE cm.course_id = ${courseId}
      GROUP BY cm.id, cm.title, cm.position
      ORDER BY cm.position
    `;

    const modules = modulesResult.rows.map(module => ({
      id: module.id,
      title: module.title,
      position: module.position,
      lessons_completed: parseInt(module.lessons_completed),
      total_lessons: parseInt(module.total_lessons),
      progress_percentage: module.total_lessons > 0
        ? Math.round((module.lessons_completed / module.total_lessons) * 100)
        : 0
    }));

    return NextResponse.json({
      course,
      modules
    });
  } catch (error) {
    console.error('Error fetching detailed course progress:', error);
    return NextResponse.json(
      { error: 'Failed to fetch detailed progress' },
      { status: 500 }
    );
  }
}