import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

/**
 * Publish or unpublish a blog post
 * POST /api/blogs/publish
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, published } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Blog ID is required' },
        { status: 400 }
      );
    }

    // Update published status
    const result = await sql`
      UPDATE blogs
      SET published = ${published !== undefined ? published : true},
          updated_at = NOW()
      WHERE id = ${id}
      RETURNING id, title, slug, published
    `;

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Blog not found' },
        { status: 404 }
      );
    }

    const blog = result.rows[0];

    return NextResponse.json({
      success: true,
      message: blog.published ? 'Blog gepubliceerd' : 'Blog gedepubliceerd',
      blog: {
        id: blog.id,
        title: blog.title,
        slug: blog.slug,
        published: blog.published,
      },
    });
  } catch (error) {
    console.error('Blog publish error:', error);
    return NextResponse.json(
      {
        error: 'Kon blog status niet updaten',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
