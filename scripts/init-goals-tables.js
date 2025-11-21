require('dotenv').config({ path: '.env.local' });
const { sql } = require('@vercel/postgres');

async function initGoalsTables() {
  try {
    console.log('Initializing goals tables...');

    // User goals table
    await sql`
      CREATE TABLE IF NOT EXISTS user_goals (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        goal_type VARCHAR(20) NOT NULL CHECK (goal_type IN ('weekly', 'monthly', 'yearly')),
        title VARCHAR(200) NOT NULL,
        description TEXT,
        category VARCHAR(50) NOT NULL,
        target_value INTEGER DEFAULT 1,
        current_value INTEGER DEFAULT 0,
        status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused', 'cancelled')),
        priority INTEGER DEFAULT 1,
        due_date DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Goal progress table
    await sql`
      CREATE TABLE IF NOT EXISTS goal_progress (
        id SERIAL PRIMARY KEY,
        goal_id INTEGER REFERENCES user_goals(id) ON DELETE CASCADE,
        progress_value INTEGER NOT NULL,
        progress_date DATE DEFAULT CURRENT_DATE,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Weekly reflections table
    await sql`
      CREATE TABLE IF NOT EXISTS weekly_reflections (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        week_start DATE NOT NULL,
        reflection_text TEXT,
        achievements TEXT[],
        challenges TEXT[],
        next_week_goals TEXT[],
        ai_feedback TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, week_start)
      )
    `;

    // Monthly reviews table
    await sql`
      CREATE TABLE IF NOT EXISTS monthly_reviews (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        month_start DATE NOT NULL,
        overall_progress DECIMAL(3,1) CHECK (overall_progress >= 0 AND overall_progress <= 10),
        key_achievements TEXT[],
        lessons_learned TEXT[],
        goals_adjustments TEXT[],
        ai_insights TEXT,
        next_month_focus TEXT[],
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, month_start)
      )
    `;

    // Goal templates table
    await sql`
      CREATE TABLE IF NOT EXISTS goal_templates (
        id SERIAL PRIMARY KEY,
        category VARCHAR(50) NOT NULL,
        title VARCHAR(200) NOT NULL,
        description TEXT,
        target_value INTEGER DEFAULT 1,
        difficulty VARCHAR(20) DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
        estimated_duration_days INTEGER,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Create indexes for better performance
    await sql`CREATE INDEX IF NOT EXISTS idx_user_goals_user_id ON user_goals(user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_user_goals_status ON user_goals(status)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_user_goals_type ON user_goals(goal_type)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_user_goals_category ON user_goals(category)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_goal_progress_goal_id ON goal_progress(goal_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_goal_progress_date ON goal_progress(progress_date)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_weekly_reflections_user_week ON weekly_reflections(user_id, week_start)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_monthly_reviews_user_month ON monthly_reviews(user_id, month_start)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_goal_templates_category ON goal_templates(category)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_goal_templates_active ON goal_templates(is_active)`;

    // Insert some default goal templates
    await sql`
      INSERT INTO goal_templates (category, title, description, target_value, difficulty, estimated_duration_days)
      VALUES
        ('profile', 'Profiel foto''s optimaliseren', 'Upload en optimaliseer professionele profiel foto''s', 3, 'easy', 7),
        ('messages', 'Openingsberichten oefenen', 'Oefen met 10 verschillende openingsberichten', 10, 'medium', 14),
        ('dates', 'Eerste date plannen', 'Plan en voer een eerste date uit', 1, 'medium', 21),
        ('mindset', 'Dagelijkse affirmaties', 'Herhaal dagelijkse positieve affirmaties', 30, 'easy', 30),
        ('confidence', 'Camera-angst overwinnen', 'Maak dagelijks een selfie en beoordeel jezelf', 7, 'hard', 14),
        ('attachment', 'Relatiepatronen reflecteren', 'Schrijf wekelijks over relatiepatronen en inzichten', 4, 'hard', 28)
      ON CONFLICT DO NOTHING
    `;

    console.log('✅ Goals tables initialized successfully!');
  } catch (error) {
    console.error('❌ Error initializing goals tables:', error);
    throw error;
  }
}

// Run the initialization
initGoalsTables()
  .then(() => {
    console.log('🎉 Goals database initialization complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Goals database initialization failed:', error);
    process.exit(1);
  });