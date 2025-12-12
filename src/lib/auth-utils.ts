/**
 * Authentication utilities for DatingAssistent API routes
 * Contains common authentication and user validation functions
 *
 * Uses centralized jwt-config for JWT operations
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, type SessionUser } from './jwt-config';

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

    // Verify token using centralized jwt-config
    const user = await verifyToken(token);

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    return {
      id: user.id,
      email: user.email,
      displayName: user.displayName
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
