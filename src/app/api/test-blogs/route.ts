import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { getLatestBlogPosts } from '@/lib/db-operations';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const limitParam = url.searchParams.get('limit');
    const limit = limitParam ? parseInt(limitParam) : 10;
    
    // Get all blogs from the database
    const result = await sql`
      SELECT 
        id,
        title,
        excerpt,
        content,
        image,
        slug,
        keywords,
        published,
        views,
        created_at
      FROM blogs
      ORDER BY created_at DESC
    `;

    // Get latest blogs using the function
    const latestBlogs = await getLatestBlogPosts(limit);

    return NextResponse.json({
      success: true,
      count: result.rows.length,
      publishedCount: result.rows.filter(blog => blog.published).length,
      latestBlogsCount: latestBlogs.length,
      allBlogs: result.rows,
      latestBlogs: latestBlogs,
    });
  } catch (error) {
    console.error('Error fetching blogs:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch blogs',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}