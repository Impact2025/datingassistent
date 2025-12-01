import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

/**
 * Database Schema voor Dating Week Logger
 * Tabellen voor weekly logs, matches, en Iris insights
 */
export async function GET() {
  try {
    console.log('📅 Initializing Dating Log tables...');

    // 1. Weekly Dating Logs - Hoofdtabel voor wekelijkse logs
    console.log('Creating weekly_dating_logs table...');
    await sql`
      CREATE TABLE IF NOT EXISTS weekly_dating_logs (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        week_start DATE NOT NULL,
        week_end DATE NOT NULL,

        -- Activity data
        activities JSONB NOT NULL DEFAULT '[]',
        activity_details JSONB DEFAULT '{}',

        -- Summary statistics
        total_matches INTEGER DEFAULT 0,
        total_conversations INTEGER DEFAULT 0,
        total_dates INTEGER DEFAULT 0,
        total_ghosting INTEGER DEFAULT 0,
        average_match_quality DECIMAL(3,2),

        -- Iris insight (generated AI advice)
        iris_insight TEXT,
        iris_insight_generated_at TIMESTAMP,

        -- User notes
        user_notes TEXT,
        mood_rating INTEGER CHECK (mood_rating >= 1 AND mood_rating <= 5),

        -- Timestamps
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),

        -- Unique constraint: one log per user per week
        UNIQUE(user_id, week_start)
      )
    `;
    console.log('✅ weekly_dating_logs table created');

    // 2. User Matches - Track individual matches
    console.log('Creating user_matches table...');
    await sql`
      CREATE TABLE IF NOT EXISTS user_matches (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,

        -- Match info
        name VARCHAR(100),
        platform VARCHAR(50),
        match_date DATE,

        -- Match quality & feelings
        quality_rating INTEGER CHECK (quality_rating >= 1 AND quality_rating <= 5),
        vibe VARCHAR(50),
        initial_attraction INTEGER CHECK (initial_attraction >= 1 AND initial_attraction <= 5),

        -- Conversation tracking
        conversation_status VARCHAR(50),
        conversation_feeling VARCHAR(50),
        last_conversation_date DATE,
        messages_exchanged INTEGER DEFAULT 0,

        -- Date tracking
        first_date_planned BOOLEAN DEFAULT false,
        first_date_date DATE,
        date_outcome VARCHAR(50),

        -- Status
        status VARCHAR(50) DEFAULT 'active',
        archived_at TIMESTAMP,
        archived_reason VARCHAR(100),

        -- Notes
        notes TEXT,

        -- Timestamps
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `;
    console.log('✅ user_matches table created');

    // 3. Dating Log History - Track patterns over time
    console.log('Creating dating_log_history table...');
    await sql`
      CREATE TABLE IF NOT EXISTS dating_log_history (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        log_id INTEGER NOT NULL REFERENCES weekly_dating_logs(id) ON DELETE CASCADE,

        -- Weekly metrics snapshot
        week_number INTEGER NOT NULL,
        year INTEGER NOT NULL,

        -- Cumulative stats
        cumulative_matches INTEGER DEFAULT 0,
        cumulative_conversations INTEGER DEFAULT 0,
        cumulative_dates INTEGER DEFAULT 0,

        -- Trend indicators
        match_trend VARCHAR(20), -- 'increasing', 'stable', 'decreasing'
        conversation_rate DECIMAL(5,2), -- % of matches that became conversations
        date_rate DECIMAL(5,2), -- % of conversations that became dates

        -- AI analysis
        weekly_pattern_analysis TEXT,

        created_at TIMESTAMP DEFAULT NOW()
      )
    `;
    console.log('✅ dating_log_history table created');

    // 4. User Notification Preferences
    console.log('Creating user_notification_preferences table...');
    await sql`
      CREATE TABLE IF NOT EXISTS user_notification_preferences (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,

        -- Dating log reminders
        monday_reminders_enabled BOOLEAN DEFAULT true,
        reminder_time TIME DEFAULT '18:00:00',
        last_reminder_sent TIMESTAMP,

        -- Other notification preferences
        weekly_summary_enabled BOOLEAN DEFAULT true,
        iris_tips_enabled BOOLEAN DEFAULT true,
        achievement_notifications BOOLEAN DEFAULT true,

        -- Email preferences
        email_notifications BOOLEAN DEFAULT false,
        email_frequency VARCHAR(20) DEFAULT 'weekly',

        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),

        UNIQUE(user_id)
      )
    `;
    console.log('✅ user_notification_preferences table created');

    // 5. Dating Insights - Store AI-generated insights for context
    console.log('Creating dating_insights table...');
    await sql`
      CREATE TABLE IF NOT EXISTS dating_insights (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        log_id INTEGER REFERENCES weekly_dating_logs(id) ON DELETE SET NULL,

        -- Insight content
        insight_type VARCHAR(50) NOT NULL, -- 'weekly', 'pattern', 'milestone', 'tip'
        insight_text TEXT NOT NULL,

        -- Context
        context_data JSONB,

        -- User interaction
        was_helpful BOOLEAN,
        user_feedback TEXT,

        created_at TIMESTAMP DEFAULT NOW()
      )
    `;
    console.log('✅ dating_insights table created');

    // Create indexes for performance
    console.log('Creating database indexes...');

    await sql`CREATE INDEX IF NOT EXISTS idx_dating_logs_user ON weekly_dating_logs(user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_dating_logs_week ON weekly_dating_logs(user_id, week_start DESC)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_user_matches_user ON user_matches(user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_user_matches_status ON user_matches(user_id, status)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_dating_history_user ON dating_log_history(user_id, year DESC, week_number DESC)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_dating_insights_user ON dating_insights(user_id, created_at DESC)`;

    console.log('✅ All indexes created');

    // Insert default notification preferences for existing users
    console.log('Setting up default preferences for existing users...');
    await sql`
      INSERT INTO user_notification_preferences (user_id)
      SELECT id FROM users
      WHERE id NOT IN (SELECT user_id FROM user_notification_preferences)
      ON CONFLICT DO NOTHING
    `;
    console.log('✅ Default preferences created');

    console.log('✅ Dating Log system initialized successfully!');

    return NextResponse.json({
      success: true,
      message: 'Dating Log system initialized',
      tables: [
        'weekly_dating_logs',
        'user_matches',
        'dating_log_history',
        'user_notification_preferences',
        'dating_insights'
      ]
    });

  } catch (error) {
    console.error('❌ Error initializing Dating Log tables:', error);
    return NextResponse.json(
      {
        error: 'Failed to initialize Dating Log tables',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * POST - Reset tables (development only)
 */
export async function POST(request: Request) {
  try {
    // Only allow in development
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json(
        { error: 'Cannot reset tables in production' },
        { status: 403 }
      );
    }

    const body = await request.json();

    if (body.action === 'reset') {
      console.log('⚠️ Resetting Dating Log tables...');

      await sql`DROP TABLE IF EXISTS dating_insights CASCADE`;
      await sql`DROP TABLE IF EXISTS dating_log_history CASCADE`;
      await sql`DROP TABLE IF EXISTS user_notification_preferences CASCADE`;
      await sql`DROP TABLE IF EXISTS user_matches CASCADE`;
      await sql`DROP TABLE IF EXISTS weekly_dating_logs CASCADE`;

      console.log('✅ Tables dropped');

      return NextResponse.json({
        success: true,
        message: 'Tables dropped. Call GET to recreate.'
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error) {
    console.error('❌ Error resetting tables:', error);
    return NextResponse.json(
      { error: 'Failed to reset tables', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
