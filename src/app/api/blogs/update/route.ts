import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

/**
 * Update blog post in Neon database
 * PUT /api/blogs/update
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      id,
      title,
      excerpt,
      content,
      image,
      placeholder_text,
      metaTitle,
      metaDescription,
      slug,
      keywords,
      author,
      published,
      publishDate,
    } = body;

    // Validatie
    if (!id || !title || !content || !slug) {
      return NextResponse.json(
        { error: 'ID, title, content en slug zijn verplicht' },
        { status: 400 }
      );
    }

    // Check if slug is already used by another blog
    const existingBlog = await sql`
      SELECT id FROM blogs WHERE slug = ${slug} AND id != ${id}
    `;

    if (existingBlog.rows.length > 0) {
      return NextResponse.json(
        { error: 'Een andere blog gebruikt al deze slug. Kies een andere slug.' },
        { status: 400 }
      );
    }

    // Update blog
    const result = await sql`
      UPDATE blogs SET
        title = ${title},
        excerpt = ${excerpt || ''},
        content = ${content},
        image = ${image || ''},
        placeholder_text = ${placeholder_text || ''},
        meta_title = ${metaTitle || title},
        meta_description = ${metaDescription || excerpt || ''},
        slug = ${slug},
        keywords = ${JSON.stringify(keywords || [])},
        author = ${author || 'DatingAssistent'},
        published = ${published !== undefined ? published : false},
        publish_date = ${publishDate || null},
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING id, title, slug, updated_at
    `;

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Blog niet gevonden' },
        { status: 404 }
      );
    }

    const blog = result.rows[0];

    return NextResponse.json({
      success: true,
      message: 'Blog succesvol bijgewerkt',
      blog: {
        id: blog.id,
        title: blog.title,
        slug: blog.slug,
        updatedAt: blog.updated_at,
      },
    });
  } catch (error) {
    console.error('Blog update error:', error);
    return NextResponse.json(
      {
        error: 'Kon blog niet bijwerken',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
