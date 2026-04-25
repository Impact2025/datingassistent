"use client";

import { useState, useEffect, useCallback, useMemo, Suspense } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import dynamicImport from 'next/dynamic';
import { useUser } from '@/providers/user-provider';
import { Header } from '@/components/layout/header';
import { MainNav } from '@/components/layout/main-nav';
import { Button } from '@/components/ui/button';
import { BottomNavigation } from '@/components/layout/bottom-navigation';
import { LoadingSpinner } from '@/components/shared/loading-spinner';
import { Logo } from '@/components/shared/logo';
import { AIContextNotifications } from '@/components/shared/ai-context-notifications';
import { SocialMediaLinks } from '@/components/shared/social-media-links';

// World-class: React Query hooks for cached enrollment status
import { useEnrollmentStatus } from '@/hooks/use-enrollment-status';

// Import Kickstart onboarding - World-class integrated flow
import { KickstartOnboardingFlow } from '@/components/kickstart/KickstartOnboardingFlow';
import { DayZeroExperience } from '@/components/kickstart/DayZeroExperience';
import type { KickstartIntakeData } from '@/types/kickstart-onboarding.types';

// Import Transformatie onboarding - World-class Dating Snapshot Flow
import { DatingSnapshotFlow } from '@/components/onboarding/snapshot';
import type { UserOnboardingProfile } from '@/types/dating-snapshot.types';

// First-action modal: shown after free onboarding completes
import { FirstActionModal } from '@/components/onboarding/FirstActionModal';

// NIEUWE 4-TAB NAVIGATIE SYSTEEM (Masterplan)
import { MainNavNew } from '@/components/layout/main-nav-new';
import { ProactiveInvite, useProactiveInvite } from '@/components/live-chat/proactive-invite';
import { trackDashboardTab, trackToolUsed } from '@/lib/analytics/ga4-events';
import { debugLog, DASHBOARD_TABS, TAB_REDIRECT_MAP, NAVIGATION_TABS, LOADING_MESSAGES } from '@/lib/constants/dashboard';
import { announce } from '@/components/accessibility/screen-reader-announcer';

// ============================================
// WORLD-CLASS: Optimized skeleton loaders per tab type
// ============================================
import {
  DashboardSkeleton,
  HomeTabSkeleton,
  PadTabSkeleton,
  CoachTabSkeleton,
  ToolsTabSkeleton,
  SettingsTabSkeleton,
  SubscriptionTabSkeleton,
  CommunityTabSkeleton,
  EngagementSkeleton,
} from '@/components/dashboard/skeletons';

// ============================================
// WORLD-CLASS: Consolidated lazy loading with specific skeletons
// Grouped by usage pattern for optimal chunk splitting
// ============================================

// GROUP 1: Core navigation tabs (most frequently used - preload candidates)
const VandaagTab = dynamicImport(() => import('@/components/dashboard/vandaag-tab').then(mod => ({ default: mod.VandaagTab })), {
  loading: () => <HomeTabSkeleton />,
  ssr: false
});

const SmartHomeTab = dynamicImport(() => import('@/components/dashboard/smart-home-tab').then(mod => ({ default: mod.SmartHomeTab })), {
  loading: () => <HomeTabSkeleton />,
  ssr: false
});

const EnhancedPadTab = dynamicImport(() => import('@/components/dashboard/enhanced-pad-tab').then(mod => ({ default: mod.EnhancedPadTab })), {
  loading: () => <PadTabSkeleton />,
  ssr: false
});

const CoachTab = dynamicImport(() => import('@/components/dashboard/coach-tab').then(mod => ({ default: mod.CoachTab })), {
  loading: () => <CoachTabSkeleton />,
  ssr: false
});

const ProfielTab = dynamicImport(() => import('@/components/dashboard/profiel-tab-new').then(mod => ({ default: mod.ProfielTab })), {
  loading: () => <ToolsTabSkeleton />,
  ssr: false
});

// GROUP 2: Tool modules (loaded on-demand when user navigates to specific tools)
const ProfileSuite = dynamicImport(() => import('@/components/dashboard/profile-suite').then(mod => ({ default: mod.ProfileSuite })), {
  loading: () => <ToolsTabSkeleton />,
  ssr: false
});

const CommunicationHub = dynamicImport(() => import('@/components/dashboard/communication-hub').then(mod => ({ default: mod.CommunicationHub })), {
  loading: () => <ToolsTabSkeleton />,
  ssr: false
});

const DatenRelatiesModule = dynamicImport(() => import('@/components/dashboard/daten-relaties-module').then(mod => ({ default: mod.DatenRelatiesModule })), {
  loading: () => <ToolsTabSkeleton />,
  ssr: false
});

const GroeiDoelenModule = dynamicImport(() => import('@/components/dashboard/groei-doelen-module').then(mod => ({ default: mod.GroeiDoelenModule })), {
  loading: () => <ToolsTabSkeleton />,
  ssr: false
});

const LerenOntwikkelenModule = dynamicImport(() => import('@/components/dashboard/leren-ontwikkelen-module').then(mod => ({ default: mod.LerenOntwikkelenModule })), {
  loading: () => <ToolsTabSkeleton />,
  ssr: false
});

// GROUP 3: Secondary tabs (less frequently accessed)
const DashboardTab = dynamicImport(() => import('@/components/dashboard/dashboard-tab').then(mod => ({ default: mod.DashboardTab })), {
  loading: () => <DashboardSkeleton />,
  ssr: false
});

const CommunityTab = dynamicImport(() => import('@/components/dashboard/community-tab').then(mod => ({ default: mod.CommunityTab })), {
  loading: () => <CommunityTabSkeleton />,
  ssr: false
});

const CursussenTab = dynamicImport(() => import('@/components/dashboard/cursussen-tab').then(mod => ({ default: mod.CursussenTab })), {
  loading: () => <DashboardSkeleton />,
  ssr: false
});

// GROUP 4: Settings & Account management
const SettingsTab = dynamicImport(() => import('@/components/dashboard/settings-tab').then(mod => ({ default: mod.SettingsTab })), {
  loading: () => <SettingsTabSkeleton />,
  ssr: false
});

const DataManagementTab = dynamicImport(() => import('@/components/dashboard/data-management-tab').then(mod => ({ default: mod.DataManagementTab })), {
  loading: () => <SettingsTabSkeleton />,
  ssr: false
});

const SubscriptionTab = dynamicImport(() => import('@/components/dashboard/subscription-tab').then(mod => ({ default: mod.SubscriptionTab })), {
  loading: () => <SubscriptionTabSkeleton />,
  ssr: false
});

// GROUP 5: Engagement & Analytics (rarely accessed, large components)
const DailyDashboard = dynamicImport(() => import('@/components/engagement/daily-dashboard').then(mod => ({ default: mod.DailyDashboard })), {
  loading: () => <EngagementSkeleton />,
  ssr: false
});

const DailyCheckinModal = dynamicImport(() => import('@/components/engagement/daily-checkin-modal').then(mod => ({ default: mod.DailyCheckinModal })), {
  ssr: false
});

const MonthlyReport = dynamicImport(() => import('@/components/engagement/monthly-report').then(mod => ({ default: mod.MonthlyReport })), {
  loading: () => <EngagementSkeleton />,
  ssr: false
});

const BadgesShowcase = dynamicImport(() => import('@/components/engagement/badges-showcase').then(mod => ({ default: mod.BadgesShowcase })), {
  loading: () => <EngagementSkeleton />,
  ssr: false
});

const YearlyReview = dynamicImport(() => import('@/components/engagement/yearly-review').then(mod => ({ default: mod.YearlyReview })), {
  loading: () => <EngagementSkeleton />,
  ssr: false
});

const DatingActivityLogger = dynamicImport(() => import('@/components/engagement/dating-activity-logger').then(mod => ({ default: mod.DatingActivityLogger })), {
  loading: () => <EngagementSkeleton />,
  ssr: false
});

// GROUP 6: Standalone tools & modals
const WaardenKompasTool = dynamicImport(() => import('@/components/waarden-kompas/WaardenKompasTool').then(mod => ({ default: mod.WaardenKompasTool })), {
  loading: () => <ToolsTabSkeleton />,
  ssr: false
});

const ToolsTab = dynamicImport(() => import('@/components/dashboard/tools-tab').then(mod => ({ default: mod.ToolsTab })), {
  loading: () => <ToolsTabSkeleton />,
  ssr: false
});

const TrialProgress = dynamicImport(() => import('@/components/dashboard/trial-progress').then(mod => ({ default: mod.TrialProgress })), {
  ssr: false
});

const DatingWeekNotificationModal = dynamicImport(() => import('@/components/dashboard/dating-week-notification-modal').then(mod => ({ default: mod.DatingWeekNotificationModal })), {
  ssr: false
});

const DatingStyleFlow = dynamicImport(() => import('@/components/dating-style/dating-style-flow').then(mod => ({ default: mod.DatingStyleFlow })), {
  loading: () => <ToolsTabSkeleton />,
  ssr: false
});

const AttachmentAssessmentFlow = dynamicImport(() => import('@/components/attachment-assessment/attachment-assessment-flow').then(mod => ({ default: mod.AttachmentAssessmentFlow })), {
  loading: () => <ToolsTabSkeleton />,
  ssr: false
});

const EmotioneleReadinessFlow = dynamicImport(() => import('@/components/emotional-readiness/emotionele-readiness-flow').then(mod => ({ default: mod.EmotioneleReadinessFlow })), {
  loading: () => <ToolsTabSkeleton />,
  ssr: false
});

const LevensvisieFlow = dynamicImport(() => import('@/components/levensvisie/levensvisie-flow').then(mod => ({ default: mod.LevensvisieFlow })), {
  loading: () => <ToolsTabSkeleton />,
  ssr: false
});

const RelatiepatronenFlow = dynamicImport(() => import('@/components/relatiepatronen/relatiepatronen-flow').then(mod => ({ default: mod.RelatiepatronenFlow })), {
  loading: () => <ToolsTabSkeleton />,
  ssr: false
});

const BlindVlekkenFlow = dynamicImport(() => import('@/components/blind-vlekken/blind-vlekken-flow').then(mod => ({ default: mod.BlindVlekkenFlow })), {
  loading: () => <ToolsTabSkeleton />,
  ssr: false
});

// Settings Header - Shows navigation for settings tabs
import { SettingsHeader } from '@/components/dashboard/settings-header';
import { AppShellDesktop } from '@/components/layout/app-shell-desktop';
import { useIsMobile } from '@/hooks/use-mobile';

// ============================================
// WORLD-CLASS: Prefetch core tabs for instant navigation
// ============================================
const prefetchCoreTabs = () => {
  // Prefetch the 4 main navigation tabs after initial load
  // This ensures instant tab switching for the most common user journeys
  const prefetchPromises = [
    import('@/components/dashboard/vandaag-tab'),
    import('@/components/dashboard/enhanced-pad-tab'),
    import('@/components/dashboard/coach-tab'),
    import('@/components/dashboard/profiel-tab-new'),
  ];

  // Use requestIdleCallback for non-blocking prefetch
  if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
    (window as any).requestIdleCallback(() => {
      Promise.all(prefetchPromises).catch(() => {
        // Silent fail - prefetch is optimization only
      });
    });
  } else {
    // Fallback: prefetch after 2 seconds
    setTimeout(() => {
      Promise.all(prefetchPromises).catch(() => {});
    }, 2000);
  }
};

// Internal component with useSearchParams
function DashboardPageContent() {
  const { user, userProfile, loading } = useUser();
  const isMobileDevice = useIsMobile();

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
  const [showFirstActionModal, setShowFirstActionModal] = useState(false);
  const [onboardingPath, setOnboardingPath] = useState<'profile' | 'conversation' | 'dating' | 'confidence'>('profile');

  // Iris proactive invite for registered members
  const { shouldShowInvite, dismissInvite } = useProactiveInvite();
  const [irisInviteVisible, setIrisInviteVisible] = useState(false);

  // ============================================
  // WORLD-CLASS: React Query cached enrollment status
  // Single API call replaces 2 separate enrollment checks
  // 30s cache with stale-while-revalidate
  // ============================================
  const {
    data: enrollmentData,
    isLoading: enrollmentLoading,
    isError: enrollmentError,
  } = useEnrollmentStatus({ enabled: !loading && !!user });

  // Derive kickstart state from React Query data
  const kickstartState = useMemo(() => ({
    isChecking: enrollmentLoading,
    hasEnrollment: enrollmentData?.kickstart?.isEnrolled ?? null,
    needsOnboarding: enrollmentData?.kickstart?.needsOnboarding ?? false,
    showDayZero: enrollmentData?.kickstart?.needsDayZero ?? false,
    checkComplete: !enrollmentLoading && !enrollmentError,
  }), [enrollmentData, enrollmentLoading, enrollmentError]);

  const [kickstartOnboardingSaving, setKickstartOnboardingSaving] = useState(false);

  // Derive transformatie state from React Query data
  const transformatieState = useMemo(() => ({
    isChecking: enrollmentLoading,
    hasEnrollment: enrollmentData?.transformatie?.isEnrolled ?? null,
    needsOnboarding: enrollmentData?.transformatie?.needsOnboarding ?? false,
    checkComplete: !enrollmentLoading && !enrollmentError,
  }), [enrollmentData, enrollmentLoading, enrollmentError]);

  const [transformatieOnboardingSaving, setTransformatieOnboardingSaving] = useState(false);

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

    // Announce tab change to screen readers
    const tabNames: Record<string, string> = {
      'home': 'Home',
      'pad': 'Pad',
      'coach': 'Coach',
      'tools': 'Tools',
      'profiel': 'Profiel',
      'settings': 'Instellingen',
      'subscription': "Programma's",
    };
    const tabName = tabNames[newTab] || newTab;
    announce(`${tabName} tabblad geladen`, 'polite');

    setActiveTab(newTab);
  }, [activeTab]);

  // Handle URL tab parameter (e.g., ?tab=subscription)
  // This effect runs whenever searchParams changes (Next.js App Router reactive hook)
  useEffect(() => {
    const tabParam = searchParams?.get('tab');
    if (tabParam && ['subscription', 'settings', 'data-management', 'home', 'pad', 'coach', 'profiel', 'tools', 'waarden-kompas'].includes(tabParam)) {
      setActiveTab(tabParam);
    } else if (!tabParam && pathname === '/dashboard') {
      // If on /dashboard without tab param, default to 'home' for new nav
      setActiveTab(useNewNav ? 'home' : 'dashboard');
    }
  }, [searchParams, pathname, useNewNav]);

  // Show FirstActionModal after completing free onboarding
  useEffect(() => {
    const onboardingParam = searchParams?.get('onboarding');
    const pathParam = searchParams?.get('path') as 'profile' | 'conversation' | 'dating' | 'confidence' | null;
    if (onboardingParam === 'complete' && !kickstartState.needsOnboarding && !transformatieState.needsOnboarding) {
      setOnboardingPath(pathParam ?? 'profile');
      setShowFirstActionModal(true);
    }
  }, [searchParams, kickstartState.needsOnboarding, transformatieState.needsOnboarding]);

  const handleDismissFirstActionModal = useCallback(() => {
    setShowFirstActionModal(false);
    router.replace('/dashboard');
  }, [router]);

  // Show Iris invite after 30 seconds for logged-in users (not during any onboarding)
  useEffect(() => {
    if (!user || loading || kickstartState.needsOnboarding || transformatieState.needsOnboarding) return;

    const timer = setTimeout(() => {
      if (shouldShowInvite) {
        setIrisInviteVisible(true);
      }
    }, 30000); // 30 seconds

    return () => clearTimeout(timer);
  }, [user, loading, kickstartState.needsOnboarding, transformatieState.needsOnboarding, shouldShowInvite]);

  // WORLD-CLASS: Prefetch core tabs after initial dashboard load
  useEffect(() => {
    if (!loading && user && !kickstartState.needsOnboarding && !transformatieState.needsOnboarding) {
      prefetchCoreTabs();
    }
  }, [loading, user, kickstartState.needsOnboarding, transformatieState.needsOnboarding]);

  // Check if user is admin (from database role)
  const [isAdminUser, setIsAdminUser] = useState(false);

  // Quiz-lead state: detect users who completed the quiz but haven't purchased
  const [quizLeadResult, setQuizLeadResult] = useState<{
    id: number;
    firstName: string;
    attachmentPattern: string;
    completedAt: string;
  } | null | undefined>(undefined); // undefined = not yet fetched, null = no result found

  // Check for force parameter to bypass profile check (using searchParams from useSearchParams hook)
  const forceAccess = searchParams?.get('force') === 'true';

  // ============================================
  // WORLD-CLASS: Minimal admin check only
  // Enrollment checks now handled by React Query with caching
  // ============================================
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user?.id || loading) return;

      try {
        const token = localStorage.getItem('datespark_auth_token');
        const response = await fetch('/api/auth/check-admin', {
          headers: { 'Authorization': `Bearer ${token}` },
        });

        if (response.ok) {
          const data = await response.json();
          const adminStatus = data.isAdmin === true;
          setIsAdminUser(adminStatus);

          // Redirect admin without profile to admin panel
          if (adminStatus && !userProfile) {
            debugLog.navigate('Dashboard - Admin user detected without profile, redirecting to /admin');
            router.push('/admin');
          }
        }
      } catch (error) {
        debugLog.error('Admin check error:', error);
      }
    };

    checkAdminStatus();
  }, [user?.id, loading, userProfile, router]);

  // Detect quiz leads: fetch quiz result when user has no profile and no enrollment
  useEffect(() => {
    if (loading || enrollmentLoading || !user?.id) return;
    if (userProfile || kickstartState.hasEnrollment || transformatieState.hasEnrollment) return;
    if (quizLeadResult !== undefined) return; // Already fetched

    const fetchQuizResult = async () => {
      try {
        const token = localStorage.getItem('datespark_auth_token');
        const response = await fetch('/api/quiz/pattern/my-result', {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
          setQuizLeadResult(data.result ?? null);
        } else {
          setQuizLeadResult(null);
        }
      } catch {
        setQuizLeadResult(null);
      }
    };

    fetchQuizResult();
  }, [loading, enrollmentLoading, user?.id, userProfile, kickstartState.hasEnrollment, transformatieState.hasEnrollment, quizLeadResult]);

  // Log enrollment status from React Query (for debugging)
  useEffect(() => {
    if (enrollmentData && !enrollmentLoading) {
      debugLog.success('Enrollment status (cached):', {
        kickstart: enrollmentData.kickstart,
        transformatie: enrollmentData.transformatie,
        responseTime: enrollmentData._meta?.duration,
      });
    }
  }, [enrollmentData, enrollmentLoading]);

  // Check for Monday dating week notifications - with visibility-aware polling
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    let isPageVisible = true;

    const checkForNotifications = async () => {
      // Skip if page is not visible or conditions not met
      if (!isPageVisible || !user?.id || loading || kickstartState.needsOnboarding) return;

      try {
        // Check for test mode (any day testing) - this should work immediately
        const urlParams = new URLSearchParams(window.location.search);
        const isTestMode = urlParams.get('test-notifications') === 'true';

        if (isTestMode) {
          debugLog.info('Test mode detected, showing notification modal immediately');
          setDatingWeekNotificationOpen(true);
          return;
        }

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
        }
      } catch (error) {
        debugLog.error('Error checking for notifications:', error);
      }
    };

    // Handle visibility change - pause/resume polling when tab is hidden/visible
    const handleVisibilityChange = () => {
      isPageVisible = document.visibilityState === 'visible';

      if (isPageVisible) {
        // Resume: check immediately and restart interval
        checkForNotifications();
        if (!interval) {
          interval = setInterval(checkForNotifications, 5 * 60 * 1000);
        }
      } else {
        // Pause: clear interval when page is hidden
        if (interval) {
          clearInterval(interval);
          interval = null;
        }
      }
    };

    // Initial check and start polling
    checkForNotifications();
    interval = setInterval(checkForNotifications, 5 * 60 * 1000); // 5 minutes

    // Listen for visibility changes
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      if (interval) clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [user?.id, loading, kickstartState.needsOnboarding]);

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

  // Handle Transformatie onboarding completion - World-class Dating Snapshot integration
  const handleTransformatieOnboardingComplete = useCallback(async (profile: UserOnboardingProfile) => {
    if (!user?.id) return;

    setTransformatieOnboardingSaving(true);

    try {
      debugLog.info('Dating Snapshot completed:', profile.displayName);

      // The DatingSnapshotFlow already saves to /api/transformatie/snapshot
      // We just need to invalidate the cache and redirect
      debugLog.success('Dating Snapshot saved, redirecting to Transformatie');

      setTransformatieOnboardingSaving(false);

      // Invalidate enrollment cache to reflect completed onboarding
      // This is handled by the DatingSnapshotFlow component

      // Redirect to the Transformatie experience
      router.push('/transformatie');

    } catch (err) {
      debugLog.error('Error completing Transformatie onboarding:', err);
      setTransformatieOnboardingSaving(false);
    }
  }, [user?.id, router]);

  // Memoized tab content - must be before any early returns (Rules of Hooks)
  const tabContent = useMemo(() => {
    // Settings tabs include header with navigation
    const isSettingsTab = ['settings', 'subscription', 'data-management'].includes(activeTab);

    const getSettingsContent = () => {
      switch (activeTab) {
        case 'settings':
          return <SettingsTab />;
        case 'subscription':
          return <SubscriptionTab />;
        case 'data-management':
          return <DataManagementTab />;
        default:
          return null;
      }
    };

    if (isSettingsTab) {
      return (
        <>
          <SettingsHeader
            activeTab={activeTab as 'settings' | 'subscription' | 'data-management'}
            onTabChange={handleTabChange}
          />
          {getSettingsContent()}
        </>
      );
    }

    switch (activeTab) {
      case 'home':
        return <VandaagTab onTabChange={handleTabChange} userId={user?.id} />;
      case 'pad':
        return <EnhancedPadTab onTabChange={handleTabChange} userId={user?.id} />;
      case 'coach':
        return <CoachTab onTabChange={handleTabChange} userId={user?.id} />;
      case 'tools':
        return <ToolsTab />;
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
      case 'waarden-kompas':
        return <WaardenKompasTool />;
      case 'datingstijl':
        return <DatingStyleFlow />;
      case 'hechtingsstijl':
      case 'hechtingsstijl-redirect':
        return <AttachmentAssessmentFlow />;
      case 'emotionele-readiness':
        return <EmotioneleReadinessFlow />;
      case 'levensvisie':
        return <LevensvisieFlow />;
      case 'relatiepatronen':
        return <RelatiepatronenFlow />;
      case 'blind-vlekken':
        return <BlindVlekkenFlow />;
      default:
        return <DashboardTab onTabChange={handleTabChange} />;
    }
  }, [activeTab, user?.id, userProfile, handleTabChange, checkinModalOpen, journeyDay, handleCheckinComplete]);

  // Not authenticated and done loading → UserProvider will redirect, just show spinner
  if (!isLoading && !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-coral-50 via-coral-25 to-white flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  // While loading user data or checking Kickstart/Transformatie enrollment, show a loading state
  // This prevents the flash where dashboard is shown before onboarding
  if (isLoading || kickstartState.isChecking || !kickstartState.checkComplete || transformatieState.isChecking || !transformatieState.checkComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-coral-50 via-coral-25 to-white flex items-center justify-center">
        <div className="text-center">
          {/* Logo */}
          <div className="flex justify-center mb-8 animate-pulse">
            <Logo iconSize={56} textSize="xl" />
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

  // Allow dashboard access for Kickstart/Transformatie users even without user_profile
  // This is the "wereldklasse" solution: full integration without requiring profile
  // Note: kickstartState.isChecking is already handled above in the main loading check
  if (!userProfile && !kickstartState.hasEnrollment && !transformatieState.hasEnrollment) {
    // Still fetching quiz result? Show loading
    if (quizLeadResult === undefined) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-coral-50 via-coral-25 to-white flex items-center justify-center">
          <div className="text-center">
            <LoadingSpinner />
            <p className="mt-4 text-sm text-gray-500">Even geduld...</p>
          </div>
        </div>
      );
    }

    // Quiz lead: completed quiz but has no active program
    const patternLabels: Record<string, string> = {
      secure: 'Veilig Gehecht',
      anxious: 'Angstig Gehecht',
      avoidant: 'Vermijdend Gehecht',
      fearful_avoidant: 'Angstig-Vermijdend Gehecht',
      disorganized: 'Gedesorganiseerd Gehecht',
    };
    const patternLabel = quizLeadResult
      ? (patternLabels[quizLeadResult.attachmentPattern] ?? quizLeadResult.attachmentPattern)
      : null;

    return (
      <div className="min-h-screen bg-gradient-to-br from-coral-50 via-coral-25 to-white flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="flex justify-center">
            <Logo iconSize={48} textSize="lg" />
          </div>

          {quizLeadResult ? (
            <>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Welkom terug, {quizLeadResult.firstName}!
                </h2>
                <p className="mt-2 text-gray-600">
                  Je hebt de scan gedaan en je patroon is:{' '}
                  <span className="font-semibold text-coral-600">{patternLabel}</span>.
                </p>
              </div>
              <p className="text-gray-500 text-sm">
                Je hebt nog geen programma geactiveerd. Start je traject om toegang te krijgen tot je persoonlijk dashboard.
              </p>
              <div className="space-y-3">
                <Button
                  className="w-full bg-coral-500 hover:bg-coral-600 text-white font-semibold py-3"
                  onClick={() => router.push(`/checkout/transformatie?userId=${user?.id}&discount=true&source=quiz`)}
                >
                  Start mijn traject
                </Button>
                <button
                  className="w-full text-sm text-gray-500 hover:text-gray-700 underline"
                  onClick={() => router.push(`/quiz/dating-patroon/resultaat?id=${quizLeadResult.id}`)}
                >
                  Bekijk mijn scan resultaat
                </button>
              </div>
            </>
          ) : (
            <>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Welkom!</h2>
                <p className="mt-2 text-gray-600">
                  Je hebt nog geen actief programma.
                </p>
              </div>
              <div className="space-y-3">
                <Button
                  className="w-full bg-coral-500 hover:bg-coral-600 text-white font-semibold py-3"
                  onClick={() => router.push('/select-package')}
                >
                  Bekijk programma&apos;s
                </Button>
                <p className="text-xs text-gray-400">
                  Vragen? Neem contact op via{' '}
                  <a href="mailto:info@datingassistent.nl" className="underline">
                    info@datingassistent.nl
                  </a>
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  // Show Kickstart onboarding if needed - integrated within dashboard
  // Uses the new world-class KickstartOnboardingFlow component
  // This check happens AFTER all loading states are complete, preventing any flash
  const showKickstartOnboarding = kickstartState.needsOnboarding;
  const showDayZero = kickstartState.showDayZero;

  // Show Transformatie onboarding if needed - World-class integration
  const showTransformatieOnboarding = transformatieState.needsOnboarding;

  if (showKickstartOnboarding) {
    debugLog.render('Rendering Kickstart onboarding flow within dashboard');
  }
  if (showDayZero) {
    debugLog.render('Rendering Day Zero experience within dashboard');
  }
  if (showTransformatieOnboarding) {
    debugLog.render('Rendering Transformatie onboarding flow within dashboard');
  }

  // Check if we need full-screen mobile onboarding (no header/nav)
  const isFullScreenOnboarding = showKickstartOnboarding || showDayZero || showTransformatieOnboarding;

  return (
    <>
      {isMobileDevice ? (
        // Mobile layout
        isFullScreenOnboarding ? (
          // FULL-SCREEN ONBOARDING MODE - No header, no bottom nav, full viewport
          <div className="fixed inset-0 bg-gradient-to-br from-coral-50 via-white to-coral-50 z-50 overflow-hidden">
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
            ) : showTransformatieOnboarding ? (
              <DatingSnapshotFlow
                onComplete={handleTransformatieOnboardingComplete}
              />
            ) : null}
          </div>
        ) : (
          // NORMAL MOBILE DASHBOARD - With header and bottom nav
          <div className="min-h-screen bg-gradient-to-br from-coral-50 via-coral-25 to-white pb-28 safe-area-bottom">
            {/* Mobile Header — sticky, clean, world-class */}
            <div className="bg-white/98 dark:bg-gray-950/98 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 sticky top-0 z-40">
              <div className="flex items-center justify-between px-4 h-14">
                <Logo iconSize={26} textSize="sm" />
                <button
                  onClick={() => handleTabChange('profiel')}
                  className="w-9 h-9 rounded-full bg-coral-500 flex items-center justify-center text-white font-bold text-sm active:scale-95 transition-transform shadow-sm"
                  aria-label="Mijn profiel"
                >
                  {user?.name?.charAt(0).toUpperCase() || '?'}
                </button>
              </div>
            </div>

            {/* Mobile Content */}
            <div className="px-4 pt-4 pb-6">
              {tabContent}
            </div>

            <BottomNavigation />
          </div>
        )
      ) : isFullScreenOnboarding ? (
        // Desktop full-screen onboarding — zelfde aanpak als mobiel, buiten AppShellDesktop
        // Gebruik fixed inset-0 z-50 zonder backdrop-filter ouder, zodat DatingSnapshotFlow
        // zijn eigen fixed inset-0 overlay correct kan renderen t.o.v. het viewport
        <div className="fixed inset-0 bg-gradient-to-br from-coral-50 via-white to-coral-50 z-50 overflow-hidden">
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
          ) : showTransformatieOnboarding ? (
            <DatingSnapshotFlow
              onComplete={handleTransformatieOnboardingComplete}
            />
          ) : null}
        </div>
      ) : (
        // Desktop layout — App Shell met sidebar navigatie
        <AppShellDesktop
          activeTab={activeTab}
          onTabChange={handleTabChange}
          showNavigation={true}
        >
          {/* Trial Progress Banner */}
          {user?.id && (
            <TrialProgress userId={user.id} />
          )}

          <main className="rounded-2xl bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm p-6 shadow-xl border border-white/30 dark:border-gray-800">
            {tabContent}
          </main>

          <AIContextNotifications />

          <DatingWeekNotificationModal
            isOpen={datingWeekNotificationOpen}
            onClose={() => setDatingWeekNotificationOpen(false)}
            onComplete={(data) => {
              debugLog.success('Dating week log completed:', data);
            }}
          />

          <footer className="text-center text-sm text-muted-foreground space-y-3 pb-4">
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

          {irisInviteVisible && (
            <ProactiveInvite
              onAccept={() => {
                setIrisInviteVisible(false);
                dismissInvite();
                handleTabChange('coach');
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
        </AppShellDesktop>
      )}

      {showFirstActionModal && (
        <FirstActionModal
          path={onboardingPath}
          userName={user?.name}
          onDismiss={handleDismissFirstActionModal}
        />
      )}
    </>
  );
}

// Export with Suspense boundary (required for useSearchParams)
export default function DashboardPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <DashboardPageContent />
    </Suspense>
  );
}
