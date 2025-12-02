import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { generatePersonalizedPath, getNextRecommendedSteps } from '@/lib/learning/adaptive-path-generator';

export const dynamic = 'force-dynamic';

/**
 * GET /api/learning-path
 * Get personalized learning path for user
 *
 * Query params:
 * - goal: string (default: 'complete_program')
 * - program_id: number (optional)
 * - next_steps_only: boolean (default: false) - Return only next 3 steps
 * - limit: number (default: 3) - For next_steps_only mode
 */
export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const goal = searchParams.get('goal') || 'complete_program';
    const programId = searchParams.get('program_id') ? parseInt(searchParams.get('program_id')!) : undefined;
    const nextStepsOnly = searchParams.get('next_steps_only') === 'true';
    const limit = parseInt(searchParams.get('limit') || '3');

    if (nextStepsOnly) {
      const nextSteps = await getNextRecommendedSteps(user.id, limit);
      return NextResponse.json({ next_steps: nextSteps });
    }

    const learningPath = await generatePersonalizedPath(user.id, goal, programId);
    return NextResponse.json(learningPath);

  } catch (error) {
    console.error('Error generating learning path:', error);
    return NextResponse.json(
      { error: 'Failed to generate learning path', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
