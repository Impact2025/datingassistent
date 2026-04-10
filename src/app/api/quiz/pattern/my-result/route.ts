import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { authenticateUser } from '@/lib/auth-utils';

/**
 * GET /api/quiz/pattern/my-result
 *
 * Returns the most recent pattern quiz result for the authenticated user's email.
 * Used by the dashboard to detect quiz leads who haven't yet purchased a program.
 */
export async function GET(request: NextRequest) {
  const authResult = await authenticateUser(request);

  if (authResult instanceof NextResponse) {
    return authResult;
  }

  const { email } = authResult;

  if (!email) {
    return NextResponse.json({ result: null });
  }

  try {
    const result = await sql`
      SELECT
        id,
        first_name,
        attachment_pattern,
        anxiety_score,
        avoidance_score,
        pattern_confidence,
        completed_at
      FROM pattern_quiz_results
      WHERE LOWER(email) = LOWER(${email})
      ORDER BY completed_at DESC
      LIMIT 1
    `;

    if (result.rows.length === 0) {
      return NextResponse.json({ result: null });
    }

    const row = result.rows[0];
    return NextResponse.json({
      result: {
        id: row.id,
        firstName: row.first_name,
        attachmentPattern: row.attachment_pattern,
        anxietyScore: row.anxiety_score,
        avoidanceScore: row.avoidance_score,
        confidence: row.pattern_confidence,
        completedAt: row.completed_at,
      },
    });
  } catch (error) {
    console.error('Error fetching quiz result by email:', error);
    return NextResponse.json({ result: null });
  }
}
