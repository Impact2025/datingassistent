/**
 * ONBOARDING FLOW COMPONENT
 * Unified onboarding experience for all platforms
 * Created: 2025-11-23
 *
 * Handles the complete onboarding journey from profile setup to completion
 * Reusable across desktop, mobile, and tablet dashboards
 */

'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/shared/loading-spinner';
import { PersonalityScan } from '@/components/journey/personality-scan';
import { CoachAdvice } from '@/components/journey/coach-advice';
import { RegistrationForm } from '@/components/auth/registration-form';
import { WelcomeVideo } from '@/components/journey/welcome-video';
import { WelcomeQuestions, type WelcomeAnswers } from '@/components/journey/welcome-questions';
import { JourneyState, JourneyStep } from '@/hooks/use-journey-state';

interface OnboardingFlowProps {
  journeyState: JourneyState;
  userName?: string;
  handlers: {
    handleProfileComplete: () => Promise<void>;
    handleWelcomeComplete: () => Promise<void>;
    handleScanComplete: (scanData: any) => Promise<void>;
    handleCoachAdviceComplete: () => Promise<void>;
    handleWelcomeVideoComplete: () => Promise<void>;
    handleWelcomeQuestionsComplete: (answers: WelcomeAnswers) => Promise<void>;
  };
}

export function OnboardingFlow({ journeyState, userName, handlers }: OnboardingFlowProps) {
  const steps: JourneyStep[] = ['profile', 'welcome', 'scan', 'coach-advice', 'welcome-video', 'welcome-questions', 'complete'];
  const currentStepIndex = steps.indexOf(journeyState.currentStep);
  const progress = ((currentStepIndex + 1) / steps.length) * 100;

  return (
    <div className="space-y-6 mb-8">
      {/* Journey Progress Card */}
      <Card className="border border-gray-200 bg-white">
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Je DatingAssistent Journey</h2>
                <p className="text-sm text-gray-600">
                  Stap {currentStepIndex + 1} van {steps.length} - Voltooi je onboarding voor toegang tot alle tools
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="bg-coral-50 text-coral-700 border-coral-200">
                  PRO
                </Badge>
                <Badge variant="outline" className="text-coral-600 border-coral-200 bg-coral-50">
                  {Math.round(progress)}% compleet
                </Badge>
              </div>
            </div>

            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-coral-500 transition-all duration-300 ease-in-out"
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
            <Card className="border border-gray-200 bg-white">
              <CardHeader>
                <CardTitle className="text-gray-900">
                  Maak je profiel compleet
                </CardTitle>
                <CardDescription className="text-gray-600">
                  Vul je basisgegevens in voor persoonlijke coaching
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RegistrationForm
                  defaultName={userName || ''}
                  onComplete={handlers.handleProfileComplete}
                />
              </CardContent>
            </Card>

            {/* Benefits */}
            <div className="grid gap-3 text-left sm:grid-cols-3 text-xs">
              <Card className="bg-white border border-gray-200">
                <CardContent className="p-3">
                  <p className="font-semibold text-gray-900 mb-1">Wat we vragen</p>
                  <p className="text-gray-600">Naam, leeftijd, woonplaats en wat je zoekt.</p>
                </CardContent>
              </Card>
              <Card className="bg-white border border-gray-200">
                <CardContent className="p-3">
                  <p className="font-semibold text-gray-900 mb-1">Waarom dit helpt</p>
                  <p className="text-gray-600">Betere openingszinnen en persoonlijk advies.</p>
                </CardContent>
              </Card>
              <Card className="bg-white border border-gray-200">
                <CardContent className="p-3">
                  <p className="font-semibold text-gray-900 mb-1">Wat je krijgt</p>
                  <p className="text-gray-600">Direct toegang tot al je tools.</p>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Welcome Screen */}
        {journeyState.currentStep === 'welcome' && (
          <Card className="border border-gray-200 bg-white">
            <CardContent className="pt-6">
              <div className="text-center space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Welkom bij DatingAssistent!</h2>
                  <p className="text-gray-600 max-w-2xl mx-auto">
                    Voordat we beginnen, wil ik je graag persoonlijk welkom heten.
                  </p>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <Card className="border border-gray-200 bg-white">
                    <CardContent className="p-4 text-center">
                      <div className="w-8 h-8 rounded-full bg-coral-100 flex items-center justify-center mx-auto mb-2">
                        <span className="text-sm font-bold text-coral-600">7</span>
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-1">Coach Vragen</h3>
                      <p className="text-sm text-gray-600">Vertel over je situatie</p>
                    </CardContent>
                  </Card>
                  <Card className="border border-gray-200 bg-white">
                    <CardContent className="p-4 text-center">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-2">
                        <span className="text-sm font-bold text-blue-600">AI</span>
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-1">AI Analyse</h3>
                      <p className="text-sm text-gray-600">Krijg persoonlijk advies</p>
                    </CardContent>
                  </Card>
                  <Card className="border border-gray-200 bg-white">
                    <CardContent className="p-4 text-center">
                      <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-2">
                        <span className="text-sm font-bold text-green-600">→</span>
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-1">Direct Actie</h3>
                      <p className="text-sm text-gray-600">Start vandaag nog</p>
                    </CardContent>
                  </Card>
                </div>

                <Button
                  onClick={handlers.handleWelcomeComplete}
                  size="lg"
                  className="px-8 bg-coral-500 hover:bg-coral-600 text-white"
                >
                  Start Coach Scan
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Personality Scan */}
        {journeyState.currentStep === 'scan' && (
          <Card className="border border-gray-200 bg-white">
            <CardContent className="pt-6">
              <PersonalityScan onComplete={handlers.handleScanComplete} />
            </CardContent>
          </Card>
        )}

        {/* Coach Advice */}
        {journeyState.currentStep === 'coach-advice' && journeyState.coachAdvice && (
          <Card className="border border-gray-200 bg-white">
            <CardContent className="pt-6">
              <CoachAdvice
                advice={journeyState.coachAdvice}
                onComplete={handlers.handleCoachAdviceComplete}
              />
            </CardContent>
          </Card>
        )}

        {/* Welcome Video */}
        {journeyState.currentStep === 'welcome-video' && (
          <div className="bg-white border border-gray-200 rounded-lg">
            <WelcomeVideo onComplete={handlers.handleWelcomeVideoComplete} />
          </div>
        )}

        {/* Welcome Questions */}
        {journeyState.currentStep === 'welcome-questions' && (
          <Card className="border border-gray-200 bg-white">
            <WelcomeQuestions onComplete={handlers.handleWelcomeQuestionsComplete} />
          </Card>
        )}

        {/* Loading state */}
        {journeyState.currentStep === 'loading' && (
          <Card className="border border-gray-200 bg-white">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center justify-center py-16 space-y-6">
                <LoadingSpinner />
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Je coach analyseert je antwoorden...
                  </h3>
                  <p className="text-sm text-gray-600">
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
}
