/**
 * AI OPTIMIZE BLOG API
 *
 * Analyzes blog content structure for SEO and readability.
 * Provides actionable suggestions for improvement.
 *
 * @route POST /api/ai/optimize-blog
 * @access Admin only
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { optimizeBlogContent } from '@/lib/ai-blog-service';

// ============================================================================
// TYPES
// ============================================================================

interface OptimizeRequest {
  content: string;
  title: string;
  focusKeyword?: string;
}

// ============================================================================
// POST: OPTIMIZE BLOG CONTENT
// ============================================================================

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    // 🔒 SECURITY: Verify admin authentication
    await requireAdmin(request);

    // Parse request body
    const body: OptimizeRequest = await request.json();

    // Validation
    if (!body.content || !body.title) {
      return NextResponse.json(
        {
          success: false,
          error: 'Content en titel zijn verplicht',
        },
        { status: 400 }
      );
    }

    if (body.content.length < 100) {
      return NextResponse.json(
        {
          success: false,
          error: 'Content moet minimaal 100 karakters zijn',
        },
        { status: 400 }
      );
    }

    console.log(`🤖 Optimizing blog: "${body.title}"`);

    // Call AI service
    const result = await optimizeBlogContent({
      content: body.content,
      title: body.title,
      focusKeyword: body.focusKeyword,
    });

    const duration = Date.now() - startTime;
    console.log(`✅ Blog optimization completed in ${duration}ms`);

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
    console.error('❌ Blog optimization error:', error);

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
        error: isApiKeyError ? errorMessage : 'Blog optimalisatie mislukt',
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
