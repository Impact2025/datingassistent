import { NextRequest, NextResponse } from 'next/server';
import { AIDatingCoach, type CoachingContext } from '@/lib/ai-coach-service';
import { AIContextManager } from '@/lib/ai-context-manager';
import { verifyToken } from '@/lib/auth';
import { sql } from '@vercel/postgres';
import type { UserProfile } from '@/lib/types';

interface ScanAnswers {
  current_situation: string;
  dating_feeling: number;
  main_obstacles: string[];
  goal_30_90_days: string;
  social_strengths: string;
  dating_difficulty: string;
  weekly_time: string;
}

interface CoachAdvice {
  greeting: string;
  analysis: {
    currentState: string;
    mainChallenge: string;
    biggestOpportunity: string;
  };
  recommendations: {
    step1: { title: string; description: string };
    step2: { title: string; description: string };
    step3: { title: string; description: string };
  };
  tools: {
    tool1: { name: string; reason: string };
    tool2: { name: string; reason: string };
  };
  weekGoal: string;
  todayAction: string;
}

export async function POST(request: NextRequest) {
  try {
    // Get user from authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'No authorization token provided' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    console.log('🔐 Coach API: Token received:', token ? token.substring(0, 20) + '...' : 'none');

    const user = await verifyToken(token);
    console.log('🔐 Coach API: Token verification result:', !!user, user ? `user ${user.id}` : 'null');

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    // 🔒 SUBSCRIPTION: Skip limit check for onboarding personality scan
    // Users should be able to complete onboarding without hitting limits
    // const { checkAndEnforceLimit } = await import('@/lib/api-helpers');
    // const limitCheck = await checkAndEnforceLimit(user.id, 'ai_message');
    // if (limitCheck) {
    //   return limitCheck;
    // }

    const body = await request.json();
    const answers: ScanAnswers = body;

    // Validate required fields
    if (!answers.current_situation || !answers.goal_30_90_days) {
      return NextResponse.json(
        { error: 'Missende verplichte velden' },
        { status: 400 }
      );
    }

    // Fetch user profile from database
    const profileResult = await sql`
      SELECT profile FROM users WHERE id = ${user.id}
    `;

    let userProfile: UserProfile | null = null;
    if (profileResult.rows.length > 0 && profileResult.rows[0].profile) {
      userProfile = profileResult.rows[0].profile as UserProfile;
    }

    // Get AI context for personalized coaching
    const userAIContext = await AIContextManager.getUserContext(user.id);

    // Build coaching context for personality assessment
    const coachingContext: CoachingContext = {
      userId: user.id,
      conversationHistory: [], // New conversation for personality assessment
      userProfile,
      aiContext: userAIContext,
      coachingPhase: 'assessment',
      personalityInsights: {
        type: 'unknown', // Will be determined from scan
        traits: [],
        strengths: answers.social_strengths ? answers.social_strengths.split(',').map(s => s.trim()) : [],
        challenges: answers.dating_difficulty ? answers.dating_difficulty.split(',').map(s => s.trim()) : []
      },
      successPatterns: []
    };

    // Generate world-class personality assessment and coaching advice
    const assessmentResult = await AIDatingCoach.generatePersonalityAssessment(
      answers,
      coachingContext
    );

    // Transform the advanced coach response to the expected CoachAdvice format
    const advice: CoachAdvice = {
      greeting: assessmentResult.greeting,
      analysis: {
        currentState: assessmentResult.analysis.currentSituation,
        mainChallenge: assessmentResult.analysis.primaryChallenge,
        biggestOpportunity: assessmentResult.analysis.greatestOpportunity
      },
      recommendations: {
        step1: {
          title: assessmentResult.recommendations[0]?.title || 'Start met je profiel',
          description: assessmentResult.recommendations[0]?.description || 'Maak een authentiek profiel dat bij je past'
        },
        step2: {
          title: assessmentResult.recommendations[1]?.title || 'Verbeter je communicatie',
          description: assessmentResult.recommendations[1]?.description || 'Leer effectiever te communiceren in dating'
        },
        step3: {
          title: assessmentResult.recommendations[2]?.title || 'Stel realistische doelen',
          description: assessmentResult.recommendations[2]?.description || 'Focus op haalbare stappen voorwaarts'
        }
      },
      tools: {
        tool1: {
          name: assessmentResult.recommendedTools[0]?.name || 'Profiel Coach',
          reason: assessmentResult.recommendedTools[0]?.reason || 'Helpt je een sterk profiel te maken'
        },
        tool2: {
          name: assessmentResult.recommendedTools[1]?.name || 'Chat Coach',
          reason: assessmentResult.recommendedTools[1]?.reason || 'Ondersteuning bij communicatie'
        }
      },
      weekGoal: assessmentResult.actionPlan.weekGoal,
      todayAction: assessmentResult.actionPlan.todayAction
    };

    return NextResponse.json({
      success: true,
      advice,
    });

  } catch (error) {
    console.error('❌ Coach analysis error:', error);
    return NextResponse.json(
      { error: 'Failed to generate coach advice', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

