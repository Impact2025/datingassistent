import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export async function POST(request: Request) {
  try {
    // Authenticate user
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'No authorization token provided' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const user = await verifyToken(token);

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    const { activities, activityDetails, weekStart, weekEnd, irisInsight } = await request.json();

    if (!activities || !Array.isArray(activities) || activities.length === 0) {
      return NextResponse.json(
        { error: 'At least one activity must be selected' },
        { status: 400 }
      );
    }

    // Calculate summary statistics
    const totalMatches = activities.filter(a => a === 'new_match').length;
    const totalConversations = activities.filter(a => a === 'conversation').length;
    const totalDates = activities.filter(a => a === 'date').length;

    // Calculate average match quality
    let averageMatchQuality = null;
    const matchQualities = Object.values(activityDetails)
      .filter((detail: any) => detail.qualityRating)
      .map((detail: any) => detail.qualityRating);

    if (matchQualities.length > 0) {
      averageMatchQuality = matchQualities.reduce((sum: number, rating: number) => sum + rating, 0) / matchQualities.length;
    }

    // Calculate ghosting count
    const totalGhosting = activities.filter((a: string) => a === 'ghosting').length;

    // Save to database
    const result = await sql`
      INSERT INTO weekly_dating_logs (
        user_id,
        week_start,
        week_end,
        activities,
        activity_details,
        total_matches,
        total_conversations,
        total_dates,
        total_ghosting,
        average_match_quality,
        iris_insight,
        iris_insight_generated_at
      ) VALUES (
        ${user.id},
        ${weekStart},
        ${weekEnd},
        ${JSON.stringify(activities)},
        ${JSON.stringify(activityDetails || {})},
        ${totalMatches},
        ${totalConversations},
        ${totalDates},
        ${totalGhosting},
        ${averageMatchQuality},
        ${irisInsight || null},
        ${irisInsight ? new Date().toISOString() : null}
      )
      ON CONFLICT (user_id, week_start)
      DO UPDATE SET
        activities = EXCLUDED.activities,
        activity_details = EXCLUDED.activity_details,
        total_matches = EXCLUDED.total_matches,
        total_conversations = EXCLUDED.total_conversations,
        total_dates = EXCLUDED.total_dates,
        total_ghosting = EXCLUDED.total_ghosting,
        average_match_quality = EXCLUDED.average_match_quality,
        iris_insight = EXCLUDED.iris_insight,
        iris_insight_generated_at = EXCLUDED.iris_insight_generated_at,
        updated_at = NOW()
      RETURNING id
    `;

    // Save individual match data if provided
    if (activityDetails) {
      for (const [activityId, details] of Object.entries(activityDetails)) {
        if (activityId === 'new_match' && details) {
          const matchData = details as any;
          if (matchData.name && matchData.platform) {
            await sql`
              INSERT INTO user_matches (
                user_id,
                name,
                platform,
                match_date,
                quality_rating,
                vibe
              ) VALUES (
                ${user.id},
                ${matchData.name},
                ${matchData.platform},
                ${weekEnd}, -- Assume match happened this week
                ${matchData.qualityRating || null},
                ${matchData.vibe || null}
              )
              ON CONFLICT DO NOTHING
            `;
          }
        }

        // Update conversation details for existing matches
        if (activityId === 'conversation' && details) {
          const convData = details as any;
          if (convData.matchName) {
            await sql`
              UPDATE user_matches
              SET
                conversation_status = ${convData.status || null},
                conversation_feeling = ${convData.feeling || null},
                last_conversation_date = ${weekEnd},
                updated_at = NOW()
              WHERE user_id = ${user.id}
                AND name = ${convData.matchName}
            `;
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      logId: result[0]?.id,
      message: 'Weekly log saved successfully'
    });

  } catch (error) {
    console.error('Error saving weekly log:', error);
    return NextResponse.json(
      {
        error: 'Failed to save weekly log',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}