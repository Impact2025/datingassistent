const { sql } = require('@vercel/postgres');
const fs = require('fs');
const path = require('path');

async function createDataRequestsTable() {
  try {
    console.log('🔄 Creating data requests table...');

    // Read the SQL file
    const sqlFile = path.join(__dirname, '..', 'sql', 'create-data-requests-table.sql');
    const sqlContent = fs.readFileSync(sqlFile, 'utf8');

    // Split into individual statements (basic approach)
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    // Execute each statement
    for (const statement of statements) {
      if (statement.trim()) {
        console.log(`Executing: ${statement.substring(0, 50)}...`);
        await sql.unsafe(statement);
      }
    }

    console.log('✅ Data requests table created successfully!');
  } catch (error) {
    console.error('❌ Error creating data requests table:', error);
    process.exit(1);
  }
}

createDataRequestsTable();