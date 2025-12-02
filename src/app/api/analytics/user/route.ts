import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { verifyAuth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

/**
 * GET /api/analytics/user
 * Get comprehensive analytics data for the authenticated user
 *
 * Returns:
 * - Overview stats (completed lessons, study time, achievements, streak)
 * - Weekly progress data
 * - Recent activity
 * - Performance metrics (quiz scores, completion rate, etc.)
 */
export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const userId = user.id;

    // 1. Overview Stats
    const programStatsResult = await sql`
      SELECT
        COUNT(DISTINCT pe.program_id) as total_programs,
        COUNT(DISTINCT CASE WHEN upp.is_completed = true THEN pe.program_id END) as completed_programs
      FROM program_enrollments pe
      LEFT JOIN user_program_progress upp ON upp.user_id = pe.user_id AND upp.program_id = pe.program_id
      WHERE pe.user_id = ${userId}
        AND pe.status = 'active'
    `;

    const lessonStatsResult = await sql`
      SELECT
        COUNT(DISTINCT l.id) as total_lessons,
        COUNT(DISTINCT CASE WHEN ulp.is_completed = true THEN l.id END) as completed_lessons,
        COALESCE(SUM(ulp.watch_time_seconds), 0) as total_study_time_seconds
      FROM lessons l
      JOIN program_modules pm ON l.module_id = pm.id
      JOIN program_enrollments pe ON pm.program_id = pe.program_id
      LEFT JOIN user_lesson_progress ulp ON ulp.lesson_id = l.id AND ulp.user_id = ${userId}
      WHERE pe.user_id = ${userId}
        AND pe.status = 'active'
        AND l.is_published = true
    `;

    const achievementsResult = await sql`
      SELECT COUNT(*) as achievements_earned
      FROM user_achievements
      WHERE user_id = ${userId}
    `;

    const streakResult = await sql`
      SELECT COALESCE(current_streak, 0) as current_streak_days
      FROM user_gamification_stats
      WHERE user_id = ${userId}
    `;

    const programStats = programStatsResult.rows[0];
    const lessonStats = lessonStatsResult.rows[0];
    const achievements = achievementsResult.rows[0];
    const streak = streakResult.rows[0];

    const totalLessons = parseInt(lessonStats.total_lessons) || 1;
    const completedLessons = parseInt(lessonStats.completed_lessons) || 0;
    const completionRate = Math.round((completedLessons / totalLessons) * 100);

    // 2. Weekly Progress (last 4 weeks)
    const weeklyProgressResult = await sql`
      SELECT
        DATE_TRUNC('week', ulp.completed_at) as week,
        COUNT(*) as lessons_completed,
        COALESCE(SUM(ulp.watch_time_seconds), 0) / 60 as study_time_minutes
      FROM user_lesson_progress ulp
      WHERE ulp.user_id = ${userId}
        AND ulp.is_completed = true
        AND ulp.completed_at >= NOW() - INTERVAL '4 weeks'
      GROUP BY DATE_TRUNC('week', ulp.completed_at)
      ORDER BY week DESC
      LIMIT 4
    `;

    const weekly_progress = weeklyProgressResult.rows.map((row: any) => ({
      week: new Date(row.week).toLocaleDateString('nl-NL', { month: 'short', day: 'numeric' }),
      lessons_completed: parseInt(row.lessons_completed),
      study_time_minutes: Math.floor(parseFloat(row.study_time_minutes))
    }));

    // 3. Recent Activity (last 10 activities)
    const recentActivityResult = await sql`
      SELECT
        ulp.completed_at as date,
        'lesson_completed' as activity_type,
        l.title
      FROM user_lesson_progress ulp
      JOIN lessons l ON l.id = ulp.lesson_id
      WHERE ulp.user_id = ${userId}
        AND ulp.is_completed = true
      ORDER BY ulp.completed_at DESC
      LIMIT 10
    `;

    const recent_activity = recentActivityResult.rows.map((row: any) => ({
      date: row.date,
      activity_type: 'Les voltooid',
      title: row.title
    }));

    // 4. Performance Metrics
    // Quiz scores
    const quizStatsResult = await sql`
      SELECT
        AVG(
          CASE
            WHEN ulp.quiz_score IS NOT NULL THEN ulp.quiz_score
            ELSE NULL
          END
        ) as avg_quiz_score,
        COUNT(CASE WHEN ulp.quiz_score >= 70 THEN 1 END)::float /
        NULLIF(COUNT(CASE WHEN ulp.quiz_score IS NOT NULL THEN 1 END), 0) * 100 as quiz_pass_rate
      FROM user_lesson_progress ulp
      JOIN lessons l ON l.id = ulp.lesson_id
      WHERE ulp.user_id = ${userId}
        AND l.content_type = 'quiz'
        AND ulp.quiz_score IS NOT NULL
    `;

    const quizStats = quizStatsResult.rows[0];
    const avgQuizScore = quizStats.avg_quiz_score ? Math.round(parseFloat(quizStats.avg_quiz_score)) : 0;
    const quizPassRate = quizStats.quiz_pass_rate ? Math.round(parseFloat(quizStats.quiz_pass_rate)) : 0;

    // Completion speed (based on time vs average)
    const avgCompletionTime = parseInt(lessonStats.total_study_time_seconds) / Math.max(completedLessons, 1);
    let completion_speed = 'average';
    if (avgCompletionTime < 600) { // Less than 10 min per lesson
      completion_speed = 'fast';
    } else if (avgCompletionTime > 1200) { // More than 20 min per lesson
      completion_speed = 'slow';
    }

    // Build response
    const analyticsData = {
      overview: {
        total_programs: parseInt(programStats.total_programs) || 0,
        completed_programs: parseInt(programStats.completed_programs) || 0,
        total_lessons: totalLessons,
        completed_lessons: completedLessons,
        total_study_time_minutes: Math.floor(parseInt(lessonStats.total_study_time_seconds) / 60),
        achievements_earned: parseInt(achievements.achievements_earned) || 0,
        current_streak_days: parseInt(streak.current_streak_days) || 0,
        completion_rate: completionRate
      },
      weekly_progress,
      recent_activity,
      performance_metrics: {
        average_quiz_score: avgQuizScore,
        quiz_pass_rate: quizPassRate,
        completion_speed
      }
    };

    return NextResponse.json(analyticsData);

  } catch (error) {
    console.error('Error fetching user analytics:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch analytics',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
