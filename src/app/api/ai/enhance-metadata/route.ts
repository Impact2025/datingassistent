/**
 * AI ENHANCE METADATA API
 *
 * Generates optimized SEO and social media metadata for blog posts.
 * Creates platform-specific content for Facebook, Twitter, and LinkedIn.
 *
 * @route POST /api/ai/enhance-metadata
 * @access Admin only
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { enhanceMetadata } from '@/lib/ai-blog-service';
import { logger } from '@/lib/logger';

// ============================================================================
// TYPES
// ============================================================================

interface EnhanceMetadataRequest {
  title: string;
  content: string;
  excerpt?: string;
  focusKeyword?: string;
  category?: string;
}

// ============================================================================
// POST: ENHANCE METADATA
// ============================================================================

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    // 🔒 SECURITY: Verify admin authentication
    await requireAdmin(request);

    // Parse request body
    const body: EnhanceMetadataRequest = await request.json();

    // Validation
    if (!body.title || !body.content) {
      return NextResponse.json(
        {
          success: false,
          error: 'Titel en content zijn verplicht',
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

    logger.log(`🤖 Enhancing metadata for: "${body.title}"`);

    // Call AI service
    const result = await enhanceMetadata({
      title: body.title,
      content: body.content,
      excerpt: body.excerpt,
      focusKeyword: body.focusKeyword,
      category: body.category,
    });

    const duration = Date.now() - startTime;
    logger.log(`✅ Metadata enhancement completed in ${duration}ms`);

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
    console.error('❌ Metadata enhancement error:', error);

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

    logger.log(`❌ enhance-metadata failed (${Date.now() - startTime}ms):`, errorMessage);

    return NextResponse.json(
      {
        success: false,
        error: isApiKeyError ? errorMessage : 'Metadata verbetering mislukt',
        details: !isApiKeyError ? errorMessage : undefined,
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
