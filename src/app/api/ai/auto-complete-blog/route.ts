/**
 * AI AUTO-COMPLETE BLOG API
 *
 * Automatically generates missing blog fields (excerpt, slug) from title + content.
 * Used by the blog editor for smart saving.
 *
 * @route POST /api/ai/auto-complete-blog
 * @access Admin only
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { getOpenRouterClient, OPENROUTER_MODELS } from '@/lib/openrouter';

// ============================================================================
// TYPES
// ============================================================================

interface AutoCompleteRequest {
  title: string;
  content: string;
  category?: string;
}

interface AutoCompleteResult {
  excerpt: string;
  slug: string;
  seo_title: string;
  seo_description: string;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[àáâãäå]/g, 'a')
    .replace(/[èéêë]/g, 'e')
    .replace(/[ìíîï]/g, 'i')
    .replace(/[òóôõö]/g, 'o')
    .replace(/[ùúûü]/g, 'u')
    .replace(/[ñ]/g, 'n')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 100);
}

function extractExcerpt(content: string): string {
  // Strip HTML tags
  const textOnly = content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  // Get first 150-200 characters, ending at a word boundary
  if (textOnly.length <= 200) return textOnly;
  const truncated = textOnly.substring(0, 200);
  const lastSpace = truncated.lastIndexOf(' ');
  return lastSpace > 150 ? truncated.substring(0, lastSpace) + '...' : truncated + '...';
}

// ============================================================================
// POST: AUTO-COMPLETE BLOG
// ============================================================================

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    // Verify admin authentication
    await requireAdmin(request);

    const body: AutoCompleteRequest = await request.json();

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

    console.log(`🤖 Auto-completing blog: "${body.title}"`);

    // Generate slug from title (fast, no AI needed)
    const slug = generateSlug(body.title);

    // Try AI for excerpt, fall back to extraction if AI fails
    let excerpt: string;
    let seo_title: string = body.title;
    let seo_description: string;

    try {
      // Check if OpenRouter API key exists
      if (!process.env.OPENROUTER_API_KEY) {
        throw new Error('No API key');
      }

      const client = getOpenRouterClient();

      const prompt = `Genereer een excerpt en SEO metadata voor deze blog post. Wees beknopt.

TITEL: ${body.title}
${body.category ? `CATEGORIE: ${body.category}` : ''}

CONTENT (eerste 800 tekens):
${body.content.substring(0, 800)}...

Geef terug in exact dit JSON formaat (geen markdown code blocks):
{
  "excerpt": "Pakkende samenvatting van 2-3 zinnen (max 200 karakters)",
  "seo_title": "SEO titel (max 60 karakters)",
  "seo_description": "SEO omschrijving (max 155 karakters)"
}`;

      const response = await client.createChatCompletion(
        OPENROUTER_MODELS.CLAUDE_35_HAIKU,
        [
          {
            role: 'system',
            content: 'Je bent een blog editor. Geef alleen JSON terug, geen markdown.'
          },
          { role: 'user', content: prompt }
        ],
        {
          max_tokens: 500,
          temperature: 0.3,
        }
      );

      // Parse AI response
      let aiResult;
      try {
        // Try to extract JSON from markdown code blocks first
        const jsonMatch = response.match(/```json\n([\s\S]*?)\n```/) || response.match(/```\n([\s\S]*?)\n```/);
        if (jsonMatch) {
          aiResult = JSON.parse(jsonMatch[1]);
        } else {
          aiResult = JSON.parse(response);
        }
      } catch {
        // If parsing fails, try to find JSON in response
        const jsonStart = response.indexOf('{');
        const jsonEnd = response.lastIndexOf('}');
        if (jsonStart !== -1 && jsonEnd !== -1) {
          aiResult = JSON.parse(response.substring(jsonStart, jsonEnd + 1));
        } else {
          throw new Error('Could not parse AI response');
        }
      }

      excerpt = aiResult.excerpt || extractExcerpt(body.content);
      seo_title = aiResult.seo_title || body.title;
      seo_description = aiResult.seo_description || excerpt;

    } catch (aiError) {
      console.log('AI auto-complete failed, using fallback extraction:', aiError);
      // Fallback to simple extraction
      excerpt = extractExcerpt(body.content);
      seo_description = excerpt;
    }

    const duration = Date.now() - startTime;
    console.log(`✅ Auto-complete finished in ${duration}ms`);

    const result: AutoCompleteResult = {
      excerpt,
      slug,
      seo_title,
      seo_description,
    };

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
    console.error('❌ Auto-complete error:', error);

    // Handle authentication errors
    if (error instanceof Error) {
      if (error.message === 'Unauthorized') {
        return NextResponse.json(
          { success: false, error: 'Niet geautoriseerd' },
          { status: 401 }
        );
      }
      if (error.message.includes('Forbidden')) {
        return NextResponse.json(
          { success: false, error: 'Geen toegang' },
          { status: 403 }
        );
      }
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Auto-complete mislukt',
        details: process.env.NODE_ENV === 'development'
          ? (error instanceof Error ? error.message : String(error))
          : undefined,
      },
      {
        status: 500,
        headers: {
          'X-Duration-Ms': duration.toString(),
        },
      }
    );
  }
}
