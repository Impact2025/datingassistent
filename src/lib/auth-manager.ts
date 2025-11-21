/**
 * Advanced Authentication Manager
 * Production-ready authentication with token refresh, retry logic, and fallback modes
 */

import { SessionUser } from './auth';

export interface AuthState {
  user: SessionUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isRefreshing: boolean;
  lastRefresh: number;
  retryCount: number;
}

export interface AuthConfig {
  maxRetries: number;
  refreshThreshold: number; // minutes before expiry to refresh
  retryDelay: number; // base delay in ms
  maxRetryDelay: number; // max delay in ms
}

const DEFAULT_CONFIG: AuthConfig = {
  maxRetries: 3,
  refreshThreshold: 60, // refresh 1 hour before expiry
  retryDelay: 1000, // 1 second base delay
  maxRetryDelay: 10000, // 10 seconds max delay
};

export class AuthManager {
  private state: AuthState;
  private config: AuthConfig;
  private refreshPromise: Promise<string> | null = null;
  private initialized: boolean = false;

  constructor(config: Partial<AuthConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.state = {
      user: null,
      token: null,
      isAuthenticated: false,
      isRefreshing: false,
      lastRefresh: 0,
      retryCount: 0,
    };

    // Only initialize in browser environment
    if (typeof window !== 'undefined') {
      this.initialize().then(() => {
        this.initialized = true;
      }).catch(error => {
        console.error('Failed to initialize auth manager:', error);
      });
    }
  }

  /**
   * Initialize auth state from localStorage
   */
  private async initialize(): Promise<void> {
    try {
      const token = localStorage.getItem('datespark_auth_token');
      if (token) {
        const user = await this.verifyTokenLocally(token);
        if (user) {
          this.state = {
            user,
            token,
            isAuthenticated: true,
            isRefreshing: false,
            lastRefresh: Date.now(),
            retryCount: 0,
          };
        }
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
      this.clearAuth();
    }
  }

  /**
   * Verify token locally (without API call) - simplified client-side version
   */
  private verifyTokenLocally(token: string): SessionUser | null {
    try {
      // Simple JWT decode without crypto verification (for client-side use only)
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (payload.exp && payload.exp * 1000 > Date.now()) {
        return {
          id: payload.user.id,
          email: payload.user.email,
          displayName: payload.user.displayName || payload.user.email.split('@')[0]
        };
      }
      return null;
    } catch {
      return null;
    }
  }

  /**
   * Check if token needs refresh
   */
  private needsRefresh(): boolean {
    if (!this.state.token || !this.state.user) return false;

    try {
      const payload = JSON.parse(atob(this.state.token.split('.')[1]));
      const expiry = payload.exp * 1000; // Convert to milliseconds
      const now = Date.now();
      const timeUntilExpiry = expiry - now;
      const refreshThreshold = this.config.refreshThreshold * 60 * 1000; // Convert to milliseconds

      return timeUntilExpiry < refreshThreshold;
    } catch {
      return true; // If we can't parse the token, assume it needs refresh
    }
  }

  /**
   * Refresh authentication token
   */
  async refreshToken(): Promise<string> {
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.refreshPromise = this.performTokenRefresh();
    try {
      const newToken = await this.refreshPromise;
      return newToken;
    } finally {
      this.refreshPromise = null;
    }
  }

  private async performTokenRefresh(): Promise<string> {
    if (!this.state.user) {
      throw new Error('No user session to refresh');
    }

    this.state.isRefreshing = true;

    try {
      // Call refresh endpoint to get new token
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.state.token}`
        },
        body: JSON.stringify({ userId: this.state.user.id })
      });

      if (!response.ok) {
        throw new Error('Token refresh failed');
      }

      const { token: newToken } = await response.json();

      // Update state
      this.state.token = newToken;
      this.state.lastRefresh = Date.now();
      this.state.retryCount = 0;

      // Persist to localStorage
      localStorage.setItem('datespark_auth_token', newToken);

      return newToken;
    } catch (error) {
      console.error('Token refresh failed:', error);
      this.state.retryCount++;
      throw error;
    } finally {
      this.state.isRefreshing = false;
    }
  }

  /**
   * Execute authenticated API call with retry logic
   */
  async authenticatedRequest<T>(
    url: string,
    options: RequestInit = {},
    fallbackMode: boolean = false
  ): Promise<T> {
    let lastError: Error = new Error('Unknown error');

    for (let attempt = 0; attempt <= this.config.maxRetries; attempt++) {
      try {
        // Ensure we have a valid token
        let token = this.state.token;

        if (!token || this.needsRefresh()) {
          token = await this.refreshToken();
        }

        // Prepare headers
        const headers = new Headers(options.headers);
        headers.set('Authorization', `Bearer ${token}`);
        headers.set('Content-Type', 'application/json');

        // Make request
        const response = await fetch(url, {
          ...options,
          headers,
        });

        // Handle different response codes
        if (response.status === 401 || response.status === 403) {
          // Authentication failed - try refresh once
          if (attempt === 0) {
            try {
              await this.refreshToken();
              continue; // Retry with new token
            } catch (refreshError) {
              // Refresh failed, fall back to error handling
            }
          }

          // If fallback mode is enabled and we have basic user info, allow limited functionality
          if (fallbackMode && this.state.user) {
            throw new Error('AUTH_FALLBACK_MODE');
          }

          throw new Error(`Authentication failed: ${response.status}`);
        }

        if (!response.ok) {
          throw new Error(`Request failed: ${response.status} ${response.statusText}`);
        }

        return await response.json();

      } catch (error) {
        lastError = error as Error;

        // Don't retry on certain errors
        if (lastError.message === 'AUTH_FALLBACK_MODE' ||
            (lastError.message.includes('Authentication failed') && attempt > 0)) {
          break;
        }

        // Exponential backoff for retries
        if (attempt < this.config.maxRetries) {
          const delay = Math.min(
            this.config.retryDelay * Math.pow(2, attempt),
            this.config.maxRetryDelay
          );
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    throw lastError;
  }

  /**
   * Set authentication state
   */
  setAuth(user: SessionUser, token: string): void {
    this.state = {
      user,
      token,
      isAuthenticated: true,
      isRefreshing: false,
      lastRefresh: Date.now(),
      retryCount: 0,
    };

    localStorage.setItem('datespark_auth_token', token);
  }

  /**
   * Clear authentication state
   */
  clearAuth(): void {
    this.state = {
      user: null,
      token: null,
      isAuthenticated: false,
      isRefreshing: false,
      lastRefresh: 0,
      retryCount: 0,
    };

    localStorage.removeItem('datespark_auth_token');
  }

  /**
   * Get current auth state
   */
  getState(): AuthState {
    return { ...this.state };
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.state.isAuthenticated && !!this.state.token && !!this.state.user;
  }

  /**
   * Get current user
   */
  getUser(): SessionUser | null {
    return this.state.user;
  }

  /**
   * Get current token
   */
  getToken(): string | null {
    return this.state.token;
  }
}

// Global auth manager instance
export const authManager = new AuthManager();

/**
 * Enhanced error messages for authentication issues
 */
export function getAuthErrorMessage(error: Error): string {
  if (error.message === 'AUTH_FALLBACK_MODE') {
    return 'Je bent niet volledig ingelogd, maar kunt wel beperkt gebruik maken van de app. Vernieuw de pagina om opnieuw in te loggen.';
  }

  if (error.message.includes('Authentication failed')) {
    return 'Je sessie is verlopen. Log opnieuw in om door te gaan.';
  }

  if (error.message.includes('Token refresh failed')) {
    return 'Er is een probleem met je authenticatie. Probeer het opnieuw of log uit en weer in.';
  }

  if (error.message.includes('Network')) {
    return 'Netwerkprobleem gedetecteerd. Controleer je internetverbinding en probeer het opnieuw.';
  }

  return 'Er is een onverwacht probleem opgetreden. Probeer het opnieuw of neem contact op met support.';
}

/**
 * Hook for using auth manager in React components
 */
export function useAuthManager() {
  return authManager;
}