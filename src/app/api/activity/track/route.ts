import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { trackUserActivity } from '@/lib/progress-tracker';

export async function POST(request: NextRequest) {
  try {
    const { userId, activityType, data, points } = await request.json();

    if (!userId || !activityType) {
      return NextResponse.json(
        { error: 'userId and activityType are required' },
        { status: 400 }
      );
    }

    console.log(`📊 Tracking activity for user ${userId}: ${activityType}`);

    // Track the activity using the progress tracker
    const result = await trackUserActivity(userId, {
      type: activityType,
      data: data || {},
      points: points || undefined
    });

    // Update user's progress metrics
    try {
      await sql`
        UPDATE user_profiles
        SET last_activity_at = NOW(),
            activity_count = COALESCE(activity_count, 0) + 1
        WHERE user_id = ${userId}
      `;
    } catch (error) {
      console.error('Failed to update user profile activity:', error);
      // Non-blocking error - continue even if this fails
    }

    return NextResponse.json({
      success: true,
      message: 'Activity tracked successfully',
      pointsEarned: result.pointsEarned || 0
    });

  } catch (error) {
    console.error('Activity tracking error:', error);
    return NextResponse.json(
      { error: 'Failed to track activity' },
      { status: 500 }
    );
  }
}