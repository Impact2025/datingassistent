// Script to run the Module 3 Profieltekst database migration
require('dotenv').config({ path: '.env.local' });
const { sql } = require('@vercel/postgres');
const fs = require('fs');
const path = require('path');

async function runModule3Migration() {
  try {
    console.log('🚀 Starting Module 3 Profieltekst database migration...');
    console.log('📚 Module: Profieltekst die wel werkt (A.C.T.I.E. Model)\n');

    // Read the SQL migration file
    const migrationPath = path.join(__dirname, 'add-module3-profieltekst-fields.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    console.log('📄 SQL migration file loaded successfully');
    console.log('📊 Executing migration...\n');

    // Split the SQL into individual statements
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    console.log(`📝 Found ${statements.length} SQL statements to execute\n`);

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (!statement) continue;

      try {
        console.log(`⚡ Executing statement ${i + 1}/${statements.length}...`);
        await sql.unsafe(statement + ';');
        console.log(`   ✅ Statement ${i + 1} completed`);
      } catch (stmtError) {
        // Check if it's an "already exists" error, which is okay
        if (stmtError.message.includes('already exists') ||
            stmtError.message.includes('duplicate') ||
            stmtError.code === '42701') { // duplicate column
          console.log(`   ⚠️  Statement ${i + 1} skipped (already exists)`);
        } else {
          throw stmtError;
        }
      }
    }

    console.log('\n🎉 Module 3 Profieltekst database migration completed!');
    console.log('📊 New fields added to gebruiker_profielen table:');
    console.log('   • profieltekst_kernkrachten_validatie (BOOLEAN)');
    console.log('   • profieltekst_cliché_score (INTEGER 0-10)');
    console.log('   • trigger_zin_kwaliteit_score (INTEGER 1-5)');
    console.log('   • profieltekst_proof_count (INTEGER 0-3)');
    console.log('   • profieltekst_hechtings_audit (ENUM)');
    console.log('   • module3_completed_at (TIMESTAMP)');
    console.log('   • module3_last_updated (TIMESTAMP)');
    console.log('\n📋 New table created: profieltekst_proofs');
    console.log('   • Stores detailed claim-to-proof pairs from Les 3.4');

    // Verify the migration
    console.log('\n🔍 Verifying migration...');
    const result = await sql`
      SELECT
        column_name,
        data_type,
        is_nullable
      FROM information_schema.columns
      WHERE table_name = 'gebruiker_profielen'
        AND column_name LIKE 'profieltekst_%'
      ORDER BY column_name
    `;

    console.log(`✅ Found ${result.rows.length} new Module 3 columns:`);
    result.rows.forEach(row => {
      console.log(`   • ${row.column_name} (${row.data_type}, ${row.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
    });

    // Check if the proofs table was created
    const proofsTable = await sql`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_name = 'profieltekst_proofs'
    `;

    if (proofsTable.rows.length > 0) {
      console.log('✅ profieltekst_proofs table created successfully');
    } else {
      console.log('⚠️  profieltekst_proofs table was not created');
    }

    console.log('\n🎯 Module 3 is now ready for frontend implementation!');
    console.log('📚 Next steps:');
    console.log('   1. Implement the 5 lesson components');
    console.log('   2. Create AI integration services');
    console.log('   3. Add API routes for data persistence');
    console.log('   4. Test the complete A.C.T.I.E. flow');

    process.exit(0);
  } catch (error) {
    console.error('💥 Module 3 migration failed:', error);
    console.error('\n🔧 Troubleshooting:');
    console.error('   • Check your database connection in .env.local');
    console.error('   • Ensure you have the necessary permissions');
    console.error('   • Some columns might already exist (check with show-database-structure.js)');
    process.exit(1);
  }
}

runModule3Migration();