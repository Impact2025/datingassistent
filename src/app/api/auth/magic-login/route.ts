import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { signToken, cookieConfig } from '@/lib/jwt-config';
import { logger } from '@/lib/logger';

/**
 * Magic-link login endpoint.
 *
 * Quiz users who registered with needsPasswordSetup=true get a one-time
 * magic-login URL in their account-setup email. Clicking it here:
 *   1. Validates the stored verification_token
 *   2. Issues a fresh JWT (cookie + Location header for client localStorage)
 *   3. Clears the token so it can't be reused
 *   4. Redirects to ?next= or /dashboard
 *
 * The token is stored in the `verification_token` column which is unused for
 * already-verified (quiz) users, so we can safely repurpose it here.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');
  const next = searchParams.get('next') || '/dashboard';

  if (!token) {
    return NextResponse.redirect(new URL('/login?error=missing_token', request.url));
  }

  try {
    const result = await sql`
      SELECT id, name, email, verification_token, verification_expires_at, email_verified
      FROM users
      WHERE verification_token = ${token}
    `;

    if (result.rows.length === 0) {
      logger.log(`Magic-login: token not found`);
      return NextResponse.redirect(new URL('/login?error=invalid_token', request.url));
    }

    const user = result.rows[0];

    // Check expiry
    const expiresAt = new Date(user.verification_expires_at);
    if (expiresAt < new Date()) {
      logger.log(`Magic-login: token expired for user ${user.id}`);
      return NextResponse.redirect(new URL('/login?error=expired_token', request.url));
    }

    // Clear token so it can't be reused
    await sql`
      UPDATE users
      SET verification_token = NULL,
          verification_expires_at = NULL
      WHERE id = ${user.id}
    `;

    // Issue JWT
    const jwtToken = await signToken({
      id: user.id,
      email: user.email,
      displayName: user.name,
    });

    logger.log(`Magic-login: issued JWT for user ${user.id}`);

    // Set the JWT as an httpOnly cookie — UserProvider syncs it to localStorage on mount.
    const redirectUrl = new URL(next, request.url);
    const response = NextResponse.redirect(redirectUrl);
    response.cookies.set(cookieConfig.name, jwtToken, cookieConfig.options);
    return response;

  } catch (error) {
    console.error('Magic-login error:', error);
    return NextResponse.redirect(new URL('/login?error=server_error', request.url));
  }
}
