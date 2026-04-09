import { sql } from '@vercel/postgres';
import * as dotenv from 'dotenv';
import { logger } from '@/lib/logger';

// Load environment variables
dotenv.config();

async function migrateOnboardingTables() {
  logger.log('🚀 Starting onboarding tables migration...\n');

  try {
    // Test connection first
    await sql`SELECT 1 as test`;
    logger.log('✅ Database connection successful\n');

    // Create user_onboarding table
    logger.log('📦 Creating user_onboarding table...');
    await sql`
      CREATE TABLE IF NOT EXISTS user_onboarding (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE UNIQUE NOT NULL,
        program_id INTEGER,

        -- Progress tracking
        current_step VARCHAR(50) DEFAULT 'welcome',
        started_at TIMESTAMP DEFAULT NOW(),
        completed_at TIMESTAMP,

        -- Intake antwoorden
        primary_goal TEXT,
        biggest_challenge VARCHAR(100),
        experience_level INTEGER,

        -- Afgeleide voorkeuren
        recommended_path VARCHAR(50),
        priority_tools TEXT[],
        iris_personality VARCHAR(50) DEFAULT 'supportive',

        -- Engagement tracking
        first_tool_used VARCHAR(100),
        first_tool_completed_at TIMESTAMP,

        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `;
    logger.log('✅ user_onboarding table created\n');

    // Create indexes for user_onboarding
    logger.log('📦 Creating indexes for user_onboarding...');
    await sql`CREATE INDEX IF NOT EXISTS idx_user_onboarding_user_id ON user_onboarding(user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_user_onboarding_current_step ON user_onboarding(current_step)`;
    logger.log('✅ Indexes created\n');

    // Create user_achievements table
    logger.log('📦 Creating user_achievements table...');
    await sql`
      CREATE TABLE IF NOT EXISTS user_achievements (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        achievement_id VARCHAR(100) NOT NULL,
        earned_at TIMESTAMP DEFAULT NOW(),
        xp_awarded INTEGER DEFAULT 0,

        UNIQUE(user_id, achievement_id)
      )
    `;
    logger.log('✅ user_achievements table created\n');

    // Create indexes for user_achievements
    logger.log('📦 Creating indexes for user_achievements...');
    await sql`CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON user_achievements(user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_user_achievements_achievement_id ON user_achievements(achievement_id)`;
    logger.log('✅ Indexes created\n');

    // Create user_progress table
    logger.log('📦 Creating user_progress table...');
    await sql`
      CREATE TABLE IF NOT EXISTS user_progress (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE UNIQUE NOT NULL,
        total_xp INTEGER DEFAULT 0,
        current_level INTEGER DEFAULT 1,
        current_streak INTEGER DEFAULT 0,
        longest_streak INTEGER DEFAULT 0,
        last_activity_date DATE,

        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `;
    logger.log('✅ user_progress table created\n');

    // Create index for user_progress
    logger.log('📦 Creating indexes for user_progress...');
    await sql`CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON user_progress(user_id)`;
    logger.log('✅ Indexes created\n');

    // Create update trigger function
    logger.log('📦 Creating update trigger function...');
    await sql`
      CREATE OR REPLACE FUNCTION update_onboarding_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = NOW();
          RETURN NEW;
      END;
      $$ language 'plpgsql'
    `;
    logger.log('✅ Trigger function created\n');

    logger.log('\n🎉 Migration completed successfully!');
    logger.log('\nTables created:');
    logger.log('  - user_onboarding');
    logger.log('  - user_achievements');
    logger.log('  - user_progress');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }

  process.exit(0);
}

migrateOnboardingTables();
