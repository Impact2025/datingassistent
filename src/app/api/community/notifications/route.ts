import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID required' },
        { status: 400 }
      );
    }

    try {
      // Get notifications for followed posts with new replies
      const notifications = await sql`
        SELECT
          fr.id as reply_id,
          fr.content as reply_content,
          fr.created_at as reply_created_at,
          fp.id as post_id,
          fp.title as post_title,
          u.name as replier_name,
          uf.created_at as follow_created_at
        FROM forum_replies fr
        JOIN forum_posts fp ON fr.post_id = fp.id
        JOIN users u ON fr.user_id = u.id
        JOIN user_follows uf ON uf.target_type = 'post' AND uf.target_id = fp.id
        WHERE uf.user_id = ${parseInt(userId)}
          AND fr.created_at > uf.created_at
          AND fr.user_id != ${parseInt(userId)}
        ORDER BY fr.created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `;

      return NextResponse.json({
        notifications: notifications.rows,
        total: notifications.rows.length
      }, { status: 200 });
    } catch (dbError: any) {
      // If user_follows table doesn't exist, return empty notifications
      if (dbError.code === '42P01') {
        console.log('⚠️ user_follows table does not exist yet, returning empty notifications');
        return NextResponse.json({
          notifications: [],
          total: 0
        }, { status: 200 });
      }
      throw dbError;
    }

  } catch (error) {
    console.error('Get notifications error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId, type, message, relatedId } = await request.json();

    if (!userId || !type || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create notification (for future use - could be stored in database)
    const notification = {
      id: Date.now(),
      userId: parseInt(userId),
      type,
      message,
      relatedId: relatedId ? parseInt(relatedId) : null,
      createdAt: new Date().toISOString(),
      read: false
    };

    // For now, just return success - in production you'd store this
    return NextResponse.json({
      success: true,
      notification
    }, { status: 201 });

  } catch (error) {
    console.error('Create notification error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}