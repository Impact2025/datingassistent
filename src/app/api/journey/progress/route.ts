/**
 * JOURNEY PROGRESS API
 * Save user's onboarding journey progress
 * POST /api/journey/progress
 *
 * Professional implementation with:
 * - Upsert pattern (insert or update)
 * - Query performance monitoring
 * - Data validation
 * - Transaction safety
 */

import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { insert, update } from '@/lib/db/query-wrapper';
import { validate } from '@/lib/db/validation';
import { logDatabaseError } from '@/lib/error-logging';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

interface JourneyProgressRequest {
  userId: number;
  currentStep: string;
  completedSteps: string[];
  scanData?: any;
  coachAdvice?: any;
}

/**
 * POST /api/journey/progress
 * Save or update journey progress
 */
export async function POST(request: NextRequest) {
  try {
    const body: JourneyProgressRequest = await request.json();
    const { userId, currentStep, completedSteps, scanData, coachAdvice } = body;

    // Validate required fields
    if (!userId || !currentStep) {
      return NextResponse.json(
        { error: 'userId and currentStep are required' },
        { status: 400 }
      );
    }

    // Validate userId is a number
    const validation = validate({ userId }, [
      { field: 'userId', type: 'number', required: true, min: 1 }
    ]);

    if (!validation.valid) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.errors },
        { status: 400 }
      );
    }

    console.log(`💾 Saving journey progress for user ${userId}: ${currentStep}`);

    // Prepare metadata
    const metadata = {
      completedSteps: completedSteps || [],
      scanData: scanData || null,
      coachAdvice: coachAdvice || null,
      lastUpdated: new Date().toISOString()
    };

    // Check if journey exists
    const existingJourney = await sql`
      SELECT id FROM onboarding_journeys WHERE user_id = ${userId}
    `;

    if (existingJourney.rows.length === 0) {
      // Create new journey
      await insert(
        async () => {
          const isComplete = currentStep === 'complete';

          return await sql`
            INSERT INTO onboarding_journeys (
              user_id,
              journey_version,
              current_phase,
              current_step,
              started_at,
              last_activity,
              status,
              metadata,
              completed_at
            ) VALUES (
              ${userId},
              'v1.0',
              ${currentStep},
              1,
              CURRENT_TIMESTAMP,
              CURRENT_TIMESTAMP,
              ${isComplete ? 'completed' : 'active'},
              ${JSON.stringify(metadata)}::jsonb,
              ${isComplete ? 'CURRENT_TIMESTAMP' : null}
            )
          `;
        },
        'create-journey'
      );

      console.log(`✅ Created new journey for user ${userId}`);
    } else {
      // Update existing journey
      await update(
        async () => {
          const isComplete = currentStep === 'complete';

          if (isComplete) {
            return await sql`
              UPDATE onboarding_journeys
              SET
                current_phase = ${currentStep},
                last_activity = CURRENT_TIMESTAMP,
                status = 'completed',
                completed_at = CURRENT_TIMESTAMP,
                metadata = ${JSON.stringify(metadata)}::jsonb
              WHERE user_id = ${userId}
            `;
          } else {
            return await sql`
              UPDATE onboarding_journeys
              SET
                current_phase = ${currentStep},
                last_activity = CURRENT_TIMESTAMP,
                metadata = ${JSON.stringify(metadata)}::jsonb
              WHERE user_id = ${userId}
            `;
          }
        },
        'update-journey'
      );

      console.log(`✅ Updated journey for user ${userId} to step: ${currentStep}`);
    }

    // If journey is complete, initialize user progress tracking
    if (currentStep === 'complete') {
      try {
        // Initialize progress metrics for the user
        await sql`
          INSERT INTO user_progress_metrics (user_id, metric_type, metric_value, week_start)
          VALUES (
            ${userId},
            'journey_completion',
            100.00,
            DATE_TRUNC('week', CURRENT_TIMESTAMP)::DATE
          )
          ON CONFLICT (user_id, metric_type, week_start) DO NOTHING
        `;

        console.log(`🎉 Journey completed for user ${userId}!`);
      } catch (error) {
        console.error('Failed to initialize progress metrics:', error);
        // Non-blocking - continue even if this fails
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Journey progress saved successfully',
      currentStep,
      status: currentStep === 'complete' ? 'completed' : 'in_progress'
    }, { status: 200 });

  } catch (error) {
    console.error('❌ Journey progress error:', error);
    logDatabaseError(
      error instanceof Error ? error : new Error('Unknown journey progress error'),
      'save-journey-progress'
    );

    return NextResponse.json(
      {
        error: 'Failed to save journey progress',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
