"use client";

import { useState, useEffect, useRef, Suspense, lazy } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/providers/user-provider';
import { QuickActionsGrid } from './quick-actions-grid';
import { BottomNavigation } from '@/components/layout/bottom-navigation';
import { LoadingSpinner } from '@/components/shared/loading-spinner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LogIn, UserPlus, Shield } from 'lucide-react';

// Lazy load heavy AI components for better performance
const AIHeroSection = lazy(() => import('./ai-hero-section').then(mod => ({ default: mod.AIHeroSection })));
const AISmartFlow = lazy(() => import('./ai-smart-flow').then(mod => ({ default: mod.AISmartFlow })));
const GuidedFlow = lazy(() => import('../dashboard/guided-flow').then(mod => ({ default: mod.GuidedFlow })));

// Simple Error Boundary for AI components
function AIComponentErrorBoundary({ children, fallback }: { children: React.ReactNode, fallback: React.ReactNode }) {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const handleError = (error: ErrorEvent) => {
      console.error('AI Component Error:', error);
      setHasError(true);
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  if (hasError) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

// Import centralized onboarding system
import { useJourneyState } from '@/hooks/use-journey-state';
import { OnboardingFlow } from '@/components/dashboard/onboarding-flow';

// Custom hook for dashboard data
function useDashboardData(userId?: number) {
  const [stats, setStats] = useState({
    goalsCompleted: 0,
    toolsUsed: 0,
    progress: 0,
    loading: true,
    error: null as string | null
  });

  useEffect(() => {
    if (!userId) return;

    const fetchStats = async () => {
      try {
        // Try to fetch real data, fallback to defaults
        const response = await fetch(`/api/user/dashboard-stats?userId=${userId}`);
        if (response.ok) {
          const data = await response.json();
          setStats({
            goalsCompleted: data.goalsCompleted || 0,
            toolsUsed: data.toolsUsed || 0,
            progress: data.progress || 0,
            loading: false,
            error: null
          });
        } else {
          // Fallback to default values
          setStats({
            goalsCompleted: 0,
            toolsUsed: 0,
            progress: 0,
            loading: false,
            error: null
          });
        }
      } catch (error) {
        setStats(prev => ({
          ...prev,
          loading: false,
          error: 'Kon statistieken niet laden'
        }));
      }
    };

    fetchStats();
  }, [userId]);

  return stats;
}

interface MobileDashboardProps {
  className?: string;
}

export function MobileDashboard({ className }: MobileDashboardProps) {
  const router = useRouter();
  const { user, userProfile, loading } = useUser();
  const [refreshing, setRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [startY, setStartY] = useState(0);
  const [showGuidedFlow, setShowGuidedFlow] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Use dashboard data hook
  const dashboardStats = useDashboardData(user?.id);

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
    // Start the comprehensive guided flow for existing users
    setShowGuidedFlow(true);
  };

  const handleGuidedFlowComplete = () => {
    setShowGuidedFlow(false);
    // Optionally refresh dashboard data or show success message
    window.location.reload(); // Simple refresh to show any updates
  };

  // Pull-to-refresh functionality
  const handleRefresh = async () => {
    setRefreshing(true);

    try {
      // Refresh dashboard stats
      if (user?.id) {
        const response = await fetch(`/api/user/dashboard-stats?userId=${user.id}&refresh=true`);
        if (response.ok) {
          const data = await response.json();
          // Update stats (this would need to be passed down to the hook)
          window.location.reload(); // Simple refresh for now
        }
      }
    } catch (error) {
      console.error('Error refreshing dashboard:', error);
    } finally {
      setRefreshing(false);
    }
  };

  // Touch event handlers for pull-to-refresh
  const handleTouchStart = (e: React.TouchEvent) => {
    setStartY(e.touches[0].clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!containerRef.current) return;

    const currentY = e.touches[0].clientY;
    const diff = currentY - startY;

    // Only allow pull down from top
    if (containerRef.current.scrollTop === 0 && diff > 0) {
      setPullDistance(Math.min(diff * 0.5, 80)); // Dampen the pull, max 80px
    }
  };

  const handleTouchEnd = () => {
    if (pullDistance > 50) { // Threshold for refresh
      handleRefresh();
    }
    setPullDistance(0);
    setStartY(0);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Pull to Refresh Indicator */}
      {pullDistance > 0 && (
        <div
          className="fixed top-0 left-0 right-0 z-50 bg-pink-500 text-white text-center py-2 transition-transform duration-200"
          style={{ transform: `translateY(${Math.max(-20, pullDistance - 60)}px)` }}
        >
          <div className="flex items-center justify-center gap-2">
            {pullDistance > 50 ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                <span className="text-sm font-medium">Verversen...</span>
              </>
            ) : (
              <>
                <span className="text-sm">↓ Trek om te verversen</span>
              </>
            )}
          </div>
        </div>
      )}

      {/* Main Content */}
      <div
        ref={containerRef}
        className="max-w-md mx-auto px-4 py-6 space-y-4 transition-transform duration-200"
        style={{ transform: `translateY(${pullDistance}px)` }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Show onboarding flow if needed */}
        {showOnboarding ? (
          <OnboardingFlow
            journeyState={journeyState}
            userName={user?.name}
            handlers={handlers}
          />
        ) : (
          <>
            {/* AI Hero Section - Show for users who completed onboarding */}
            {!showOnboarding && (
              <AIComponentErrorBoundary fallback={
                <Card className="bg-white border-0 shadow-sm rounded-xl overflow-hidden">
                  <CardContent className="p-6 text-center">
                    <p className="text-sm text-gray-600">AI Coach tijdelijk niet beschikbaar</p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2"
                      onClick={() => window.location.reload()}
                    >
                      Opnieuw proberen
                    </Button>
                  </CardContent>
                </Card>
              }>
                <Suspense fallback={
                  <Card className="bg-white border-0 shadow-sm rounded-xl overflow-hidden">
                    <CardContent className="p-6 text-center">
                      <LoadingSpinner />
                      <p className="text-sm text-gray-600 mt-2">AI Coach laden...</p>
                    </CardContent>
                  </Card>
                }>
                  <AIHeroSection onStartGuidedFlow={handleStartGuidedFlow} />
                </Suspense>
              </AIComponentErrorBoundary>
            )}

            {/* Welcome Header */}
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Welkom terug, {user?.name?.split(' ')[0] || 'Dater'}! 👋
              </h1>
              <p className="text-gray-600">Laten we je dating succes optimaliseren</p>
            </div>

            {/* Profile Optimization Card - High Priority */}
            <Card className="bg-white border-0 shadow-sm rounded-xl overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">🔥</span>
                      <span className="text-sm font-medium text-red-600 bg-red-50 px-2 py-1 rounded-full">
                        Urgent
                      </span>
                    </div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-2">
                      Start met je profiel
                    </h2>
                    <p className="text-sm text-gray-600 mb-3">
                      Een goed profiel is de basis van succes in dating
                    </p>
                    <p className="text-xs text-gray-500 italic">
                      "Nieuwe gebruikers zien vaak de beste resultaten met een compleet profiel"
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button
                    onClick={() => router.push('/profiel')}
                    className="flex-1 bg-pink-500 hover:bg-pink-600 text-white"
                  >
                    Profiel Optimaliseren
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => router.push('/tools')}
                    className="px-4 border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    Overslaan
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Learning Journey Card */}
            <Card className="bg-white border-0 shadow-sm rounded-xl overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-xl">🎓</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-2">
                      Jouw persoonlijke leertraject
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Gebaseerd op je vaardighedenbeoordeling hebben we een leertraject voor je samengesteld.
                    </p>
                    <Button
                      onClick={() => router.push('/leren')}
                      variant="outline"
                      className="w-full border-pink-200 text-pink-700 hover:bg-pink-50"
                    >
                      Bekijk leertraject
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions Card */}
            <Card className="bg-white border-0 shadow-sm rounded-xl overflow-hidden">
              <CardContent className="p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Snelle Acties</h3>
                <QuickActionsGrid />
              </CardContent>
            </Card>

            {/* Weekly Progress Card */}
            <Card className="bg-white border-0 shadow-sm rounded-xl overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">Deze Week</h3>
                  <span className="text-sm text-gray-500">
                    Week {Math.ceil((new Date().getTime() - new Date(new Date().getFullYear(), 0, 1).getTime()) / (1000 * 60 * 60 * 24 * 7))}
                  </span>
                </div>

                {dashboardStats.error ? (
                  <div className="text-center py-4">
                    <p className="text-sm text-gray-500 mb-2">Kon statistieken niet laden</p>
                    <button
                      onClick={() => window.location.reload()}
                      className="text-xs text-pink-600 hover:text-pink-700 underline"
                    >
                      Opnieuw proberen
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="text-2xl font-bold text-pink-600 mb-1">
                        {dashboardStats.loading ? '...' : dashboardStats.goalsCompleted}
                      </div>
                      <div className="text-xs text-gray-600">Doelen behaald</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="text-2xl font-bold text-pink-600 mb-1">
                        {dashboardStats.loading ? '...' : dashboardStats.toolsUsed}
                      </div>
                      <div className="text-xs text-gray-600">Tools gebruikt</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="text-2xl font-bold text-pink-600 mb-1">
                        {dashboardStats.loading ? '...' : `${dashboardStats.progress}%`}
                      </div>
                      <div className="text-xs text-gray-600">Voortgang</div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* AI Smart Flow - Now with real AI recommendations */}
            <AIComponentErrorBoundary fallback={
              <Card className="bg-white border-0 shadow-sm rounded-xl overflow-hidden">
                <CardContent className="p-6 text-center">
                  <p className="text-sm text-gray-600">AI Aanbevelingen tijdelijk niet beschikbaar</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() => window.location.reload()}
                  >
                    Opnieuw proberen
                  </Button>
                </CardContent>
              </Card>
            }>
              <Suspense fallback={
                <Card className="bg-white border-0 shadow-sm rounded-xl overflow-hidden">
                  <CardContent className="p-6 text-center">
                    <LoadingSpinner />
                    <p className="text-sm text-gray-600 mt-2">AI Aanbevelingen laden...</p>
                  </CardContent>
                </Card>
              }>
                <AISmartFlow userId={user?.id} />
              </Suspense>
            </AIComponentErrorBoundary>
          </>
        )}
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation />

      {/* Guided Flow Modal */}
      {showGuidedFlow && (
        <Suspense fallback={
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
            <div className="bg-white rounded-lg p-6 max-w-sm mx-4 text-center">
              <LoadingSpinner />
              <p className="text-gray-600 mt-4">Je persoonlijke coach laden...</p>
            </div>
          </div>
        }>
          <GuidedFlow
            onComplete={handleGuidedFlowComplete}
            onClose={() => setShowGuidedFlow(false)}
          />
        </Suspense>
      )}
    </div>
  );
}