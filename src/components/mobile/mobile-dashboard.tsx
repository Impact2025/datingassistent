"use client";

import { useState, useEffect, useRef, Suspense, lazy, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/providers/user-provider';
import { LoadingSpinner } from '@/components/shared/loading-spinner';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LogIn, UserPlus, Shield, Home, Wrench, MessageCircle, User, Sparkles, ChevronRight, TrendingUp, Target, BookOpen, Camera, Heart } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

// ============================================================================
// WERELDKLASSE 4-TAB MOBILE DASHBOARD
// ============================================================================
// Architecture:
// - Tab 0: Home (AI Greeting, Stats, Recommendations)
// - Tab 1: Tools (Quick Actions Grid)
// - Tab 2: Coach (Iris AI Chat)
// - Tab 3: Profiel (User Profile & Settings)
// ============================================================================

// Lazy load tab content for optimal performance
const HomeTabContent = lazy(() => import('./tabs/home-tab-content').then(mod => ({ default: mod.HomeTabContent })));
const ToolsTabContent = lazy(() => import('./tabs/tools-tab-content').then(mod => ({ default: mod.ToolsTabContent })));
const CoachTabContent = lazy(() => import('./tabs/coach-tab-content').then(mod => ({ default: mod.CoachTabContent })));
const ProfileTabContent = lazy(() => import('./tabs/profile-tab-content').then(mod => ({ default: mod.ProfileTabContent })));

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

type TabId = 'home' | 'tools' | 'coach' | 'profiel';

interface Tab {
  id: TabId;
  label: string;
  icon: React.ElementType;
  color: string;
  activeColor: string;
  bgGradient: string;
}

interface MobileDashboardProps {
  className?: string;
  initialTab?: TabId;
}

// ============================================================================
// TAB CONFIGURATION
// ============================================================================

const TABS: Tab[] = [
  {
    id: 'home',
    label: 'Home',
    icon: Home,
    color: 'text-gray-500',
    activeColor: 'text-pink-600',
    bgGradient: 'from-pink-500 to-rose-500',
  },
  {
    id: 'tools',
    label: 'Tools',
    icon: Wrench,
    color: 'text-gray-500',
    activeColor: 'text-purple-600',
    bgGradient: 'from-purple-500 to-indigo-500',
  },
  {
    id: 'coach',
    label: 'Coach',
    icon: MessageCircle,
    color: 'text-gray-500',
    activeColor: 'text-blue-600',
    bgGradient: 'from-blue-500 to-cyan-500',
  },
  {
    id: 'profiel',
    label: 'Profiel',
    icon: User,
    color: 'text-gray-500',
    activeColor: 'text-green-600',
    bgGradient: 'from-green-500 to-emerald-500',
  },
];

// ============================================================================
// HAPTIC FEEDBACK
// ============================================================================

const triggerHaptic = (intensity: 'light' | 'medium' | 'heavy' = 'light') => {
  if (typeof window !== 'undefined' && 'navigator' in window && 'vibrate' in navigator) {
    const durations = { light: 10, medium: 25, heavy: 50 };
    navigator.vibrate(durations[intensity]);
  }
};

// ============================================================================
// TAB LOADING SKELETON
// ============================================================================

function TabLoadingSkeleton() {
  return (
    <div className="p-4 space-y-4 animate-pulse">
      <div className="h-32 bg-gray-100 rounded-2xl" />
      <div className="h-24 bg-gray-100 rounded-xl" />
      <div className="h-24 bg-gray-100 rounded-xl" />
      <div className="grid grid-cols-2 gap-3">
        <div className="h-20 bg-gray-100 rounded-xl" />
        <div className="h-20 bg-gray-100 rounded-xl" />
      </div>
    </div>
  );
}

// ============================================================================
// SWIPE GESTURE HOOK
// ============================================================================

function useSwipeGesture(
  onSwipeLeft: () => void,
  onSwipeRight: () => void,
  threshold = 50
) {
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const touchEnd = useRef<{ x: number; y: number } | null>(null);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    touchEnd.current = null;
    touchStart.current = {
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY,
    };
  }, []);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    touchEnd.current = {
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY,
    };
  }, []);

  const onTouchEnd = useCallback(() => {
    if (!touchStart.current || !touchEnd.current) return;

    const distanceX = touchStart.current.x - touchEnd.current.x;
    const distanceY = touchStart.current.y - touchEnd.current.y;
    const isHorizontalSwipe = Math.abs(distanceX) > Math.abs(distanceY);

    if (isHorizontalSwipe && Math.abs(distanceX) > threshold) {
      if (distanceX > 0) {
        onSwipeLeft();
      } else {
        onSwipeRight();
      }
    }

    touchStart.current = null;
    touchEnd.current = null;
  }, [onSwipeLeft, onSwipeRight, threshold]);

  return { onTouchStart, onTouchMove, onTouchEnd };
}

// ============================================================================
// PULL TO REFRESH HOOK
// ============================================================================

function usePullToRefresh(onRefresh: () => Promise<void>) {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const startY = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (containerRef.current?.scrollTop === 0) {
      startY.current = e.touches[0].clientY;
    }
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!containerRef.current || containerRef.current.scrollTop > 0) return;

    const currentY = e.touches[0].clientY;
    const diff = currentY - startY.current;

    if (diff > 0) {
      setPullDistance(Math.min(diff * 0.4, 100));
    }
  }, []);

  const handleTouchEnd = useCallback(async () => {
    if (pullDistance > 60 && !isRefreshing) {
      setIsRefreshing(true);
      triggerHaptic('medium');
      await onRefresh();
      setIsRefreshing(false);
    }
    setPullDistance(0);
    startY.current = 0;
  }, [pullDistance, isRefreshing, onRefresh]);

  return {
    pullDistance,
    isRefreshing,
    containerRef,
    handlers: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
    },
  };
}

// ============================================================================
// BOTTOM TAB BAR COMPONENT
// ============================================================================

interface BottomTabBarProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}

function BottomTabBar({ activeTab, onTabChange }: BottomTabBarProps) {
  const activeIndex = TABS.findIndex(t => t.id === activeTab);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-t border-gray-100 safe-area-bottom">
      {/* Sliding Indicator */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gray-100">
        <div
          className="h-full bg-gradient-to-r from-pink-500 to-pink-600 transition-all duration-300 ease-out"
          style={{
            width: `${100 / TABS.length}%`,
            transform: `translateX(${activeIndex * 100}%)`,
          }}
        />
      </div>

      <div className="flex items-center justify-around px-2 py-1">
        {TABS.map((tab, index) => {
          const Icon = tab.icon;
          const isActive = tab.id === activeTab;

          return (
            <button
              key={tab.id}
              onClick={() => {
                triggerHaptic('light');
                onTabChange(tab.id);
              }}
              className={cn(
                "flex flex-col items-center justify-center px-4 py-2 rounded-xl transition-all duration-200 min-w-[70px] relative",
                "active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-500 focus-visible:ring-offset-2",
                isActive ? "scale-105" : "hover:bg-gray-50"
              )}
              aria-label={tab.label}
              aria-selected={isActive}
              role="tab"
            >
              {/* Background glow for active tab */}
              {isActive && (
                <div className="absolute inset-0 bg-gradient-to-t from-pink-50 to-transparent rounded-xl opacity-50" />
              )}

              {/* Icon */}
              <div className={cn(
                "relative transition-all duration-200",
                isActive && "transform -translate-y-0.5"
              )}>
                <Icon
                  className={cn(
                    "w-6 h-6 transition-colors duration-200",
                    isActive ? tab.activeColor : tab.color
                  )}
                  strokeWidth={isActive ? 2.5 : 2}
                />
                {/* Active dot indicator */}
                {isActive && (
                  <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-pink-500 rounded-full" />
                )}
              </div>

              {/* Label */}
              <span className={cn(
                "text-[10px] font-medium mt-1 transition-colors duration-200",
                isActive ? tab.activeColor : tab.color
              )}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

// ============================================================================
// PULL TO REFRESH INDICATOR
// ============================================================================

function PullToRefreshIndicator({ distance, isRefreshing }: { distance: number; isRefreshing: boolean }) {
  if (distance === 0 && !isRefreshing) return null;

  return (
    <div
      className="absolute top-0 left-0 right-0 z-40 flex items-center justify-center transition-all duration-200 overflow-hidden"
      style={{ height: Math.max(0, distance) }}
    >
      <div className={cn(
        "flex items-center gap-2 px-4 py-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg",
        isRefreshing && "animate-pulse"
      )}>
        {isRefreshing ? (
          <>
            <div className="w-4 h-4 border-2 border-pink-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs font-medium text-gray-700">Verversen...</span>
          </>
        ) : distance > 60 ? (
          <>
            <Sparkles className="w-4 h-4 text-pink-500" />
            <span className="text-xs font-medium text-gray-700">Loslaten om te verversen</span>
          </>
        ) : (
          <>
            <ChevronRight className="w-4 h-4 text-gray-400 rotate-90" />
            <span className="text-xs text-gray-500">Trek om te verversen</span>
          </>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// AUTH SCREENS
// ============================================================================

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-pink-50">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 mx-auto relative">
          <Image
            src="/images/Logo Icon DatingAssistent.png"
            alt="DatingAssistent"
            fill
            className="object-contain animate-pulse"
            unoptimized
          />
        </div>
        <div className="space-y-2">
          <LoadingSpinner />
          <p className="text-gray-600 text-sm">Dashboard laden...</p>
        </div>
      </div>
    </div>
  );
}

function AccessDeniedScreen({ onLogin, onRegister }: { onLogin: () => void; onRegister: () => void }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-pink-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full shadow-xl border-0 bg-white/80 backdrop-blur-sm">
        <CardContent className="p-8">
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-pink-100 to-pink-200 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner">
              <Shield className="w-10 h-10 text-pink-500" />
            </div>

            <CardTitle className="text-2xl font-bold text-gray-900 mb-3">
              Toegang Vereist
            </CardTitle>

            <p className="text-gray-600 mb-8">
              Log in om toegang te krijgen tot je persoonlijke dashboard
            </p>

            <div className="space-y-3">
              <Button
                onClick={onLogin}
                className="w-full bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-purple-600 text-white py-6 rounded-xl shadow-lg hover:shadow-xl transition-all"
                size="lg"
              >
                <LogIn className="w-5 h-5 mr-2" />
                Inloggen
              </Button>

              <Button
                onClick={onRegister}
                variant="outline"
                className="w-full border-2 border-gray-200 text-gray-700 hover:bg-gray-50 py-6 rounded-xl"
                size="lg"
              >
                <UserPlus className="w-5 h-5 mr-2" />
                Account Aanmaken
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function MobileDashboard({ className, initialTab = 'home' }: MobileDashboardProps) {
  const router = useRouter();
  const { user, userProfile, loading } = useUser();
  const [activeTab, setActiveTab] = useState<TabId>(initialTab);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Pull to refresh
  const handleRefresh = useCallback(async () => {
    // Simulate refresh - in production this would refetch data
    await new Promise(resolve => setTimeout(resolve, 1000));
  }, []);

  const { pullDistance, isRefreshing, containerRef, handlers: pullHandlers } = usePullToRefresh(handleRefresh);

  // Tab navigation with animation
  const handleTabChange = useCallback((newTab: TabId) => {
    if (newTab === activeTab || isTransitioning) return;

    setIsTransitioning(true);
    setActiveTab(newTab);

    // Reset transition state after animation
    setTimeout(() => setIsTransitioning(false), 300);
  }, [activeTab, isTransitioning]);

  // Swipe gestures
  const handleSwipeLeft = useCallback(() => {
    const currentIndex = TABS.findIndex(t => t.id === activeTab);
    if (currentIndex < TABS.length - 1) {
      handleTabChange(TABS[currentIndex + 1].id);
      triggerHaptic('light');
    }
  }, [activeTab, handleTabChange]);

  const handleSwipeRight = useCallback(() => {
    const currentIndex = TABS.findIndex(t => t.id === activeTab);
    if (currentIndex > 0) {
      handleTabChange(TABS[currentIndex - 1].id);
      triggerHaptic('light');
    }
  }, [activeTab, handleTabChange]);

  const swipeHandlers = useSwipeGesture(handleSwipeLeft, handleSwipeRight, 75);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [loading, user, router]);

  // Loading state
  if (loading) {
    return <LoadingScreen />;
  }

  // Not authenticated
  if (!user) {
    return (
      <AccessDeniedScreen
        onLogin={() => router.push('/login')}
        onRegister={() => router.push('/register')}
      />
    );
  }

  // Tab content renderer
  const renderTabContent = () => {
    const commonProps = {
      user,
      userProfile,
    };

    switch (activeTab) {
      case 'home':
        return (
          <Suspense fallback={<TabLoadingSkeleton />}>
            <HomeTabContent {...commonProps} />
          </Suspense>
        );
      case 'tools':
        return (
          <Suspense fallback={<TabLoadingSkeleton />}>
            <ToolsTabContent {...commonProps} />
          </Suspense>
        );
      case 'coach':
        return (
          <Suspense fallback={<TabLoadingSkeleton />}>
            <CoachTabContent {...commonProps} />
          </Suspense>
        );
      case 'profiel':
        return (
          <Suspense fallback={<TabLoadingSkeleton />}>
            <ProfileTabContent {...commonProps} />
          </Suspense>
        );
      default:
        return null;
    }
  };

  return (
    <div className={cn("min-h-screen bg-gray-50", className)}>
      {/* Pull to Refresh Indicator */}
      <PullToRefreshIndicator distance={pullDistance} isRefreshing={isRefreshing} />

      {/* Main Content Area */}
      <div
        ref={containerRef}
        className="pb-20 overflow-y-auto min-h-screen"
        style={{
          transform: `translateY(${pullDistance}px)`,
          transition: pullDistance === 0 ? 'transform 0.2s ease-out' : 'none',
        }}
        {...pullHandlers}
        {...swipeHandlers}
      >
        {/* Tab Content with Animation */}
        <div
          className={cn(
            "transition-all duration-300 ease-out",
            isTransitioning ? "opacity-0 translate-x-4" : "opacity-100 translate-x-0"
          )}
        >
          {renderTabContent()}
        </div>
      </div>

      {/* Bottom Tab Bar */}
      <BottomTabBar activeTab={activeTab} onTabChange={handleTabChange} />
    </div>
  );
}

export default MobileDashboard;
