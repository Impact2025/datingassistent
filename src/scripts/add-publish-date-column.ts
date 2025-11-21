import { sql } from '@vercel/postgres';

/**
 * Migration script to add publish_date column to blogs table
 * Run this script to add the new column for custom publish dates
 */
async function addPublishDateColumn() {
  try {
    console.log('Adding publish_date column to blogs table...');

    // Add publish_date column if it doesn't exist
    await sql`
      ALTER TABLE blogs
      ADD COLUMN IF NOT EXISTS publish_date DATE;
    `;

    console.log('✅ Successfully added publish_date column to blogs table');

    // Show current table structure
    const result = await sql`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'blogs'
      ORDER BY ordinal_position;
    `;

    console.log('\nCurrent blogs table structure:');
    console.table(result.rows);

    return { success: true };
  } catch (error) {
    console.error('❌ Error adding publish_date column:', error);
    throw error;
  } finally {
    process.exit();
  }
}

// Run the migration
addPublishDateColumn();
