import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { requireAdmin } from '@/lib/auth';

interface AgentAvailability {
  id: number;
  name: string;
  email: string;
  department: string;
  currentChats: number;
  maxConcurrentChats: number;
  avgResponseTime: number;
  skills: string[];
  languages: string[];
  priority: number;
  isAvailable: boolean;
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin(request);

    const body = await request.json();
    const { conversationId, agentId, priority = 'normal', department = 'general' } = body;

    if (!conversationId) {
      return NextResponse.json({
        error: 'conversation_id_required',
        message: 'Conversation ID is required'
      }, { status: 400 });
    }

    // Get conversation details
    const conversation = await sql`
      SELECT id, status, priority, department, assigned_agent_id
      FROM chat_conversations
      WHERE id = ${conversationId}
    `;

    if (conversation.rows.length === 0) {
      return NextResponse.json({
        error: 'conversation_not_found',
        message: 'Conversation not found'
      }, { status: 404 });
    }

    const conv = conversation.rows[0];

    // If specific agent requested
    if (agentId) {
      return await assignToSpecificAgent(conversationId, agentId);
    }

    // Auto-assign based on routing logic
    return await autoAssignConversation(conversationId, priority, department);

  } catch (error) {
    console.error('Error assigning conversation:', error);
    return NextResponse.json({
      error: 'internal_error',
      message: 'Failed to assign conversation'
    }, { status: 500 });
  }
}

async function assignToSpecificAgent(conversationId: string, agentId: number) {
  // Check if agent exists and is available
  const agent = await sql`
    SELECT
      a.id, a.name, a.status, a.is_available, a.max_concurrent_chats,
      COUNT(c.id) as current_chats
    FROM chat_agents a
    LEFT JOIN chat_conversations c ON a.id = c.assigned_agent_id
      AND c.status IN ('active', 'assigned')
    WHERE a.id = ${agentId}
    GROUP BY a.id, a.name, a.status, a.is_available, a.max_concurrent_chats
  `;

  if (agent.rows.length === 0) {
    return NextResponse.json({
      error: 'agent_not_found',
      message: 'Agent not found'
    }, { status: 404 });
  }

  const agentData = agent.rows[0];

  if (!agentData.is_available || agentData.status !== 'online') {
    return NextResponse.json({
      error: 'agent_not_available',
      message: 'Agent is not available'
    }, { status: 400 });
  }

  if (agentData.current_chats >= agentData.max_concurrent_chats) {
    return NextResponse.json({
      error: 'agent_at_capacity',
      message: 'Agent has reached maximum concurrent chats'
    }, { status: 400 });
  }

  // Assign conversation to agent
  await sql`
    UPDATE chat_conversations
    SET
      assigned_agent_id = ${agentId},
      status = 'assigned',
      assigned_at = NOW(),
      updated_at = NOW()
    WHERE id = ${conversationId}
  `;

  return NextResponse.json({
    message: 'Conversation assigned successfully',
    assignment: {
      conversationId,
      agentId,
      agentName: agentData.name,
      assignedAt: new Date().toISOString()
    }
  });
}

async function autoAssignConversation(conversationId: string, priority: string, department: string) {
  // Get available agents with their current workload
  const availableAgents = await sql`
    SELECT
      a.id, a.name, a.email, a.department, a.skills, a.languages,
      a.max_concurrent_chats, a.avg_response_time, r.priority as role_priority,
      COUNT(c.id) as current_chats,
      a.is_available, a.status
    FROM chat_agents a
    JOIN chat_agent_roles r ON a.role_id = r.id
    LEFT JOIN chat_conversations c ON a.id = c.assigned_agent_id
      AND c.status IN ('active', 'assigned')
    WHERE a.is_available = true
      AND a.status = 'online'
    GROUP BY a.id, a.name, a.email, a.department, a.skills, a.languages,
             a.max_concurrent_chats, a.avg_response_time, r.priority
    HAVING COUNT(c.id) < a.max_concurrent_chats
    ORDER BY
      -- Priority matching
      CASE WHEN a.department = ${department} THEN 1 ELSE 0 END DESC,
      -- Lower workload first
      COUNT(c.id) ASC,
      -- Better performance (lower response time)
      a.avg_response_time ASC,
      -- Higher role priority
      r.priority DESC
  `;

  if (availableAgents.rows.length === 0) {
    return NextResponse.json({
      error: 'no_available_agents',
      message: 'No available agents found for assignment'
    }, { status: 400 });
  }

  // Select the best agent (first in sorted list)
  const selectedAgent = availableAgents.rows[0];

  // Assign conversation
  await sql`
    UPDATE chat_conversations
    SET
      assigned_agent_id = ${selectedAgent.id},
      status = 'assigned',
      assigned_at = NOW(),
      updated_at = NOW()
    WHERE id = ${conversationId}
  `;

  return NextResponse.json({
    message: 'Conversation auto-assigned successfully',
    assignment: {
      conversationId,
      agentId: selectedAgent.id,
      agentName: selectedAgent.name,
      assignedAt: new Date().toISOString(),
      assignmentMethod: 'auto'
    }
  });
}

// GET endpoint to get assignment suggestions
export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request);

    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get('conversationId');

    if (!conversationId) {
      return NextResponse.json({
        error: 'conversation_id_required',
        message: 'conversationId parameter is required'
      }, { status: 400 });
    }

    // Get conversation details
    const conversation = await sql`
      SELECT priority, department FROM chat_conversations WHERE id = ${conversationId}
    `;

    if (conversation.rows.length === 0) {
      return NextResponse.json({
        error: 'conversation_not_found',
        message: 'Conversation not found'
      }, { status: 404 });
    }

    const conv = conversation.rows[0];

    // Get available agents for this conversation
    const availableAgents = await sql`
      SELECT
        a.id, a.name, a.email, a.department, a.skills, a.languages,
        a.max_concurrent_chats, a.avg_response_time, a.satisfaction_score,
        COUNT(c.id) as current_chats,
        r.name as role_name
      FROM chat_agents a
      JOIN chat_agent_roles r ON a.role_id = r.id
      LEFT JOIN chat_conversations c ON a.id = c.assigned_agent_id
        AND c.status IN ('active', 'assigned')
      WHERE a.is_available = true
        AND a.status = 'online'
      GROUP BY a.id, a.name, a.email, a.department, a.skills, a.languages,
               a.max_concurrent_chats, a.avg_response_time, a.satisfaction_score, r.name
      HAVING COUNT(c.id) < a.max_concurrent_chats
      ORDER BY
        CASE WHEN a.department = ${conv.department} THEN 1 ELSE 0 END DESC,
        COUNT(c.id) ASC,
        a.avg_response_time ASC
      LIMIT 5
    `;

    return NextResponse.json({
      conversation: {
        id: conversationId,
        priority: conv.priority,
        department: conv.department
      },
      availableAgents: availableAgents.rows.map(agent => ({
        id: agent.id,
        name: agent.name,
        email: agent.email,
        department: agent.department,
        role: agent.role_name,
        currentChats: parseInt(agent.current_chats),
        maxChats: agent.max_concurrent_chats,
        avgResponseTime: agent.avg_response_time,
        satisfactionScore: agent.satisfaction_score,
        capacity: Math.round((parseInt(agent.current_chats) / agent.max_concurrent_chats) * 100)
      }))
    });

  } catch (error) {
    console.error('Error getting assignment suggestions:', error);
    return NextResponse.json({
      error: 'internal_error',
      message: 'Failed to get assignment suggestions'
    }, { status: 500 });
  }
}