import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function GET(request: NextRequest) {
  try {
    // First, let's see what tables exist
    const tablesResult = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;

    // Check if blogs table exists
    let blogsData: any[] = [];
    let blogStats: any[] = [];
    
    try {
      const blogsResult = await sql`
        SELECT 
          id,
          slug,
          title,
          excerpt,
          image,
          featured_image,
          published,
          created_at,
          updated_at,
          views
        FROM blogs
        ORDER BY created_at DESC
      `;
      blogsData = blogsResult.rows;
      
      const countResult = await sql`
        SELECT 
          published,
          COUNT(*) as count
        FROM blogs
        GROUP BY published
      `;
      blogStats = countResult.rows;
    } catch (blogsError) {
      console.log('Blogs table not found, trying blog_posts');
      try {
        const blogPostsResult = await sql`
          SELECT 
            id,
            slug,
            title,
            excerpt,
            featured_image,
            published,
            created_at,
            updated_at,
            views
          FROM blog_posts
          ORDER BY created_at DESC
        `;
        blogsData = blogPostsResult.rows;
        
        const countResult = await sql`
          SELECT 
            published,
            COUNT(*) as count
          FROM blog_posts
          GROUP BY published
        `;
        blogStats = countResult.rows;
      } catch (blogPostsError) {
        console.log('Neither blogs nor blog_posts table found');
      }
    }

    return NextResponse.json({
      message: 'Blog debug information',
      tables: tablesResult.rows,
      blog_stats: blogStats,
      blogs: blogsData
    });
  } catch (error: any) {
    console.error('Debug error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch debug info', details: error.message },
      { status: 500 }
    );
  }
}