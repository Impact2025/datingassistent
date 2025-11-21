import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { ensureReviewPublishedColumn } from '@/lib/reviews-db';

/**
 * GET /api/reviews - Get all reviews or limited number
 * Query params:
 * - limit: number of reviews to return (default: all)
 * - published: filter by published status (default: true)
 */
export async function GET(request: NextRequest) {
  try {
    await ensureReviewPublishedColumn();

    const searchParams = request.nextUrl.searchParams;
    const limit = searchParams.get('limit');
    const publishedOnly = searchParams.get('published') !== 'false';

    let query = `
      SELECT 
        id,
        name,
        role,
        content,
        rating,
        avatar,
        created_at as "createdAt",
        published
      FROM reviews
    `;

    if (publishedOnly) {
      query += ' WHERE published = true';
    }

    query += ' ORDER BY created_at DESC';

    if (limit) {
      query += ` LIMIT ${parseInt(limit)}`;
    }

    const result = await sql.query(query);

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/reviews - Create a new review (admin only)
 */
export async function POST(request: NextRequest) {
  try {
    await ensureReviewPublishedColumn();

    const body = await request.json();
    const { name, role, content, rating, avatar, published = false } = body;

    // Validation
    if (!name || !content || !rating) {
      return NextResponse.json(
        { error: 'Name, content, and rating are required' },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      );
    }

    const result = await sql`
      INSERT INTO reviews (name, role, content, rating, avatar, published, created_at)
      VALUES (${name}, ${role || 'Gebruiker'}, ${content}, ${rating}, ${avatar || null}, ${published}, NOW())
      RETURNING *
    `;

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error('Error creating review:', error);
    return NextResponse.json(
      { error: 'Failed to create review' },
      { status: 500 }
    );
  }
}