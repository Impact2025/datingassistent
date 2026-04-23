import { logger } from '@/lib/logger';
import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { verifyToken } from '@/lib/auth';
import { sendEmail } from '@/lib/email-service';

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

    logger.log(`🗑️ Account deletion requested for user ${user.id}`);

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

    logger.log(`✅ Account deletion request created for user ${user.id}, scheduled for ${deletionDate.toISOString()}`);

    const cancelUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard?tab=privacy&action=cancel-delete&requestId=${requestId}`;
    await sendEmail({
      to: (user as any).email,
      subject: 'Bevestiging: verwijderverzoek ontvangen — DatingAssistent',
      html: `
        <p>We hebben je verzoek ontvangen om je account te verwijderen.</p>
        <p><strong>Geplande verwijdering:</strong> ${deletionDate.toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
        <p>Je hebt 30 dagen de tijd om dit te herroepen. Je account en gegevens blijven tot die datum intact.</p>
        <p><a href="${cancelUrl}" style="background:#e85d4a;color:white;padding:10px 20px;border-radius:6px;text-decoration:none;">Verwijderverzoek intrekken</a></p>
        <p>Vragen? Mail naar <a href="mailto:privacy@datingassistent.nl">privacy@datingassistent.nl</a></p>
        <p>DatingAssistent Team</p>
      `,
    }).catch(console.error);

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