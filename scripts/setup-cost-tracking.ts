/**
 * Setup AI Cost Tracking Database Schema
 * Run: npx tsx scripts/setup-cost-tracking.ts
 */

import { config } from 'dotenv';
import { sql } from '@vercel/postgres';

// Load environment variables
config({ path: '.env.local' });

async function setupCostTracking() {
  console.log('💰 Setting up AI cost tracking schema...\n');

  try {
    // Create ai_cost_tracking table
    console.log('📊 Creating ai_cost_tracking table...');
    await sql`
      CREATE TABLE IF NOT EXISTS ai_cost_tracking (
        id SERIAL PRIMARY KEY,
        service VARCHAR(100) NOT NULL,
        operation VARCHAR(200) NOT NULL,
        cost DECIMAL(10,6) NOT NULL DEFAULT 0,
        tokens INTEGER,
        user_id INTEGER REFERENCES users(id),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('✅ ai_cost_tracking table created\n');

    // Create indexes
    console.log('🔍 Creating indexes for ai_cost_tracking...');
    await sql`CREATE INDEX IF NOT EXISTS idx_ai_cost_tracking_service ON ai_cost_tracking(service)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_ai_cost_tracking_user_id ON ai_cost_tracking(user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_ai_cost_tracking_created_at ON ai_cost_tracking(created_at)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_ai_cost_tracking_service_created_at ON ai_cost_tracking(service, created_at)`;
    console.log('✅ Indexes created\n');

    // Add comment to table
    await sql`COMMENT ON TABLE ai_cost_tracking IS 'Tracks AI service usage and costs for monitoring and billing purposes'`;
    await sql`COMMENT ON COLUMN ai_cost_tracking.service IS 'AI service provider (openrouter, google-gemini, etc.)'`;
    await sql`COMMENT ON COLUMN ai_cost_tracking.operation IS 'Specific operation performed (chat_completion, image_analysis, etc.)'`;
    await sql`COMMENT ON COLUMN ai_cost_tracking.cost IS 'Cost in euros for this operation'`;
    await sql`COMMENT ON COLUMN ai_cost_tracking.tokens IS 'Number of tokens used (for text-based models)'`;
    await sql`COMMENT ON COLUMN ai_cost_tracking.user_id IS 'User who triggered this operation (nullable for system operations)'`;

    // Verify table creation
    console.log('🔍 Verifying table creation...');
    const result = await sql`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_name = 'ai_cost_tracking'
    `;

    if (result.rows.length > 0) {
      console.log('✅ ai_cost_tracking table verified\n');
    } else {
      throw new Error('Table creation failed');
    }

    console.log('🎉 AI COST TRACKING SCHEMA SETUP COMPLETE!\n');
    console.log('💰 Database is ready for AI cost monitoring.\n');

  } catch (error) {
    console.error('\n❌ Error setting up cost tracking schema:', error);
    throw error;
  }
}

// Run the setup
setupCostTracking()
  .then(() => {
    console.log('✅ Setup finished successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Setup failed:', error);
    process.exit(1);
  });