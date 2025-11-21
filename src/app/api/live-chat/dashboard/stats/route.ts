import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { requireAdmin } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request);

    // Get current date for daily metrics
    const today = new Date().toISOString().split('T')[0];

    // Get comprehensive dashboard statistics
    const [
      activeChatsResult,
      waitingChatsResult,
      availableAgentsResult,
      responseTimeResult,
      satisfactionResult,
      todayChatsResult
    ] = await Promise.all([
      // Active chats (assigned and in progress)
      sql`
        SELECT COUNT(*) as count
        FROM chat_conversations
        WHERE status IN ('assigned', 'active')
        AND closed_at IS NULL
      `,

      // Waiting chats (need agent assignment)
      sql`
        SELECT COUNT(*) as count
        FROM chat_conversations
        WHERE status = 'waiting'
        AND closed_at IS NULL
      `,

      // Available agents (online and available)
      sql`
        SELECT COUNT(*) as count
        FROM chat_agents
        WHERE status = 'online' AND is_available = true
      `,

      // Average response time (last 24 hours)
      sql`
        SELECT
          COALESCE(AVG(EXTRACT(EPOCH FROM (c.first_response_at - c.started_at))), 0) as avg_response_time
        FROM chat_conversations c
        WHERE c.first_response_at IS NOT NULL
        AND c.started_at >= NOW() - INTERVAL '24 hours'
      `,

      // Average satisfaction score (last 30 days)
      sql`
        SELECT COALESCE(AVG(user_rating), 0) as avg_satisfaction
        FROM chat_conversations
        WHERE user_rating IS NOT NULL
        AND closed_at >= NOW() - INTERVAL '30 days'
      `,

      // Total chats today
      sql`
        SELECT COUNT(*) as count
        FROM chat_conversations
        WHERE DATE(started_at) = $1
      `, [today]
    ]);

    const stats = {
      activeChats: parseInt(activeChatsResult.rows[0].count),
      waitingChats: parseInt(waitingChatsResult.rows[0].count),
      availableAgents: parseInt(availableAgentsResult.rows[0].available_agents || '0'),
      avgResponseTime: Math.round(parseFloat(responseTimeResult.rows[0].avg_response_time || '0')),
      satisfactionScore: parseFloat(satisfactionResult.rows[0].avg_satisfaction || '0').toFixed(1),
      totalChatsToday: parseInt(todayChatsResult.rows[0].count)
    };

    return NextResponse.json(stats);

  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json({
      error: 'internal_error',
      message: 'Failed to fetch dashboard statistics'
    }, { status: 500 });
  }
}