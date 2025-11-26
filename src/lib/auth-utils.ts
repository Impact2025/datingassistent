/**
 * Authentication utilities for DatingAssistent API routes
 * Contains common authentication and user validation functions
 */

import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-in-production'
);

export interface AuthenticatedUser {
  id: number;
  email?: string;
  displayName?: string;
}

/**
 * Authenticate a user from the Authorization header
 * @param request - The NextRequest object
 * @returns AuthenticatedUser object or NextResponse error
 */
export async function authenticateUser(request: NextRequest): Promise<AuthenticatedUser | NextResponse> {
  try {
    // Get user from authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'No authorization token provided' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);

    // Verify token using jose
    let decoded;
    try {
      const { payload } = await jwtVerify(token, JWT_SECRET);
      decoded = payload;
    } catch (err) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    // Get userId from token - handle both old and new token formats
    let userId: number;
    if (decoded.user && typeof decoded.user === 'object' && 'id' in decoded.user) {
      // New format: { user: { id, email, displayName } }
      userId = decoded.user.id as number;
    } else if (decoded.userId) {
      // Old format: { userId, email }
      userId = decoded.userId as number;
    } else {
      return NextResponse.json(
        { error: 'Invalid token format' },
        { status: 401 }
      );
    }

    return {
      id: userId,
      email: (decoded as any).email || (decoded as any).user?.email,
      displayName: (decoded as any).displayName || (decoded as any).user?.displayName
    };

  } catch (error) {
    console.error('Authentication error:', error);
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    );
  }
}

/**
 * Validate required fields in a request
 * @param data - The data object to validate
 * @param requiredFields - Array of required field names
 * @returns Array of missing fields or empty array if all present
 */
export function validateRequiredFields(data: any, requiredFields: string[]): string[] {
  const missing: string[] = [];

  for (const field of requiredFields) {
    if (!data[field] || (typeof data[field] === 'string' && data[field].trim() === '')) {
      missing.push(field);
    }
  }

  return missing;
}