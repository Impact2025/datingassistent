import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { sql } from '@vercel/postgres';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const testId = searchParams.get('testId');
    const userId = searchParams.get('userId');

    if (!testId || !userId) {
      return NextResponse.json({ error: 'Missing testId or userId' }, { status: 400 });
    }

    // Get A/B test variant for user (simplified - just return a variant)
    // In a real implementation, you'd have test configurations stored in DB
    const variants = {
      'quiz_flow': ['original_flow', 'optimized_flow'],
      'ai_prompts': ['generic_prompt', 'cultural_prompt', 'personalized_prompt'],
      'profile_variants': ['three_variants', 'five_variants']
    };

    const testVariants = variants[testId as keyof typeof variants];
    if (!testVariants) {
      return NextResponse.json({ variant: 'default' });
    }

    // Simple hash-based assignment for consistency
    const hash = simpleHash(userId + testId);
    const variantIndex = hash % testVariants.length;
    const selectedVariant = testVariants[variantIndex];

    return NextResponse.json({ variant: selectedVariant });
  } catch (error) {
    console.error('A/B testing API error:', error);
    return NextResponse.json({ variant: 'default' });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    const { testId, variantId, event } = await request.json();

    if (!testId || !variantId || !event) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Track conversion (simplified - just log it)
    console.log(`A/B Test Conversion: ${testId} - ${variantId} - ${user.id} - ${event}`);

    // In a real implementation, you'd store this in the database
    // await sql`INSERT INTO ab_test_conversions ...`

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('A/B testing conversion error:', error);
    return NextResponse.json({ error: 'Failed to track conversion' }, { status: 500 });
  }
}

function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}