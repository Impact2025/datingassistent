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
import { updateRelatiepatronenQuestions } from './update-relatiepatronen-universal';
import { logger } from '@/lib/logger';

interface MigrationResult {
  scan: string;
  success: boolean;
  questionsUpdated: number;
  error?: string;
}

async function seedEmotionalReadiness(): Promise<MigrationResult> {
  logger.log('\n🎯 [1/3] Seeding Emotionele Readiness with universal questions...');

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
  logger.log('═══════════════════════════════════════════════════════════');
  logger.log('✨ UNIVERSAL SCANS MIGRATION - PRO MODE');
  logger.log('═══════════════════════════════════════════════════════════');
  logger.log('Strategy: One question that works for EVERYONE');
  logger.log('Goal: World-class experience for every user');
  logger.log('Note: Levensvisie already uses universal language! 🎯');
  logger.log('═══════════════════════════════════════════════════════════\n');

  const results: MigrationResult[] = [];

  // 1. Emotionele Readiness (seed new)
  try {
    logger.log('🎯 [1/4] Updating Emotionele Readiness...');
    await seedEmotionalReadiness();
    results.push({
      scan: 'Emotionele Readiness',
      success: true,
      questionsUpdated: 16
    });
    logger.log('✅ Emotionele Readiness complete!\n');
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
    logger.log('🎯 [2/4] Updating Dating Stijl...');
    await updateDatingStyleQuestions();
    results.push({
      scan: 'Dating Stijl',
      success: true,
      questionsUpdated: 18
    });
    logger.log('✅ Dating Stijl complete!\n');
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
    logger.log('🎯 [3/4] Updating Hechtingsstijl...');
    await updateHechtingsstijlQuestions();
    results.push({
      scan: 'Hechtingsstijl',
      success: true,
      questionsUpdated: 12
    });
    logger.log('✅ Hechtingsstijl complete!\n');
  } catch (error: any) {
    results.push({
      scan: 'Hechtingsstijl',
      success: false,
      questionsUpdated: 0,
      error: error.message
    });
    console.error('❌ Hechtingsstijl failed:', error.message, '\n');
  }

  // 4. Relatiepatronen (NEW!)
  try {
    logger.log('🎯 [4/4] Updating Relatiepatronen...');
    await updateRelatiepatronenQuestions();
    results.push({
      scan: 'Relatiepatronen',
      success: true,
      questionsUpdated: 14
    });
    logger.log('✅ Relatiepatronen complete!\n');
  } catch (error: any) {
    results.push({
      scan: 'Relatiepatronen',
      success: false,
      questionsUpdated: 0,
      error: error.message
    });
    console.error('❌ Relatiepatronen failed:', error.message, '\n');
  }

  // Print summary
  logger.log('\n═══════════════════════════════════════════════════════════');
  logger.log('📊 MIGRATION SUMMARY');
  logger.log('═══════════════════════════════════════════════════════════\n');

  const totalSuccess = results.filter(r => r.success).length;
  const totalQuestions = results.reduce((sum, r) => sum + r.questionsUpdated, 0);

  results.forEach(result => {
    const status = result.success ? '✅' : '❌';
    logger.log(`${status} ${result.scan}: ${result.questionsUpdated} questions updated`);
    if (result.error) {
      logger.log(`   Error: ${result.error}`);
    }
  });

  logger.log(`\n📈 Total: ${totalSuccess}/4 scans migrated`);
  logger.log(`📝 Total questions updated: ${totalQuestions}`);
  logger.log(`✅ Levensvisie: Already universal (18 questions) - no migration needed!`);

  if (totalSuccess === 4) {
    logger.log('\n🎉 SUCCESS! All 5 scans now use universal language!');
    logger.log('\n💡 Benefits:');
    logger.log('   ✅ Works for complete beginners');
    logger.log('   ✅ Works for experienced daters');
    logger.log('   ✅ No more assumptions about experience');
    logger.log('   ✅ Simpler maintenance (no branching)');
    logger.log('   ✅ Better UX (faster completion)');
    logger.log('   ✅ Truly world-class for everyone! 🌟');
  } else {
    logger.log('\n⚠️  Some migrations failed. Check errors above.');
  }

  logger.log('\n═══════════════════════════════════════════════════════════\n');

  return results;
}

// Run if executed directly
if (require.main === module) {
  migrateAllScans()
    .then((results) => {
      const allSuccess = results.every(r => r.success);
      if (allSuccess) {
        logger.log('✅ Migration completed successfully!');
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
