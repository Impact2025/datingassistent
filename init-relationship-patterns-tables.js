const { sql } = require('@vercel/postgres');
const fs = require('fs');

async function initRelationshipPatternsTables() {
  try {
    console.log('Reading SQL file...');
    const sqlContent = fs.readFileSync('create-relationship-patterns-tables.sql', 'utf8');

    console.log('Executing SQL statements...');
    await sql.unsafe(sqlContent);

    console.log('✅ Relationship patterns tables initialized successfully!');
  } catch (error) {
    console.error('❌ Error initializing relationship patterns tables:', error);
  } finally {
    process.exit(0);
  }
}

initRelationshipPatternsTables();