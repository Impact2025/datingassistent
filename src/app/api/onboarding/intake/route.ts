import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { getRecommendedPath } from '@/lib/onboarding/getRecommendedPath';
import { ACHIEVEMENTS } from '@/lib/onboarding/achievements';

/**
 * POST /api/onboarding/intake
 * Saves intake answers and calculates recommended path
 * Input: { userId, primaryGoal, biggestChallenge, experienceLevel }
 * Output: { recommendedPath, priorityTools, irisPersonality, pathInfo }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, primaryGoal, biggestChallenge, experienceLevel } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    if (!primaryGoal || !biggestChallenge || !experienceLevel) {
      return NextResponse.json(
        { error: 'All intake fields are required' },
        { status: 400 }
      );
    }

    // Calculate recommended path
    const recommendation = getRecommendedPath({
      primaryGoal,
      biggestChallenge,
      experienceLevel,
    });

    // Update onboarding with intake data
    await sql`
      UPDATE user_onboarding
      SET
        primary_goal = ${primaryGoal},
        biggest_challenge = ${biggestChallenge},
        experience_level = ${experienceLevel},
        recommended_path = ${recommendation.path},
        priority_tools = ${recommendation.priorityTools},
        iris_personality = ${recommendation.irisPersonality},
        current_step = 'roadmap',
        updated_at = NOW()
      WHERE user_id = ${userId}
    `;

    // Award "Self Aware" achievement
    const achievementResult = await sql`
      INSERT INTO user_achievements (user_id, achievement_id, xp_awarded)
      VALUES (${userId}, ${ACHIEVEMENTS.SELF_AWARE.id}, ${ACHIEVEMENTS.SELF_AWARE.xp})
      ON CONFLICT (user_id, achievement_id) DO NOTHING
      RETURNING id
    `;

    // Update XP if achievement was newly awarded
    if (achievementResult.rows.length > 0) {
      await sql`
        UPDATE user_progress
        SET total_xp = total_xp + ${ACHIEVEMENTS.SELF_AWARE.xp},
            updated_at = NOW()
        WHERE user_id = ${userId}
      `;
    }

    return NextResponse.json({
      success: true,
      recommendation: {
        path: recommendation.path,
        pathTitle: recommendation.pathTitle,
        pathDescription: recommendation.pathDescription,
        priorityTools: recommendation.priorityTools,
        irisPersonality: recommendation.irisPersonality,
      },
      intake: {
        primaryGoal,
        biggestChallenge,
        experienceLevel,
      },
      newAchievement: achievementResult.rows.length > 0 ? ACHIEVEMENTS.SELF_AWARE : null,
    });
  } catch (error) {
    console.error('Error saving intake:', error);
    return NextResponse.json(
      { error: 'Failed to save intake' },
      { status: 500 }
    );
  }
}
