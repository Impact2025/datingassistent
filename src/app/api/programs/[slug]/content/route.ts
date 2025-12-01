import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import type {
  ProgramContentResponse,
  ProgramModuleWithProgress,
  LessonWithProgress
} from '@/types/content-delivery.types';

export const dynamic = 'force-dynamic';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this';

/**
 * GET /api/programs/[slug]/content
 * Get complete program structure with modules, lessons, and user progress
 *
 * Query params:
 * - includeProgress: boolean (default: true)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;
    const searchParams = request.nextUrl.searchParams;
    const includeProgress = searchParams.get('includeProgress') !== 'false';

    // Get authenticated user (optional for preview mode)
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    let userId: number | null = null;
    let isAuthenticated = false;

    if (token) {
      try {
        const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
        userId = decoded.userId;
        isAuthenticated = true;
      } catch {
        // Invalid token, continue as guest
      }
    }

    // 1. Get Program Details
    const programResult = await sql`
      SELECT id, name, slug, description, tagline, tier
      FROM programs
      WHERE slug = ${slug}
      LIMIT 1
    `;

    if (programResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Program not found' },
        { status: 404 }
      );
    }

    const program = programResult.rows[0];

    // 2. Check if user has access (enrolled)
    let hasAccess = false;
    if (isAuthenticated) {
      const enrollmentResult = await sql`
        SELECT id FROM program_enrollments
        WHERE user_id = ${userId}
          AND program_id = ${program.id}
          AND status = 'active'
        LIMIT 1
      `;
      hasAccess = enrollmentResult.rows.length > 0;
    }

    // 3. Get All Modules for this Program
    const modulesResult = await sql`
      SELECT *
      FROM program_modules
      WHERE program_id = ${program.id}
        AND is_published = true
      ORDER BY display_order ASC
    `;

    // 4. Get All Lessons for these Modules
    const moduleIds = modulesResult.rows.map(m => m.id);

    let lessonsResult;
    if (moduleIds.length > 0) {
      lessonsResult = await sql`
        SELECT *
        FROM lessons
        WHERE module_id = ANY(${moduleIds})
          AND is_published = true
        ORDER BY module_id, display_order ASC
      `;
    } else {
      lessonsResult = { rows: [] };
    }

    // 5. Get User Progress (if authenticated and includeProgress)
    let userProgramProgress = null;
    let userModuleProgressMap = new Map();
    let userLessonProgressMap = new Map();

    if (isAuthenticated && includeProgress) {
      // Get overall program progress
      const programProgressResult = await sql`
        SELECT *
        FROM user_program_progress
        WHERE user_id = ${userId}
          AND program_id = ${program.id}
        LIMIT 1
      `;

      if (programProgressResult.rows.length > 0) {
        userProgramProgress = programProgressResult.rows[0];
      }

      // Get module progress
      if (moduleIds.length > 0) {
        const moduleProgressResult = await sql`
          SELECT *
          FROM user_module_progress
          WHERE user_id = ${userId}
            AND module_id = ANY(${moduleIds})
        `;

        moduleProgressResult.rows.forEach((mp: any) => {
          userModuleProgressMap.set(mp.module_id, mp);
        });
      }

      // Get lesson progress
      const lessonIds = lessonsResult.rows.map((l: any) => l.id);
      if (lessonIds.length > 0) {
        const lessonProgressResult = await sql`
          SELECT *
          FROM user_lesson_progress
          WHERE user_id = ${userId}
            AND lesson_id = ANY(${lessonIds})
        `;

        lessonProgressResult.rows.forEach((lp: any) => {
          userLessonProgressMap.set(lp.lesson_id, lp);
        });
      }
    }

    // 6. Build Module Structure with Lessons and Progress
    const modulesWithProgress: ProgramModuleWithProgress[] = modulesResult.rows.map((module: any) => {
      // Get lessons for this module
      const moduleLessons = lessonsResult.rows.filter((l: any) => l.module_id === module.id);

      // Calculate module stats
      const totalLessons = moduleLessons.length;
      const completedLessons = moduleLessons.filter((l: any) => {
        const progress = userLessonProgressMap.get(l.id);
        return progress?.is_completed === true;
      }).length;

      const progressPercentage = totalLessons > 0
        ? Math.round((completedLessons / totalLessons) * 100)
        : 0;

      // Check if module is unlocked
      let isUnlocked = false;
      if (!isAuthenticated || !hasAccess) {
        // Non-authenticated or non-enrolled: only unlock first module or preview lessons
        isUnlocked = module.unlock_immediately === true || module.module_number === 1;
      } else {
        // Authenticated + enrolled: check unlock logic
        if (module.unlock_immediately === true) {
          isUnlocked = true;
        } else if (module.unlock_after_module_id === null) {
          isUnlocked = true; // First module always unlocked
        } else {
          // Check if previous module is completed
          const prevModuleProgress = userModuleProgressMap.get(module.unlock_after_module_id);
          isUnlocked = prevModuleProgress?.is_completed === true;
        }
      }

      // Get user progress for this module
      const moduleProgress = userModuleProgressMap.get(module.id);

      return {
        ...module,
        total_lessons: totalLessons,
        completed_lessons: completedLessons,
        progress_percentage: progressPercentage,
        is_unlocked: isUnlocked,
        user_progress: moduleProgress || undefined,
        lessons: moduleLessons.map((lesson: any) => {
          const lessonProgress = userLessonProgressMap.get(lesson.id);

          // Check if lesson is unlocked
          let isLessonUnlocked = false;
          if (!isAuthenticated || !hasAccess) {
            // Non-enrolled: only preview lessons
            isLessonUnlocked = lesson.is_preview === true;
          } else if (isUnlocked) {
            // Module is unlocked, check lesson requirements
            if (lesson.requires_previous_completion === false) {
              isLessonUnlocked = true;
            } else if (lesson.unlock_after_lesson_id === null) {
              isLessonUnlocked = true; // First lesson in module
            } else {
              // Check if previous lesson is completed
              const prevLessonProgress = userLessonProgressMap.get(lesson.unlock_after_lesson_id);
              isLessonUnlocked = prevLessonProgress?.is_completed === true;
            }
          }

          const lessonWithProgress: LessonWithProgress = {
            ...lesson,
            is_unlocked: isLessonUnlocked,
            is_completed: lessonProgress?.is_completed || false,
            watched_percentage: lessonProgress?.watched_percentage || 0,
            last_position_seconds: lessonProgress?.last_position_seconds || 0,
            user_progress: lessonProgress || undefined
          };

          return lessonWithProgress;
        })
      };
    });

    // 7. Find Next Lesson (first incomplete lesson)
    let nextLesson: LessonWithProgress | undefined;
    for (const module of modulesWithProgress) {
      if (!module.is_unlocked) continue;

      for (const lesson of (module as any).lessons) {
        if (!lesson.is_completed && lesson.is_unlocked) {
          nextLesson = lesson;
          break;
        }
      }

      if (nextLesson) break;
    }

    // 8. Build Response
    const response: ProgramContentResponse = {
      program: {
        id: program.id,
        name: program.name,
        slug: program.slug,
        description: program.description
      },
      modules: modulesWithProgress,
      user_progress: userProgramProgress || undefined,
      next_lesson: nextLesson,
      has_access: hasAccess,
      is_authenticated: isAuthenticated
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error fetching program content:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch program content',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
