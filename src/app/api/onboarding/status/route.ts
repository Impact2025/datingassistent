import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

/**
 * GET /api/onboarding/status
 * Retrieves current onboarding status for a user
 * Query: ?userId=123
 * Output: { currentStep, intake, recommendedPath, progress, etc. }
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    // Get onboarding status
    const onboardingResult = await sql`
      SELECT
        id,
        program_id,
        current_step,
        started_at,
        completed_at,
        primary_goal,
        biggest_challenge,
        experience_level,
        recommended_path,
        priority_tools,
        iris_personality,
        first_tool_used,
        first_tool_completed_at
      FROM user_onboarding
      WHERE user_id = ${userId}
    `;

    if (onboardingResult.rows.length === 0) {
      return NextResponse.json({
        exists: false,
        message: 'No onboarding found for this user',
      });
    }

    const onboarding = onboardingResult.rows[0];

    // Get user progress
    const progressResult = await sql`
      SELECT total_xp, current_level, current_streak, longest_streak
      FROM user_progress
      WHERE user_id = ${userId}
    `;

    const progress = progressResult.rows[0] || {
      total_xp: 0,
      current_level: 1,
      current_streak: 0,
      longest_streak: 0,
    };

    // Get achievements
    const achievementsResult = await sql`
      SELECT achievement_id, earned_at, xp_awarded
      FROM user_achievements
      WHERE user_id = ${userId}
      ORDER BY earned_at DESC
    `;

    // Calculate onboarding progress percentage
    const steps = ['welcome', 'intake', 'roadmap', 'complete'];
    const currentStepIndex = steps.indexOf(onboarding.current_step);
    const progressPercentage = onboarding.completed_at
      ? 100
      : Math.round((currentStepIndex / (steps.length - 1)) * 100);

    return NextResponse.json({
      exists: true,
      onboarding: {
        id: onboarding.id,
        programId: onboarding.program_id,
        currentStep: onboarding.current_step,
        startedAt: onboarding.started_at,
        completedAt: onboarding.completed_at,
        progressPercentage,
      },
      intake: {
        primaryGoal: onboarding.primary_goal,
        biggestChallenge: onboarding.biggest_challenge,
        experienceLevel: onboarding.experience_level,
      },
      recommendation: {
        path: onboarding.recommended_path,
        priorityTools: onboarding.priority_tools,
        irisPersonality: onboarding.iris_personality,
      },
      engagement: {
        firstToolUsed: onboarding.first_tool_used,
        firstToolCompletedAt: onboarding.first_tool_completed_at,
      },
      progress,
      achievements: achievementsResult.rows,
    });
  } catch (error) {
    console.error('Error getting onboarding status:', error);
    return NextResponse.json(
      { error: 'Failed to get onboarding status' },
      { status: 500 }
    );
  }
}
