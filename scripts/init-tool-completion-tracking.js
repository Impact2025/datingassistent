/**
 * Initialize Tool Completion Tracking System
 * Sprint 2 Phase 3 - Database Setup
 *
 * This script creates the necessary database tables and functions
 * for tracking user progress through coaching tools.
 */

// Load environment variables (try multiple files)
require('dotenv').config({ path: '.env.local' });
require('dotenv').config({ path: '.env' });

const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');

async function initToolCompletionTracking() {
  console.log('🚀 Initializing Tool Completion Tracking System...\n');

  // Read database URL from environment
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error('❌ ERROR: DATABASE_URL environment variable not set');
    console.log('💡 Make sure to set DATABASE_URL in your .env file');
    process.exit(1);
  }

  const sql = neon(databaseUrl);

  try {
    // Read the SQL schema file
    const schemaPath = path.join(__dirname, '..', 'sql', 'tool_completion_tracking_schema.sql');
    console.log(`📄 Reading schema from: ${schemaPath}`);

    const schema = fs.readFileSync(schemaPath, 'utf8');

    // Execute the schema
    console.log('⚙️  Executing SQL schema...');
    await sql(schema);

    console.log('✅ Schema executed successfully!\n');

    // Verify tables were created
    console.log('🔍 Verifying table creation...');
    const tables = await sql`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name = 'tool_completions'
    `;

    if (tables.length > 0) {
      console.log('✅ tool_completions table created successfully');
    } else {
      console.log('⚠️  Warning: tool_completions table not found');
    }

    // Verify views were created
    console.log('\n🔍 Verifying views...');
    const views = await sql`
      SELECT table_name
      FROM information_schema.views
      WHERE table_schema = 'public'
      AND table_name IN ('tool_progress', 'user_coaching_progress')
    `;

    views.forEach(view => {
      console.log(`✅ ${view.table_name} view created successfully`);
    });

    // Verify functions were created
    console.log('\n🔍 Verifying functions...');
    const functions = await sql`
      SELECT routine_name
      FROM information_schema.routines
      WHERE routine_schema = 'public'
      AND routine_type = 'FUNCTION'
      AND routine_name IN ('mark_action_completed', 'is_action_completed', 'get_tool_completions', 'reset_tool_progress')
    `;

    functions.forEach(func => {
      console.log(`✅ ${func.routine_name}() function created successfully`);
    });

    // Test with a sample query
    console.log('\n🧪 Testing with sample data...');

    // Mark a test completion for user 87
    const testResult = await sql`
      SELECT mark_action_completed(87, 'profiel-coach', 'test_action', '{"test": true}'::jsonb)
    `;

    if (testResult[0].mark_action_completed) {
      console.log('✅ Test completion marked successfully');

      // Verify it was inserted
      const testCheck = await sql`
        SELECT * FROM tool_completions
        WHERE user_id = 87
        AND tool_name = 'profiel-coach'
        AND action_name = 'test_action'
      `;

      if (testCheck.length > 0) {
        console.log('✅ Test completion verified in database');

        // Clean up test data
        await sql`
          DELETE FROM tool_completions
          WHERE user_id = 87
          AND action_name = 'test_action'
        `;
        console.log('🧹 Test data cleaned up');
      }
    }

    // Show summary
    console.log('\n' + '='.repeat(60));
    console.log('🎉 TOOL COMPLETION TRACKING SYSTEM INITIALIZED!');
    console.log('='.repeat(60));
    console.log('\n📊 Summary:');
    console.log('  ✅ Tables: tool_completions');
    console.log('  ✅ Views: tool_progress, user_coaching_progress');
    console.log('  ✅ Functions: mark_action_completed, is_action_completed');
    console.log('                get_tool_completions, reset_tool_progress');
    console.log('\n🔧 Next Steps:');
    console.log('  1. Create API endpoints in src/app/api/tool-completion/');
    console.log('  2. Create useToolCompletion hook');
    console.log('  3. Migrate tools from localStorage to database');
    console.log('  4. Test with all 5 tools');
    console.log('\n💡 Example Usage:');
    console.log('  SELECT mark_action_completed(87, \'profiel-coach\', \'bio_generated\');');
    console.log('  SELECT * FROM tool_progress WHERE user_id = 87;');
    console.log('  SELECT * FROM user_coaching_progress WHERE user_id = 87;');
    console.log('\n✅ Database is ready for Sprint 2 Phase 3!\n');

  } catch (error) {
    console.error('\n❌ ERROR during initialization:');
    console.error(error);
    console.error('\n💡 Troubleshooting:');
    console.error('  1. Check that DATABASE_URL is correct in .env');
    console.error('  2. Verify database is accessible');
    console.error('  3. Check that users table exists (required for foreign key)');
    process.exit(1);
  }
}

// Run the initialization
initToolCompletionTracking();
