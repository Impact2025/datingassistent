import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function GET(request: NextRequest) {
  try {
    // Get all blog posts
    const result = await sql`
      SELECT id, slug, title, published, created_at 
      FROM blog_posts 
      ORDER BY created_at DESC 
      LIMIT 5
    `;
    
    return NextResponse.json({
      success: true,
      message: 'Blog posts retrieved successfully',
      count: result.rows.length,
      posts: result.rows
    });
  } catch (error) {
    console.error('Blog posts retrieval error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Blog posts retrieval failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}