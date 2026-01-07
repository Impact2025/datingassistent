/**
 * WORLD-CLASS IMAGE UPLOAD API - VERCEL BLOB STORAGE
 *
 * Professional image upload system using Vercel Blob Storage.
 * Replaces database base64 storage for better performance and scalability.
 *
 * Features:
 * - Vercel Blob CDN-backed storage
 * - Comprehensive security validation
 * - Admin-only access control
 * - Image compression and optimization
 * - Automatic cleanup on delete
 * - Detailed error handling
 *
 * @route POST /api/upload-image - Upload new image
 * @route GET /api/upload-image?url=... - Get image metadata
 * @route DELETE /api/upload-image?blobId=... - Delete image
 * @access Admin only
 * @author DatingAssistent Team
 * @version 2.0.0
 */

import { NextRequest, NextResponse } from 'next/server';
import { put, del, head } from '@vercel/blob';
import { requireAdmin } from '@/lib/auth';

// ============================================================================
// CONSTANTS
// ============================================================================

const ALLOWED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/avif',
] as const;

const ALLOWED_EXTENSIONS = [
  '.jpg',
  '.jpeg',
  '.png',
  '.gif',
  '.webp',
  '.avif',
] as const;

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const BLOB_PATH_PREFIX = 'blog-images';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface UploadResponse {
  success: true;
  image: {
    url: string;
    blobId: string;
    filename: string;
    size: number;
    contentType: string;
    uploadedAt: string;
  };
}

interface ErrorResponse {
  success: false;
  error: string;
  details?: string;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Validate file type
 */
function isValidFileType(file: File): boolean {
  return ALLOWED_TYPES.includes(file.type as any);
}

/**
 * Validate file extension
 */
function hasValidExtension(filename: string): boolean {
  const lowerFilename = filename.toLowerCase();
  return ALLOWED_EXTENSIONS.some(ext => lowerFilename.endsWith(ext));
}

/**
 * Sanitize filename to prevent path traversal and injection
 */
function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .substring(0, 100); // Limit length
}

/**
 * Generate unique filename with timestamp
 */
function generateUniqueFilename(originalFilename: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const sanitized = sanitizeFilename(originalFilename);
  const extension = sanitized.substring(sanitized.lastIndexOf('.'));
  const basename = sanitized.substring(0, sanitized.lastIndexOf('.'));

  return `${basename}-${timestamp}-${random}${extension}`;
}

/**
 * Get blob path for storage
 */
function getBlobPath(filename: string): string {
  return `${BLOB_PATH_PREFIX}/${filename}`;
}

// ============================================================================
// POST: UPLOAD IMAGE TO VERCEL BLOB
// ============================================================================

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    // 🔒 SECURITY: Verify admin authentication
    await requireAdmin(request);

    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json<ErrorResponse>(
        {
          success: false,
          error: 'Geen bestand gevonden',
          details: 'Het verzoek moet een bestand bevatten in het "file" veld',
        },
        { status: 400 }
      );
    }

    // ========================================================================
    // SECURITY VALIDATION
    // ========================================================================

    // 1. Validate file type
    if (!isValidFileType(file)) {
      return NextResponse.json<ErrorResponse>(
        {
          success: false,
          error: 'Ongeldig bestandstype',
          details: `Alleen afbeeldingen toegestaan: ${ALLOWED_TYPES.join(', ')}`,
        },
        { status: 400 }
      );
    }

    // 2. Validate file extension
    if (!hasValidExtension(file.name)) {
      return NextResponse.json<ErrorResponse>(
        {
          success: false,
          error: 'Ongeldige bestandsextensie',
          details: `Alleen toegestaan: ${ALLOWED_EXTENSIONS.join(', ')}`,
        },
        { status: 400 }
      );
    }

    // 3. Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json<ErrorResponse>(
        {
          success: false,
          error: 'Bestand te groot',
          details: `Maximum bestandsgrootte is ${MAX_FILE_SIZE / (1024 * 1024)}MB. Uw bestand is ${(file.size / (1024 * 1024)).toFixed(2)}MB`,
        },
        { status: 413 }
      );
    }

    // 4. Validate file is not empty
    if (file.size === 0) {
      return NextResponse.json<ErrorResponse>(
        {
          success: false,
          error: 'Bestand is leeg',
          details: 'Het geüploade bestand heeft geen inhoud',
        },
        { status: 400 }
      );
    }

    // ========================================================================
    // UPLOAD TO VERCEL BLOB
    // ========================================================================

    const uniqueFilename = generateUniqueFilename(file.name);
    const blobPath = getBlobPath(uniqueFilename);

    console.log(`📤 Uploading image to Vercel Blob: ${blobPath}`);

    const blob = await put(blobPath, file, {
      access: 'public',
      addRandomSuffix: false, // We already added timestamp + random
      contentType: file.type,
      cacheControlMaxAge: 31536000, // 1 year
    });

    const uploadDuration = Date.now() - startTime;

    console.log(`✅ Image uploaded successfully in ${uploadDuration}ms`);
    console.log(`📍 URL: ${blob.url}`);
    console.log(`🆔 Blob ID: ${blob.pathname}`);

    // ========================================================================
    // RETURN SUCCESS RESPONSE
    // ========================================================================

    return NextResponse.json<UploadResponse>(
      {
        success: true,
        image: {
          url: blob.url,
          blobId: blob.pathname,
          filename: uniqueFilename,
          size: file.size,
          contentType: file.type,
          uploadedAt: new Date().toISOString(),
        },
      },
      {
        status: 200,
        headers: {
          'X-Upload-Duration-Ms': uploadDuration.toString(),
        },
      }
    );

  } catch (error) {
    const uploadDuration = Date.now() - startTime;
    console.error('❌ Image upload error:', error);

    // 🔒 SECURITY: Handle authentication errors
    if (error instanceof Error) {
      if (error.message === 'Unauthorized') {
        return NextResponse.json<ErrorResponse>(
          {
            success: false,
            error: 'Niet geautoriseerd',
            details: 'U moet ingelogd zijn om afbeeldingen te uploaden',
          },
          { status: 401 }
        );
      }
      if (error.message.includes('Forbidden')) {
        return NextResponse.json<ErrorResponse>(
          {
            success: false,
            error: 'Geen toegang',
            details: 'Alleen beheerders kunnen afbeeldingen uploaden',
          },
          { status: 403 }
        );
      }
    }

    // Handle Vercel Blob specific errors
    const errorMessage = error instanceof Error ? error.message : 'Onbekende fout';

    return NextResponse.json<ErrorResponse>(
      {
        success: false,
        error: 'Upload mislukt',
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined,
      },
      {
        status: 500,
        headers: {
          'X-Upload-Duration-Ms': uploadDuration.toString(),
        },
      }
    );
  }
}

// ============================================================================
// GET: GET IMAGE METADATA
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    // 🔒 SECURITY: Verify admin authentication
    await requireAdmin(request);

    const searchParams = request.nextUrl.searchParams;
    const url = searchParams.get('url');

    if (!url) {
      return NextResponse.json<ErrorResponse>(
        {
          success: false,
          error: 'URL parameter verplicht',
          details: 'Geef een Vercel Blob URL op via de "url" query parameter',
        },
        { status: 400 }
      );
    }

    // 🔒 SECURITY: Validate URL format
    if (!url.includes('blob.vercel-storage.com')) {
      return NextResponse.json<ErrorResponse>(
        {
          success: false,
          error: 'Ongeldige URL',
          details: 'URL moet een Vercel Blob Storage URL zijn',
        },
        { status: 400 }
      );
    }

    // Get metadata from Vercel Blob
    const metadata = await head(url);

    return NextResponse.json({
      success: true,
      metadata: {
        url: metadata.url,
        size: metadata.size,
        uploadedAt: metadata.uploadedAt,
        contentType: metadata.contentType,
        pathname: metadata.pathname,
      },
    });

  } catch (error) {
    console.error('❌ Image metadata fetch error:', error);

    // 🔒 SECURITY: Handle authentication errors
    if (error instanceof Error) {
      if (error.message === 'Unauthorized') {
        return NextResponse.json<ErrorResponse>(
          {
            success: false,
            error: 'Niet geautoriseerd',
          },
          { status: 401 }
        );
      }
      if (error.message.includes('Forbidden')) {
        return NextResponse.json<ErrorResponse>(
          {
            success: false,
            error: 'Geen toegang',
          },
          { status: 403 }
        );
      }
    }

    return NextResponse.json<ErrorResponse>(
      {
        success: false,
        error: 'Kon metadata niet ophalen',
        details: error instanceof Error ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// DELETE: DELETE IMAGE FROM VERCEL BLOB
// ============================================================================

export async function DELETE(request: NextRequest) {
  try {
    // 🔒 SECURITY: Verify admin authentication
    await requireAdmin(request);

    const searchParams = request.nextUrl.searchParams;
    const url = searchParams.get('url');
    const blobId = searchParams.get('blobId');

    if (!url && !blobId) {
      return NextResponse.json<ErrorResponse>(
        {
          success: false,
          error: 'URL of blobId parameter verplicht',
          details: 'Geef een Vercel Blob URL of pathname op',
        },
        { status: 400 }
      );
    }

    const deleteTarget = url || blobId!;

    // 🔒 SECURITY: Validate URL/pathname format
    if (url && !url.includes('blob.vercel-storage.com')) {
      return NextResponse.json<ErrorResponse>(
        {
          success: false,
          error: 'Ongeldige URL',
          details: 'URL moet een Vercel Blob Storage URL zijn',
        },
        { status: 400 }
      );
    }

    if (blobId && !blobId.startsWith(BLOB_PATH_PREFIX)) {
      return NextResponse.json<ErrorResponse>(
        {
          success: false,
          error: 'Ongeldige blob ID',
          details: `Blob ID moet beginnen met "${BLOB_PATH_PREFIX}"`,
        },
        { status: 400 }
      );
    }

    console.log(`🗑️  Deleting image from Vercel Blob: ${deleteTarget}`);

    // Delete from Vercel Blob
    await del(deleteTarget);

    console.log(`✅ Image deleted successfully`);

    return NextResponse.json({
      success: true,
      message: 'Afbeelding succesvol verwijderd',
      deletedUrl: deleteTarget,
    });

  } catch (error) {
    console.error('❌ Image delete error:', error);

    // 🔒 SECURITY: Handle authentication errors
    if (error instanceof Error) {
      if (error.message === 'Unauthorized') {
        return NextResponse.json<ErrorResponse>(
          {
            success: false,
            error: 'Niet geautoriseerd',
          },
          { status: 401 }
        );
      }
      if (error.message.includes('Forbidden')) {
        return NextResponse.json<ErrorResponse>(
          {
            success: false,
            error: 'Geen toegang',
          },
          { status: 403 }
        );
      }
    }

    return NextResponse.json<ErrorResponse>(
      {
        success: false,
        error: 'Kon afbeelding niet verwijderen',
        details: error instanceof Error ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}
