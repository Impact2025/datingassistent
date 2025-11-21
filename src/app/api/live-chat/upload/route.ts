import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { randomUUID } from 'crypto';
import { requireAuth } from '@/lib/auth';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = [
  // Images
  'image/jpeg', 'image/png', 'image/gif', 'image/webp',
  // Documents
  'application/pdf', 'text/plain', 'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  // Spreadsheets
  'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  // Videos (small files only)
  'video/mp4', 'video/quicktime'
];

export async function POST(request: NextRequest) {
  try {
    // For chat uploads, we need to be more permissive - allow both authenticated users and chat sessions
    const authHeader = request.headers.get('Authorization');
    const sessionId = request.headers.get('X-Chat-Session');

    if (!authHeader?.startsWith('Bearer ') && !sessionId) {
      return NextResponse.json({
        error: 'Authentication required',
        message: 'Either Bearer token or chat session required'
      }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const conversationId = formData.get('conversationId') as string;

    if (!file) {
      return NextResponse.json({
        error: 'No file provided',
        message: 'File is required'
      }, { status: 400 });
    }

    if (!conversationId) {
      return NextResponse.json({
        error: 'No conversation ID',
        message: 'Conversation ID is required'
      }, { status: 400 });
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({
        error: 'File too large',
        message: `File size must be less than ${MAX_FILE_SIZE / (1024 * 1024)}MB`
      }, { status: 400 });
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({
        error: 'Invalid file type',
        message: 'File type not allowed'
      }, { status: 400 });
    }

    // Generate unique filename
    const fileExtension = file.name.split('.').pop()?.toLowerCase() || 'unknown';
    const fileName = `${randomUUID()}.${fileExtension}`;

    // Create upload directory if it doesn't exist
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'chat-files');
    try {
      await mkdir(uploadDir, { recursive: true });
    } catch (error) {
      // Directory might already exist, continue
    }

    // Save file
    const filePath = join(uploadDir, fileName);
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // Generate public URL
    const fileUrl = `/uploads/chat-files/${fileName}`;

    // Store file metadata in database
    const { sql } = await import('@vercel/postgres');

    await sql`
      INSERT INTO chat_attachments (
        conversation_id,
        file_name,
        file_path,
        file_size,
        file_type,
        uploaded_by_type,
        uploaded_at
      ) VALUES (
        ${conversationId},
        ${file.name},
        ${fileUrl},
        ${file.size},
        ${file.type},
        'user',
        NOW()
      )
    `;

    return NextResponse.json({
      file: {
        id: randomUUID(),
        name: file.name,
        url: fileUrl,
        size: file.size,
        type: file.type,
        uploadedAt: new Date().toISOString()
      },
      message: 'File uploaded successfully'
    });

  } catch (error) {
    console.error('File upload error:', error);
    return NextResponse.json({
      error: 'Upload failed',
      message: 'Failed to upload file'
    }, { status: 500 });
  }
}

// GET endpoint to retrieve file metadata
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get('conversationId');

    if (!conversationId) {
      return NextResponse.json({
        error: 'Conversation ID required',
        message: 'conversationId parameter is required'
      }, { status: 400 });
    }

    const { sql } = await import('@vercel/postgres');

    const attachments = await sql`
      SELECT
        id,
        file_name,
        file_path,
        file_size,
        file_type,
        uploaded_by_type,
        uploaded_at
      FROM chat_attachments
      WHERE conversation_id = ${conversationId}
      ORDER BY uploaded_at DESC
    `;

    return NextResponse.json({
      attachments: attachments.rows.map(att => ({
        id: att.id,
        name: att.file_name,
        url: att.file_path,
        size: att.file_size,
        type: att.file_type,
        uploadedBy: att.uploaded_by_type,
        uploadedAt: att.uploaded_at
      }))
    });

  } catch (error) {
    console.error('Error fetching attachments:', error);
    return NextResponse.json({
      error: 'Failed to fetch attachments',
      message: 'Internal server error'
    }, { status: 500 });
  }
}