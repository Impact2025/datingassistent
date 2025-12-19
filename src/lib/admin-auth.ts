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

/**
 * Verify admin session token (for API routes using session cookies)
 * @param sessionToken - The admin session token from cookies
 * @returns Admin info if valid, null otherwise
 */
export async function verifyAdminSession(sessionToken: string): Promise<{ id: number; email: string } | null> {
  try {
    const user = await verifyToken(sessionToken);
    if (!user || !user.id || !user.email) {
      return null;
    }

    // Check if user has admin role
    const result = await sql`
      SELECT role FROM users WHERE id = ${user.id}
    `;

    if (result.rows.length === 0 || result.rows[0].role !== 'admin') {
      return null;
    }

    return { id: user.id, email: user.email };
  } catch (error) {
    console.error('Admin session verification failed:', error);
    return null;
  }
}

/**
 * Verify admin auth from request (for API security wrapper)
 * @param req - NextRequest object
 * @returns { isValid: boolean, adminId?: number }
 */
export async function verifyAdminAuth(req: Request): Promise<{ isValid: boolean; adminId?: number }> {
  try {
    // Try to get token from Authorization header or cookies
    const authHeader = req.headers.get('authorization');
    let token: string | undefined;

    if (authHeader?.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    } else {
      // Try to get from cookies (for session-based auth)
      const cookieHeader = req.headers.get('cookie');
      if (cookieHeader) {
        const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
          const [key, value] = cookie.trim().split('=');
          acc[key] = value;
          return acc;
        }, {} as Record<string, string>);
        token = cookies['admin_session'] || cookies['datespark_auth_token'];
      }
    }

    if (!token) {
      return { isValid: false };
    }

    const admin = await verifyAdminSession(token);
    if (!admin) {
      return { isValid: false };
    }

    return { isValid: true, adminId: admin.id };
  } catch (error) {
    console.error('Admin auth verification failed:', error);
    return { isValid: false };
  }
}
