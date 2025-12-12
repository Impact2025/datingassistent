/**
 * ADMIN AUTHENTICATION MODULE
 * Provides admin role verification using database role checks
 * Created: 2025-11-23
 *
 * 🔒 Security: Uses database role field instead of hardcoded emails
 * Uses centralized jwt-config for consistent JWT handling
 */

import { cookies } from 'next/headers';
import { sql } from '@vercel/postgres';
import { verifyToken, cookieConfig } from './jwt-config';

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
    const tokenCookie = cookieStore.get(cookieConfig.name);

    if (!tokenCookie || !tokenCookie.value) {
      return { authenticated: false, isAdmin: false };
    }

    // Use centralized JWT verification
    const user = await verifyToken(tokenCookie.value);

    if (!user || !user.email || !user.id) {
      return { authenticated: false, isAdmin: false };
    }

    const userId = user.id;
    const email = user.email;

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
