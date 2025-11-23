import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Get user subscription from database
    const result = await sql`
      SELECT
        subscription,
        subscription_type,
        subscription_status,
        subscription_start_date
      FROM users
      WHERE id = ${parseInt(userId)}
    `;

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const user = result.rows[0];

    return NextResponse.json({
      subscription: user.subscription || {
        packageType: user.subscription_type || 'free',
        status: user.subscription_status || 'inactive',
        startDate: user.subscription_start_date,
        billingPeriod: 'yearly', // Default assumption
        amount: 0
      }
    });

  } catch (error) {
    console.error('Error fetching user subscription:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}