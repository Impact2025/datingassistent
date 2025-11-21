import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { requireAdmin } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin(request);
    const agentId = params.id;

    const agent = await sql`
      SELECT
        a.id, a.name, a.email, a.avatar_url, a.status, a.department,
        a.skills, a.languages, a.max_concurrent_chats, a.total_chats_handled,
        a.avg_response_time, a.satisfaction_score, a.is_available,
        a.last_activity, a.created_at,
        r.name as role_name, r.description as role_description
      FROM chat_agents a
      JOIN chat_agent_roles r ON a.role_id = r.id
      WHERE a.id = ${agentId}
    `;

    if (agent.rows.length === 0) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
    }

    return NextResponse.json({ agent: agent.rows[0] });

  } catch (error) {
    console.error('Error fetching agent:', error);
    return NextResponse.json({
      error: 'internal_error',
      message: 'Failed to fetch agent'
    }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin(request);
    const agentId = params.id;
    const updateData = await request.json();

    const {
      name,
      email,
      roleId,
      department,
      skills,
      languages,
      maxConcurrentChats,
      status,
      isAvailable
    } = updateData;

    // Check if agent exists
    const existingAgent = await sql`
      SELECT id FROM chat_agents WHERE id = ${agentId}
    `;

    if (existingAgent.rows.length === 0) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
    }

    // Check email uniqueness if email is being changed
    if (email) {
      const emailCheck = await sql`
        SELECT id FROM chat_agents WHERE email = ${email} AND id != ${agentId}
      `;
      if (emailCheck.rows.length > 0) {
        return NextResponse.json({
          error: 'email_taken',
          message: 'Email is already taken by another agent'
        }, { status: 409 });
      }
    }

    // Build update query dynamically
    const updateFields = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (name !== undefined) {
      updateFields.push(`name = $${paramIndex}`);
      params.push(name);
      paramIndex++;
    }

    if (email !== undefined) {
      updateFields.push(`email = $${paramIndex}`);
      params.push(email);
      paramIndex++;
    }

    if (roleId !== undefined) {
      updateFields.push(`role_id = $${paramIndex}`);
      params.push(roleId);
      paramIndex++;
    }

    if (department !== undefined) {
      updateFields.push(`department = $${paramIndex}`);
      params.push(department);
      paramIndex++;
    }

    if (skills !== undefined) {
      updateFields.push(`skills = $${paramIndex}`);
      params.push(JSON.stringify(skills));
      paramIndex++;
    }

    if (languages !== undefined) {
      updateFields.push(`languages = $${paramIndex}`);
      params.push(JSON.stringify(languages));
      paramIndex++;
    }

    if (maxConcurrentChats !== undefined) {
      updateFields.push(`max_concurrent_chats = $${paramIndex}`);
      params.push(maxConcurrentChats);
      paramIndex++;
    }

    if (status !== undefined) {
      updateFields.push(`status = $${paramIndex}`);
      params.push(status);
      paramIndex++;
    }

    if (isAvailable !== undefined) {
      updateFields.push(`is_available = $${paramIndex}`);
      params.push(isAvailable);
      paramIndex++;
    }

    // Always update last_activity
    updateFields.push(`last_activity = NOW()`);

    if (updateFields.length === 0) {
      return NextResponse.json({
        error: 'no_fields_to_update',
        message: 'No fields provided to update'
      }, { status: 400 });
    }

    const updateQuery = `
      UPDATE chat_agents
      SET ${updateFields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING
        id, name, email, avatar_url, status, department,
        skills, languages, max_concurrent_chats, total_chats_handled,
        avg_response_time, satisfaction_score, is_available,
        last_activity, updated_at
    `;

    params.push(agentId);

    const result = await sql.query(updateQuery, params);

    return NextResponse.json({
      agent: result.rows[0],
      message: 'Agent updated successfully'
    });

  } catch (error) {
    console.error('Error updating agent:', error);
    return NextResponse.json({
      error: 'internal_error',
      message: 'Failed to update agent'
    }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin(request);
    const agentId = params.id;

    // Check if agent exists
    const agent = await sql`
      SELECT id, status FROM chat_agents WHERE id = ${agentId}
    `;

    if (agent.rows.length === 0) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
    }

    // Check if agent has active conversations
    const activeConversations = await sql`
      SELECT COUNT(*) as count
      FROM chat_conversations
      WHERE assigned_agent_id = ${agentId} AND status IN ('active', 'assigned')
    `;

    if (parseInt(activeConversations.rows[0].count) > 0) {
      return NextResponse.json({
        error: 'agent_has_active_conversations',
        message: 'Cannot delete agent with active conversations. Please reassign conversations first.'
      }, { status: 409 });
    }

    // Delete agent
    await sql`DELETE FROM chat_agents WHERE id = ${agentId}`;

    return NextResponse.json({
      message: 'Agent deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting agent:', error);
    return NextResponse.json({
      error: 'internal_error',
      message: 'Failed to delete agent'
    }, { status: 500 });
  }
}