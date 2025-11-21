import { NextRequest, NextResponse } from 'next/server';
import { getLatestBlogPosts } from '@/lib/db-operations';

export async function GET(request: NextRequest) {
  try {
    // Get latest blog posts
    const posts = await getLatestBlogPosts(5);
    
    return NextResponse.json({
      success: true,
      message: 'Latest blog posts retrieved successfully',
      count: posts.length,
      posts: posts
    });
  } catch (error) {
    console.error('Latest posts retrieval error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Latest posts retrieval failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}