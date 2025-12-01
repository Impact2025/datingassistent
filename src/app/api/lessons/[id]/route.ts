import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import type { LessonResponse, LessonWithProgress } from '@/types/content-delivery.types';

export const dynamic = 'force-dynamic';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this';

/**
 * GET /api/lessons/[id]
 * Get lesson details with navigation context (prev/next lessons)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const lessonId = parseInt(params.id);

    // Authenticate user (optional for preview lessons)
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

    // Get lesson with module and program info
    const lessonResult = await sql`
      SELECT
        l.*,
        pm.id as module_id,
        pm.program_id,
        pm.title as module_title,
        pm.module_number,
        p.name as program_name,
        p.slug as program_slug
      FROM lessons l
      JOIN program_modules pm ON l.module_id = pm.id
      JOIN programs p ON pm.program_id = p.id
      WHERE l.id = ${lessonId}
      LIMIT 1
    `;

    if (lessonResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Lesson not found' },
        { status: 404 }
      );
    }

    const lesson = lessonResult.rows[0];

    // Check if user has access
    let hasAccess = false;
    if (isAuthenticated) {
      const enrollmentResult = await sql`
        SELECT id FROM program_enrollments
        WHERE user_id = ${userId}
          AND program_id = ${lesson.program_id}
          AND status = 'active'
        LIMIT 1
      `;
      hasAccess = enrollmentResult.rows.length > 0;
    }

    // Check if lesson is unlocked (for non-enrolled users, only preview)
    const isUnlocked = hasAccess || lesson.is_preview === true;

    if (!isUnlocked) {
      return NextResponse.json(
        {
          error: 'This lesson is locked',
          message: 'You need to enroll in this program to access this lesson'
        },
        { status: 403 }
      );
    }

    // Get user progress for this lesson
    let userProgress = null;
    if (isAuthenticated) {
      const progressResult = await sql`
        SELECT * FROM user_lesson_progress
        WHERE user_id = ${userId}
          AND lesson_id = ${lessonId}
        LIMIT 1
      `;

      if (progressResult.rows.length > 0) {
        userProgress = progressResult.rows[0];
      }
    }

    // Build lesson with progress
    const lessonWithProgress: LessonWithProgress = {
      ...lesson,
      is_unlocked: isUnlocked,
      is_completed: userProgress?.is_completed || false,
      watched_percentage: userProgress?.watched_percentage || 0,
      last_position_seconds: userProgress?.last_position_seconds || 0,
      user_progress: userProgress || undefined
    };

    // Get module info
    const moduleResult = await sql`
      SELECT * FROM program_modules
      WHERE id = ${lesson.module_id}
      LIMIT 1
    `;

    const module = moduleResult.rows[0];

    // Get all lessons in this module to find prev/next
    const moduleLessonsResult = await sql`
      SELECT * FROM lessons
      WHERE module_id = ${lesson.module_id}
        AND is_published = true
      ORDER BY display_order ASC
    `;

    const moduleLessons = moduleLessonsResult.rows;
    const currentIndex = moduleLessons.findIndex((l: any) => l.id === lessonId);

    // Find previous lesson
    let previousLesson: LessonWithProgress | null = null;
    if (currentIndex > 0) {
      const prevLesson = moduleLessons[currentIndex - 1];

      // Get progress for previous lesson
      let prevProgress = null;
      if (isAuthenticated) {
        const prevProgressResult = await sql`
          SELECT * FROM user_lesson_progress
          WHERE user_id = ${userId}
            AND lesson_id = ${prevLesson.id}
          LIMIT 1
        `;
        if (prevProgressResult.rows.length > 0) {
          prevProgress = prevProgressResult.rows[0];
        }
      }

      previousLesson = {
        ...prevLesson,
        is_unlocked: hasAccess || prevLesson.is_preview === true,
        is_completed: prevProgress?.is_completed || false,
        watched_percentage: prevProgress?.watched_percentage || 0,
        last_position_seconds: prevProgress?.last_position_seconds || 0,
        user_progress: prevProgress || undefined
      };
    }

    // Find next lesson
    let nextLesson: LessonWithProgress | null = null;
    if (currentIndex < moduleLessons.length - 1) {
      const nxtLesson = moduleLessons[currentIndex + 1];

      // Get progress for next lesson
      let nxtProgress = null;
      if (isAuthenticated) {
        const nxtProgressResult = await sql`
          SELECT * FROM user_lesson_progress
          WHERE user_id = ${userId}
            AND lesson_id = ${nxtLesson.id}
          LIMIT 1
        `;
        if (nxtProgressResult.rows.length > 0) {
          nxtProgress = nxtProgressResult.rows[0];
        }
      }

      // Check if next lesson is unlocked
      let isNextUnlocked = false;
      if (hasAccess) {
        if (nxtLesson.requires_previous_completion === false) {
          isNextUnlocked = true;
        } else if (nxtLesson.unlock_after_lesson_id === null) {
          isNextUnlocked = true;
        } else {
          // Check if previous lesson (current lesson) is completed
          isNextUnlocked = userProgress?.is_completed === true;
        }
      } else {
        isNextUnlocked = nxtLesson.is_preview === true;
      }

      nextLesson = {
        ...nxtLesson,
        is_unlocked: isNextUnlocked,
        is_completed: nxtProgress?.is_completed || false,
        watched_percentage: nxtProgress?.watched_percentage || 0,
        last_position_seconds: nxtProgress?.last_position_seconds || 0,
        user_progress: nxtProgress || undefined
      };
    } else {
      // This is the last lesson in module, check for first lesson of next module
      const nextModuleResult = await sql`
        SELECT * FROM program_modules
        WHERE program_id = ${lesson.program_id}
          AND display_order > ${module.display_order}
          AND is_published = true
        ORDER BY display_order ASC
        LIMIT 1
      `;

      if (nextModuleResult.rows.length > 0) {
        const nextModule = nextModuleResult.rows[0];

        // Get first lesson of next module
        const nextModuleFirstLessonResult = await sql`
          SELECT * FROM lessons
          WHERE module_id = ${nextModule.id}
            AND is_published = true
          ORDER BY display_order ASC
          LIMIT 1
        `;

        if (nextModuleFirstLessonResult.rows.length > 0) {
          const nxtLesson = nextModuleFirstLessonResult.rows[0];

          let nxtProgress = null;
          if (isAuthenticated) {
            const nxtProgressResult = await sql`
              SELECT * FROM user_lesson_progress
              WHERE user_id = ${userId}
                AND lesson_id = ${nxtLesson.id}
              LIMIT 1
            `;
            if (nxtProgressResult.rows.length > 0) {
              nxtProgress = nxtProgressResult.rows[0];
            }
          }

          // Check if next module/lesson is unlocked
          let isNextUnlocked = false;
          if (hasAccess) {
            // Check if current module is completed
            const currentModuleProgressResult = await sql`
              SELECT is_completed FROM user_module_progress
              WHERE user_id = ${userId}
                AND module_id = ${lesson.module_id}
              LIMIT 1
            `;

            if (currentModuleProgressResult.rows.length > 0) {
              isNextUnlocked = currentModuleProgressResult.rows[0].is_completed === true;
            }
          }

          nextLesson = {
            ...nxtLesson,
            is_unlocked: isNextUnlocked,
            is_completed: nxtProgress?.is_completed || false,
            watched_percentage: nxtProgress?.watched_percentage || 0,
            last_position_seconds: nxtProgress?.last_position_seconds || 0,
            user_progress: nxtProgress || undefined
          };
        }
      }
    }

    // Build response
    const response: LessonResponse = {
      lesson: lessonWithProgress,
      module,
      next_lesson: nextLesson,
      previous_lesson: previousLesson,
      program: {
        id: lesson.program_id,
        name: lesson.program_name,
        slug: lesson.program_slug
      }
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error fetching lesson:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch lesson',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
