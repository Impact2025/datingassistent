import { NextRequest, NextResponse } from 'next/server';
import { getTodayChallenges } from '@/lib/gamification/challenge-manager';

/**
 * GET /api/gamification/challenges
 * Get today's challenges for a user
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = parseInt(searchParams.get('userId') || '');

    if (isNaN(userId)) {
      return NextResponse.json(
        { error: 'Invalid user ID' },
        { status: 400 }
      );
    }

    const challenges = await getTodayChallenges(userId);

    // Transform to frontend format
    const formattedChallenges = challenges.map((challenge: any) => ({
      id: challenge.challenge_id,
      title: challenge.title,
      description: challenge.description,
      icon: challenge.icon,
      color: challenge.color,
      progress: challenge.progress || 0,
      pointsReward: challenge.points_reward + challenge.bonus_reward,
      difficulty: challenge.difficulty,
      status: challenge.status || 'active'
    }));

    return NextResponse.json({
      challenges: formattedChallenges,
      total: formattedChallenges.length,
      completed: formattedChallenges.filter((c: any) => c.status === 'completed').length
    });

  } catch (error) {
    console.error('Error fetching challenges:', error);
    return NextResponse.json(
      { error: 'Failed to fetch challenges' },
      { status: 500 }
    );
  }
}
