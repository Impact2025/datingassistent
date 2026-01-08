import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

/**
 * Database Migration API: Pattern Quiz Results
 *
 * Creates the pattern_quiz_results table.
 * Run once via: GET /api/db/migrate-pattern-quiz
 */

export async function GET() {
  try {
    console.log('Starting Pattern Quiz migration...');

    // Create the pattern_quiz_results table
    await sql`
      CREATE TABLE IF NOT EXISTS pattern_quiz_results (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) NOT NULL,
        first_name VARCHAR(100) NOT NULL,
        answers JSONB NOT NULL,
        anxiety_score INTEGER NOT NULL,
        avoidance_score INTEGER NOT NULL,
        attachment_pattern VARCHAR(50) NOT NULL,
        pattern_confidence INTEGER DEFAULT 75,
        accepts_marketing BOOLEAN DEFAULT false,
        utm_source VARCHAR(100),
        utm_medium VARCHAR(100),
        utm_campaign VARCHAR(100),
        completed_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        converted_to_transformatie BOOLEAN DEFAULT false,
        converted_at TIMESTAMP,
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

    await sql`
      CREATE INDEX IF NOT EXISTS idx_pattern_quiz_pattern
      ON pattern_quiz_results(attachment_pattern)
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS idx_pattern_quiz_completed
      ON pattern_quiz_results(completed_at)
    `;

    console.log('Created indexes');

    return NextResponse.json({
      success: true,
      message: 'Pattern Quiz migration completed successfully!',
    });
  } catch (error: unknown) {
    console.error('Migration failed:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
