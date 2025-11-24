import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { sql } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    // Get user from authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'No authorization token provided' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const user = await verifyToken(token);

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    // Get the most recent analysis
    const recentAnalysis = await sql`
      SELECT
        id,
        overall_score,
        category_scores,
        optimization_suggestions,
        competitor_analysis,
        predicted_performance,
        analysis_date,
        analysis_version
      FROM profile_analyses
      WHERE user_id = ${user.id}
      ORDER BY analysis_date DESC
      LIMIT 1
    `;

    if (recentAnalysis.length === 0) {
      return NextResponse.json({
        hasAnalysis: false,
        message: 'No profile analysis found. Run your first analysis!'
      });
    }

    const analysis = recentAnalysis[0];

    // Get analysis history for progress tracking
    const analysisHistory = await sql`
      SELECT
        overall_score,
        analysis_date
      FROM profile_analyses
      WHERE user_id = ${user.id}
      ORDER BY analysis_date DESC
      LIMIT 10
    `;

    // Get achieved milestones
    const milestones = await sql`
      SELECT
        milestone_type,
        milestone_name,
        milestone_description,
        achieved_date,
        analysis_score
      FROM profile_milestones
      WHERE user_id = ${user.id} AND achieved = true
      ORDER BY achieved_date DESC
    `;

    return NextResponse.json({
      hasAnalysis: true,
      currentAnalysis: {
        id: analysis.id,
        overallScore: analysis.overall_score,
        sections: analysis.category_scores,
        optimizationSuggestions: analysis.optimization_suggestions,
        competitorAnalysis: analysis.competitor_analysis,
        predictedPerformance: analysis.predicted_performance,
        analysisDate: analysis.analysis_date,
        version: analysis.analysis_version
      },
      history: analysisHistory.map((h: any) => ({
        score: h.overall_score,
        date: h.analysis_date
      })),
      milestones: milestones.map((m: any) => ({
        type: m.milestone_type,
        name: m.milestone_name,
        description: m.milestone_description,
        achievedDate: m.achieved_date,
        score: m.analysis_score
      }))
    });

  } catch (error) {
    console.error('Profile history retrieval error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve profile history' },
      { status: 500 }
    );
  }
}