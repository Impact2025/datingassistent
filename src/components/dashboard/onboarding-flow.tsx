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
                <RegistrationForm
                  defaultName={userName || ''}
                  onComplete={handlers.handleProfileComplete}
                />
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
                  onClick={handlers.handleWelcomeComplete}
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
              <PersonalityScan onComplete={handlers.handleScanComplete} />
            </CardContent>
          </Card>
        )}

        {/* Coach Advice */}
        {journeyState.currentStep === 'coach-advice' && journeyState.coachAdvice && (
          <Card>
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
          <WelcomeVideo onComplete={handlers.handleWelcomeVideoComplete} />
        )}

        {/* Welcome Questions */}
        {journeyState.currentStep === 'welcome-questions' && (
          <WelcomeQuestions onComplete={handlers.handleWelcomeQuestionsComplete} />
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
}
