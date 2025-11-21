import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { verifyToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'No authorization token provided' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const user = await verifyToken(token);

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    // Ensure data_requests table exists
    try {
      await sql`
        CREATE TABLE IF NOT EXISTS data_requests (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          request_type TEXT NOT NULL CHECK (request_type IN ('export', 'delete', 'modify')),
          status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
          requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          completed_at TIMESTAMP WITH TIME ZONE,
          data JSONB,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )
      `;

      // Add indexes if they don't exist
      await sql`CREATE INDEX IF NOT EXISTS idx_data_requests_user_id ON data_requests(user_id)`;
      await sql`CREATE INDEX IF NOT EXISTS idx_data_requests_type ON data_requests(request_type)`;
      await sql`CREATE INDEX IF NOT EXISTS idx_data_requests_status ON data_requests(status)`;
      await sql`CREATE INDEX IF NOT EXISTS idx_data_requests_requested_at ON data_requests(requested_at)`;

      console.log('✅ Data requests table ensured');
    } catch (tableError) {
      console.error('Error creating data_requests table:', tableError);
      // Continue anyway - table might already exist
    }

    // Get user's data requests
    const requestsResult = await sql`
      SELECT
        id,
        request_type as type,
        status,
        requested_at as requestedAt,
        completed_at as completedAt,
        data
      FROM data_requests
      WHERE user_id = ${user.id}
      ORDER BY requested_at DESC
      LIMIT 50
    `;

    const requests = requestsResult.rows.map(row => ({
      id: row.id,
      type: row.type,
      status: row.status,
      requestedAt: row.requestedat,
      completedAt: row.completedat,
      data: row.data
    }));

    return NextResponse.json({ requests });

  } catch (error: any) {
    console.error('❌ Error fetching data requests:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch data requests',
        message: error.message
      },
      { status: 500 }
    );
  }
}