/**
 * Database Migration: Create coaching_profiles table
 * Run: node scripts/init-coaching-profiles.js
 */

const { sql } = require('@vercel/postgres');
const dotenv = require('dotenv');

dotenv.config({ path: '.env.local' });

async function main() {
  console.log('🚀 Starting coaching_profiles table creation...\n');

  try {
    // Create coaching_profiles table
    console.log('📊 Creating coaching_profiles table...');

    await sql`
      CREATE TABLE IF NOT EXISTS coaching_profiles (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,

        -- Personality & Assessment Data
        personality_type VARCHAR(100),
        comfort_level INTEGER DEFAULT 5 CHECK (comfort_level BETWEEN 1 AND 10),
        primary_goal VARCHAR(100),
        main_challenge VARCHAR(100),
        strengths JSONB DEFAULT '[]'::jsonb,
        growth_areas JSONB DEFAULT '[]'::jsonb,

        -- Journey Status
        current_phase VARCHAR(20) DEFAULT 'intake' CHECK (current_phase IN ('intake', 'foundation', 'skills', 'mastery', 'maintenance')),
        journey_day INTEGER DEFAULT 1,
        completed_steps JSONB DEFAULT '[]'::jsonb,
        active_goals JSONB DEFAULT '[]'::jsonb,

        -- Coach Recommendations
        recommended_tools JSONB DEFAULT '[]'::jsonb,
        next_action TEXT,
        weekly_focus TEXT,
        coach_advice_given BOOLEAN DEFAULT FALSE,

        -- Progress & Engagement
        tools_used JSONB DEFAULT '{}'::jsonb,
        skill_levels JSONB DEFAULT '{}'::jsonb,
        badges JSONB DEFAULT '[]'::jsonb,
        current_streak INTEGER DEFAULT 0,
        longest_streak INTEGER DEFAULT 0,

        -- Personalization
        learning_style VARCHAR(20) DEFAULT 'mixed' CHECK (learning_style IN ('visual', 'hands-on', 'reading', 'mixed')),
        pace_preference VARCHAR(20) DEFAULT 'medium' CHECK (pace_preference IN ('slow', 'medium', 'fast')),
        time_commitment VARCHAR(20) DEFAULT '3-5h',

        -- Metadata
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_active_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        total_time_spent INTEGER DEFAULT 0,

        -- Indexes
        CONSTRAINT valid_comfort_level CHECK (comfort_level >= 1 AND comfort_level <= 10),
        CONSTRAINT valid_streaks CHECK (current_streak >= 0 AND longest_streak >= current_streak)
      )
    `;

    console.log('✅ coaching_profiles table created successfully\n');

    // Create indexes
    console.log('📊 Creating indexes...');

    await sql`CREATE INDEX IF NOT EXISTS idx_coaching_profiles_user_id ON coaching_profiles(user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_coaching_profiles_phase ON coaching_profiles(current_phase)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_coaching_profiles_journey_day ON coaching_profiles(journey_day)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_coaching_profiles_last_active ON coaching_profiles(last_active_at)`;

    console.log('✅ Indexes created successfully\n');

    // Create trigger for updated_at
    console.log('📊 Creating trigger for updated_at...');

    await sql`
      CREATE OR REPLACE FUNCTION update_coaching_profiles_updated_at()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql
    `;

    await sql`
      DROP TRIGGER IF EXISTS trigger_coaching_profiles_updated_at ON coaching_profiles
    `;

    await sql`
      CREATE TRIGGER trigger_coaching_profiles_updated_at
      BEFORE UPDATE ON coaching_profiles
      FOR EACH ROW
      EXECUTE FUNCTION update_coaching_profiles_updated_at()
    `;

    console.log('✅ Trigger created successfully\n');

    // Verify table creation
    console.log('🔍 Verifying table creation...');

    const verification = await sql`
      SELECT table_name, column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'coaching_profiles'
      ORDER BY ordinal_position
    `;

    console.log(`✅ Table verified with ${verification.rows.length} columns\n`);

    // Sample columns
    console.log('📋 Sample columns:');
    verification.rows.slice(0, 10).forEach(col => {
      console.log(`   - ${col.column_name}: ${col.data_type}`);
    });
    console.log(`   ... and ${verification.rows.length - 10} more columns\n`);

    console.log('🎉 Migration completed successfully!\n');
    console.log('Next steps:');
    console.log('1. Restart your dev server');
    console.log('2. Test the coaching profile endpoints');
    console.log('3. Verify personality scan integration\n');

  } catch (error) {
    console.error('❌ Error during migration:', error);
    console.error('\nIf you see "relation already exists", that\'s okay - the table is already created.');
    throw error;
  }
}

main()
  .then(() => {
    console.log('✅ Script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });
