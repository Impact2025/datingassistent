"use client";

import { useUser } from '@/providers/user-provider';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { LoadingSpinner } from '@/components/shared/loading-spinner';

const ADMIN_EMAILS = ['v_mun@hotmail.com', 'v.munster@weareimpact.nl'];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [checkingAdmin, setCheckingAdmin] = useState(true);

  // Check if current page is the login page
  const isLoginPage = pathname === '/admin/login';

  // Check admin status
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) {
        setIsAdmin(false);
        setCheckingAdmin(false);
        return;
      }

      // First check email-based admin (immediate)
      const emailIsAdmin = user.email && ADMIN_EMAILS.includes(user.email);

      // If email-based admin, no need for API call
      if (emailIsAdmin) {
        console.log('👤 Admin check: Email-based admin access granted', { email: user.email });
        setIsAdmin(true);
        setCheckingAdmin(false);
        return;
      }

      // For non-email admins, check role from API/database
      try {
        const token = localStorage.getItem('datespark_auth_token');
        if (!token) {
          console.log('👤 Admin check: No token found, not admin');
          setIsAdmin(false);
          setCheckingAdmin(false);
          return;
        }

        const response = await fetch('/api/auth/verify', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          const roleIsAdmin = data.user?.role === 'admin';

          // Check 2FA status
          const twoFactorEnabled = data.user?.two_factor_enabled || false;
          const twoFactorLastVerified = data.user?.two_factor_last_verified;

          // If 2FA is enabled, check if it was verified recently (within last 24 hours)
          let twoFactorVerified = !twoFactorEnabled; // If 2FA not enabled, consider it verified
          if (twoFactorEnabled && twoFactorLastVerified) {
            const lastVerified = new Date(twoFactorLastVerified);
            const now = new Date();
            const hoursSinceVerification = (now.getTime() - lastVerified.getTime()) / (1000 * 60 * 60);
            twoFactorVerified = hoursSinceVerification < 24; // Valid for 24 hours
          }

          // User is fully authorized only if admin AND 2FA verified (if required)
          const isFullyAuthorized = roleIsAdmin && twoFactorVerified;

          console.log('👤 Admin check:', {
            email: user.email,
            role: data.user?.role,
            isRoleAdmin: roleIsAdmin,
            twoFactorEnabled,
            twoFactorVerified,
            isFullyAuthorized
          });

          setIsAdmin(isFullyAuthorized);
        } else {
          console.log('👤 Admin check: API verify failed, not admin');
          setIsAdmin(false);
        }
      } catch (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
      } finally {
        setCheckingAdmin(false);
      }
    };

    if (!loading) {
      checkAdminStatus();
    }
  }, [user, loading]);

  useEffect(() => {
    if (loading || checkingAdmin) return;

    // If no user and not on login page, redirect to login
    if (!user && !isLoginPage) {
      console.log('🔒 AdminLayout - No user, redirecting to admin login');
      router.replace('/admin/login');
      return;
    }

    // If user exists but is not admin, redirect to regular dashboard
    if (user && !isLoginPage && isAdmin === false) {
      console.log('🔒 AdminLayout - User is not admin, redirecting to dashboard');
      router.replace('/dashboard');
      return;
    }

    // If admin user is on login page, redirect to admin dashboard
    if (user && isLoginPage && isAdmin === true) {
      console.log('✅ AdminLayout - Admin already logged in, redirecting to admin dashboard');
      router.replace('/admin');
      return;
    }
  }, [user, loading, isAdmin, checkingAdmin, isLoginPage, router, pathname]);

  // Show loading while checking auth
  if (loading || checkingAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <LoadingSpinner />
          <p className="mt-4 text-muted-foreground">Authenticatie controleren...</p>
        </div>
      </div>
    );
  }

  // Show loading while redirecting
  if (!user && !isLoginPage) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <LoadingSpinner />
          <p className="mt-4 text-muted-foreground">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  // Check if user is admin (for non-login pages)
  if (user && !isLoginPage && isAdmin === false) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <LoadingSpinner />
          <p className="mt-4 text-muted-foreground">Access denied. Redirecting...</p>
        </div>
      </div>
    );
  }

  // Render children (admin pages or login page)
  return <>{children}</>;
}
