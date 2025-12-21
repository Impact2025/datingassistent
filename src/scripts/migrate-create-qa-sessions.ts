/**
 * Migration: Create qa_sessions table
 *
 * This table stores live Q&A sessions for the Transformatie program.
 * Simple MVP approach - admin manually adds sessions with Zoom links.
 *
 * Run: npx tsx src/scripts/migrate-create-qa-sessions.ts
 */

import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), '.env.local') });

import { sql } from '@vercel/postgres';

async function migrate() {
  console.log('🚀 Creating qa_sessions table...');

  try {
    // Create qa_sessions table
    await sql`
      CREATE TABLE IF NOT EXISTS qa_sessions (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        session_date DATE NOT NULL,
        session_time TIME NOT NULL,
        duration_minutes INTEGER DEFAULT 60,
        zoom_link TEXT,
        zoom_meeting_id VARCHAR(100),
        max_participants INTEGER DEFAULT 100,
        status VARCHAR(50) DEFAULT 'scheduled',
        program VARCHAR(50) DEFAULT 'transformatie',
        is_recording_available BOOLEAN DEFAULT false,
        recording_url TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `;

    console.log('✅ qa_sessions table created');

    // Create index on session_date for fast queries
    await sql`
      CREATE INDEX IF NOT EXISTS idx_qa_sessions_date
      ON qa_sessions(session_date DESC)
    `;

    console.log('✅ Index created on session_date');

    // Create index on program for filtering
    await sql`
      CREATE INDEX IF NOT EXISTS idx_qa_sessions_program
      ON qa_sessions(program)
    `;

    console.log('✅ Index created on program');

    // Insert sample Q&A session for testing
    const now = new Date();
    const nextWeek = new Date(now);
    nextWeek.setDate(nextWeek.getDate() + 7);

    await sql`
      INSERT INTO qa_sessions (
        title,
        description,
        session_date,
        session_time,
        duration_minutes,
        zoom_link,
        program,
        status
      ) VALUES (
        'Week 1 Q&A - Welkom & Kennismaking',
        'In deze eerste Q&A sessie bespreken we je vragen over Module 1 en 2. Kom met al je vragen over het DESIGN framework, je waarden kompas, en hechtingsstijl.',
        ${nextWeek.toISOString().split('T')[0]},
        '19:00:00',
        60,
        'https://zoom.us/j/placeholder',
        'transformatie',
        'scheduled'
      )
      ON CONFLICT DO NOTHING
    `;

    console.log('✅ Sample Q&A session inserted');

    console.log('\n🎉 Migration completed successfully!');
    console.log('\nNext steps:');
    console.log('1. Add real Zoom links via admin panel');
    console.log('2. Schedule sessions for week 1, 6, and 12');
    console.log('3. Test the calendar view in Transformatie dashboard');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
}

migrate()
  .then(() => {
    console.log('✨ Migration script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
