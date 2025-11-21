import { NextResponse } from 'next/server';
import { convertArticleToBlog } from '@/lib/ai-service';

/**
 * API endpoint voor artikel naar blog conversie
 * Gebruik: POST http://localhost:9002/api/test-openrouter/article-to-blog
 */
export async function POST(request: Request) {
  try {
    const input = await request.json();
    
    // Convert article to blog using the AI service
    const blog = await convertArticleToBlog(input, 'openrouter');
    
    return NextResponse.json(blog, { status: 200 });
  } catch (error) {
    console.error('❌ Artikel naar blog conversie gefaald:', error);
    return NextResponse.json(
      {
        error: 'Article to blog conversion failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}