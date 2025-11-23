/**
 * JOURNEY STATUS API
 * Get user's onboarding journey status and progress
 * GET /api/journey/status?userId={id}
 *
 * Professional implementation with:
 * - Query performance monitoring
 * - Proper error handling
 * - Database validation
 * - Security checks
 */

import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { select } from '@/lib/db/query-wrapper';
import { logDatabaseError } from '@/lib/error-logging';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

interface JourneyStatus {
  status: 'not_started' | 'in_progress' | 'completed';
  currentStep: string;
  completedSteps: string[];
  scanData?: any;
  coachAdvice?: any;
  lastActivity?: string;
}

/**
 * GET /api/journey/status
 * Retrieve user's current journey progress from onboarding_journeys table
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    // Validate userId
    if (!userId || isNaN(Number(userId))) {
      return NextResponse.json(
        { error: 'Valid userId parameter is required' },
        { status: 400 }
      );
    }

    const userIdNum = Number(userId);

    // Query journey status from onboarding_journeys table
    const result = await select(
      async () => {
        return await sql`
          SELECT
            id,
            user_id,
            journey_version,
            current_phase,
            current_step,
            started_at,
            completed_at,
            last_activity,
            status,
            metadata
          FROM onboarding_journeys
          WHERE user_id = ${userIdNum}
          LIMIT 1
        `;
      },
      'get-journey-status'
    );

    // No journey found - user hasn't started
    if (result.rows.length === 0) {
      const response: JourneyStatus = {
        status: 'not_started',
        currentStep: 'welcome',
        completedSteps: [],
      };

      console.log(`📊 Journey status for user ${userIdNum}: not started`);
      return NextResponse.json(response, { status: 200 });
    }

    const journey = result.rows[0];
    const metadata = typeof journey.metadata === 'string'
      ? JSON.parse(journey.metadata)
      : journey.metadata || {};

    // Check if journey is completed
    if (journey.status === 'completed' || journey.completed_at) {
      const response: JourneyStatus = {
        status: 'completed',
        currentStep: 'complete',
        completedSteps: metadata.completedSteps || ['profile', 'welcome', 'scan', 'coach-advice', 'welcome-video', 'welcome-questions'],
        scanData: metadata.scanData,
        coachAdvice: metadata.coachAdvice,
        lastActivity: journey.last_activity,
      };

      console.log(`✅ Journey status for user ${userIdNum}: completed`);
      return NextResponse.json(response, { status: 200 });
    }

    // Journey in progress
    const response: JourneyStatus = {
      status: 'in_progress',
      currentStep: journey.current_phase || 'welcome',
      completedSteps: metadata.completedSteps || [],
      scanData: metadata.scanData,
      coachAdvice: metadata.coachAdvice,
      lastActivity: journey.last_activity,
    };

    console.log(`🔄 Journey status for user ${userIdNum}: ${journey.current_phase}`);
    return NextResponse.json(response, { status: 200 });

  } catch (error) {
    console.error('❌ Journey status error:', error);
    logDatabaseError(
      error instanceof Error ? error : new Error('Unknown journey status error'),
      'get-journey-status'
    );

    return NextResponse.json(
      {
        error: 'Failed to retrieve journey status',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
