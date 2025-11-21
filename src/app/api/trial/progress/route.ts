import { NextRequest, NextResponse } from 'next/server';
import { getTrialProgress } from '@/lib/trial-management';

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

    const progress = await getTrialProgress(parseInt(userId));

    return NextResponse.json({
      success: true,
      progress
    });

  } catch (error) {
    console.error('Trial progress error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}