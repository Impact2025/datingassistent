import { NextResponse } from 'next/server';
import { getPodcastById, updatePodcast, deletePodcast } from '@/lib/podcast-service';

// GET /api/admin/podcasts/[id] - Get a specific podcast
export async function GET(
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

    const podcast = await getPodcastById(id);
    if (!podcast) {
      return NextResponse.json(
        { success: false, error: 'Podcast not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, podcast });
  } catch (error) {
    console.error('Error fetching podcast:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch podcast' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/podcasts/[id] - Update a podcast
export async function PUT(
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

    const podcast = await updatePodcast(id, data);

    return NextResponse.json({ success: true, podcast });
  } catch (error) {
    console.error('Error updating podcast:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update podcast' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/podcasts/[id] - Delete a podcast
export async function DELETE(
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

    await deletePodcast(id);

    return NextResponse.json({ success: true, message: 'Podcast deleted successfully' });
  } catch (error) {
    console.error('Error deleting podcast:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete podcast' },
      { status: 500 }
    );
  }
}