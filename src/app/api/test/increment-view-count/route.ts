import { NextRequest, NextResponse } from 'next/server';
import { incrementBlogViewCount } from '@/lib/db-operations';

export async function POST(request: NextRequest) {
  try {
    const { slug } = await request.json();
    
    if (!slug) {
      return NextResponse.json(
        { error: 'Slug is required' },
        { status: 400 }
      );
    }

    // Increment view count
    const newViewCount = await incrementBlogViewCount(slug);
    
    return NextResponse.json({
      success: true,
      message: 'View count incremented successfully',
      slug: slug,
      newViewCount: newViewCount
    });
  } catch (error) {
    console.error('View count increment error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'View count increment failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}