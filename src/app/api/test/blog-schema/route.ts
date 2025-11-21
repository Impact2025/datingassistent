import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function GET(request: NextRequest) {
  try {
    // Get blog_posts table schema
    const result = await sql`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'blog_posts'
      ORDER BY ordinal_position
    `;
    
    return NextResponse.json({
      success: true,
      message: 'Blog posts schema retrieved successfully',
      columns: result.rows
    });
  } catch (error) {
    console.error('Blog posts schema retrieval error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Blog posts schema retrieval failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}