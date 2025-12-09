'use client';

import { useEffect, use } from 'react';
import { useRouter } from 'next/navigation';

interface PageProps {
  params: Promise<{ dayNumber: string }>;
}

/**
 * Legacy day page - redirects to new inline dashboard view
 * This page is kept for backward compatibility but redirects users
 * to the new two-panel dashboard experience
 */
export default function KickstartDayPage({ params }: PageProps) {
  const { dayNumber } = use(params);
  const router = useRouter();

  useEffect(() => {
    // Redirect to the new inline dashboard view
    // The KickstartDashboardView will handle day selection
    router.replace('/kickstart');
  }, [router]);

  // Show loading state while redirecting
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-pink-25 to-white">
      <div className="text-center">
        <p className="text-gray-600 font-medium">Doorverwijzen naar dashboard...</p>
      </div>
    </div>
  );
}
