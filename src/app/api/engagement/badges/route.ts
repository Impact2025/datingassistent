import { NextRequest, NextResponse } from 'next/server';
import { getBadgeProgress, checkAndAwardBadges } from '@/lib/badge-service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Check for new badges first
    await checkAndAwardBadges(parseInt(userId));

    // Get badge progress
    const progress = await getBadgeProgress(parseInt(userId));

    return NextResponse.json(progress);

  } catch (error) {
    console.error('Error fetching badges:', error);
    return NextResponse.json(
      { error: 'Failed to fetch badges' },
      { status: 500 }
    );
  }
}
