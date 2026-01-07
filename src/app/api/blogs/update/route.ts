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
      slug,

      // Legacy fields
      image,
      placeholder_text,
      metaTitle,
      metaDescription,
      keywords,
      publishDate,

      // New V2 fields
      category,
      tags,
      cover_image_url,
      cover_image_alt,
      cover_image_blob_id,
      header_type,
      header_color,
      header_title,
      seo_title,
      seo_description,
      social_title,
      social_description,
      reading_time,
      author,
      author_bio,
      author_avatar,
      published,
      published_at,
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

    // Update blog with all V2 fields
    const result = await sql`
      UPDATE blogs SET
        title = ${title},
        excerpt = ${excerpt || ''},
        content = ${content},
        slug = ${slug},

        -- Legacy fields (backward compatibility)
        image = ${image || cover_image_url || ''},
        placeholder_text = ${placeholder_text || ''},
        meta_title = ${metaTitle || seo_title || title},
        meta_description = ${metaDescription || seo_description || excerpt || ''},
        keywords = ${JSON.stringify(keywords || [])},
        publish_date = ${publishDate || null},

        -- New V2 fields
        category = COALESCE(${category}, category),
        tags = COALESCE(${tags ? JSON.stringify(tags) : null}, tags),
        cover_image_url = COALESCE(${cover_image_url}, cover_image_url),
        cover_image_alt = COALESCE(${cover_image_alt}, cover_image_alt),
        cover_image_blob_id = COALESCE(${cover_image_blob_id}, cover_image_blob_id),
        header_type = COALESCE(${header_type}, header_type),
        header_color = COALESCE(${header_color}, header_color),
        header_title = COALESCE(${header_title}, header_title),
        seo_title = COALESCE(${seo_title}, seo_title),
        seo_description = COALESCE(${seo_description}, seo_description),
        social_title = COALESCE(${social_title}, social_title),
        social_description = COALESCE(${social_description}, social_description),
        reading_time = COALESCE(${reading_time}, reading_time),
        author = COALESCE(${author}, author),
        author_bio = COALESCE(${author_bio}, author_bio),
        author_avatar = COALESCE(${author_avatar}, author_avatar),
        published = COALESCE(${published}, published),
        published_at = COALESCE(${published_at ? new Date(published_at) : null}, published_at),
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING id, title, slug, category, published, published_at, updated_at
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
