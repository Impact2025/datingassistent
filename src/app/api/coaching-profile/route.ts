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
 * GET /api/coaching-profile
 * Get coaching profile for current user
 */
export async function GET(request: NextRequest) {
  try {
    const userId = await getUserIdFromToken(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const profile = await CoachingProfileService.getOrCreateProfile(userId);

    if (!profile) {
      return NextResponse.json(
        { error: 'Failed to get or create profile' },
        { status: 500 }
      );
    }

    return NextResponse.json(profile);
  } catch (error) {
    console.error('Error in GET /api/coaching-profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/coaching-profile
 * Update coaching profile
 */
export async function PATCH(request: NextRequest) {
  try {
    const userId = await getUserIdFromToken(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    const updatedProfile = await CoachingProfileService.updateProfile(
      userId,
      body
    );

    if (!updatedProfile) {
      return NextResponse.json(
        { error: 'Failed to update profile' },
        { status: 500 }
      );
    }

    return NextResponse.json(updatedProfile);
  } catch (error) {
    console.error('Error in PATCH /api/coaching-profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/coaching-profile/populate
 * Populate profile from personality scan
 */
export async function POST(request: NextRequest) {
  try {
    const userId = await getUserIdFromToken(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const profile = await CoachingProfileService.populateFromPersonalityScan(userId);

    if (!profile) {
      return NextResponse.json(
        { error: 'No personality scan found or failed to populate' },
        { status: 404 }
      );
    }

    return NextResponse.json(profile);
  } catch (error) {
    console.error('Error in POST /api/coaching-profile/populate:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
