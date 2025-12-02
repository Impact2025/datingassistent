import { sql } from '@vercel/postgres';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function migrateOnboardingTables() {
  console.log('🚀 Starting onboarding tables migration...\n');

  try {
    // Test connection first
    await sql`SELECT 1 as test`;
    console.log('✅ Database connection successful\n');

    // Create user_onboarding table
    console.log('📦 Creating user_onboarding table...');
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
    console.log('✅ user_onboarding table created\n');

    // Create indexes for user_onboarding
    console.log('📦 Creating indexes for user_onboarding...');
    await sql`CREATE INDEX IF NOT EXISTS idx_user_onboarding_user_id ON user_onboarding(user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_user_onboarding_current_step ON user_onboarding(current_step)`;
    console.log('✅ Indexes created\n');

    // Create user_achievements table
    console.log('📦 Creating user_achievements table...');
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
    console.log('✅ user_achievements table created\n');

    // Create indexes for user_achievements
    console.log('📦 Creating indexes for user_achievements...');
    await sql`CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON user_achievements(user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_user_achievements_achievement_id ON user_achievements(achievement_id)`;
    console.log('✅ Indexes created\n');

    // Create user_progress table
    console.log('📦 Creating user_progress table...');
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
    console.log('✅ user_progress table created\n');

    // Create index for user_progress
    console.log('📦 Creating indexes for user_progress...');
    await sql`CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON user_progress(user_id)`;
    console.log('✅ Indexes created\n');

    // Create update trigger function
    console.log('📦 Creating update trigger function...');
    await sql`
      CREATE OR REPLACE FUNCTION update_onboarding_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = NOW();
          RETURN NEW;
      END;
      $$ language 'plpgsql'
    `;
    console.log('✅ Trigger function created\n');

    console.log('\n🎉 Migration completed successfully!');
    console.log('\nTables created:');
    console.log('  - user_onboarding');
    console.log('  - user_achievements');
    console.log('  - user_progress');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }

  process.exit(0);
}

migrateOnboardingTables();
