import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'dev-only-jwt-secret-change-in-production-2024'
);

export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const { payload } = await jwtVerify(token, JWT_SECRET);

    // Check if user is admin
    const adminEmails = ['v_mun@hotmail.com', 'v.munster@weareimpact.nl'];
    if (!adminEmails.includes(payload.email as string)) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    console.log('🔄 Adding ai_context column to users table...');

    // Check if column already exists
    const checkResult = await sql`
      SELECT column_name FROM information_schema.columns
      WHERE table_name = 'users' AND column_name = 'ai_context'
    `;

    if (checkResult.rows.length > 0) {
      console.log('✅ ai_context column already exists');
      return NextResponse.json({
        success: true,
        message: 'ai_context column already exists'
      });
    }

    // Add the column
    await sql`
      ALTER TABLE users ADD COLUMN ai_context JSONB
    `;

    console.log('✅ ai_context column added successfully');

    // Create index for better performance
    await sql`
      CREATE INDEX IF NOT EXISTS idx_users_ai_context ON users USING GIN (ai_context)
    `;

    console.log('✅ Index created for ai_context column');

    return NextResponse.json({
      success: true,
      message: 'AI context migration completed successfully'
    });

  } catch (error: any) {
    console.error('❌ Error in AI context migration:', error);
    return NextResponse.json(
      { error: 'Migration failed', details: error.message },
      { status: 500 }
    );
  }
}