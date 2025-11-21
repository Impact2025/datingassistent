import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { CoachingProfileService } from '@/lib/coaching-profile-service';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-in-production'
);

async function getUserIdFromToken(request: NextRequest): Promise<number | null> {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.substring(7);
    const { payload } = await jwtVerify(token, JWT_SECRET);

    if (payload.user && typeof payload.user === 'object' && 'id' in payload.user) {
      return payload.user.id as number;
    } else if (payload.userId) {
      return payload.userId as number;
    }

    return null;
  } catch (error) {
    return null;
  }
}

/**
 * GET /api/coaching-profile/next-action
 * Get next recommended action for user
 */
export async function GET(request: NextRequest) {
  try {
    const userId = await getUserIdFromToken(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const nextAction = await CoachingProfileService.getNextAction(userId);

    if (!nextAction) {
      return NextResponse.json(
        { error: 'Failed to determine next action' },
        { status: 500 }
      );
    }

    return NextResponse.json(nextAction);
  } catch (error) {
    console.error('Error in GET /api/coaching-profile/next-action:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
