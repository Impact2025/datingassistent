import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// Types for Transformatie
export interface TransformatieModule {
  id: number;
  module_order: number;
  slug: string;
  title: string;
  description: string;
  phase: 'DESIGN' | 'ACTION' | 'SURRENDER';
  phase_label: string;
  mindset_hook: string;
  ai_tool_id: number | null;
  ai_tool_name: string | null;
  duration_minutes: number;
  is_published: boolean;
  lessons: TransformatieLesson[];
  progress: {
    total_lessons: number;
    completed_lessons: number;
    percentage: number;
  };
}

export interface TransformatieLesson {
  id: number;
  module_id: number;
  lesson_order: number;
  slug: string;
  title: string;
  description: string;
  lesson_type: string;
  duration_minutes: number;
  video_url: string | null;
  is_published: boolean;
  progress: LessonProgress | null;
}

export interface LessonProgress {
  id: number;
  user_id: number;
  lesson_id: number;
  status: 'locked' | 'available' | 'in_progress' | 'completed';
  started_at: string | null;
  completed_at: string | null;
  video_watched_seconds: number;
  video_completed: boolean;
  reflectie_completed: boolean;
  reflectie_answers: Record<string, string> | null;
}

export interface TransformatieOverview {
  program: {
    id: number;
    slug: string;
    name: string;
    tagline: string;
  };
  phases: {
    id: string;
    name: string;
    description: string;
    core_question: string;
    modules: number[];
    progress: number;
  }[];
  modules: TransformatieModule[];
  progress: {
    total_modules: number;
    completed_modules: number;
    total_lessons: number;
    completed_lessons: number;
    percentage: number;
    current_module: number;
    current_lesson: number;
    current_phase: string;
  };
}

/**
 * GET /api/transformatie
 * Get complete Transformatie overview with modules, lessons and progress
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    const userId = user?.id;

    // Get Transformatie program
    const programResult = await sql`
      SELECT id, slug, name, tagline
      FROM programs
      WHERE slug = 'transformatie' AND is_active = true
      LIMIT 1
    `;

    if (programResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Transformatie programma niet gevonden' },
        { status: 404 }
      );
    }

    const program = programResult.rows[0];

    // Get all published modules
    const modulesResult = await sql`
      SELECT *
      FROM transformatie_modules
      WHERE program_id = ${program.id} AND is_published = true
      ORDER BY module_order ASC
    `;

    // Get all published lessons
    const lessonsResult = await sql`
      SELECT tl.*
      FROM transformatie_lessons tl
      JOIN transformatie_modules tm ON tl.module_id = tm.id
      WHERE tm.program_id = ${program.id} AND tl.is_published = true
      ORDER BY tl.lesson_order ASC
    `;

    // Get user progress if logged in
    let userProgress: LessonProgress[] = [];
    if (userId) {
      const progressResult = await sql`
        SELECT tlp.*
        FROM transformatie_lesson_progress tlp
        JOIN transformatie_lessons tl ON tlp.lesson_id = tl.id
        JOIN transformatie_modules tm ON tl.module_id = tm.id
        WHERE tlp.user_id = ${userId} AND tm.program_id = ${program.id}
      `;
      userProgress = progressResult.rows as LessonProgress[];
    }

    // Build modules with lessons and progress
    const modules: TransformatieModule[] = modulesResult.rows.map((module) => {
      const moduleLessons = lessonsResult.rows.filter((l) => l.module_id === module.id);
      const completedLessons = moduleLessons.filter((l) =>
        userProgress.some((p) => p.lesson_id === l.id && p.status === 'completed')
      );

      return {
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
        is_published: module.is_published,
        lessons: moduleLessons.map((lesson) => ({
          id: lesson.id,
          module_id: lesson.module_id,
          lesson_order: lesson.lesson_order,
          slug: lesson.slug,
          title: lesson.title,
          description: lesson.description,
          lesson_type: lesson.lesson_type,
          duration_minutes: lesson.duration_minutes,
          video_url: lesson.video_url,
          is_published: lesson.is_published,
          progress: userProgress.find((p) => p.lesson_id === lesson.id) || null,
        })),
        progress: {
          total_lessons: moduleLessons.length,
          completed_lessons: completedLessons.length,
          percentage: moduleLessons.length > 0
            ? Math.round((completedLessons.length / moduleLessons.length) * 100)
            : 0,
        },
      };
    });

    // Calculate overall progress
    const totalLessons = lessonsResult.rows.length;
    const completedLessons = userProgress.filter((p) => p.status === 'completed').length;

    // Find current lesson (first non-completed)
    let currentModuleOrder = 1;
    let currentLessonOrder = 1;
    let currentPhase = 'DESIGN';

    for (const module of modules) {
      const incompleteLessons = module.lessons.filter(
        (l) => !l.progress || l.progress.status !== 'completed'
      );
      if (incompleteLessons.length > 0) {
        currentModuleOrder = module.module_order;
        currentLessonOrder = incompleteLessons[0].lesson_order;
        currentPhase = module.phase;
        break;
      }
    }

    // Build phases with progress
    const phases = [
      {
        id: 'DESIGN',
        name: 'Het Fundament',
        description: 'Van onbewust onbekwaam naar bewust bekwaam',
        core_question: 'Wie ben ik in de liefde?',
        modules: [1, 2, 3, 4],
        progress: 0,
      },
      {
        id: 'ACTION',
        name: 'De Markt Op',
        description: 'Kwalitatieve dates genereren zonder burnout',
        core_question: 'Hoe creeer ik kansen?',
        modules: [5, 6, 7, 8],
        progress: 0,
      },
      {
        id: 'SURRENDER',
        name: 'Relatie Bouwen',
        description: 'Van date naar duurzame partner',
        core_question: 'Hoe laat ik liefde toe?',
        modules: [9, 10, 11, 12],
        progress: 0,
      },
    ];

    // Calculate phase progress
    phases.forEach((phase) => {
      const phaseModules = modules.filter((m) =>
        phase.modules.includes(m.module_order)
      );
      const phaseTotalLessons = phaseModules.reduce(
        (sum, m) => sum + m.progress.total_lessons,
        0
      );
      const phaseCompletedLessons = phaseModules.reduce(
        (sum, m) => sum + m.progress.completed_lessons,
        0
      );
      phase.progress = phaseTotalLessons > 0
        ? Math.round((phaseCompletedLessons / phaseTotalLessons) * 100)
        : 0;
    });

    // Count completed modules
    const completedModules = modules.filter(
      (m) => m.progress.percentage === 100
    ).length;

    const response: TransformatieOverview = {
      program: {
        id: program.id,
        slug: program.slug,
        name: program.name,
        tagline: program.tagline,
      },
      phases,
      modules,
      progress: {
        total_modules: modules.length,
        completed_modules: completedModules,
        total_lessons: totalLessons,
        completed_lessons: completedLessons,
        percentage: totalLessons > 0
          ? Math.round((completedLessons / totalLessons) * 100)
          : 0,
        current_module: currentModuleOrder,
        current_lesson: currentLessonOrder,
        current_phase: currentPhase,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Transformatie overview error:', error);
    return NextResponse.json(
      {
        error: 'Fout bij ophalen Transformatie data',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
