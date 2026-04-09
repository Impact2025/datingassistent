import { logger } from '@/lib/logger';
/**
 * Migration: Enhance Program Days met Focus, Context & Prioriteiten
 *
 * Dit script breidt program_days uit met:
 * - Focus statement per dag
 * - Why this matters (context)
 * - Time estimates
 * - Activity context (waarom is video/quiz/reflectie belangrijk?)
 * - Priority levels per activity
 *
 * Run: npx tsx src/scripts/migrate-enhance-program-days.ts
 */

import { config } from 'dotenv';
import { sql } from '@vercel/postgres';

// Load environment variables
config({ path: '.env.local' });

async function migrate() {
  logger.log('🚀 Enhancing program_days table voor wereldklasse UX...\n');

  try {
    // Add new columns to program_days
    logger.log('📊 Stap 1: Nieuwe kolommen toevoegen...');

    await sql`
      ALTER TABLE program_days
      ADD COLUMN IF NOT EXISTS focus_statement TEXT,
      ADD COLUMN IF NOT EXISTS why_this_matters TEXT,
      ADD COLUMN IF NOT EXISTS estimated_time_minutes INT DEFAULT 20,
      ADD COLUMN IF NOT EXISTS video_context TEXT,
      ADD COLUMN IF NOT EXISTS quiz_context TEXT,
      ADD COLUMN IF NOT EXISTS reflectie_context TEXT,
      ADD COLUMN IF NOT EXISTS werkboek_context TEXT,
      ADD COLUMN IF NOT EXISTS video_priority INT DEFAULT 1,
      ADD COLUMN IF NOT EXISTS quiz_priority INT DEFAULT 2,
      ADD COLUMN IF NOT EXISTS reflectie_priority INT DEFAULT 3,
      ADD COLUMN IF NOT EXISTS werkboek_priority INT DEFAULT 4
    `;

    logger.log('  ✓ Kolommen toegevoegd');

    // Verify columns
    const verify = await sql`
      SELECT column_name, data_type, column_default
      FROM information_schema.columns
      WHERE table_name = 'program_days'
      AND column_name IN (
        'focus_statement', 'why_this_matters', 'estimated_time_minutes',
        'video_context', 'quiz_context', 'reflectie_context', 'werkboek_context',
        'video_priority', 'quiz_priority', 'reflectie_priority', 'werkboek_priority'
      )
      ORDER BY column_name
    `;

    logger.log('\n📋 Nieuwe kolommen:');
    verify.rows.forEach(col => {
      logger.log(`  • ${col.column_name}: ${col.data_type} (default: ${col.column_default || 'NULL'})`);
    });

    logger.log('\n✅ Migratie voltooid!');
    logger.log('\n📌 Next step: Run seed script om content toe te voegen');

  } catch (error) {
    console.error('\n❌ Migratie mislukt:', error);
    process.exit(1);
  }
}

// Run migration
migrate().then(() => {
  process.exit(0);
});
