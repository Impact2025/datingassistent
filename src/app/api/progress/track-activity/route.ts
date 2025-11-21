import { NextRequest, NextResponse } from 'next/server';
import { trackUserActivity } from '@/lib/progress-tracker';
import { verifyAuth } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request body
    const body = await request.json();
    const { activityType, data, points } = body;

    if (!activityType || typeof activityType !== 'string') {
      return NextResponse.json({
        error: 'Activity type is required and must be a string'
      }, { status: 400 });
    }

    // Track the activity
    const result = await trackUserActivity(user.id, {
      type: activityType,
      data: data || {},
      points: points
    });

    if (result.success) {
      return NextResponse.json({
        success: true,
        pointsEarned: result.pointsEarned,
        message: 'Activity tracked successfully'
      });
    } else {
      console.error('Failed to track activity:', result.error);
      return NextResponse.json({
        error: 'Failed to track activity'
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Error tracking activity:', error);
    return NextResponse.json({
      error: 'Internal server error'
    }, { status: 500 });
  }
}