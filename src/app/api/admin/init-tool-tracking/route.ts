/**
 * Admin API: Initialize Tool Completion Tracking System
 * Sprint 2 Phase 3
 *
 * This endpoint initializes the database schema for tool completion tracking.
 * Only accessible by admins.
 */

import { NextRequest, NextResponse } from 'next/server';
import { sql, db } from '@vercel/postgres';
import fs from 'fs';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const token = request.cookies.get('datespark_auth_token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify user is admin
    const authQuery = await sql`
      SELECT u.id, u.email, u.role
      FROM users u
      WHERE u.id = (
        SELECT user_id FROM auth_tokens WHERE token = ${token} AND expires_at > NOW()
      )
    `;

    if (authQuery.rows.length === 0) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const user = authQuery.rows[0];
    if (user.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    console.log(`🔧 Admin ${user.email} initializing tool completion tracking...`);

    // Read the SQL schema file
    const schemaPath = path.join(process.cwd(), 'sql', 'tool_completion_tracking_schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    // Split into individual statements and execute
    const statements = schema
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    let executed = 0;
    const results = [];

    for (const statement of statements) {
      try {
        await db.query(statement);
        executed++;
      } catch (error: any) {
        // Log but continue (some statements might already exist)
        console.warn(`Warning executing statement: ${error.message}`);
        results.push({
          statement: statement.substring(0, 100) + '...',
          error: error.message
        });
      }
    }

    // Verify tables were created
    const tables = await sql`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name = 'tool_completions'
    `;

    // Verify views
    const views = await sql`
      SELECT table_name
      FROM information_schema.views
      WHERE table_schema = 'public'
      AND table_name IN ('tool_progress', 'user_coaching_progress')
    `;

    // Verify functions
    const functions = await sql`
      SELECT routine_name
      FROM information_schema.routines
      WHERE routine_schema = 'public'
      AND routine_type = 'FUNCTION'
      AND routine_name IN ('mark_action_completed', 'is_action_completed', 'get_tool_completions', 'reset_tool_progress')
    `;

    console.log(`✅ Tool completion tracking initialized successfully`);
    console.log(`   Tables: ${tables.rows.length}, Views: ${views.rows.length}, Functions: ${functions.rows.length}`);

    return NextResponse.json({
      success: true,
      message: 'Tool completion tracking system initialized',
      stats: {
        statementsExecuted: executed,
        tablesCreated: tables.rows.map((t: any) => t.table_name),
        viewsCreated: views.rows.map((v: any) => v.table_name),
        functionsCreated: functions.rows.map((f: any) => f.routine_name),
        warnings: results.filter(r => r.error).length
      },
      warnings: results.filter(r => r.error)
    });

  } catch (error: any) {
    console.error('❌ Error initializing tool tracking:', error);
    return NextResponse.json({
      error: 'Failed to initialize tool tracking',
      message: error.message,
      details: error.stack
    }, { status: 500 });
  }
}

// GET endpoint to check status
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const token = request.cookies.get('datespark_auth_token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if tables exist
    const tables = await sql`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name = 'tool_completions'
    `;

    const views = await sql`
      SELECT table_name
      FROM information_schema.views
      WHERE table_schema = 'public'
      AND table_name IN ('tool_progress', 'user_coaching_progress')
    `;

    const functions = await sql`
      SELECT routine_name
      FROM information_schema.routines
      WHERE routine_schema = 'public'
      AND routine_type = 'FUNCTION'
      AND routine_name IN ('mark_action_completed', 'is_action_completed', 'get_tool_completions', 'reset_tool_progress')
    `;

    const initialized = tables.rows.length > 0 && views.rows.length >= 2 && functions.rows.length >= 4;

    return NextResponse.json({
      initialized,
      tables: tables.rows.map((t: any) => t.table_name),
      views: views.rows.map((v: any) => v.table_name),
      functions: functions.rows.map((f: any) => f.routine_name),
      ready: initialized
    });

  } catch (error: any) {
    return NextResponse.json({
      error: 'Failed to check status',
      message: error.message
    }, { status: 500 });
  }
}
