/**
 * CLIENT-SIDE AUTH HELPERS
 * Utilities for client components to check authentication and roles
 * Created: 2025-11-23
 *
 * 🔒 Security Note: These are helper functions for UI logic only.
 * Server-side validation MUST still be done in API routes.
 */

import { SessionUser } from './auth';

export interface ClientAuthUser {
  id: number;
  email: string;
  name?: string;
  role?: string;
}

/**
 * Check if JWT token is expired
 * @param token - JWT token string
 * @returns boolean - true if token is expired or invalid
 */
export function isTokenExpired(token: string | null): boolean {
  if (!token) return true;

  try {
    // Parse JWT payload (middle part of token)
    const parts = token.split('.');
    if (parts.length !== 3) return true;

    const payload = JSON.parse(atob(parts[1]));

    // Check expiration time
    if (payload.exp) {
      const expirationTime = payload.exp * 1000; // Convert to milliseconds
      return Date.now() >= expirationTime;
    }

    // If no expiration, consider it expired for security
    return true;
  } catch (error) {
    console.error('Failed to parse token:', error);
    return true;
  }
}

/**
 * Get token from localStorage with expiry check
 * @returns string | null - Valid token or null
 */
export function getValidToken(): string | null {
  if (typeof window === 'undefined') return null;

  const token = localStorage.getItem('datespark_auth_token');

  if (!token) return null;

  if (isTokenExpired(token)) {
    // Clean up expired token
    localStorage.removeItem('datespark_auth_token');
    return null;
  }

  return token;
}

/**
 * Store auth token in localStorage
 * @param token - JWT token to store
 */
export function setAuthToken(token: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('datespark_auth_token', token);
}

/**
 * Remove auth token from localStorage
 */
export function removeAuthToken(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('datespark_auth_token');
}

/**
 * Check if user has admin role (client-side check)
 * @param user - User object from context/provider
 * @returns boolean - true if user is admin
 *
 * ⚠️ WARNING: This is for UI logic only. Always validate on server-side.
 */
export async function isUserAdmin(userId: number): Promise<boolean> {
  if (!userId) return false;

  try {
    const token = getValidToken();
    if (!token) return false;

    // Call API to check admin status
    const response = await fetch('/api/auth/check-admin', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) return false;

    const data = await response.json();
    return data.isAdmin === true;
  } catch (error) {
    console.error('Failed to check admin status:', error);
    return false;
  }
}

/**
 * Get authorization headers for API calls
 * @returns Headers object with Authorization header
 */
export function getAuthHeaders(): HeadersInit {
  const token = getValidToken();

  if (!token) {
    return {};
  }

  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
}

/**
 * Make authenticated API request
 * @param url - API endpoint URL
 * @param options - Fetch options
 * @returns Promise<Response>
 */
export async function authenticatedFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const headers = {
    ...getAuthHeaders(),
    ...(options.headers || {})
  };

  const response = await fetch(url, {
    ...options,
    headers
  });

  // Handle 401 Unauthorized - token might be expired
  if (response.status === 401) {
    removeAuthToken();
    // Redirect to login
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  }

  return response;
}

/**
 * Refresh token if needed (placeholder for future implementation)
 * @returns Promise<boolean> - true if token was refreshed successfully
 */
export async function refreshTokenIfNeeded(): Promise<boolean> {
  const token = getValidToken();

  if (!token) return false;

  try {
    // Parse token to check expiration
    const parts = token.split('.');
    const payload = JSON.parse(atob(parts[1]));

    if (!payload.exp) return false;

    const expirationTime = payload.exp * 1000;
    const timeUntilExpiry = expirationTime - Date.now();

    // Refresh if token expires in less than 1 hour
    const ONE_HOUR = 60 * 60 * 1000;

    if (timeUntilExpiry < ONE_HOUR && timeUntilExpiry > 0) {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: getAuthHeaders()
      });

      if (response.ok) {
        const data = await response.json();
        if (data.token) {
          setAuthToken(data.token);
          return true;
        }
      }
    }

    return false;
  } catch (error) {
    console.error('Token refresh failed:', error);
    return false;
  }
}

/**
 * Initialize auth state from localStorage
 * Call this on app mount to check for valid token
 */
export function initializeAuth(): {
  hasValidToken: boolean;
  token: string | null;
} {
  const token = getValidToken();

  return {
    hasValidToken: token !== null,
    token
  };
}
