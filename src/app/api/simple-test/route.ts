import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function GET(request: NextRequest) {
  try {
    // Check if blogs table exists and get data
    let blogsResult;
    try {
      blogsResult = await sql`
        SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN published = true THEN 1 ELSE 0 END) as published_count,
          SUM(CASE WHEN published = false THEN 1 ELSE 0 END) as unpublished_count
        FROM blogs
      `;
    } catch (blogsError) {
      console.log('Blogs table not found, trying blog_posts');
      blogsResult = await sql`
        SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN published = true THEN 1 ELSE 0 END) as published_count,
          SUM(CASE WHEN published = false THEN 1 ELSE 0 END) as unpublished_count
        FROM blog_posts
      `;
    }

    return NextResponse.json({
      message: 'Database test successful',
      blog_stats: blogsResult.rows[0]
    });
  } catch (error: any) {
    console.error('Test error:', error);
    return NextResponse.json(
      { error: 'Failed to test database', details: error.message },
      { status: 500 }
    );
  }
}