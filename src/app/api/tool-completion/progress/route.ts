/**
 * API: Get Tool Completion Progress
 * Sprint 2 Phase 3
 *
 * Returns progress statistics for a specific tool or all tools.
 */

import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function GET(request: NextRequest) {
  try {
    // Get user ID from query params or auth token (same as goals API)
    const url = new URL(request.url);
    let userId = url.searchParams.get('userId');

    // If no userId in query params, try to get from auth token
    if (!userId) {
      const authHeader = request.headers.get('authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        try {
          // Simple token parsing - in production use proper JWT verification
          const tokenData = JSON.parse(atob(token.split('.')[1]));
          userId = tokenData.user?.id || tokenData.userId || tokenData.id || tokenData.sub;
        } catch (e) {
          console.error('Error parsing token:', e);
        }
      }
    }

    // If still no userId, return error
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required. Please provide userId query parameter or valid auth token.' },
        { status: 400 }
      );
    }

    // Get optional tool name from query params
    const { searchParams } = new URL(request.url);
    const toolName = searchParams.get('toolName');

    if (toolName) {
      // Get progress for specific tool
      const progress = await sql`
        SELECT
          tool_name,
          completed_actions,
          actions_completed,
          progress_percentage,
          first_completion,
          last_completion
        FROM tool_progress
        WHERE user_id = ${userId}
        AND tool_name = ${toolName}
      `;

      if (progress.rows.length === 0) {
        return NextResponse.json({
          toolName,
          completedActions: 0,
          actionsCompleted: [],
          progressPercentage: 0,
          firstCompletion: null,
          lastCompletion: null
        });
      }

      return NextResponse.json({
        toolName: progress.rows[0].tool_name,
        completedActions: progress.rows[0].completed_actions,
        actionsCompleted: progress.rows[0].actions_completed,
        progressPercentage: Math.round(progress.rows[0].progress_percentage),
        firstCompletion: progress.rows[0].first_completion,
        lastCompletion: progress.rows[0].last_completion
      });

    } else {
      // Get progress for all tools
      const allProgress = await sql`
        SELECT
          tool_name,
          completed_actions,
          actions_completed,
          progress_percentage,
          first_completion,
          last_completion
        FROM tool_progress
        WHERE user_id = ${userId}
        ORDER BY tool_name
      `;

      // Get overall progress
      const overall = await sql`
        SELECT
          tools_used,
          total_completions,
          overall_progress,
          started_at,
          last_activity
        FROM user_coaching_progress
        WHERE user_id = ${userId}
      `;

      return NextResponse.json({
        tools: allProgress.rows.map(p => ({
          toolName: p.tool_name,
          completedActions: p.completed_actions,
          actionsCompleted: p.actions_completed,
          progressPercentage: Math.round(p.progress_percentage),
          firstCompletion: p.first_completion,
          lastCompletion: p.last_completion
        })),
        overall: overall.rows.length > 0 ? {
          toolsUsed: overall.rows[0].tools_used,
          totalCompletions: overall.rows[0].total_completions,
          overallProgress: Math.round(overall.rows[0].overall_progress),
          startedAt: overall.rows[0].started_at,
          lastActivity: overall.rows[0].last_activity
        } : {
          toolsUsed: 0,
          totalCompletions: 0,
          overallProgress: 0,
          startedAt: null,
          lastActivity: null
        }
      });
    }

  } catch (error: any) {
    console.error('❌ Error fetching progress:', error);
    return NextResponse.json({
      error: 'Failed to fetch progress',
      message: error.message
    }, { status: 500 });
  }
}
