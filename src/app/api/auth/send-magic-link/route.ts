import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { getClientIdentifier, rateLimitAuthEndpoint, createRateLimitHeaders } from '@/lib/rate-limit';
import { generateVerificationToken } from '@/lib/email-verification';
import { logger } from '@/lib/logger';

function safeRedirect(next: string | null | undefined): string {
  if (!next) return '/dashboard';
  if (next.startsWith('/') && !next.startsWith('//') && !next.includes('://')) return next;
  return '/dashboard';
}

export async function POST(request: NextRequest) {
  const identifier = getClientIdentifier(request);
  const rateLimit = await rateLimitAuthEndpoint(identifier);

  if (!rateLimit.success) {
    return NextResponse.json(
      { error: 'Te veel verzoeken. Probeer het later opnieuw.' },
      { status: 429, headers: createRateLimitHeaders(rateLimit) }
    );
  }

  try {
    const body = await request.json();
    const { email } = body;
    const next = safeRedirect(body.next);

    if (!email) {
      return NextResponse.json({ error: 'E-mailadres is vereist' }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const result = await sql`
      SELECT id, name, email, email_verified
      FROM users
      WHERE email = ${normalizedEmail}
    `;

    // Always return success — prevents email enumeration
    if (result.rows.length === 0) {
      logger.log(`Magic link requested for unknown email: ${normalizedEmail}`);
      return NextResponse.json({ success: true });
    }

    const user = result.rows[0];

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://datingassistent.nl';
    const nextParam = next !== '/dashboard' ? `&next=${encodeURIComponent(next)}` : '';

    // Deduplication: reuse an existing valid token if sent within the last 3 minutes.
    // This prevents the mailserver from seeing multiple identical emails in quick
    // succession (a common spam/rate-limit trigger).
    const existingResult = await sql`
      SELECT verification_token, verification_expires_at
      FROM users
      WHERE id = ${user.id}
        AND verification_token IS NOT NULL
        AND verification_expires_at > NOW()
        AND verification_expires_at > NOW() + INTERVAL '57 minutes'
    `;

    if (existingResult.rows.length > 0) {
      const existingToken = existingResult.rows[0].verification_token;
      const magicUrl = `${baseUrl}/api/auth/magic-login?token=${existingToken}${nextParam}`;
      logger.log(`Magic link reused for user ${user.id} (deduplication)`);
      import('@/lib/email-service')
        .then(({ sendMagicLinkEmail }) => sendMagicLinkEmail(user.email, user.name, magicUrl))
        .catch(e => console.warn('Magic link email failed (non-critical):', e));
      return NextResponse.json({ success: true });
    }

    // Generate a secure token with 1-hour expiry
    const token = generateVerificationToken();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);

    await sql`
      UPDATE users
      SET verification_token      = ${token},
          verification_expires_at = ${expiresAt.toISOString()}
      WHERE id = ${user.id}
    `;

    const magicUrl = `${baseUrl}/api/auth/magic-login?token=${token}${nextParam}`;

    // Send email non-blocking
    import('@/lib/email-service')
      .then(({ sendMagicLinkEmail }) => sendMagicLinkEmail(user.email, user.name, magicUrl))
      .catch(e => console.warn('Magic link email failed (non-critical):', e));

    logger.log(`Magic link issued for user ${user.id}`);
    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Send magic link error:', error);
    return NextResponse.json({ error: 'Er is iets misgegaan. Probeer het opnieuw.' }, { status: 500 });
  }
}
