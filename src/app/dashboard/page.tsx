"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/providers/user-provider';
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

// Import onboarding components
import { PersonalityScan } from '@/components/journey/personality-scan';
import { CoachAdvice } from '@/components/journey/coach-advice';
import { RegistrationForm } from '@/components/auth/registration-form';
import { WelcomeVideo } from '@/components/journey/welcome-video';
import { WelcomeQuestions, type WelcomeAnswers } from '@/components/journey/welcome-questions';

// Import settings component
import { SettingsTab } from '@/components/dashboard/settings-tab';

type JourneyStep = 'loading' | 'profile' | 'welcome' | 'scan' | 'coach-advice' | 'welcome-video' | 'welcome-questions' | 'complete';

interface JourneyState {
  currentStep: JourneyStep;
  completedSteps: string[];
  scanData?: any;
  coachAdvice?: any;
}

export default function DashboardPage() {
  const { user, userProfile, loading } = useUser();

  const isLoading = loading;
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [journeyCheckComplete, setJourneyCheckComplete] = useState(false);
  const [checkinModalOpen, setCheckinModalOpen] = useState(false);
  const [journeyDay, setJourneyDay] = useState(1);
  const [datingWeekNotificationOpen, setDatingWeekNotificationOpen] = useState(false);

  // Onboarding state
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [journeyState, setJourneyState] = useState<JourneyState>({
    currentStep: 'loading',
    completedSteps: [],
  });
  const [isInitializingOnboarding, setIsInitializingOnboarding] = useState(false);


  // Check if user is admin
  const isAdminUser = user?.email && ['v_mun@hotmail.com', 'v.munster@weareimpact.nl'].includes(user.email);

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

  // Load journey data and check if onboarding is needed
  useEffect(() => {
    const loadJourneyData = async () => {
      if (!user?.id || loading) return;

      try {
        const response = await fetch(`/api/journey/status?userId=${user.id}`);
        if (response.ok) {
          const data = await response.json();
          console.log('🧭 Journey status loaded:', data);

          // Check if user needs onboarding
          if (data.status !== 'completed') {
            console.log('🎯 User needs onboarding, initializing...');
            setIsInitializingOnboarding(true);

            // Check if user has profile
            const hasProfile = userProfile && userProfile.name && userProfile.age;

            // Set initial onboarding step
            let initialStep: JourneyStep = 'welcome';
            if (!hasProfile) {
              initialStep = 'profile';
            } else if (data.currentStep) {
              initialStep = data.currentStep as JourneyStep;
            } else if (data.completedSteps?.includes('coach-advice') && !data.completedSteps?.includes('welcome-video')) {
              console.log('🎯 User completed coach advice but not welcome video, setting to welcome-video');
              initialStep = 'welcome-video';
            } else if (data.completedSteps?.includes('welcome-video') && !data.completedSteps?.includes('welcome-questions')) {
              console.log('🎯 User completed welcome video but not questions, setting to welcome-questions');
              initialStep = 'welcome-questions';
            } else if (data.completedSteps?.includes('coach-advice')) {
              // If user has completed coach advice but journey shows as completed, force welcome video
              console.log('⚠️ User completed coach advice but journey marked as complete, forcing welcome-video');
              initialStep = 'welcome-video';
            }

            setJourneyState({
              currentStep: initialStep,
              completedSteps: data.completedSteps || [],
              scanData: data.scanData,
              coachAdvice: data.coachAdvice,
            });

            setShowOnboarding(true);
          } else {
            // Journey is marked as completed - but allow restart for users who just paid
            // Check if user has an active subscription (indicating they recently paid)
            try {
              const subscriptionResponse = await fetch(`/api/user/subscription?userId=${user.id}`);
              if (subscriptionResponse.ok) {
                const subscriptionData = await subscriptionResponse.json();
                if (subscriptionData.subscription?.status === 'active') {
                  // User has active subscription, allow onboarding restart
                  console.log('🎯 User has active subscription - allowing onboarding restart');
                  setIsInitializingOnboarding(true);

                  // Check if user has profile
                  const hasProfile = userProfile && userProfile.name && userProfile.age;

                  setJourneyState({
                    currentStep: hasProfile ? 'welcome' : 'profile',
                    completedSteps: [],
                    scanData: null,
                    coachAdvice: null,
                  });

                  setShowOnboarding(true);
                } else {
                  console.log('✅ Journey completed and no active subscription - no onboarding needed');
                }
              }
            } catch (error) {
              console.log('✅ Journey completed - no onboarding needed (subscription check failed)');
            }
          }
        } else {
          console.log('ℹ️ Journey data not available, checking if onboarding needed...');

          // If no journey data, assume onboarding is needed
          const hasProfile = userProfile && userProfile.name && userProfile.age;
          if (!hasProfile) {
            setJourneyState({
              currentStep: 'profile',
              completedSteps: [],
            });
            setShowOnboarding(true);
            setIsInitializingOnboarding(true);
          }
        }
      } catch (error) {
        console.error('Failed to load journey data:', error);
        // Non-blocking error - user can still use dashboard
      } finally {
        setJourneyCheckComplete(true);
        setIsInitializingOnboarding(false);
      }
    };

    loadJourneyData();
  }, [user, userProfile, loading, router]);

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

  // Onboarding handlers
  const handleProfileComplete = async () => {
    await saveJourneyProgress('welcome', ['profile']);
    setJourneyState(prev => ({
      ...prev,
      currentStep: 'welcome',
      completedSteps: [...prev.completedSteps, 'profile'],
    }));
  };

  const handleWelcomeComplete = async () => {
    await saveJourneyProgress('scan', ['profile', 'welcome']);
    setJourneyState(prev => ({
      ...prev,
      currentStep: 'scan',
      completedSteps: [...prev.completedSteps, 'welcome'],
    }));
  };

  const handleScanComplete = async (scanData: any): Promise<void> => {
    setJourneyState(prev => ({
      ...prev,
      currentStep: 'loading',
    }));

    try {
      // First, save the scan completion to ensure it's tracked
      await saveJourneyProgress('scan', ['profile', 'welcome', 'scan'], { scanData });
      
      // Mark personality scan as completed in coaching profile
      try {
        await fetch('/api/coaching-profile/complete-step', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user?.id,
            stepName: 'personality_scan',
            metadata: { scanData }
          }),
        });
        console.log('✅ Personality scan marked as completed in coaching profile');
      } catch (error) {
        console.error('Failed to mark personality scan as completed:', error);
      }
      
      // Mark "Voltooi je persoonlijkheidsscan" goal as completed
      try {
        const goalsResponse = await fetch(`/api/goals?userId=${user?.id}`);
        if (goalsResponse.ok) {
          const goals = await goalsResponse.json();
          const scanGoal = goals.find((g: any) =>
            g.title === 'Voltooi je persoonlijkheidsscan' && g.status !== 'completed'
          );
          
          if (scanGoal) {
            await fetch(`/api/goals/update-progress`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                userId: user?.id,
                goalId: scanGoal.id,
                completed: true
              }),
            });
            console.log('✅ Personality scan goal marked as completed');
          }
        }
      } catch (error) {
        console.error('Failed to mark personality scan goal as completed:', error);
      }
      
      // Then generate coach advice
      const token = localStorage.getItem('datespark_auth_token');
      const response = await fetch('/api/coach/analyze-start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(scanData),
      });

      if (!response.ok) {
        if (response.status === 403) {
          throw new Error('403: Deze functie vereist een actief abonnement. Upgrade je account om door te gaan met de persoonlijkheidsscan.');
        } else if (response.status === 429) {
          throw new Error('429: Je hebt je limiet bereikt. Probeer het later opnieuw.');
        } else {
          throw new Error(`HTTP ${response.status}: Failed to generate coach advice`);
        }
      }

      const { advice } = await response.json();

      // Update with coach advice
      await saveJourneyProgress('coach-advice', ['profile', 'welcome', 'scan'], { scanData, coachAdvice: advice });
      setJourneyState(prev => ({
        ...prev,
        currentStep: 'coach-advice',
        completedSteps: [...prev.completedSteps, 'scan'],
        scanData,
        coachAdvice: advice,
      }));
    } catch (error: any) {
      console.error('Failed to generate coach advice:', error);

      // Check if it's a subscription/permission error
      if (error.message?.includes('403') || error.message?.includes('subscription')) {
        // Show upgrade prompt with option to navigate to subscription page
        const upgrade = confirm('Deze functie vereist een actief abonnement. Wil je nu upgraden om door te gaan met de persoonlijkheidsscan?');
        if (upgrade) {
          router.push('/select-package');
          return;
        }
      } else if (error.message?.includes('429') || error.message?.includes('limit')) {
        alert('Je hebt je limiet bereikt voor vandaag. Probeer het morgen opnieuw of upgrade je account voor meer mogelijkheden.');
      } else {
        alert('Er ging iets mis bij het analyseren van je antwoorden. Probeer het opnieuw.');
      }

      setJourneyState(prev => ({
        ...prev,
        currentStep: 'scan',
      }));
    }
  };

  const handleCoachAdviceComplete = async () => {
    console.log('🎯 Coach advice completed, transitioning to welcome video');

    // Ensure we save the progress with welcome-video as next step
    await saveJourneyProgress('welcome-video', ['profile', 'welcome', 'scan', 'coach-advice']);

    // Mark coach advice as completed in coaching profile
    if (user?.id && journeyState.coachAdvice) {
      try {
        await fetch('/api/coaching-profile/complete-step', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user.id,
            stepName: 'coach_advice',
            metadata: {
              tools_recommended: [journeyState.coachAdvice.tools.tool1.name, journeyState.coachAdvice.tools.tool2.name]
            }
          }),
        });
        console.log('✅ Coach advice marked as completed in coaching profile');
      } catch (error) {
        console.error('Failed to mark coach advice as completed:', error);
      }
    }

    // Force the journey state to welcome-video
    setJourneyState(prev => ({
      ...prev,
      currentStep: 'welcome-video',
      completedSteps: [...prev.completedSteps, 'coach-advice'],
    }));

    console.log('✅ Journey state set to welcome-video');
  };

  const handleWelcomeVideoComplete = async () => {
    await saveJourneyProgress('welcome-questions', ['profile', 'welcome', 'scan', 'coach-advice', 'welcome-video']);
    setJourneyState(prev => ({
      ...prev,
      currentStep: 'welcome-questions',
      completedSteps: [...prev.completedSteps, 'welcome-video'],
    }));
  };

  const handleWelcomeQuestionsComplete = async (answers: WelcomeAnswers) => {
    // Save the welcome answers to user profile or AI context
    try {
      const token = localStorage.getItem('datespark_auth_token');
      await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          welcomeAnswers: answers
        }),
      });

      // Also save to AI context for personalization
      await fetch('/api/ai-context', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          action: 'save_context',
          updates: {
            writingStyle: answers.writingStyle,
            datingApps: answers.datingApps,
            genderPreference: answers.genderPreference,
            remindersEnabled: answers.remindersEnabled === 'ja'
          }
        }),
      });
    } catch (error) {
      console.error('Failed to save welcome answers:', error);
    }

    await saveJourneyProgress('complete', ['profile', 'welcome', 'scan', 'coach-advice', 'welcome-video', 'welcome-questions']);
    setShowOnboarding(false);
    console.log('🎉 Welcome experience completed successfully!');
  };

  // Save progress to backend
  const saveJourneyProgress = async (
    currentStep: string,
    completedSteps: string[],
    additionalData?: any
  ) => {
    try {
      await fetch('/api/journey/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id,
          currentStep,
          completedSteps,
          ...additionalData,
        }),
      });
    } catch (error) {
      console.error('Failed to save journey progress:', error);
    }
  };

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


  // Show onboarding integrated into dashboard if user hasn't completed it
  const renderOnboardingContent = () => {
    if (!showOnboarding) return null;

    const steps: JourneyStep[] = ['profile', 'welcome', 'scan', 'coach-advice', 'welcome-video', 'welcome-questions', 'complete'];
    const currentStepIndex = steps.indexOf(journeyState.currentStep);
    const progress = ((currentStepIndex + 1) / steps.length) * 100;

    return (
      <div className="space-y-6 mb-8">
        {/* Journey Progress Card */}
        <Card className="border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10">
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold">Je DatingAssistent Journey</h2>
                  <p className="text-sm text-muted-foreground">
                    Stap {currentStepIndex + 1} van {steps.length} - Voltooi je onboarding voor toegang tot alle tools
                  </p>
                </div>
                <Badge variant="outline" className="text-primary border-primary">
                  {Math.round(progress)}% compleet
                </Badge>
              </div>

              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-300 ease-in-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Onboarding Content */}
        <div className="space-y-6">
          {/* Profile Setup */}
          {journeyState.currentStep === 'profile' && (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className="text-2xl">👤</span>
                    Maak je profiel compleet
                  </CardTitle>
                  <CardDescription>
                    Vul je basisgegevens in voor persoonlijke coaching
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <RegistrationForm defaultName={user?.name || ''} onComplete={handleProfileComplete} />
                </CardContent>
              </Card>

              {/* Benefits */}
              <div className="grid gap-3 text-left sm:grid-cols-3 text-xs">
                <Card className="bg-gradient-to-r from-pink-50 to-purple-50 border-pink-100">
                  <CardContent className="p-3">
                    <p className="font-semibold text-pink-700 mb-1">📝 Wat we vragen</p>
                    <p className="text-muted-foreground">Naam, leeftijd, woonplaats en wat je zoekt.</p>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-r from-pink-50 to-purple-50 border-pink-100">
                  <CardContent className="p-3">
                    <p className="font-semibold text-pink-700 mb-1">🎯 Waarom dit helpt</p>
                    <p className="text-muted-foreground">Betere openingszinnen en persoonlijk advies.</p>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-r from-pink-50 to-purple-50 border-pink-100">
                  <CardContent className="p-3">
                    <p className="font-semibold text-pink-700 mb-1">🚀 Wat je krijgt</p>
                    <p className="text-muted-foreground">Direct toegang tot al je tools.</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Welcome Screen */}
          {journeyState.currentStep === 'welcome' && (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">Welkom bij DatingAssistent</h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto">
                      Je persoonlijke dating coach staat klaar. We beginnen met 7 vragen om jouw situatie te begrijpen.
                    </p>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4">
                    <Card>
                      <CardContent className="p-4 text-center">
                        <span className="text-2xl">7️⃣</span>
                        <h3 className="font-semibold mb-1">Coach Vragen</h3>
                        <p className="text-sm text-muted-foreground">Vertel over je situatie</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 text-center">
                        <span className="text-2xl">🤖</span>
                        <h3 className="font-semibold mb-1">AI Analyse</h3>
                        <p className="text-sm text-muted-foreground">Krijg persoonlijk advies</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 text-center">
                        <span className="text-2xl">🚀</span>
                        <h3 className="font-semibold mb-1">Direct Actie</h3>
                        <p className="text-sm text-muted-foreground">Start vandaag nog</p>
                      </CardContent>
                    </Card>
                  </div>

                  <Button
                    onClick={handleWelcomeComplete}
                    size="lg"
                    className="px-8"
                  >
                    Start Coach Scan
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Personality Scan */}
          {journeyState.currentStep === 'scan' && (
            <Card>
              <CardContent className="pt-6">
                <PersonalityScan onComplete={handleScanComplete} />
              </CardContent>
            </Card>
          )}

          {/* Coach Advice */}
          {journeyState.currentStep === 'coach-advice' && journeyState.coachAdvice && (
            <Card>
              <CardContent className="pt-6">
                <CoachAdvice
                  advice={journeyState.coachAdvice}
                  onComplete={handleCoachAdviceComplete}
                />
              </CardContent>
            </Card>
          )}

          {/* Welcome Video */}
          {journeyState.currentStep === 'welcome-video' && (
            <WelcomeVideo onComplete={handleWelcomeVideoComplete} />
          )}

          {/* Welcome Questions */}
          {journeyState.currentStep === 'welcome-questions' && (
            <WelcomeQuestions onComplete={handleWelcomeQuestionsComplete} />
          )}

          {/* Loading state */}
          {journeyState.currentStep === 'loading' && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center justify-center py-16 space-y-6">
                  <LoadingSpinner />
                  <div className="text-center">
                    <h3 className="text-lg font-semibold mb-2">
                      Je coach analyseert je antwoorden...
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Dit duurt slechts een paar seconden
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    );
  };

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
            {renderOnboardingContent()}

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
  );
}
