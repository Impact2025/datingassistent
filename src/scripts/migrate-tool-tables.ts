import { logger } from '@/lib/logger';
/**
 * Migration Script: Create Tables for Transformatie 3.0 AI Tools
 *
 * Tables:
 * - vragen_36_sessions: Tracks 36 Questions sessions
 * - vragen_36_answers: Stores answers to individual questions
 * - ghosting_reframe_sessions: Tracks Ghosting Reframer sessions
 * - ghosting_reframe_messages: Stores conversation messages
 *
 * Run with: npx tsx src/scripts/migrate-tool-tables.ts
 */

import * as dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import { sql } from '@vercel/postgres';

async function createToolTables() {
  logger.log('Starting tool tables migration...\n');

  try {
    // ============================================
    // 36 VRAGEN TABLES
    // ============================================

    logger.log('Creating vragen_36_sessions table...');
    await sql`
      CREATE TABLE IF NOT EXISTS vragen_36_sessions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        partner_name VARCHAR(100) DEFAULT 'Partner',
        current_set INTEGER DEFAULT 1,
        current_question INTEGER DEFAULT 1,
        status VARCHAR(20) DEFAULT 'active',
        message_count INTEGER DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        completed_at TIMESTAMP WITH TIME ZONE,
        CONSTRAINT valid_set CHECK (current_set >= 1 AND current_set <= 3),
        CONSTRAINT valid_question CHECK (current_question >= 1 AND current_question <= 12),
        CONSTRAINT valid_status CHECK (status IN ('active', 'paused', 'completed'))
      )
    `;
    logger.log('  vragen_36_sessions created');

    logger.log('Creating vragen_36_answers table...');
    await sql`
      CREATE TABLE IF NOT EXISTS vragen_36_answers (
        id SERIAL PRIMARY KEY,
        session_id INTEGER NOT NULL REFERENCES vragen_36_sessions(id) ON DELETE CASCADE,
        question_number INTEGER NOT NULL,
        user_answer TEXT,
        partner_answer TEXT,
        answered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        CONSTRAINT valid_question_number CHECK (question_number >= 1 AND question_number <= 36)
      )
    `;
    logger.log('  vragen_36_answers created');

    // Create indexes
    logger.log('Creating indexes for 36 vragen tables...');
    try {
      await sql`CREATE INDEX IF NOT EXISTS idx_vragen_36_sessions_user ON vragen_36_sessions(user_id)`;
      logger.log('  idx_vragen_36_sessions_user created');
    } catch (e) { logger.log('  idx_vragen_36_sessions_user already exists or error'); }
    try {
      await sql`CREATE INDEX IF NOT EXISTS idx_vragen_36_sessions_status ON vragen_36_sessions(status)`;
      logger.log('  idx_vragen_36_sessions_status created');
    } catch (e) { logger.log('  idx_vragen_36_sessions_status skipped (column may not exist)'); }
    try {
      await sql`CREATE INDEX IF NOT EXISTS idx_vragen_36_answers_session ON vragen_36_answers(session_id)`;
      logger.log('  idx_vragen_36_answers_session created');
    } catch (e) { logger.log('  idx_vragen_36_answers_session already exists or error'); }
    logger.log('');

    // ============================================
    // GHOSTING REFRAMER TABLES
    // ============================================

    logger.log('Creating ghosting_reframe_sessions table...');
    await sql`
      CREATE TABLE IF NOT EXISTS ghosting_reframe_sessions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        scenario VARCHAR(50) DEFAULT 'general',
        status VARCHAR(20) DEFAULT 'active',
        message_count INTEGER DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        completed_at TIMESTAMP WITH TIME ZONE,
        CONSTRAINT valid_scenario CHECK (scenario IN ('ghosted_after_date', 'ghosted_while_texting', 'rejected_directly', 'pattern_rejection', 'general')),
        CONSTRAINT valid_reframe_status CHECK (status IN ('active', 'completed'))
      )
    `;
    logger.log('  ghosting_reframe_sessions created');

    logger.log('Creating ghosting_reframe_messages table...');
    await sql`
      CREATE TABLE IF NOT EXISTS ghosting_reframe_messages (
        id SERIAL PRIMARY KEY,
        session_id INTEGER NOT NULL REFERENCES ghosting_reframe_sessions(id) ON DELETE CASCADE,
        role VARCHAR(20) NOT NULL,
        content TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        CONSTRAINT valid_role CHECK (role IN ('user', 'assistant', 'system'))
      )
    `;
    logger.log('  ghosting_reframe_messages created');

    // Create indexes
    logger.log('Creating indexes for ghosting reframer tables...');
    try {
      await sql`CREATE INDEX IF NOT EXISTS idx_ghosting_sessions_user ON ghosting_reframe_sessions(user_id)`;
      logger.log('  idx_ghosting_sessions_user created');
    } catch (e) { logger.log('  idx_ghosting_sessions_user already exists or error'); }
    try {
      await sql`CREATE INDEX IF NOT EXISTS idx_ghosting_sessions_status ON ghosting_reframe_sessions(status)`;
      logger.log('  idx_ghosting_sessions_status created');
    } catch (e) { logger.log('  idx_ghosting_sessions_status skipped'); }
    try {
      await sql`CREATE INDEX IF NOT EXISTS idx_ghosting_messages_session ON ghosting_reframe_messages(session_id)`;
      logger.log('  idx_ghosting_messages_session created');
    } catch (e) { logger.log('  idx_ghosting_messages_session already exists or error'); }
    logger.log('');

    // ============================================
    // ENERGIE BATTERIJ TABLE (if not exists)
    // ============================================

    logger.log('Creating energie_batterij_logs table...');
    await sql`
      CREATE TABLE IF NOT EXISTS energie_batterij_logs (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        energy_level INTEGER NOT NULL,
        social_capacity INTEGER NOT NULL,
        recovery_needed INTEGER NOT NULL,
        assessment_data JSONB,
        recommendations JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        CONSTRAINT valid_energy CHECK (energy_level >= 0 AND energy_level <= 100),
        CONSTRAINT valid_social CHECK (social_capacity >= 0 AND social_capacity <= 100),
        CONSTRAINT valid_recovery CHECK (recovery_needed >= 0 AND recovery_needed <= 100)
      )
    `;
    logger.log('  energie_batterij_logs created');

    try {
      await sql`CREATE INDEX IF NOT EXISTS idx_energie_batterij_user ON energie_batterij_logs(user_id)`;
      logger.log('  Index created');
    } catch (e) { logger.log('  Index already exists or error'); }
    logger.log('');

    // ============================================
    // VIBE CHECK RESULTS TABLE (if not exists)
    // ============================================

    logger.log('Checking vibe_check_results table...');
    await sql`
      CREATE TABLE IF NOT EXISTS vibe_check_results (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        image_url TEXT,
        emotional_analysis JSONB,
        vibe_scores JSONB,
        suggestions JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;
    logger.log('  vibe_check_results table ready');

    try {
      await sql`CREATE INDEX IF NOT EXISTS idx_vibe_check_user ON vibe_check_results(user_id)`;
      logger.log('  Index created');
    } catch (e) { logger.log('  Index already exists or error'); }
    logger.log('');

    logger.log('==========================================');
    logger.log('All tool tables created successfully!');
    logger.log('==========================================');

  } catch (error) {
    console.error('Migration error:', error);
    throw error;
  }
}

// Run migration
createToolTables()
  .then(() => {
    logger.log('\nMigration completed successfully.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\nMigration failed:', error);
    process.exit(1);
  });
