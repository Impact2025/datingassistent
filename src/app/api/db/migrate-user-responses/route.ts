import { logger } from '@/lib/logger';
import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function POST() {
  try {
    logger.log('Creating user_lesson_responses table...');

    // Create the table
    const createTableResult = await sql`
      CREATE TABLE IF NOT EXISTS user_lesson_responses (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        lesson_id INTEGER NOT NULL,
        response_text TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(user_id, lesson_id)
      )
    `;

    logger.log('Table created successfully:', createTableResult);

    // Create index for faster queries
    const createIndexResult = await sql`
      CREATE INDEX IF NOT EXISTS idx_user_lesson_responses_user_id
      ON user_lesson_responses(user_id)
    `;

    logger.log('Index created successfully:', createIndexResult);

    return NextResponse.json({
      success: true,
      message: 'User lesson responses table created successfully',
    });
  } catch (error) {
    console.error('Migration error:', error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}
