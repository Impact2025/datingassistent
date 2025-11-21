import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

/**
 * List all users in the Neon database
 */
export async function GET() {
  try {
    const result = await sql`
      SELECT id, name, email, created_at, subscription, profile
      FROM users
      ORDER BY id ASC
    `;

    return NextResponse.json({
      success: true,
      count: result.rows.length,
      users: result.rows.map(user => ({
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.created_at,
        hasSubscription: !!user.subscription,
        hasProfile: !!user.profile,
      }))
    });

  } catch (error: any) {
    console.error('Error listing users:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to list users',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
