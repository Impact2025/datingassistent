import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

/**
 * Initialize blog_images table in Neon database
 * GET /api/db/init-images
 */
export async function GET() {
  try {
    // Create blog_images table
    await sql`
      CREATE TABLE IF NOT EXISTS blog_images (
        id SERIAL PRIMARY KEY,
        filename VARCHAR(255) NOT NULL,
        mimetype VARCHAR(100) NOT NULL,
        data TEXT NOT NULL,
        size INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `;

    // Create index on created_at for faster queries
    await sql`
      CREATE INDEX IF NOT EXISTS idx_blog_images_created_at
      ON blog_images(created_at DESC)
    `;

    return NextResponse.json({
      success: true,
      message: 'blog_images tabel succesvol aangemaakt',
      tables: ['blog_images'],
    });
  } catch (error) {
    console.error('Database initialization error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Database initialisatie mislukt',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
