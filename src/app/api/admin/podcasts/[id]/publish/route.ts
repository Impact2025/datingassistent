import { NextResponse } from 'next/server';
import { publishPodcast, unpublishPodcast } from '@/lib/podcast-service';

// POST /api/admin/podcasts/[id]/publish - Publish or unpublish a podcast
export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const id = parseInt(params.id);

    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid podcast ID' },
        { status: 400 }
      );
    }

    const data = await request.json();
    const { published } = data;

    let podcast;
    if (published) {
      podcast = await publishPodcast(id);
    } else {
      podcast = await unpublishPodcast(id);
    }

    return NextResponse.json({ success: true, podcast });
  } catch (error) {
    console.error('Error updating podcast status:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update podcast status', details: String(error) },
      { status: 500 }
    );
  }
}
