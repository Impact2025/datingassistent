import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { PRIORITY_ACTIONS } from '@/components/onboarding/PriorityActionCard';
import { ACHIEVEMENTS } from '@/lib/onboarding/achievements';

/**
 * GET /api/dashboard/personalized
 * Retrieves personalized dashboard data for a user
 * Query: ?userId=123
 * Output: { priorityAction, progress, achievements, irisMessages, stats }
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

    // Get user info
    const userResult = await sql`
      SELECT name, created_at
      FROM users
      WHERE id = ${userId}
    `;

    if (userResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const user = userResult.rows[0];
    const firstName = user.name?.split(' ')[0] || 'daar';

    // Get onboarding status
    const onboardingResult = await sql`
      SELECT
        recommended_path,
        priority_tools,
        iris_personality,
        first_tool_used,
        first_tool_completed_at,
        completed_at,
        started_at
      FROM user_onboarding
      WHERE user_id = ${userId}
    `;

    const onboarding = onboardingResult.rows[0];
    const recommendedPath = onboarding?.recommended_path || 'profile';
    const isFirstVisit = onboarding?.completed_at && !onboarding?.first_tool_used;

    // Get user progress
    const progressResult = await sql`
      SELECT total_xp, current_level, current_streak, longest_streak, last_activity_date
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
      LIMIT 10
    `;

    // Calculate days active
    const startDate = onboarding?.started_at || user.created_at;
    const daysActive = Math.max(
      1,
      Math.floor((Date.now() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1
    );

    // Get tools usage count (simplified - could be expanded)
    const toolsUsed = onboarding?.first_tool_used ? 1 : 0;

    // Generate Iris messages based on context
    const irisMessages = generateIrisMessages({
      firstName,
      recommendedPath,
      isFirstVisit,
      personality: onboarding?.iris_personality || 'supportive',
      daysActive,
      streak: progress.current_streak,
    });

    // Get priority action based on path
    const priorityAction = PRIORITY_ACTIONS[recommendedPath] || PRIORITY_ACTIONS.profile;

    // Calculate transformation phase
    const transformationPhases = [
      {
        title: 'Fundament',
        subtitle: 'Profiel & Basis',
        progress: toolsUsed > 0 ? 25 : 0,
        isLocked: false,
      },
      {
        title: 'Connectie',
        subtitle: 'Gesprekken & Matches',
        progress: 0,
        isLocked: toolsUsed === 0,
      },
      {
        title: 'Dates',
        subtitle: 'Van Match naar Date',
        progress: 0,
        isLocked: true,
      },
    ];

    return NextResponse.json({
      user: {
        firstName,
        daysActive,
      },
      isFirstVisit,
      priorityAction,
      progress: {
        totalXp: progress.total_xp,
        currentLevel: progress.current_level,
        currentStreak: progress.current_streak,
        longestStreak: progress.longest_streak,
      },
      stats: {
        daysActive,
        toolsUsed,
        completionPercentage: Math.round(
          transformationPhases.reduce((acc, p) => acc + p.progress, 0) /
            transformationPhases.length
        ),
      },
      transformationPhases,
      achievements: achievementsResult.rows.map((a) => ({
        ...ACHIEVEMENTS[a.achievement_id.toUpperCase()] || { id: a.achievement_id, name: a.achievement_id, icon: '🏆' },
        earnedAt: a.earned_at,
      })),
      irisMessages,
      recommendation: {
        path: recommendedPath,
        personality: onboarding?.iris_personality,
      },
    });
  } catch (error) {
    console.error('Error fetching personalized dashboard:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}

interface IrisMessageContext {
  firstName: string;
  recommendedPath: string;
  isFirstVisit: boolean;
  personality: string;
  daysActive: number;
  streak: number;
}

function generateIrisMessages(context: IrisMessageContext): {
  welcome: string;
  motivation: string;
  tip: string;
} {
  const { firstName, recommendedPath, isFirstVisit, personality, daysActive, streak } = context;

  // Welcome messages
  const welcomeMessages: Record<string, string> = {
    supportive: `Welkom terug, ${firstName}! Ik ben zo blij om je weer te zien. Samen gaan we weer een stap vooruit zetten.`,
    motivational: `Hey ${firstName}! Klaar om vandaag weer te shinen? Je hebt dit! Laten we ervoor gaan.`,
    direct: `${firstName}, goed dat je er bent. Je weet wat je te doen staat. Laten we beginnen.`,
  };

  // First visit messages
  if (isFirstVisit) {
    return {
      welcome: `Welkom in je dashboard, ${firstName}! Dit is het begin van je transformatie. Ik heb al een eerste stap voor je klaarliggen.`,
      motivation: 'Je hebt de belangrijkste stap al gezet: beginnen. Nu gaan we samen zorgen dat je meer succes krijgt in dating.',
      tip: 'Begin met de aanbevolen eerste actie - die heb ik speciaal voor jou geselecteerd!',
    };
  }

  // Regular messages based on streak
  let motivationMessage = '';
  if (streak >= 7) {
    motivationMessage = `Wow, ${streak} dagen op rij! Je bent echt toegewijd. Die consistentie gaat je resultaten geven!`;
  } else if (streak >= 3) {
    motivationMessage = `${streak} dagen streak! Je bouwt momentum op. Houd dit vast!`;
  } else if (daysActive > 7) {
    motivationMessage = 'Elke actie telt. Ook al voel je het niet, je maakt vooruitgang.';
  } else {
    motivationMessage = 'De eerste dagen zijn het belangrijkst. Blijf komen opdagen!';
  }

  // Tips based on path
  const tipMessages: Record<string, string> = {
    profile: 'Heb je al je profiel laten analyseren? Kleine aanpassingen kunnen een groot verschil maken.',
    conversation: 'Probeer vandaag eens een nieuw type opener. Variatie houdt het interessant!',
    dating: 'Vergeet niet: een date is gewoon twee mensen die elkaar leren kennen. Wees jezelf.',
    confidence: 'Herinner jezelf eraan: je bent waardevol precies zoals je bent. De rest is bonus.',
  };

  return {
    welcome: welcomeMessages[personality] || welcomeMessages.supportive,
    motivation: motivationMessage,
    tip: tipMessages[recommendedPath] || tipMessages.profile,
  };
}
