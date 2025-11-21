import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const categoryId = searchParams.get('categoryId');
    const sortBy = searchParams.get('sortBy') || 'newest';
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    if (!query || query.trim().length < 2) {
      return NextResponse.json(
        { error: 'Search query must be at least 2 characters' },
        { status: 400 }
      );
    }

    // Build search conditions
    const searchConditions = [];
    const params: any[] = [];
    let paramIndex = 1;

    // Full-text search on title and content
    const searchTerm = `%${query.trim()}%`;
    searchConditions.push(`(fp.title ILIKE $${paramIndex} OR fp.content ILIKE $${paramIndex})`);
    params.push(searchTerm);
    paramIndex++;

    // Optional category filter
    if (categoryId) {
      searchConditions.push(`fp.category_id = $${paramIndex}`);
      params.push(parseInt(categoryId));
      paramIndex++;
    }

    const whereClause = searchConditions.join(' AND ');

    // Build sort order
    let orderBy = 'fp.created_at DESC'; // default: newest
    switch (sortBy) {
      case 'oldest':
        orderBy = 'fp.created_at ASC';
        break;
      case 'most-viewed':
        orderBy = 'fp.views DESC';
        break;
      case 'most-replies':
        orderBy = 'fp.replies_count DESC';
        break;
      case 'newest':
      default:
        orderBy = 'fp.created_at DESC';
        break;
    }

    // Build dynamic query
    const baseQuery = `
      SELECT
        fp.id,
        fp.title,
        fp.content,
        fp.created_at,
        fp.updated_at,
        fp.views,
        fp.replies_count,
        fp.user_id,
        u.name as user_name,
        fc.name as category_name,
        fc.id as category_id,
        CASE
          WHEN fp.title ILIKE $1 THEN 3
          WHEN fp.content ILIKE $1 THEN 1
          ELSE 2
        END as relevance_score
      FROM forum_posts fp
      JOIN users u ON fp.user_id = u.id
      JOIN forum_categories fc ON fp.category_id = fc.id
      WHERE (fp.title ILIKE $1 OR fp.content ILIKE $1)
    `;

    const countBaseQuery = `
      SELECT COUNT(*) as total
      FROM forum_posts fp
      WHERE (fp.title ILIKE $1 OR fp.content ILIKE $1)
    `;

    // Add category filter
    const categoryFilter = categoryId ? ' AND fp.category_id = $2' : '';
    const queryParams = categoryId ? [searchTerm, parseInt(categoryId)] : [searchTerm];

    // Add ordering
    let orderClause = 'ORDER BY relevance_score DESC, fp.created_at DESC'; // default: newest
    switch (sortBy) {
      case 'oldest':
        orderClause = 'ORDER BY relevance_score DESC, fp.created_at ASC';
        break;
      case 'most-viewed':
        orderClause = 'ORDER BY relevance_score DESC, fp.views DESC';
        break;
      case 'most-replies':
        orderClause = 'ORDER BY relevance_score DESC, fp.replies_count DESC';
        break;
    }

    // Execute search query
    const searchQuery = `${baseQuery}${categoryFilter} ${orderClause} LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}`;
    const result = await sql.query(searchQuery, [...queryParams, limit, offset]);

    // Get total count
    const countQuery = `${countBaseQuery}${categoryFilter}`;
    const countResult = await sql.query(countQuery, queryParams);

    return NextResponse.json({
      posts: result.rows,
      total: parseInt(countResult.rows[0].total),
      query,
      categoryId: categoryId ? parseInt(categoryId) : null,
      sortBy,
      limit,
      offset
    }, { status: 200 });

  } catch (error) {
    console.error('Forum search error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}