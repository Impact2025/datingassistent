import { NextResponse } from 'next/server';
import { getPublishedPodcasts } from '@/lib/podcast-service';

// GET /api/podcasts - Get all published podcasts (public endpoint)
export async function GET() {
  try {
    const podcasts = await getPublishedPodcasts();
    return NextResponse.json(podcasts, { status: 200 });
  } catch (error) {
    console.error('Error fetching published podcasts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch podcasts' },
      { status: 500 }
    );
  }
}
