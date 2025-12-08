import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { sendVerificationEmail } from '@/lib/email-service';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Find user by email
    const userResult = await sql`
      SELECT id, email, name, email_verified
      FROM users
      WHERE LOWER(email) = LOWER(${email})
    `;

    if (userResult.rows.length === 0) {
      // Don't reveal if user exists or not for security
      return NextResponse.json(
        { message: 'Als dit emailadres bij ons bekend is, hebben we een verificatiecode verzonden.' },
        { status: 200 }
      );
    }

    const user = userResult.rows[0];

    // If already verified, don't send another code
    if (user.email_verified) {
      return NextResponse.json(
        { error: 'Dit emailadres is al geverifieerd. Je kunt gewoon inloggen!' },
        { status: 400 }
      );
    }

    // Generate new 6-digit verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now

    // Update user with new code
    await sql`
      UPDATE users
      SET
        verification_code = ${verificationCode},
        code_expires_at = ${expiresAt.toISOString()},
        code_attempts = 0
      WHERE id = ${user.id}
    `;

    // Send verification email
    try {
      await sendVerificationEmail(user.email, verificationCode, user.name);
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
      // Don't fail the request if email sending fails
    }

    console.log(`✅ New verification code sent to user ${user.id} (${user.email})`);

    return NextResponse.json({
      success: true,
      message: 'Verificatiecode verzonden! Check je inbox (en spam folder).'
    });

  } catch (error) {
    console.error('Resend verification error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}