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
                'associated_styles', s.associated_styles,
                'weight', s.weight,
                'order_position', s.order_position
              ) ORDER BY s.order_position
            )
            FROM hechtingsstijl_scenarios s
            WHERE s.question_id = q.id
          )
          ELSE NULL
        END as scenarios
      FROM hechtingsstijl_questions q
      ORDER BY q.order_position
    `;

    return NextResponse.json({
      success: true,
      questions: questions
    });

  } catch (error: any) {
    console.error('Error fetching hechtingsstijl questions:', error);
    return NextResponse.json({
      error: 'Failed to fetch questions',
      message: error.message
    }, { status: 500 });
  }
}