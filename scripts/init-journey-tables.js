/**
 * Initialize Journey System Tables
 *
 * Creates all necessary tables for the onboarding journey system:
 * - user_journey_progress
 * - personality_scans
 * - goal_hierarchies
 * - in_app_notifications
 */

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const { sql } = require('@vercel/postgres');
const fs = require('fs');
const path = require('path');

async function initJourneyTables() {
  try {
    console.log('🚀 Starting journey system table initialization...\n');

    console.log('1️⃣  Creating user_journey_progress table...');
    await sql`
      CREATE TABLE IF NOT EXISTS user_journey_progress (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        current_step VARCHAR(50) NOT NULL DEFAULT 'welcome',
        completed_steps JSONB DEFAULT '[]'::jsonb,
        journey_started_at TIMESTAMP DEFAULT NOW(),
        journey_completed_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(user_id)
      )
    `;
    console.log('   ✅ Success\n');

    console.log('2️⃣  Creating personality_scans table...');
    await sql`
      CREATE TABLE IF NOT EXISTS personality_scans (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        scan_version VARCHAR(20) DEFAULT 'v1.0',
        current_situation TEXT,
        comfort_level INTEGER,
        main_challenge TEXT,
        desired_outcome TEXT,
        strength_self TEXT,
        weakness_self TEXT,
        weekly_commitment VARCHAR(50),
        ai_generated_profile JSONB,
        completed_at TIMESTAMP DEFAULT NOW(),
        created_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(user_id)
      )
    `;
    console.log('   ✅ Success\n');

    console.log('3️⃣  Creating goal_hierarchies table...');
    try {
      await sql`
        CREATE TABLE IF NOT EXISTS goal_hierarchies (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          goal_type VARCHAR(20) NOT NULL CHECK (goal_type IN ('year', 'month', 'week')),
          title TEXT NOT NULL,
          description TEXT,
          category VARCHAR(50),
          status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'archived')),
          parent_goal_id INTEGER REFERENCES goal_hierarchies(id) ON DELETE CASCADE,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW(),
          completed_at TIMESTAMP
        )
      `;
      console.log('   ✅ Success\n');
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log('   ℹ️  Already exists (skipped)\n');
      } else {
        throw error;
      }
    }

    console.log('4️⃣  Creating in_app_notifications table...');
    await sql`
      CREATE TABLE IF NOT EXISTS in_app_notifications (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        type VARCHAR(50) DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error', 'achievement')),
        action_url TEXT,
        action_text VARCHAR(100),
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT NOW(),
        expires_at TIMESTAMP,
        read_at TIMESTAMP
      )
    `;
    console.log('   ✅ Success\n');

    console.log('5️⃣  Creating indexes...');
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_user_journey_progress_user_id ON user_journey_progress(user_id)',
      'CREATE INDEX IF NOT EXISTS idx_user_journey_progress_current_step ON user_journey_progress(current_step)',
      'CREATE INDEX IF NOT EXISTS idx_personality_scans_user_id ON personality_scans(user_id)',
      'CREATE INDEX IF NOT EXISTS idx_goal_hierarchies_user_id ON goal_hierarchies(user_id)',
      'CREATE INDEX IF NOT EXISTS idx_goal_hierarchies_goal_type ON goal_hierarchies(goal_type)',
      'CREATE INDEX IF NOT EXISTS idx_goal_hierarchies_parent_goal_id ON goal_hierarchies(parent_goal_id)',
      'CREATE INDEX IF NOT EXISTS idx_in_app_notifications_user_id ON in_app_notifications(user_id)',
      'CREATE INDEX IF NOT EXISTS idx_in_app_notifications_is_read ON in_app_notifications(is_read)',
      'CREATE INDEX IF NOT EXISTS idx_in_app_notifications_created_at ON in_app_notifications(created_at DESC)',
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
    console.log('   ✅ Indexes created\n');

    console.log('✅ Journey system tables initialized successfully!\n');

    // Verify tables exist
    console.log('🔍 Verifying tables...\n');

    const tables = [
      'user_journey_progress',
      'personality_scans',
      'goal_hierarchies',
      'in_app_notifications'
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
        console.log(`   ❌ ${table} - Error checking: ${error.message}`);
      }
    }

    console.log('\n✨ Done!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
}

// Run the initialization
initJourneyTables();
