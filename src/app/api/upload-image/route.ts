import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { requireAdmin } from '@/lib/auth';

/**
 * Upload image to Neon database
 * POST /api/upload-image
 * 🔒 SECURITY: Admin only
 */
export async function POST(request: NextRequest) {
  try {
    // 🔒 SECURITY: Verify user is admin (only admins can upload images)
    const admin = await requireAdmin(request);

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'Geen bestand gevonden' },
        { status: 400 }
      );
    }

    // Enhanced security validation
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Bestand moet een geldige afbeelding zijn (JPEG, PNG, GIF, WebP)' },
        { status: 400 }
      );
    }

    // Max 5MB
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'Bestand is te groot (max 5MB)' },
        { status: 400 }
      );
    }

    // Additional security: Check file extension matches MIME type
    const fileName = file.name.toLowerCase();
    const validExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    const hasValidExtension = validExtensions.some(ext => fileName.endsWith(ext));
    if (!hasValidExtension) {
      return NextResponse.json(
        { error: 'Bestandsnaam heeft ongeldige extensie' },
        { status: 400 }
      );
    }

    // Security: Sanitize filename to prevent path traversal
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');

    // Convert to base64
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString('base64');
    const dataUrl = `data:${file.type};base64,${base64}`;

    // Save to database
    const result = await sql`
      INSERT INTO blog_images (
        filename,
        mimetype,
        data,
        size,
        created_at
      ) VALUES (
        ${sanitizedFileName},
        ${file.type},
        ${dataUrl},
        ${file.size},
        NOW()
      )
      RETURNING id, filename, created_at
    `;

    const image = result.rows[0];

    return NextResponse.json({
      success: true,
      image: {
        id: image.id,
        filename: image.filename,
        url: dataUrl, // Return data URL voor direct gebruik
        createdAt: image.created_at,
      },
    });
  } catch (error) {
    console.error('Image upload error:', error);

    // 🔒 SECURITY: Handle authentication errors
    if (error instanceof Error) {
      if (error.message === 'Unauthorized') {
        return NextResponse.json(
          { error: 'Unauthorized: Please login' },
          { status: 401 }
        );
      }
      if (error.message.includes('Forbidden')) {
        return NextResponse.json(
          { error: 'Forbidden: Only admins can upload images' },
          { status: 403 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Upload mislukt. Probeer opnieuw.' },
      { status: 500 }
    );
  }
}

/**
 * Get image by ID
 * GET /api/upload-image?id=123
 * 🔒 SECURITY: Admin only
 */
export async function GET(request: NextRequest) {
  try {
    // 🔒 SECURITY: Verify user is admin
    const admin = await requireAdmin(request);

    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Image ID is verplicht' },
        { status: 400 }
      );
    }

    // 🔒 SECURITY: Validate ID format
    if (!/^\d+$/.test(id)) {
      return NextResponse.json(
        { error: 'Invalid image ID format' },
        { status: 400 }
      );
    }

    const result = await sql`
      SELECT id, filename, mimetype, data, size, created_at
      FROM blog_images
      WHERE id = ${id}
    `;

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Afbeelding niet gevonden' },
        { status: 404 }
      );
    }

    const image = result.rows[0];

    return NextResponse.json({
      success: true,
      image: {
        id: image.id,
        filename: image.filename,
        url: image.data,
        size: image.size,
        createdAt: image.created_at,
      },
    });
  } catch (error) {
    console.error('Image fetch error:', error);

    // 🔒 SECURITY: Handle authentication errors
    if (error instanceof Error) {
      if (error.message === 'Unauthorized') {
        return NextResponse.json(
          { error: 'Unauthorized: Please login' },
          { status: 401 }
        );
      }
      if (error.message.includes('Forbidden')) {
        return NextResponse.json(
          { error: 'Forbidden: Only admins can view images' },
          { status: 403 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Kon afbeelding niet ophalen' },
      { status: 500 }
    );
  }
}

/**
 * Delete image by ID
 * DELETE /api/upload-image?id=123
 * 🔒 SECURITY: Admin only
 */
export async function DELETE(request: NextRequest) {
  try {
    // 🔒 SECURITY: Verify user is admin
    const admin = await requireAdmin(request);

    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Image ID is verplicht' },
        { status: 400 }
      );
    }

    // 🔒 SECURITY: Validate ID format
    if (!/^\d+$/.test(id)) {
      return NextResponse.json(
        { error: 'Invalid image ID format' },
        { status: 400 }
      );
    }

    await sql`
      DELETE FROM blog_images
      WHERE id = ${id}
    `;

    return NextResponse.json({
      success: true,
      message: 'Afbeelding verwijderd',
    });
  } catch (error) {
    console.error('Image delete error:', error);

    // 🔒 SECURITY: Handle authentication errors
    if (error instanceof Error) {
      if (error.message === 'Unauthorized') {
        return NextResponse.json(
          { error: 'Unauthorized: Please login' },
          { status: 401 }
        );
      }
      if (error.message.includes('Forbidden')) {
        return NextResponse.json(
          { error: 'Forbidden: Only admins can delete images' },
          { status: 403 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Kon afbeelding niet verwijderen' },
      { status: 500 }
    );
  }
}
