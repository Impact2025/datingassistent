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
import { OnlineCursusTab } from '@/components/dashboard/online-cursus-tab';
import { ProfielCoachTab } from '@/components/dashboard/profiel-coach-tab';
import { ProfielAnalyseTab } from '@/components/dashboard/profiel-analyse-tab';
import { FotoAdviesTab } from '@/components/dashboard/foto-advies-tab';
import { GesprekStarterTab } from '@/components/dashboard/gesprek-starter-tab';
import { DatePlannerTab } from '@/components/dashboard/date-planner-tab';
import { LoadingSpinner } from '@/components/shared/loading-spinner';
import { ChatCoachTab } from '@/components/dashboard/chat-coach-tab';
import { SkillsAssessmentTab } from '@/components/dashboard/skills-assessment-tab';
import { PersonalRecommendations } from '@/components/dashboard/personal-recommendations';
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
import { ConversationCoach } from '@/components/dashboard/conversation-coach';
import { SuccessMetricsDashboard } from '@/components/dashboard/success-metrics-dashboard';
import { ProfileOptimizationEngine } from '@/components/dashboard/profile-optimization-engine';
import { DatingWeekNotificationModal } from '@/components/dashboard/dating-week-notification-modal';

// NIEUWE CONSOLIDATED MODULES
import { ProfileSuite } from '@/components/dashboard/profile-suite';
import { CommunicationHub } from '@/components/dashboard/communication-hub';
import { DatenRelatiesModule } from '@/components/dashboard/daten-relaties-module';
import { GroeiDoelenModule } from '@/components/dashboard/groei-doelen-module';
import { LerenOntwikkelenModule } from '@/components/dashboard/leren-ontwikkelen-module';
import { DataManagementTab } from '@/components/dashboard/data-management-tab';
import { SubscriptionTab } from '@/components/dashboard/subscription-tab';

// Import settings component
import { SettingsTab } from '@/components/dashboard/settings-tab';

// Import centralized onboarding system
import { useJourneyState } from '@/hooks/use-journey-state';
import { OnboardingFlow } from '@/components/dashboard/onboarding-flow';

export default function DashboardPage() {
  const { user, userProfile, loading } = useUser();

  const isLoading = loading;
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [checkinModalOpen, setCheckinModalOpen] = useState(false);
  const [journeyDay, setJourneyDay] = useState(1);
  const [datingWeekNotificationOpen, setDatingWeekNotificationOpen] = useState(false);

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

  // Check for Monday dating week notifications
  useEffect(() => {
    const checkForNotifications = async () => {
      if (!user?.id || loading) return;

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
  }, [user?.id, loading, journeyCheckComplete]);

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
    }
  }, [activeTab, router]);

  // While loading user data, show a loading state
  // The UserProvider handles redirection if there's no user.
  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <LoadingSpinner />
        <p className="text-muted-foreground">Dashboard laden...</p>
      </div>
    );
  }

  // Onboarding handlers are now provided by the useJourneyState hook

  const handleCheckinComplete = () => {
    setCheckinModalOpen(false);
    // Reload dashboard data if needed
  };


  // If no profile, show a message but don't redirect
  if (!userProfile) {
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
      // NIEUWE 5-MODULE STRUCTUUR
      case 'profiel-persoonlijkheid':
        return <ProfileSuite onTabChange={setActiveTab} />;

      case 'communicatie-matching':
        return <CommunicationHub onTabChange={setActiveTab} />;

      case 'daten-relaties':
        return <DatenRelatiesModule onTabChange={setActiveTab} />;
        // Navigation handled by useEffect above
        return <DashboardTab onTabChange={setActiveTab} />;

      case 'groei-doelen':
        return <GroeiDoelenModule onTabChange={setActiveTab} userId={user?.id} />;

      case 'leren-ontwikkelen':
        return <LerenOntwikkelenModule onTabChange={setActiveTab} />;

      case 'settings':
        return <SettingsTab />;

      case 'data-management':
        return <DataManagementTab />;

      case 'subscription':
        return <SubscriptionTab />;

      // LEGACY TABS (voorlopig behouden)
      case 'dashboard':
        return <DashboardTab onTabChange={setActiveTab} />;
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

      // Individuele legacy tabs (voor debugging/toegang)
      case 'week-review':
        return <WeekReview userId={user?.id || 0} weekNumber={1} onComplete={() => setActiveTab('daily')} />;
      case 'dating-activity':
        return <DatingActivityLogger userId={user?.id || 0} />;
      case 'badges':
        return <BadgesShowcase userId={user?.id || 0} />;
      case 'online-cursus':
        return <OnlineCursusTab />;
      case 'profiel-coach':
        return <ProfielCoachTab />;
      case 'profiel-analyse':
        return <ProfielAnalyseTab />;
      case 'foto-advies':
        return <FotoAdviesTab />;
      case 'gesprek-starter':
        return <GesprekStarterTab />;
      case 'chat-coach':
        return <ChatCoachTab />;
      case 'gesprek-coach':
        return <ConversationCoach />;
      case 'succes-metrics':
        return <SuccessMetricsDashboard />;
      case 'profiel-optimalisatie':
        return <ProfileOptimizationEngine />;
      case 'dateplanner':
        return <DatePlannerTab />;
      case 'skills-assessment':
        return <SkillsAssessmentTab />;
      case 'recommendations':
        return <PersonalRecommendations />;
      case 'community':
        return <CommunityTab />;
      case 'voortgang':
        return <ProgressTracker onTabChange={setActiveTab} />;
      case 'doelen':
        return <GoalManagement onTabChange={setActiveTab} />;
      case 'select-package':
        // Navigation handled by useEffect above
        return <DashboardTab onTabChange={setActiveTab} />;
      default:
        return <DashboardTab onTabChange={setActiveTab} />;
    }
  };

  return (
    <DeviceGuard requiredDevice="desktop" allowOverride={true}>
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
        <div className="mx-auto w-full max-w-4xl p-4 sm:p-6 lg:p-8">
          <div className="space-y-6">
            <Header
              onSettingsClick={() => setActiveTab('settings')}
              onSubscriptionClick={() => setActiveTab('subscription')}
            />

            {/* Trial Progress Banner - Only show for trial users */}
            {user?.id && <TrialProgress userId={user.id} />}

            <main className="rounded-2xl bg-white/95 backdrop-blur-sm p-4 shadow-2xl sm:p-6 border border-white/20">
            {/* Hide navigation during onboarding */}
            {!showOnboarding && <MainNav activeTab={activeTab} onTabChange={setActiveTab} />}
            <div className="mt-6">
              {/* Show onboarding content if needed */}
              {showOnboarding && (
                <OnboardingFlow
                  journeyState={journeyState}
                  userName={user?.name}
                  handlers={handlers}
                />
              )}

              {/* Show regular dashboard content */}
              {renderTabContent()}
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
                    onClick={() => setActiveTab('data-management')}
                    className="underline hover:text-primary bg-transparent border-none p-0 cursor-pointer"
                  >
                    Beheer je data
                  </button>.
                </p>
              </div>
            </footer>
          </div>
        </div>
      </div>
    </DeviceGuard>
  );
}
