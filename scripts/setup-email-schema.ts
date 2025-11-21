/**
 * Setup Email Engagement Database Schema
 * Run: npx tsx scripts/setup-email-schema.ts
 */

import { config } from 'dotenv';
import { sql } from '@vercel/postgres';

// Load environment variables
config({ path: '.env.local' });

async function setupEmailSchema() {
  console.log('🚀 Starting email engagement schema setup...\n');

  try {
    // 1. Create email_tracking table
    console.log('📊 Creating email_tracking table...');
    await sql`
      CREATE TABLE IF NOT EXISTS email_tracking (
        id SERIAL PRIMARY KEY,
        user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,

        email_type VARCHAR(50) NOT NULL,
        email_category VARCHAR(30) NOT NULL,
        template_id INT,

        sent_at TIMESTAMP NOT NULL DEFAULT NOW(),
        opened_at TIMESTAMP,
        clicked_at TIMESTAMP,
        converted_at TIMESTAMP,
        unsubscribed_at TIMESTAMP,
        bounced_at TIMESTAMP,

        variant VARCHAR(10) DEFAULT 'A',
        test_group VARCHAR(50),

        subject_line TEXT,
        cta_clicked VARCHAR(100),
        conversion_type VARCHAR(50),
        conversion_value DECIMAL(10, 2),

        metadata JSONB,
        user_tier VARCHAR(20),

        delivery_status VARCHAR(20) DEFAULT 'sent',
        error_message TEXT,

        created_at TIMESTAMP DEFAULT NOW()
      )
    `;
    console.log('✅ email_tracking table created\n');

    // 2. Create indexes for email_tracking
    console.log('🔍 Creating indexes for email_tracking...');
    await sql`CREATE INDEX IF NOT EXISTS idx_email_tracking_user ON email_tracking(user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_email_tracking_type ON email_tracking(email_type)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_email_tracking_sent ON email_tracking(sent_at DESC)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_email_tracking_category ON email_tracking(email_category)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_email_tracking_conversion ON email_tracking(converted_at)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_tracking_user_type_sent ON email_tracking(user_id, email_type, sent_at DESC)`;
    console.log('✅ Indexes created\n');

    // 3. Create email_preferences table
    console.log('⚙️ Creating email_preferences table...');
    await sql`
      CREATE TABLE IF NOT EXISTS email_preferences (
        user_id INT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,

        onboarding_emails BOOLEAN DEFAULT true,
        engagement_emails BOOLEAN DEFAULT true,
        educational_emails BOOLEAN DEFAULT true,
        marketing_emails BOOLEAN DEFAULT true,
        milestone_emails BOOLEAN DEFAULT true,
        digest_emails BOOLEAN DEFAULT true,

        disabled_email_types TEXT[],

        frequency VARCHAR(20) DEFAULT 'normal',
        max_emails_per_week INT DEFAULT 5,

        digest_day VARCHAR(10) DEFAULT 'monday',
        digest_time TIME DEFAULT '08:00:00',

        unsubscribed_all BOOLEAN DEFAULT false,
        unsubscribed_at TIMESTAMP,
        unsubscribe_reason TEXT,

        last_email_sent_at TIMESTAMP,
        emails_sent_this_week INT DEFAULT 0,
        week_start DATE,

        timezone VARCHAR(50) DEFAULT 'Europe/Amsterdam',
        language VARCHAR(10) DEFAULT 'nl',

        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `;
    console.log('✅ email_preferences table created\n');

    // 4. Create email_queue table
    console.log('📬 Creating email_queue table...');
    await sql`
      CREATE TABLE IF NOT EXISTS email_queue (
        id SERIAL PRIMARY KEY,
        user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,

        email_type VARCHAR(50) NOT NULL,
        email_category VARCHAR(30) NOT NULL,
        template_id INT,

        scheduled_for TIMESTAMP NOT NULL,
        priority INT DEFAULT 5,

        status VARCHAR(20) DEFAULT 'pending',
        attempts INT DEFAULT 0,
        max_attempts INT DEFAULT 3,
        last_attempt_at TIMESTAMP,

        error_message TEXT,
        error_count INT DEFAULT 0,

        email_data JSONB,
        metadata JSONB,

        dedup_key VARCHAR(100) UNIQUE,

        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        processed_at TIMESTAMP
      )
    `;
    console.log('✅ email_queue table created\n');

    // 5. Create indexes for email_queue
    console.log('🔍 Creating indexes for email_queue...');
    await sql`CREATE INDEX IF NOT EXISTS idx_email_queue_scheduled ON email_queue(scheduled_for)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_email_queue_status ON email_queue(status)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_email_queue_user ON email_queue(user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_email_queue_status_scheduled ON email_queue(status, scheduled_for) WHERE status IN ('pending', 'processing')`;
    console.log('✅ Indexes created\n');

    // 6. Create user_milestones table
    console.log('🏆 Creating user_milestones table...');
    await sql`
      CREATE TABLE IF NOT EXISTS user_milestones (
        id SERIAL PRIMARY KEY,
        user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,

        milestone_type VARCHAR(50) NOT NULL,
        milestone_category VARCHAR(30),

        achieved_at TIMESTAMP DEFAULT NOW(),
        milestone_value INT,

        email_sent BOOLEAN DEFAULT false,
        email_sent_at TIMESTAMP,

        reward_given BOOLEAN DEFAULT false,
        reward_type VARCHAR(50),
        reward_value INT,

        metadata JSONB,

        created_at TIMESTAMP DEFAULT NOW(),

        UNIQUE(user_id, milestone_type, milestone_value)
      )
    `;
    console.log('✅ user_milestones table created\n');

    // 7. Create indexes for user_milestones
    console.log('🔍 Creating indexes for user_milestones...');
    await sql`CREATE INDEX IF NOT EXISTS idx_user_milestones_user ON user_milestones(user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_user_milestones_type ON user_milestones(milestone_type)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_milestones_unsent ON user_milestones(achieved_at) WHERE email_sent = false`;
    console.log('✅ Indexes created\n');

    // 8. Create user_engagement_scores table
    console.log('📈 Creating user_engagement_scores table...');
    await sql`
      CREATE TABLE IF NOT EXISTS user_engagement_scores (
        user_id INT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,

        engagement_score INT DEFAULT 0,
        activity_level VARCHAR(20) DEFAULT 'new',

        last_login_at TIMESTAMP,
        login_streak INT DEFAULT 0,
        total_logins INT DEFAULT 0,

        features_used INT DEFAULT 0,
        ai_messages_sent INT DEFAULT 0,
        courses_completed INT DEFAULT 0,

        email_open_rate DECIMAL(5, 2) DEFAULT 0.00,
        email_click_rate DECIMAL(5, 2) DEFAULT 0.00,
        last_email_opened_at TIMESTAMP,

        churn_risk VARCHAR(20) DEFAULT 'low',
        churn_score INT DEFAULT 0,
        days_inactive INT DEFAULT 0,

        upsell_score INT DEFAULT 0,
        feature_limit_hits INT DEFAULT 0,

        last_calculated_at TIMESTAMP DEFAULT NOW(),

        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `;
    console.log('✅ user_engagement_scores table created\n');

    // 9. Create indexes for user_engagement_scores
    console.log('🔍 Creating indexes for user_engagement_scores...');
    await sql`CREATE INDEX IF NOT EXISTS idx_engagement_level ON user_engagement_scores(activity_level)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_engagement_churn ON user_engagement_scores(churn_risk)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_engagement_score ON user_engagement_scores(engagement_score)`;
    console.log('✅ Indexes created\n');

    // 10. Create email_performance_summary view
    console.log('📊 Creating email_performance_summary view...');
    await sql`
      CREATE OR REPLACE VIEW email_performance_summary AS
      SELECT
        email_type,
        email_category,
        COUNT(*) as total_sent,
        COUNT(opened_at) as total_opened,
        COUNT(clicked_at) as total_clicked,
        COUNT(converted_at) as total_conversions,
        ROUND(COUNT(opened_at)::NUMERIC / NULLIF(COUNT(*), 0) * 100, 2) as open_rate,
        ROUND(COUNT(clicked_at)::NUMERIC / NULLIF(COUNT(*), 0) * 100, 2) as click_rate,
        ROUND(COUNT(converted_at)::NUMERIC / NULLIF(COUNT(*), 0) * 100, 2) as conversion_rate,
        SUM(conversion_value) as total_revenue
      FROM email_tracking
      WHERE sent_at >= CURRENT_DATE - INTERVAL '30 days'
      GROUP BY email_type, email_category
      ORDER BY total_sent DESC
    `;
    console.log('✅ View created\n');

    // 11. Initialize email preferences for existing users
    console.log('👥 Initializing email preferences for existing users...');
    const result = await sql`
      INSERT INTO email_preferences (user_id)
      SELECT id FROM users
      WHERE id NOT IN (SELECT user_id FROM email_preferences)
      ON CONFLICT (user_id) DO NOTHING
    `;
    console.log(`✅ Initialized preferences for ${result.rowCount} users\n`);

    // 12. Initialize engagement scores for existing users
    console.log('📈 Initializing engagement scores for existing users...');
    const result2 = await sql`
      INSERT INTO user_engagement_scores (user_id)
      SELECT id FROM users
      WHERE id NOT IN (SELECT user_id FROM user_engagement_scores)
      ON CONFLICT (user_id) DO NOTHING
    `;
    console.log(`✅ Initialized scores for ${result2.rowCount} users\n`);

    // 13. Verify tables
    console.log('🔍 Verifying tables...');
    const tables = await sql`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_name LIKE 'email%'
        OR table_name = 'user_milestones'
        OR table_name = 'user_engagement_scores'
      ORDER BY table_name
    `;

    console.log('\n📋 Created tables:');
    tables.rows.forEach((row: any) => {
      console.log(`   ✓ ${row.table_name}`);
    });

    console.log('\n✅ EMAIL ENGAGEMENT SCHEMA SETUP COMPLETE!\n');
    console.log('📊 Database is ready for email automation.\n');

  } catch (error) {
    console.error('\n❌ Error setting up schema:', error);
    throw error;
  }
}

// Run the setup
setupEmailSchema()
  .then(() => {
    console.log('🎉 Setup finished successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Setup failed:', error);
    process.exit(1);
  });
