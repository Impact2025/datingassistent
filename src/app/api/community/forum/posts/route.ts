import { NextRequest, NextResponse } from 'next/server';
import { getForumPostsByCategory, createForumPost } from '@/lib/community-db';

export async function GET(request: NextRequest) {
  try {
    const categoryId = request.nextUrl.searchParams.get('categoryId');
    const limit = request.nextUrl.searchParams.get('limit') || '20';
    const offset = request.nextUrl.searchParams.get('offset') || '0';

    if (!categoryId) {
      return NextResponse.json(
        { error: 'categoryId is required' },
        { status: 400 }
      );
    }

    const posts = await getForumPostsByCategory(
      parseInt(categoryId), 
      parseInt(limit), 
      parseInt(offset)
    );

    return NextResponse.json({
      posts
    }, { status: 200 });

  } catch (error) {
    console.error('Get forum posts error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId, categoryId, title, content } = await request.json();

    if (!userId || !categoryId || !title || !content) {
      return NextResponse.json(
        { error: 'userId, categoryId, title, and content are required' },
        { status: 400 }
      );
    }

    const post = await createForumPost(
      parseInt(userId), 
      parseInt(categoryId), 
      title, 
      content
    );

    return NextResponse.json({
      post
    }, { status: 200 });

  } catch (error) {
    console.error('Create forum post error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}