import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { signToken, cookieConfig } from '@/lib/jwt-config';
import { logger } from '@/lib/logger';

/**
 * Magic-link login endpoint.
 *
 * GET: Email/scanner-safe redirect to the confirmation page. This prevents
 * security scanners (Avira, Outlook Safe Links, etc.) from consuming the
 * one-time token by pre-fetching the URL from the email.
 *
 * POST: Called by the confirmation page after the user clicks "Log in".
 *   1. Validates the stored verification_token
 *   2. Issues a fresh JWT (httpOnly cookie)
 *   3. Clears the token so it can't be reused
 *   4. Returns { success: true } — client redirects to ?next=
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');
  const next = searchParams.get('next') || '/dashboard';

  if (!token) {
    return NextResponse.redirect(new URL('/login?error=missing_token', request.url));
  }

  // Redirect to the confirmation page — no token consumption here.
  // Scanners follow this redirect and get an HTML page; only real user clicks proceed.
  const confirmUrl = new URL('/magic-login', request.url);
  confirmUrl.searchParams.set('token', token);
  confirmUrl.searchParams.set('next', next);
  return NextResponse.redirect(confirmUrl);
}

export async function POST(request: NextRequest) {
  try {
    const { token, next = '/dashboard' } = await request.json();

    if (!token) {
      return NextResponse.json({ error: 'Token ontbreekt.' }, { status: 400 });
    }

    const result = await sql`
      SELECT id, name, email, verification_token, verification_expires_at, email_verified
      FROM users
      WHERE verification_token = ${token}
    `;

    if (result.rows.length === 0) {
      logger.log(`Magic-login POST: token not found`);
      return NextResponse.json({ error: 'Deze inloglink is ongeldig. Vraag een nieuwe aan.' }, { status: 400 });
    }

    const user = result.rows[0];

    // Check expiry — parse as UTC to avoid local-timezone offset bugs.
    const rawExpiry = user.verification_expires_at;
    let expiresAt: Date;
    if (rawExpiry instanceof Date) {
      expiresAt = rawExpiry;
    } else {
      const s = String(rawExpiry);
      const hasTimezone = s.endsWith('Z') || /[+-]\d{2}:?\d{2}$/.test(s);
      expiresAt = new Date(hasTimezone ? s.replace(' ', 'T') : s.replace(' ', 'T') + 'Z');
    }
    if (expiresAt < new Date()) {
      logger.log(`Magic-login POST: token expired for user ${user.id}`);
      return NextResponse.json({ error: 'Deze inloglink is verlopen. Vraag een nieuwe aan.' }, { status: 400 });
    }

    await sql`
      UPDATE users
      SET verification_token      = NULL,
          verification_expires_at = NULL,
          email_verified          = true
      WHERE id = ${user.id}
    `;

    const jwtToken = await signToken({
      id: user.id,
      email: user.email,
      displayName: user.name,
    });

    logger.log(`Magic-login POST: issued JWT for user ${user.id}`);

    const response = NextResponse.json({ success: true });
    response.cookies.set(cookieConfig.name, jwtToken, cookieConfig.options);
    return response;

  } catch (error) {
    console.error('Magic-login POST error:', error);
    return NextResponse.json({ error: 'Er is iets misgegaan. Probeer het opnieuw.' }, { status: 500 });
  }
}
