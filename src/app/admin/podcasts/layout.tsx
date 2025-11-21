"use client";

import { useUser } from '@/providers/user-provider';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { LoadingSpinner } from '@/components/shared/loading-spinner';

const ADMIN_EMAILS = ['v_mun@hotmail.com', 'v.munster@weareimpact.nl'];

export default function PodcastsLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      // If no user, redirect to admin login
      if (!user) {
        router.replace('/admin/login');
        return;
      }

      // If user exists but is not admin, redirect to regular dashboard
      if (user && user.email && !ADMIN_EMAILS.includes(user.email)) {
        router.replace('/dashboard');
        return;
      }
    }
  }, [user, loading, router]);

  // Show loading while checking auth
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <LoadingSpinner />
          <p className="mt-4 text-muted-foreground">Toegang controleren...</p>
        </div>
      </div>
    );
  }

  // If no user, show loading state while redirecting
  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <LoadingSpinner />
          <p className="mt-4 text-muted-foreground">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  // Check if user is admin
  const isAdmin = user.email && ADMIN_EMAILS.includes(user.email);
  if (!isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Toegang geweigerd.</p>
        </div>
      </div>
    );
  }

  // Render children (podcast pages)
  return <>{children}</>;
}