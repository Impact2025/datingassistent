require('dotenv').config({ path: '.env.local' });
const { sql } = require('@vercel/postgres');

async function removeDuplicates() {
  try {
    console.log('🗑️  Removing duplicate forum categories...\n');

    // Keep IDs 1-6 (the originals), delete IDs 7-18 (the duplicates)
    const duplicateIds = [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18];

    console.log(`Deleting ${duplicateIds.length} duplicate categories: ${duplicateIds.join(', ')}`);

    const result = await sql`
      DELETE FROM forum_categories
      WHERE id = ANY(${duplicateIds})
      RETURNING id, name
    `;

    console.log(`\n✅ Deleted ${result.rowCount} duplicate categories:`);
    result.rows.forEach(row => {
      console.log(`  - ID ${row.id}: ${row.name}`);
    });

    // Verify remaining categories
    const remaining = await sql`
      SELECT id, name, sort_order
      FROM forum_categories
      ORDER BY sort_order, id
    `;

    console.log(`\n📋 Remaining categories (${remaining.rowCount}):`);
    remaining.rows.forEach(cat => {
      console.log(`  - ID ${cat.id}: ${cat.name} (sort_order: ${cat.sort_order})`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

removeDuplicates();
