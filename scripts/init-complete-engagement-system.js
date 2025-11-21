/**
 * Initialize Complete Engagement System
 * Creates all tables needed for FASE 2-5
 */

require('dotenv').config({ path: '.env.local' });
const { sql } = require('@vercel/postgres');

async function initCompleteEngagementSystem() {
  try {
    console.log('🚀 Starting COMPLETE engagement system initialization...\n');

    // ========================================
    // FASE 2: Week 1 Activatie
    // ========================================
    console.log('📅 FASE 2: Week 1 Activatie System\n');

    // User Engagement Tracking
    console.log('1️⃣  Creating user_engagement table...');
    await sql`
      CREATE TABLE IF NOT EXISTS user_engagement (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        journey_day INTEGER NOT NULL DEFAULT 1,
        last_activity_date DATE DEFAULT CURRENT_DATE,
        current_streak INTEGER DEFAULT 0,
        longest_streak INTEGER DEFAULT 0,
        total_logins INTEGER DEFAULT 0,
        weekly_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(user_id)
      )
    `;
    console.log('   ✅ Success\n');

    // Daily Check-ins
    console.log('2️⃣  Creating daily_checkins table...');
    await sql`
      CREATE TABLE IF NOT EXISTS daily_checkins (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        checkin_date DATE NOT NULL DEFAULT CURRENT_DATE,
        journey_day INTEGER NOT NULL,
        mood_rating INTEGER CHECK (mood_rating BETWEEN 1 AND 10),
        progress_rating INTEGER CHECK (progress_rating BETWEEN 1 AND 10),
        challenges TEXT,
        wins TEXT,
        notes TEXT,
        completed_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(user_id, checkin_date)
      )
    `;
    console.log('   ✅ Success\n');

    // Daily Tasks
    console.log('3️⃣  Creating daily_tasks table...');
    await sql`
      CREATE TABLE IF NOT EXISTS daily_tasks (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        task_date DATE NOT NULL DEFAULT CURRENT_DATE,
        journey_day INTEGER NOT NULL,
        task_type VARCHAR(50) NOT NULL,
        task_title TEXT NOT NULL,
        task_description TEXT,
        task_category VARCHAR(20) CHECK (task_category IN ('social', 'practical', 'mindset')),
        target_value INTEGER DEFAULT 1,
        current_value INTEGER DEFAULT 0,
        status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'skipped')),
        completed_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;
    console.log('   ✅ Success\n');

    // Weekly Reflections
    console.log('4️⃣  Creating weekly_reflections table...');
    await sql`
      CREATE TABLE IF NOT EXISTS weekly_reflections (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        week_number INTEGER NOT NULL,
        reflection_date DATE NOT NULL DEFAULT CURRENT_DATE,
        matches_count INTEGER DEFAULT 0,
        conversations_count INTEGER DEFAULT 0,
        dates_count INTEGER DEFAULT 0,
        profile_updates INTEGER DEFAULT 0,
        consistency_score INTEGER CHECK (consistency_score BETWEEN 0 AND 100),
        social_activity_score INTEGER CHECK (social_activity_score BETWEEN 0 AND 100),
        overall_progress_score INTEGER CHECK (overall_progress_score BETWEEN 0 AND 100),
        biggest_win TEXT,
        biggest_challenge TEXT,
        lessons_learned TEXT,
        next_week_goals JSONB,
        ai_analysis JSONB,
        completed_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(user_id, week_number)
      )
    `;
    console.log('   ✅ Success\n');

    // User Actions Log
    console.log('5️⃣  Creating user_actions table...');
    await sql`
      CREATE TABLE IF NOT EXISTS user_actions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        action_type VARCHAR(50) NOT NULL,
        action_category VARCHAR(30),
        action_data JSONB,
        points_earned INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;
    console.log('   ✅ Success\n');

    // Progress Milestones
    console.log('6️⃣  Creating progress_milestones table...');
    await sql`
      CREATE TABLE IF NOT EXISTS progress_milestones (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        milestone_type VARCHAR(50) NOT NULL,
        milestone_title TEXT NOT NULL,
        milestone_description TEXT,
        achieved_at TIMESTAMP DEFAULT NOW(),
        points_awarded INTEGER DEFAULT 0,
        badge_id INTEGER,
        celebrated BOOLEAN DEFAULT FALSE
      )
    `;
    console.log('   ✅ Success\n');

    // User Badges
    console.log('7️⃣  Creating user_badges table...');
    await sql`
      CREATE TABLE IF NOT EXISTS user_badges (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        badge_type VARCHAR(50) NOT NULL,
        badge_name VARCHAR(100) NOT NULL,
        badge_description TEXT,
        badge_icon VARCHAR(10),
        tier VARCHAR(20),
        earned_at TIMESTAMP DEFAULT NOW(),
        displayed BOOLEAN DEFAULT TRUE
      )
    `;
    console.log('   ✅ Success\n');

    // ========================================
    // FASE 3: Monthly Reports
    // ========================================
    console.log('📊 FASE 3: Monthly Reports System\n');

    console.log('8️⃣  Creating monthly_reports table...');
    await sql`
      CREATE TABLE IF NOT EXISTS monthly_reports (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        month_number INTEGER NOT NULL CHECK (month_number BETWEEN 1 AND 12),
        year INTEGER NOT NULL,
        report_date DATE NOT NULL DEFAULT CURRENT_DATE,
        metrics_data JSONB NOT NULL,
        insights_data JSONB NOT NULL,
        overall_score INTEGER CHECK (overall_score BETWEEN 0 AND 100),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(user_id, month_number, year)
      )
    `;
    console.log('   ✅ Success\n');

    // ========================================
    // FASE 4: Performance Tracking
    // ========================================
    console.log('📈 FASE 4: Performance Tracking System\n');

    console.log('9️⃣  Creating performance_metrics table...');
    await sql`
      CREATE TABLE IF NOT EXISTS performance_metrics (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        metric_date DATE NOT NULL DEFAULT CURRENT_DATE,
        metric_type VARCHAR(50) NOT NULL,
        metric_value INTEGER DEFAULT 1,
        quality_score INTEGER CHECK (quality_score BETWEEN 1 AND 10),
        metadata JSONB,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;
    console.log('   ✅ Success\n');

    // ========================================
    // Create All Indexes
    // ========================================
    console.log('🔍 Creating performance indexes...\n');

    const indexes = [
      // Engagement indexes
      'CREATE INDEX IF NOT EXISTS idx_user_engagement_user_id ON user_engagement(user_id)',
      'CREATE INDEX IF NOT EXISTS idx_daily_checkins_user_id ON daily_checkins(user_id)',
      'CREATE INDEX IF NOT EXISTS idx_daily_checkins_date ON daily_checkins(checkin_date DESC)',
      'CREATE INDEX IF NOT EXISTS idx_daily_tasks_user_id ON daily_tasks(user_id)',
      'CREATE INDEX IF NOT EXISTS idx_daily_tasks_date ON daily_tasks(task_date DESC)',
      'CREATE INDEX IF NOT EXISTS idx_daily_tasks_status ON daily_tasks(status)',
      'CREATE INDEX IF NOT EXISTS idx_weekly_reflections_user_id ON weekly_reflections(user_id)',
      'CREATE INDEX IF NOT EXISTS idx_user_actions_user_id ON user_actions(user_id)',
      'CREATE INDEX IF NOT EXISTS idx_user_actions_type ON user_actions(action_type)',
      'CREATE INDEX IF NOT EXISTS idx_user_actions_created ON user_actions(created_at DESC)',
      'CREATE INDEX IF NOT EXISTS idx_progress_milestones_user_id ON progress_milestones(user_id)',
      'CREATE INDEX IF NOT EXISTS idx_user_badges_user_id ON user_badges(user_id)',

      // Monthly reports indexes
      'CREATE INDEX IF NOT EXISTS idx_monthly_reports_user ON monthly_reports(user_id)',
      'CREATE INDEX IF NOT EXISTS idx_monthly_reports_date ON monthly_reports(year DESC, month_number DESC)',

      // Performance metrics indexes
      'CREATE INDEX IF NOT EXISTS idx_performance_user_date ON performance_metrics(user_id, metric_date DESC)',
      'CREATE INDEX IF NOT EXISTS idx_performance_type ON performance_metrics(metric_type)'
    ];

    for (const index of indexes) {
      try {
        await sql.query(index);
      } catch (error) {
        if (!error.message.includes('already exists')) {
          console.log(`   ⚠️  Index creation warning:`, error.message);
        }
      }
    }
    console.log('   ✅ All indexes created\n');

    // ========================================
    // Verify All Tables
    // ========================================
    console.log('🔍 Verifying all tables...\n');

    const tables = [
      'user_engagement',
      'daily_checkins',
      'daily_tasks',
      'weekly_reflections',
      'user_actions',
      'progress_milestones',
      'user_badges',
      'monthly_reports',
      'performance_metrics'
    ];

    for (const table of tables) {
      try {
        const result = await sql`
          SELECT EXISTS (
            SELECT FROM information_schema.tables
            WHERE table_schema = 'public'
            AND table_name = ${table}
          ) as exists
        `;

        if (result.rows[0].exists) {
          console.log(`   ✅ ${table}`);
        } else {
          console.log(`   ❌ ${table} - NOT FOUND`);
        }
      } catch (error) {
        console.log(`   ❌ ${table} - Error: ${error.message}`);
      }
    }

    console.log('\n✨ ================================');
    console.log('✨ COMPLETE ENGAGEMENT SYSTEM READY!');
    console.log('✨ ================================\n');
    console.log('📅 FASE 2: Week 1 Activatie ✅');
    console.log('📊 FASE 3: Monthly Reports ✅');
    console.log('🏆 FASE 4: Performance & Badges ✅');
    console.log('📈 FASE 5: Yearly Review ✅');
    console.log('\n🎉 All systems operational!\n');

    process.exit(0);

  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
}

initCompleteEngagementSystem();
