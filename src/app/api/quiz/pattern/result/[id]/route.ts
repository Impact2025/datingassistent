import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import type { PatternQuizResultResponse } from '@/lib/quiz/pattern/pattern-types';

/**
 * Pattern Quiz Result API
 *
 * Fetches quiz result by ID for displaying on result page.
 */

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Invalid result ID' },
        { status: 400 }
      );
    }

    const result = await sql`
      SELECT
        id,
        first_name,
        email,
        attachment_pattern,
        anxiety_score,
        avoidance_score,
        pattern_confidence,
        answers,
        completed_at
      FROM pattern_quiz_results
      WHERE id = ${parseInt(id)}
    `;

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Result not found' },
        { status: 404 }
      );
    }

    const row = result.rows[0];

    const response: PatternQuizResultResponse = {
      id: row.id,
      firstName: row.first_name,
      email: row.email,
      attachmentPattern: row.attachment_pattern,
      anxietyScore: row.anxiety_score,
      avoidanceScore: row.avoidance_score,
      confidence: row.pattern_confidence,
      answers: row.answers,
      completedAt: row.completed_at,
    };

    return NextResponse.json(response);
  } catch (error: unknown) {
    console.error('Error fetching pattern quiz result:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Internal server error', details: message },
      { status: 500 }
    );
  }
}
