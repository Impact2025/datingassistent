import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function POST(request: NextRequest) {
  try {
    // Add view_count column to blog_posts table if it doesn't exist
    await sql`
      ALTER TABLE blog_posts 
      ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0
    `;
    
    return NextResponse.json({
      success: true,
      message: 'view_count column added successfully'
    });
  } catch (error) {
    console.error('Column addition error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Column addition failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}