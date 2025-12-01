import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    // Check if user has a previous assessment
    const existingAssessment = await sql`
      SELECT
        rpa.id,
        rpa.status,
        rpa.completed_at,
        rpp.can_retake_after,
        rpp.assessment_count
      FROM relationship_patterns_assessments rpa
      LEFT JOIN relationship_patterns_progress rpp ON rpp.user_id = rpa.user_id
      WHERE rpa.user_id = ${userId}
      ORDER BY rpa.created_at DESC
      LIMIT 1
    `;

    const hasAssessment = existingAssessment.rows.length > 0;
    const progress = existingAssessment.rows[0];

    return NextResponse.json({
      hasAssessment,
      progress: hasAssessment ? {
        totalAssessments: progress?.assessment_count || 1,
        canRetake: !progress?.can_retake_after || new Date(progress.can_retake_after) <= new Date(),
        nextRetakeDate: progress?.can_retake_after
      } : null
    });

  } catch (error) {
    console.error('Error checking relationship patterns progress:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, action } = body;

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    if (action === 'start') {
      // Create new assessment
      const assessment = await sql`
        INSERT INTO relationship_patterns_assessments (user_id, status)
        VALUES (${userId}, 'in_progress')
        RETURNING *
      `;

      return NextResponse.json({
        success: true,
        assessment: assessment.rows[0]
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error) {
    console.error('Error creating relationship patterns assessment:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}