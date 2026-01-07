/**
 * Database Migration: Pattern Quiz Results
 *
 * Creates the pattern_quiz_results table for storing Dating Pattern Quiz responses
 * based on attachment theory (ECR-R model).
 *
 * Run with: npx tsx src/scripts/migrate-pattern-quiz.ts
 */

import { sql } from '@/lib/db';

async function migratePatternQuiz() {
  console.log('Starting Pattern Quiz migration...');

  try {
    // Create the pattern_quiz_results table
    await sql`
      CREATE TABLE IF NOT EXISTS pattern_quiz_results (
        id SERIAL PRIMARY KEY,

        -- User identification
        email VARCHAR(255) NOT NULL,
        first_name VARCHAR(100) NOT NULL,

        -- Quiz responses (10 questions)
        answers JSONB NOT NULL,

        -- Calculated scores (0-100 normalized)
        anxiety_score INTEGER NOT NULL,
        avoidance_score INTEGER NOT NULL,

        -- Primary attachment pattern
        attachment_pattern VARCHAR(50) NOT NULL,
        pattern_confidence INTEGER DEFAULT 75,

        -- Marketing consent
        accepts_marketing BOOLEAN DEFAULT false,

        -- UTM tracking
        utm_source VARCHAR(100),
        utm_medium VARCHAR(100),
        utm_campaign VARCHAR(100),

        -- Timestamps
        completed_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

        -- Conversion tracking
        converted_to_transformatie BOOLEAN DEFAULT false,
        converted_at TIMESTAMP,

        -- Email tracking
        result_email_sent BOOLEAN DEFAULT false,
        result_email_sent_at TIMESTAMP
      )
    `;
    console.log('Created pattern_quiz_results table');

    // Create indexes
    await sql`
      CREATE INDEX IF NOT EXISTS idx_pattern_quiz_email
      ON pattern_quiz_results(email)
    `;
    console.log('Created email index');

    await sql`
      CREATE INDEX IF NOT EXISTS idx_pattern_quiz_pattern
      ON pattern_quiz_results(attachment_pattern)
    `;
    console.log('Created pattern index');

    await sql`
      CREATE INDEX IF NOT EXISTS idx_pattern_quiz_completed
      ON pattern_quiz_results(completed_at)
    `;
    console.log('Created completed_at index');

    await sql`
      CREATE INDEX IF NOT EXISTS idx_pattern_quiz_marketing
      ON pattern_quiz_results(accepts_marketing)
      WHERE accepts_marketing = true
    `;
    console.log('Created marketing index');

    await sql`
      CREATE INDEX IF NOT EXISTS idx_pattern_quiz_conversion
      ON pattern_quiz_results(converted_to_transformatie)
      WHERE converted_to_transformatie = true
    `;
    console.log('Created conversion index');

    // Add table comment
    await sql`
      COMMENT ON TABLE pattern_quiz_results IS
      'Dating Pattern Quiz results based on attachment theory (ECR-R) for Transformatie program upsell'
    `;

    console.log('Pattern Quiz migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  }
}

// Run migration
migratePatternQuiz()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
