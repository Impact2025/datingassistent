import { NextResponse } from 'next/server';
import { generateBlog } from '@/lib/ai-service';

/**
 * Test en vergelijk verschillende AI providers
 * Gebruik: GET http://localhost:9002/api/test-ai-comparison?provider=openrouter
 * Of: GET http://localhost:9002/api/test-ai-comparison?provider=openrouter
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  // Change default provider from 'gemini' to 'openrouter'
  const providerParam = searchParams.get('provider');
  const provider = (providerParam === 'claude' || providerParam === 'openrouter') ? providerParam : 'openrouter';

  try {
    console.log(`🔄 Genereren blog met ${provider}...`);
    const start = Date.now();

    const blog = await generateBlog(
      {
        primaryKeyword: 'online dating tips',
        category: 'Dating Tips',
        year: '2025',
        articleLength: 'Kort (400-600 woorden)',
      },
      provider as any // Type assertion to bypass type checking
    );

    const duration = Date.now() - start;

    const result = {
      success: true,
      provider: provider,
      duration: `${(duration / 1000).toFixed(2)}s`,
      blog: {
        title: blog.title,
        metaTitle: blog.metaTitle,
        metaDescription: blog.metaDescription,
        slug: blog.slug,
        contentLength: blog.content.length,
        keywords: blog.keywords,
        excerpt: blog.excerpt,
        midjourneyPrompt: blog.midjourneyPrompt,
        socialMedia: {
          instagram: {
            captionLength: blog.socialMedia.instagram.caption.length,
            hashtagCount: blog.socialMedia.instagram.hashtags.length,
          },
          facebook: {
            postLength: blog.socialMedia.facebook.post.length,
            hashtagCount: blog.socialMedia.facebook.hashtags.length,
          },
          linkedin: {
            postLength: blog.socialMedia.linkedin.post.length,
            hashtagCount: blog.socialMedia.linkedin.hashtags.length,
          },
          twitter: {
            tweetLength: blog.socialMedia.twitter.tweet.length,
            hashtagCount: blog.socialMedia.twitter.hashtags.length,
          },
        },
      },
    };

    console.log(`✅ Blog gegenereerd met ${provider} in ${(duration / 1000).toFixed(2)}s`);

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error(`❌ Fout met ${provider}:`, error);
    return NextResponse.json(
      {
        success: false,
        provider: provider,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}