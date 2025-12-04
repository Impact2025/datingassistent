import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { getCurrentUser } from '@/lib/auth';
import type { KickstartIntakeData, KickstartOnboardingRecord } from '@/types/kickstart-onboarding.types';

export const dynamic = 'force-dynamic';

/**
 * POST /api/kickstart/onboarding
 * Save Kickstart onboarding data
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const userId = user.id;
    const body = await request.json();
    const data: KickstartIntakeData = body.data;

    // Validate required fields
    if (!data.preferredName || !data.age) {
      return NextResponse.json(
        { error: 'preferredName and age are required' },
        { status: 400 }
      );
    }

    if (data.age < 18 || data.age > 99) {
      return NextResponse.json(
        { error: 'Age must be between 18 and 99' },
        { status: 400 }
      );
    }

    if (data.confidenceLevel < 1 || data.confidenceLevel > 10) {
      return NextResponse.json(
        { error: 'Confidence level must be between 1 and 10' },
        { status: 400 }
      );
    }

    // Get Kickstart enrollment
    const enrollmentResult = await sql`
      SELECT pe.id, pe.program_id
      FROM program_enrollments pe
      JOIN programs p ON p.id = pe.program_id
      WHERE pe.user_id = ${userId}
        AND p.slug = 'kickstart'
        AND pe.status = 'active'
      LIMIT 1
    `;

    if (enrollmentResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'No active Kickstart enrollment found' },
        { status: 404 }
      );
    }

    const enrollment = enrollmentResult.rows[0];
    const programId = enrollment.program_id;

    // Insert or update onboarding data
    const result = await sql`
      INSERT INTO kickstart_onboarding (
        user_id,
        program_enrollment_id,
        preferred_name,
        gender,
        looking_for,
        region,
        age,
        dating_status,
        single_duration,
        dating_apps,
        weekly_matches,
        biggest_frustration,
        profile_description,
        biggest_difficulty,
        relationship_goal,
        confidence_level,
        biggest_fear,
        ideal_outcome,
        completed_at
      ) VALUES (
        ${userId},
        ${enrollment.id},
        ${data.preferredName},
        ${data.gender},
        ${data.lookingFor},
        ${data.region},
        ${data.age},
        ${data.datingStatus},
        ${data.singleDuration},
        ${data.datingApps},
        ${data.weeklyMatches},
        ${data.biggestFrustration},
        ${data.profileDescription},
        ${data.biggestDifficulty},
        ${data.relationshipGoal},
        ${data.confidenceLevel},
        ${data.biggestFear},
        ${data.idealOutcome},
        NOW()
      )
      ON CONFLICT (user_id) DO UPDATE SET
        preferred_name = EXCLUDED.preferred_name,
        gender = EXCLUDED.gender,
        looking_for = EXCLUDED.looking_for,
        region = EXCLUDED.region,
        age = EXCLUDED.age,
        dating_status = EXCLUDED.dating_status,
        single_duration = EXCLUDED.single_duration,
        dating_apps = EXCLUDED.dating_apps,
        weekly_matches = EXCLUDED.weekly_matches,
        biggest_frustration = EXCLUDED.biggest_frustration,
        profile_description = EXCLUDED.profile_description,
        biggest_difficulty = EXCLUDED.biggest_difficulty,
        relationship_goal = EXCLUDED.relationship_goal,
        confidence_level = EXCLUDED.confidence_level,
        biggest_fear = EXCLUDED.biggest_fear,
        ideal_outcome = EXCLUDED.ideal_outcome,
        completed_at = NOW(),
        updated_at = NOW()
      RETURNING *
    `;

    const onboardingRecord = result.rows[0] as KickstartOnboardingRecord;

    // Mark enrollment as onboarding completed
    await sql`
      UPDATE program_enrollments
      SET kickstart_onboarding_completed = true
      WHERE id = ${enrollment.id}
    `;

    // Initialize Day 1 progress if not exists
    const day1Result = await sql`
      SELECT id FROM program_days
      WHERE program_id = ${programId} AND dag_nummer = 1
      LIMIT 1
    `;

    if (day1Result.rows.length > 0) {
      const day1Id = day1Result.rows[0].id;

      // Check if progress exists
      const progressExists = await sql`
        SELECT id FROM user_day_progress
        WHERE user_id = ${userId} AND day_id = ${day1Id}
        LIMIT 1
      `;

      if (progressExists.rows.length === 0) {
        // Create Day 1 as available
        await sql`
          INSERT INTO user_day_progress (
            user_id, program_id, day_id, status
          ) VALUES (
            ${userId}, ${programId}, ${day1Id}, 'available'
          )
        `;
      }
    }

    console.log(`✅ Kickstart onboarding completed for user ${userId}`);

    return NextResponse.json({
      success: true,
      onboarding: onboardingRecord,
      nextUrl: '/kickstart/dag/1',
      message: 'Onboarding completed successfully! Ready to start Day 1.'
    });

  } catch (error) {
    console.error('Kickstart onboarding error:', error);
    return NextResponse.json(
      {
        error: 'Failed to save onboarding data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/kickstart/onboarding
 * Check onboarding status and get data if completed
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const userId = user.id;

    // Get onboarding data
    const result = await sql`
      SELECT * FROM kickstart_onboarding
      WHERE user_id = ${userId}
      LIMIT 1
    `;

    if (result.rows.length === 0) {
      return NextResponse.json({
        completed: false,
        data: null
      });
    }

    const onboardingRecord = result.rows[0] as KickstartOnboardingRecord;

    return NextResponse.json({
      completed: true,
      data: onboardingRecord
    });

  } catch (error) {
    console.error('Get onboarding status error:', error);
    return NextResponse.json(
      { error: 'Failed to get onboarding status' },
      { status: 500 }
    );
  }
}
