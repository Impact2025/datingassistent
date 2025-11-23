import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
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

    // Validate file size (max 100MB for Vercel)
    if (file.size > 100 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large (max 100MB)' }, { status: 400 });
    }

    // Create unique filename
    const timestamp = Date.now();
    const extension = file.name.split('.').pop();
    const filename = `${courseId}_${moduleId}_${timestamp}.${extension}`;
    const filepath = join(process.cwd(), 'public', 'uploads', 'videos', filename);

    // Ensure directory exists
    const dir = join(process.cwd(), 'public', 'uploads', 'videos');
    try {
      await mkdir(dir, { recursive: true });
    } catch (error) {
      // Directory might already exist
    }

    // Convert file to buffer and save
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filepath, buffer);

    // Save video metadata to database
    const videoUrl = `/uploads/videos/${filename}`;

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
      type: file.type
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