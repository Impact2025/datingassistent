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
      image,
      placeholder_text,
      metaTitle,
      metaDescription,
      slug,
      keywords,
      midjourneyPrompt,
      publishDate,
      author = 'DatingAssistent',
      published = true, // Default to true so blogs appear on homepage/blog page
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

    // Insert blog
    const result = await sql`
      INSERT INTO blogs (
        title,
        excerpt,
        content,
        image,
        placeholder_text,
        meta_title,
        meta_description,
        slug,
        keywords,
        midjourney_prompt,
        publish_date,
        author,
        published,
        views,
        created_at,
        updated_at
      ) VALUES (
        ${title},
        ${excerpt || ''},
        ${content},
        ${image || ''},
        ${placeholder_text || ''},
        ${metaTitle || title},
        ${metaDescription || excerpt || ''},
        ${slug},
        ${JSON.stringify(keywords || [])},
        ${midjourneyPrompt || ''},
        ${publishDate || null},
        ${author},
        ${published},
        0,
        NOW(),
        NOW()
      )
      RETURNING id, title, slug, created_at
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
