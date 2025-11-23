/**
 * ACTIVITY TRACKING API
 * Track user activities for gamification and analytics
 * POST /api/activity/track
 *
 * Professional implementation with:
 * - Points-based gamification
 * - Activity logging to user_activity_log
 * - Query performance monitoring
 * - Non-blocking execution (failures don't break flow)
 */

import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { insert } from '@/lib/db/query-wrapper';
import { validate } from '@/lib/db/validation';
import { logDatabaseError } from '@/lib/error-logging';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Activity type to points mapping
const ACTIVITY_POINTS: Record<string, number> = {
  'personality_scan_started': 5,
  'personality_scan_completed': 15,
  'journey_step_completed': 10,
  'profile_created': 20,
  'coach_advice_viewed': 5,
  'welcome_video_watched': 5,
  'welcome_questions_completed': 10,
  'journey_completed': 50,
};

interface ActivityRequest {
  userId: number;
  activityType: string;
  data?: Record<string, any>;
  points?: number;
}

/**
 * POST /api/activity/track
 * Track a user activity
 */
export async function POST(request: NextRequest) {
  try {
    const body: ActivityRequest = await request.json();
    const { userId, activityType, data, points } = body;

    // Validate required fields
    if (!userId || !activityType) {
      return NextResponse.json(
        { error: 'userId and activityType are required' },
        { status: 400 }
      );
    }

    // Validate userId
    const validation = validate({ userId }, [
      { field: 'userId', type: 'number', required: true, min: 1 }
    ]);

    if (!validation.valid) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.errors },
        { status: 400 }
      );
    }

    // Determine points to award
    const pointsEarned = points || ACTIVITY_POINTS[activityType] || 0;

    console.log(`📊 Tracking activity for user ${userId}: ${activityType} (+${pointsEarned} points)`);

    // Insert activity log (non-blocking if it fails)
    try {
      await insert(
        async () => {
          return await sql`
            INSERT INTO user_activity_log (
              user_id,
              activity_type,
              activity_data,
              points_earned,
              created_at
            ) VALUES (
              ${userId},
              ${activityType},
              ${JSON.stringify(data || {})}::jsonb,
              ${pointsEarned},
              CURRENT_TIMESTAMP
            )
          `;
        },
        'track-activity'
      );

      console.log(`✅ Activity tracked for user ${userId}: ${activityType}`);
    } catch (activityError) {
      console.error('Failed to log activity (non-blocking):', activityError);
      // Don't fail the request if activity logging fails
    }

    // Update user's total points (non-blocking)
    try {
      if (pointsEarned > 0) {
        await sql`
          UPDATE user_profiles_extended
          SET
            reputation_points = COALESCE(reputation_points, 0) + ${pointsEarned},
            last_active = CURRENT_TIMESTAMP
          WHERE user_id = ${userId}
        `;

        console.log(`🎯 User ${userId} earned ${pointsEarned} points (${activityType})`);
      }
    } catch (pointsError) {
      console.error('Failed to update points (non-blocking):', pointsError);
      // Don't fail the request if points update fails
    }

    // Check for badge achievements (non-blocking)
    try {
      // Get user's activity count
      const activityCount = await sql`
        SELECT COUNT(*) as count
        FROM user_activity_log
        WHERE user_id = ${userId}
      `;

      const totalActivities = parseInt(activityCount.rows[0]?.count || '0');

      // Award "Getting Started" badge after 5 activities
      if (totalActivities === 5) {
        await sql`
          INSERT INTO user_badges (user_id, badge_id, badge_type, badge_name, badge_description, badge_icon)
          VALUES (
            ${userId},
            1,
            'milestone',
            'Getting Started',
            'Completed your first 5 activities',
            'star'
          )
          ON CONFLICT (user_id, badge_id) DO NOTHING
        `;

        console.log(`🏆 User ${userId} earned "Getting Started" badge!`);
      }

      // Award "Journey Complete" badge
      if (activityType === 'journey_completed') {
        await sql`
          INSERT INTO user_badges (user_id, badge_id, badge_type, badge_name, badge_description, badge_icon)
          VALUES (
            ${userId},
            2,
            'milestone',
            'Journey Complete',
            'Finished the onboarding journey',
            'trophy'
          )
          ON CONFLICT (user_id, badge_id) DO NOTHING
        `;

        console.log(`🏆 User ${userId} earned "Journey Complete" badge!`);
      }
    } catch (badgeError) {
      console.error('Failed to check badges (non-blocking):', badgeError);
      // Don't fail the request if badge check fails
    }

    return NextResponse.json({
      success: true,
      message: 'Activity tracked successfully',
      pointsEarned,
      activityType
    }, { status: 200 });

  } catch (error) {
    console.error('❌ Activity tracking error:', error);
    logDatabaseError(
      error instanceof Error ? error : new Error('Unknown activity tracking error'),
      'track-activity'
    );

    // Return success even on error to prevent blocking the user flow
    // Activity tracking is nice-to-have, not critical
    return NextResponse.json({
      success: true,
      message: 'Request processed (activity logging failed)',
      pointsEarned: 0
    }, { status: 200 });
  }
}
