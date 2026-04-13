import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { neon } from '@neondatabase/serverless';
import { logger } from '@/lib/logger';

const sql = neon(process.env.DATABASE_URL!);

// JWT Secret validation
const JWT_SECRET_RAW = process.env.JWT_SECRET;
const JWT_SECRET = JWT_SECRET_RAW && JWT_SECRET_RAW.length >= 32
  ? new TextEncoder().encode(JWT_SECRET_RAW)
  : null;

export async function GET(request: NextRequest) {
  logger.log('🔍 Auth verify API called');

  // Check JWT secret at runtime
  if (!JWT_SECRET) {
    console.error('❌ FATAL: JWT_SECRET is not set or is too short. Please check environment variables.');
    return NextResponse.json(
      { error: 'Server configuration error: JWT secret is missing.' },
      { status: 500 }
    );
  }

  try {
    // Get token from Authorization header, or fall back to the httpOnly cookie.
    // The httpOnly cookie is set by /api/auth/magic-login and cannot be read by
    // JavaScript (document.cookie), but the browser sends it automatically on
    // same-origin requests — so we can read it here server-side.
    const authHeader = request.headers.get('authorization');
    logger.log('🔍 Auth header present:', !!authHeader);

    let token: string | null = null;
    let tokenSource: 'header' | 'cookie' = 'header';

    if (authHeader?.startsWith('Bearer ')) {
      token = authHeader.substring(7);
      logger.log('🔍 Token extracted from Authorization header, length:', token.length);
    } else {
      // Fallback: read from the httpOnly cookie (magic-link flow)
      token = request.cookies.get('datespark_auth_token')?.value ?? null;
      if (token) {
        tokenSource = 'cookie';
        logger.log('🔍 Token extracted from httpOnly cookie, length:', token.length);
      }
    }

    if (!token) {
      logger.log('❌ No token provided (no Authorization header or cookie)');
      return NextResponse.json(
        { error: 'No token provided' },
        { status: 401 }
      );
    }

    // Verify token using jose (same as auth.ts)
    let decoded;
    try {
      logger.log('🔍 Verifying JWT token...');
      const { payload } = await jwtVerify(token, JWT_SECRET);
      decoded = payload;
      logger.log('✅ JWT verified successfully');
    } catch (err) {
      logger.log('❌ JWT verification failed:', err);
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    // Get user from database - handle both old and new token formats
    let userId: number;
    if (decoded.user && typeof decoded.user === 'object' && 'id' in decoded.user) {
      // New format: { user: { id, email, displayName } }
      userId = decoded.user.id as number;
    } else if (decoded.userId) {
      // Old format: { userId, email }
      userId = decoded.userId as number;
    } else {
      return NextResponse.json(
        { error: 'Invalid token format' },
        { status: 401 }
      );
    }

    logger.log('🔍 Querying database for user ID:', userId);

    const result = await sql`
      SELECT id, name, email, created_at, subscription_type, role, email_verified
      FROM users
      WHERE id = ${userId}
    `;

    logger.log('🔍 Database query result:', result.length, 'rows found');

    if (result.length === 0) {
      logger.log('❌ User not found in database');
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const user = result[0];

    const responseData: Record<string, unknown> = {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        emailVerified: user.email_verified,
        createdAt: user.created_at,
        subscriptionType: user.subscription_type,
        role: user.role,
      },
    };

    // When validated via httpOnly cookie (magic-link flow), include the raw token
    // in the response so the client can sync it to localStorage.
    if (tokenSource === 'cookie') {
      responseData.token = token;
    }

    logger.log('✅ Returning user data:', responseData);
    return NextResponse.json(responseData, { status: 200 });

  } catch (error) {
    console.error('❌ Token verification error:', error);
    console.error('❌ Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
