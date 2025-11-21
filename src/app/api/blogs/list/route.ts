import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

/**
 * Get all blog posts from Neon database
 * GET /api/blogs/list
 */
export async function GET() {
  try {
    const result = await sql`
      SELECT
        id,
        title,
        excerpt,
        content,
        image,
        placeholder_text,
        slug,
        meta_title,
        meta_description,
        keywords,
        author,
        published,
        publish_date,
        views,
        created_at,
        updated_at
      FROM blogs
      ORDER BY created_at DESC
    `;

    const blogs = result.rows.map(row => ({
      id: row.id,
      title: row.title,
      excerpt: row.excerpt,
      content: row.content,
      image: row.image,
      placeholder_text: row.placeholder_text,
      slug: row.slug,
      metaTitle: row.meta_title,
      metaDescription: row.meta_description,
      keywords: typeof row.keywords === 'string' ? JSON.parse(row.keywords) : row.keywords,
      author: row.author,
      published: row.published,
      publishDate: row.publish_date,
      views: row.views,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));

    return NextResponse.json({
      success: true,
      blogs,
    });
  } catch (error) {
    console.error('Blog list error:', error);
    return NextResponse.json(
      {
        error: 'Kon blogs niet ophalen',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
