'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect, Suspense, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Settings, LogOut, CreditCard, Sun, Moon } from 'lucide-react';
import Image from 'next/image';
import { TransformatieDashboardView } from '@/components/transformatie/TransformatieDashboardView';
import { TransformatieOnboardingFlow } from '@/components/transformatie/TransformatieOnboardingFlow';
import { BottomNavigation } from '@/components/layout/bottom-navigation';
import { Button } from '@/components/ui/button';
import { useUser } from '@/providers/user-provider';
import { useTheme } from '@/providers/theme-provider';
import { Logo } from '@/components/shared/logo';
import { TierBadge } from '@/components/ui/locked-feature';
import { useAccessControl } from '@/hooks/use-access-control';
import { useTransformatieEnrollment } from '@/hooks/use-enrollment-status';

function TransformatieContent() {
  const router = useRouter();
  const { user, userProfile, logout } = useUser();
  const { theme, setTheme, actualTheme, mounted } = useTheme();
  const { userTier, isLoading: tierLoading } = useAccessControl();
  const [savingOnboarding, setSavingOnboarding] = useState(false);

  // OPTIMIZED: Use cached enrollment status from React Query
  const { data: transformatieData, isLoading: enrollmentLoading, isEnrolled, needsOnboarding } = useTransformatieEnrollment();

  // Derive loading and enrolled states
  const loading = enrollmentLoading;
  const enrolled = isEnrolled;

  const toggleTheme = () => {
    if (theme === 'light') {
      setTheme('dark');
    } else if (theme === 'dark') {
      setTheme('light');
    } else {
      setTheme(actualTheme === 'dark' ? 'light' : 'dark');
    }
  };

  // Redirect to dashboard if not enrolled
  useEffect(() => {
    if (!enrollmentLoading && !isEnrolled) {
      router.push('/dashboard');
    }
  }, [enrollmentLoading, isEnrolled, router]);

  // Handle onboarding completion
  const handleOnboardingComplete = useCallback(async (data: any) => {
    setSavingOnboarding(true);
    try {
      const response = await fetch('/api/transformatie/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data }),
      });

      if (response.ok) {
        console.log('✅ Onboarding saved successfully');
        setNeedsOnboarding(false);
      } else {
        console.error('Failed to save onboarding');
      }
    } catch (err) {
      console.error('Error saving onboarding:', err);
    } finally {
      setSavingOnboarding(false);
    }
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-pink-25 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="flex justify-center mb-8 animate-pulse">
            <Image
              src="/images/LogoDatingAssistent.png"
              alt="DatingAssistent Logo"
              width={80}
              height={80}
              className="object-contain"
              priority
            />
          </div>
          <Loader2 className="w-8 h-8 animate-spin text-pink-500 mx-auto mb-4" />
          <p className="text-lg font-semibold text-gray-900">Transformatie laden...</p>
          <p className="text-sm text-gray-500">Even geduld...</p>
        </div>
      </div>
    );
  }

  if (!enrolled) {
    return null;
  }

  // Show onboarding if needed
  if (needsOnboarding) {
    return (
      <TransformatieOnboardingFlow
        userName={user?.name}
        onComplete={handleOnboardingComplete}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-pink-25 to-white">
      <div className="mx-auto w-full max-w-4xl p-4 sm:p-6 lg:p-8">
        <div className="space-y-6">
          {/* Header - Consistent with Dashboard */}
          <header className="flex items-center justify-between pb-6" role="banner">
            <div>
              <div className="mb-2">
                <Logo iconSize={40} textSize="lg" />
              </div>
              <div className="flex items-center gap-2">
                <p className="text-sm text-muted-foreground md:text-base" role="status" aria-live="polite">
                  Welkom terug, {userProfile?.name || user?.name}!
                </p>
                {!tierLoading && userTier !== 'free' && (
                  <TierBadge tier={userTier} size="sm" />
                )}
              </div>
            </div>
            <nav className="flex items-center space-x-2" role="navigation" aria-label="Gebruikersmenu">
              {mounted && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleTheme}
                  aria-label={actualTheme === 'dark' ? 'Schakel naar licht thema' : 'Schakel naar donker thema'}
                  title={actualTheme === 'dark' ? 'Licht thema' : 'Donker thema'}
                  suppressHydrationWarning
                  noFocusRing
                  type="button"
                >
                  <Sun className="h-5 w-5" aria-hidden="true" />
                  <Moon className="h-5 w-5" aria-hidden="true" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push('/dashboard?tab=subscription')}
                aria-label="Open abonnement instellingen"
                title="Mijn Abonnement"
                noFocusRing
                type="button"
              >
                <CreditCard className="h-5 w-5" aria-hidden="true" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push('/dashboard?tab=settings')}
                aria-label="Open instellingen"
                title="Instellingen"
                noFocusRing
                type="button"
              >
                <Settings className="h-5 w-5" aria-hidden="true" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => logout()}
                aria-label="Uitloggen uit je account"
                title="Uitloggen"
                noFocusRing
                type="button"
              >
                <LogOut className="h-5 w-5" aria-hidden="true" />
              </Button>
            </nav>
          </header>

          {/* Main Content Card */}
          <main className="rounded-2xl bg-white/95 backdrop-blur-sm p-4 shadow-2xl sm:p-6 border border-white/20">
            {/* Transformatie Title Bar */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center shadow-md">
                  <span className="text-white font-bold text-lg">T</span>
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-gray-900">Transformatie</h1>
                  <p className="text-sm text-gray-500">12 modules • DESIGN → ACTION → SURRENDER</p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push('/dashboard')}
                className="border-gray-200 text-gray-700 hover:bg-gray-50"
              >
                ← Terug naar Dashboard
              </Button>
            </div>

            {/* TransformatieDashboardView */}
            <TransformatieDashboardView onBack={() => router.push('/dashboard')} />
          </main>

          {/* Footer */}
          <footer className="text-center text-sm text-muted-foreground">
            <p>&copy; 2025 DatingAssistent. Alle rechten voorbehouden.</p>
          </footer>
        </div>
      </div>

      {/* Bottom Navigation for Mobile */}
      <div className="pb-24 md:pb-0">
        <BottomNavigation />
      </div>
    </div>
  );
}

export default function TransformatiePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-pink-500" />
      </div>
    }>
      <TransformatieContent />
    </Suspense>
  );
}
