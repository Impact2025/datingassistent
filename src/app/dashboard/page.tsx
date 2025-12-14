"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import dynamicImport from 'next/dynamic';
import Image from 'next/image';
import { useUser } from '@/providers/user-provider';
import { Header } from '@/components/layout/header';
import { MainNav } from '@/components/layout/main-nav';
import { Button } from '@/components/ui/button';
import { BottomNavigation } from '@/components/layout/bottom-navigation';
import { LoadingSpinner } from '@/components/shared/loading-spinner';
import { AIContextNotifications } from '@/components/shared/ai-context-notifications';
import { SocialMediaLinks } from '@/components/shared/social-media-links';
import { Loader2 } from 'lucide-react';

// Import centralized onboarding system
import { useJourneyState } from '@/hooks/use-journey-state';

// Import Kickstart onboarding - World-class integrated flow
import { KickstartOnboardingFlow } from '@/components/kickstart/KickstartOnboardingFlow';
import { DayZeroExperience } from '@/components/kickstart/DayZeroExperience';
import type { KickstartIntakeData } from '@/types/kickstart-onboarding.types';

// NIEUWE 4-TAB NAVIGATIE SYSTEEM (Masterplan)
import { MainNavNew } from '@/components/layout/main-nav-new';
import { ProactiveInvite, useProactiveInvite } from '@/components/live-chat/proactive-invite';
import { trackDashboardTab, trackToolUsed } from '@/lib/analytics/ga4-events';
import { debugLog, DASHBOARD_TABS, TAB_REDIRECT_MAP, NAVIGATION_TABS, LOADING_MESSAGES } from '@/lib/constants/dashboard';

// Force dynamic rendering for this page (required for useSearchParams)
export const dynamic = 'force-dynamic';

// ============================================
// LAZY LOADED COMPONENTS - Performance optimization
// ============================================

// Dashboard Skeleton for loading states
const DashboardSkeleton = () => (
  <div className="space-y-4 animate-pulse">
    <div className="h-32 bg-gray-200 rounded-xl"></div>
    <div className="h-48 bg-gray-200 rounded-xl"></div>
    <div className="grid grid-cols-2 gap-4">
      <div className="h-24 bg-gray-200 rounded-xl"></div>
      <div className="h-24 bg-gray-200 rounded-xl"></div>
    </div>
  </div>
);

// Core tabs - lazy loaded with skeleton
const SmartHomeTab = dynamicImport(() => import('@/components/dashboard/smart-home-tab').then(mod => ({ default: mod.SmartHomeTab })), {
  loading: () => <DashboardSkeleton />,
  ssr: false
});

const EnhancedPadTab = dynamicImport(() => import('@/components/dashboard/enhanced-pad-tab').then(mod => ({ default: mod.EnhancedPadTab })), {
  loading: () => <DashboardSkeleton />,
  ssr: false
});

const CoachTab = dynamicImport(() => import('@/components/dashboard/coach-tab').then(mod => ({ default: mod.CoachTab })), {
  loading: () => <DashboardSkeleton />,
  ssr: false
});

const ProfielTab = dynamicImport(() => import('@/components/dashboard/profiel-tab-new').then(mod => ({ default: mod.ProfielTab })), {
  loading: () => <DashboardSkeleton />,
  ssr: false
});

// Heavy modules - lazy loaded
const ProfileSuite = dynamicImport(() => import('@/components/dashboard/profile-suite').then(mod => ({ default: mod.ProfileSuite })), {
  loading: () => <DashboardSkeleton />,
  ssr: false
});

const CommunicationHub = dynamicImport(() => import('@/components/dashboard/communication-hub').then(mod => ({ default: mod.CommunicationHub })), {
  loading: () => <DashboardSkeleton />,
  ssr: false
});

const DatenRelatiesModule = dynamicImport(() => import('@/components/dashboard/daten-relaties-module').then(mod => ({ default: mod.DatenRelatiesModule })), {
  loading: () => <DashboardSkeleton />,
  ssr: false
});

const GroeiDoelenModule = dynamicImport(() => import('@/components/dashboard/groei-doelen-module').then(mod => ({ default: mod.GroeiDoelenModule })), {
  loading: () => <DashboardSkeleton />,
  ssr: false
});

const LerenOntwikkelenModule = dynamicImport(() => import('@/components/dashboard/leren-ontwikkelen-module').then(mod => ({ default: mod.LerenOntwikkelenModule })), {
  loading: () => <DashboardSkeleton />,
  ssr: false
});

const DashboardTab = dynamicImport(() => import('@/components/dashboard/dashboard-tab').then(mod => ({ default: mod.DashboardTab })), {
  loading: () => <DashboardSkeleton />,
  ssr: false
});

const CommunityTab = dynamicImport(() => import('@/components/dashboard/community-tab').then(mod => ({ default: mod.CommunityTab })), {
  loading: () => <DashboardSkeleton />,
  ssr: false
});

const OnboardingFlow = dynamicImport(() => import('@/components/dashboard/onboarding-flow').then(mod => ({ default: mod.OnboardingFlow })), {
  loading: () => <DashboardSkeleton />,
  ssr: false
});

// Settings & Management tabs - lazy loaded
const SettingsTab = dynamicImport(() => import('@/components/dashboard/settings-tab').then(mod => ({ default: mod.SettingsTab })), {
  loading: () => <DashboardSkeleton />,
  ssr: false
});

const DataManagementTab = dynamicImport(() => import('@/components/dashboard/data-management-tab').then(mod => ({ default: mod.DataManagementTab })), {
  loading: () => <DashboardSkeleton />,
  ssr: false
});

const SubscriptionTab = dynamicImport(() => import('@/components/dashboard/subscription-tab').then(mod => ({ default: mod.SubscriptionTab })), {
  loading: () => <DashboardSkeleton />,
  ssr: false
});

const CursussenTab = dynamicImport(() => import('@/components/dashboard/cursussen-tab').then(mod => ({ default: mod.CursussenTab })), {
  loading: () => <DashboardSkeleton />,
  ssr: false
});

// Engagement components - lazy loaded
const DailyDashboard = dynamicImport(() => import('@/components/engagement/daily-dashboard').then(mod => ({ default: mod.DailyDashboard })), {
  loading: () => <DashboardSkeleton />,
  ssr: false
});

const DailyCheckinModal = dynamicImport(() => import('@/components/engagement/daily-checkin-modal').then(mod => ({ default: mod.DailyCheckinModal })), {
  ssr: false
});

const MonthlyReport = dynamicImport(() => import('@/components/engagement/monthly-report').then(mod => ({ default: mod.MonthlyReport })), {
  loading: () => <DashboardSkeleton />,
  ssr: false
});

const BadgesShowcase = dynamicImport(() => import('@/components/engagement/badges-showcase').then(mod => ({ default: mod.BadgesShowcase })), {
  loading: () => <DashboardSkeleton />,
  ssr: false
});

const YearlyReview = dynamicImport(() => import('@/components/engagement/yearly-review').then(mod => ({ default: mod.YearlyReview })), {
  loading: () => <DashboardSkeleton />,
  ssr: false
});

const DatingActivityLogger = dynamicImport(() => import('@/components/engagement/dating-activity-logger').then(mod => ({ default: mod.DatingActivityLogger })), {
  loading: () => <DashboardSkeleton />,
  ssr: false
});

const TrialProgress = dynamicImport(() => import('@/components/dashboard/trial-progress').then(mod => ({ default: mod.TrialProgress })), {
  ssr: false
});

const DatingWeekNotificationModal = dynamicImport(() => import('@/components/dashboard/dating-week-notification-modal').then(mod => ({ default: mod.DatingWeekNotificationModal })), {
  ssr: false
});

export default function DashboardPage() {
  const { user, userProfile, loading } = useUser();

  const isLoading = loading;
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  // Feature flag: gebruik nieuwe 4-tab navigatie (Masterplan)
  const [useNewNav, setUseNewNav] = useState(true); // Zet op true voor nieuwe navigatie

  const [activeTab, setActiveTab] = useState(useNewNav ? 'home' : 'dashboard');
  const [checkinModalOpen, setCheckinModalOpen] = useState(false);
  const [journeyDay, setJourneyDay] = useState(1);
  const [datingWeekNotificationOpen, setDatingWeekNotificationOpen] = useState(false);

  // Iris proactive invite for registered members
  const { shouldShowInvite, dismissInvite } = useProactiveInvite();
  const [irisInviteVisible, setIrisInviteVisible] = useState(false);

  // Wereldklasse loading management voor Kickstart enrollment check
  // IMPORTANT: Must be declared before any useEffect that uses it
  const [kickstartState, setKickstartState] = useState<{
    isChecking: boolean;
    hasEnrollment: boolean | null;
    needsOnboarding: boolean;
    showDayZero: boolean; // Show dag-0 experience after intake
    checkComplete: boolean;
  }>({
    isChecking: false,
    hasEnrollment: null,
    needsOnboarding: false,
    showDayZero: false,
    checkComplete: false,
  });
  const [kickstartOnboardingSaving, setKickstartOnboardingSaving] = useState(false);

  // Wrapper for setActiveTab that includes GA4 tracking - memoized for stable reference
  const handleTabChange = useCallback((newTab: string) => {
    // Track tab change in GA4
    trackDashboardTab({
      tab_name: newTab,
      previous_tab: activeTab,
    });

    // If it's a tool/module tab, also track as tool_used
    const toolTabs = ['profiel-persoonlijkheid', 'communicatie-matching', 'daten-relaties', 'groei-doelen', 'leren-ontwikkelen'];
    if (toolTabs.includes(newTab)) {
      trackToolUsed({
        tool_name: newTab,
        tool_category: 'dashboard_module',
      });
    }

    // Update URL with tab parameter
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('tab', newTab);
      window.history.pushState({}, '', url.toString());
    }

    setActiveTab(newTab);
  }, [activeTab]);

  // Handle URL tab parameter (e.g., ?tab=subscription)
  // This effect runs whenever searchParams changes (Next.js App Router reactive hook)
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam && ['subscription', 'settings', 'data-management', 'home', 'pad', 'coach', 'profiel', 'tools'].includes(tabParam)) {
      setActiveTab(tabParam);
    } else if (!tabParam && pathname === '/dashboard') {
      // If on /dashboard without tab param, default to 'home' for new nav
      setActiveTab(useNewNav ? 'home' : 'dashboard');
    }
  }, [searchParams, pathname, useNewNav]);

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

  // Show Iris invite after 30 seconds for logged-in users (not during any onboarding)
  useEffect(() => {
    if (!user || loading || showOnboarding || kickstartState.needsOnboarding) return;

    const timer = setTimeout(() => {
      if (shouldShowInvite) {
        setIrisInviteVisible(true);
      }
    }, 30000); // 30 seconds

    return () => clearTimeout(timer);
  }, [user, loading, showOnboarding, kickstartState.needsOnboarding, shouldShowInvite]);

  // Check if user is admin (from database role)
  const [isAdminUser, setIsAdminUser] = useState(false);

  // Check for force parameter to bypass profile check (using searchParams from useSearchParams hook)
  const forceAccess = searchParams.get('force') === 'true';

  // ============================================
  // OPTIMIZED: Combined parallel API calls for admin + kickstart check
  // This reduces initial load time by ~1-2 seconds
  // ============================================
  useEffect(() => {
    const performParallelChecks = async () => {
      // Wait until user is loaded
      if (!user?.id || loading) {
        return;
      }

      // Prevent double-checking
      if (kickstartState.checkComplete) {
        return;
      }

      debugLog.info('Starting PARALLEL checks for user:', user.id);

      // Set checking state IMMEDIATELY before any async work
      setKickstartState(prev => ({ ...prev, isChecking: true }));

      const token = localStorage.getItem('datespark_auth_token');
      const headers = { 'Authorization': `Bearer ${token}` };

      try {
        // PARALLEL API CALLS - both run simultaneously
        const [adminResponse, kickstartResponse] = await Promise.all([
          fetch('/api/auth/check-admin', { headers }).catch(() => null),
          fetch('/api/kickstart/check-enrollment', { headers }).catch(() => null),
        ]);

        // Process admin check result
        let adminStatus = false;
        if (adminResponse?.ok) {
          const adminData = await adminResponse.json();
          adminStatus = adminData.isAdmin === true;
        }
        setIsAdminUser(adminStatus);

        // Process kickstart enrollment result
        if (kickstartResponse?.ok) {
          const data = await kickstartResponse.json();
          debugLog.success('Kickstart enrollment check result:', data);

          const hasEnrollment = data.hasEnrollment === true;
          const needsOnboarding = hasEnrollment && !data.hasOnboardingData;
          // Show dag-0 if user completed intake but hasn't done dag-0 yet
          const needsDayZero = hasEnrollment && data.hasOnboardingData && !data.dayZeroCompleted;

          if (needsOnboarding) {
            debugLog.action('User needs Kickstart onboarding - will show onboarding flow');
          } else if (needsDayZero) {
            debugLog.action('User needs Day Zero - will show dag-0 experience');
          } else if (hasEnrollment) {
            debugLog.success('User has completed Kickstart enrollment and dag-0');
          } else {
            debugLog.info('User does not have Kickstart enrollment');
          }

          // Update all state in one atomic operation
          setKickstartState({
            isChecking: false,
            hasEnrollment,
            needsOnboarding,
            showDayZero: needsDayZero,
            checkComplete: true,
          });
        } else {
          debugLog.warn('Failed to check Kickstart enrollment');
          setKickstartState({
            isChecking: false,
            hasEnrollment: false,
            needsOnboarding: false,
            showDayZero: false,
            checkComplete: true,
          });
        }

        // Handle admin redirect after both checks complete
        if (adminStatus && !userProfile) {
          debugLog.navigate('Dashboard - Admin user detected without profile, redirecting to /admin');
          router.push('/admin');
        }

      } catch (error) {
        debugLog.error('Error in parallel checks:', error);
        setKickstartState({
          isChecking: false,
          hasEnrollment: false,
          needsOnboarding: false,
          showDayZero: false,
          checkComplete: true,
        });
      }
    };

    performParallelChecks();
  }, [user?.id, loading, kickstartState.checkComplete, userProfile, router]);

  // Check for Monday dating week notifications
  useEffect(() => {
    const checkForNotifications = async () => {
      if (!user?.id || loading || kickstartState.needsOnboarding) return;

      try {
        // Check for test mode (any day testing) - this should work immediately
        const urlParams = new URLSearchParams(window.location.search);
        const isTestMode = urlParams.get('test-notifications') === 'true';

        if (isTestMode) {
          debugLog.info('Test mode detected, showing notification modal immediately');
          setDatingWeekNotificationOpen(true);
          return;
        }

        // Only check API if not in test mode and journey is complete
        if (journeyCheckComplete === false) return;

        try {
          const response = await fetch('/api/dating-log/last-log', {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('datespark_auth_token')}`
            }
          });

          if (response.ok) {
            const data = await response.json();
            if (data.shouldShowNotification) {
              debugLog.info('Showing Monday dating week notification');
              setDatingWeekNotificationOpen(true);
            }
          } else {
            debugLog.warn('Failed to check notifications:', response.status, response.statusText);
          }
        } catch (fetchError) {
          debugLog.warn('Network error checking notifications:', fetchError);
          // Non-blocking error - don't show notification if we can't check
        }
      } catch (error) {
        debugLog.error('Error checking for notifications:', error);
      }
    };

    // Check immediately and then every 5 minutes
    checkForNotifications();
    const interval = setInterval(checkForNotifications, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [user?.id, loading, journeyCheckComplete, kickstartState.needsOnboarding]);

  // Journey data is now loaded by the useJourneyState hook

  // Handle navigation redirects - always call this hook before any early returns
  useEffect(() => {
    if (activeTab === 'community-forum') {
      router.push('/community/forum');
      // Reset to dashboard after navigation
      setActiveTab('dashboard');
    } else if (activeTab === 'select-package') {
      router.push('/select-package');
      // Reset to dashboard after navigation
      setActiveTab('dashboard');
    } else if (activeTab === 'hechtingsstijl-redirect' || activeTab === 'hechtingsstijl') {
      debugLog.navigate('Navigating to /hechtingsstijl...');
      router.push('/hechtingsstijl');
      // Reset to dashboard after navigation
      setActiveTab('dashboard');
    } else if (activeTab === 'datingstijl') {
      router.push('/datingstijl');
      // Reset to dashboard after navigation
      setActiveTab('dashboard');
    }

    // REDIRECT LEGACY DUPLICATE TABS TO CONSOLIDATED MODULES
    // Note: 'hechtingsstijl' is handled directly above with router.push, NOT in this map
    const redirectMap: Record<string, string> = {
      'online-cursus': 'cursus',
      'profiel-coach': 'profiel-persoonlijkheid',
      'dateplanner': 'daten-relaties',
      'skills-assessment': 'leren-ontwikkelen',
      'voortgang': 'groei-doelen',
      'doelen': 'groei-doelen',
      'profiel-analyse': 'profiel-persoonlijkheid',
      'foto-advies': 'profiel-persoonlijkheid',
      'gesprek-starter': 'communicatie-matching',
      'chat-coach': 'communicatie-matching',
      'recommendations': 'leren-ontwikkelen'
    };

    if (redirectMap[activeTab]) {
      debugLog.navigate(`Redirecting legacy tab '${activeTab}' to consolidated module '${redirectMap[activeTab]}'`);
      setActiveTab(redirectMap[activeTab]);
    }
  }, [activeTab, router]);

  // Handle cursus navigation (side effect)
  useEffect(() => {
    if (activeTab === 'cursus' && typeof window !== 'undefined') {
      window.location.href = '/cursus';
    }
  }, [activeTab]);

  // Memoized handlers - must be before any early returns (Rules of Hooks)
  const handleCheckinComplete = useCallback(() => {
    setCheckinModalOpen(false);
  }, []);

  const handleKickstartOnboardingComplete = useCallback(async (data: KickstartIntakeData) => {
    if (!user?.id) return;

    setKickstartOnboardingSaving(true);

    try {
      debugLog.info('Saving Kickstart onboarding data:', data);

      const response = await fetch("/api/kickstart/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data }),
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save onboarding");
      }

      const result = await response.json();
      debugLog.success('Kickstart onboarding saved successfully:', result);

      setKickstartState(prev => ({
        ...prev,
        needsOnboarding: false,
        showDayZero: true,
      }));
      setKickstartOnboardingSaving(false);

    } catch (err) {
      debugLog.error('Error saving onboarding:', err);
      setKickstartOnboardingSaving(false);
    }
  }, [user?.id]);

  const handleDayZeroComplete = useCallback(() => {
    debugLog.success('Day Zero completed, redirecting to dag 1');
    setKickstartState(prev => ({
      ...prev,
      showDayZero: false,
    }));
    router.push('/kickstart/dag/1');
  }, [router]);

  // Memoized tab content - must be before any early returns (Rules of Hooks)
  const tabContent = useMemo(() => {
    switch (activeTab) {
      case 'home':
        return <SmartHomeTab onTabChange={handleTabChange} userId={user?.id} userProfile={userProfile} />;
      case 'pad':
        return <EnhancedPadTab onTabChange={handleTabChange} userId={user?.id} />;
      case 'coach':
        return <CoachTab onTabChange={handleTabChange} userId={user?.id} />;
      case 'tools':
        return <ProfileSuite onTabChange={handleTabChange} />;
      case 'profiel':
        return <ProfielTab onTabChange={handleTabChange} />;
      case 'profiel-persoonlijkheid':
        return <ProfileSuite onTabChange={handleTabChange} />;
      case 'communicatie-matching':
        return <CommunicationHub onTabChange={handleTabChange} />;
      case 'daten-relaties':
        return <DatenRelatiesModule onTabChange={handleTabChange} />;
      case 'groei-doelen':
        return <GroeiDoelenModule onTabChange={handleTabChange} userId={user?.id} />;
      case 'leren-ontwikkelen':
        return <LerenOntwikkelenModule onTabChange={handleTabChange} />;
      case 'cursussen':
        return <CursussenTab />;
      case 'settings':
        return <SettingsTab />;
      case 'data-management':
        return <DataManagementTab />;
      case 'subscription':
        return <SubscriptionTab />;
      case 'dashboard':
        return <DashboardTab onTabChange={handleTabChange} />;
      case 'daily':
        return (
          <>
            <DailyDashboard userId={user?.id || 0} onCheckIn={() => setCheckinModalOpen(true)} />
            <DailyCheckinModal
              open={checkinModalOpen}
              onClose={() => setCheckinModalOpen(false)}
              journeyDay={journeyDay}
              userId={user?.id || 0}
              onComplete={handleCheckinComplete}
            />
          </>
        );
      case 'monthly-report':
        return <MonthlyReport userId={user?.id || 0} month={new Date().getMonth() + 1} year={new Date().getFullYear()} />;
      case 'yearly-review':
        return <YearlyReview userId={user?.id || 0} year={new Date().getFullYear()} />;
      case 'community':
        return <CommunityTab />;
      case 'badges':
        return <BadgesShowcase userId={user?.id || 0} />;
      case 'dating-activity':
        return <DatingActivityLogger userId={user?.id || 0} />;
      default:
        return <DashboardTab onTabChange={handleTabChange} />;
    }
  }, [activeTab, user?.id, userProfile, handleTabChange, checkinModalOpen, journeyDay, handleCheckinComplete]);

  // While loading user data or checking Kickstart enrollment, show a loading state
  // This prevents the flash where dashboard is shown before onboarding
  if (isLoading || kickstartState.isChecking || !kickstartState.checkComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-pink-25 to-white flex items-center justify-center">
        <div className="text-center">
          {/* Logo */}
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

          {/* Loading spinner */}
          <LoadingSpinner />

          {/* Loading text with dynamic message */}
          <div className="mt-6 space-y-2">
            <p className="text-lg font-semibold text-gray-900">
              {isLoading ? 'Dashboard laden...' : 'Je ervaring voorbereiden...'}
            </p>
            <p className="text-sm text-gray-500">
              Even geduld, we controleren je toegang
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Allow dashboard access for Kickstart users even without user_profile
  // This is the "wereldklasse" solution: full integration without requiring profile
  // Note: kickstartState.isChecking is already handled above in the main loading check
  if (!userProfile && !kickstartState.hasEnrollment) {
    // No profile and no Kickstart enrollment - show error
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold">Welkom!</h2>
          <p className="text-muted-foreground">Je profiel wordt geladen...</p>
          <p className="text-sm text-muted-foreground">
            Als dit lang duurt, probeer opnieuw in te loggen of neem contact op met support.
          </p>
        </div>
      </div>
    );
  }

  // Check if this is mobile access to specific tabs
  const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  const tab = urlParams?.get('tab');
  const isMobileTabAccess = tab && ['subscription', 'data-management', 'chat-coach'].includes(tab);

  // Check if mobile device
  const isMobileDevice = typeof window !== 'undefined' && window.innerWidth < 768;

  // Show Kickstart onboarding if needed - integrated within dashboard
  // Uses the new world-class KickstartOnboardingFlow component
  // This check happens AFTER all loading states are complete, preventing any flash
  const showKickstartOnboarding = kickstartState.needsOnboarding;
  const showDayZero = kickstartState.showDayZero;

  if (showKickstartOnboarding) {
    debugLog.render('Rendering Kickstart onboarding flow within dashboard');
  }
  if (showDayZero) {
    debugLog.render('Rendering Day Zero experience within dashboard');
  }

  // Check if we need full-screen mobile onboarding (no header/nav)
  const isFullScreenOnboarding = showKickstartOnboarding || showDayZero;

  return (
    <>
      {isMobileTabAccess || isMobileDevice ? (
        // Mobile layout
        isFullScreenOnboarding ? (
          // FULL-SCREEN ONBOARDING MODE - No header, no bottom nav, full viewport
          <div className="fixed inset-0 bg-gradient-to-br from-pink-50 via-white to-pink-50 z-50">
            {showKickstartOnboarding ? (
              <KickstartOnboardingFlow
                userName={user?.name?.split(' ')[0]}
                onComplete={handleKickstartOnboardingComplete}
                className="h-full"
              />
            ) : showDayZero ? (
              <DayZeroExperience
                onComplete={handleDayZeroComplete}
                embedded={false}
              />
            ) : null}
          </div>
        ) : (
          // NORMAL MOBILE DASHBOARD - With header and bottom nav
          <div className="min-h-screen bg-gradient-to-br from-pink-50 via-pink-25 to-white pb-24 safe-area-inset">
            {/* Mobile Header - Sticky with enhanced design */}
            <div className="bg-white/95 backdrop-blur-md border-b border-pink-100 px-4 py-3 sticky top-0 z-40 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {/* Logo with gradient border */}
                  <div className="w-10 h-10 rounded-xl overflow-hidden shadow-md ring-2 ring-pink-100">
                    <Image
                      src="/images/LogoDatingAssistent.png"
                      alt="DatingAssistent Logo"
                      width={40}
                      height={40}
                      className="object-contain"
                      priority
                    />
                  </div>
                  <div>
                    <h1 className="text-base font-bold text-gray-900 leading-tight">
                      {activeTab === 'home' && 'Dashboard'}
                      {activeTab === 'pad' && 'Jouw Pad'}
                      {activeTab === 'coach' && 'Coach'}
                      {activeTab === 'profiel' && 'Tools'}
                      {activeTab === 'tools' && 'Tools'}
                      {activeTab === 'subscription' && 'Abonnement'}
                      {activeTab === 'data-management' && 'Data & Privacy'}
                      {activeTab === 'settings' && 'Instellingen'}
                      {!['home', 'pad', 'coach', 'profiel', 'tools', 'subscription', 'data-management', 'settings'].includes(activeTab) && 'Dashboard'}
                    </h1>
                    <p className="text-xs text-gray-500">
                      {user?.name ? `Welkom, ${user.name.split(' ')[0]}` : 'DatingAssistent'}
                    </p>
                  </div>
                </div>
                {/* Settings button with enhanced styling */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleTabChange('settings')}
                  className="p-2.5 rounded-full hover:bg-pink-50 transition-all active:scale-95"
                  aria-label="Instellingen"
                >
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </Button>
              </div>
            </div>

            {/* Mobile Content with smooth transitions */}
            <div className="px-4 pt-4 pb-6">
              {showOnboarding ? (
                <OnboardingFlow
                  journeyState={journeyState}
                  userName={user?.name}
                  handlers={handlers}
                />
              ) : (
                tabContent
              )}
            </div>

            <BottomNavigation />
          </div>
        )
      ) : (
        // Desktop layout
        <div className="min-h-screen bg-gradient-to-br from-pink-50 via-pink-25 to-white">
          <div className="mx-auto w-full max-w-4xl p-4 sm:p-6 lg:p-8">
            <div className="space-y-6">
              <Header
                onSettingsClick={() => handleTabChange('settings')}
                onSubscriptionClick={() => handleTabChange('subscription')}
              />

              {/* Trial Progress Banner - Only show for trial users and not during onboarding */}
              {user?.id && !showKickstartOnboarding && !showOnboarding && !showDayZero && <TrialProgress userId={user.id} />}

              <main className="rounded-2xl bg-white/95 backdrop-blur-sm p-4 shadow-2xl sm:p-6 border border-white/20">
              {/* Hide navigation during any onboarding or day-0 */}
              {!showOnboarding && !showKickstartOnboarding && !showDayZero && (
                useNewNav
                  ? <MainNavNew activeTab={activeTab} onTabChange={handleTabChange} />
                  : <MainNav activeTab={activeTab} onTabChange={handleTabChange} />
              )}
              <div className={showDayZero ? "" : "mt-6"}>
                {/* Show Kickstart onboarding if needed - takes priority */}
                {showKickstartOnboarding ? (
                  <div className="min-h-[600px]">
                    <KickstartOnboardingFlow
                      userName={user?.name?.split(' ')[0]}
                      onComplete={handleKickstartOnboardingComplete}
                    />
                  </div>
                ) : showDayZero ? (
                  /* Show Day Zero experience after intake chat */
                  <DayZeroExperience
                    onComplete={handleDayZeroComplete}
                    embedded={true}
                  />
                ) : showOnboarding ? (
                  /* Show regular onboarding if needed */
                  <OnboardingFlow
                    journeyState={journeyState}
                    userName={user?.name}
                    handlers={handlers}
                  />
                ) : (
                  /* Show regular dashboard content only when not onboarding */
                  tabContent
                )}
              </div>
            </main>


            {/* AI Context Notifications */}
            <AIContextNotifications />

            {/* Monday Dating Week Notification Modal */}
            <DatingWeekNotificationModal
              isOpen={datingWeekNotificationOpen}
              onClose={() => setDatingWeekNotificationOpen(false)}
              onComplete={(data) => {
                debugLog.success('Dating week log completed:', data);
                // Could add success notification here
              }}
              />

              <footer className="text-center text-sm text-muted-foreground space-y-4">
                <div className="flex justify-center items-center gap-2">
                  <span>Volg ons:</span>
                  <SocialMediaLinks size="sm" />
                </div>
                <div>
                  <p>&copy; 2025 DatingAssistent. Alle rechten voorbehouden.</p>
                  <p>
                    Jouw data is veilig en AVG-proof.{' '}
                    <button
                      onClick={() => handleTabChange('data-management')}
                      className="underline hover:text-primary bg-transparent border-none p-0 cursor-pointer"
                    >
                      Beheer je data
                    </button>.
                  </p>
                </div>
              </footer>
            </div>
          </div>

          {/* Iris Proactive Invite - Only popup for registered members (no floating button) */}
          {irisInviteVisible && !showKickstartOnboarding && (
            <ProactiveInvite
              onAccept={() => {
                setIrisInviteVisible(false);
                dismissInvite();
                handleTabChange('coach'); // Open Coach tab when accepting
              }}
              onDismiss={() => {
                setIrisInviteVisible(false);
                dismissInvite();
              }}
              position="bottom-right"
              delay={0}
              companyName="DatingAssistent"
              message="Hoi! 👋 Ik zie dat je bezig bent. Kan ik je ergens mee helpen vandaag?"
              agentName="Iris"
            />
          )}
        </div>
      )}
    </>
  );
}
