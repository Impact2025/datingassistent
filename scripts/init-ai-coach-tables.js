require('dotenv').config({ path: '.env.local' });
const { sql } = require('@vercel/postgres');

async function initAICoachTables() {
  try {
    console.log('Initializing AI Coach System tables...');

    // Monthly AI Overview Reports
    await sql`
      CREATE TABLE IF NOT EXISTS monthly_ai_reports (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        report_month DATE NOT NULL,
        goals_achieved TEXT[],
        goals_missed TEXT[],
        actions_completed INTEGER DEFAULT 0,
        consistency_score DECIMAL(3,1) CHECK (consistency_score >= 0 AND consistency_score <= 10),
        avoidance_patterns TEXT[],
        ai_insights TEXT,
        success_highlights TEXT[],
        improvement_areas TEXT[],
        recommended_focus TEXT,
        suggested_next_goal TEXT,
        coach_reviewed BOOLEAN DEFAULT false,
        coach_notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, report_month)
      )
    `;

    // Weekly AI Mini-Reviews
    await sql`
      CREATE TABLE IF NOT EXISTS weekly_ai_reviews (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        review_week DATE NOT NULL,
        user_reflection TEXT,
        challenges_faced TEXT[],
        achievements TEXT[],
        energy_level INTEGER CHECK (energy_level >= 1 AND energy_level <= 10),
        motivation_level INTEGER CHECK (motivation_level >= 1 AND motivation_level <= 10),
        ai_summary TEXT,
        ai_suggestions TEXT[],
        micro_goals TEXT[],
        encouragement_message TEXT,
        risk_flags TEXT[],
        coach_reviewed BOOLEAN DEFAULT false,
        coach_feedback TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, review_week)
      )
    `;

    // AI Content Analysis Results
    await sql`
      CREATE TABLE IF NOT EXISTS ai_content_analyses (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        content_type VARCHAR(50) NOT NULL, -- 'profile', 'message', 'photo', 'date_report', 'mindset'
        content_id VARCHAR(100), -- Reference to the analyzed content
        analysis_type VARCHAR(50) NOT NULL, -- 'quality', 'sentiment', 'improvement', 'risk'
        ai_score DECIMAL(3,1) CHECK (ai_score >= 0 AND ai_score <= 10),
        ai_feedback TEXT,
        improvement_suggestions TEXT[],
        risk_warnings TEXT[],
        positive_aspects TEXT[],
        alternative_suggestions TEXT[],
        analyzed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        coach_reviewed BOOLEAN DEFAULT false,
        coach_override TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // AI Coach Notifications/Alerts
    await sql`
      CREATE TABLE IF NOT EXISTS ai_coach_notifications (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        notification_type VARCHAR(50) NOT NULL, -- 'inactivity', 'success', 'risk', 'motivation', 'milestone'
        priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
        title VARCHAR(200) NOT NULL,
        message TEXT NOT NULL,
        ai_insights TEXT,
        suggested_actions TEXT[],
        auto_generated BOOLEAN DEFAULT true,
        coach_acknowledged BOOLEAN DEFAULT false,
        coach_response TEXT,
        user_notified BOOLEAN DEFAULT false,
        notification_sent_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // User Activity Tracking for AI Analysis
    await sql`
      CREATE TABLE IF NOT EXISTS user_activity_tracking (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        activity_type VARCHAR(50) NOT NULL, -- 'goal_progress', 'message_practice', 'profile_update', 'photo_upload', 'date_scheduled', 'community_post', 'course_completion'
        activity_data JSONB DEFAULT '{}',
        ai_processed BOOLEAN DEFAULT false,
        ai_insights TEXT,
        sentiment_score DECIMAL(3,1) CHECK (sentiment_score >= -1 AND sentiment_score <= 1),
        engagement_score DECIMAL(3,1) CHECK (engagement_score >= 0 AND engagement_score <= 10),
        risk_indicators TEXT[],
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Coach-Client Assignments
    await sql`
      CREATE TABLE IF NOT EXISTS coach_client_assignments (
        id SERIAL PRIMARY KEY,
        coach_user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        client_user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        assignment_date DATE DEFAULT CURRENT_DATE,
        status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'completed')),
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(coach_user_id, client_user_id, status)
      )
    `;

    // AI Analysis Queue (for background processing)
    await sql`
      CREATE TABLE IF NOT EXISTS ai_analysis_queue (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        analysis_type VARCHAR(50) NOT NULL,
        content_reference VARCHAR(100),
        priority INTEGER DEFAULT 1,
        status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
        retry_count INTEGER DEFAULT 0,
        error_message TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        processed_at TIMESTAMP,
        completed_at TIMESTAMP
      )
    `;

    // Create indexes for performance
    await sql`CREATE INDEX IF NOT EXISTS idx_monthly_reports_user_month ON monthly_ai_reports(user_id, report_month)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_weekly_reviews_user_week ON weekly_ai_reviews(user_id, review_week)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_content_analyses_user_type ON ai_content_analyses(user_id, content_type)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_coach_notifications_user_type ON ai_coach_notifications(user_id, notification_type)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_activity_tracking_user_type ON user_activity_tracking(user_id, activity_type)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_coach_assignments_coach ON coach_client_assignments(coach_user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_coach_assignments_client ON coach_client_assignments(client_user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_analysis_queue_status ON ai_analysis_queue(status)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_analysis_queue_priority ON ai_analysis_queue(priority DESC)`;

    // Insert default coach assignment for admin user (assuming user ID 1 is admin)
    await sql`
      INSERT INTO coach_client_assignments (coach_user_id, client_user_id, notes)
      VALUES (1, 1, 'Default coach assignment for admin/coach user')
      ON CONFLICT (coach_user_id, client_user_id, status) DO NOTHING
    `;

    console.log('✅ AI Coach System tables initialized successfully!');
  } catch (error) {
    console.error('❌ Error initializing AI Coach System tables:', error);
    throw error;
  }
}

// Run the initialization
initAICoachTables()
  .then(() => {
    console.log('🎉 AI Coach System database initialization complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 AI Coach System database initialization failed:', error);
    process.exit(1);
  });