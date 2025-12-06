import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { requireAdmin } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request);

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const department = searchParams.get('department');

    const whereConditions = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (status) {
      whereConditions.push(`a.status = $${paramIndex}`);
      params.push(status);
      paramIndex++;
    }

    if (department) {
      whereConditions.push(`a.department = $${paramIndex}`);
      params.push(department);
      paramIndex++;
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    const agents = await sql`
      SELECT
        a.id, a.name, a.email, a.avatar_url, a.status, a.department,
        a.skills, a.languages, a.max_concurrent_chats, a.total_chats_handled,
        a.avg_response_time, a.satisfaction_score, a.is_available,
        a.last_activity, a.created_at,
        r.name as role_name, r.description as role_description
      FROM chat_agents a
      JOIN chat_agent_roles r ON a.role_id = r.id
      ${whereClause}
      ORDER BY a.created_at DESC
    `;

    return NextResponse.json({
      agents: agents.rows,
      total: agents.rows.length
    });

  } catch (error) {
    console.error('Error fetching agents:', error);
    return NextResponse.json({
      error: 'internal_error',
      message: 'Failed to fetch agents'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin(request);

    const body = await request.json();
    const {
      userId,
      name,
      email,
      password,
      role = 'agent',
      department = 'general',
      skills = [],
      languages = ['nl'],
      maxConcurrentChats = 3
    } = body;

    if (!name || !email || !password) {
      return NextResponse.json({
        error: 'missing_required_fields',
        message: 'Name, email, and password are required'
      }, { status: 400 });
    }

    // Check if email already exists
    const existingAgent = await sql`
      SELECT id FROM chat_agents WHERE email = ${email}
    `;

    if (existingAgent.rows.length > 0) {
      return NextResponse.json({
        error: 'email_exists',
        message: 'An agent with this email already exists'
      }, { status: 409 });
    }

    // Get role ID
    const roleResult = await sql`
      SELECT id FROM chat_agent_roles WHERE name = ${role}
    `;

    if (roleResult.rows.length === 0) {
      return NextResponse.json({
        error: 'invalid_role',
        message: 'Invalid role specified'
      }, { status: 400 });
    }

    const roleId = roleResult.rows[0].id;

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create agent
    const agent = await sql`
      INSERT INTO chat_agents (
        user_id, role_id, name, email, department, skills, languages,
        max_concurrent_chats, status, is_available
      ) VALUES (
        ${userId || null}, ${roleId}, ${name}, ${email}, ${department},
        ${JSON.stringify(skills)}, ${JSON.stringify(languages)},
        ${maxConcurrentChats}, 'offline', false
      )
      RETURNING id, name, email, department, status, created_at
    `;

    const newAgent = agent.rows[0];

    return NextResponse.json({
      agent: newAgent,
      message: 'Agent created successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating agent:', error);
    return NextResponse.json({
      error: 'internal_error',
      message: 'Failed to create agent'
    }, { status: 500 });
  }
}