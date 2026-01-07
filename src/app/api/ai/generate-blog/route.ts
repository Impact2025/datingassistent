/**
 * AI GENERATE BLOG API
 *
 * Generates complete blog posts from keywords and topic.
 * Creates title, content, metadata, and SEO optimization.
 *
 * @route POST /api/ai/generate-blog
 * @access Admin only
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { generateBlog } from '@/lib/ai-blog-service';

// ============================================================================
// TYPES
// ============================================================================

interface GenerateBlogRequest {
  primaryKeyword: string;
  category: string;
  targetAudience?: string;
  topic?: string;
  toneOfVoice?: string;
  articleLength?: 'short' | 'medium' | 'long';
}

// ============================================================================
// POST: GENERATE BLOG
// ============================================================================

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    // 🔒 SECURITY: Verify admin authentication
    await requireAdmin(request);

    // Parse request body
    const body: GenerateBlogRequest = await request.json();

    // Validation
    if (!body.primaryKeyword || !body.category) {
      return NextResponse.json(
        {
          success: false,
          error: 'Primary keyword en categorie zijn verplicht',
        },
        { status: 400 }
      );
    }

    if (body.primaryKeyword.length < 3) {
      return NextResponse.json(
        {
          success: false,
          error: 'Primary keyword moet minimaal 3 karakters zijn',
        },
        { status: 400 }
      );
    }

    console.log(`🤖 Generating blog for keyword: "${body.primaryKeyword}"`);

    // Call AI service
    const result = await generateBlog({
      primaryKeyword: body.primaryKeyword,
      category: body.category,
      targetAudience: body.targetAudience,
      topic: body.topic,
      toneOfVoice: body.toneOfVoice,
      articleLength: body.articleLength || 'medium',
    });

    const duration = Date.now() - startTime;
    console.log(`✅ Blog generation completed in ${duration}ms`);

    return NextResponse.json(
      {
        success: true,
        blog: result,
      },
      {
        headers: {
          'X-Duration-Ms': duration.toString(),
        },
      }
    );
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error('❌ Blog generation error:', error);

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
        error: isApiKeyError ? errorMessage : 'Blog generatie mislukt',
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
