import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { getCurrentUser } from '@/lib/auth';
import type {
  DayDetailResponse,
  ProgramDay,
  ProgramWeek,
  DayProgress,
} from '@/types/kickstart.types';

export const dynamic = 'force-dynamic';

/**
 * GET /api/kickstart/day/[dayNumber]
 * Haal specifieke dag op met volledige content
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ dayNumber: string }> }
) {
  try {
    const { dayNumber } = await params;
    const dagNummer = parseInt(dayNumber, 10);

    if (isNaN(dagNummer) || dagNummer < 1 || dagNummer > 21) {
      return NextResponse.json(
        { error: 'Ongeldig dag nummer. Moet tussen 1 en 21 zijn.' },
        { status: 400 }
      );
    }

    // Get current user - authentication required for full content
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Authenticatie vereist', requiresAuth: true },
        { status: 401 }
      );
    }
    const userId = user.id;

    // Get Kickstart program ID
    const programResult = await sql`
      SELECT id FROM programs WHERE slug = 'kickstart' LIMIT 1
    `;

    if (programResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Kickstart programma niet gevonden' },
        { status: 404 }
      );
    }

    const programId = programResult.rows[0].id;

    // Get the specific day with all content
    const dayResult = await sql`
      SELECT
        pd.*,
        pw.week_nummer,
        pw.titel as week_titel,
        pw.thema as week_thema,
        pw.kpi as week_kpi,
        pw.emoji as week_emoji
      FROM program_days pd
      JOIN program_weeks pw ON pd.week_id = pw.id
      WHERE pd.program_id = ${programId}
        AND pd.dag_nummer = ${dagNummer}
        AND pd.is_published = true
      LIMIT 1
    `;

    if (dayResult.rows.length === 0) {
      return NextResponse.json(
        { error: `Dag ${dagNummer} niet gevonden` },
        { status: 404 }
      );
    }

    const dayData = dayResult.rows[0];

    // Build day object
    const day: ProgramDay = {
      id: dayData.id,
      week_id: dayData.week_id,
      program_id: dayData.program_id,
      dag_nummer: dayData.dag_nummer,
      titel: dayData.titel,
      emoji: dayData.emoji,
      dag_type: dayData.dag_type,
      duur_minuten: dayData.duur_minuten,
      ai_tool: dayData.ai_tool,
      ai_tool_slug: dayData.ai_tool_slug,
      video_url: dayData.video_url,
      video_thumbnail: dayData.video_thumbnail,
      video_script: dayData.video_script,
      quiz: dayData.quiz,
      reflectie: dayData.reflectie,
      werkboek: dayData.werkboek,
      upsell: dayData.upsell,
      unlock_na_dag: dayData.unlock_na_dag,
      is_preview: dayData.is_preview,
      is_published: dayData.is_published,
      display_order: dayData.display_order,
      created_at: dayData.created_at,
      updated_at: dayData.updated_at,
    };

    // Build week object
    const week: ProgramWeek = {
      id: dayData.week_id,
      program_id: dayData.program_id,
      week_nummer: dayData.week_nummer,
      titel: dayData.week_titel,
      thema: dayData.week_thema,
      kpi: dayData.week_kpi,
      emoji: dayData.week_emoji,
      is_published: true,
      created_at: dayData.created_at,
    };

    // Get user progress for this day
    let progress: DayProgress | null = null;
    const progressResult = await sql`
      SELECT *
      FROM user_day_progress
      WHERE user_id = ${userId} AND day_id = ${day.id}
      LIMIT 1
    `;

    if (progressResult.rows.length > 0) {
      progress = progressResult.rows[0] as DayProgress;
    }

    // Get navigation (previous and next day)
    const navResult = await sql`
      SELECT dag_nummer, titel
      FROM program_days
      WHERE program_id = ${programId}
        AND is_published = true
        AND dag_nummer IN (${dagNummer - 1}, ${dagNummer + 1})
      ORDER BY dag_nummer
    `;

    const navigation = {
      previous: navResult.rows.find((r) => r.dag_nummer === dagNummer - 1)
        ? { dag_nummer: dagNummer - 1, titel: navResult.rows.find((r) => r.dag_nummer === dagNummer - 1)!.titel }
        : null,
      next: navResult.rows.find((r) => r.dag_nummer === dagNummer + 1)
        ? { dag_nummer: dagNummer + 1, titel: navResult.rows.find((r) => r.dag_nummer === dagNummer + 1)!.titel }
        : null,
    };

    // Check if user has access (enrolled or preview)
    let hasAccess = day.is_preview;
    if (userId && !hasAccess) {
      const enrollmentResult = await sql`
        SELECT id FROM program_enrollments
        WHERE user_id = ${userId} AND program_id = ${programId} AND status = 'active'
        LIMIT 1
      `;
      hasAccess = enrollmentResult.rows.length > 0;
    }

    // If no access, return limited data
    if (!hasAccess) {
      return NextResponse.json({
        success: true,
        day: {
          ...day,
          video_script: null,
          quiz: null,
          reflectie: null,
          werkboek: null,
        },
        week,
        progress: null,
        navigation,
        hasAccess: false,
        message: 'Koop het Kickstart programma voor volledige toegang',
      });
    }

    const response: DayDetailResponse = {
      day,
      week,
      progress,
      navigation,
    };

    return NextResponse.json({ success: true, ...response, hasAccess: true });
  } catch (error) {
    console.error('Kickstart day error:', error);
    return NextResponse.json(
      {
        error: 'Fout bij ophalen dag',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
