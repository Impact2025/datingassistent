import { NextRequest, NextResponse } from 'next/server';
import { incrementBlogViewCount } from '@/lib/db-operations';

export async function POST(request: NextRequest) {
  try {
    // Increment view counts multiple times for different posts
    const viewCounts = [
      { slug: 'test-post', increments: 5 },    // Total: 6 (1 from previous + 5)
      { slug: 'second-post', increments: 3 },  // Total: 3
      { slug: 'third-post', increments: 7 },   // Total: 7
      { slug: 'fourth-post', increments: 2 }   // Total: 2
    ];

    const results = [];
    
    for (const { slug, increments } of viewCounts) {
      let newViewCount = 0;
      for (let i = 0; i < increments; i++) {
        newViewCount = await incrementBlogViewCount(slug);
      }
      results.push({ slug, finalViewCount: newViewCount });
    }
    
    return NextResponse.json({
      success: true,
      message: 'View counts incremented successfully',
      results: results
    });
  } catch (error) {
    console.error('View counts increment error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'View counts increment failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}