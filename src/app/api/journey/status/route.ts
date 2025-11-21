import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    // Check if user_journey_progress table exists and get status
    const result = await sql`
      SELECT
        current_step,
        completed_steps,
        journey_started_at,
        CASE
          WHEN current_step = 'complete' THEN 'completed'
          WHEN journey_started_at IS NOT NULL THEN 'in_progress'
          ELSE 'not_started'
        END as status
      FROM user_journey_progress
      WHERE user_id = ${userId}
    `;

    if (result.rows.length === 0) {
      // No journey started yet
      return NextResponse.json({
        status: 'not_started',
        currentStep: null,
        completedSteps: [],
      });
    }

    const journey = result.rows[0];

    // Get additional data if available
    let scanData = null;
    let dnaResults = null;
    let goalsData = null;

    // Try to get personality scan data
    try {
      const scanResult = await sql`
        SELECT * FROM personality_scans
        WHERE user_id = ${userId}
        ORDER BY completed_at DESC
        LIMIT 1
      `;

      if (scanResult.rows.length > 0) {
        scanData = {
          currentSituation: scanResult.rows[0].current_situation,
          comfortLevel: scanResult.rows[0].comfort_level,
          mainChallenge: scanResult.rows[0].main_challenge,
          desiredOutcome: scanResult.rows[0].desired_outcome,
          strengthSelf: scanResult.rows[0].strength_self,
          weaknessSelf: scanResult.rows[0].weakness_self,
          weeklyCommitment: scanResult.rows[0].weekly_commitment,
        };
        dnaResults = scanResult.rows[0].ai_generated_profile;
      }
    } catch (error) {
      console.log('No personality scan data available');
    }

    // Try to get goals data
    try {
      const goalsResult = await sql`
        SELECT
          goal_type,
          title,
          description,
          category
        FROM goal_hierarchies
        WHERE user_id = ${userId}
        ORDER BY created_at DESC
        LIMIT 10
      `;

      if (goalsResult.rows.length > 0) {
        goalsData = goalsResult.rows;
      }
    } catch (error) {
      console.log('No goals data available');
    }

    return NextResponse.json({
      status: journey.status,
      currentStep: journey.current_step,
      completedSteps: journey.completed_steps || [],
      journeyStartedAt: journey.journey_started_at,
      scanData,
      dnaResults,
      goalsData,
    });

  } catch (error) {
    console.error('Journey status error:', error);
    return NextResponse.json(
      { error: 'Failed to get journey status' },
      { status: 500 }
    );
  }
}
