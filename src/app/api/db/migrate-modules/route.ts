import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function POST() {
  try {
    console.log('Adding media columns to course_modules table...');

    // Add image_url column
    await sql`
      ALTER TABLE course_modules
      ADD COLUMN IF NOT EXISTS image_url TEXT
    `;
    console.log('Added image_url column');

    // Add video_url column
    await sql`
      ALTER TABLE course_modules
      ADD COLUMN IF NOT EXISTS video_url TEXT
    `;
    console.log('Added video_url column');

    return NextResponse.json({
      success: true,
      message: 'Media columns added to course_modules successfully',
      details: {
        columnsAdded: ['image_url', 'video_url']
      }
    });

  } catch (error) {
    console.error('Error migrating course_modules:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to add media columns to course_modules',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
