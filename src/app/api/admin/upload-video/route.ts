import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { sql } from '@vercel/postgres';

export async function POST(request: NextRequest) {
  try {
    // Check if user is admin
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    // TODO: Validate admin token

    const formData = await request.formData();
    const file = formData.get('video') as File;
    const courseId = formData.get('courseId') as string;
    const moduleId = formData.get('moduleId') as string;
    const title = formData.get('title') as string;

    if (!file || !courseId || !moduleId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Validate file type
    if (!file.type.startsWith('video/')) {
      return NextResponse.json({ error: 'File must be a video' }, { status: 400 });
    }

    // Validate file size (max 500MB for Vercel Blob)
    if (file.size > 500 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large (max 500MB)' }, { status: 400 });
    }

    // Create unique filename
    const timestamp = Date.now();
    const extension = file.name.split('.').pop();
    const filename = `videos/${courseId}_${moduleId}_${timestamp}.${extension}`;

    // Upload to Vercel Blob
    const blob = await put(filename, file, {
      access: 'public',
      addRandomSuffix: false,
    });

    // Save video metadata to database with blob URL
    const videoUrl = blob.url;

    await sql`
      UPDATE course_modules
      SET video_url = ${videoUrl},
          video_title = ${title || 'Video les'},
          updated_at = NOW()
      WHERE id = ${moduleId} AND course_id = ${courseId}
    `;

    return NextResponse.json({
      success: true,
      videoUrl,
      filename,
      size: file.size,
      type: file.type,
      blobUrl: blob.url
    });

  } catch (error) {
    console.error('Video upload error:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}

// Handle OPTIONS for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}