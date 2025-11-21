/**
 * Add AI context column to users table
 * This enables cross-tool memory and personalized AI experiences
 */

require('dotenv').config();
const { sql } = require('@vercel/postgres');

async function addAIContextColumn() {
  try {
    console.log('🔄 Adding ai_context column to users table...');

    // Check if column already exists
    const checkResult = await sql`
      SELECT column_name FROM information_schema.columns
      WHERE table_name = 'users' AND column_name = 'ai_context'
    `;

    if (checkResult.rows.length > 0) {
      console.log('✅ ai_context column already exists');
      return;
    }

    // Add the column
    await sql`
      ALTER TABLE users ADD COLUMN ai_context JSONB
    `;

    console.log('✅ ai_context column added successfully');

    // Create index for better performance
    await sql`
      CREATE INDEX IF NOT EXISTS idx_users_ai_context ON users USING GIN (ai_context)
    `;

    console.log('✅ Index created for ai_context column');

  } catch (error) {
    console.error('❌ Error adding ai_context column:', error);
    throw error;
  }
}

// Run the migration
addAIContextColumn()
  .then(() => {
    console.log('🎉 AI context migration completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Migration failed:', error);
    process.exit(1);
  });