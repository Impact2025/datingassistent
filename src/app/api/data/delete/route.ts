import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { verifyToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
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
    } catch (tableError) {
      console.error('Error ensuring data_requests table:', tableError);
    }

    const { reason, confirmation } = await request.json();

    // Validate confirmation
    if (confirmation !== 'DELETE_MY_ACCOUNT') {
      return NextResponse.json(
        { error: 'Invalid confirmation text' },
        { status: 400 }
      );
    }

    console.log(`🗑️ Account deletion requested for user ${user.id}`);

    // Check if user already has a pending deletion request
    const existingRequest = await sql`
      SELECT id FROM data_requests
      WHERE user_id = ${user.id} AND request_type = 'delete' AND status = 'pending'
    `;

    if (existingRequest.rows.length > 0) {
      return NextResponse.json(
        { error: 'You already have a pending deletion request' },
        { status: 400 }
      );
    }

    // Calculate deletion date (30 days from now)
    const deletionDate = new Date();
    deletionDate.setDate(deletionDate.getDate() + 30);

    // Create deletion request
    const requestResult = await sql`
      INSERT INTO data_requests (
        user_id,
        request_type,
        status,
        data
      ) VALUES (
        ${user.id},
        'delete',
        'pending',
        ${JSON.stringify({
          reason: reason || 'No reason provided',
          requestedAt: new Date().toISOString(),
          scheduledDeletionDate: deletionDate.toISOString(),
          confirmationText: confirmation
        })}
      )
      RETURNING id
    `;

    const requestId = requestResult.rows[0].id;

    // Update user's data_retention_until field
    await sql`
      UPDATE users
      SET data_retention_until = ${deletionDate.toISOString()}
      WHERE id = ${user.id}
    `;

    // TODO: Send confirmation email
    // For now, we'll log it
    console.log(`✅ Account deletion request created for user ${user.id}, scheduled for ${deletionDate.toISOString()}`);

    // In a real implementation, you would send an email here
    // await sendDeletionConfirmationEmail(user.email, requestId, deletionDate);

    return NextResponse.json({
      message: 'Account deletion request submitted successfully',
      requestId,
      scheduledDeletionDate: deletionDate.toISOString(),
      coolingOffPeriodDays: 30
    });

  } catch (error: any) {
    console.error('❌ Account deletion error:', error);
    return NextResponse.json(
      {
        error: 'Account deletion request failed',
        message: error.message
      },
      { status: 500 }
    );
  }
}