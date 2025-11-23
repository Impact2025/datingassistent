/**
 * JOURNEY STATE HOOK
 * Manages onboarding journey state and progression
 * Created: 2025-11-23
 *
 * Centralizes all journey/onboarding logic for reuse across platforms
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export type JourneyStep = 'loading' | 'profile' | 'welcome' | 'scan' | 'coach-advice' | 'welcome-video' | 'welcome-questions' | 'complete';

export interface JourneyState {
  currentStep: JourneyStep;
  completedSteps: string[];
  scanData?: any;
  coachAdvice?: any;
}

export interface WelcomeAnswers {
  writingStyle: string;
  datingApps: string[];
  genderPreference: string;
  remindersEnabled: string;
}

interface UseJourneyStateOptions {
  userId?: number;
  userProfile?: any;
  enabled?: boolean;
}

export function useJourneyState({ userId, userProfile, enabled = true }: UseJourneyStateOptions) {
  const router = useRouter();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [journeyState, setJourneyState] = useState<JourneyState>({
    currentStep: 'loading',
    completedSteps: [],
  });
  const [isInitializingOnboarding, setIsInitializingOnboarding] = useState(false);
  const [journeyCheckComplete, setJourneyCheckComplete] = useState(false);

  // Load journey data and check if onboarding is needed
  useEffect(() => {
    if (!enabled || !userId) return;

    const loadJourneyData = async () => {
      try {
        const response = await fetch(`/api/journey/status?userId=${userId}`);
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
            try {
              const subscriptionResponse = await fetch(`/api/user/subscription?userId=${userId}`);
              if (subscriptionResponse.ok) {
                const subscriptionData = await subscriptionResponse.json();
                if (subscriptionData.subscription?.status === 'active') {
                  console.log('🎯 User has active subscription - allowing onboarding restart');
                  setIsInitializingOnboarding(true);

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
      } finally {
        setJourneyCheckComplete(true);
        setIsInitializingOnboarding(false);
      }
    };

    loadJourneyData();
  }, [userId, userProfile, enabled]);

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
          userId,
          currentStep,
          completedSteps,
          ...additionalData,
        }),
      });
    } catch (error) {
      console.error('Failed to save journey progress:', error);
    }
  };

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
      // First, save the scan completion
      await saveJourneyProgress('scan', ['profile', 'welcome', 'scan'], { scanData });

      // Mark personality scan as completed in coaching profile
      try {
        await fetch('/api/coaching-profile/complete-step', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId,
            stepName: 'personality_scan',
            metadata: { scanData }
          }),
        });
        console.log('✅ Personality scan marked as completed in coaching profile');
      } catch (error) {
        console.error('Failed to mark personality scan as completed:', error);
      }

      // Mark scan goal as completed
      try {
        const goalsResponse = await fetch(`/api/goals?userId=${userId}`);
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
                userId,
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

      // Generate coach advice
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

    await saveJourneyProgress('welcome-video', ['profile', 'welcome', 'scan', 'coach-advice']);

    // Mark coach advice as completed in coaching profile
    if (userId && journeyState.coachAdvice) {
      try {
        await fetch('/api/coaching-profile/complete-step', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId,
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

  return {
    showOnboarding,
    journeyState,
    isInitializingOnboarding,
    journeyCheckComplete,
    handlers: {
      handleProfileComplete,
      handleWelcomeComplete,
      handleScanComplete,
      handleCoachAdviceComplete,
      handleWelcomeVideoComplete,
      handleWelcomeQuestionsComplete,
    },
  };
}
