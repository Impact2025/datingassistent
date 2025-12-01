"use client";

import { LandingPageContent } from '@/components/landing/landing-page-content';
import { useUser } from '@/providers/user-provider';
import { useDeviceDetection } from '@/hooks/use-device-detection';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export function HomePageClient() {
  return (
    <ClientSideRedirect>
      <LandingPageContent />
    </ClientSideRedirect>
  );
}

// Client-side component to handle authenticated user redirects
function ClientSideRedirect({ children }: { children: React.ReactNode }) {
  const { user, loading } = useUser();
  const { isDesktop } = useDeviceDetection();
  const router = useRouter();

  useEffect(() => {
    // Only redirect authenticated users
    if (!loading && user) {
      if (isDesktop) {
        // Redirect desktop users to dashboard
        router.push('/dashboard');
      } else {
        // Mobile users get mobile dashboard
        router.push('/mobile-dashboard');
      }
    }
  }, [user, loading, isDesktop, router]);

  // Show landing page for everyone (including loading states)
  // Authenticated users will be redirected by the useEffect above
  return <>{children}</>;
}