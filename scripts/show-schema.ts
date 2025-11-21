import 'dotenv/config';
import { sql } from '@vercel/postgres';

async function showSchema() {
  // Get all tables
  const tables = await sql`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
    ORDER BY table_name
  `;

  console.log('📊 Current Neon Database Schema:\n');
  console.log('Tables:');
  tables.rows.forEach(t => console.log(`  - ${t.table_name}`));

  // Get columns for each table
  for (const table of tables.rows) {
    const columns = await sql`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = ${table.table_name}
      ORDER BY ordinal_position
    `;

    console.log(`\n${table.table_name} columns:`);
    columns.rows.forEach(c => {
      console.log(`  - ${c.column_name}: ${c.data_type}${c.is_nullable === 'NO' ? ' NOT NULL' : ''}`);
    });
  }
}

showSchema().then(() => process.exit(0)).catch(console.error);
