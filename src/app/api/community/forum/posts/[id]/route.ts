import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const postId = id;

    if (!postId) {
      return NextResponse.json(
        { error: 'postId is required' },
        { status: 400 }
      );
    }

    // Get the specific post with user and category information
    const result = await sql`
      SELECT fp.*, u.name as user_name, fc.name as category_name, fc.color as category_color
      FROM forum_posts fp
      JOIN users u ON fp.user_id = u.id
      JOIN forum_categories fc ON fp.category_id = fc.id
      WHERE fp.id = ${postId}
    `;

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    const row = result.rows[0];
    const post = {
      id: row.id,
      categoryId: row.category_id,
      userId: row.user_id,
      title: row.title,
      content: row.content,
      views: row.views,
      repliesCount: row.replies_count,
      isPinned: row.is_pinned,
      isLocked: row.is_locked,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      user: {
        name: row.user_name,
        profilePictureUrl: null
      }
    };

    return NextResponse.json({
      post
    }, { status: 200 });

  } catch (error) {
    console.error('Get forum post error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const postId = id;
    const { userId, title, content } = await request.json();

    if (!postId || !userId || !title || !content) {
      return NextResponse.json(
        { error: 'postId, userId, title, and content are required' },
        { status: 400 }
      );
    }

    // Check if the user owns this post
    const postCheck = await sql`
      SELECT user_id FROM forum_posts WHERE id = ${postId}
    `;

    if (postCheck.rows.length === 0) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    if (postCheck.rows[0].user_id !== parseInt(userId)) {
      return NextResponse.json(
        { error: 'You can only edit your own posts' },
        { status: 403 }
      );
    }

    // Update the post
    const result = await sql`
      UPDATE forum_posts
      SET title = ${title}, content = ${content}, updated_at = NOW()
      WHERE id = ${postId}
      RETURNING *
    `;

    const row = result.rows[0];
    const post = {
      id: row.id,
      categoryId: row.category_id,
      userId: row.user_id,
      title: row.title,
      content: row.content,
      views: row.views,
      repliesCount: row.replies_count,
      isPinned: row.is_pinned,
      isLocked: row.is_locked,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };

    return NextResponse.json({
      post
    }, { status: 200 });

  } catch (error) {
    console.error('Update forum post error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}