'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect, Suspense, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, ArrowLeft, Home } from 'lucide-react';
import Image from 'next/image';
import { TransformatieDashboardView } from '@/components/transformatie/TransformatieDashboardView';
import { TransformatieOnboardingFlow } from '@/components/transformatie/TransformatieOnboardingFlow';
import { BottomNavigation } from '@/components/layout/bottom-navigation';
import { Button } from '@/components/ui/button';
import { useUser } from '@/providers/user-provider';

function TransformatieContent() {
  const router = useRouter();
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [enrolled, setEnrolled] = useState(false);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [savingOnboarding, setSavingOnboarding] = useState(false);

  useEffect(() => {
    async function checkEnrollment() {
      try {
        // Check enrollment status
        const response = await fetch('/api/transformatie/check-enrollment');
        if (response.ok) {
          const data = await response.json();

          if (data.isEnrolled) {
            setEnrolled(true);
            // Check if onboarding is needed
            setNeedsOnboarding(!data.hasOnboardingData);
          } else {
            // Not enrolled - redirect to sales page or dashboard
            router.push('/dashboard');
            return;
          }
        }
      } catch (err) {
        console.error('Error checking enrollment:', err);
      } finally {
        setLoading(false);
      }
    }

    checkEnrollment();
  }, [router]);

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
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-pink-500 flex items-center justify-center shadow-xl overflow-hidden">
            <Image
              src="/images/Logo Icon DatingAssistent.png"
              alt="DatingAssistent"
              width={40}
              height={40}
              className="object-contain"
            />
          </div>
          <Loader2 className="w-8 h-8 animate-spin text-pink-500 mx-auto mb-4" />
          <p className="text-gray-600">Transformatie laden...</p>
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
    <div className="min-h-screen bg-white pb-24">
      {/* Header - Mobile Optimized */}
      <div className="bg-gradient-to-r from-pink-50 via-rose-50 to-amber-50 border-b border-pink-100 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Back to Dashboard */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/dashboard')}
                className="p-2 rounded-full hover:bg-white/50 md:hidden"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </Button>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center shadow-md overflow-hidden">
                  <Image
                    src="/images/Logo Icon DatingAssistent.png"
                    alt="DatingAssistent"
                    width={28}
                    height={28}
                    className="object-contain"
                  />
                </div>
                <div>
                  <h1 className="text-lg md:text-xl font-semibold text-gray-900">Transformatie</h1>
                  <p className="text-xs md:text-sm text-gray-500">12 modules • DESIGN → ACTION → SURRENDER</p>
                </div>
              </div>
            </div>
            {/* Desktop: Dashboard button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push('/dashboard')}
              className="hidden md:flex border-gray-200 text-gray-700 hover:bg-white"
            >
              <Home className="w-4 h-4 mr-2" />
              Dashboard
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content - TransformatieDashboardView with sidebar layout */}
      <div className="max-w-7xl mx-auto">
        <TransformatieDashboardView onBack={() => router.push('/dashboard')} />
      </div>

      {/* Bottom Navigation for Mobile */}
      <BottomNavigation />
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
