import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { ACHIEVEMENTS } from '@/lib/onboarding/achievements';

/**
 * POST /api/onboarding/complete
 * Marks onboarding as completed
 * Input: { userId }
 * Output: { success, achievements: [...], redirectUrl }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    // Get onboarding start time to check for Quick Starter achievement
    const onboardingResult = await sql`
      SELECT started_at, completed_at
      FROM user_onboarding
      WHERE user_id = ${userId}
    `;

    if (onboardingResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'No onboarding found for this user' },
        { status: 404 }
      );
    }

    const onboarding = onboardingResult.rows[0];

    // Don't complete if already completed
    if (onboarding.completed_at) {
      return NextResponse.json({
        success: true,
        message: 'Onboarding already completed',
        redirectUrl: '/dashboard',
      });
    }

    // Mark onboarding as complete
    await sql`
      UPDATE user_onboarding
      SET
        current_step = 'complete',
        completed_at = NOW(),
        updated_at = NOW()
      WHERE user_id = ${userId}
    `;

    const earnedAchievements = [];

    // Award "Roadmap Ready" achievement
    const roadmapAchievement = await sql`
      INSERT INTO user_achievements (user_id, achievement_id, xp_awarded)
      VALUES (${userId}, ${ACHIEVEMENTS.ROADMAP_READY.id}, ${ACHIEVEMENTS.ROADMAP_READY.xp})
      ON CONFLICT (user_id, achievement_id) DO NOTHING
      RETURNING id
    `;

    if (roadmapAchievement.rows.length > 0) {
      earnedAchievements.push(ACHIEVEMENTS.ROADMAP_READY);
      await sql`
        UPDATE user_progress
        SET total_xp = total_xp + ${ACHIEVEMENTS.ROADMAP_READY.xp}
        WHERE user_id = ${userId}
      `;
    }

    // Check for Quick Starter achievement (completed within 10 minutes)
    const startTime = new Date(onboarding.started_at).getTime();
    const now = Date.now();
    const tenMinutes = 10 * 60 * 1000;

    if (now - startTime <= tenMinutes) {
      const quickStarterAchievement = await sql`
        INSERT INTO user_achievements (user_id, achievement_id, xp_awarded)
        VALUES (${userId}, ${ACHIEVEMENTS.QUICK_STARTER.id}, ${ACHIEVEMENTS.QUICK_STARTER.xp})
        ON CONFLICT (user_id, achievement_id) DO NOTHING
        RETURNING id
      `;

      if (quickStarterAchievement.rows.length > 0) {
        earnedAchievements.push(ACHIEVEMENTS.QUICK_STARTER);
        await sql`
          UPDATE user_progress
          SET total_xp = total_xp + ${ACHIEVEMENTS.QUICK_STARTER.xp}
          WHERE user_id = ${userId}
        `;
      }
    }

    // Update last activity date and streak
    await sql`
      UPDATE user_progress
      SET
        last_activity_date = CURRENT_DATE,
        current_streak = CASE
          WHEN last_activity_date = CURRENT_DATE - 1 THEN current_streak + 1
          WHEN last_activity_date = CURRENT_DATE THEN current_streak
          ELSE 1
        END,
        longest_streak = GREATEST(longest_streak,
          CASE
            WHEN last_activity_date = CURRENT_DATE - 1 THEN current_streak + 1
            WHEN last_activity_date = CURRENT_DATE THEN current_streak
            ELSE 1
          END
        ),
        updated_at = NOW()
      WHERE user_id = ${userId}
    `;

    // Get updated progress
    const progressResult = await sql`
      SELECT total_xp, current_level, current_streak
      FROM user_progress
      WHERE user_id = ${userId}
    `;

    return NextResponse.json({
      success: true,
      completedAt: new Date().toISOString(),
      achievements: earnedAchievements,
      progress: progressResult.rows[0],
      redirectUrl: '/dashboard',
    });
  } catch (error) {
    console.error('Error completing onboarding:', error);
    return NextResponse.json(
      { error: 'Failed to complete onboarding' },
      { status: 500 }
    );
  }
}
