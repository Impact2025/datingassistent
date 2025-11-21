import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { requireAdmin } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request);

    const roles = await sql`
      SELECT id, name, description, max_concurrent_chats, priority, created_at
      FROM chat_agent_roles
      ORDER BY priority ASC
    `;

    return NextResponse.json({
      roles: roles.rows,
      total: roles.rows.length
    });

  } catch (error) {
    console.error('Error fetching agent roles:', error);
    return NextResponse.json({
      error: 'internal_error',
      message: 'Failed to fetch agent roles'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin(request);

    const body = await request.json();
    const { name, description, maxConcurrentChats, priority } = body;

    if (!name || !description) {
      return NextResponse.json({
        error: 'missing_required_fields',
        message: 'Name and description are required'
      }, { status: 400 });
    }

    // Check if role already exists
    const existingRole = await sql`
      SELECT id FROM chat_agent_roles WHERE name = ${name}
    `;

    if (existingRole.rows.length > 0) {
      return NextResponse.json({
        error: 'role_exists',
        message: 'A role with this name already exists'
      }, { status: 409 });
    }

    // Create role
    const role = await sql`
      INSERT INTO chat_agent_roles (name, description, max_concurrent_chats, priority)
      VALUES (${name}, ${description}, ${maxConcurrentChats || 3}, ${priority || 1})
      RETURNING id, name, description, max_concurrent_chats, priority, created_at
    `;

    return NextResponse.json({
      role: role.rows[0],
      message: 'Role created successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating agent role:', error);
    return NextResponse.json({
      error: 'internal_error',
      message: 'Failed to create agent role'
    }, { status: 500 });
  }
}