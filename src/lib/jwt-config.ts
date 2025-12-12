/**
 * JWT Configuration - Single Source of Truth
 *
 * This module provides centralized JWT configuration for the entire application.
 * ALL JWT operations MUST use this module to ensure consistency.
 *
 * @module lib/jwt-config
 */

import { SignJWT, jwtVerify, type JWTPayload } from 'jose';

// ============================================================================
// CONFIGURATION
// ============================================================================

const DEV_SECRET = 'dev-only-jwt-secret-change-in-production-2024';
const JWT_EXPIRY = '7d';
const COOKIE_NAME = 'datespark_auth_token';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days in seconds

// ============================================================================
// SECRET VALIDATION
// ============================================================================

function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error(
        '🔒 FATAL: JWT_SECRET environment variable is required in production. ' +
        'Set a strong secret (min 32 characters) in your environment.'
      );
    }
    console.warn(
      '⚠️  WARNING: JWT_SECRET not set. Using development fallback. ' +
      'This is insecure and will fail in production.'
    );
    return new TextEncoder().encode(DEV_SECRET);
  }

  if (secret.length < 32) {
    throw new Error(
      `🔒 FATAL: JWT_SECRET must be at least 32 characters. Current length: ${secret.length}`
    );
  }

  return new TextEncoder().encode(secret);
}

// Lazy initialization to allow environment to be loaded
let _jwtSecret: Uint8Array | null = null;

function getSecret(): Uint8Array {
  if (!_jwtSecret) {
    _jwtSecret = getJwtSecret();
  }
  return _jwtSecret;
}

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface SessionUser {
  id: number;
  email: string;
  displayName: string;
}

export interface TokenPayload extends JWTPayload {
  user?: SessionUser;
  // Legacy support
  userId?: number;
  email?: string;
}

// ============================================================================
// TOKEN OPERATIONS
// ============================================================================

/**
 * Create a signed JWT token
 * @param user - The user session data to encode
 * @returns Promise<string> - The signed JWT token
 */
export async function signToken(user: SessionUser): Promise<string> {
  return new SignJWT({ user })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(JWT_EXPIRY)
    .sign(getSecret());
}

/**
 * Verify and decode a JWT token
 * @param token - The JWT token to verify
 * @returns Promise<SessionUser | null> - The decoded user or null if invalid
 */
export async function verifyToken(token: string): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    const typedPayload = payload as TokenPayload;

    // New format: { user: { id, email, displayName } }
    if (typedPayload.user) {
      return typedPayload.user;
    }

    // Legacy format: { userId, email } - support old tokens
    if (typedPayload.userId && typedPayload.email) {
      return {
        id: typedPayload.userId,
        email: typedPayload.email,
        displayName: typedPayload.email.split('@')[0],
      };
    }

    return null;
  } catch (error) {
    // Token is invalid, expired, or tampered with
    return null;
  }
}

/**
 * Verify token and throw if invalid (for routes that require auth)
 * @param token - The JWT token to verify
 * @returns Promise<SessionUser> - The decoded user
 * @throws Error if token is invalid
 */
export async function requireValidToken(token: string): Promise<SessionUser> {
  const user = await verifyToken(token);
  if (!user) {
    throw new Error('Invalid or expired token');
  }
  return user;
}

// ============================================================================
// COOKIE CONFIGURATION
// ============================================================================

export const cookieConfig = {
  name: COOKIE_NAME,
  options: {
    httpOnly: false, // Allow JS access for client-side auth checks
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    maxAge: COOKIE_MAX_AGE,
    path: '/',
  },
} as const;

// ============================================================================
// EXPORTS
// ============================================================================

export { COOKIE_NAME, COOKIE_MAX_AGE, JWT_EXPIRY };
