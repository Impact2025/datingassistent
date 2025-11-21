import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { requireAdmin } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request);

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status'); // comma-separated list
    const department = searchParams.get('department');
    const assignedAgentId = searchParams.get('assignedAgentId');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build where conditions
    let whereConditions = ['c.closed_at IS NULL']; // Only active conversations
    let params: any[] = [];
    let paramIndex = 1;

    if (status) {
      const statuses = status.split(',').map(s => s.trim());
      whereConditions.push(`c.status = ANY($${paramIndex})`);
      params.push(statuses);
      paramIndex++;
    }

    if (department) {
      whereConditions.push(`c.department = $${paramIndex}`);
      params.push(department);
      paramIndex++;
    }

    if (assignedAgentId) {
      whereConditions.push(`c.assigned_agent_id = $${paramIndex}`);
      params.push(assignedAgentId);
      paramIndex++;
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Get conversations with agent info
    const conversationsQuery = `
      SELECT
        c.id, c.session_id, c.status, c.priority, c.department, c.tags,
        c.user_name, c.user_email, c.started_at, c.last_message_at,
        c.assigned_agent_id, c.first_response_at,
        a.name as agent_name, a.email as agent_email,
        a.avatar_url as agent_avatar,
        EXTRACT(EPOCH FROM (NOW() - c.last_message_at)) / 60 as minutes_since_last_message
      FROM chat_conversations c
      LEFT JOIN chat_agents a ON c.assigned_agent_id = a.id
      ${whereClause}
      ORDER BY
        CASE
          WHEN c.priority = 'urgent' THEN 1
          WHEN c.priority = 'high' THEN 2
          WHEN c.priority = 'normal' THEN 3
          ELSE 4
        END,
        c.last_message_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    params.push(limit, offset);

    const conversationsResult = await sql.query(conversationsQuery, params);

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total
      FROM chat_conversations c
      ${whereClause.replace('c.closed_at IS NULL', 'TRUE')} -- Remove the closed_at condition for count
    `;

    const countResult = await sql.query(countQuery, params.slice(0, -2));

    const conversations = conversationsResult.rows.map(conv => ({
      id: conv.id,
      sessionId: conv.session_id,
      status: conv.status,
      priority: conv.priority,
      department: conv.department,
      tags: conv.tags || [],
      userName: conv.user_name,
      userEmail: conv.user_email,
      startedAt: conv.started_at,
      lastMessageAt: conv.last_message_at,
      assignedAgentId: conv.assigned_agent_id,
      firstResponseAt: conv.first_response_at,
      agentName: conv.agent_name,
      agentEmail: conv.agent_email,
      agentAvatar: conv.agent_avatar,
      minutesSinceLastMessage: Math.round(parseFloat(conv.minutes_since_last_message || '0'))
    }));

    return NextResponse.json({
      conversations,
      pagination: {
        total: parseInt(countResult.rows[0].total),
        limit,
        offset,
        hasMore: offset + limit < parseInt(countResult.rows[0].total)
      }
    });

  } catch (error) {
    console.error('Error fetching conversations:', error);
    return NextResponse.json({
      error: 'internal_error',
      message: 'Failed to fetch conversations'
    }, { status: 500 });
  }
}