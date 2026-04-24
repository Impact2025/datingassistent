"use client";

import React, { createContext, useState, useEffect, useContext, useCallback, useTransition } from 'react';
import type { UserProfile } from '@/lib/types';
import { useRouter, usePathname } from 'next/navigation';
import { WelcomeTour } from '@/components/welcome-tour';
import { AuthManager, getAuthErrorMessage } from '@/lib/auth-manager';
import { safeStorage } from '@/lib/safe-storage';
import { logger } from '@/lib/logger';

interface User {
  id: number;
  name: string;
  email: string | null;
  emailVerified?: boolean;
  createdAt: string;
  subscriptionType: string | null;
}

interface UserContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  error: string | null;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
  signup: (email: string, pass: string, name?: string) => Promise<{ user: User; requiresEmailVerification: boolean; emailFailed?: boolean }>;
  updateProfile: (profile: UserProfile) => void;
  isUpdatingProfile: boolean;
  refreshUser: () => Promise<void>;
  handleAuthError: (error: Error) => Promise<string>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

const USER_PROFILE_STORAGE_KEY_PREFIX = 'datespark_user_profile_';
const TOKEN_STORAGE_KEY = 'datespark_auth_token';

// Helper function to get cookie value
function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
}

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  logger.log('🎨 UserProvider component rendering');
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUpdatingProfile, startProfileUpdate] = useTransition();
  const [showWelcomeTour, setShowWelcomeTour] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  logger.log('🧭 UserProvider - Current pathname:', pathname);

  // Initialize AuthManager
  const [authManager] = useState(() => new AuthManager());

  // Global authentication error handler
  const handleAuthError = useCallback(async (error: Error) => {
    const errorMessage = getAuthErrorMessage(error);

    // If it's an authentication error, log the user out
    if (error.message.includes('Authentication failed') ||
        error.message.includes('Invalid or expired token') ||
        error.message === 'AUTH_FALLBACK_MODE') {

      logger.log('🔐 Authentication error detected, logging out user');

      // Clear authentication state
      safeStorage.removeItem(TOKEN_STORAGE_KEY);
      authManager.clearAuth();
      setUser(null);
      setUserProfile(null);
      setError(errorMessage);

      // Redirect to login if on a protected page
      const isProtectedPage = pathname?.startsWith('/dashboard') || pathname?.startsWith('/admin');
      if (isProtectedPage && pathname !== '/admin/login') {
        router.replace('/login');
      }
    }

    return errorMessage;
  }, [authManager, pathname, router]);

  const loadUserProfile = useCallback(async (userId: number) => {
    try {
      logger.log('🔍 Loading user profile from database for user:', userId);

      // Use AuthManager for authenticated request with automatic token refresh
      const data = await authManager.authenticatedRequest<{ profile: UserProfile | null }>(
        `/api/user/profile?userId=${userId}`,
        { method: 'GET' }
      );

      if (data.profile) {
        const profile = data.profile as UserProfile;
        logger.log('✅ Profile loaded from database');
        setUserProfile(profile);

        // Cache in localStorage
        safeStorage.setItem(USER_PROFILE_STORAGE_KEY_PREFIX + userId, JSON.stringify(profile));
      } else {
        logger.log('⚠️ No profile found in database');

        // Try localStorage as fallback
        const storedProfile = safeStorage.getItem(USER_PROFILE_STORAGE_KEY_PREFIX + userId);
        if (storedProfile) {
          logger.log('📱 Using localStorage fallback');
          setUserProfile(JSON.parse(storedProfile));
        } else {
          setUserProfile(null);
        }
      }
    } catch (err) {
      console.error('❌ Error loading user profile:', err);

      // Handle authentication errors
      if (err instanceof Error) {
        await handleAuthError(err);
      }

      // Try localStorage as fallback
      const storedProfile = safeStorage.getItem(USER_PROFILE_STORAGE_KEY_PREFIX + userId);
      if (storedProfile) {
        logger.log('📱 Using localStorage fallback after database error');
        setUserProfile(JSON.parse(storedProfile));
      } else {
        setUserProfile(null);
      }
    }
  }, []);

  // Verify token and restore user session on mount
  useEffect(() => {
    const verifyToken = async () => {
      logger.log('🔍 UserProvider: Starting token verification for pathname:', pathname);

      // Skip auth verification for public pages (logout, login, register, etc.)
      const publicPages = ['/logout', '/login', '/register', '/verify-email', '/reset-password', '/admin/login', '/admin-login'];
      if (publicPages.some(page => pathname?.startsWith(page))) {
        logger.log('🔓 Skipping auth verification for public page:', pathname);
        setLoading(false);
        return;
      }

      // ALWAYS prioritize localStorage over cookies for client-side auth
      let token = safeStorage.getItem(TOKEN_STORAGE_KEY);

      // Fallback to cookie if localStorage is empty
      if (!token) {
        token = getCookie(TOKEN_STORAGE_KEY);
        if (token) {
          logger.log('📝 Found token in cookie, syncing to localStorage');
          safeStorage.setItem(TOKEN_STORAGE_KEY, token);
        }
      }

      if (!token) {
        // Last resort: the magic-link flow sets an httpOnly cookie which
        // JavaScript cannot read via document.cookie. But the browser sends
        // it automatically on same-origin requests. Ask the server to verify
        // it and return the token so we can sync it to localStorage.
        logger.log('🔑 No JS-readable token found, trying httpOnly cookie session check');
        try {
          const cookieRes = await fetch('/api/auth/verify');
          if (cookieRes.ok) {
            const cookieData = await cookieRes.json();
            if (cookieData.token && cookieData.user) {
              safeStorage.setItem(TOKEN_STORAGE_KEY, cookieData.token);
              token = cookieData.token;
              logger.log('✅ Session restored from httpOnly cookie, token synced to localStorage');
            }
          }
        } catch { /* silent — no cookie session either */ }
      }

      if (!token) {
        logger.log('🔓 No auth token found anywhere');
        setLoading(false);
        return;
      }

      try {
        logger.log('🔐 Verifying auth token for pathname:', pathname);
        const response = await fetch('/api/auth/verify', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        logger.log('🔍 Auth verify response status:', response.status, 'headers:', Object.fromEntries(response.headers.entries()));

        if (response.ok) {
          const responseText = await response.text();
          logger.log('🔍 Auth verify response text:', responseText);

          if (!responseText || responseText.trim() === '') {
            console.error('❌ Empty response from auth verify API');
            throw new Error('Empty response from auth verify');
          }

          let data;
          try {
            data = JSON.parse(responseText);
          } catch (parseError) {
            console.error('❌ Failed to parse JSON response:', parseError, 'Response text:', responseText);
            throw new Error('Invalid JSON response from auth verify');
          }

          logger.log('✅ Token verified, user:', data.user, 'for pathname:', pathname);

          // Check if user has verified email
          if (!data.user.emailVerified) {
            logger.log('❌ User email not verified, clearing session');
            safeStorage.removeItem(TOKEN_STORAGE_KEY);
            setUser(null);
            setUserProfile(null);
            setError('Email not verified. Please check your email and verify your account.');
            return;
          }

          // Update AuthManager with verified user
          authManager.setAuth({
            id: data.user.id,
            email: data.user.email,
            displayName: data.user.name || data.user.email.split('@')[0]
          }, token);

          setUser({
            ...data.user,
            emailVerified: data.user.emailVerified ?? true,
            subscriptionType: data.user.subscriptionType ?? null,
          });

          // Load user profile from database
          await loadUserProfile(data.user.id);
          logger.log('✅ User session restored for pathname:', pathname);
        } else {
          logger.log('❌ Token verification failed for pathname:', pathname);
          safeStorage.removeItem(TOKEN_STORAGE_KEY);
          setUser(null);
          setUserProfile(null);
        }
      } catch (err) {
        console.error('❌ Error verifying token for pathname:', pathname, err);
        safeStorage.removeItem(TOKEN_STORAGE_KEY);
        setUser(null);
        setUserProfile(null);
      } finally {
        setLoading(false);
      }
    };

    verifyToken();
  }, [loadUserProfile]);

  // Handle authentication redirects - ONLY for protected pages, NOT for login redirects
  useEffect(() => {
    if (loading) return;

    // Skip redirect logic for public pages
    const publicPages = ['/logout', '/login', '/register', '/verify-email', '/reset-password', '/'];
    if (publicPages.some(page => pathname?.startsWith(page))) {
      return;
    }

    const isProtectedPage = ((pathname?.startsWith('/dashboard')) || (pathname?.startsWith('/admin'))) && pathname !== '/admin/login';

    logger.log('📍 Auth redirect check:', {
      pathname,
      isProtectedPage,
      hasUser: !!user,
      userId: user?.id
    });

    // If not authenticated and on a protected page, redirect to appropriate login
    if (!user && isProtectedPage) {
      if (pathname?.startsWith('/admin')) {
        logger.log('🔒 Admin page accessed without auth, redirecting to admin login');
        router.replace('/admin/login');
      } else {
        logger.log('🔒 Protected page accessed without auth, redirecting to login');
        router.replace('/login');
      }
    }
  }, [user, loading, pathname, router]);

  const login = useCallback(async (email: string, password: string) => {
    logger.log('🔐 Attempting login for:', email);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Login failed');
      }

      const data = await response.json();
      logger.log('✅ Login successful for:', email);

      // Check if email is verified
      if (!data.user.emailVerified) {
        throw new Error('Email not verified. Please check your email and verify your account before logging in.');
      }

      // Save token to localStorage
      safeStorage.setItem(TOKEN_STORAGE_KEY, data.token);

      // Update AuthManager with new auth state
      authManager.setAuth({
        id: data.user.id,
        email: data.user.email,
        displayName: data.user.name || data.user.email.split('@')[0]
      }, data.token);

      // Set user state
      setUser({
        ...data.user,
        emailVerified: data.user.emailVerified ?? true,
        subscriptionType: data.user.subscriptionType ?? null,
      });

      // Load user profile
      await loadUserProfile(data.user.id);

      // Check if user has seen the welcome tour
      const tourSeen = safeStorage.getItem('dating-assistant-tour-seen');
      if (!tourSeen) {
        logger.log('🎯 First login detected - will show welcome tour');
        setShowWelcomeTour(true);
      }
    } catch (err: any) {
      console.error('❌ Login error:', err);
      throw err;
    }
  }, [loadUserProfile]);

  const signup = useCallback(async (email: string, password: string, name?: string, options?: { marketingConsent?: boolean }): Promise<{ user: User; requiresEmailVerification: boolean; emailFailed?: boolean }> => {
    logger.log('📝 Attempting signup for:', email);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name: name || email.split('@')[0], email, password, marketingConsent: options?.marketingConsent ?? false })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Registration failed');
      }

      const data = await response.json();
      logger.log('✅ Signup successful for:', email);

      // For unverified accounts, don't save token or set user state
      // The user needs to verify email first
      if (data.requiresEmailVerification) {
        logger.log('📧 Email verification required for:', email);
        return {
          user: {
            ...data.user,
            emailVerified: false,
            subscriptionType: data.user.subscriptionType ?? null,
          },
          requiresEmailVerification: true,
          emailFailed: data.emailFailed ?? false,
        };
      }

      // Legacy: if somehow a token is still returned (shouldn't happen with new system)
      if (data.token) {
        safeStorage.setItem(TOKEN_STORAGE_KEY, data.token);
        setUser({
          ...data.user,
          emailVerified: data.user.emailVerified ?? true,
          subscriptionType: data.user.subscriptionType ?? null,
        });
      }

      return {
        user: {
          ...data.user,
          emailVerified: data.user.emailVerified ?? true,
          subscriptionType: data.user.subscriptionType ?? null,
        },
        requiresEmailVerification: false,
      };
    } catch (err: any) {
      console.error('❌ Signup error:', err);
      throw err;
    }
  }, []);

  const logout = useCallback(async () => {
    logger.log('🚪 Logging out user - redirecting to logout page');

    // Redirect to logout page which handles the full logout process
    router.push('/logout');

    logger.log('✅ Redirected to logout page');
  }, [router]);

  const updateProfile = useCallback(async (profile: UserProfile) => {
    if (!user) {
      console.error("Cannot update profile, no user logged in.");
      return;
    }

    startProfileUpdate(async () => {
      try {
        logger.log('💾 Saving profile to database for user:', user.id);

        // Use AuthManager for authenticated request with automatic token refresh
        await authManager.authenticatedRequest('/api/user/update-profile', {
          method: 'POST',
          body: JSON.stringify({
            userId: user.id,
            profile: profile,
          }),
        });

        // If we get here, the request was successful
        logger.log('✅ Profile saved to database successfully');

        // Also save to localStorage as cache
        safeStorage.setItem(USER_PROFILE_STORAGE_KEY_PREFIX + user.id, JSON.stringify(profile));
        logger.log('💾 Profile cached in localStorage');

        // Update state
        setUserProfile(profile);

        // Redirect new users to dashboard (old onboarding is disabled)
        // Existing users who update their profile should stay on their current page
        const isNewUser = !userProfile || (!userProfile.name && !userProfile.age);
        const isInDashboard = pathname === '/dashboard';
        if (isNewUser && pathname !== '/dashboard' && !isInDashboard) {
          logger.log('➡️ Redirecting new user to dashboard after profile creation');
          router.push('/dashboard');
        } else {
          logger.log('📍 Profile updated for existing user or dashboard user, staying on current page');
        }
      } catch (err) {
        console.error("❌ Failed to save user profile to database:", err);

        // Handle authentication errors
        if (err instanceof Error) {
          await handleAuthError(err);
        }

        // Still try to save to localStorage as fallback
        try {
          safeStorage.setItem(USER_PROFILE_STORAGE_KEY_PREFIX + user.id, JSON.stringify(profile));
          setUserProfile(profile);
          // Don't redirect to onboarding for existing users
          logger.log('📍 Profile saved to localStorage fallback, staying on current page');
        } catch (localError) {
          console.error("❌ localStorage fallback also failed:", localError);
        }
      }
    });
  }, [user, router]);

  const refreshUser = useCallback(async () => {
    const token = safeStorage.getItem(TOKEN_STORAGE_KEY);

    if (!token) {
      setUser(null);
      setUserProfile(null);
      return;
    }

    try {
      const response = await fetch('/api/auth/verify', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to refresh user');
      }

      const data = await response.json();

      // Check if user has verified email
      if (!data.user.emailVerified) {
        throw new Error('Email not verified');
      }

      setUser({
        ...data.user,
        emailVerified: data.user.emailVerified ?? true,
        subscriptionType: data.user.subscriptionType ?? null,
      });

      await loadUserProfile(data.user.id);
    } catch (err) {
      console.error('❌ Error refreshing user state:', err);
    }
  }, [loadUserProfile]);

  const value = { user, userProfile, loading, error, login, logout, signup, updateProfile, isUpdatingProfile, refreshUser, handleAuthError };

  return (
    <UserContext.Provider value={value}>
      {children}
      <WelcomeTour />
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
