/**
 * API: Log Dating Activity
 * Allows users to log their dating activities (matches, conversations, dates)
 */

import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const token = request.cookies.get('datespark_auth_token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user ID from token
    const authQuery = await sql`
      SELECT user_id
      FROM auth_tokens
      WHERE token = ${token}
      AND expires_at > NOW()
    `;

    if (authQuery.rows.length === 0) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }

    const userId = authQuery.rows[0].user_id;

    // Parse request body
    const body = await request.json();
    const {
      activityType,
      activityDate,
      matchQuality,
      platform,
      conversationLength,
      wasMeaningful,
      dateLocation,
      dateRating,
      notes
    } = body;

    // Validate required fields
    if (!activityType || !['match', 'conversation', 'date', 'second_date'].includes(activityType)) {
      return NextResponse.json({
        error: 'Invalid activity type. Must be: match, conversation, date, or second_date'
      }, { status: 400 });
    }

    // Insert activity into database
    const result = await sql`
      INSERT INTO dating_activities (
        user_id,
        activity_date,
        activity_type,
        match_quality,
        platform,
        conversation_length,
        was_meaningful,
        date_location,
        date_rating,
        notes
      ) VALUES (
        ${userId},
        ${activityDate || new Date().toISOString().split('T')[0]},
        ${activityType},
        ${matchQuality || null},
        ${platform || null},
        ${conversationLength || null},
        ${wasMeaningful !== undefined ? wasMeaningful : null},
        ${dateLocation || null},
        ${dateRating || null},
        ${notes || null}
      )
      RETURNING id, activity_date, activity_type
    `;

    // Award points for logging activity
    try {
      const pointsToAward = activityType === 'date' ? 15 : activityType === 'conversation' ? 5 : 3;

      await sql`
        INSERT INTO user_actions (
          user_id,
          action_type,
          action_category,
          points_earned,
          metadata
        ) VALUES (
          ${userId},
          'dating_activity_logged',
          'engagement',
          ${pointsToAward},
          ${JSON.stringify({
            activityType,
            activityDate: result.rows[0].activity_date,
            activityId: result.rows[0].id
          })}
        )
      `;
    } catch (pointsError) {
      console.warn('Could not award points for activity logging:', pointsError);
      // Don't fail the request if points awarding fails
    }

    return NextResponse.json({
      success: true,
      activity: {
        id: result.rows[0].id,
        type: result.rows[0].activity_type,
        date: result.rows[0].activity_date
      },
      message: 'Dating activity logged successfully'
    });

  } catch (error: any) {
    console.error('Error logging dating activity:', error);
    return NextResponse.json({
      error: 'Failed to log dating activity',
      message: error.message
    }, { status: 500 });
  }
}

/**
 * GET: Retrieve user's dating activities
 */
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const token = request.cookies.get('datespark_auth_token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user ID from token
    const authQuery = await sql`
      SELECT user_id
      FROM auth_tokens
      WHERE token = ${token}
      AND expires_at > NOW()
    `;

    if (authQuery.rows.length === 0) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }

    const userId = authQuery.rows[0].user_id;

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const type = searchParams.get('type'); // Optional filter by activity type

    // Build query
    let query = `
      SELECT
        id,
        activity_date,
        activity_type,
        match_quality,
        platform,
        conversation_length,
        was_meaningful,
        date_location,
        date_rating,
        notes,
        created_at
      FROM dating_activities
      WHERE user_id = $1
    `;

    const params = [userId];

    if (type) {
      query += ` AND activity_type = $2`;
      params.push(type);
    }

    query += ` ORDER BY activity_date DESC, created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const result = await sql.query(query, params);

    // Get summary stats
    const statsQuery = await sql`
      SELECT
        COUNT(CASE WHEN activity_type = 'match' THEN 1 END) as total_matches,
        COUNT(CASE WHEN activity_type = 'conversation' THEN 1 END) as total_conversations,
        COUNT(CASE WHEN activity_type = 'date' THEN 1 END) as total_dates,
        COUNT(CASE WHEN activity_type = 'second_date' THEN 1 END) as second_dates,
        AVG(CASE WHEN activity_type = 'match' THEN match_quality END) as avg_match_quality,
        AVG(CASE WHEN activity_type = 'date' THEN date_rating END) as avg_date_rating
      FROM dating_activities
      WHERE user_id = ${userId}
      AND activity_date >= DATE_TRUNC('month', CURRENT_DATE)
    `;

    const stats = statsQuery.rows[0];

    return NextResponse.json({
      activities: result.rows.map(row => ({
        id: row.id,
        activityDate: row.activity_date,
        activityType: row.activity_type,
        matchQuality: row.match_quality,
        platform: row.platform,
        conversationLength: row.conversation_length,
        wasMeaningful: row.was_meaningful,
        dateLocation: row.date_location,
        dateRating: row.date_rating,
        notes: row.notes,
        createdAt: row.created_at
      })),
      stats: {
        totalMatches: parseInt(stats.total_matches) || 0,
        totalConversations: parseInt(stats.total_conversations) || 0,
        totalDates: parseInt(stats.total_dates) || 0,
        secondDates: parseInt(stats.second_dates) || 0,
        avgMatchQuality: Math.round(parseFloat(stats.avg_match_quality) || 0),
        avgDateRating: Math.round(parseFloat(stats.avg_date_rating) || 0)
      }
    });

  } catch (error: any) {
    console.error('Error retrieving dating activities:', error);
    return NextResponse.json({
      error: 'Failed to retrieve dating activities',
      message: error.message
    }, { status: 500 });
  }
}