import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function GET() {
  try {
    // Get all questions with their scenarios
    const questions = await sql`
      SELECT
        q.id,
        q.question_type,
        q.question_text,
        q.category,
        q.is_reverse_scored,
        q.weight,
        q.order_position,
        CASE
          WHEN q.question_type = 'scenario' THEN (
            SELECT json_agg(
              json_build_object(
                'id', s.id,
                'option_text', s.option_text,
                'associated_readiness', s.associated_readiness,
                'weight', s.weight,
                'order_position', s.order_position
              ) ORDER BY s.order_position
            )
            FROM emotionele_readiness_scenarios s
            WHERE s.question_id = q.id
          )
          ELSE NULL
        END as scenarios
      FROM emotionele_readiness_questions q
      ORDER BY q.order_position
    `;

    return NextResponse.json({
      success: true,
      questions: questions
    });

  } catch (error: any) {
    console.error('Error fetching emotionele readiness questions:', error);
    return NextResponse.json({
      error: 'Failed to fetch questions',
      message: error.message
    }, { status: 500 });
  }
}