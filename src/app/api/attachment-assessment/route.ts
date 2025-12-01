import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

// GET - Get user's attachment assessment status/progress
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    // Get user's latest assessment
    const assessmentResult = await sql`
      SELECT
        aa.*,
        ar.primary_style,
        ar.confidence_score as result_confidence,
        ar.created_at as result_created_at
      FROM attachment_assessments aa
      LEFT JOIN attachment_results ar ON aa.id = ar.assessment_id
      WHERE aa.user_id = ${userId}
      ORDER BY aa.created_at DESC
      LIMIT 1
    `;

    // Get progress info
    const progressResult = await sql`
      SELECT * FROM attachment_progress WHERE user_id = ${userId}
    `;

    const assessment = assessmentResult.rows[0];
    const progress = progressResult.rows[0];

    return NextResponse.json({
      assessment: assessment || null,
      progress: progress || null,
      canTakeAssessment: !progress?.can_retake_after || new Date() > new Date(progress.can_retake_after)
    });

  } catch (error) {
    console.error('Error fetching attachment assessment:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Start new assessment or save responses
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, action, responses, assessmentId } = body;

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    if (action === 'start') {
      // Start new assessment
      const result = await sql`
        INSERT INTO attachment_assessments (user_id, status)
        VALUES (${userId}, 'in_progress')
        RETURNING *
      `;

      // Initialize progress if not exists
      await sql`
        INSERT INTO attachment_progress (user_id, assessment_count)
        VALUES (${userId}, 0)
        ON CONFLICT (user_id) DO NOTHING
      `;

      return NextResponse.json({ assessment: result.rows[0] });

    } else if (action === 'save_responses' && assessmentId && responses) {
      // Save responses for existing assessment
      const responseInserts = responses.map((response: any) =>
        sql`
          INSERT INTO attachment_responses (assessment_id, question_id, response_value, response_time_ms)
          VALUES (${assessmentId}, ${response.questionId}, ${response.value}, ${response.timeMs || null})
        `
      );

      await Promise.all(responseInserts);

      return NextResponse.json({ success: true });

    } else if (action === 'complete' && assessmentId) {
      // Mark assessment as completed
      const completedAt = new Date().toISOString();
      await sql`
        UPDATE attachment_assessments
        SET status = 'completed', completed_at = ${completedAt}
        WHERE id = ${assessmentId}
      `;

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error) {
    console.error('Error in attachment assessment:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}