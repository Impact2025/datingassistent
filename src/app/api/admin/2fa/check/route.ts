/**
 * 2FA Check API for Admin Users
 * POST /api/admin/2fa/check
 * Checks if a user has 2FA enabled
 */

import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Check if user exists and has 2FA enabled
    const userResult = await sql`
      SELECT id, two_factor_enabled
      FROM users
      WHERE email = ${email}
    `;

    if (userResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const user = userResult.rows[0];

    return NextResponse.json({
      userId: user.id,
      requires2FA: user.two_factor_enabled || false
    });

  } catch (error) {
    console.error('2FA check error:', error);
    return NextResponse.json(
      { error: 'Failed to check 2FA status' },
      { status: 500 }
    );
  }
}