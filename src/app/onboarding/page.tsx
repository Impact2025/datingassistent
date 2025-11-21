"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/providers/user-provider';
import { LoadingSpinner } from '@/components/shared/loading-spinner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, Sparkles, Target, Rocket } from 'lucide-react';
import { getAuthErrorMessage, AuthManager } from '@/lib/auth-manager';
import { AuthErrorBoundary } from '@/components/auth-error-boundary';

// Import journey components
import { PersonalityScan } from '@/components/journey/personality-scan';
import { CoachAdvice } from '@/components/journey/coach-advice';
import { RegistrationForm } from '@/components/auth/registration-form';
import { WelcomeVideo } from '@/components/journey/welcome-video';
import { WelcomeQuestions, type WelcomeAnswers } from '@/components/journey/welcome-questions';

type JourneyStep = 'loading' | 'profile' | 'welcome' | 'scan' | 'coach-advice' | 'welcome-video' | 'welcome-questions' | 'complete';

interface JourneyState {
  currentStep: JourneyStep;
  completedSteps: string[];
  scanData?: any;
  coachAdvice?: any;
}

export default function OnboardingPage() {
  const { user, userProfile, loading } = useUser();
  const router = useRouter();
  const [journeyState, setJourneyState] = useState<JourneyState>({
    currentStep: 'loading',
    completedSteps: [],
  });
  const [isInitializing, setIsInitializing] = useState(true);
  const [authManager] = useState(() => new AuthManager());

  // Initialize journey on mount
  useEffect(() => {
    const initializeJourney = async () => {
      // Wait for user loading to complete
      if (loading) {
        console.log('⏳ Onboarding: Waiting for user loading to complete...');
        return;
      }

      console.log('🎯 Onboarding: Initializing journey, user:', !!user, 'userId:', user?.id);
      if (!user) {
        console.log('❌ Onboarding: No user, redirecting to login');
        router.push('/login');
        return;
      }

      try {
        // Check if user has profile
        const hasProfile = userProfile && userProfile.name && userProfile.age;

        // Check if user has already completed journey
        const response = await fetch(`/api/journey/status?userId=${user.id}`);

        if (response.ok) {
          const data = await response.json();

          // If journey is complete, redirect to dashboard
          if (data.status === 'completed') {
            router.push('/dashboard');
            return;
          }

          // Resume from current step, but check if profile is needed first
          const currentStep = !hasProfile ? 'profile' : (data.currentStep || 'welcome');
          setJourneyState({
            currentStep,
            completedSteps: data.completedSteps || [],
            scanData: data.scanData,
            coachAdvice: data.coachAdvice,
          });
        } else {
          // Start fresh journey - check if profile is needed
          const currentStep = !hasProfile ? 'profile' : 'welcome';
          setJourneyState({
            currentStep,
            completedSteps: [],
          });
        }
      } catch (error) {
        console.error('Failed to initialize journey:', error);
        // Default to welcome screen on error
        setJourneyState({
          currentStep: 'welcome',
          completedSteps: [],
        });
      } finally {
        setIsInitializing(false);
      }
    };

    initializeJourney();
  }, [user, loading, router]);

  // Progress calculation
  const steps: JourneyStep[] = ['profile', 'welcome', 'scan', 'coach-advice', 'welcome-video', 'welcome-questions', 'complete'];
  const currentStepIndex = steps.indexOf(journeyState.currentStep);
  const progress = ((currentStepIndex + 1) / steps.length) * 100;

  // Step handlers
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
    // Show loading state
    setJourneyState(prev => ({
      ...prev,
      currentStep: 'loading',
    }));

    try {
      // Generate coach advice via AI with improved error handling
      const token = authManager.getToken();
      console.log('🔐 Onboarding: Token available:', !!token, token ? token.substring(0, 20) + '...' : 'none');

      const response = await fetch('/api/coach/analyze-start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify(scanData),
      });

      console.log('🔐 Onboarding: API response status:', response.status);

      if (!response.ok) {
        // Handle different error types
        if (response.status === 401 || response.status === 403) {
          throw new Error('Authentication failed');
        }
        throw new Error('Failed to generate coach advice');
      }

      const { advice } = await response.json();

      // Save and move to coach advice screen
      await saveJourneyProgress('coach-advice', ['welcome', 'scan'], { scanData, coachAdvice: advice });
      setJourneyState(prev => ({
        ...prev,
        currentStep: 'coach-advice',
        completedSteps: [...prev.completedSteps, 'scan'],
        scanData,
        coachAdvice: advice,
      }));
    } catch (error) {
      console.error('Failed to generate coach advice:', error);

      // Use enhanced error messaging
      const errorMessage = getAuthErrorMessage(error as Error);

      // Show user-friendly error message
      alert(errorMessage);

      // Handle fallback mode
      if (errorMessage.includes('AUTH_FALLBACK_MODE')) {
        // Allow user to continue with limited functionality
        setJourneyState(prev => ({
          ...prev,
          currentStep: 'coach-advice',
          coachAdvice: {
            tools: { tool1: { name: 'Chat Coach' }, tool2: { name: 'Profiel Coach' } },
            summary: 'Je kunt beperkt gebruik maken van de app. Log opnieuw in voor volledige functionaliteit.',
            fallback: true
          },
        }));
      } else {
        // Reset to scan step for retry
        setJourneyState(prev => ({
          ...prev,
          currentStep: 'scan',
        }));
      }
    }
  };

  const handleCoachAdviceComplete = async () => {
    // Transition to welcome video instead of completing journey
    console.log('🎯 Coach advice completed, transitioning to welcome video');
    await saveJourneyProgress('welcome-video', ['profile', 'welcome', 'scan', 'coach-advice']);
    setJourneyState(prev => ({
      ...prev,
      currentStep: 'welcome-video',
      completedSteps: [...prev.completedSteps, 'coach-advice'],
    }));
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
      const token = authManager.getToken();
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
    router.push('/dashboard');
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

  // Loading state
  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <LoadingSpinner />
          <p className="text-muted-foreground">Je journey voorbereiden...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Progress Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-background border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-foreground">Je DatingAssistent Journey</span>
              <span className="text-muted-foreground">
                Stap {Math.max(1, currentStepIndex + 1)} van {steps.length}
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="pt-24 pb-12 px-4">
        <div className="container mx-auto max-w-4xl">
          {/* Profile Setup */}
          {journeyState.currentStep === 'profile' && (
            <div className="space-y-8">
              <div className="rounded-3xl border border-border/50 bg-card/60 p-6 text-center shadow-lg">
                <p className="text-xs tracking-widest text-muted-foreground uppercase">Stap {currentStepIndex + 1} van {steps.length}</p>
                <h1 className="mt-2 text-3xl font-bold">Maak je profiel compleet</h1>
                <p className="mt-3 text-sm text-muted-foreground sm:text-base">
                  Met deze informatie kan je coach meteen gericht adviseren en worden de AI-tools persoonlijk voor je ingesteld.
                </p>
                <div className="mt-6 grid gap-4 text-left sm:grid-cols-3">
                  <div className="rounded-xl bg-primary/5 p-4">
                    <p className="text-sm font-semibold text-primary">Wat we vragen</p>
                    <p className="mt-2 text-sm text-muted-foreground">Naam, leeftijd, woonplaats en wat je zoekt.</p>
                  </div>
                  <div className="rounded-xl bg-primary/5 p-4">
                    <p className="text-sm font-semibold text-primary">Waarom dit helpt</p>
                    <p className="mt-2 text-sm text-muted-foreground">Je krijgt meteen betere openingszinnen, profieltips en platform-advies.</p>
                  </div>
                  <div className="rounded-xl bg-primary/5 p-4">
                    <p className="text-sm font-semibold text-primary">Wat je ontvangt</p>
                    <p className="mt-2 text-sm text-muted-foreground">Een welkomstmail met je inlog en direct toegang tot het dashboard.</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-center">
                <RegistrationForm defaultName={user?.name || ''} onComplete={handleProfileComplete} />
              </div>
            </div>
          )}

          {/* Welcome Screen */}
          {journeyState.currentStep === 'welcome' && (
            <Card className="border border-border shadow-sm">
              <CardHeader className="text-center space-y-4 pb-8">
                <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                  <Rocket className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-2xl font-bold text-foreground">
                  Welkom bij DatingAssistent
                </CardTitle>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  Je persoonlijke dating coach staat klaar. We beginnen met 7 vragen om jouw situatie te begrijpen.
                </p>
                <p className="text-xs tracking-widest text-muted-foreground uppercase mt-4">Stap {currentStepIndex + 1} van {steps.length}</p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="text-center p-4 border border-border rounded-lg">
                    <Sparkles className="h-6 w-6 mx-auto mb-2 text-primary" />
                    <h3 className="font-semibold mb-1 text-foreground">7 Coach Vragen</h3>
                    <p className="text-sm text-muted-foreground">
                      Vertel over je situatie
                    </p>
                  </div>
                  <div className="text-center p-4 border border-border rounded-lg">
                    <Target className="h-6 w-6 mx-auto mb-2 text-primary" />
                    <h3 className="font-semibold mb-1 text-foreground">AI Analyse</h3>
                    <p className="text-sm text-muted-foreground">
                      Krijg persoonlijk advies
                    </p>
                  </div>
                  <div className="text-center p-4 border border-border rounded-lg">
                    <CheckCircle2 className="h-6 w-6 mx-auto mb-2 text-primary" />
                    <h3 className="font-semibold mb-1 text-foreground">Direct Actie</h3>
                    <p className="text-sm text-muted-foreground">
                      Start vandaag nog
                    </p>
                  </div>
                </div>

                <div className="flex justify-center pt-4">
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
            <div>
              <PersonalityScan onComplete={handleScanComplete} />
            </div>
          )}

          {/* Coach Advice */}
          {journeyState.currentStep === 'coach-advice' && journeyState.coachAdvice && (
            <CoachAdvice
              advice={journeyState.coachAdvice}
              onComplete={handleCoachAdviceComplete}
            />
          )}

          {/* Welcome Video */}
          {journeyState.currentStep === 'welcome-video' && (
            <WelcomeVideo onComplete={handleWelcomeVideoComplete} />
          )}

          {/* Welcome Questions */}
          {journeyState.currentStep === 'welcome-questions' && (
            <WelcomeQuestions onComplete={handleWelcomeQuestionsComplete} />
          )}

          {/* Loading state tijdens AI analyse */}
          {journeyState.currentStep === 'loading' && (
            <Card className="border border-border shadow-sm">
              <CardContent className="flex flex-col items-center justify-center py-16 space-y-6">
                <LoadingSpinner />
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    Je coach analyseert je antwoorden...
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Dit duurt slechts een paar seconden
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

        </div>
      </div>
    </div>
  );
}
