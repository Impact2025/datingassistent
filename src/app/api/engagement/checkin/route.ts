import { NextRequest, NextResponse } from 'next/server';
import { submitDailyCheckin } from '@/lib/engagement-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, journeyDay, moodRating, progressRating, challenges, wins } = body;

    if (!userId || !journeyDay || !moodRating || !progressRating) {
      return NextResponse.json(
        { error: 'User ID, journey day, mood rating, and progress rating are required' },
        { status: 400 }
      );
    }

    await submitDailyCheckin({
      userId,
      journeyDay,
      moodRating,
      progressRating,
      challenges,
      wins
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error submitting check-in:', error);
    return NextResponse.json(
      { error: 'Failed to submit check-in' },
      { status: 500 }
    );
  }
}
