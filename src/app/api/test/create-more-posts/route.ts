import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function POST(request: NextRequest) {
  try {
    // Create more test blog posts
    const posts = [
      {
        slug: 'second-post',
        title: 'Second Test Blog Post',
        excerpt: 'This is the second test blog post excerpt',
        content: 'This is the full content of the second test blog post.',
        author: 'Test Author',
        keywords: '{test,second,blog}'
      },
      {
        slug: 'third-post',
        title: 'Third Test Blog Post',
        excerpt: 'This is the third test blog post excerpt',
        content: 'This is the full content of the third test blog post.',
        author: 'Test Author',
        keywords: '{test,third,blog}'
      },
      {
        slug: 'fourth-post',
        title: 'Fourth Test Blog Post',
        excerpt: 'This is the fourth test blog post excerpt',
        content: 'This is the full content of the fourth test blog post.',
        author: 'Test Author',
        keywords: '{test,fourth,blog}'
      }
    ];

    const results = [];
    
    for (const post of posts) {
      const result = await sql`
        INSERT INTO blog_posts (
          slug, 
          title, 
          excerpt, 
          content, 
          author, 
          published, 
          published_at,
          keywords,
          view_count
        )
        VALUES (
          ${post.slug},
          ${post.title},
          ${post.excerpt},
          ${post.content},
          ${post.author},
          true,
          NOW(),
          ${post.keywords},
          0
        )
        RETURNING id, slug, title
      `;
      
      results.push(result.rows[0]);
    }
    
    return NextResponse.json({
      success: true,
      message: 'Additional test blog posts created successfully',
      posts: results
    });
  } catch (error) {
    console.error('Blog posts creation error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Blog posts creation failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}