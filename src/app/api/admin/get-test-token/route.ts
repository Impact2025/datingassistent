import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function GET(request: NextRequest) {
  // Basic auth check
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const token = authHeader.substring(7);
  if (!token) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }

  try {
    const result = await sql`
      SELECT id, email, verification_token, verification_expires_at, email_verified
      FROM users
      WHERE email IN ('test@example.com', 'newtest@example.com')
      ORDER BY created_at DESC
      LIMIT 1
    `;

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Test user not found' }, { status: 404 });
    }

    const user = result.rows[0];

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        verificationToken: user.verification_token,
        expiresAt: user.verification_expires_at,
        emailVerified: user.email_verified,
      },
    });

  } catch (error) {
    console.error('❌ Error fetching test token:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}