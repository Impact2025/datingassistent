import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function POST(request: NextRequest) {
  try {
    // Create a test blog post
    const result = await sql`
      INSERT INTO blog_posts (
        slug, 
        title, 
        excerpt, 
        content, 
        author, 
        published, 
        published_at,
        seo_title,
        seo_description,
        keywords,
        view_count
      )
      VALUES (
        'test-post',
        'Test Blog Post',
        'This is a test blog post excerpt',
        'This is the full content of the test blog post. It contains some sample content to test the blog functionality.',
        'Test Author',
        true,
        NOW(),
        'Test Blog Post - SEO Title',
        'This is a test blog post for SEO purposes',
        ARRAY['test', 'blog', 'sample'],
        0
      )
      RETURNING id, slug, title
    `;
    
    return NextResponse.json({
      success: true,
      message: 'Test blog post created successfully',
      post: result.rows[0]
    });
  } catch (error) {
    console.error('Blog post creation error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Blog post creation failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}