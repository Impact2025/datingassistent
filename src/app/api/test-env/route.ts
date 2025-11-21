import { NextResponse } from 'next/server';
import { AIDatingCoach } from '@/lib/ai-coach-service';

export async function GET(request: Request) {
  try {
    // Test token verification
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({
        success: false,
        error: 'No authorization token provided',
        hasAuthHeader: !!authHeader,
        authHeaderStart: authHeader?.substring(0, 20)
      }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const { verifyToken } = await import('@/lib/auth');
    const user = await verifyToken(token);

    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'Invalid token',
        tokenLength: token.length,
        tokenStart: token.substring(0, 20)
      }, { status: 401 });
    }

    // Test basic AI functionality
    const testResult = await AIDatingCoach.generatePersonalityAssessment({
      current_situation: "Ik ben single en wil graag een relatie beginnen",
      dating_feeling: 7,
      main_obstacles: ["angst voor afwijzing"],
      goal_30_90_days: "Een leuke relatie vinden",
      social_strengths: "goed in gesprekken",
      dating_difficulty: "moeilijk om eerste stap te zetten",
      weekly_time: "5 uur per week"
    }, {
      userId: user.id,
      conversationHistory: [],
      userProfile: null,
      aiContext: null,
      coachingPhase: 'assessment',
      personalityInsights: {
        type: 'unknown',
        traits: [],
        strengths: ['goed in gesprekken'],
        challenges: ['eerste stap zetten']
      },
      successPatterns: []
    });

    return NextResponse.json({
      success: true,
      message: 'OpenRouter AI and authentication are working!',
      user: { id: user.id, email: user.email },
      testResult: {
        greeting: testResult.greeting,
        analysis: testResult.analysis,
        recommendationsCount: testResult.recommendations?.length || 0,
        toolsCount: testResult.recommendedTools?.length || 0
      }
    });
  } catch (error) {
    console.error('Test failed:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      details: 'Test failed'
    }, { status: 500 });
  }
}