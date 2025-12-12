/**
 * Migration: Create day_zero_progress table
 *
 * This table stores the magical Dag 0 onboarding ritual data:
 * - Vision statement (ideale dating leven over 3 maanden)
 * - Commitment level (1-10 slider)
 * - Commitment checklist (dagelijks 15-20 min, eerlijk, oefeningen uitvoeren)
 * - First impression notes
 */

import { config } from 'dotenv';
import { sql } from '@vercel/postgres';

// Load environment variables
config({ path: '.env.local' });

async function migrate() {
  try {
    console.log('🚀 Starting migration: Create day_zero_progress table...\n');

    // Create day_zero_progress table
    await sql`
      CREATE TABLE IF NOT EXISTS day_zero_progress (
        id SERIAL PRIMARY KEY,
        user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        completed BOOLEAN DEFAULT FALSE,

        -- Step 1: Vision Setting
        vision_statement TEXT,

        -- Step 2: Journey Preview (no data stored, just shown)

        -- Step 3: Commitment Ceremony
        commitment_level INT CHECK (commitment_level BETWEEN 1 AND 10),
        commitment_checklist JSONB, -- { "daily_time": true, "honest_reflections": true, "do_exercises": true }

        -- Step 4: First Step Ritual
        first_impression_notes TEXT,

        -- Timestamps
        completed_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),

        -- Ensure one record per user
        UNIQUE(user_id)
      )
    `;

    console.log('✅ Table day_zero_progress created successfully!');

    // Create index for faster user lookups
    await sql`
      CREATE INDEX IF NOT EXISTS idx_day_zero_user
      ON day_zero_progress(user_id)
    `;

    console.log('✅ Index idx_day_zero_user created successfully!');

    console.log('\n🎉 Migration completed successfully!');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    // Close the connection
    process.exit(0);
  }
}

migrate();
