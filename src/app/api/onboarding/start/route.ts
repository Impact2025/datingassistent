import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { ACHIEVEMENTS } from '@/lib/onboarding/achievements';

/**
 * POST /api/onboarding/start
 * Creates a user_onboarding record after successful payment
 * Input: { userId, programId }
 * Output: { success, redirectUrl, onboardingId }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, programId } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    // Check if onboarding already exists
    const existingOnboarding = await sql`
      SELECT id, current_step, completed_at
      FROM user_onboarding
      WHERE user_id = ${userId}
    `;

    if (existingOnboarding.rows.length > 0) {
      const existing = existingOnboarding.rows[0];

      // If already completed, redirect to dashboard
      if (existing.completed_at) {
        return NextResponse.json({
          success: true,
          redirectUrl: '/dashboard',
          message: 'Onboarding already completed',
          onboardingId: existing.id,
        });
      }

      // Resume existing onboarding
      return NextResponse.json({
        success: true,
        redirectUrl: `/onboarding/${existing.current_step}`,
        message: 'Resuming existing onboarding',
        onboardingId: existing.id,
      });
    }

    // Create new onboarding record
    const result = await sql`
      INSERT INTO user_onboarding (user_id, program_id, current_step, started_at)
      VALUES (${userId}, ${programId || null}, 'welcome', NOW())
      RETURNING id
    `;

    const onboardingId = result.rows[0].id;

    // Initialize user progress if not exists
    await sql`
      INSERT INTO user_progress (user_id, total_xp, current_level, current_streak)
      VALUES (${userId}, 0, 1, 0)
      ON CONFLICT (user_id) DO NOTHING
    `;

    // Award "First Step" achievement
    await sql`
      INSERT INTO user_achievements (user_id, achievement_id, xp_awarded)
      VALUES (${userId}, ${ACHIEVEMENTS.FIRST_STEP.id}, ${ACHIEVEMENTS.FIRST_STEP.xp})
      ON CONFLICT (user_id, achievement_id) DO NOTHING
    `;

    // Update user progress with XP
    await sql`
      UPDATE user_progress
      SET total_xp = total_xp + ${ACHIEVEMENTS.FIRST_STEP.xp},
          updated_at = NOW()
      WHERE user_id = ${userId}
    `;

    return NextResponse.json({
      success: true,
      redirectUrl: '/onboarding/welcome',
      onboardingId,
      achievement: ACHIEVEMENTS.FIRST_STEP,
    });
  } catch (error) {
    console.error('Error starting onboarding:', error);
    return NextResponse.json(
      { error: 'Failed to start onboarding' },
      { status: 500 }
    );
  }
}
