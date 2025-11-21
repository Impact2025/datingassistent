const { sql } = require('@vercel/postgres');

async function initCoachTables() {
  try {
    console.log('🚀 Initializing coach system database tables...');

    // Coach-Client Assignments Table
    await sql`
      CREATE TABLE IF NOT EXISTS coach_client_assignments (
        id SERIAL PRIMARY KEY,
        coach_user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        client_user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        status VARCHAR(20) DEFAULT 'active',
        assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        notes TEXT,
        UNIQUE(coach_user_id, client_user_id)
      )
    `;

    // User Activity Tracking Table
    await sql`
      CREATE TABLE IF NOT EXISTS user_activity_tracking (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        activity_type VARCHAR(50) NOT NULL,
        activity_data JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // User Goals Table
    await sql`
      CREATE TABLE IF NOT EXISTS user_goals (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        status VARCHAR(20) DEFAULT 'active',
        progress_percentage INTEGER DEFAULT 0,
        target_date DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // AI Coach Notifications Table
    await sql`
      CREATE TABLE IF NOT EXISTS ai_coach_notifications (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        notification_type VARCHAR(50) NOT NULL,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        priority VARCHAR(20) DEFAULT 'medium',
        coach_acknowledged BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Monthly AI Reports Table
    await sql`
      CREATE TABLE IF NOT EXISTS monthly_ai_reports (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        report_month INTEGER NOT NULL,
        report_year INTEGER NOT NULL,
        goals_achieved JSONB DEFAULT '[]',
        goals_missed JSONB DEFAULT '[]',
        actions_completed INTEGER DEFAULT 0,
        consistency_score INTEGER DEFAULT 0,
        success_highlights JSONB DEFAULT '[]',
        improvement_areas JSONB DEFAULT '[]',
        ai_insights TEXT,
        suggested_next_goal TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, report_month, report_year)
      )
    `;

    // Weekly AI Reviews Table
    await sql`
      CREATE TABLE IF NOT EXISTS weekly_ai_reviews (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        review_week INTEGER NOT NULL,
        review_year INTEGER NOT NULL,
        energy_level INTEGER,
        motivation_level INTEGER,
        ai_summary TEXT,
        ai_suggestions JSONB DEFAULT '[]',
        micro_goals JSONB DEFAULT '[]',
        encouragement_message TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, review_week, review_year)
      )
    `;

    // Email Tracking Table
    await sql`
      CREATE TABLE IF NOT EXISTS email_tracking (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        email_type VARCHAR(50) NOT NULL,
        subject VARCHAR(255),
        sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Create indexes for better performance
    await sql`CREATE INDEX IF NOT EXISTS idx_coach_assignments_coach ON coach_client_assignments(coach_user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_coach_assignments_client ON coach_client_assignments(client_user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_user_activity_user ON user_activity_tracking(user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_user_activity_type ON user_activity_tracking(activity_type)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_user_goals_user ON user_goals(user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_ai_notifications_user ON ai_coach_notifications(user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_monthly_reports_user ON monthly_ai_reports(user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_weekly_reviews_user ON weekly_ai_reviews(user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_email_tracking_user ON email_tracking(user_id)`;

    console.log('✅ Coach system tables initialized successfully!');

    // Insert some sample data for testing
    console.log('📝 Adding sample data...');

    // Get admin user (assuming v_mun@hotmail.com is admin)
    const adminUser = await sql`SELECT id FROM users WHERE email = 'v_mun@hotmail.com' LIMIT 1`;

    if (adminUser.rows.length > 0) {
      const coachId = adminUser.rows[0].id;

      // Assign all existing users as clients to the admin coach
      await sql`
        INSERT INTO coach_client_assignments (coach_user_id, client_user_id, status)
        SELECT ${coachId}, id, 'active'
        FROM users
        WHERE id != ${coachId}
        AND id NOT IN (
          SELECT client_user_id FROM coach_client_assignments WHERE coach_user_id = ${coachId}
        )
      `;

      // Add some sample goals for users
      const users = await sql`SELECT id FROM users LIMIT 5`;
      for (const user of users.rows) {
        await sql`
          INSERT INTO user_goals (user_id, title, description, status, progress_percentage)
          VALUES
            (${user.id}, 'Complete profile setup', 'Fill out all profile sections', 'completed', 100),
            (${user.id}, 'Schedule first date', 'Find and schedule a first date', 'active', 30),
            (${user.id}, 'Improve photo quality', 'Take and upload better profile photos', 'active', 60)
        `;
      }

      // Add some sample activities
      for (const user of users.rows) {
        await sql`
          INSERT INTO user_activity_tracking (user_id, activity_type, activity_data)
          VALUES
            (${user.id}, 'goal_completed', '{"description": "Profiel volledig ingevuld"}'),
            (${user.id}, 'login', '{"description": "Dagelijkse login"}'),
            (${user.id}, 'course_started', '{"description": "Nieuwe cursus begonnen"}')
        `;
      }

      console.log('✅ Sample data added for testing!');
    }

    console.log('🎉 Coach system is ready to use!');

  } catch (error) {
    console.error('❌ Error initializing coach tables:', error);
    throw error;
  }
}

// Run the initialization
initCoachTables()
  .then(() => {
    console.log('🏁 Coach tables initialization completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Coach tables initialization failed:', error);
    process.exit(1);
  });