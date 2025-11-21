"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CoachDashboard } from '@/components/admin/coach-dashboard';
import { LoadingSpinner } from '@/components/shared/loading-spinner';
import { useUser } from '@/providers/user-provider';

export default function AdminCoachPage() {
  const { user, loading } = useUser();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    if (!loading) {
      // Check if user is authorized (admin or coach)
      const isAdmin = user?.email && ['v_mun@hotmail.com', 'v.munster@weareimpact.nl'].includes(user.email);

      if (!isAdmin) {
        router.push('/dashboard');
        return;
      }

      setIsAuthorized(true);
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <LoadingSpinner />
        <p className="text-muted-foreground">Coach dashboard laden...</p>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold text-red-600">Geen toegang</h2>
          <p className="text-muted-foreground">
            Je hebt geen toegang tot het coach dashboard.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto w-full max-w-7xl p-4 sm:p-6 lg:p-8">
        <CoachDashboard />
      </div>
    </div>
  );
}