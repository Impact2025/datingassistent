/**
 * Sprint 1 Verification Script
 * Verifies all components of the Coaching Profile System
 */

const { sql } = require('@vercel/postgres');
require('dotenv').config({ path: '.env.local' });

async function verifyDatabase() {
  console.log('\n🔍 STEP 1: Verifying Database Schema\n');

  try {
    // Check if coaching_profiles table exists
    const tableCheck = await sql`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_name = 'coaching_profiles'
    `;

    if (tableCheck.rows.length === 0) {
      console.log('❌ coaching_profiles table does NOT exist');
      return false;
    }

    console.log('✅ coaching_profiles table exists');

    // Get column count
    const columns = await sql`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'coaching_profiles'
      ORDER BY ordinal_position
    `;

    console.log(`✅ Table has ${columns.rows.length} columns`);
    console.log('\n📋 Sample columns:');
    columns.rows.slice(0, 10).forEach(col => {
      console.log(`   - ${col.column_name} (${col.data_type})`);
    });

    if (columns.rows.length > 10) {
      console.log(`   ... and ${columns.rows.length - 10} more columns`);
    }

    // Check indexes
    const indexes = await sql`
      SELECT indexname
      FROM pg_indexes
      WHERE tablename = 'coaching_profiles'
    `;

    console.log(`\n✅ ${indexes.rows.length} indexes created:`);
    indexes.rows.forEach(idx => {
      console.log(`   - ${idx.indexname}`);
    });

    // Check if there are any profiles yet
    const profileCount = await sql`
      SELECT COUNT(*) as count FROM coaching_profiles
    `;

    console.log(`\n📊 Current profiles in database: ${profileCount.rows[0].count}`);

    return true;
  } catch (error) {
    console.error('❌ Database verification failed:', error.message);
    return false;
  }
}

async function verifyFileStructure() {
  console.log('\n🔍 STEP 2: Verifying File Structure\n');

  const fs = require('fs');
  const path = require('path');

  const requiredFiles = [
    'src/lib/coaching-profile-service.ts',
    'src/components/journey/coach-advice-enhanced.tsx',
    'src/components/dashboard/current-focus-card.tsx',
    'src/app/api/coaching-profile/route.ts',
    'src/app/api/coaching-profile/next-action/route.ts',
    'src/app/api/coaching-profile/track-tool/route.ts',
    'scripts/init-coaching-profiles.js',
  ];

  let allExist = true;

  requiredFiles.forEach(file => {
    const fullPath = path.join(process.cwd(), file);
    if (fs.existsSync(fullPath)) {
      const stats = fs.statSync(fullPath);
      const sizeKB = (stats.size / 1024).toFixed(1);
      console.log(`✅ ${file} (${sizeKB} KB)`);
    } else {
      console.log(`❌ ${file} - MISSING`);
      allExist = false;
    }
  });

  return allExist;
}

async function verifyIntegration() {
  console.log('\n🔍 STEP 3: Verifying Dashboard Integration\n');

  const fs = require('fs');
  const path = require('path');

  const dashboardPath = path.join(process.cwd(), 'src/components/dashboard/dashboard-tab.tsx');
  const content = fs.readFileSync(dashboardPath, 'utf8');

  const checks = [
    {
      name: 'CurrentFocusCard import',
      pattern: /import.*CurrentFocusCard.*from.*current-focus-card/,
    },
    {
      name: 'CurrentFocusCard usage',
      pattern: /<CurrentFocusCard/,
    },
  ];

  let allPassed = true;

  checks.forEach(check => {
    if (check.pattern.test(content)) {
      console.log(`✅ ${check.name}`);
    } else {
      console.log(`❌ ${check.name} - NOT FOUND`);
      allPassed = false;
    }
  });

  return allPassed;
}

async function generateSummary(dbOk, filesOk, integrationOk) {
  console.log('\n' + '='.repeat(60));
  console.log('📊 SPRINT 1 VERIFICATION SUMMARY');
  console.log('='.repeat(60) + '\n');

  const results = [
    { name: 'Database Schema', status: dbOk },
    { name: 'File Structure', status: filesOk },
    { name: 'Dashboard Integration', status: integrationOk },
  ];

  results.forEach(result => {
    const icon = result.status ? '✅' : '❌';
    const status = result.status ? 'PASS' : 'FAIL';
    console.log(`${icon} ${result.name}: ${status}`);
  });

  const allPassed = dbOk && filesOk && integrationOk;

  console.log('\n' + '='.repeat(60));

  if (allPassed) {
    console.log('🎉 ALL CHECKS PASSED - Sprint 1 Ready for Testing!');
    console.log('='.repeat(60) + '\n');
    console.log('Next Steps:');
    console.log('1. Open http://localhost:9000 in browser');
    console.log('2. Login with existing account');
    console.log('3. Check Dashboard for "Jouw Huidige Focus" card');
    console.log('4. Or do personality scan to generate coaching profile\n');
  } else {
    console.log('⚠️  SOME CHECKS FAILED - Review errors above');
    console.log('='.repeat(60) + '\n');
  }

  return allPassed;
}

async function main() {
  console.log('🚀 Starting Sprint 1 Verification...\n');

  const dbOk = await verifyDatabase();
  const filesOk = await verifyFileStructure();
  const integrationOk = await verifyIntegration();

  const success = await generateSummary(dbOk, filesOk, integrationOk);

  process.exit(success ? 0 : 1);
}

main().catch(error => {
  console.error('💥 Verification script error:', error);
  process.exit(1);
});
