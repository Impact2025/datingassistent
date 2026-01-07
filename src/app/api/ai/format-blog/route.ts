/**
 * AI FORMAT BLOG API
 *
 * Formats and optimizes blog content with complete structure and metadata.
 * Transforms raw content into professional, SEO-optimized blog posts.
 *
 * @route POST /api/ai/format-blog
 * @access Admin only
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { formatBlog } from '@/lib/ai-blog-service';

// ============================================================================
// TYPES
// ============================================================================

interface FormatBlogRequest {
  rawContent: string;
  title: string;
  category: string;
  focusKeyword?: string;
  targetLength?: 'short' | 'medium' | 'long';
}

// ============================================================================
// POST: FORMAT BLOG
// ============================================================================

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    // 🔒 SECURITY: Verify admin authentication
    await requireAdmin(request);

    // Parse request body
    const body: FormatBlogRequest = await request.json();

    // Validation
    if (!body.rawContent || !body.title || !body.category) {
      return NextResponse.json(
        {
          success: false,
          error: 'RawContent, titel en categorie zijn verplicht',
        },
        { status: 400 }
      );
    }

    if (body.rawContent.length < 100) {
      return NextResponse.json(
        {
          success: false,
          error: 'Content moet minimaal 100 karakters zijn',
        },
        { status: 400 }
      );
    }

    console.log(`🤖 Formatting blog: "${body.title}"`);

    // Call AI service
    const result = await formatBlog({
      rawContent: body.rawContent,
      title: body.title,
      category: body.category,
      focusKeyword: body.focusKeyword,
      targetLength: body.targetLength || 'medium',
    });

    const duration = Date.now() - startTime;
    console.log(`✅ Blog formatting completed in ${duration}ms`);

    return NextResponse.json(
      {
        success: true,
        ...result,
      },
      {
        headers: {
          'X-Duration-Ms': duration.toString(),
        },
      }
    );
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error('❌ Blog formatting error:', error);

    // 🔒 SECURITY: Handle authentication errors
    if (error instanceof Error) {
      if (error.message === 'Unauthorized') {
        return NextResponse.json(
          {
            success: false,
            error: 'Niet geautoriseerd',
          },
          { status: 401 }
        );
      }
      if (error.message.includes('Forbidden')) {
        return NextResponse.json(
          {
            success: false,
            error: 'Geen toegang',
          },
          { status: 403 }
        );
      }
    }

    // Provide specific error message for API key issues
    const errorMessage = error instanceof Error ? error.message : String(error);
    const isApiKeyError = errorMessage.includes('OPENROUTER_API_KEY');

    return NextResponse.json(
      {
        success: false,
        error: isApiKeyError ? errorMessage : 'Blog formattering mislukt',
        details: process.env.NODE_ENV === 'development' && !isApiKeyError
          ? errorMessage
          : undefined,
      },
      {
        status: isApiKeyError ? 503 : 500,
        headers: {
          'X-Duration-Ms': duration.toString(),
        },
      }
    );
  }
}
