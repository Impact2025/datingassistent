import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { getCurrentUser } from '@/lib/auth';
import { applyRateLimit, RateLimitPresets } from '@/lib/rate-limiter';

export const dynamic = 'force-dynamic';

interface ReflectionData {
  dayNumber: number;
  questionType: 'spiegel' | 'identiteit' | 'actie';
  questionText: string;
  answerText: string;
  programSlug?: string;
}

/**
 * Helper function to check if user is enrolled in a program
 */
async function checkEnrollment(userId: number, programSlug: string): Promise<boolean> {
  try {
    const result = await sql`
      SELECT pe.id
      FROM program_enrollments pe
      JOIN programs p ON p.id = pe.program_id
      WHERE pe.user_id = ${userId}
        AND p.slug = ${programSlug}
        AND pe.status = 'active'
      LIMIT 1
    `;
    return result.rows.length > 0;
  } catch (error) {
    console.error('Error checking enrollment:', error);
    return false;
  }
}

/**
 * POST /api/kickstart/reflections
 * Save a user's reflection answer
 *
 * LAAG 3: Opslaan van reflectie-antwoorden zodat Iris
 * naar eerdere antwoorden kan refereren.
 */
export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResponse = await applyRateLimit(request, RateLimitPresets.api);
    if (rateLimitResponse) return rateLimitResponse;

    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const userId = user.id;
    const body: ReflectionData = await request.json();

    // Security: Verify user is enrolled in the program
    const programSlug = body.programSlug || 'kickstart';
    const isEnrolled = await checkEnrollment(userId, programSlug);
    if (!isEnrolled) {
      return NextResponse.json(
        { error: 'Je hebt geen toegang tot dit programma', requiresEnrollment: true },
        { status: 403 }
      );
    }

    const {
      dayNumber,
      questionType,
      questionText,
      answerText
    } = body;

    // Validate required fields
    if (!dayNumber || !questionType || !questionText || !answerText) {
      return NextResponse.json(
        { error: 'dayNumber, questionType, questionText, and answerText are required' },
        { status: 400 }
      );
    }

    if (!['spiegel', 'identiteit', 'actie'].includes(questionType)) {
      return NextResponse.json(
        { error: 'questionType must be spiegel, identiteit, or actie' },
        { status: 400 }
      );
    }

    // Upsert reflection (insert or update if exists)
    const result = await sql`
      INSERT INTO user_reflections (
        user_id,
        program_slug,
        day_number,
        question_type,
        question_text,
        answer_text
      ) VALUES (
        ${userId},
        ${programSlug},
        ${dayNumber},
        ${questionType},
        ${questionText},
        ${answerText}
      )
      ON CONFLICT (user_id, program_slug, day_number, question_type)
      DO UPDATE SET
        answer_text = EXCLUDED.answer_text,
        question_text = EXCLUDED.question_text,
        updated_at = NOW()
      RETURNING *
    `;

    return NextResponse.json({
      success: true,
      reflection: result.rows[0]
    });

  } catch (error) {
    console.error('Error saving reflection:', error);
    return NextResponse.json(
      { error: 'Failed to save reflection' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/kickstart/reflections
 * Get user's reflections with optional filters
 *
 * Query params:
 * - dayNumber: Get reflections for a specific day
 * - programSlug: Filter by program (default: kickstart)
 * - all: Get all reflections for the user
 */
export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResponse = await applyRateLimit(request, RateLimitPresets.api);
    if (rateLimitResponse) return rateLimitResponse;

    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const userId = user.id;
    const { searchParams } = new URL(request.url);
    const dayNumber = searchParams.get('dayNumber');
    const programSlug = searchParams.get('programSlug') || 'kickstart';
    const all = searchParams.get('all') === 'true';

    // Security: Verify user is enrolled in the program
    const isEnrolled = await checkEnrollment(userId, programSlug);
    if (!isEnrolled) {
      return NextResponse.json(
        { error: 'Je hebt geen toegang tot dit programma', requiresEnrollment: true },
        { status: 403 }
      );
    }

    let result;

    if (dayNumber) {
      // Get reflections for a specific day
      result = await sql`
        SELECT * FROM user_reflections
        WHERE user_id = ${userId}
          AND program_slug = ${programSlug}
          AND day_number = ${parseInt(dayNumber)}
        ORDER BY question_type
      `;
    } else if (all) {
      // Get all reflections for the user
      result = await sql`
        SELECT * FROM user_reflections
        WHERE user_id = ${userId}
          AND program_slug = ${programSlug}
        ORDER BY day_number, question_type
      `;
    } else {
      // Get summary: count per day
      result = await sql`
        SELECT
          day_number,
          COUNT(*) as answer_count,
          MAX(created_at) as last_answer
        FROM user_reflections
        WHERE user_id = ${userId}
          AND program_slug = ${programSlug}
        GROUP BY day_number
        ORDER BY day_number
      `;
    }

    return NextResponse.json({
      reflections: result.rows,
      total: result.rows.length
    });

  } catch (error) {
    console.error('Error fetching reflections:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reflections' },
      { status: 500 }
    );
  }
}

// Note: getIrisReflectionContext is moved to @/lib/iris-context-builder.ts
// to avoid Next.js route export restrictions
