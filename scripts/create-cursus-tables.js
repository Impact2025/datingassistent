// Script to create cursus tables
const { sql } = require('@vercel/postgres');
const fs = require('fs');
const path = require('path');

async function createCursusTables() {
  try {
    console.log('Creating cursus tables...');

    // Read the schema file
    const schemaPath = path.join(__dirname, '..', 'sql', 'cursus_answers_storage_schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    // Split the schema into individual statements
    const statements = schema
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    // Execute each statement
    for (const statement of statements) {
      if (statement.trim()) {
        console.log('Executing:', statement.substring(0, 50) + '...');
        await sql.unsafe(statement);
      }
    }

    console.log('✅ Cursus tables created successfully!');

    // Also create the Module 1 Pro schema
    console.log('Creating Module 1 Pro schema...');
    const module1SchemaPath = path.join(__dirname, '..', 'sql', 'module1-pro-schema-update.sql');
    const module1Schema = fs.readFileSync(module1SchemaPath, 'utf8');

    const module1Statements = module1Schema
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    for (const statement of module1Statements) {
      if (statement.trim()) {
        console.log('Executing Module 1:', statement.substring(0, 50) + '...');
        await sql.unsafe(statement);
      }
    }

    console.log('✅ Module 1 Pro schema created successfully!');

  } catch (error) {
    console.error('❌ Error creating tables:', error);
    process.exit(1);
  }
}

createCursusTables();