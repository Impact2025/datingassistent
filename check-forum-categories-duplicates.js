require('dotenv').config({ path: '.env.local' });
const { sql } = require('@vercel/postgres');

async function checkCategories() {
  try {
    console.log('🔍 Checking forum categories for duplicates...\n');

    const categories = await sql`
      SELECT id, name, description, color, sort_order
      FROM forum_categories
      ORDER BY sort_order, id
    `;

    console.log(`📋 Found ${categories.rows.length} categories:\n`);
    categories.rows.forEach(cat => {
      console.log(`  - ID ${cat.id}: ${cat.name} (sort_order: ${cat.sort_order})`);
    });

    // Check for duplicates by name
    const names = categories.rows.map(c => c.name);
    const uniqueNames = [...new Set(names)];

    if (names.length !== uniqueNames.length) {
      console.log(`\n⚠️ DUPLICATES FOUND! ${names.length} total, ${uniqueNames.length} unique`);

      // Find which names are duplicated
      const nameCounts = {};
      names.forEach(name => {
        nameCounts[name] = (nameCounts[name] || 0) + 1;
      });

      console.log('\nDuplicate names:');
      Object.entries(nameCounts).forEach(([name, count]) => {
        if (count > 1) {
          console.log(`  - "${name}": ${count} occurrences`);
          const duplicateIds = categories.rows
            .filter(c => c.name === name)
            .map(c => c.id);
          console.log(`    IDs: ${duplicateIds.join(', ')}`);
        }
      });
    } else {
      console.log('\n✅ No duplicates found');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkCategories();
