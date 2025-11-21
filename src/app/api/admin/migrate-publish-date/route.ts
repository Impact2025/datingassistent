import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

/**
 * Add publish_date column to blogs table
 * POST /api/admin/migrate-publish-date
 */
export async function POST(request: NextRequest) {
  try {
    console.log('Adding publish_date column to blogs table...');

    // Add publish_date column if it doesn't exist
    await sql`
      ALTER TABLE blogs
      ADD COLUMN IF NOT EXISTS publish_date DATE;
    `;

    console.log('✅ Successfully added publish_date column to blogs table');

    // Show current table structure
    const result = await sql`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'blogs'
      ORDER BY ordinal_position;
    `;

    return NextResponse.json({
      success: true,
      message: 'publish_date column added successfully',
      columns: result.rows,
    });
  } catch (error) {
    console.error('❌ Error adding publish_date column:', error);
    return NextResponse.json(
      {
        error: 'Failed to add publish_date column',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
