import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { generateRecommendations, getLearningInsights } from '@/lib/recommendations/recommendation-engine';

export const dynamic = 'force-dynamic';

/**
 * GET /api/recommendations
 * Get AI-powered content recommendations for the authenticated user
 *
 * Query params:
 * - limit: Number of recommendations to return (default: 10)
 * - include_insights: Include learning insights (default: true)
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
    const limit = parseInt(searchParams.get('limit') || '10');
    const includeInsights = searchParams.get('include_insights') !== 'false';

    // Generate recommendations
    const recommendations = await generateRecommendations(userId, limit);

    // Get learning insights if requested
    let insights = null;
    if (includeInsights) {
      insights = await getLearningInsights(userId);
    }

    return NextResponse.json({
      recommendations,
      insights,
      generated_at: new Date().toISOString(),
      user_id: userId
    });

  } catch (error) {
    console.error('Error generating recommendations:', error);
    return NextResponse.json(
      {
        error: 'Failed to generate recommendations',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
