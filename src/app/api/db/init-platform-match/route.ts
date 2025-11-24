import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

/**
 * Database Migration: Platform Match Results
 * Creates table for storing platform recommendation results
 */
export async function GET() {
  try {
    // Create platform_match_results table
    await sql`
      CREATE TABLE IF NOT EXISTS platform_match_results (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        preferences JSONB NOT NULL,
        recommendations JSONB NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;

    // Create index on user_id for faster queries
    await sql`
      CREATE INDEX IF NOT EXISTS idx_platform_match_user_id
      ON platform_match_results(user_id)
    `;

    // Create index on created_at for cleanup/analytics
    await sql`
      CREATE INDEX IF NOT EXISTS idx_platform_match_created_at
      ON platform_match_results(created_at DESC)
    `;

    console.log('✅ Platform match results table created successfully');

    return NextResponse.json({
      success: true,
      message: 'Platform match results table initialized successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error initializing platform match table:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
