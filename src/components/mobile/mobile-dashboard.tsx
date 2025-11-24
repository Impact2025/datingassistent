"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/providers/user-provider';
import { AIHeroSection } from './ai-hero-section';
import { QuickActionsGrid } from './quick-actions-grid';
import { AISmartFlow } from './ai-smart-flow';
import { BottomNavigation } from '@/components/layout/bottom-navigation';
import { LoadingSpinner } from '@/components/shared/loading-spinner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LogIn, UserPlus, Shield } from 'lucide-react';

// Import centralized onboarding system
import { useJourneyState } from '@/hooks/use-journey-state';
import { OnboardingFlow } from '@/components/dashboard/onboarding-flow';

interface MobileDashboardProps {
  className?: string;
}

export function MobileDashboard({ className }: MobileDashboardProps) {
  const router = useRouter();
  const { user, userProfile, loading } = useUser();

  // Use centralized journey state hook
  const {
    showOnboarding,
    journeyState,
    isInitializingOnboarding,
    journeyCheckComplete,
    handlers
  } = useJourneyState({
    userId: user?.id,
    userProfile,
    enabled: !loading && !!user
  });

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [loading, user, router]);

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-white to-purple-50">
        <div className="text-center space-y-4">
          <LoadingSpinner />
          <p className="text-gray-600">Dashboard laden...</p>
        </div>
      </div>
    );
  }

  // Show access denied for non-authenticated users (fallback)
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full shadow-lg border-0 bg-white/95 backdrop-blur-sm">
          <CardHeader className="text-center pb-4">
            <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-10 h-10 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Toegang geweigerd
            </CardTitle>
            <p className="text-gray-600 mt-2">
              Je moet ingelogd zijn om dit dashboard te bekijken
            </p>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="space-y-3">
              <Button
                onClick={() => router.push('/login')}
                className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white font-semibold py-3"
                size="lg"
              >
                <LogIn className="w-5 h-5 mr-2" />
                Inloggen
              </Button>

              <Button
                onClick={() => router.push('/register')}
                variant="outline"
                className="w-full border-pink-200 text-pink-700 hover:bg-pink-50"
                size="lg"
              >
                <UserPlus className="w-5 h-5 mr-2" />
                Account aanmaken
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleStartGuidedFlow = () => {
    // This would start a personalized guided flow
    // For now, navigate to the most important action
    router.push('/profiel');
  };

  return (
    <div className="min-h-screen bg-white pb-20">
      {/* Mobile-only notice for development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="bg-gray-50 border-b border-gray-200 px-4 py-2 text-center">
          <p className="text-xs text-gray-600">
            Mobile Dashboard - Alleen zichtbaar op mobiele apparaten
          </p>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-md mx-auto px-4 py-6 space-y-6">
        {/* Show onboarding flow if needed */}
        {showOnboarding ? (
          <OnboardingFlow
            journeyState={journeyState}
            userName={user?.name}
            handlers={handlers}
          />
        ) : (
          <>
            {/* AI Hero Section */}
            <AIHeroSection onStartGuidedFlow={handleStartGuidedFlow} />

            {/* Quick Actions Grid */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Snelle Acties
              </h2>
              <QuickActionsGrid />
            </div>

            {/* AI Smart Flow */}
            <AISmartFlow />

            {/* Week Overview Card */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium text-gray-900">Deze Week</h3>
                <span className="text-sm text-gray-500">Week 45</span>
              </div>

              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-pink-600">12</div>
                  <div className="text-xs text-gray-600">Doelen behaald</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-pink-600">8</div>
                  <div className="text-xs text-gray-600">Tools gebruikt</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-pink-600">85%</div>
                  <div className="text-xs text-gray-600">Voortgang</div>
                </div>
              </div>
            </div>

            {/* Daily Learning Card */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-bold text-pink-600">📚</span>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Dagelijkse Les</h3>
                  <p className="text-sm text-gray-600">Leer effectieve openingszinnen</p>
                </div>
              </div>

              <button
                onClick={() => router.push('/leren')}
                className="w-full bg-pink-500 text-white py-3 px-4 rounded-lg text-sm font-medium hover:bg-pink-600 transition-colors"
              >
                Start Les
              </button>
            </div>
          </>
        )}
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
}