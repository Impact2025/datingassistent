import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { sql } from '@vercel/postgres';

// JWT Secret validation
const JWT_SECRET_RAW = process.env.JWT_SECRET;
const JWT_SECRET = JWT_SECRET_RAW && JWT_SECRET_RAW.length >= 32
  ? new TextEncoder().encode(JWT_SECRET_RAW)
  : null;

export async function GET(request: NextRequest) {
  console.log('🔍 Auth verify API called');

  // Check JWT secret at runtime
  if (!JWT_SECRET) {
    console.error('❌ FATAL: JWT_SECRET is not set or is too short. Please check environment variables.');
    return NextResponse.json(
      { error: 'Server configuration error: JWT secret is missing.' },
      { status: 500 }
    );
  }

  try {
    // Get token from Authorization header
    const authHeader = request.headers.get('authorization');
    console.log('🔍 Auth header present:', !!authHeader);

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('❌ No token provided');
      return NextResponse.json(
        { error: 'No token provided' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    console.log('🔍 Token extracted, length:', token.length);

    // Verify token using jose (same as auth.ts)
    let decoded;
    try {
      console.log('🔍 Verifying JWT token...');
      const { payload } = await jwtVerify(token, JWT_SECRET);
      decoded = payload;
      console.log('✅ JWT verified successfully');
    } catch (err) {
      console.log('❌ JWT verification failed:', err);
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

    console.log('🔍 Querying database for user ID:', userId);

    const result = await sql`
      SELECT id, name, email, created_at, subscription_type, role, email_verified
      FROM users
      WHERE id = ${userId}
    `;

    console.log('🔍 Database query result:', result.rows.length, 'rows found');

    if (result.rows.length === 0) {
      console.log('❌ User not found in database');
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const user = result.rows[0];

    const responseData = {
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

    console.log('✅ Returning user data:', responseData);
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
