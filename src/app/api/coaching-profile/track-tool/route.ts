import { NextRequest, NextResponse } from 'next/server';
import { CoachingProfileService } from '@/lib/coaching-profile-service';
import { verifyToken } from '@/lib/jwt-config';

async function getUserIdFromToken(request: NextRequest): Promise<number | null> {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.substring(7);
    const user = await verifyToken(token);

    return user?.id || null;
  } catch (error) {
    return null;
  }
}

/**
 * POST /api/coaching-profile/track-tool
 * Track tool usage for user
 */
export async function POST(request: NextRequest) {
  try {
    const userId = await getUserIdFromToken(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { toolName } = body;

    if (!toolName) {
      return NextResponse.json(
        { error: 'toolName is required' },
        { status: 400 }
      );
    }

    const success = await CoachingProfileService.trackToolUsage(userId, toolName);

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to track tool usage' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in POST /api/coaching-profile/track-tool:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
