import { NextRequest, NextResponse } from 'next/server';
import { getAllBadges, getUserBadges, awardBadgeToUser } from '@/lib/community-db';

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId');
    const type = request.nextUrl.searchParams.get('type') || 'all';

    if (type === 'user' && !userId) {
      return NextResponse.json(
        { error: 'userId is required for user badges' },
        { status: 400 }
      );
    }

    let badges;
    if (type === 'user' && userId) {
      badges = await getUserBadges(parseInt(userId));
    } else {
      badges = await getAllBadges();
    }

    return NextResponse.json({
      badges
    }, { status: 200 });

  } catch (error) {
    console.error('Get badges error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId, badgeId } = await request.json();

    if (!userId || !badgeId) {
      return NextResponse.json(
        { error: 'userId and badgeId are required' },
        { status: 400 }
      );
    }

    const awardedBadge = await awardBadgeToUser(parseInt(userId), parseInt(badgeId));

    return NextResponse.json({
      badge: awardedBadge
    }, { status: 200 });

  } catch (error) {
    console.error('Award badge error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}