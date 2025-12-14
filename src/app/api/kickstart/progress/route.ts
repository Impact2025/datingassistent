import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { getCurrentUser } from '@/lib/auth';
import { applyRateLimit, RateLimitPresets } from '@/lib/rate-limiter';
import type { UpdateDayProgressInput, DayProgress } from '@/types/kickstart.types';

export const dynamic = 'force-dynamic';

/**
 * POST /api/kickstart/progress
 * Update progress voor een specifieke dag
 */
export async function POST(request: NextRequest) {
  try {
    // Rate limiting - use public preset for higher limits (100 req/min vs 30)
    const rateLimitResponse = await applyRateLimit(request, RateLimitPresets.public);
    if (rateLimitResponse) return rateLimitResponse;

    // Get current user
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Je moet ingelogd zijn' },
        { status: 401 }
      );
    }

    const userId = user.id;
    const body: UpdateDayProgressInput = await request.json();
    const { day_id } = body;

    if (!day_id) {
      return NextResponse.json(
        { error: 'day_id is verplicht' },
        { status: 400 }
      );
    }

    // Get the day and program info (PERFORMANCE: specific columns instead of *)
    const dayResult = await sql`
      SELECT pd.id, pd.dag_nummer, pd.quiz, pd.reflectie, pd.werkboek, p.id as program_id
      FROM program_days pd
      JOIN programs p ON pd.program_id = p.id
      WHERE pd.id = ${day_id} AND p.slug = 'kickstart'
      LIMIT 1
    `;

    if (dayResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Dag niet gevonden' },
        { status: 404 }
      );
    }

    const day = dayResult.rows[0];
    const programId = day.program_id;

    // Check if user is enrolled
    const enrollmentResult = await sql`
      SELECT id FROM program_enrollments
      WHERE user_id = ${userId} AND program_id = ${programId} AND status = 'active'
      LIMIT 1
    `;

    if (enrollmentResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Je bent niet ingeschreven voor dit programma' },
        { status: 403 }
      );
    }

    // Check if progress record exists (PERFORMANCE: only check existence, no columns needed)
    const existingProgress = await sql`
      SELECT 1 FROM user_day_progress
      WHERE user_id = ${userId} AND day_id = ${day_id}
      LIMIT 1
    `;

    let progress: DayProgress;

    if (existingProgress.rows.length === 0) {
      // Create new progress record
      const insertResult = await sql`
        INSERT INTO user_day_progress (
          user_id, program_id, day_id, status, started_at,
          video_watched_seconds, video_completed,
          quiz_completed, quiz_score, quiz_answers,
          reflectie_completed, reflectie_antwoord,
          werkboek_completed, werkboek_antwoorden
        ) VALUES (
          ${userId}, ${programId}, ${day_id}, 'in_progress', NOW(),
          ${body.video_watched_seconds || 0}, ${body.video_completed || false},
          ${body.quiz_completed || false}, ${body.quiz_answers ? calculateQuizScore(body.quiz_answers) : null}, ${body.quiz_answers ? JSON.stringify(body.quiz_answers) : null},
          ${body.reflectie_completed || false}, ${body.reflectie_antwoord || null},
          ${body.werkboek_completed || false}, ${body.werkboek_antwoorden ? JSON.stringify(body.werkboek_antwoorden) : null}
        )
        RETURNING *
      `;
      progress = insertResult.rows[0] as DayProgress;
    } else {
      // Update existing progress
      const updates: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;

      if (body.video_watched_seconds !== undefined) {
        updates.push(`video_watched_seconds = $${paramIndex++}`);
        values.push(body.video_watched_seconds);
      }

      if (body.video_completed !== undefined) {
        updates.push(`video_completed = $${paramIndex++}`);
        values.push(body.video_completed);
      }

      if (body.quiz_answers !== undefined) {
        updates.push(`quiz_answers = $${paramIndex++}`);
        values.push(JSON.stringify(body.quiz_answers));
        updates.push(`quiz_score = $${paramIndex++}`);
        values.push(calculateQuizScore(body.quiz_answers));
      }

      if (body.quiz_completed !== undefined) {
        updates.push(`quiz_completed = $${paramIndex++}`);
        values.push(body.quiz_completed);
      }

      if (body.reflectie_antwoord !== undefined) {
        updates.push(`reflectie_antwoord = $${paramIndex++}`);
        values.push(body.reflectie_antwoord);
      }

      if (body.reflectie_completed !== undefined) {
        updates.push(`reflectie_completed = $${paramIndex++}`);
        values.push(body.reflectie_completed);
      }

      if (body.werkboek_antwoorden !== undefined) {
        updates.push(`werkboek_antwoorden = $${paramIndex++}`);
        values.push(JSON.stringify(body.werkboek_antwoorden));
      }

      if (body.werkboek_completed !== undefined) {
        updates.push(`werkboek_completed = $${paramIndex++}`);
        values.push(body.werkboek_completed);
      }

      // Always update the updated_at
      updates.push(`updated_at = NOW()`);

      // Build and execute update query
      const updateResult = await sql.query(
        `UPDATE user_day_progress SET ${updates.join(', ')}
         WHERE user_id = $${paramIndex++} AND day_id = $${paramIndex++}
         RETURNING *`,
        [...values, userId, day_id]
      );

      progress = updateResult.rows[0] as DayProgress;
    }

    // Check if day is now complete
    const dayHasQuiz = day.quiz !== null;
    const dayHasReflectie = day.reflectie !== null;
    const dayHasWerkboek = day.werkboek !== null;

    const isComplete =
      progress.video_completed &&
      (!dayHasQuiz || progress.quiz_completed) &&
      (!dayHasReflectie || progress.reflectie_completed) &&
      (!dayHasWerkboek || progress.werkboek_completed);

    if (isComplete && progress.status !== 'completed') {
      await sql`
        UPDATE user_day_progress
        SET status = 'completed', completed_at = NOW()
        WHERE user_id = ${userId} AND day_id = ${day_id}
      `;
      progress.status = 'completed';
      progress.completed_at = new Date().toISOString();

      // Unlock next day
      const nextDayNumber = day.dag_nummer + 1;
      if (nextDayNumber <= 21) {
        const nextDayResult = await sql`
          SELECT id FROM program_days
          WHERE program_id = ${programId} AND dag_nummer = ${nextDayNumber}
          LIMIT 1
        `;

        if (nextDayResult.rows.length > 0) {
          const nextDayId = nextDayResult.rows[0].id;

          // Check if progress exists for next day
          const nextProgressExists = await sql`
            SELECT id FROM user_day_progress
            WHERE user_id = ${userId} AND day_id = ${nextDayId}
            LIMIT 1
          `;

          if (nextProgressExists.rows.length === 0) {
            await sql`
              INSERT INTO user_day_progress (user_id, program_id, day_id, status)
              VALUES (${userId}, ${programId}, ${nextDayId}, 'available')
            `;
          } else {
            await sql`
              UPDATE user_day_progress
              SET status = 'available'
              WHERE user_id = ${userId} AND day_id = ${nextDayId} AND status = 'locked'
            `;
          }
        }
      }

      // Update program progress percentage
      const completedDaysResult = await sql`
        SELECT COUNT(*) as count FROM user_day_progress
        WHERE user_id = ${userId} AND program_id = ${programId} AND status = 'completed'
      `;

      const completedCount = parseInt(completedDaysResult.rows[0].count);
      const progressPercentage = Math.round((completedCount / 21) * 100);

      // Note: program_enrollments table doesn't have progress_percentage column
      // Progress is calculated dynamically from user_day_progress table
    }

    return NextResponse.json({
      success: true,
      progress,
      isComplete,
    });
  } catch (error) {
    console.error('Progress update error:', error);
    return NextResponse.json(
      {
        error: 'Fout bij opslaan progress',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

function calculateQuizScore(answers: any[]): number {
  if (!answers || answers.length === 0) return 0;
  const correct = answers.filter((a) => a.isCorrect).length;
  return Math.round((correct / answers.length) * 100);
}

/**
 * GET /api/kickstart/progress
 * Haal alle progress op voor huidige user
 * Returns day summaries for sidebar navigation
 */
export async function GET(request: NextRequest) {
  try {
    // Rate limiting - use public preset for higher limits (100 req/min vs 30)
    const rateLimitResponse = await applyRateLimit(request, RateLimitPresets.public);
    if (rateLimitResponse) return rateLimitResponse;

    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Je moet ingelogd zijn' },
        { status: 401 }
      );
    }

    const userId = user.id;

    // Get Kickstart program ID
    const programResult = await sql`
      SELECT id FROM programs WHERE slug = 'kickstart' LIMIT 1
    `;

    if (programResult.rows.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Kickstart program not found',
        days: [],
        progress: [],
        enrollment: null,
      });
    }

    const programId = programResult.rows[0].id;

    // Get enrollment
    const enrollmentResult = await sql`
      SELECT * FROM program_enrollments
      WHERE user_id = ${userId} AND program_id = ${programId}
      LIMIT 1
    `;

    // Get all days with user progress
    const daysResult = await sql`
      SELECT
        pd.id,
        pd.dag_nummer,
        pd.titel,
        pd.dag_type,
        pd.emoji,
        pd.ai_tool,
        COALESCE(udp.status, 'locked') as status,
        udp.video_completed,
        udp.quiz_completed,
        udp.reflectie_completed,
        udp.werkboek_completed
      FROM program_days pd
      LEFT JOIN user_day_progress udp ON pd.id = udp.day_id AND udp.user_id = ${userId}
      WHERE pd.program_id = ${programId}
      ORDER BY pd.dag_nummer
    `;

    // Calculate overall stats
    const completedDays = daysResult.rows.filter((d: any) => d.status === 'completed').length;
    const totalDays = daysResult.rows.length;
    const progressPercentage = Math.round((completedDays / totalDays) * 100);

    // Find next available day
    const nextDay = daysResult.rows.find(
      (d: any) => d.status === 'available' || d.status === 'in_progress'
    ) || daysResult.rows[0];

    return NextResponse.json({
      success: true,
      days: daysResult.rows.map((day: any) => ({
        dag_nummer: day.dag_nummer,
        titel: day.titel,
        dag_type: day.dag_type,
        status: day.status,
        emoji: day.emoji,
        ai_tool: day.ai_tool,
      })),
      progress: daysResult.rows, // Full progress data for detailed views
      enrollment: enrollmentResult.rows[0] || null,
      stats: {
        completedDays,
        totalDays,
        progressPercentage,
        nextDay: nextDay?.dag_nummer || 1,
      },
    });
  } catch (error) {
    console.error('Get progress error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Fout bij ophalen progress',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
