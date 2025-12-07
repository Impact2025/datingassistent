import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export const dynamic = 'force-dynamic';

/**
 * Save initial photo score from lead activation onboarding
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, score } = body;

    if (!userId || score === undefined) {
      return NextResponse.json(
        { error: 'userId and score are required' },
        { status: 400 }
      );
    }

    console.log('📊 Saving initial photo score for user:', userId, 'score:', score);

    await sql`
      UPDATE users
      SET initial_photo_score = ${score},
          updated_at = NOW()
      WHERE id = ${userId}
    `;

    console.log('✅ Initial photo score saved for user:', userId);

    return NextResponse.json({
      success: true,
      message: 'Initial photo score saved'
    });

  } catch (error) {
    console.error('❌ Failed to save initial photo score:', error);
    return NextResponse.json(
      { error: 'Failed to save initial photo score' },
      { status: 500 }
    );
  }
}
