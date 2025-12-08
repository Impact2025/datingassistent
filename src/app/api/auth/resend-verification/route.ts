import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { sendVerificationEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    const userResult = await sql\;

    if (userResult.rows.length === 0) {
      return NextResponse.json(
        { message: 'Als dit emailadres bij ons bekend is, hebben we een verificatiecode verzonden.' },
        { status: 200 }
      );
    }

    const user = userResult.rows[0];

    if (user.email_verified) {
      return NextResponse.json(
        { error: 'Dit emailadres is al geverifieerd. Je kunt gewoon inloggen!' },
        { status: 400 }
      );
    }

    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    await sql\;

    try {
      await sendVerificationEmail(user.email, verificationCode, user.name);
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
    }

    console.log(\);

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