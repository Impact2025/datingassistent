import { NextResponse } from 'next/server';
import { createPodcast, getAllPodcasts } from '@/lib/podcast-service';
import { sql } from '@vercel/postgres';

// GET /api/admin/podcasts - Get all podcasts
export async function GET() {
  try {
    // First, let's check if the table exists and we can query it
    try {
      await sql`SELECT 1 FROM podcasts LIMIT 1`;
    } catch (tableError) {
      console.error('Podcasts table may not exist:', tableError);
      // Try to create the table if it doesn't exist
      try {
        await sql`
          CREATE TABLE IF NOT EXISTS podcasts (
            id SERIAL PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            description TEXT NOT NULL,
            file_url TEXT NOT NULL,
            file_size INTEGER,
            duration INTEGER,
            published BOOLEAN DEFAULT false,
            published_at TIMESTAMP,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          )
        `;
        console.log('Podcasts table created successfully');
      } catch (createError) {
        console.error('Error creating podcasts table:', createError);
        return NextResponse.json(
          { success: false, error: 'Database table error', details: String(createError) },
          { status: 500 }
        );
      }
    }
    
    const podcasts = await getAllPodcasts();
    return NextResponse.json({ success: true, podcasts });
  } catch (error) {
    console.error('Error fetching podcasts:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch podcasts', details: String(error) },
      { status: 500 }
    );
  }
}

// POST /api/admin/podcasts - Create a new podcast
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, description, file_url, file_size, duration, published } = body;

    if (!title || !description || !file_url) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const podcast = await createPodcast({
      title,
      description,
      file_url,
      file_size,
      duration,
      published: published || false,
    });

    return NextResponse.json({ success: true, podcast });
  } catch (error) {
    console.error('Error creating podcast:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create podcast', details: String(error) },
      { status: 500 }
    );
  }
}