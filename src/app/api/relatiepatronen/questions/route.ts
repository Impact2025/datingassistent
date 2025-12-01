import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function GET() {
  try {
    // Get all questions with their scenarios
    const questionsResult = await sql`
      SELECT
        q.id,
        q.question_type,
        q.question_text,
        q.category,
        q.is_reverse_scored,
        q.weight,
        q.order_position,
        COALESCE(
          json_agg(
            json_build_object(
              'id', s.id,
              'text', s.option_text,
              'styles', s.associated_patterns,
              'weight', s.weight,
              'order', s.order_position
            ) ORDER BY s.order_position
          ) FILTER (WHERE s.id IS NOT NULL),
          '[]'::json
        ) as scenarios
      FROM relationship_patterns_questions q
      LEFT JOIN relationship_patterns_scenarios s ON q.id = s.question_id
      GROUP BY q.id, q.question_type, q.question_text, q.category, q.is_reverse_scored, q.weight, q.order_position
      ORDER BY q.order_position
    `;

    return NextResponse.json({
      questions: questionsResult.rows,
      total: questionsResult.rows.length
    });

  } catch (error) {
    console.error('Error fetching relationship patterns questions:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}