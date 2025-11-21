// Show complete database structure
require('dotenv').config({ path: '.env.local' });
const { sql } = require('@vercel/postgres');

async function showDatabaseStructure() {
  try {
    console.log('📊 DATABASE STRUCTURE OVERVIEW\n');
    console.log('═══════════════════════════════════════════════════════\n');

    // Get all tables
    const tables = await sql`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `;

    console.log(`Found ${tables.rows.length} tables:\n`);

    for (const table of tables.rows) {
      const tableName = table.table_name;
      console.log(`\n📋 TABLE: ${tableName.toUpperCase()}`);
      console.log('─'.repeat(60));

      // Get columns for this table
      const columns = await sql`
        SELECT
          column_name,
          data_type,
          character_maximum_length,
          is_nullable,
          column_default
        FROM information_schema.columns
        WHERE table_name = ${tableName}
        ORDER BY ordinal_position
      `;

      // Get row count
      const count = await sql.query(`SELECT COUNT(*) as count FROM ${tableName}`);
      console.log(`Rows: ${count.rows[0].count}\n`);

      console.log('Columns:');
      for (const col of columns.rows) {
        const nullable = col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL';
        const type = col.character_maximum_length
          ? `${col.data_type}(${col.character_maximum_length})`
          : col.data_type;
        const defaultVal = col.column_default ? ` DEFAULT ${col.column_default}` : '';
        console.log(`  - ${col.column_name}: ${type} ${nullable}${defaultVal}`);
      }
    }

    console.log('\n═══════════════════════════════════════════════════════\n');

    // Show some sample data
    console.log('📊 SAMPLE DATA:\n');

    // Users
    const users = await sql`SELECT id, email, display_name, role, created_at FROM users LIMIT 3`;
    console.log('USERS (sample):');
    users.rows.forEach(u => {
      console.log(`  - ID ${u.id}: ${u.email} (${u.role || 'user'}) - ${u.display_name || 'N/A'}`);
    });

    // Courses
    const courses = await sql`SELECT id, title, is_free, is_published FROM courses LIMIT 5`;
    console.log('\nCOURSES (sample):');
    courses.rows.forEach(c => {
      console.log(`  - ID ${c.id}: ${c.title} (${c.is_free ? 'FREE' : 'PAID'}) ${c.is_published ? '✅' : '❌'}`);
    });

    // Course progress
    const progress = await sql`
      SELECT cp.*, u.email, c.title
      FROM course_progress cp
      LEFT JOIN users u ON cp.user_id = u.id
      LEFT JOIN courses c ON cp.course_id = c.id
      LIMIT 5
    `;
    console.log('\nCOURSE PROGRESS (sample):');
    if (progress.rows.length > 0) {
      progress.rows.forEach(p => {
        console.log(`  - User: ${p.email} | Course: ${p.title} | Progress: ${p.progress_percentage}%`);
      });
    } else {
      console.log('  No progress data yet');
    }

    console.log('\n═══════════════════════════════════════════════════════\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

showDatabaseStructure();
