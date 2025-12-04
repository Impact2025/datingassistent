import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

export const dynamic = 'force-dynamic';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this';

/**
 * Helper: Check if a table exists in the database
 */
async function tableExists(tableName: string): Promise<boolean> {
  try {
    const result = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = ${tableName}
      ) as exists
    `;
    return result.rows[0]?.exists === true;
  } catch {
    return false;
  }
}

/**
 * Helper: Get Kickstart progress for a user
 */
async function getKickstartProgress(userId: number, programId: number) {
  const hasUserDayProgress = await tableExists('user_day_progress');
  const hasProgramDays = await tableExists('program_days');

  if (!hasUserDayProgress || !hasProgramDays) {
    // Tables don't exist yet - return default progress
    return {
      completed_days: 0,
      next_day: 1,
      last_completed_day: null,
      progress_percentage: 0,
      total_days: 21
    };
  }

  try {
    // Check if user has any progress records
    const progressCount = await sql`
      SELECT COUNT(*) as count
      FROM user_day_progress
      WHERE user_id = ${userId} AND program_id = ${programId}
    `;

    if (parseInt(progressCount.rows[0].count) === 0) {
      // No progress records yet - initialize them
      await initializeKickstartProgress(userId, programId);
    }

    // Get progress stats
    const progressResult = await sql`
      SELECT
        COUNT(*) FILTER (WHERE udp.status = 'completed') as completed_days,
        MAX(pd.dag_nummer) FILTER (WHERE udp.status = 'completed') as last_completed_day,
        COALESCE(
          MIN(pd.dag_nummer) FILTER (WHERE udp.status IN ('available', 'in_progress')),
          1
        ) as next_day
      FROM user_day_progress udp
      JOIN program_days pd ON pd.id = udp.day_id
      WHERE udp.user_id = ${userId}
        AND udp.program_id = ${programId}
    `;

    const progress = progressResult.rows[0];
    const completedDays = parseInt(progress.completed_days) || 0;
    const nextDay = parseInt(progress.next_day) || 1;
    const progressPercentage = Math.round((completedDays / 21) * 100);

    return {
      completed_days: completedDays,
      next_day: nextDay,
      last_completed_day: progress.last_completed_day,
      progress_percentage: progressPercentage,
      total_days: 21
    };
  } catch (error) {
    console.error('Error getting Kickstart progress:', error);
    return {
      completed_days: 0,
      next_day: 1,
      last_completed_day: null,
      progress_percentage: 0,
      total_days: 21
    };
  }
}

/**
 * Helper: Initialize Kickstart progress for a new user
 */
async function initializeKickstartProgress(userId: number, programId: number) {
  try {
    // Get all days for Kickstart
    const days = await sql`
      SELECT id, dag_nummer FROM program_days
      WHERE program_id = ${programId}
      ORDER BY dag_nummer
    `;

    if (days.rows.length === 0) {
      console.log('No days found for Kickstart program');
      return;
    }

    // Initialize progress for each day
    for (const day of days.rows) {
      // Day 1 is available, rest are locked
      const status = day.dag_nummer === 1 ? 'available' : 'locked';

      await sql`
        INSERT INTO user_day_progress (user_id, program_id, day_id, status)
        VALUES (${userId}, ${programId}, ${day.id}, ${status})
        ON CONFLICT (user_id, day_id) DO NOTHING
      `;
    }

    console.log(`Initialized Kickstart progress for user ${userId}`);
  } catch (error) {
    console.error('Error initializing Kickstart progress:', error);
  }
}

/**
 * Helper: Get standard program progress for a user
 */
async function getStandardProgramProgress(userId: number, programId: number) {
  const hasUserProgramProgress = await tableExists('user_program_progress');

  if (!hasUserProgramProgress) {
    // Table doesn't exist - return default progress
    return {
      overall_progress_percentage: 0,
      completed_lessons: 0,
      total_lessons: 0,
      completed_modules: 0,
      total_modules: 0,
      current_lesson_id: null,
      last_accessed_at: null,
      is_completed: false
    };
  }

  try {
    const result = await sql`
      SELECT
        overall_progress_percentage,
        completed_lessons,
        total_lessons,
        completed_modules,
        total_modules,
        current_lesson_id,
        last_accessed_at,
        is_completed
      FROM user_program_progress
      WHERE user_id = ${userId} AND program_id = ${programId}
    `;

    if (result.rows.length === 0) {
      return {
        overall_progress_percentage: 0,
        completed_lessons: 0,
        total_lessons: 0,
        completed_modules: 0,
        total_modules: 0,
        current_lesson_id: null,
        last_accessed_at: null,
        is_completed: false
      };
    }

    return result.rows[0];
  } catch (error) {
    console.error('Error getting standard program progress:', error);
    return {
      overall_progress_percentage: 0,
      completed_lessons: 0,
      total_lessons: 0,
      completed_modules: 0,
      total_modules: 0,
      current_lesson_id: null,
      last_accessed_at: null,
      is_completed: false
    };
  }
}

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

    // Get all enrolled programs (this table should always exist)
    const result = await sql`
      SELECT
        pe.program_id,
        p.slug as program_slug,
        p.name as program_name,
        p.tier as program_tier,
        pe.enrolled_at,
        pe.status
      FROM program_enrollments pe
      JOIN programs p ON pe.program_id = p.id
      WHERE pe.user_id = ${userId}
        AND pe.status = 'active'
      ORDER BY pe.enrolled_at DESC
    `;

    // For each program, get progress data based on program type
    const programsWithProgress = await Promise.all(
      result.rows.map(async (program: any) => {
        // Special handling for Kickstart (day-based program)
        if (program.program_slug === 'kickstart') {
          const kickstartProgress = await getKickstartProgress(userId, program.program_id);

          return {
            ...program,
            program_type: 'kickstart',
            completed_days: kickstartProgress.completed_days,
            total_days: kickstartProgress.total_days,
            next_day: kickstartProgress.next_day,
            last_completed_day: kickstartProgress.last_completed_day,
            overall_progress_percentage: kickstartProgress.progress_percentage,
            // Null out lesson fields for Kickstart
            completed_lessons: null,
            total_lessons: null,
            completed_modules: null,
            total_modules: null,
            next_lesson_id: null,
            next_lesson_title: null,
            current_lesson_title: null
          };
        }

        // Standard lesson-based programs
        const standardProgress = await getStandardProgramProgress(userId, program.program_id);

        // Try to get next lesson title if we have a current_lesson_id
        let nextLessonTitle = null;
        if (standardProgress.current_lesson_id) {
          try {
            const lessonResult = await sql`
              SELECT title FROM lessons WHERE id = ${standardProgress.current_lesson_id}
            `;
            nextLessonTitle = lessonResult.rows[0]?.title || null;
          } catch {
            // Ignore errors getting lesson title
          }
        }

        return {
          ...program,
          program_type: 'standard',
          overall_progress_percentage: standardProgress.overall_progress_percentage,
          completed_lessons: standardProgress.completed_lessons,
          total_lessons: standardProgress.total_lessons,
          completed_modules: standardProgress.completed_modules,
          total_modules: standardProgress.total_modules,
          current_lesson_id: standardProgress.current_lesson_id,
          current_lesson_title: nextLessonTitle,
          last_accessed_at: standardProgress.last_accessed_at,
          is_completed: standardProgress.is_completed,
          next_lesson_id: standardProgress.current_lesson_id,
          next_lesson_title: nextLessonTitle
        };
      })
    );

    return NextResponse.json({
      success: true,
      programs: programsWithProgress
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
