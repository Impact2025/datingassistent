import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import {
  predictProgramCompletion,
  analyzeLearningPatterns,
  generateOptimalSchedule,
  projectMilestones,
  generateLearningTips
} from '@/lib/insights/progress-predictor';

export const dynamic = 'force-dynamic';

/**
 * GET /api/insights
 * Get progress insights and predictions for the authenticated user
 *
 * Query params:
 * - include_predictions: Include program completion predictions (default: true)
 * - include_patterns: Include learning pattern analysis (default: true)
 * - include_schedule: Include optimal schedule suggestion (default: true)
 * - include_milestones: Include milestone projections (default: true)
 * - include_tips: Include personalized learning tips (default: true)
 * - target_hours_per_week: Target study hours per week for schedule (default: 3)
 */
export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const userId = user.id;
    const { searchParams } = new URL(request.url);

    const includePredictions = searchParams.get('include_predictions') !== 'false';
    const includePatterns = searchParams.get('include_patterns') !== 'false';
    const includeSchedule = searchParams.get('include_schedule') !== 'false';
    const includeMilestones = searchParams.get('include_milestones') !== 'false';
    const includeTips = searchParams.get('include_tips') !== 'false';
    const targetHoursPerWeek = parseInt(searchParams.get('target_hours_per_week') || '3');

    // Fetch all insights in parallel
    const [predictions, patterns, schedule, milestones, tips] = await Promise.all([
      includePredictions ? predictProgramCompletion(userId) : Promise.resolve(null),
      includePatterns ? analyzeLearningPatterns(userId) : Promise.resolve(null),
      includeSchedule ? generateOptimalSchedule(userId, targetHoursPerWeek) : Promise.resolve(null),
      includeMilestones ? projectMilestones(userId) : Promise.resolve(null),
      includeTips ? generateLearningTips(userId) : Promise.resolve(null)
    ]);

    return NextResponse.json({
      predictions,
      patterns,
      schedule,
      milestones,
      tips,
      generated_at: new Date().toISOString(),
      user_id: userId
    });

  } catch (error) {
    console.error('Error generating insights:', error);
    return NextResponse.json(
      {
        error: 'Failed to generate insights',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
