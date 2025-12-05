"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/providers/user-provider';
import { DeviceGuard } from '@/components/guards/device-guard';
import { Header } from '@/components/layout/header';
import { MainNav } from '@/components/layout/main-nav';
import { DashboardTab } from '@/components/dashboard/dashboard-tab';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { BottomNavigation } from '@/components/layout/bottom-navigation';
import { LoadingSpinner } from '@/components/shared/loading-spinner';
import { CommunityTab } from '@/components/dashboard/community-tab';
import { DatingProfilerAI } from '@/components/dashboard/dating-profiler-ai';
import { ProgressTracker } from '@/components/dashboard/progress-tracker';
import { GoalManagement } from '@/components/dashboard/goal-management';
import { DailyDashboard } from '@/components/engagement/daily-dashboard';
import { DailyCheckinModal } from '@/components/engagement/daily-checkin-modal';
import { WeekReview } from '@/components/engagement/week-review';
import { MonthlyReport } from '@/components/engagement/monthly-report';
import { BadgesShowcase } from '@/components/engagement/badges-showcase';
import { YearlyReview } from '@/components/engagement/yearly-review';
import { DatingActivityLogger } from '@/components/engagement/dating-activity-logger';
import { TrialProgress } from '@/components/dashboard/trial-progress';
import { AIContextNotifications } from '@/components/shared/ai-context-notifications';
import { SocialMediaLinks } from '@/components/shared/social-media-links';
import { DatingWeekNotificationModal } from '@/components/dashboard/dating-week-notification-modal';

// NIEUWE CONSOLIDATED MODULES
import { ProfileSuite } from '@/components/dashboard/profile-suite';
import { CommunicationHub } from '@/components/dashboard/communication-hub';
import { DatenRelatiesModule } from '@/components/dashboard/daten-relaties-module';
import { GroeiDoelenModule } from '@/components/dashboard/groei-doelen-module';
import { LerenOntwikkelenModule } from '@/components/dashboard/leren-ontwikkelen-module';
import { DataManagementTab } from '@/components/dashboard/data-management-tab';
import { SubscriptionTab } from '@/components/dashboard/subscription-tab';
import { CursussenTab } from '@/components/dashboard/cursussen-tab';

// Import settings component
import { SettingsTab } from '@/components/dashboard/settings-tab';

// Import centralized onboarding system
import { useJourneyState } from '@/hooks/use-journey-state';
import { OnboardingFlow } from '@/components/dashboard/onboarding-flow';

// Import Kickstart onboarding - World-class integrated flow
import { KickstartOnboardingFlow } from '@/components/kickstart/KickstartOnboardingFlow';
import type { KickstartIntakeData } from '@/types/kickstart-onboarding.types';
import { Loader2 } from 'lucide-react';

// NIEUWE 4-TAB NAVIGATIE SYSTEEM (Masterplan)
import { MainNavNew } from '@/components/layout/main-nav-new';
import { HomeTab } from '@/components/dashboard/home-tab';
import { SmartHomeTab } from '@/components/dashboard/smart-home-tab';
import { PadTab } from '@/components/dashboard/pad-tab';
import { EnhancedPadTab } from '@/components/dashboard/enhanced-pad-tab';
import { ProfielTab } from '@/components/dashboard/profiel-tab-new';
import { CoachTab } from '@/components/dashboard/coach-tab';
import { IrisInsightsPanel } from '@/components/iris/iris-insights-panel';
import { ProactiveInvite, useProactiveInvite } from '@/components/live-chat/proactive-invite';
import { trackDashboardTab, trackToolUsed, setUserProperties } from '@/lib/analytics/ga4-events';

export default function DashboardPage() {
  const { user, userProfile, loading } = useUser();

  const isLoading = loading;
  const router = useRouter();

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
    checkComplete: boolean;
  }>({
    isChecking: false,
    hasEnrollment: null,
    needsOnboarding: false,
    checkComplete: false,
  });
  const [kickstartOnboardingSaving, setKickstartOnboardingSaving] = useState(false);

  // Wrapper for setActiveTab that includes GA4 tracking
  const handleTabChange = (newTab: string) => {
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

    setActiveTab(newTab);
  };

  // Handle URL tab parameter (e.g., ?tab=subscription)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const urlParams = new URLSearchParams(window.location.search);
    const tabParam = urlParams.get('tab');
    if (tabParam && ['subscription', 'settings', 'data-management', 'home', 'pad', 'coach', 'profiel'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, []);

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

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user?.id) return;

      try {
        const response = await fetch('/api/auth/check-admin', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('datespark_auth_token')}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setIsAdminUser(data.isAdmin === true);
        }
      } catch (error) {
        console.error('Failed to check admin status:', error);
      }
    };

    checkAdminStatus();
  }, [user?.id]);

  // Check for force parameter to bypass profile check
  const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  const forceAccess = searchParams?.get('force') === 'true';

  useEffect(() => {
    console.log('📊 Dashboard useEffect - State:', {
      loading,
      hasUser: !!user,
      userEmail: user?.email,
      isAdmin: isAdminUser,
      hasProfile: !!userProfile,
      profile: userProfile
    });

    // If admin user without profile, redirect to admin dashboard
    if (!loading && user && isAdminUser && !userProfile) {
      console.log('🔄 Dashboard - Admin user detected without profile, redirecting to /admin');
      router.push('/admin');
      return;
    }

    // REMOVED: Don't auto-redirect to select-package - it's too aggressive
    // Users should be able to access their dashboard even without a complete profile
    // They can choose to upgrade via the subscription page if needed
  }, [user, userProfile, loading, isAdminUser, router]);

  // Kickstart enrollment check effect
  useEffect(() => {
    const checkKickstartEnrollment = async () => {
      // Wait until user is loaded
      if (!user?.id || loading) {
        return;
      }

      // Prevent double-checking
      if (kickstartState.checkComplete) {
        return;
      }

      console.log('🔍 Starting Kickstart enrollment check for user:', user.id);

      // Set checking state IMMEDIATELY before any async work
      setKickstartState(prev => ({ ...prev, isChecking: true }));

      try {
        const response = await fetch('/api/kickstart/check-enrollment', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('datespark_auth_token')}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          console.log('✅ Kickstart enrollment check result:', data);

          const hasEnrollment = data.hasEnrollment === true;
          const needsOnboarding = hasEnrollment && !data.hasOnboardingData;

          if (needsOnboarding) {
            console.log('🎯 User needs Kickstart onboarding - will show onboarding flow');
          } else if (hasEnrollment) {
            console.log('✅ User has Kickstart enrollment with completed onboarding');
          } else {
            console.log('ℹ️ User does not have Kickstart enrollment');
          }

          // Update all state in one atomic operation
          setKickstartState({
            isChecking: false,
            hasEnrollment,
            needsOnboarding,
            checkComplete: true,
          });
        } else {
          console.warn('⚠️ Failed to check Kickstart enrollment:', response.status);
          setKickstartState({
            isChecking: false,
            hasEnrollment: false,
            needsOnboarding: false,
            checkComplete: true,
          });
        }
      } catch (error) {
        console.error('❌ Error checking Kickstart enrollment:', error);
        setKickstartState({
          isChecking: false,
          hasEnrollment: false,
          needsOnboarding: false,
          checkComplete: true,
        });
      }
    };

    checkKickstartEnrollment();
  }, [user?.id, loading, kickstartState.checkComplete]);

  // Check for Monday dating week notifications
  useEffect(() => {
    const checkForNotifications = async () => {
      if (!user?.id || loading || kickstartState.needsOnboarding) return;

      try {
        // Check for test mode (any day testing) - this should work immediately
        const urlParams = new URLSearchParams(window.location.search);
        const isTestMode = urlParams.get('test-notifications') === 'true';

        if (isTestMode) {
          console.log('🔔 Test mode detected, showing notification modal immediately');
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
              console.log('🔔 Showing Monday dating week notification');
              setDatingWeekNotificationOpen(true);
            }
          } else {
            console.warn('⚠️ Failed to check notifications:', response.status, response.statusText);
          }
        } catch (fetchError) {
          console.warn('⚠️ Network error checking notifications:', fetchError);
          // Non-blocking error - don't show notification if we can't check
        }
      } catch (error) {
        console.error('Error checking for notifications:', error);
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
    } else if (activeTab === 'hechtingsstijl-redirect') {
      router.push('/hechtingsstijl');
      // Reset to dashboard after navigation
      setActiveTab('dashboard');
    } else if (activeTab === 'datingstijl') {
      router.push('/datingstijl');
      // Reset to dashboard after navigation
      setActiveTab('dashboard');
    }

    // REDIRECT LEGACY DUPLICATE TABS TO CONSOLIDATED MODULES
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
      'recommendations': 'leren-ontwikkelen',
      'hechtingsstijl': 'hechtingsstijl-redirect'
    };

    if (redirectMap[activeTab]) {
      console.log(`🔄 Redirecting legacy tab '${activeTab}' to consolidated module '${redirectMap[activeTab]}'`);
      setActiveTab(redirectMap[activeTab]);
    }
  }, [activeTab, router]);

  // While loading user data or checking Kickstart enrollment, show a loading state
  // This prevents the flash where dashboard is shown before onboarding
  if (isLoading || kickstartState.isChecking || !kickstartState.checkComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          {/* Logo */}
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center shadow-2xl mx-auto mb-8 animate-pulse">
            <span className="text-white font-bold text-3xl">D</span>
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

  // Onboarding handlers are now provided by the useJourneyState hook

  const handleCheckinComplete = () => {
    setCheckinModalOpen(false);
    // Reload dashboard data if needed
  };

  // Handle Kickstart onboarding completion
  const handleKickstartOnboardingComplete = async (data: KickstartIntakeData) => {
    if (!user?.id) return;

    setKickstartOnboardingSaving(true);

    try {
      console.log('💾 Saving Kickstart onboarding data:', data);

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
      console.log("✅ Kickstart onboarding saved successfully:", result);

      // Update kickstart state to reflect completed onboarding
      setKickstartState(prev => ({
        ...prev,
        needsOnboarding: false,
      }));
      setKickstartOnboardingSaving(false);

      // Optional: redirect to Kickstart day 1 or show success message
      // router.push(result.nextUrl || "/kickstart/dag/1");

    } catch (err) {
      console.error("❌ Error saving onboarding:", err);
      setKickstartOnboardingSaving(false);
      // Could show error toast here
    }
  };


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



  const renderTabContent = () => {
    switch (activeTab) {
      // NIEUWE 4-TAB NAVIGATIE (Masterplan)
      case 'home':
        return <SmartHomeTab onTabChange={handleTabChange} userId={user?.id} />;

      case 'pad':
        return <EnhancedPadTab onTabChange={handleTabChange} userId={user?.id} />;

      case 'coach':
        return <CoachTab onTabChange={handleTabChange} userId={user?.id} />;

      case 'profiel':
        return <ProfielTab onTabChange={handleTabChange} />;

      // NIEUWE 5-MODULE STRUCTUUR (legacy support)
      case 'profiel-persoonlijkheid':
        return <ProfileSuite onTabChange={handleTabChange} />;

      case 'communicatie-matching':
        return <CommunicationHub onTabChange={handleTabChange} />;

      case 'daten-relaties':
        return <DatenRelatiesModule onTabChange={handleTabChange} />;
        // Navigation handled by useEffect above
        return <DashboardTab onTabChange={handleTabChange} />;

      case 'groei-doelen':
        return <GroeiDoelenModule onTabChange={handleTabChange} userId={user?.id} />;

      case 'leren-ontwikkelen':
        return <LerenOntwikkelenModule onTabChange={handleTabChange} />;

      case 'cursussen':
        return <CursussenTab />;

      case 'cursus':
        // Navigate to the main cursus page
        if (typeof window !== 'undefined') {
          window.location.href = '/cursus';
        }
        return <DashboardTab onTabChange={handleTabChange} />;

      case 'settings':
        return <SettingsTab />;

      case 'data-management':
        return <DataManagementTab />;

      case 'subscription':
        return <SubscriptionTab />;

      // LEGACY TABS (voorlopig behouden)
      case 'dashboard':
        return <DashboardTab onTabChange={handleTabChange} />;
      case 'daily':
        return (
          <>
            <DailyDashboard
              userId={user?.id || 0}
              onCheckIn={() => setCheckinModalOpen(true)}
            />
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

      // REMOVED: Legacy duplicate tabs - all functionality now consolidated in the 5 main modules
      // - online-cursus → consolidated into 'leren-ontwikkelen'
      // - profiel-coach → consolidated into 'profiel-persoonlijkheid'
      // - dateplanner → consolidated into 'daten-relaties'
      // - skills-assessment → consolidated into 'leren-ontwikkelen'
      // - voortgang → consolidated into 'groei-doelen'
      // - doelen → consolidated into 'groei-doelen'
      // - All other legacy tabs removed for cleaner UX

      // Keep only essential standalone tabs
      case 'community':
        return <CommunityTab />;
      case 'badges':
        return <BadgesShowcase userId={user?.id || 0} />;
      case 'dating-activity':
        return <DatingActivityLogger userId={user?.id || 0} />;
      case 'select-package':
        // Navigation handled by useEffect above
        return <DashboardTab onTabChange={handleTabChange} />;
      default:
        return <DashboardTab onTabChange={handleTabChange} />;
    }
  };

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

  if (showKickstartOnboarding) {
    console.log('🎨 Rendering Kickstart onboarding flow within dashboard');
  }

  return (
    <>
      {isMobileTabAccess || isMobileDevice ? (
        // Mobile-friendly layout - WERELDKLASSE: Full mobile dashboard!
        <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 pb-24">
          {/* Mobile Header - Sticky */}
          <div className="bg-white/95 backdrop-blur-sm border-b border-pink-100 px-4 py-3 sticky top-0 z-40">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {/* Logo */}
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-lg">D</span>
                </div>
                <div>
                  <h1 className="text-lg font-bold text-gray-900">
                    {activeTab === 'home' && 'Dashboard'}
                    {activeTab === 'pad' && 'Jouw Pad'}
                    {activeTab === 'coach' && 'Coach'}
                    {activeTab === 'profiel' && 'Profiel'}
                    {activeTab === 'subscription' && 'Abonnement'}
                    {activeTab === 'data-management' && 'Data & Privacy'}
                    {activeTab === 'settings' && 'Instellingen'}
                    {!['home', 'pad', 'coach', 'profiel', 'subscription', 'data-management', 'settings'].includes(activeTab) && 'Dashboard'}
                  </h1>
                  <p className="text-xs text-gray-500">
                    {user?.name ? `Welkom, ${user.name.split(' ')[0]}` : 'DatingAssistent'}
                  </p>
                </div>
              </div>
              {/* Settings button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleTabChange('settings')}
                className="p-2 rounded-full hover:bg-pink-50"
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </Button>
            </div>
          </div>

          {/* Mobile Content */}
          <div className="p-4">
            {showKickstartOnboarding ? (
              <div className="min-h-[600px]">
                <KickstartOnboardingFlow
                  userName={user?.name?.split(' ')[0]}
                  onComplete={handleKickstartOnboardingComplete}
                />
              </div>
            ) : showOnboarding ? (
              <OnboardingFlow
                journeyState={journeyState}
                userName={user?.name}
                handlers={handlers}
              />
            ) : (
              renderTabContent()
            )}
          </div>

          <BottomNavigation />
        </div>
      ) : (
        // Desktop layout
        <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
          <div className="mx-auto w-full max-w-4xl p-4 sm:p-6 lg:p-8">
            <div className="space-y-6">
              <Header
                onSettingsClick={() => handleTabChange('settings')}
                onSubscriptionClick={() => handleTabChange('subscription')}
              />

              {/* Trial Progress Banner - Only show for trial users and not during onboarding */}
              {user?.id && !showKickstartOnboarding && !showOnboarding && <TrialProgress userId={user.id} />}

              <main className="rounded-2xl bg-white/95 backdrop-blur-sm p-4 shadow-2xl sm:p-6 border border-white/20">
              {/* Hide navigation during any onboarding */}
              {!showOnboarding && !showKickstartOnboarding && (
                useNewNav
                  ? <MainNavNew activeTab={activeTab} onTabChange={handleTabChange} />
                  : <MainNav activeTab={activeTab} onTabChange={handleTabChange} />
              )}
              <div className="mt-6">
                {/* Show Kickstart onboarding if needed - takes priority */}
                {showKickstartOnboarding ? (
                  <div className="min-h-[600px]">
                    <KickstartOnboardingFlow
                      userName={user?.name?.split(' ')[0]}
                      onComplete={handleKickstartOnboardingComplete}
                    />
                  </div>
                ) : showOnboarding ? (
                  /* Show regular onboarding if needed */
                  <OnboardingFlow
                    journeyState={journeyState}
                    userName={user?.name}
                    handlers={handlers}
                  />
                ) : (
                  /* Show regular dashboard content only when not onboarding */
                  renderTabContent()
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
                console.log('Dating week log completed:', data);
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

          {/* Iris Insights Panel - Floating assistant */}
          {useNewNav && !showOnboarding && !showKickstartOnboarding && (
            <IrisInsightsPanel
              currentTab={activeTab}
              userId={user?.id}
              onTabChange={handleTabChange}
            />
          )}

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
