import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import type {
  UpdateLessonProgressRequest,
  UpdateLessonProgressResponse,
  QuizAnswer,
  QuizQuestion
} from '@/types/content-delivery.types';
import { calculateQuizScore } from '@/types/content-delivery.types';

export const dynamic = 'force-dynamic';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this';

/**
 * POST /api/lessons/[id]/progress
 * Update user's progress for a specific lesson
 *
 * Body:
 * - watch_time_seconds?: number
 * - last_position_seconds?: number
 * - is_completed?: boolean
 * - quiz_answers?: QuizAnswer[]
 * - time_spent_seconds?: number
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const lessonId = parseInt(params.id);
    const body: UpdateLessonProgressRequest = await request.json();

    // Authenticate user
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    let userId: number;
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
      userId = decoded.userId;
    } catch {
      return NextResponse.json(
        { error: 'Invalid authentication token' },
        { status: 401 }
      );
    }

    // Get lesson details
    const lessonResult = await sql`
      SELECT l.*, pm.program_id
      FROM lessons l
      JOIN program_modules pm ON l.module_id = pm.id
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

    // Check if user has access to this lesson's program
    const enrollmentResult = await sql`
      SELECT id FROM program_enrollments
      WHERE user_id = ${userId}
        AND program_id = ${lesson.program_id}
        AND status = 'active'
      LIMIT 1
    `;

    if (enrollmentResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'You do not have access to this program' },
        { status: 403 }
      );
    }

    // Get or create progress record
    let progressResult = await sql`
      SELECT * FROM user_lesson_progress
      WHERE user_id = ${userId}
        AND lesson_id = ${lessonId}
      LIMIT 1
    `;

    let progress;
    const now = new Date();

    if (progressResult.rows.length === 0) {
      // Create new progress record
      const insertResult = await sql`
        INSERT INTO user_lesson_progress (
          user_id, lesson_id, started_at, last_accessed_at
        ) VALUES (
          ${userId}, ${lessonId}, ${now}, ${now}
        )
        RETURNING *
      `;
      progress = insertResult.rows[0];
    } else {
      progress = progressResult.rows[0];
    }

    // Prepare update fields
    const updates: any = {
      last_accessed_at: now,
      revisit_count: progress.revisit_count + 1
    };

    // Update watch time and position (for videos)
    if (body.watch_time_seconds !== undefined) {
      updates.watch_time_seconds = Math.max(
        progress.watch_time_seconds,
        body.watch_time_seconds
      );
    }

    if (body.last_position_seconds !== undefined) {
      updates.last_position_seconds = body.last_position_seconds;
    }

    // Calculate watched percentage for videos
    if (lesson.duration_seconds && updates.watch_time_seconds !== undefined) {
      updates.watched_percentage = Math.min(
        100,
        Math.round((updates.watch_time_seconds / lesson.duration_seconds) * 100)
      );
    }

    // Update time spent
    if (body.time_spent_seconds !== undefined) {
      updates.time_spent_seconds = progress.time_spent_seconds + body.time_spent_seconds;
    }

    // Handle quiz answers
    let quizScore: number | null = null;
    let quizPassed = false;

    if (body.quiz_answers && lesson.quiz_data) {
      const quizData = lesson.quiz_data as { questions: QuizQuestion[]; passing_score?: number };
      const questions = quizData.questions;
      const passingScore = quizData.passing_score || 70;

      // Grade the quiz
      const gradedAnswers: QuizAnswer[] = body.quiz_answers.map(answer => {
        const question = questions.find(q => q.id === answer.question_id);
        if (!question) return answer;

        const isCorrect = answer.user_answer === question.correct_answer;
        return {
          ...answer,
          is_correct: isCorrect,
          points_earned: isCorrect ? (question.points || 1) : 0
        };
      });

      // Calculate score
      quizScore = calculateQuizScore(gradedAnswers, questions);
      quizPassed = quizScore >= passingScore;

      updates.quiz_answers = gradedAnswers;
      updates.quiz_score = quizScore;
      updates.quiz_attempts = progress.quiz_attempts + 1;
      updates.quiz_passed = quizPassed;

      // Auto-complete if passed
      if (quizPassed && !progress.is_completed) {
        updates.is_completed = true;
        updates.completed_at = now;
      }
    }

    // Handle manual completion
    if (body.is_completed === true && !progress.is_completed) {
      updates.is_completed = true;
      updates.completed_at = now;
    }

    // Build update query dynamically
    const updateFields = Object.keys(updates).map((key, index) => {
      return `${key} = $${index + 3}`;
    }).join(', ');

    const updateValues = Object.values(updates);

    const updateQuery = `
      UPDATE user_lesson_progress
      SET ${updateFields}, updated_at = NOW()
      WHERE user_id = $1 AND lesson_id = $2
      RETURNING *
    `;

    const updatedResult = await sql.query(updateQuery, [userId, lessonId, ...updateValues]);
    const updatedProgress = updatedResult.rows[0];

    // Check for new achievements
    const achievementsUnlocked: any[] = [];

    // Example: First lesson completed
    if (updates.is_completed && !progress.is_completed) {
      const completedCount = await sql`
        SELECT COUNT(*) as count
        FROM user_lesson_progress
        WHERE user_id = ${userId}
          AND is_completed = true
      `;

      if (completedCount.rows[0].count === 1) {
        // First lesson ever completed - unlock achievement
        const achievement = await sql`
          SELECT * FROM achievements
          WHERE achievement_key = 'first_lesson'
          LIMIT 1
        `;

        if (achievement.rows.length > 0) {
          await sql`
            INSERT INTO user_achievements (user_id, achievement_id)
            VALUES (${userId}, ${achievement.rows[0].id})
            ON CONFLICT (user_id, achievement_id) DO NOTHING
          `;
          achievementsUnlocked.push(achievement.rows[0]);
        }
      }
    }

    // Check if module is completed (trigger handles this, but we report it)
    const moduleProgressResult = await sql`
      SELECT is_completed
      FROM user_module_progress
      WHERE user_id = ${userId}
        AND module_id = ${lesson.module_id}
      LIMIT 1
    `;

    const moduleCompleted = moduleProgressResult.rows.length > 0 &&
                           moduleProgressResult.rows[0].is_completed;

    // Check if program is completed
    const programProgressResult = await sql`
      SELECT is_completed
      FROM user_program_progress
      WHERE user_id = ${userId}
        AND program_id = ${lesson.program_id}
      LIMIT 1
    `;

    const programCompleted = programProgressResult.rows.length > 0 &&
                            programProgressResult.rows[0].is_completed;

    // Build response
    const response: UpdateLessonProgressResponse = {
      success: true,
      progress: updatedProgress,
      achievements_unlocked: achievementsUnlocked.length > 0 ? achievementsUnlocked : undefined,
      module_completed: moduleCompleted,
      program_completed: programCompleted
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error updating lesson progress:', error);
    return NextResponse.json(
      {
        error: 'Failed to update lesson progress',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/lessons/[id]/progress
 * Get user's progress for a specific lesson
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const lessonId = parseInt(params.id);

    // Authenticate user
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    let userId: number;
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
      userId = decoded.userId;
    } catch {
      return NextResponse.json(
        { error: 'Invalid authentication token' },
        { status: 401 }
      );
    }

    // Get progress
    const progressResult = await sql`
      SELECT * FROM user_lesson_progress
      WHERE user_id = ${userId}
        AND lesson_id = ${lessonId}
      LIMIT 1
    `;

    if (progressResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'No progress found for this lesson' },
        { status: 404 }
      );
    }

    return NextResponse.json(progressResult.rows[0]);

  } catch (error) {
    console.error('Error fetching lesson progress:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch lesson progress',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
