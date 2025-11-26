const { query } = require('../src/lib/db');
const fs = require('fs');
const path = require('path');

async function createWaardenKompasTables() {
  try {
    console.log('Creating Waarden Kompas tables...');

    // Read the SQL file
    const sqlPath = path.join(__dirname, '..', 'sql', 'waarden_kompas_schema.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');

    // Split into individual statements (basic approach)
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    // Execute each statement
    for (const statement of statements) {
      if (statement.trim()) {
        try {
          await query(statement);
          console.log('✓ Executed statement');
        } catch (error) {
          // Ignore "already exists" errors
          if (!error.message.includes('already exists')) {
            console.error('Error executing statement:', statement.substring(0, 100) + '...');
            console.error(error.message);
          } else {
            console.log('✓ Table already exists, skipping');
          }
        }
      }
    }

    console.log('Waarden Kompas tables created successfully!');
  } catch (error) {
    console.error('Error creating Waarden Kompas tables:', error);
    process.exit(1);
  }
}

createWaardenKompasTables();