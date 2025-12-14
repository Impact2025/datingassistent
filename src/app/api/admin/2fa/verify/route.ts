import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { requireAdmin } from '@/lib/auth';
import { verifyTwoFactorToken } from '@/lib/two-factor-auth';

export async function POST(request: NextRequest) {
  try {
    const adminUser = await requireAdmin(request);
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 });
    }

    const userResult = await sql`
      SELECT two_factor_secret, two_factor_enabled
      FROM users
      WHERE id = ${adminUser.id}
    `;

    const user = userResult.rows[0];
    if (!user?.two_factor_secret) {
      return NextResponse.json({ error: '2FA not setup' }, { status: 400 });
    }

    const verification = verifyTwoFactorToken(user.two_factor_secret, token);

    if (!verification.isValid) {
      return NextResponse.json({ error: verification.message }, { status: 401 });
    }

    if (!user.two_factor_enabled) {
      await sql`
        UPDATE users
        SET two_factor_enabled = true, updated_at = NOW()
        WHERE id = ${adminUser.id}
      `;
    }

    return NextResponse.json({ success: true, message: '2FA verified' });
  } catch (error) {
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 });
  }
}