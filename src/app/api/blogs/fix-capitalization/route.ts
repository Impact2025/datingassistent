import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

/**
 * Fix capitalization in blog content
 * POST /api/blogs/fix-capitalization
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Blog ID is required' },
        { status: 400 }
      );
    }

    // Get the blog
    const blogResult = await sql`
      SELECT id, title, excerpt, content FROM blogs WHERE id = ${id}
    `;

    if (blogResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Blog not found' },
        { status: 404 }
      );
    }

    const blog = blogResult.rows[0];

    // Function to capitalize first letter of each sentence
    const capitalizeSentences = (text: string): string => {
      return text.replace(/(^|[.!?]\s+)([a-z])/g, (match, p1, p2) => {
        return p1 + p2.toUpperCase();
      });
    };

    // Function to capitalize HTML content properly
    const capitalizeHTML = (html: string): string => {
      // Capitalize text inside HTML tags
      return html.replace(/>([^<]+)</g, (match, text) => {
        // Skip if it's just whitespace
        if (!text.trim()) return match;

        // Capitalize first letter and after sentence endings
        const capitalized = capitalizeSentences(text);
        return `>${capitalized}<`;
      });
    };

    // Capitalize title (first letter of each word)
    const capitalizedTitle = blog.title
      .split(' ')
      .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

    // Capitalize excerpt (first letter of sentences)
    const capitalizedExcerpt = capitalizeSentences(blog.excerpt);

    // Capitalize HTML content
    let capitalizedContent = capitalizeHTML(blog.content);

    // Also handle tag contents specifically
    capitalizedContent = capitalizedContent
      // Capitalize after opening tags
      .replace(/<(h[1-6]|p|strong|em|li)>([a-z])/g, (match, tag, letter) => {
        return `<${tag}>${letter.toUpperCase()}`;
      })
      // Capitalize after </strong>, </em> etc if followed by letter
      .replace(/<\/(strong|em)>\s*([a-z])/g, (match, tag, letter) => {
        return `</${tag}> ${letter.toUpperCase()}`;
      });

    // Update the blog
    const result = await sql`
      UPDATE blogs SET
        title = ${capitalizedTitle},
        excerpt = ${capitalizedExcerpt},
        content = ${capitalizedContent},
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING id, title, slug
    `;

    return NextResponse.json({
      success: true,
      message: 'Capitalization fixed successfully',
      blog: result.rows[0],
    });
  } catch (error) {
    console.error('Fix capitalization error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fix capitalization',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
