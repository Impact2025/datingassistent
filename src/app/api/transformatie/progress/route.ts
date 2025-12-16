import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

/**
 * POST /api/transformatie/progress
 * Update lesson progress
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user?.id) {
      return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 });
    }

    const body = await request.json();
    const {
      lessonId,
      status,
      videoWatchedSeconds,
      videoCompleted,
      reflectieCompleted,
      reflectieAnswers,
    } = body;

    if (!lessonId) {
      return NextResponse.json({ error: 'lessonId is verplicht' }, { status: 400 });
    }

    // Verify lesson exists and get module info
    const lessonResult = await sql`
      SELECT tl.*, tm.module_order, tm.title as module_title
      FROM transformatie_lessons tl
      JOIN transformatie_modules tm ON tl.module_id = tm.id
      WHERE tl.id = ${lessonId}
    `;

    if (lessonResult.rows.length === 0) {
      return NextResponse.json({ error: 'Les niet gevonden' }, { status: 404 });
    }

    const lesson = lessonResult.rows[0];

    // Check if progress record exists
    const existingProgress = await sql`
      SELECT * FROM transformatie_lesson_progress
      WHERE user_id = ${user.id} AND lesson_id = ${lessonId}
    `;

    let progress;

    if (existingProgress.rows.length > 0) {
      // Update existing progress
      progress = await sql`
        UPDATE transformatie_lesson_progress
        SET
          status = COALESCE(${status || null}, status),
          video_watched_seconds = COALESCE(${videoWatchedSeconds || null}, video_watched_seconds),
          video_completed = COALESCE(${videoCompleted || null}, video_completed),
          reflectie_completed = COALESCE(${reflectieCompleted || null}, reflectie_completed),
          reflectie_answers = COALESCE(${reflectieAnswers ? JSON.stringify(reflectieAnswers) : null}, reflectie_answers),
          started_at = CASE WHEN started_at IS NULL AND ${status} = 'in_progress' THEN NOW() ELSE started_at END,
          completed_at = CASE WHEN ${status} = 'completed' THEN NOW() ELSE completed_at END,
          updated_at = NOW()
        WHERE user_id = ${user.id} AND lesson_id = ${lessonId}
        RETURNING *
      `;
    } else {
      // Create new progress record
      progress = await sql`
        INSERT INTO transformatie_lesson_progress (
          user_id,
          lesson_id,
          status,
          video_watched_seconds,
          video_completed,
          reflectie_completed,
          reflectie_answers,
          started_at,
          completed_at
        ) VALUES (
          ${user.id},
          ${lessonId},
          ${status || 'available'},
          ${videoWatchedSeconds || 0},
          ${videoCompleted || false},
          ${reflectieCompleted || false},
          ${reflectieAnswers ? JSON.stringify(reflectieAnswers) : null},
          ${status === 'in_progress' || status === 'completed' ? 'NOW()' : null},
          ${status === 'completed' ? 'NOW()' : null}
        )
        RETURNING *
      `;
    }

    // If lesson is completed, check if we need to unlock next lesson
    if (status === 'completed') {
      // Get next lesson in same module
      const nextLesson = await sql`
        SELECT id FROM transformatie_lessons
        WHERE module_id = ${lesson.module_id}
        AND lesson_order = ${lesson.lesson_order + 1}
        AND is_published = true
      `;

      if (nextLesson.rows.length > 0) {
        // Create available status for next lesson if not exists
        await sql`
          INSERT INTO transformatie_lesson_progress (user_id, lesson_id, status)
          VALUES (${user.id}, ${nextLesson.rows[0].id}, 'available')
          ON CONFLICT (user_id, lesson_id) DO NOTHING
        `;
      } else {
        // End of module - check for first lesson of next module
        const nextModule = await sql`
          SELECT tl.id
          FROM transformatie_lessons tl
          JOIN transformatie_modules tm ON tl.module_id = tm.id
          WHERE tm.module_order = ${lesson.module_order + 1}
          AND tl.lesson_order = 1
          AND tm.is_published = true
          AND tl.is_published = true
        `;

        if (nextModule.rows.length > 0) {
          await sql`
            INSERT INTO transformatie_lesson_progress (user_id, lesson_id, status)
            VALUES (${user.id}, ${nextModule.rows[0].id}, 'available')
            ON CONFLICT (user_id, lesson_id) DO NOTHING
          `;
        }
      }
    }

    // Calculate updated module progress
    const moduleProgress = await sql`
      SELECT
        COUNT(*)::int as total_lessons,
        COUNT(CASE WHEN tlp.status = 'completed' THEN 1 END)::int as completed_lessons
      FROM transformatie_lessons tl
      LEFT JOIN transformatie_lesson_progress tlp ON tl.id = tlp.lesson_id AND tlp.user_id = ${user.id}
      WHERE tl.module_id = ${lesson.module_id}
      AND tl.is_published = true
    `;

    return NextResponse.json({
      success: true,
      progress: progress.rows[0],
      moduleProgress: {
        total: moduleProgress.rows[0].total_lessons,
        completed: moduleProgress.rows[0].completed_lessons,
        percentage: moduleProgress.rows[0].total_lessons > 0
          ? Math.round((moduleProgress.rows[0].completed_lessons / moduleProgress.rows[0].total_lessons) * 100)
          : 0,
      },
      lesson: {
        id: lesson.id,
        title: lesson.title,
        module: {
          order: lesson.module_order,
          title: lesson.module_title,
        },
      },
    });
  } catch (error) {
    console.error('Progress update error:', error);
    return NextResponse.json(
      {
        error: 'Fout bij updaten voortgang',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/transformatie/progress
 * Get user's complete progress overview
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user?.id) {
      return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 });
    }

    // Get program
    const programResult = await sql`
      SELECT id FROM programs WHERE slug = 'transformatie' LIMIT 1
    `;

    if (programResult.rows.length === 0) {
      return NextResponse.json({ error: 'Programma niet gevonden' }, { status: 404 });
    }

    const programId = programResult.rows[0].id;

    // Get all progress for this user
    const progressResult = await sql`
      SELECT
        tlp.*,
        tl.title as lesson_title,
        tl.lesson_order,
        tl.slug as lesson_slug,
        tm.id as module_id,
        tm.title as module_title,
        tm.module_order,
        tm.phase
      FROM transformatie_lesson_progress tlp
      JOIN transformatie_lessons tl ON tlp.lesson_id = tl.id
      JOIN transformatie_modules tm ON tl.module_id = tm.id
      WHERE tlp.user_id = ${user.id}
      AND tm.program_id = ${programId}
      ORDER BY tm.module_order, tl.lesson_order
    `;

    // Calculate statistics
    const totalLessonsResult = await sql`
      SELECT COUNT(*)::int as count
      FROM transformatie_lessons tl
      JOIN transformatie_modules tm ON tl.module_id = tm.id
      WHERE tm.program_id = ${programId}
      AND tl.is_published = true
      AND tm.is_published = true
    `;

    const totalLessons = totalLessonsResult.rows[0].count;
    const completedLessons = progressResult.rows.filter(
      (p) => p.status === 'completed'
    ).length;

    // Calculate streak (consecutive days with completed lessons)
    const recentCompletions = progressResult.rows
      .filter((p) => p.completed_at)
      .map((p) => new Date(p.completed_at).toDateString())
      .filter((v, i, a) => a.indexOf(v) === i)
      .sort()
      .reverse();

    let streak = 0;
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();

    if (recentCompletions[0] === today || recentCompletions[0] === yesterday) {
      streak = 1;
      for (let i = 1; i < recentCompletions.length; i++) {
        const expected = new Date(
          Date.now() - i * 86400000
        ).toDateString();
        if (recentCompletions[i] === expected) {
          streak++;
        } else {
          break;
        }
      }
    }

    return NextResponse.json({
      success: true,
      progress: progressResult.rows,
      stats: {
        totalLessons,
        completedLessons,
        percentage: totalLessons > 0
          ? Math.round((completedLessons / totalLessons) * 100)
          : 0,
        streak,
        lastActivity: progressResult.rows[0]?.updated_at || null,
      },
    });
  } catch (error) {
    console.error('Get progress error:', error);
    return NextResponse.json(
      {
        error: 'Fout bij ophalen voortgang',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
