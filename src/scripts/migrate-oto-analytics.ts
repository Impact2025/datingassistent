/**
 * Migration: Create OTO Analytics Table
 *
 * Run with: npx tsx src/scripts/migrate-oto-analytics.ts
 */

import { sql } from '@vercel/postgres';

async function migrate() {
  console.log('🚀 Creating OTO Analytics table...');

  try {
    // Create oto_analytics table
    await sql`
      CREATE TABLE IF NOT EXISTS oto_analytics (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        event_type VARCHAR(50) NOT NULL,
        oto_product VARCHAR(50),
        photo_score DECIMAL(3,1),
        session_id VARCHAR(100),
        source VARCHAR(50) DEFAULT 'direct',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

        -- Indexes for analytics queries
        CONSTRAINT valid_event_type CHECK (event_type IN (
          'oto_shown',
          'oto_accepted',
          'oto_declined',
          'downsell_shown',
          'downsell_accepted',
          'downsell_declined'
        )),
        CONSTRAINT valid_oto_product CHECK (oto_product IS NULL OR oto_product IN (
          'transformatie',
          'kickstart'
        ))
      )
    `;

    // Create indexes for fast analytics queries
    await sql`
      CREATE INDEX IF NOT EXISTS idx_oto_analytics_user_id ON oto_analytics(user_id)
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS idx_oto_analytics_event_type ON oto_analytics(event_type)
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS idx_oto_analytics_created_at ON oto_analytics(created_at)
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS idx_oto_analytics_product ON oto_analytics(oto_product)
    `;

    console.log('✅ OTO Analytics table created successfully!');

    // Verify table
    const result = await sql`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'oto_analytics'
      ORDER BY ordinal_position
    `;

    console.log('\n📋 Table structure:');
    result.rows.forEach(row => {
      console.log(`  - ${row.column_name}: ${row.data_type}`);
    });

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

migrate();
