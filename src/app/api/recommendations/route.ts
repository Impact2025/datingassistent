import { NextRequest, NextResponse } from 'next/server';
import { generateRecommendations } from '@/lib/recommendation-engine';
import { sql } from '@vercel/postgres';
import { requireUserAccess } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const userIdStr = request.nextUrl.searchParams.get('userId');

    if (!userIdStr) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    // 🔒 SECURITY: Validate userId format
    if (!/^\d+$/.test(userIdStr)) {
      return NextResponse.json(
        { error: 'Invalid userId format' },
        { status: 400 }
      );
    }

    const userId = parseInt(userIdStr, 10);

    // 🔒 SECURITY: Verify user is authenticated and authorized to access this data
    const authenticatedUser = await requireUserAccess(request, userId);

    // Get user profile
    const result = await sql`
      SELECT profile FROM users WHERE id = ${userId}
    `;

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const profile = result.rows[0].profile;
    if (!profile) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      );
    }

    // Generate recommendations
    const recommendations = await generateRecommendations(profile, parseInt(userId));

    return NextResponse.json({
      recommendations
    }, { status: 200 });

  } catch (error) {
    console.error('Get recommendations error:', error);

    // 🔒 SECURITY: Handle authentication errors
    if (error instanceof Error) {
      if (error.message === 'Unauthorized') {
        return NextResponse.json(
          { error: 'Unauthorized: Please login' },
          { status: 401 }
        );
      }
      if (error.message.includes('Forbidden')) {
        return NextResponse.json(
          { error: 'Forbidden: You can only view your own recommendations' },
          { status: 403 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}