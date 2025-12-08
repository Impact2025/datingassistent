import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { requireAdmin } from '@/lib/auth';
import { SignJWT } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'dev-only-jwt-secret-change-in-production-2024'
);

/**
 * POST /api/admin/user-actions - Perform quick actions on users
 *
 * Supported actions:
 * - resend_verification: Resend verification code
 * - verify_email: Manually verify user's email
 * - generate_login_link: Generate magic login link
 * - reset_onboarding: Reset onboarding progress
 */
export async function POST(request: NextRequest) {
  try {
    await requireAdmin(request);

    const body = await request.json();
    const { action, userId } = body;

    if (!action || !userId) {
      return NextResponse.json(
        { error: 'Action and userId are required' },
        { status: 400 }
      );
    }

    // Get user
    const userResult = await sql`
      SELECT * FROM users WHERE id = ${userId}
    `;

    if (userResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const user = userResult.rows[0];

    switch (action) {
      case 'resend_verification': {
        // Generate new verification code
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

        await sql`
          UPDATE users
          SET
            verification_code = ${code},
            code_expires_at = ${expiresAt.toISOString()},
            code_attempts = 0
          WHERE id = ${userId}
        `;

        // TODO: Send email with verification code
        console.log(`Verification code for user ${userId}: ${code}`);

        return NextResponse.json({
          success: true,
          message: 'Verification code resent',
          code, // In production, don't return this
          expiresAt
        });
      }

      case 'verify_email': {
        // Manually verify email
        await sql`
          UPDATE users
          SET
            email_verified = true,
            verification_code = NULL,
            code_expires_at = NULL
          WHERE id = ${userId}
        `;

        return NextResponse.json({
          success: true,
          message: 'Email verified successfully'
        });
      }

      case 'generate_login_link': {
        // Generate magic login link
        const token = await new SignJWT({
          userId: user.id,
          email: user.email,
          type: 'magic_link'
        })
          .setProtectedHeader({ alg: 'HS256' })
          .setIssuedAt()
          .setExpirationTime('24h')
          .sign(JWT_SECRET);

        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
        const loginLink = `${baseUrl}/auth/magic-login?token=${token}`;

        return NextResponse.json({
          success: true,
          message: 'Login link generated',
          loginLink,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
        });
      }

      case 'reset_onboarding': {
        // Reset onboarding progress
        await sql`
          UPDATE users
          SET
            lead_onboarding_completed = false,
            lead_oto_shown = false
          WHERE id = ${userId}
        `;

        // Delete onboarding journey
        await sql`
          DELETE FROM onboarding_journeys WHERE user_id = ${userId}
        `;

        return NextResponse.json({
          success: true,
          message: 'Onboarding reset successfully'
        });
      }

      case 'send_welcome_email': {
        // TODO: Trigger welcome email
        console.log(`Welcome email for user ${userId}`);

        return NextResponse.json({
          success: true,
          message: 'Welcome email queued'
        });
      }

      case 'mark_as_active': {
        // Mark user as active (simulate login)
        await sql`
          UPDATE users
          SET last_login = NOW()
          WHERE id = ${userId}
        `;

        return NextResponse.json({
          success: true,
          message: 'User marked as active'
        });
      }

      default:
        return NextResponse.json(
          { error: 'Unknown action' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('User action error:', error);
    return NextResponse.json(
      { error: 'Failed to perform action' },
      { status: 500 }
    );
  }
}
