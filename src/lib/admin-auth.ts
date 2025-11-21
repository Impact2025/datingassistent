import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

const ADMIN_EMAILS = ['v_mun@hotmail.com', 'v.munster@weareimpact.nl'];

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'dev-only-jwt-secret-change-in-production-2024'
);

export interface AuthResult {
  authenticated: boolean;
  isAdmin: boolean;
  userId?: number;
  email?: string;
}

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

    return {
      authenticated: true,
      isAdmin: ADMIN_EMAILS.includes(email),
      userId,
      email
    };
  } catch (error) {
    console.error('Admin auth check failed:', error);
    return { authenticated: false, isAdmin: false };
  }
}

export function requireAdmin(authResult: AuthResult): boolean {
  return authResult.authenticated && authResult.isAdmin;
}
