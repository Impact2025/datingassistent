/**
 * Create user_journey_progress table
 */

require('dotenv').config({ path: '.env.local' });
const { sql } = require('@vercel/postgres');

async function createJourneyTable() {
  try {
    console.log('🚀 Creating user_journey_progress table...\n');

    await sql`
      CREATE TABLE IF NOT EXISTS user_journey_progress (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        current_step VARCHAR(50) DEFAULT 'welcome',
        completed_steps JSONB DEFAULT '[]'::jsonb,
        journey_started_at TIMESTAMP DEFAULT NOW(),
        journey_completed_at TIMESTAMP,
        scan_data JSONB,
        dna_results JSONB,
        goals_data JSONB,
        profile_data JSONB,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(user_id)
      )
    `;

    console.log('✅ user_journey_progress table created!\n');

    // Verify
    const result = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'user_journey_progress'
      ) as exists
    `;

    if (result.rows[0].exists) {
      console.log('✅ Table verified successfully!\n');
    }

    // Create index
    await sql`
      CREATE INDEX IF NOT EXISTS idx_journey_user_id ON user_journey_progress(user_id)
    `;

    console.log('✅ Index created!\n');
    console.log('🎉 Journey table setup complete!\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

createJourneyTable();
