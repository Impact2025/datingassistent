import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { sql } from '@vercel/postgres';

// 🔒 SECURITY: JWT_SECRET must be set in production
if (!process.env.JWT_SECRET) {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET environment variable is required in production');
  } else {
    console.warn('⚠️  WARNING: Using default JWT_SECRET in development. Set JWT_SECRET environment variable for production security.');
  }
}

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'dev-only-jwt-secret-change-in-production-2024'
);

const COOKIE_NAME = 'datespark_auth_token'; // ✅ Must match the cookie name used in login route
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export interface SessionUser {
  id: number;
  email: string;
  displayName: string;
}

// Hash password
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

// Verify password
export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

// Create JWT token
export async function createToken(user: SessionUser): Promise<string> {
  return new SignJWT({ user })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(JWT_SECRET);
}

// Verify JWT token
export async function verifyToken(token: string): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);

    // 🔄 Support both old and new token formats
    if (payload.user) {
      // New format: { user: { id, email, displayName } }
      return payload.user as SessionUser;
    } else if (payload.userId && payload.email) {
      // Old format: { userId, email }
      return {
        id: payload.userId as number,
        email: payload.email as string,
        displayName: (payload.email as string).split('@')[0], // Fallback display name
      };
    }

    return null;
  } catch (error) {
    return null;
  }
}

// Set auth cookie
export async function setAuthCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: COOKIE_MAX_AGE,
    path: '/',
  });
}

// Get auth cookie
export async function getAuthCookie(): Promise<string | null> {
  const cookieStore = await cookies();
  const cookie = cookieStore.get(COOKIE_NAME);
  return cookie?.value || null;
}

// Remove auth cookie
export async function removeAuthCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

// Get current user from session
export async function getCurrentUser(): Promise<SessionUser | null> {
  const token = await getAuthCookie();
  if (!token) return null;

  return verifyToken(token);
}

// Register new user
export async function registerUser(
  email: string,
  password: string,
  displayName: string
): Promise<{ success: boolean; userId?: number; error?: string }> {
  try {
    // Check if user already exists
    const existing = await sql`
      SELECT id FROM users WHERE email = ${email}
    `;

    if (existing.rows.length > 0) {
      return { success: false, error: 'Email already registered' };
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const result = await sql`
      INSERT INTO users (email, display_name, password_hash, created_at)
      VALUES (${email}, ${displayName}, ${hashedPassword}, CURRENT_TIMESTAMP)
      RETURNING id
    `;

    return { success: true, userId: result.rows[0].id };
  } catch (error) {
    console.error('Register error:', error);
    return { success: false, error: 'Failed to register user' };
  }
}

// Login user
export async function loginUser(
  email: string,
  password: string
): Promise<{ success: boolean; user?: SessionUser; error?: string }> {
  try {
    // Get user from database
    const result = await sql`
      SELECT id, email, display_name, password_hash, last_login
      FROM users
      WHERE email = ${email}
    `;

    if (result.rows.length === 0) {
      return { success: false, error: 'Invalid credentials' };
    }

    const user = result.rows[0];

    // Verify password
    const isValid = await verifyPassword(password, user.password_hash);
    if (!isValid) {
      return { success: false, error: 'Invalid credentials' };
    }

    // Update last login
    await sql`
      UPDATE users
      SET last_login = CURRENT_TIMESTAMP
      WHERE id = ${user.id}
    `;

    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        displayName: user.display_name,
      },
    };
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, error: 'Failed to login' };
  }
}

// Get user by ID
export async function getUserById(userId: number) {
  try {
    const result = await sql`
      SELECT
        u.*,
        up.age,
        up.gender,
        up.interests,
        up.bio,
        up.location,
        up.dating_goals
      FROM users u
      LEFT JOIN user_profiles up ON u.id = up.user_id
      WHERE u.id = ${userId}
    `;

    return result.rows[0] || null;
  } catch (error) {
    console.error('Get user error:', error);
    return null;
  }
}

// 🔒 SECURITY HELPERS FOR API ROUTES

/**
 * Verify authentication from request
 * Use this in API routes to protect endpoints
 *
 * @example
 * ```typescript
 * export async function POST(request: Request) {
 *   const user = await verifyAuth(request);
 *   if (!user) {
 *     return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
 *   }
 *   // User is authenticated
 * }
 * ```
 */
export async function verifyAuth(request: Request): Promise<SessionUser | null> {
  try {
    // Try to get token from cookie first
    const token = await getAuthCookie();

    if (!token) {
      // Fallback: try Authorization header
      const authHeader = request.headers.get('Authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const bearerToken = authHeader.substring(7);
        return verifyToken(bearerToken);
      }
      return null;
    }

    return verifyToken(token);
  } catch (error) {
    console.error('Auth verification error:', error);
    return null;
  }
}

/**
 * Require authentication for API route
 * Throws an error if user is not authenticated
 *
 * @example
 * ```typescript
 * export async function POST(request: Request) {
 *   const user = await requireAuth(request);
 *   // User is guaranteed to be authenticated here
 * }
 * ```
 */
export async function requireAuth(request: Request): Promise<SessionUser> {
  const user = await verifyAuth(request);
  if (!user) {
    throw new Error('Unauthorized');
  }
  return user;
}

/**
 * Verify user has permission to access resource
 * Checks if authenticated user matches the requested userId
 *
 * @example
 * ```typescript
 * export async function POST(request: Request) {
 *   const { userId } = await request.json();
 *   const user = await requireUserAccess(request, userId);
 *   // User is authenticated and authorized to access this userId
 * }
 * ```
 */
export async function requireUserAccess(
  request: Request,
  requestedUserId: number
): Promise<SessionUser> {
  const user = await requireAuth(request);

  if (user.id !== requestedUserId) {
    throw new Error('Forbidden: Access denied');
  }

  return user;
}

/**
 * Check if user is admin
 * Returns true if user has admin role in database
 */
export async function isAdmin(userId: number): Promise<boolean> {
  try {
    const result = await sql`
      SELECT role FROM users WHERE id = ${userId}
    `;

    return result.rows[0]?.role === 'admin';
  } catch (error) {
    console.error('Admin check error:', error);
    return false;
  }
}

/**
 * Require admin access for API route
 * Throws an error if user is not an admin
 *
 * @example
 * ```typescript
 * export async function POST(request: Request) {
 *   const admin = await requireAdmin(request);
 *   // User is guaranteed to be an admin here
 * }
 * ```
 */
export async function requireAdmin(request: Request): Promise<SessionUser> {
  const user = await requireAuth(request);

  const adminStatus = await isAdmin(user.id);
  if (!adminStatus) {
    throw new Error('Forbidden: Admin access required');
  }

  return user;
}

/**
 * Helper to extract userId from request body safely
 * Validates that userId is a positive integer
 */
export function extractUserId(body: any): number {
  const userId = parseInt(body.userId);

  if (isNaN(userId) || userId <= 0) {
    throw new Error('Invalid userId');
  }

  return userId;
}
