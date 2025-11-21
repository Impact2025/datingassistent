import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { verifyToken } from '@/lib/auth';
import { AIContextManager } from '@/lib/ai-context-manager';

export async function GET(request: NextRequest) {
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

    console.log(`📤 Starting data export for user ${user.id}`);

    // Ensure data_requests table exists
    try {
      await sql`
        CREATE TABLE IF NOT EXISTS data_requests (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          request_type TEXT NOT NULL CHECK (request_type IN ('export', 'delete', 'modify')),
          status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
          requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          completed_at TIMESTAMP WITH TIME ZONE,
          data JSONB,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )
      `;
    } catch (tableError) {
      console.error('Error ensuring data_requests table:', tableError);
    }

    // Collect all user data
    const exportData: any = {
      exportInfo: {
        userId: user.id,
        exportDate: new Date().toISOString(),
        gdprCompliant: true,
        dataRetention: 'Active accounts: unlimited, Deleted accounts: 30 days then permanent'
      },
      personalData: null,
      aiContext: null,
      goals: [],
      progress: [],
      activityLog: [],
      coachingProfiles: [],
      journeyData: null
    };

    // 1. Personal data
    try {
      const userResult = await sql`
        SELECT
          id, email, name, created_at, updated_at,
          profile, ai_context, data_consent, data_retention_until
        FROM users
        WHERE id = ${user.id}
      `;

      if (userResult.rows.length > 0) {
        const userData = userResult.rows[0];
        exportData.personalData = {
          id: userData.id,
          email: userData.email,
          name: userData.name,
          createdAt: userData.created_at,
          updatedAt: userData.updated_at,
          profile: userData.profile,
          dataConsent: userData.data_consent,
          dataRetentionUntil: userData.data_retention_until
        };
      }
    } catch (error) {
      console.error('Error exporting personal data:', error);
    }

    // 2. AI Context
    try {
      exportData.aiContext = await AIContextManager.getUserContext(user.id);
    } catch (error) {
      console.error('Error exporting AI context:', error);
    }

    // 3. Goals
    try {
      const goalsResult = await sql`
        SELECT * FROM user_goals WHERE user_id = ${user.id}
      `;
      exportData.goals = goalsResult.rows;
    } catch (error) {
      console.error('Error exporting goals:', error);
    }

    // 4. Progress data
    try {
      const progressResult = await sql`
        SELECT * FROM user_progress_metrics WHERE user_id = ${user.id}
      `;
      exportData.progress = progressResult.rows;
    } catch (error) {
      console.error('Error exporting progress:', error);
    }

    // 5. Activity log (last 1000 entries for performance)
    try {
      const activityResult = await sql`
        SELECT * FROM user_activity_log
        WHERE user_id = ${user.id}
        ORDER BY created_at DESC
        LIMIT 1000
      `;
      exportData.activityLog = activityResult.rows;
    } catch (error) {
      console.error('Error exporting activity log:', error);
    }

    // 6. Coaching profiles
    try {
      const coachingResult = await sql`
        SELECT * FROM coaching_profiles WHERE user_id = ${user.id}
      `;
      exportData.coachingProfiles = coachingResult.rows;
    } catch (error) {
      console.error('Error exporting coaching profiles:', error);
    }

    // 7. Journey data
    try {
      const journeyResult = await sql`
        SELECT * FROM user_journey WHERE user_id = ${user.id}
      `;
      if (journeyResult.rows.length > 0) {
        exportData.journeyData = journeyResult.rows[0];
      }
    } catch (error) {
      console.error('Error exporting journey data:', error);
    }

    // Log the export request
    try {
      await sql`
        INSERT INTO data_requests (user_id, request_type, status, data)
        VALUES (${user.id}, 'export', 'completed', ${JSON.stringify({
          format: 'json',
          recordCount: {
            goals: exportData.goals.length,
            progress: exportData.progress.length,
            activityLog: exportData.activityLog.length,
            coachingProfiles: exportData.coachingProfiles.length
          }
        })})
      `;
    } catch (logError) {
      console.error('Error logging export request:', logError);
      // Don't fail the export if logging fails
    }

    console.log(`✅ Data export completed for user ${user.id}`);

    // Return JSON response with proper headers for download
    return new Response(JSON.stringify(exportData, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="datingassistent-data-${user.id}-${new Date().toISOString().split('T')[0]}.json"`,
        'Cache-Control': 'no-cache'
      }
    });

  } catch (error: any) {
    console.error('❌ Data export error:', error);
    return NextResponse.json(
      {
        error: 'Data export failed',
        message: error.message
      },
      { status: 500 }
    );
  }
}