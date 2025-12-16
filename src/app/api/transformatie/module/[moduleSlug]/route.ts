import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

interface Params {
  moduleSlug: string;
}

/**
 * GET /api/transformatie/module/[moduleSlug]
 * Get a specific module with all its lessons and progress
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<Params> }
) {
  try {
    const { moduleSlug } = await params;
    const user = await getCurrentUser();
    const userId = user?.id;

    // Get module
    const moduleResult = await sql`
      SELECT
        tm.*,
        p.id as program_id,
        p.slug as program_slug,
        p.name as program_name
      FROM transformatie_modules tm
      JOIN programs p ON tm.program_id = p.id
      WHERE tm.slug = ${moduleSlug}
      AND p.slug = 'transformatie'
      LIMIT 1
    `;

    if (moduleResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Module niet gevonden' },
        { status: 404 }
      );
    }

    const module = moduleResult.rows[0];

    // Get lessons with full content
    const lessonsResult = await sql`
      SELECT *
      FROM transformatie_lessons
      WHERE module_id = ${module.id}
      AND is_published = true
      ORDER BY lesson_order ASC
    `;

    // Get user progress if logged in
    let userProgress: any[] = [];
    if (userId) {
      const progressResult = await sql`
        SELECT *
        FROM transformatie_lesson_progress
        WHERE user_id = ${userId}
        AND lesson_id IN (
          SELECT id FROM transformatie_lessons WHERE module_id = ${module.id}
        )
      `;
      userProgress = progressResult.rows;
    }

    // Get previous and next modules
    const adjacentModules = await sql`
      SELECT id, slug, title, module_order, phase
      FROM transformatie_modules
      WHERE program_id = ${module.program_id}
      AND is_published = true
      AND module_order IN (${module.module_order - 1}, ${module.module_order + 1})
      ORDER BY module_order
    `;

    const prevModule = adjacentModules.rows.find(
      (m) => m.module_order === module.module_order - 1
    );
    const nextModule = adjacentModules.rows.find(
      (m) => m.module_order === module.module_order + 1
    );

    // Build lessons with progress
    const lessons = lessonsResult.rows.map((lesson) => ({
      id: lesson.id,
      lesson_order: lesson.lesson_order,
      slug: lesson.slug,
      title: lesson.title,
      description: lesson.description,
      lesson_type: lesson.lesson_type,
      duration_minutes: lesson.duration_minutes,
      video_url: lesson.video_url,
      video_thumbnail: lesson.video_thumbnail,
      content: lesson.content,
      reflectie: lesson.reflectie,
      progress: userProgress.find((p) => p.lesson_id === lesson.id) || null,
    }));

    // Calculate module progress
    const completedLessons = lessons.filter(
      (l) => l.progress?.status === 'completed'
    ).length;

    return NextResponse.json({
      success: true,
      module: {
        id: module.id,
        module_order: module.module_order,
        slug: module.slug,
        title: module.title,
        description: module.description,
        phase: module.phase,
        phase_label: module.phase_label,
        mindset_hook: module.mindset_hook,
        ai_tool_id: module.ai_tool_id,
        ai_tool_name: module.ai_tool_name,
        duration_minutes: module.duration_minutes,
      },
      lessons,
      progress: {
        total: lessons.length,
        completed: completedLessons,
        percentage: lessons.length > 0
          ? Math.round((completedLessons / lessons.length) * 100)
          : 0,
      },
      navigation: {
        prev: prevModule
          ? {
              slug: prevModule.slug,
              title: prevModule.title,
              module_order: prevModule.module_order,
            }
          : null,
        next: nextModule
          ? {
              slug: nextModule.slug,
              title: nextModule.title,
              module_order: nextModule.module_order,
            }
          : null,
      },
      program: {
        id: module.program_id,
        slug: module.program_slug,
        name: module.program_name,
      },
    });
  } catch (error) {
    console.error('Get module error:', error);
    return NextResponse.json(
      {
        error: 'Fout bij ophalen module',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
