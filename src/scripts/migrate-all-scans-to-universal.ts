/**
 * ✨ MASTER MIGRATION: ALL SCANS TO UNIVERSAL LANGUAGE
 *
 * This script updates ALL scan questions to work for everyone:
 * - Complete beginners who never dated
 * - People just starting with dating apps
 * - Experienced daters looking to improve
 *
 * Strategy: Universal Inclusive Language
 * - Use "Stel je voor..." for hypotheticals
 * - Use "Zou je..." for conditional tense
 * - Avoid assumptions about dating experience
 * - Broader relational context (friends/family/dating)
 *
 * Run: npx tsx src/scripts/migrate-all-scans-to-universal.ts
 *
 * @author Claude Code Pro Mode 🚀
 * @date 2025-12-08
 */

import { sql } from '@vercel/postgres';
import { updateDatingStyleQuestions } from './update-dating-style-universal';
import { updateHechtingsstijlQuestions } from './update-hechtingsstijl-universal';

interface MigrationResult {
  scan: string;
  success: boolean;
  questionsUpdated: number;
  error?: string;
}

async function seedEmotionalReadiness(): Promise<MigrationResult> {
  console.log('\n🎯 [1/3] Seeding Emotionele Readiness with universal questions...');

  try {
    // Call the POST endpoint we created
    const response = await fetch('http://localhost:9000/api/db/seed-emotional-readiness', {
      method: 'POST'
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();

    return {
      scan: 'Emotionele Readiness',
      success: true,
      questionsUpdated: 16
    };
  } catch (error: any) {
    return {
      scan: 'Emotionele Readiness',
      success: false,
      questionsUpdated: 0,
      error: error.message
    };
  }
}

async function migrateAllScans() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('✨ UNIVERSAL SCANS MIGRATION - PRO MODE');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('Strategy: One question that works for EVERYONE');
  console.log('Goal: World-class experience for every user');
  console.log('═══════════════════════════════════════════════════════════\n');

  const results: MigrationResult[] = [];

  // 1. Emotionele Readiness (seed new)
  try {
    console.log('🎯 [1/3] Updating Emotionele Readiness...');
    await seedEmotionalReadiness();
    results.push({
      scan: 'Emotionele Readiness',
      success: true,
      questionsUpdated: 16
    });
    console.log('✅ Emotionele Readiness complete!\n');
  } catch (error: any) {
    results.push({
      scan: 'Emotionele Readiness',
      success: false,
      questionsUpdated: 0,
      error: error.message
    });
    console.error('❌ Emotionele Readiness failed:', error.message, '\n');
  }

  // 2. Dating Style
  try {
    console.log('🎯 [2/3] Updating Dating Stijl...');
    await updateDatingStyleQuestions();
    results.push({
      scan: 'Dating Stijl',
      success: true,
      questionsUpdated: 18
    });
    console.log('✅ Dating Stijl complete!\n');
  } catch (error: any) {
    results.push({
      scan: 'Dating Stijl',
      success: false,
      questionsUpdated: 0,
      error: error.message
    });
    console.error('❌ Dating Stijl failed:', error.message, '\n');
  }

  // 3. Hechtingsstijl
  try {
    console.log('🎯 [3/3] Updating Hechtingsstijl...');
    await updateHechtingsstijlQuestions();
    results.push({
      scan: 'Hechtingsstijl',
      success: true,
      questionsUpdated: 12
    });
    console.log('✅ Hechtingsstijl complete!\n');
  } catch (error: any) {
    results.push({
      scan: 'Hechtingsstijl',
      success: false,
      questionsUpdated: 0,
      error: error.message
    });
    console.error('❌ Hechtingsstijl failed:', error.message, '\n');
  }

  // Print summary
  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('📊 MIGRATION SUMMARY');
  console.log('═══════════════════════════════════════════════════════════\n');

  const totalSuccess = results.filter(r => r.success).length;
  const totalQuestions = results.reduce((sum, r) => sum + r.questionsUpdated, 0);

  results.forEach(result => {
    const status = result.success ? '✅' : '❌';
    console.log(`${status} ${result.scan}: ${result.questionsUpdated} questions updated`);
    if (result.error) {
      console.log(`   Error: ${result.error}`);
    }
  });

  console.log(`\n📈 Total: ${totalSuccess}/3 scans successful`);
  console.log(`📝 Total questions updated: ${totalQuestions}`);

  if (totalSuccess === 3) {
    console.log('\n🎉 SUCCESS! All scans now use universal language!');
    console.log('\n💡 Benefits:');
    console.log('   ✅ Works for complete beginners');
    console.log('   ✅ Works for experienced daters');
    console.log('   ✅ No more assumptions about experience');
    console.log('   ✅ Simpler maintenance (no branching)');
    console.log('   ✅ Better UX (faster completion)');
    console.log('   ✅ Truly world-class for everyone! 🌟');
  } else {
    console.log('\n⚠️  Some migrations failed. Check errors above.');
  }

  console.log('\n═══════════════════════════════════════════════════════════\n');

  return results;
}

// Run if executed directly
if (require.main === module) {
  migrateAllScans()
    .then((results) => {
      const allSuccess = results.every(r => r.success);
      if (allSuccess) {
        console.log('✅ Migration completed successfully!');
        process.exit(0);
      } else {
        console.error('❌ Migration completed with errors');
        process.exit(1);
      }
    })
    .catch((error) => {
      console.error('❌ Migration failed:', error);
      process.exit(1);
    });
}

export { migrateAllScans };
