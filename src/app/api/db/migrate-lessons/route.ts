import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function POST() {
  try {
    console.log('Adding image_url column to course_lessons table...');

    // Add image_url column
    await sql`
      ALTER TABLE course_lessons
      ADD COLUMN IF NOT EXISTS image_url TEXT
    `;
    console.log('Added image_url column');

    return NextResponse.json({
      success: true,
      message: 'Image column added to course_lessons successfully',
      details: {
        columnsAdded: ['image_url']
      }
    });

  } catch (error) {
    console.error('Error migrating course_lessons:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to add image column to course_lessons',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
