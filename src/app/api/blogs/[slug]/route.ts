import { NextRequest, NextResponse } from 'next/server';
import { getBlogPostBySlug, incrementBlogViewCount } from '@/lib/db-operations';
import { sql } from '@vercel/postgres';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    let blog;

    // Check if slug is a numeric ID (for Pro Editor)
    const isNumericId = /^\d+$/.test(slug);

    if (isNumericId) {
      // Fetch by ID (for editor)
      const blogId = parseInt(slug, 10);
      const result = await sql`
        SELECT *
        FROM blogs
        WHERE id = ${blogId}
        LIMIT 1
      `;

      if (result.rows.length > 0) {
        blog = {
          blog: result.rows[0]
        };
      }
    } else {
      // Fetch by slug (for frontend)
      const blogPost = await getBlogPostBySlug(slug);
      if (blogPost) {
        blog = { blog: blogPost };
      }
    }

    if (!blog) {
      return NextResponse.json(
        { error: 'Blog not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(blog);
  } catch (error) {
    console.error('Error fetching blog:', error);
    return NextResponse.json(
      { error: 'Failed to fetch blog' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const body = await request.json();

    if (body.action === 'increment-views') {
      const newViewCount = await incrementBlogViewCount(slug);
      return NextResponse.json({ viewCount: newViewCount });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error updating blog:', error);
    return NextResponse.json(
      { error: 'Failed to update blog' },
      { status: 500 }
    );
  }
}