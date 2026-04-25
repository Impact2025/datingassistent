import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

async function checkAndAwardBadges(userId: number, lessonId: number, context: {
  justCompleted?: boolean;
  assignmentJustCompleted?: boolean;
  aiFeedbackUsed?: boolean;
}) {
  const newBadges: any[] = [];

  try {
    // Get lesson + module info
    const lessonInfo = await sql`
      SELECT tl.id, tl.lesson_order, tm.module_order, tm.phase, tm.program_id
      FROM transformatie_lessons tl
      JOIN transformatie_modules tm ON tl.module_id = tm.id
      WHERE tl.id = ${lessonId}
    `;
    if (lessonInfo.rows.length === 0) return newBadges;
    const { module_order, phase, program_id } = lessonInfo.rows[0];

    const awardBadge = async (slug: string) => {
      const badge = await sql`SELECT id FROM transformatie_badges WHERE slug = ${slug}`;
      if (badge.rows.length === 0) return;
      const result = await sql`
        INSERT INTO transformatie_user_badges (user_id, badge_id)
        VALUES (${userId}, ${badge.rows[0].id})
        ON CONFLICT (user_id, badge_id) DO NOTHING
        RETURNING *
      `;
      if (result.rows.length > 0) {
        const badgeData = await sql`SELECT * FROM transformatie_badges WHERE id = ${badge.rows[0].id}`;
        if (badgeData.rows.length > 0) newBadges.push(badgeData.rows[0]);
      }
    };

    if (context.justCompleted) {
      // Module completion badge
      const moduleSlugMap: Record<number, string> = {
        1: 'module-1-voltooid', 4: 'module-4-voltooid',
        5: 'module-5-voltooid', 8: 'module-8-voltooid', 12: 'module-12-voltooid',
      };
      if (moduleSlugMap[module_order]) {
        const completedInModule = await sql`
          SELECT COUNT(*)::int as count
          FROM transformatie_lessons tl
          JOIN transformatie_lesson_progress tlp ON tl.id = tlp.lesson_id
          WHERE tl.module_id = (SELECT module_id FROM transformatie_lessons WHERE id = ${lessonId})
          AND tlp.user_id = ${userId}
          AND tlp.status = 'completed'
        `;
        const totalInModule = await sql`
          SELECT COUNT(*)::int as count FROM transformatie_lessons
          WHERE module_id = (SELECT module_id FROM transformatie_lessons WHERE id = ${lessonId})
          AND is_published = true
        `;
        if (completedInModule.rows[0].count >= totalInModule.rows[0].count) {
          await awardBadge(moduleSlugMap[module_order]);
        }
      }

      // Phase completion badge
      const phaseSlugMap: Record<string, string> = {
        DESIGN: 'design-fase-voltooid',
        ACTION: 'action-fase-voltooid',
        SURRENDER: 'surrender-fase-voltooid',
      };
      if (phaseSlugMap[phase]) {
        const completedInPhase = await sql`
          SELECT COUNT(*)::int as count
          FROM transformatie_lessons tl
          JOIN transformatie_modules tm ON tl.module_id = tm.id
          JOIN transformatie_lesson_progress tlp ON tl.id = tlp.lesson_id
          WHERE tm.phase = ${phase}
          AND tm.program_id = ${program_id}
          AND tlp.user_id = ${userId}
          AND tlp.status = 'completed'
        `;
        const totalInPhase = await sql`
          SELECT COUNT(*)::int as count
          FROM transformatie_lessons tl
          JOIN transformatie_modules tm ON tl.module_id = tm.id
          WHERE tm.phase = ${phase}
          AND tm.program_id = ${program_id}
          AND tl.is_published = true
          AND tm.is_published = true
        `;
        if (completedInPhase.rows[0].count >= totalInPhase.rows[0].count) {
          await awardBadge(phaseSlugMap[phase]);
        }
      }

      // Halverwege badge (24 lessen)
      const totalCompleted = await sql`
        SELECT COUNT(*)::int as count
        FROM transformatie_lesson_progress tlp
        JOIN transformatie_lessons tl ON tlp.lesson_id = tl.id
        JOIN transformatie_modules tm ON tl.module_id = tm.id
        WHERE tlp.user_id = ${userId}
        AND tlp.status = 'completed'
        AND tm.program_id = ${program_id}
      `;
      if (totalCompleted.rows[0].count >= 24) await awardBadge('programma-halverwege');
    }

    if (context.assignmentJustCompleted) {
      const assignmentCount = await sql`
        SELECT COUNT(*)::int as count
        FROM transformatie_lesson_progress
        WHERE user_id = ${userId} AND assignment_completed = true
      `;
      const count = assignmentCount.rows[0].count;
      if (count >= 1) await awardBadge('eerste-opdracht-gedaan');
      if (count >= 10) await awardBadge('tien-opdrachten-gedaan');
    }

    if (context.aiFeedbackUsed) {
      await awardBadge('eerste-ai-feedback');
    }
  } catch {
    // Badge errors should never break main flow
  }

  return newBadges;
}

/**
 * POST /api/transformatie/progress
 * Update lesson progress (video, reflectie, assignment, status)
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
      assignmentCompleted,
      aiFeedbackUsed,
    } = body;

    if (!lessonId) {
      return NextResponse.json({ error: 'lessonId is verplicht' }, { status: 400 });
    }

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

    const existingProgress = await sql`
      SELECT * FROM transformatie_lesson_progress
      WHERE user_id = ${user.id} AND lesson_id = ${lessonId}
    `;

    const wasAlreadyAssignmentCompleted = existingProgress.rows[0]?.assignment_completed ?? false;
    const justCompletedLesson = status === 'completed';
    const assignmentJustCompleted = assignmentCompleted === true && !wasAlreadyAssignmentCompleted;

    let progress;
    if (existingProgress.rows.length > 0) {
      progress = await sql`
        UPDATE transformatie_lesson_progress
        SET
          status                  = COALESCE(${status ?? null}, status),
          video_watched_seconds   = COALESCE(${videoWatchedSeconds ?? null}, video_watched_seconds),
          video_completed         = COALESCE(${videoCompleted ?? null}, video_completed),
          reflectie_completed     = COALESCE(${reflectieCompleted ?? null}, reflectie_completed),
          reflectie_answers       = COALESCE(${reflectieAnswers ? JSON.stringify(reflectieAnswers) : null}::jsonb, reflectie_answers),
          assignment_completed    = COALESCE(${assignmentCompleted ?? null}, assignment_completed),
          assignment_completed_at = CASE
            WHEN ${assignmentCompleted ?? false} = true AND assignment_completed = false THEN NOW()
            ELSE assignment_completed_at
          END,
          started_at  = CASE WHEN started_at IS NULL AND ${status ?? ''} = 'in_progress' THEN NOW() ELSE started_at END,
          completed_at = CASE WHEN ${status ?? ''} = 'completed' THEN NOW() ELSE completed_at END,
          updated_at  = NOW()
        WHERE user_id = ${user.id} AND lesson_id = ${lessonId}
        RETURNING *
      `;
    } else {
      progress = await sql`
        INSERT INTO transformatie_lesson_progress (
          user_id, lesson_id, status,
          video_watched_seconds, video_completed,
          reflectie_completed, reflectie_answers,
          assignment_completed, assignment_completed_at,
          started_at, completed_at
        ) VALUES (
          ${user.id}, ${lessonId}, ${status ?? 'available'},
          ${videoWatchedSeconds ?? 0}, ${videoCompleted ?? false},
          ${reflectieCompleted ?? false}, ${reflectieAnswers ? JSON.stringify(reflectieAnswers) : null},
          ${assignmentCompleted ?? false},
          ${assignmentCompleted ? sql`NOW()` : null},
          ${status === 'in_progress' || status === 'completed' ? sql`NOW()` : null},
          ${status === 'completed' ? sql`NOW()` : null}
        )
        RETURNING *
      `;
    }

    if (justCompletedLesson) {
      const nextLesson = await sql`
        SELECT id FROM transformatie_lessons
        WHERE module_id = ${lesson.module_id}
        AND lesson_order = ${lesson.lesson_order + 1}
        AND is_published = true
      `;
      if (nextLesson.rows.length > 0) {
        await sql`
          INSERT INTO transformatie_lesson_progress (user_id, lesson_id, status)
          VALUES (${user.id}, ${nextLesson.rows[0].id}, 'available')
          ON CONFLICT (user_id, lesson_id) DO NOTHING
        `;
      } else {
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

    const newBadges = await checkAndAwardBadges(user.id, lessonId, {
      justCompleted: justCompletedLesson,
      assignmentJustCompleted,
      aiFeedbackUsed: aiFeedbackUsed === true,
    });

    const moduleProgress = await sql`
      SELECT
        COUNT(*)::int as total_lessons,
        COUNT(CASE WHEN tlp.status = 'completed' THEN 1 END)::int as completed_lessons,
        COUNT(CASE WHEN tlp.assignment_completed = true THEN 1 END)::int as assignments_completed
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
        assignmentsCompleted: moduleProgress.rows[0].assignments_completed,
        percentage: moduleProgress.rows[0].total_lessons > 0
          ? Math.round((moduleProgress.rows[0].completed_lessons / moduleProgress.rows[0].total_lessons) * 100)
          : 0,
      },
      newBadges,
      lesson: {
        id: lesson.id,
        title: lesson.title,
        module: { order: lesson.module_order, title: lesson.module_title },
      },
    });
  } catch (error) {
    console.error('Progress update error:', error);
    return NextResponse.json(
      { error: 'Fout bij updaten voortgang', details: error instanceof Error ? error.message : 'Unknown error' },
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

    const programResult = await sql`SELECT id FROM programs WHERE slug = 'transformatie' LIMIT 1`;
    if (programResult.rows.length === 0) {
      return NextResponse.json({ error: 'Programma niet gevonden' }, { status: 404 });
    }
    const programId = programResult.rows[0].id;

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

    const totalLessonsResult = await sql`
      SELECT COUNT(*)::int as count
      FROM transformatie_lessons tl
      JOIN transformatie_modules tm ON tl.module_id = tm.id
      WHERE tm.program_id = ${programId}
      AND tl.is_published = true AND tm.is_published = true
    `;

    const userBadges = await sql`
      SELECT tb.*, tub.earned_at
      FROM transformatie_user_badges tub
      JOIN transformatie_badges tb ON tub.badge_id = tb.id
      WHERE tub.user_id = ${user.id}
      ORDER BY tub.earned_at DESC
    `;

    const totalLessons = totalLessonsResult.rows[0].count;
    const completedLessons = progressResult.rows.filter(p => p.status === 'completed').length;
    const assignmentsCompleted = progressResult.rows.filter(p => p.assignment_completed).length;

    const recentCompletions = progressResult.rows
      .filter(p => p.completed_at)
      .map(p => new Date(p.completed_at).toDateString())
      .filter((v, i, a) => a.indexOf(v) === i)
      .sort().reverse();

    let streak = 0;
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    if (recentCompletions[0] === today || recentCompletions[0] === yesterday) {
      streak = 1;
      for (let i = 1; i < recentCompletions.length; i++) {
        const expected = new Date(Date.now() - i * 86400000).toDateString();
        if (recentCompletions[i] === expected) streak++;
        else break;
      }
    }

    return NextResponse.json({
      success: true,
      progress: progressResult.rows,
      badges: userBadges.rows,
      stats: {
        totalLessons,
        completedLessons,
        assignmentsCompleted,
        percentage: totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0,
        streak,
        lastActivity: progressResult.rows[0]?.updated_at ?? null,
      },
    });
  } catch (error) {
    console.error('Get progress error:', error);
    return NextResponse.json(
      { error: 'Fout bij ophalen voortgang', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
