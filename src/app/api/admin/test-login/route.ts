import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { SignJWT } from 'jose';
import { sql } from '@vercel/postgres';
import bcrypt from 'bcryptjs';
import { getJWTSecret } from '@/lib/jwt-secret';

export const dynamic = 'force-dynamic';

const JWT_SECRET = getJWTSecret();
const ADMIN_EMAILS = ['v_mun@hotmail.com', 'v.munster@weareimpact.nl'];

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    
    console.log('Test login attempt for:', email);
    
    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }
    
    // Check if email is admin
    if (!ADMIN_EMAILS.includes(email)) {
      return NextResponse.json(
        { error: 'Not authorized as admin' },
        { status: 403 }
      );
    }

    // Find user by email
    const result = await sql`
      SELECT id, name, email, password_hash, created_at
      FROM users
      WHERE email = ${email}
    `;

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    const user = result.rows[0];

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);

    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Create JWT token
    const token = await new SignJWT({
      userId: user.id,
      email: user.email
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('7d')
      .sign(JWT_SECRET);
    
    // Set cookie
    const cookieStore = await cookies();
    cookieStore.set('datespark_auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    // Return user data and token
    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.created_at,
      },
      token,
    }, { status: 200 });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}