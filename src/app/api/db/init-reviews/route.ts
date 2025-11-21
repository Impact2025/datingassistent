import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function GET() {
  try {
    // Create reviews table if it doesn't exist
    await sql`
      CREATE TABLE IF NOT EXISTS reviews (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        role VARCHAR(255),
        content TEXT NOT NULL,
        avatar TEXT,
        rating INTEGER DEFAULT 5,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    return NextResponse.json({
      success: true,
      message: 'Reviews table initialized successfully'
    });

  } catch (error: any) {
    console.error('Error initializing reviews table:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to initialize reviews table',
        error: error.message
      },
      { status: 500 }
    );
  }
}