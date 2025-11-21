const { sql } = require('@vercel/postgres');

async function initGamificationTables() {
  try {
    console.log('Initializing gamification tables...');

    // User badges table - update existing one with new columns
    await sql`
      ALTER TABLE user_badges
      ADD COLUMN IF NOT EXISTS badge_type VARCHAR(50),
      ADD COLUMN IF NOT EXISTS badge_name VARCHAR(100),
      ADD COLUMN IF NOT EXISTS badge_description TEXT,
      ADD COLUMN IF NOT EXISTS badge_icon VARCHAR(50)
    `;

    // User activity log table
    await sql`
      CREATE TABLE IF NOT EXISTS user_activity_log (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        activity_type VARCHAR(50) NOT NULL,
        activity_data JSONB DEFAULT '{}',
        points_earned INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // User streaks table
    await sql`
      CREATE TABLE IF NOT EXISTS user_streaks (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        streak_type VARCHAR(50) NOT NULL,
        current_streak INTEGER DEFAULT 0,
        longest_streak INTEGER DEFAULT 0,
        last_activity_date DATE,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, streak_type)
      )
    `;

    // User progress metrics table
    await sql`
      CREATE TABLE IF NOT EXISTS user_progress_metrics (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        metric_type VARCHAR(50) NOT NULL,
        metric_value DECIMAL(5,2) NOT NULL,
        week_start DATE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, metric_type, week_start)
      )
    `;

    // Weekly insights table
    await sql`
      CREATE TABLE IF NOT EXISTS weekly_insights (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        week_start DATE NOT NULL,
        insight_type VARCHAR(20) NOT NULL,
        title VARCHAR(200) NOT NULL,
        description TEXT NOT NULL,
        actionable BOOLEAN DEFAULT false,
        priority INTEGER DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Create indexes
    await sql`CREATE INDEX IF NOT EXISTS idx_user_activity_log_user_id ON user_activity_log(user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_user_activity_log_type ON user_activity_log(activity_type)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_user_activity_log_created_at ON user_activity_log(created_at)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_user_streaks_user_id ON user_streaks(user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_user_streaks_type ON user_streaks(streak_type)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_user_progress_metrics_user_id ON user_progress_metrics(user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_user_progress_metrics_week ON user_progress_metrics(week_start)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_weekly_insights_user_id ON weekly_insights(user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_weekly_insights_week ON weekly_insights(week_start)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_user_badges_badge_type ON user_badges(badge_type)`;

    console.log('✅ Gamification tables initialized successfully!');
  } catch (error) {
    console.error('❌ Error initializing gamification tables:', error);
    throw error;
  }
}

// Run the initialization
initGamificationTables()
  .then(() => {
    console.log('🎉 Database initialization complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Database initialization failed:', error);
    process.exit(1);
  });