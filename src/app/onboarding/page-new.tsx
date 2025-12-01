"use client";

/**
 * NEW ONBOARDING FLOW - "Dating Startpunt"
 * Complete rebuild met nieuwe componenten voor maximale conversie
 * Flow: Profile → Welcome → 3 Pilaren → Dating DNA → Personalized Roadmap → Dashboard
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/providers/user-provider';
import { LoadingSpinner } from '@/components/shared/loading-spinner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Sparkles, Target, CheckCircle2 } from 'lucide-react';
import { AuthManager } from '@/lib/auth-manager';

// NEW COMPONENTS
import { DatingDNAAssessment } from '@/components/onboarding/dating-dna-assessment';
import { ThreePillarsFramework } from '@/components/onboarding/three-pillars-framework';
import { PersonalizedRoadmap } from '@/components/onboarding/personalized-roadmap';
import { RegistrationForm } from '@/components/auth/registration-form';
import { WelcomeVideo } from '@/components/journey/welcome-video';

type OnboardingStep = 'loading' | 'profile' | 'welcome' | 'three-pillars' | 'dating-dna' | 'roadmap' | 'complete';

interface OnboardingState {
  currentStep: OnboardingStep;
  completedSteps: string[];
  dnaAnswers?: Record<number, string>;
  userType?: string; // A, B, C, or D
  userName?: string;
}

export default function NewOnboardingPage() {
  const { user, userProfile, loading } = useUser();
  const router = useRouter();
  const [state, setState] = useState<OnboardingState>({
    currentStep: 'loading',
    completedSteps: []
  });
  const [isInitializing, setIsInitializing] = useState(true);
  const [authManager] = useState(() => new AuthManager());

  // Save state to localStorage
  const saveState = (newState: OnboardingState) => {
    if (user?.id) {
      try {
        localStorage.setItem(
          `onboarding_new_${user.id}`,
          JSON.stringify({ ...newState, lastSaved: Date.now() })
        );
        console.log('💾 Onboarding state saved');
      } catch (error) {
        console.error('Failed to save onboarding state:', error);
      }
    }
  };

  // Update state with auto-save
  const updateState = (newState: OnboardingState | ((prev: OnboardingState) => OnboardingState)) => {
    setState(prevState => {
      const updated = typeof newState === 'function' ? newState(prevState) : newState;
      saveState(updated);
      return updated;
    });
  };

  // Initialize onboarding
  useEffect(() => {
    const initialize = async () => {
      if (loading) {
        console.log('⏳ Waiting for user...');
        return;
      }

      if (!user) {
        console.log('❌ No user, redirecting to login');
        router.push('/login');
        return;
      }

      console.log('🎯 Initializing onboarding for user:', user.id);

      // Check for saved state
      const savedState = localStorage.getItem(`onboarding_new_${user.id}`);
      if (savedState) {
        try {
          const parsed = JSON.parse(savedState);
          console.log('💾 Restored saved state:', parsed.currentStep);
          setState(parsed);
          setIsInitializing(false);
          return;
        } catch (error) {
          console.error('Failed to parse saved state:', error);
          localStorage.removeItem(`onboarding_new_${user.id}`);
        }
      }

      // Check if already completed
      try {
        const response = await fetch(`/api/journey/status?userId=${user.id}`);
        if (response.ok) {
          const data = await response.json();

          if (data.status === 'completed') {
            console.log('✅ Journey already completed, redirecting to dashboard');
            router.push('/dashboard');
            return;
          }
        }
      } catch (error) {
        console.error('Failed to check journey status:', error);
      }

      // Start fresh
      const hasProfile = userProfile && userProfile.name && userProfile.age;
      const startStep: OnboardingStep = hasProfile ? 'welcome' : 'profile';

      updateState({
        currentStep: startStep,
        completedSteps: [],
        userName: userProfile?.name
      });

      setIsInitializing(false);
    };

    initialize();
  }, [user, loading, router, userProfile]);

  // Step completion handlers
  const handleProfileComplete = async () => {
    console.log('✅ Profile completed');

    await saveProgress('welcome', ['profile']);

    updateState(prev => ({
      ...prev,
      currentStep: 'welcome',
      completedSteps: [...prev.completedSteps, 'profile']
    }));
  };

  const handleWelcomeComplete = async () => {
    console.log('✅ Welcome completed');

    await saveProgress('three-pillars', ['profile', 'welcome']);

    updateState(prev => ({
      ...prev,
      currentStep: 'three-pillars',
      completedSteps: [...prev.completedSteps, 'welcome']
    }));
  };

  const handlePillarsComplete = async () => {
    console.log('✅ Three Pillars completed');

    await saveProgress('dating-dna', ['profile', 'welcome', 'three-pillars']);

    updateState(prev => ({
      ...prev,
      currentStep: 'dating-dna',
      completedSteps: [...prev.completedSteps, 'three-pillars']
    }));
  };

  const handleDNAComplete = async (answers: Record<number, string>, userType: string) => {
    console.log('✅ Dating DNA completed. Type:', userType);
    console.log('📊 Answers:', answers);

    // Save to AI context
    try {
      const token = authManager.getToken();
      await fetch('/api/ai-context', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify({
          action: 'save_onboarding_data',
          userId: user?.id,
          data: {
            datingDNA: answers,
            userType,
            datingSituation: answers[1],
            mainChallenge: answers[2],
            relationshipGoal: answers[3],
            communicationStyle: answers[4],
            strengths: answers[5],
            improvementFocus: answers[6],
            timeCommitment: answers[7]
          }
        })
      });

      console.log('💾 DNA data saved to AI context');
    } catch (error) {
      console.error('Failed to save DNA data:', error);
    }

    await saveProgress('roadmap', ['profile', 'welcome', 'three-pillars', 'dating-dna']);

    updateState(prev => ({
      ...prev,
      currentStep: 'roadmap',
      completedSteps: [...prev.completedSteps, 'dating-dna'],
      dnaAnswers: answers,
      userType
    }));
  };

  const handleRoadmapComplete = async () => {
    console.log('✅ Roadmap completed - redirecting to dashboard');

    await saveProgress('complete', [
      'profile',
      'welcome',
      'three-pillars',
      'dating-dna',
      'roadmap'
    ]);

    // Clear saved state
    if (user?.id) {
      localStorage.removeItem(`onboarding_new_${user.id}`);
    }

    router.push('/dashboard');
  };

  // Save progress to backend
  const saveProgress = async (currentStep: string, completedSteps: string[]) => {
    try {
      await fetch('/api/journey/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id,
          currentStep,
          completedSteps,
          status: currentStep === 'complete' ? 'completed' : 'in_progress'
        })
      });
      console.log('📊 Progress saved:', currentStep);
    } catch (error) {
      console.error('Failed to save progress:', error);
    }
  };

  // Loading state
  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-white to-purple-50">
        <div className="text-center space-y-4">
          <LoadingSpinner />
          <p className="text-gray-600">Je Dating Startpunt voorbereiden...</p>
        </div>
      </div>
    );
  }

  const steps: OnboardingStep[] = ['profile', 'welcome', 'three-pillars', 'dating-dna', 'roadmap', 'complete'];
  const currentStepIndex = steps.indexOf(state.currentStep);
  const progress = ((currentStepIndex + 1) / steps.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
      {/* Progress Bar */}
      {state.currentStep !== 'complete' && state.currentStep !== 'loading' && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-white border-b shadow-sm">
          <div className="container mx-auto px-4 py-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-semibold text-gray-900">
                  Dating Startpunt
                </span>
                <span className="text-gray-600">
                  {Math.round(progress)}% voltooid
                </span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="pt-24 pb-12 px-4">
        <div className="container mx-auto max-w-4xl">

          {/* STEP 1: Profile */}
          {state.currentStep === 'profile' && (
            <div className="space-y-8">
              <Card className="border-2 border-pink-200 shadow-lg">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="w-8 h-8 text-white" />
                  </div>
                  <h1 className="text-3xl font-bold mb-3">Welkom bij DatingAssistent</h1>
                  <p className="text-gray-600 text-lg mb-6">
                    Maak je profiel compleet om te beginnen aan je persoonlijke Dating Startpunt
                  </p>
                </CardContent>
              </Card>

              <RegistrationForm
                defaultName={user?.name || ''}
                onComplete={handleProfileComplete}
              />
            </div>
          )}

          {/* STEP 2: Welcome */}
          {state.currentStep === 'welcome' && (
            <Card className="border-2 border-pink-200 shadow-lg">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-3xl">
                  Welkom, {state.userName || 'daar'}!
                </CardTitle>
                <p className="text-gray-600 text-lg mt-3">
                  Ontdek jouw Dating Startpunt in slechts 10 minuten
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="text-center p-6 bg-pink-50 rounded-lg">
                    <Target className="w-8 h-8 mx-auto mb-2 text-pink-600" />
                    <h3 className="font-semibold mb-1">Jouw Type</h3>
                    <p className="text-sm text-gray-600">
                      Ontdek waar je staat
                    </p>
                  </div>
                  <div className="text-center p-6 bg-purple-50 rounded-lg">
                    <Sparkles className="w-8 h-8 mx-auto mb-2 text-purple-600" />
                    <h3 className="font-semibold mb-1">Gratis Gids</h3>
                    <p className="text-sm text-gray-600">
                      Direct downloadbaar
                    </p>
                  </div>
                  <div className="text-center p-6 bg-blue-50 rounded-lg">
                    <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                    <h3 className="font-semibold mb-1">Jouw Pad</h3>
                    <p className="text-sm text-gray-600">
                      Persoonlijke routekaart
                    </p>
                  </div>
                </div>

                <div className="pt-6 text-center">
                  <Button
                    onClick={handleWelcomeComplete}
                    size="lg"
                    className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 px-8"
                  >
                    Start Jouw Dating Startpunt
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* STEP 3: Three Pillars */}
          {state.currentStep === 'three-pillars' && (
            <ThreePillarsFramework onContinue={handlePillarsComplete} />
          )}

          {/* STEP 4: Dating DNA */}
          {state.currentStep === 'dating-dna' && (
            <DatingDNAAssessment onComplete={handleDNAComplete} />
          )}

          {/* STEP 5: Personalized Roadmap */}
          {state.currentStep === 'roadmap' && state.userType && (
            <PersonalizedRoadmap
              userType={state.userType}
              userName={state.userName}
              onContinue={handleRoadmapComplete}
            />
          )}

        </div>
      </div>
    </div>
  );
}
