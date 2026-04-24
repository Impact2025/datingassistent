'use client';
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';

import { useState, useEffect, Suspense, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import Image from 'next/image';
import { useQueryClient } from '@tanstack/react-query';
import { TransformatieDashboardView } from '@/components/transformatie/TransformatieDashboardView';
import { DatingSnapshotFlow } from '@/components/onboarding/snapshot';
import type { UserOnboardingProfile } from '@/types/dating-snapshot.types';
import { BottomNavigation } from '@/components/layout/bottom-navigation';
import { useTransformatieEnrollment } from '@/hooks/use-enrollment-status';
import { AppShellDesktop } from '@/components/layout/app-shell-desktop';
import { useIsMobile } from '@/hooks/use-mobile';
import { Logo } from '@/components/shared/logo';

function TransformatieContent() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const isMobile = useIsMobile();

  const { isLoading: enrollmentLoading, isEnrolled, needsOnboarding } = useTransformatieEnrollment();
  const [onboardingJustCompleted, setOnboardingJustCompleted] = useState(false);

  useEffect(() => {
    if (!enrollmentLoading && !isEnrolled) {
      router.push('/dashboard');
    }
  }, [enrollmentLoading, isEnrolled, router]);

  const handleOnboardingComplete = useCallback(async (profile: UserOnboardingProfile) => {
    logger.log('✅ Dating Snapshot completed:', profile.displayName);
    setOnboardingJustCompleted(true);
    queryClient.invalidateQueries({ queryKey: ['enrollment-status'] });
  }, [queryClient]);

  const handleTabChange = useCallback((tab: string) => {
    router.push(`/dashboard?tab=${tab}`);
  }, [router]);

  if (enrollmentLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-coral-50 via-coral-25 to-white dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="flex justify-center mb-8 animate-pulse">
            <Image
              src="/images/LogoDatingAssistent.png"
              alt="DatingAssistent Logo"
              width={80}
              height={80}
              className="object-contain"
              priority
              unoptimized
            />
          </div>
          <Loader2 className="w-8 h-8 animate-spin text-coral-500 mx-auto mb-4" />
          <p className="text-lg font-semibold text-gray-900 dark:text-white">Transformatie laden...</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Even geduld...</p>
        </div>
      </div>
    );
  }

  if (!isEnrolled) return null;

  if (needsOnboarding && !onboardingJustCompleted) {
    return <DatingSnapshotFlow onComplete={handleOnboardingComplete} />;
  }

  // Mobiele layout — zelfde patroon als dashboard
  if (isMobile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-coral-50 via-coral-25 to-white dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 pb-28 safe-area-bottom">
        <div className="bg-white/98 dark:bg-gray-950/98 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 sticky top-0 z-40">
          <div className="flex items-center justify-between px-4 h-14">
            <Logo iconSize={26} textSize="sm" />
          </div>
        </div>
        <div className="px-4 pt-4 pb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-coral-500 flex items-center justify-center shadow-md">
              <span className="text-white font-bold text-lg">T</span>
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Transformatie</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">12 modules • DESIGN → ACTION → SURRENDER</p>
            </div>
          </div>
          <TransformatieDashboardView onBack={() => router.push('/dashboard')} />
        </div>
        <BottomNavigation />
      </div>
    );
  }

  // Desktop layout — AppShellDesktop geeft dezelfde navigatie als het dashboard
  return (
    <AppShellDesktop activeTab="pad" onTabChange={handleTabChange} showNavigation={true}>
      <main className="rounded-2xl bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm p-6 shadow-xl border border-white/30 dark:border-gray-800">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100 dark:border-gray-700">
          <div className="w-10 h-10 rounded-xl bg-coral-500 flex items-center justify-center shadow-md">
            <span className="text-white font-bold text-lg">T</span>
          </div>
          <div>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Transformatie</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">12 modules • DESIGN → ACTION → SURRENDER</p>
          </div>
        </div>
        <TransformatieDashboardView onBack={() => handleTabChange('home')} />
      </main>
    </AppShellDesktop>
  );
}

export default function TransformatiePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-coral-500" />
      </div>
    }>
      <TransformatieContent />
    </Suspense>
  );
}
