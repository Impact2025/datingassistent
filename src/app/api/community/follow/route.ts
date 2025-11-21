import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function POST(request: NextRequest) {
  try {
    const { userId, targetType, targetId } = await request.json();

    if (!userId || !targetType || !targetId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    try {
      // Check if already following
      const existing = await sql`
        SELECT id FROM user_follows
        WHERE user_id = ${userId} AND target_type = ${targetType} AND target_id = ${targetId}
      `;

      if (existing.rows.length > 0) {
        // Unfollow
        await sql`
          DELETE FROM user_follows
          WHERE user_id = ${userId} AND target_type = ${targetType} AND target_id = ${targetId}
        `;
        return NextResponse.json({ action: 'unfollowed' }, { status: 200 });
      } else {
        // Follow
        await sql`
          INSERT INTO user_follows (user_id, target_type, target_id, created_at)
          VALUES (${userId}, ${targetType}, ${targetId}, NOW())
        `;
        return NextResponse.json({ action: 'followed' }, { status: 200 });
      }
    } catch (dbError: any) {
      // If table doesn't exist, return error but don't crash
      if (dbError.code === '42P01') {
        console.log('⚠️ user_follows table does not exist yet, follow functionality disabled');
        return NextResponse.json(
          { error: 'Follow functionality not available yet' },
          { status: 503 }
        );
      }
      throw dbError;
    }

  } catch (error) {
    console.error('Follow/unfollow error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const targetType = searchParams.get('targetType');
    const targetId = searchParams.get('targetId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID required' },
        { status: 400 }
      );
    }

    let query;
    let params: any[] = [userId];

    if (targetType && targetId) {
      // Check if specific item is followed
      query = sql`
        SELECT id, created_at FROM user_follows
        WHERE user_id = $1 AND target_type = $2 AND target_id = $3
      `;
      params = [userId, targetType, parseInt(targetId)];
    } else {
      // Get all followed items for user
      query = sql`
        SELECT uf.*, fp.title as post_title, fc.name as category_name
        FROM user_follows uf
        LEFT JOIN forum_posts fp ON uf.target_type = 'post' AND uf.target_id = fp.id
        LEFT JOIN forum_categories fc ON fp.category_id = fc.id
        WHERE uf.user_id = $1
        ORDER BY uf.created_at DESC
      `;
    }

    try {
      const result = await query;
      return NextResponse.json({ follows: result.rows }, { status: 200 });
    } catch (dbError: any) {
      // If table doesn't exist, return empty array
      if (dbError.code === '42P01') {
        console.log('⚠️ user_follows table does not exist yet, returning empty follows');
        return NextResponse.json({ follows: [] }, { status: 200 });
      }
      throw dbError;
    }

  } catch (error) {
    console.error('Get follows error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}