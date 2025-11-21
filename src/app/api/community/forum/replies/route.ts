import { NextRequest, NextResponse } from 'next/server';
import { getForumRepliesByPost, createForumReply } from '@/lib/community-db';

export async function GET(request: NextRequest) {
  try {
    const postId = request.nextUrl.searchParams.get('postId');

    if (!postId) {
      return NextResponse.json(
        { error: 'postId is required' },
        { status: 400 }
      );
    }

    const replies = await getForumRepliesByPost(parseInt(postId));

    return NextResponse.json({
      replies
    }, { status: 200 });

  } catch (error) {
    console.error('Get forum replies error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId, postId, content } = await request.json();

    if (!userId || !postId || !content) {
      return NextResponse.json(
        { error: 'userId, postId, and content are required' },
        { status: 400 }
      );
    }

    const reply = await createForumReply(
      parseInt(userId), 
      parseInt(postId), 
      content
    );

    return NextResponse.json({
      reply
    }, { status: 200 });

  } catch (error) {
    console.error('Create forum reply error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}