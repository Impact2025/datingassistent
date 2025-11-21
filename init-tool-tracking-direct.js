/**
 * Direct Database Initialization for Tool Completion Tracking
 * Bypasses API authentication for initial setup
 */

const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');

// Load environment
require('dotenv').config({ path: '.env.local' });
require('dotenv').config({ path: '.env' });

async function initDatabase() {
  console.log('🚀 Initializing Tool Completion Tracking System...\n');

  const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;

  if (!databaseUrl) {
    console.error('❌ No DATABASE_URL or POSTGRES_URL found in environment');
    console.log('\n💡 Available env vars:');
    Object.keys(process.env)
      .filter(k => k.includes('DATA') || k.includes('POSTGRES'))
      .forEach(k => console.log(`   ${k}: ${process.env[k]?.substring(0, 30)}...`));
    process.exit(1);
  }

  console.log('✅ Found database URL');
  console.log(`   ${databaseUrl.substring(0, 50)}...\n`);

  const sql = neon(databaseUrl);

  try {
    // Read SQL schema
    const schemaPath = path.join(__dirname, 'sql', 'tool_completion_tracking_schema.sql');
    console.log(`📄 Reading schema: ${schemaPath}`);

    const schema = fs.readFileSync(schemaPath, 'utf8');
    console.log(`✅ Schema loaded (${schema.length} characters)\n`);

    // Execute schema by splitting on major SQL commands
    console.log('⚙️  Executing SQL schema...\n');

    // Split on CREATE, DROP, ALTER - but keep the command with the statement
    const statements = [];
    let current = '';

    const lines = schema.split('\n');
    for (const line of lines) {
      // Skip comments and empty lines
      if (line.trim().startsWith('--') || line.trim() === '') {
        continue;
      }

      // Start of a new statement?
      if (line.match(/^(CREATE|DROP|ALTER|INSERT|DELETE|COMMENT)/i)) {
        if (current.trim()) {
          statements.push(current.trim());
        }
        current = line + '\n';
      } else {
        current += line + '\n';
      }
    }

    // Add the last statement
    if (current.trim()) {
      statements.push(current.trim());
    }

    console.log(`Found ${statements.length} SQL statements\n`);

    let executed = 0;
    let skipped = 0;

    for (let i = 0; i < statements.length; i++) {
      const stmt = statements[i];
      const preview = stmt.substring(0, 70).replace(/\s+/g, ' ');

      try {
        process.stdout.write(`   [${i + 1}/${statements.length}] ${preview}... `);
        await sql(stmt);
        console.log('✓');
        executed++;
      } catch (error) {
        if (error.message.includes('already exists')) {
          console.log('⊙ (exists)');
          skipped++;
        } else {
          console.log(`✗ ${error.message.substring(0, 50)}`);
        }
      }
    }

    console.log(`\n✅ Executed: ${executed}, Skipped: ${skipped}\n`);

    // Verify what was created
    console.log('🔍 Verifying database objects...\n');

    // Check tables
    const tables = await sql`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name = 'tool_completions'
    `;

    if (tables.length > 0) {
      console.log('✅ Table: tool_completions');
    } else {
      console.log('❌ Table: tool_completions NOT FOUND');
    }

    // Check views
    const views = await sql`
      SELECT table_name
      FROM information_schema.views
      WHERE table_schema = 'public'
      AND table_name IN ('tool_progress', 'user_coaching_progress')
    `;

    views.forEach(v => {
      console.log(`✅ View: ${v.table_name}`);
    });

    // Check functions
    const functions = await sql`
      SELECT routine_name
      FROM information_schema.routines
      WHERE routine_schema = 'public'
      AND routine_type = 'FUNCTION'
      AND routine_name IN ('mark_action_completed', 'is_action_completed', 'get_tool_completions', 'reset_tool_progress')
    `;

    functions.forEach(f => {
      console.log(`✅ Function: ${f.routine_name}()`);
    });

    // Test with sample data
    console.log('\n🧪 Testing with sample data...\n');

    const testResult = await sql`
      SELECT mark_action_completed(87, 'profiel-coach', 'test_init', '{"test": true}'::jsonb) as was_new
    `;

    console.log(`✅ Test completion marked: ${testResult[0].was_new ? 'NEW' : 'already existed'}`);

    // Verify it was inserted
    const verify = await sql`
      SELECT * FROM tool_completions
      WHERE user_id = 87
      AND action_name = 'test_init'
    `;

    if (verify.length > 0) {
      console.log('✅ Test data verified in database');

      // Clean up
      await sql`DELETE FROM tool_completions WHERE action_name = 'test_init'`;
      console.log('🧹 Test data cleaned up');
    }

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('🎉 TOOL COMPLETION TRACKING INITIALIZED!');
    console.log('='.repeat(60));
    console.log('\n📊 Summary:');
    console.log(`  ✅ Tables: ${tables.length}`);
    console.log(`  ✅ Views: ${views.length}`);
    console.log(`  ✅ Functions: ${functions.length}`);

    console.log('\n✅ Database is ready for Sprint 2!\n');

  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.error('\nStack:', error.stack);
    process.exit(1);
  }
}

initDatabase();
