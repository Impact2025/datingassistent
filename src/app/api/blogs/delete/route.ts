import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

/**
 * Delete blog post from Neon database
 * DELETE /api/blogs/delete?id=123
 */
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Blog ID is verplicht' },
        { status: 400 }
      );
    }

    // Check if blog exists
    const existingBlog = await sql`
      SELECT id, title FROM blogs WHERE id = ${id}
    `;

    if (existingBlog.rows.length === 0) {
      return NextResponse.json(
        { error: 'Blog niet gevonden' },
        { status: 404 }
      );
    }

    const blogTitle = existingBlog.rows[0].title;

    // Delete blog
    await sql`
      DELETE FROM blogs WHERE id = ${id}
    `;

    return NextResponse.json({
      success: true,
      message: `Blog "${blogTitle}" succesvol verwijderd`,
    });
  } catch (error) {
    console.error('Blog delete error:', error);
    return NextResponse.json(
      {
        error: 'Kon blog niet verwijderen',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
