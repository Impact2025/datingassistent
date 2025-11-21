import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { token, action } = await request.json();

    if (!token) {
      return NextResponse.json(
        { error: 'reCAPTCHA token is required' },
        { status: 400 }
      );
    }

    // Handle development bypass tokens
    if (token === 'bypass' || token === 'bypass_development') {
      console.log('🧪 Using reCAPTCHA bypass token for development');
      return NextResponse.json({
        success: true,
        score: 1.0,
        bypass: true
      });
    }

    const secretKey = process.env.RECAPTCHA_SECRET_KEY;
    if (!secretKey) {
      console.warn('RECAPTCHA_SECRET_KEY not configured, using bypass mode');
      return NextResponse.json({
        success: true,
        score: 1.0,
        bypass: true
      });
    }

    // Verify token with Google reCAPTCHA API
    const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        secret: secretKey,
        response: token,
      }),
    });

    const result = await response.json();

    if (!result.success) {
      console.error('reCAPTCHA verification failed:', result['error-codes']);
      return NextResponse.json(
        { error: 'reCAPTCHA verification failed', details: result['error-codes'] },
        { status: 400 }
      );
    }

    // Check score for v3 (v2 doesn't have score)
    if (result.score !== undefined && result.score < 0.5) {
      console.warn('Low reCAPTCHA score:', result.score);
      return NextResponse.json(
        { error: 'Suspicious activity detected' },
        { status: 400 }
      );
    }

    // Check action if provided
    if (action && result.action !== action) {
      console.error('reCAPTCHA action mismatch:', result.action, 'expected:', action);
      return NextResponse.json(
        { error: 'reCAPTCHA action verification failed' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      score: result.score,
      action: result.action,
      challenge_ts: result.challenge_ts,
    });

  } catch (error) {
    console.error('reCAPTCHA verification error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}