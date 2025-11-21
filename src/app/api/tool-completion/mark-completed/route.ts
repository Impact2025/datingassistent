/**
 * API: Mark Tool Action as Completed
 * Sprint 2 Phase 3
 *
 * Marks a specific action within a coaching tool as completed.
 * This is the main endpoint for tracking user progress.
 */

import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

interface MarkCompletedRequest {
  toolName: string;
  actionName: string;
  metadata?: Record<string, any>;
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const token = request.cookies.get('datespark_auth_token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user ID from token
    const authQuery = await sql`
      SELECT user_id
      FROM auth_tokens
      WHERE token = ${token}
      AND expires_at > NOW()
    `;

    if (authQuery.rows.length === 0) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }

    const userId = authQuery.rows[0].user_id;

    // Parse request body
    const body: MarkCompletedRequest = await request.json();
    const { toolName, actionName, metadata = {} } = body;

    // Validate input
    if (!toolName || !actionName) {
      return NextResponse.json({
        error: 'Missing required fields',
        required: ['toolName', 'actionName']
      }, { status: 400 });
    }

    // Validate tool name
    const validTools = ['profiel-coach', 'foto-advies', 'chat-coach', 'gesprek-starter', 'date-planner'];
    if (!validTools.includes(toolName)) {
      return NextResponse.json({
        error: 'Invalid tool name',
        validTools
      }, { status: 400 });
    }

    // Mark action as completed using the database function
    const result = await sql`
      SELECT mark_action_completed(
        ${userId},
        ${toolName},
        ${actionName},
        ${JSON.stringify(metadata)}::jsonb
      ) as was_new
    `;

    const wasNew = result.rows[0]?.was_new || false;

    // Get updated progress for this tool
    const progress = await sql`
      SELECT
        completed_actions,
        actions_completed,
        progress_percentage
      FROM tool_progress
      WHERE user_id = ${userId}
      AND tool_name = ${toolName}
    `;

    console.log(`📊 [${toolName}] User ${userId} completed: ${actionName} (${wasNew ? 'NEW' : 'already done'})`);

    return NextResponse.json({
      success: true,
      wasNew,
      toolName,
      actionName,
      progress: progress.rows.length > 0 ? {
        completedActions: progress.rows[0].completed_actions,
        actionsCompleted: progress.rows[0].actions_completed,
        progressPercentage: Math.round(progress.rows[0].progress_percentage)
      } : {
        completedActions: 1,
        actionsCompleted: [actionName],
        progressPercentage: 33
      }
    });

  } catch (error: any) {
    console.error('❌ Error marking action completed:', error);
    return NextResponse.json({
      error: 'Failed to mark action completed',
      message: error.message
    }, { status: 500 });
  }
}
