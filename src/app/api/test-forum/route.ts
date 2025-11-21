import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { getForumPostsByCategory } from '@/lib/community-db';

export async function GET() {
  try {
    // Check if there are any forum posts
    const postsResult = await sql`SELECT * FROM forum_posts`;
    console.log('All forum posts:', postsResult.rows);
    
    // Check posts for category 1 specifically
    const categoryPostsResult = await sql`SELECT * FROM forum_posts WHERE category_id = 1`;
    console.log('Category 1 posts:', categoryPostsResult.rows);
    
    // Test the getForumPostsByCategory function
    const functionResult = await getForumPostsByCategory(1);
    console.log('Function result:', functionResult);
    
    return NextResponse.json({
      success: true,
      allPosts: postsResult.rows,
      categoryPosts: categoryPostsResult.rows,
      functionResult: functionResult
    });
  } catch (error) {
    console.error('Test forum error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Test forum failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}