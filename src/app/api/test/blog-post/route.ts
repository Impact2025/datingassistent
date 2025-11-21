import { NextRequest, NextResponse } from 'next/server';
import { getBlogPostBySlug } from '@/lib/db-operations';

export async function GET(request: NextRequest) {
  try {
    // Test blog post retrieval
    const slug = 'test-post'; // Use a test slug
    const post = await getBlogPostBySlug(slug);
    
    return NextResponse.json({
      success: true,
      message: 'Blog post retrieval test completed',
      post: post,
      slug: slug
    });
  } catch (error) {
    console.error('Blog post retrieval error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Blog post retrieval failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}