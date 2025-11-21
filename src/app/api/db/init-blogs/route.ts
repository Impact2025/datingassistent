import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

/**
 * Initialize blogs table in Neon database
 * GET /api/db/init-blogs
 */
export async function GET() {
  try {
    // Create blogs table
    await sql`
      CREATE TABLE IF NOT EXISTS blogs (
        id SERIAL PRIMARY KEY,
        title VARCHAR(500) NOT NULL,
        excerpt TEXT,
        content TEXT NOT NULL,
        image TEXT,
        meta_title VARCHAR(500),
        meta_description TEXT,
        slug VARCHAR(500) UNIQUE NOT NULL,
        keywords JSONB,
        midjourney_prompt TEXT,
        author VARCHAR(255) DEFAULT 'DatingAssistent',
        published BOOLEAN DEFAULT false,
        views INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `;

    // Create index on slug for faster queries
    await sql`
      CREATE INDEX IF NOT EXISTS idx_blogs_slug ON blogs(slug)
    `;

    // Create index on published for faster queries
    await sql`
      CREATE INDEX IF NOT EXISTS idx_blogs_published ON blogs(published)
    `;

    // Create index on created_at for faster queries
    await sql`
      CREATE INDEX IF NOT EXISTS idx_blogs_created_at ON blogs(created_at DESC)
    `;

    return NextResponse.json({
      success: true,
      message: 'blogs tabel succesvol aangemaakt',
      tables: ['blogs'],
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
