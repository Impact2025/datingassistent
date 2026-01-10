'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, ArrowLeft, Home } from 'lucide-react';
import { KickstartDashboardView } from '@/components/kickstart/KickstartDashboardView';
import { BottomNavigation } from '@/components/layout/bottom-navigation';
import { Button } from '@/components/ui/button';

export default function KickstartPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkOnboarding() {
      try {
        // Check if onboarding is completed first
        const onboardingResponse = await fetch('/api/kickstart/onboarding');
        if (onboardingResponse.ok) {
          const onboardingData = await onboardingResponse.json();

          // If enrolled but onboarding not completed, redirect to onboarding
          if (!onboardingData.completed) {
            // Check if user is actually enrolled
            const enrolledResponse = await fetch('/api/user/enrolled-programs');
            if (enrolledResponse.ok) {
              const enrolledData = await enrolledResponse.json();
              const hasKickstart = enrolledData.programs?.some(
                (p: any) => p.program_slug === 'kickstart'
              );

              if (hasKickstart) {
                // User is enrolled but hasn't done onboarding - redirect
                router.push('/kickstart/onboarding');
                return;
              }
            }
          }

          // ✨ DAG 0 RITUAL CHECK - Het magische welkom moment
          // If onboarding is completed, check if Day 0 ritual is completed
          if (onboardingData.completed) {
            const token = localStorage.getItem('datespark_auth_token');
            const dayZeroResponse = await fetch('/api/kickstart/day-zero', {
              headers: {
                'Authorization': `Bearer ${token}`,
              },
            });

            if (dayZeroResponse.ok) {
              const dayZeroData = await dayZeroResponse.json();

              // If Day 0 not completed, redirect to the magical welcome experience
              if (!dayZeroData.completed) {
                router.push('/kickstart/dag-0');
                return;
              }
            }
          }
        }
      } catch (err) {
        console.error('Error checking onboarding:', err);
      } finally {
        setLoading(false);
      }
    }

    checkOnboarding();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-pink-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 pb-24">
      {/* Header - Mobile Optimized */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Back to Dashboard */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/dashboard')}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 md:hidden"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </Button>
              <div>
                <h1 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-white">Kickstart</h1>
                <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">21 dagen programma</p>
              </div>
            </div>
            {/* Desktop: Dashboard button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push('/dashboard')}
              className="hidden md:flex border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              <Home className="w-4 h-4 mr-2" />
              Dashboard
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content - KickstartDashboardView with inline day viewing */}
      <div className="max-w-7xl mx-auto px-4 py-6 md:py-8">
        <KickstartDashboardView onBack={() => router.push('/dashboard')} />
      </div>

      {/* Bottom Navigation for Mobile */}
      <BottomNavigation />
    </div>
  );
}
