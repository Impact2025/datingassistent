import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import * as fs from 'fs';
import * as path from 'path';
import { requireAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

interface BlogPost {
  id: number;
  title: string;
  excerpt: string;
  content: string;
  slug: string;
  published: boolean;
  publish_date?: string;
  created_at?: string;
  image?: string;
  category?: string;
  tags?: string[];
  keywords?: string[];
  author?: string;
  cover_image_url?: string;
  cover_image_alt?: string;
  seo_title?: string;
  seo_description?: string;
}

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request);

    const rawBuffer = fs.readFileSync(path.join(process.cwd(), 'blog_list.json'));
    let rawText = rawBuffer.toString('utf16le');
    if (rawText.charCodeAt(0) === 0xFEFF) {
      rawText = rawText.slice(1);
    }
    const data = JSON.parse(rawText);

    if (!data.success || !Array.isArray(data.blogs)) {
      return NextResponse.json({ error: 'Invalid blog_list.json format' }, { status: 500 });
    }

    const blogs: BlogPost[] = data.blogs;
    const results: { slug: string; status: string }[] = [];

    for (const blog of blogs) {
      try {
        const existing = await sql`SELECT id FROM blogs WHERE slug = ${blog.slug} LIMIT 1`;

        if (existing.rows.length > 0) {
          await sql`
            UPDATE blogs SET
              title = ${blog.title},
              excerpt = ${blog.excerpt},
              content = ${blog.content},
              published = ${blog.published !== false},
              image = ${blog.image || null},
              category = ${blog.category || null},
              tags = ${blog.tags ? JSON.stringify(blog.tags) : null},
              keywords = ${blog.keywords ? JSON.stringify(blog.keywords) : null},
              author = ${blog.author || 'DatingAssistent'},
              seo_title = ${blog.seo_title || null},
              seo_description = ${blog.seo_description || null},
              updated_at = NOW()
            WHERE slug = ${blog.slug}
          `;
          results.push({ slug: blog.slug, status: 'updated' });
        } else {
          await sql`
            INSERT INTO blogs (
              slug, title, excerpt, content, published,
              image, category, tags, keywords, author,
              cover_image_url, cover_image_alt,
              seo_title, seo_description,
              publish_date, created_at, updated_at
            ) VALUES (
              ${blog.slug}, ${blog.title}, ${blog.excerpt || ''}, ${blog.content},
              ${blog.published !== false},
              ${blog.image || null}, ${blog.category || 'Dating Tips'},
              ${blog.tags ? JSON.stringify(blog.tags) : '[]'},
              ${blog.keywords ? JSON.stringify(blog.keywords) : '[]'},
              ${blog.author || 'DatingAssistent'},
              ${blog.image || null}, ${null},
              ${blog.seo_title || null}, ${blog.seo_description || null},
              ${blog.publish_date ? new Date(blog.publish_date) : new Date()},
              NOW(), NOW()
            )
          `;
          results.push({ slug: blog.slug, status: 'inserted' });
        }
      } catch (err: any) {
        results.push({ slug: blog.slug, status: `error: ${err.message}` });
      }
    }

    return NextResponse.json({
      success: true,
      total: blogs.length,
      results,
      tip: 'Dien daarna de sitemap opnieuw in via GSC of IndexNow',
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
