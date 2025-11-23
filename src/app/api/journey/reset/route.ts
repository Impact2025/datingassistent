import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { sql } from '@vercel/postgres';

export async function POST(request: NextRequest) {
  try {
    // Require authentication
    const user = await requireAuth(request);

    const { userId } = await request.json();

    // Only allow resetting journey for the authenticated user or admin
    if (user.id !== parseInt(userId) && !['v_mun@hotmail.com', 'v.munster@weareimpact.nl'].includes(user.email)) {
      return NextResponse.json(
        { error: 'Unauthorized to reset this journey' },
        { status: 403 }
      );
    }

    // Reset journey status to allow fresh onboarding
    await sql`
      DELETE FROM user_journeys
      WHERE user_id = ${parseInt(userId)}
    `;

    // Reset to initial state
    await sql`
      INSERT INTO user_journeys (user_id, current_step, completed_steps, status, created_at, updated_at)
      VALUES (${parseInt(userId)}, 'profile', '[]', 'in_progress', NOW(), NOW())
      ON CONFLICT (user_id)
      DO UPDATE SET
        current_step = 'profile',
        completed_steps = '[]',
        status = 'in_progress',
        updated_at = NOW()
    `;

    console.log(`✅ Journey reset for user ${userId} - fresh onboarding enabled`);

    return NextResponse.json({
      success: true,
      message: 'Journey reset successfully'
    });

  } catch (error) {
    console.error('❌ Error resetting journey:', error);

    if (error instanceof Error) {
      if (error.message === 'Unauthorized') {
        return NextResponse.json(
          { error: 'Authentication required' },
          { status: 401 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Failed to reset journey' },
      { status: 500 }
    );
  }
}