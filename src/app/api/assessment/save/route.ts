import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { getRecommendedProgram } from '@/lib/assessment-questions';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

export const dynamic = 'force-dynamic';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this';

/**
 * POST /api/assessment/save
 * Save user assessment answers and calculate program recommendation
 */
export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Verify JWT and get user ID
    let userId: number;
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
      userId = decoded.userId;
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { answers } = body;

    if (!answers || typeof answers !== 'object') {
      return NextResponse.json(
        { error: 'Invalid answers format' },
        { status: 400 }
      );
    }

    // Validate all 7 questions are answered
    const requiredKeys = [
      'question_1',
      'question_2',
      'question_3',
      'question_4',
      'question_5',
      'question_6',
      'question_7'
    ];

    for (const key of requiredKeys) {
      if (!answers[key]) {
        return NextResponse.json(
          { error: `Missing answer for ${key}` },
          { status: 400 }
        );
      }
    }

    // Calculate program recommendation
    const recommendation = getRecommendedProgram(answers);
    const totalScore = recommendation.scores.kickstart +
                      recommendation.scores.transformatie +
                      recommendation.scores.vip;

    // Save to database
    await sql`
      INSERT INTO user_assessments (
        user_id,
        question_1,
        question_2,
        question_3,
        question_4,
        question_5,
        question_6,
        question_7,
        total_score,
        recommended_program,
        recommendation_confidence,
        completed_at,
        is_completed
      ) VALUES (
        ${userId},
        ${answers.question_1},
        ${answers.question_2},
        ${answers.question_3},
        ${answers.question_4},
        ${answers.question_5},
        ${answers.question_6},
        ${answers.question_7},
        ${totalScore},
        ${recommendation.program},
        ${recommendation.confidence},
        NOW(),
        true
      )
      ON CONFLICT (user_id)
      DO UPDATE SET
        question_1 = EXCLUDED.question_1,
        question_2 = EXCLUDED.question_2,
        question_3 = EXCLUDED.question_3,
        question_4 = EXCLUDED.question_4,
        question_5 = EXCLUDED.question_5,
        question_6 = EXCLUDED.question_6,
        question_7 = EXCLUDED.question_7,
        total_score = EXCLUDED.total_score,
        recommended_program = EXCLUDED.recommended_program,
        recommendation_confidence = EXCLUDED.recommendation_confidence,
        completed_at = NOW(),
        is_completed = true,
        updated_at = NOW()
    `;

    return NextResponse.json({
      success: true,
      recommendation: {
        program: recommendation.program,
        confidence: recommendation.confidence,
        scores: recommendation.scores
      }
    });

  } catch (error) {
    console.error('Error saving assessment:', error);
    return NextResponse.json(
      {
        error: 'Failed to save assessment',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/assessment/save
 * Get user's assessment if it exists
 */
export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Verify JWT and get user ID
    let userId: number;
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
      userId = decoded.userId;
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    // Get assessment from database
    const result = await sql`
      SELECT * FROM user_assessments
      WHERE user_id = ${userId}
      LIMIT 1
    `;

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Assessment not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(result.rows[0]);

  } catch (error) {
    console.error('Error fetching assessment:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch assessment',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
