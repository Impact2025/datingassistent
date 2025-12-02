import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

export const dynamic = 'force-dynamic';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this';

/**
 * GET /api/user/enrolled-programs
 * Get all programs the user is enrolled in with progress
 */
export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const cookieStore = await cookies();
    const token = cookieStore.get('datespark_auth_token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    let userId: number;
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
      userId = decoded.userId;
    } catch {
      return NextResponse.json(
        { error: 'Invalid authentication token' },
        { status: 401 }
      );
    }

    // Get all enrolled programs with progress
    const result = await sql`
      SELECT
        pe.program_id,
        p.slug as program_slug,
        p.name as program_name,
        p.tier as program_tier,
        pe.enrolled_at,
        pe.status,
        upp.overall_progress_percentage,
        upp.completed_lessons,
        upp.total_lessons,
        upp.completed_modules,
        upp.total_modules,
        upp.current_lesson_id,
        upp.last_accessed_at,
        upp.is_completed,
        l.title as current_lesson_title
      FROM program_enrollments pe
      JOIN programs p ON pe.program_id = p.id
      LEFT JOIN user_program_progress upp ON upp.user_id = pe.user_id AND upp.program_id = pe.program_id
      LEFT JOIN lessons l ON l.id = upp.current_lesson_id
      WHERE pe.user_id = ${userId}
        AND pe.status = 'active'
      ORDER BY pe.enrolled_at DESC
    `;

    // For each program, find the next lesson to watch
    const programsWithNext = await Promise.all(
      result.rows.map(async (program: any) => {
        // Get next incomplete lesson
        const nextLessonResult = await sql`
          SELECT l.id, l.title
          FROM lessons l
          JOIN program_modules pm ON l.module_id = pm.id
          LEFT JOIN user_lesson_progress ulp ON ulp.lesson_id = l.id AND ulp.user_id = ${userId}
          WHERE pm.program_id = ${program.program_id}
            AND l.is_published = true
            AND (ulp.is_completed IS NULL OR ulp.is_completed = false)
          ORDER BY pm.display_order, l.display_order
          LIMIT 1
        `;

        return {
          ...program,
          next_lesson_id: nextLessonResult.rows[0]?.id || null,
          next_lesson_title: nextLessonResult.rows[0]?.title || null
        };
      })
    );

    return NextResponse.json({
      success: true,
      programs: programsWithNext
    });

  } catch (error) {
    console.error('Error fetching enrolled programs:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch enrolled programs',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
