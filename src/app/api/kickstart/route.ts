import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { getCurrentUser } from '@/lib/auth';
import type {
  KickstartOverview,
  ProgramWeek,
  ProgramDay,
  ProgramProgress,
  WeekProgress,
  DayProgress,
  WeeklyMetrics,
} from '@/types/kickstart.types';

export const dynamic = 'force-dynamic';

/**
 * GET /api/kickstart
 * Haal complete Kickstart overview op met weken, dagen en progress
 */
export async function GET(request: NextRequest) {
  try {
    // Get current user
    const user = await getCurrentUser();
    const userId = user?.id;

    // Get Kickstart program
    const programResult = await sql`
      SELECT id, slug, name, tagline, duration_days
      FROM programs
      WHERE slug = 'kickstart' AND is_active = true
      LIMIT 1
    `;

    if (programResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Kickstart programma niet gevonden' },
        { status: 404 }
      );
    }

    const program = programResult.rows[0];

    // Get all weeks with days
    const weeksResult = await sql`
      SELECT
        pw.id,
        pw.program_id,
        pw.week_nummer,
        pw.titel,
        pw.thema,
        pw.kpi,
        pw.emoji,
        pw.is_published,
        pw.created_at
      FROM program_weeks pw
      WHERE pw.program_id = ${program.id} AND pw.is_published = true
      ORDER BY pw.week_nummer ASC
    `;

    // Get all days
    const daysResult = await sql`
      SELECT
        pd.id,
        pd.week_id,
        pd.program_id,
        pd.dag_nummer,
        pd.titel,
        pd.emoji,
        pd.dag_type,
        pd.duur_minuten,
        pd.ai_tool,
        pd.ai_tool_slug,
        pd.video_url,
        pd.video_thumbnail,
        pd.is_preview,
        pd.is_published,
        pd.display_order,
        pd.created_at,
        pd.updated_at
      FROM program_days pd
      WHERE pd.program_id = ${program.id} AND pd.is_published = true
      ORDER BY pd.dag_nummer ASC
    `;

    // Get user progress if logged in
    let userProgress: DayProgress[] = [];
    let weeklyMetrics: WeeklyMetrics[] = [];

    if (userId) {
      const progressResult = await sql`
        SELECT *
        FROM user_day_progress
        WHERE user_id = ${userId} AND program_id = ${program.id}
      `;
      userProgress = progressResult.rows as DayProgress[];

      const metricsResult = await sql`
        SELECT *
        FROM user_weekly_metrics
        WHERE user_id = ${userId} AND program_id = ${program.id}
        ORDER BY week_nummer ASC
      `;
      weeklyMetrics = metricsResult.rows as WeeklyMetrics[];
    }

    // Build weeks with days and progress
    const weeks: ProgramWeek[] = weeksResult.rows.map((week) => {
      const weekDays = daysResult.rows.filter((d) => d.week_id === week.id);
      const completedDays = weekDays.filter((d) =>
        userProgress.some((p) => p.day_id === d.id && p.status === 'completed')
      );

      return {
        ...week,
        days: weekDays.map((day) => ({
          ...day,
          progress: userProgress.find((p) => p.day_id === day.id) || null,
        })),
        progress: {
          week_nummer: week.week_nummer,
          total_days: weekDays.length,
          completed_days: completedDays.length,
          percentage: weekDays.length > 0
            ? Math.round((completedDays.length / weekDays.length) * 100)
            : 0,
        },
      };
    });

    // Calculate overall progress
    const totalDays = daysResult.rows.length;
    const completedDays = userProgress.filter((p) => p.status === 'completed').length;
    const currentDayProgress = userProgress.find(
      (p) => p.status === 'in_progress' || p.status === 'available'
    );
    const lastCompletedDay = userProgress
      .filter((p) => p.status === 'completed')
      .sort((a, b) => {
        const dayA = daysResult.rows.find((d) => d.id === a.day_id);
        const dayB = daysResult.rows.find((d) => d.id === b.day_id);
        return (dayB?.dag_nummer || 0) - (dayA?.dag_nummer || 0);
      })[0];

    const currentDay = currentDayProgress
      ? daysResult.rows.find((d) => d.id === currentDayProgress.day_id)?.dag_nummer || 1
      : lastCompletedDay
        ? (daysResult.rows.find((d) => d.id === lastCompletedDay.day_id)?.dag_nummer || 0) + 1
        : 1;

    const currentWeek = Math.ceil(currentDay / 7);

    const programProgress: ProgramProgress = {
      program_id: program.id,
      total_days: totalDays,
      completed_days: completedDays,
      percentage: totalDays > 0 ? Math.round((completedDays / totalDays) * 100) : 0,
      current_day: Math.min(currentDay, totalDays),
      current_week: Math.min(currentWeek, 3),
      weeks: weeks.map((w) => w.progress as WeekProgress),
    };

    const response: KickstartOverview = {
      program: {
        id: program.id,
        slug: program.slug,
        name: program.name,
        tagline: program.tagline,
        duration_days: program.duration_days,
      },
      weeks,
      progress: programProgress,
      metrics: {
        start: weeklyMetrics.find((m) => m.week_nummer === 0) || null,
        current: weeklyMetrics[weeklyMetrics.length - 1] || null,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Kickstart overview error:', error);
    return NextResponse.json(
      {
        error: 'Fout bij ophalen Kickstart data',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
