import { NextRequest, NextResponse } from 'next/server';
import { getMostViewedBlogPosts, getLatestBlogPosts } from '@/lib/db-operations';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // 'latest' or 'most-viewed'
    const limitParam = searchParams.get('limit');
    const limit = limitParam ? parseInt(limitParam) : (type ? 20 : 100); // Default to 100 if no type specified

    let blogs;

    if (type === 'most-viewed') {
      blogs = await getMostViewedBlogPosts(limit);
    } else {
      // Default to latest
      blogs = await getLatestBlogPosts(limit);
    }

    return NextResponse.json(blogs);
  } catch (error) {
    console.error('Error fetching blogs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch blogs' },
      { status: 500 }
    );
  }
}