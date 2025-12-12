import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { neon } from '@neondatabase/serverless';
import { getClientIdentifier, rateLimitAuthEndpoint, createRateLimitHeaders } from '@/lib/rate-limit';
import { logger } from '@/lib/logger';
import { signToken, cookieConfig } from '@/lib/jwt-config';

const sql = neon(process.env.DATABASE_URL!);

export async function POST(request: NextRequest) {
  // Apply rate limiting
  const identifier = getClientIdentifier(request);
  const rateLimit = await rateLimitAuthEndpoint(identifier);

  if (!rateLimit.success) {
    const resetDate = new Date(rateLimit.resetAt);
    const headers = createRateLimitHeaders(rateLimit);

    return NextResponse.json(
      {
        error: 'Too many login attempts',
        message: `Rate limit exceeded. Try again after ${resetDate.toLocaleTimeString()}`,
        resetAt: resetDate.toISOString(),
      },
      { status: 429, headers }
    );
  }

  try {
    // Parse request body with error handling
    let email, password;
    try {
      const body = await request.json();
      email = body.email;
      password = body.password;
    } catch (parseError) {
      console.error('❌ Failed to parse login request body:', parseError);
      return NextResponse.json(
        { error: 'Invalid request body. Please provide email and password.' },
        { status: 400 }
      );
    }

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Find user by email
    const result = await sql`
      SELECT id, name, email, password_hash, created_at, subscription_type, email_verified
      FROM users
      WHERE email = ${email}
    `;

    if (result.length === 0) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    const user = result[0];

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);

    if (!isValidPassword) {
      logger.auth('failed_login', { email, reason: 'invalid_password' });
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Check if email is verified
    if (!user.email_verified) {
      logger.auth('failed_login', { email, reason: 'email_not_verified' });
      return NextResponse.json(
        { error: 'Email not verified. Please check your email and verify your account before logging in.' },
        { status: 403 }
      );
    }

    logger.auth('login', { userId: user.id, email });

    // Create JWT token using centralized jwt-config
    const token = await signToken({
      id: user.id,
      email: user.email,
      displayName: user.name || user.email.split('@')[0]
    });

    // Create response with user data and token
    const response = NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        emailVerified: user.email_verified,
        createdAt: user.created_at,
        subscriptionType: user.subscription_type,
      },
      token,
    }, { status: 200 });

    // Set token in cookie using centralized config
    response.cookies.set(cookieConfig.name, token, cookieConfig.options);

    console.log('🍪 Cookie set:', {
      name: cookieConfig.name,
      ...cookieConfig.options
    });

    return response;

  } catch (error) {
    logger.error('Login error', error instanceof Error ? error : undefined, {
      email: request.body ? 'provided' : 'missing',
    });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
