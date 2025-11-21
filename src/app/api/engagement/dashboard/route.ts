import { NextRequest, NextResponse } from 'next/server';
import { getEngagementDashboard } from '@/lib/engagement-service';

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

    const dashboardData = await getEngagementDashboard(parseInt(userId));

    return NextResponse.json(dashboardData);

  } catch (error) {
    console.error('Error fetching engagement dashboard:', error);
    return NextResponse.json(
      { error: 'Failed to fetch engagement dashboard' },
      { status: 500 }
    );
  }
}
