import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

/**
 * Save blog post to Neon database
 * POST /api/blogs/save
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
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
      midjourneyPrompt,
      publishDate,

      // New fields (Blog V2)
      category = 'Online Dating Tips',
      tags = [],
      cover_image_url,
      cover_image_alt,
      cover_image_blob_id,
      header_type = 'image',
      header_color = '#ec4899',
      header_title,
      seo_title,
      seo_description,
      social_title,
      social_description,
      reading_time,
      author = 'DatingAssistent',
      author_bio,
      author_avatar,
      published = false, // Default to draft
      published_at,
    } = body;

    // Validatie
    if (!title || !content || !slug) {
      return NextResponse.json(
        { error: 'Title, content en slug zijn verplicht' },
        { status: 400 }
      );
    }

    // Check of slug al bestaat
    const existingBlog = await sql`
      SELECT id FROM blogs WHERE slug = ${slug}
    `;

    if (existingBlog.rows.length > 0) {
      return NextResponse.json(
        { error: 'Een blog met deze slug bestaat al. Kies een andere slug.' },
        { status: 400 }
      );
    }

    // Insert blog with all V2 fields
    const result = await sql`
      INSERT INTO blogs (
        title,
        excerpt,
        content,
        slug,

        -- Legacy fields
        image,
        placeholder_text,
        meta_title,
        meta_description,
        keywords,
        midjourney_prompt,
        publish_date,

        -- New V2 fields
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
        views,
        created_at,
        updated_at
      ) VALUES (
        ${title},
        ${excerpt || ''},
        ${content},
        ${slug},

        -- Legacy fields
        ${image || cover_image_url || ''},
        ${placeholder_text || ''},
        ${metaTitle || seo_title || title},
        ${metaDescription || seo_description || excerpt || ''},
        ${JSON.stringify(keywords || [])},
        ${midjourneyPrompt || ''},
        ${publishDate || null},

        -- New V2 fields
        ${category},
        ${JSON.stringify(tags)},
        ${cover_image_url || null},
        ${cover_image_alt || null},
        ${cover_image_blob_id || null},
        ${header_type},
        ${header_color},
        ${header_title || null},
        ${seo_title || null},
        ${seo_description || null},
        ${social_title || null},
        ${social_description || null},
        ${reading_time || null},
        ${author},
        ${author_bio || null},
        ${author_avatar || null},
        ${published},
        ${published_at ? new Date(published_at) : (published ? new Date() : null)},
        0,
        NOW(),
        NOW()
      )
      RETURNING id, title, slug, category, published, published_at, created_at
    `;

    const blog = result.rows[0];

    return NextResponse.json({
      success: true,
      message: 'Blog succesvol opgeslagen',
      blog: {
        id: blog.id,
        title: blog.title,
        slug: blog.slug,
        createdAt: blog.created_at,
      },
    });
  } catch (error) {
    console.error('Blog save error:', error);
    return NextResponse.json(
      {
        error: 'Kon blog niet opslaan',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
