import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function GET(request: NextRequest) {
  try {
    const query = request.nextUrl.searchParams.get('q');
    const categoryId = request.nextUrl.searchParams.get('categoryId');
    const limit = parseInt(request.nextUrl.searchParams.get('limit') || '20');

    if (!query || query.trim().length < 2) {
      return NextResponse.json(
        { error: 'Search query must be at least 2 characters' },
        { status: 400 }
      );
    }

    // Build parameterized query to prevent SQL injection
    const searchTerm = `%${query.trim()}%`;
    let sqlQuery = `
      SELECT fp.*, u.name as user_name, fc.name as category_name, fc.color as category_color,
             upe.profile_picture_url
      FROM forum_posts fp
      JOIN users u ON fp.user_id = u.id
      JOIN forum_categories fc ON fp.category_id = fc.id
      LEFT JOIN user_profiles_extended upe ON fp.user_id = upe.user_id
      WHERE (fp.title ILIKE $1 OR fp.content ILIKE $1)
    `;

    const params: (string | number)[] = [searchTerm];

    if (categoryId) {
      sqlQuery += ' AND fp.category_id = $2';
      params.push(parseInt(categoryId));
    }

    sqlQuery += ' ORDER BY fp.created_at DESC LIMIT $' + (params.length + 1);
    params.push(limit);

    const result = await sql.query(sqlQuery, params);

    const posts = result.rows.map(row => ({
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
        profilePictureUrl: row.profile_picture_url
      },
      category: {
        id: row.category_id,
        name: row.category_name,
        color: row.category_color,
        description: '',
        icon: '',
        sortOrder: 0,
        createdAt: ''
      }
    }));

    return NextResponse.json({
      posts,
      query: query.trim(),
      total: posts.length
    }, { status: 200 });

  } catch (error) {
    console.error('Forum search error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}