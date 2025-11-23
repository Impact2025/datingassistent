import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { updateSubscriptionStatus } from '@/lib/neon-subscription';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  try {
    // Note: CSRF protection is globally disabled in middleware
    // If you want to re-enable it, update src/lib/csrf-edge.ts getCSRFConfig()

    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Get current subscription
    const userResult = await sql`
      SELECT subscription FROM users WHERE id = ${userId}
    `;

    if (userResult.rows.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const subscription = userResult.rows[0].subscription;

    if (!subscription) {
      return NextResponse.json({ error: 'No active subscription' }, { status: 404 });
    }

    // Update subscription status to cancelled
    await updateSubscriptionStatus(userId, 'cancelled');

    // Also update the cancelled_at timestamp
    await sql`
      UPDATE users
      SET subscription = jsonb_set(
        subscription::jsonb,
        '{cancelledAt}',
        ${JSON.stringify(new Date().toISOString())}::jsonb
      ),
      updated_at = NOW()
      WHERE id = ${userId}
    `;

    return NextResponse.json({
      success: true,
      message: 'Subscription cancelled successfully',
    });
  } catch (error) {
    console.error('Error cancelling subscription:', error);
    return NextResponse.json(
      { error: 'Failed to cancel subscription' },
      { status: 500 }
    );
  }
}
