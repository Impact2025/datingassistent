import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

/**
 * Get all blog posts from Neon database
 * GET /api/blogs/list
 *
 * Query parameters:
 * - published: Filter by published status (true/false)
 */
export async function GET(request: Request) {
  try {
    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const publishedFilter = searchParams.get('published');

    // Build query with optional published filter
    let query;
    if (publishedFilter === 'true') {
      query = sql`
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
          category,
          created_at,
          updated_at
        FROM blogs
        WHERE published = true
        ORDER BY created_at DESC
      `;
    } else if (publishedFilter === 'false') {
      query = sql`
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
          category,
          created_at,
          updated_at
        FROM blogs
        WHERE published = false
        ORDER BY created_at DESC
      `;
    } else {
      query = sql`
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
          category,
          created_at,
          updated_at
        FROM blogs
        ORDER BY created_at DESC
      `;
    }

    const result = await query;

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
      category: row.category,
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
