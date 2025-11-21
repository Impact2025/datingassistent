import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function POST(request: NextRequest) {
  try {
    const {
      userId,
      currentStep,
      completedSteps,
      scanData,
      dnaResults,
      goalsData,
    } = await request.json();

    if (!userId || !currentStep) {
      return NextResponse.json(
        { error: 'userId and currentStep are required' },
        { status: 400 }
      );
    }

    console.log('💾 Saving journey progress:', {
      userId,
      currentStep,
      completedSteps,
      hasScanData: !!scanData,
      hasDnaResults: !!dnaResults,
      hasGoalsData: !!goalsData,
    });

    // Check if user_journey_progress exists
    const checkResult = await sql`
      SELECT user_id FROM user_journey_progress WHERE user_id = ${userId}
    `;

    if (checkResult.rows.length === 0) {
      // Create new journey record
      // If starting at 'complete' (unusual but possible), set completed_at
      if (currentStep === 'complete') {
        await sql`
          INSERT INTO user_journey_progress (
            user_id,
            current_step,
            completed_steps,
            journey_started_at,
            journey_completed_at
          ) VALUES (
            ${userId},
            ${currentStep},
            ${JSON.stringify(completedSteps || [])},
            NOW(),
            NOW()
          )
        `;
        console.log('✅ Created and COMPLETED journey record for user:', userId);
      } else {
        await sql`
          INSERT INTO user_journey_progress (
            user_id,
            current_step,
            completed_steps,
            journey_started_at
          ) VALUES (
            ${userId},
            ${currentStep},
            ${JSON.stringify(completedSteps || [])},
            NOW()
          )
        `;
        console.log('✅ Created new journey record for user:', userId);
      }
    } else {
      // Update existing journey record
      // If currentStep is 'complete', also set journey_completed_at
      if (currentStep === 'complete') {
        await sql`
          UPDATE user_journey_progress
          SET
            current_step = ${currentStep},
            completed_steps = ${JSON.stringify(completedSteps || [])},
            journey_completed_at = NOW(),
            updated_at = NOW()
          WHERE user_id = ${userId}
        `;
        console.log('✅ Journey COMPLETED for user:', userId);
      } else {
        await sql`
          UPDATE user_journey_progress
          SET
            current_step = ${currentStep},
            completed_steps = ${JSON.stringify(completedSteps || [])},
            updated_at = NOW()
          WHERE user_id = ${userId}
        `;
        console.log('✅ Updated journey progress for user:', userId);
      }
    }

    // Save personality scan data if provided
    if (scanData && dnaResults) {
      try {
        const scanCheckResult = await sql`
          SELECT user_id FROM personality_scans WHERE user_id = ${userId}
        `;

        if (scanCheckResult.rows.length === 0) {
          await sql`
            INSERT INTO personality_scans (
              user_id,
              scan_version,
              current_situation,
              comfort_level,
              main_challenge,
              desired_outcome,
              strength_self,
              weakness_self,
              weekly_commitment,
              ai_generated_profile,
              completed_at
            ) VALUES (
              ${userId},
              'v1.0',
              ${scanData.currentSituation || null},
              ${scanData.comfortLevel || null},
              ${scanData.mainChallenge || null},
              ${scanData.desiredOutcome || null},
              ${scanData.strengthSelf || null},
              ${scanData.weaknessSelf || null},
              ${scanData.weeklyCommitment || null},
              ${JSON.stringify(dnaResults)},
              NOW()
            )
          `;
          console.log('✅ Saved personality scan data for user:', userId);
        }
      } catch (error) {
        console.error('Failed to save personality scan:', error);
        // Continue even if scan save fails
      }
    }

    // Save goals data if provided
    if (goalsData) {
      try {
        // Goals will be saved by the GoalsWizard component via its own API
        console.log('ℹ️ Goals data provided, will be saved by goals API');
      } catch (error) {
        console.error('Failed to save goals:', error);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Journey progress saved successfully',
      currentStep,
    });

  } catch (error) {
    console.error('Journey progress error:', error);
    return NextResponse.json(
      { error: 'Failed to save journey progress' },
      { status: 500 }
    );
  }
}
