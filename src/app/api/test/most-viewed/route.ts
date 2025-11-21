import { NextRequest, NextResponse } from 'next/server';
import { getMostViewedBlogPosts } from '@/lib/db-operations';

export async function GET(request: NextRequest) {
  try {
    // Get most viewed blog posts
    const posts = await getMostViewedBlogPosts(5);
    
    return NextResponse.json({
      success: true,
      message: 'Most viewed blog posts retrieved successfully',
      count: posts.length,
      posts: posts
    });
  } catch (error) {
    console.error('Most viewed posts retrieval error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Most viewed posts retrieval failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}