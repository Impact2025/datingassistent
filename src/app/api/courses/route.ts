import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

// GET /api/courses - Get all published courses for users
export async function GET() {
  try {
    // Get all published courses with their modules and lessons count
    const result = await sql`
      SELECT
        c.*,
        COUNT(DISTINCT cm.id) as module_count,
        COUNT(DISTINCT cl.id) as lesson_count
      FROM courses c
      LEFT JOIN course_modules cm ON c.id = cm.course_id
      LEFT JOIN course_lessons cl ON cm.id = cl.module_id
      WHERE c.is_published = true
      GROUP BY c.id
      ORDER BY c.position ASC, c.created_at DESC
    `;

    return NextResponse.json(result.rows, { status: 200 });
  } catch (error) {
    console.error('Error fetching courses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch courses' },
      { status: 500 }
    );
  }
}
