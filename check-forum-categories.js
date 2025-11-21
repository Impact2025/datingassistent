require('dotenv').config({ path: '.env.local' });
const { sql } = require('@vercel/postgres');

async function checkCategories() {
  try {
    console.log('🔍 Checking forum categories...\n');

    const categories = await sql`
      SELECT id, name, description
      FROM forum_categories
      ORDER BY id
    `;

    console.log('📋 Existing categories:');
    categories.rows.forEach(cat => {
      console.log(`  - ID ${cat.id}: ${cat.name}`);
      console.log(`    Description: ${cat.description || 'N/A'}`);
    });

    // Check if there's a Veiligheid/Red Flags category
    const veiligheid = categories.rows.find(c =>
      c.name.toLowerCase().includes('veiligheid') ||
      c.name.toLowerCase().includes('red flag')
    );

    if (veiligheid) {
      console.log(`\n✅ Found relevant category: ID ${veiligheid.id} - ${veiligheid.name}`);
    } else {
      console.log(`\n⚠️ No Veiligheid/Red Flags category found.`);
      console.log('We should use "Veiligheid & Privacy" category (ID should be visible above)');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkCategories();
