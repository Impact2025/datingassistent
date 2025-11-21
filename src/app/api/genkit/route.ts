import { NextRequest, NextResponse } from 'next/server';
import { generateBlog } from '@/lib/ai-service';
import { convertArticleToBlog } from '@/lib/ai-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { flowName, input } = body;

    if (flowName === 'generateBlogPost') {
      // Execute blog generation with OpenRouter (Claude)
      const result = await generateBlog(input, 'openrouter');
      return NextResponse.json(result);
    } else if (flowName === 'articleToBlog') {
      // Execute article to blog conversion using the new AI service
      const result = await convertArticleToBlog(input, 'openrouter');
      return NextResponse.json(result);
    } else {
      return NextResponse.json(
        { error: 'Unknown flow name' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('OpenRouter API Error:', error);
    return NextResponse.json(
      { error: 'Failed to process request', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}