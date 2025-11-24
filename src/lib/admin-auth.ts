/**
 * ADMIN AUTHENTICATION MODULE
 * Provides admin role verification using database role checks
 * Created: 2025-11-23
 *
 * 🔒 Security: Uses database role field instead of hardcoded emails
 */

import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { sql } from '@vercel/postgres';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'dev-only-jwt-secret-change-in-production-2024'
);

export interface AuthResult {
  authenticated: boolean;
  isAdmin: boolean;
  userId?: number;
  email?: string;
  role?: string;
}

/**
 * Check admin authentication and role from database
 * @returns AuthResult with admin status from database role field
 */
export async function checkAdminAuth(): Promise<AuthResult> {
  try {
    const cookieStore = await cookies();
    const tokenCookie = cookieStore.get('datespark_auth_token');

    if (!tokenCookie || !tokenCookie.value) {
      return { authenticated: false, isAdmin: false };
    }

    const { payload } = await jwtVerify(tokenCookie.value, JWT_SECRET);

    // Support both jwt structures:
    // 1. { user: { id, email } } - new format from auth.ts
    // 2. { userId, email } - old format (backward compatibility)
    const userId = (payload.user as any)?.id || (payload.userId as number);
    const email = (payload.user as any)?.email || (payload.email as string);

    if (!email || !userId) {
      return { authenticated: false, isAdmin: false };
    }

    // 🔒 SECURITY: Check admin role from database instead of hardcoded emails
    let isAdmin = false;
    let role: string | undefined;

    try {
      const result = await sql`
        SELECT role FROM users WHERE id = ${userId}
      `;

      if (result.rows.length > 0) {
        role = result.rows[0].role;
        isAdmin = role === 'admin';
      }
    } catch (dbError) {
      console.error('Failed to check admin role from database:', dbError);
      // Fallback: deny admin access on database error for security
      isAdmin = false;
    }

    return {
      authenticated: true,
      isAdmin,
      userId,
      email,
      role
    };
  } catch (error) {
    console.error('Admin auth check failed:', error);
    return { authenticated: false, isAdmin: false };
  }
}

/**
 * Require admin access
 * @param authResult - Result from checkAdminAuth()
 * @returns boolean - true if user is authenticated AND has admin role
 */
export function requireAdmin(authResult: AuthResult): boolean {
  return authResult.authenticated && authResult.isAdmin;
}

/**
 * Get admin emails from environment (for initial setup/migrations)
 * @returns Array of admin emails from environment variable
 */
export function getInitialAdminEmails(): string[] {
  const adminEmails = process.env.ADMIN_EMAILS || '';
  return adminEmails.split(',').map(email => email.trim()).filter(Boolean);
}
