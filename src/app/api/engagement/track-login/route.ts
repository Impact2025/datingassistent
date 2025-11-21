import { NextRequest, NextResponse } from 'next/server';
import { trackLogin } from '@/lib/engagement-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const engagementData = await trackLogin(userId);

    return NextResponse.json({
      success: true,
      engagement: engagementData
    });

  } catch (error) {
    console.error('Error tracking login:', error);
    return NextResponse.json(
      { error: 'Failed to track login' },
      { status: 500 }
    );
  }
}
