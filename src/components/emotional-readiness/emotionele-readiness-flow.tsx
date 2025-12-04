"use client";

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Heart, Sparkles } from 'lucide-react';
import { EmotionalReadinessQuestionnaire } from './emotional-readiness-questionnaire';
import { EmotionalReadinessResults } from './emotional-readiness-results';

type AssessmentStep = 'intro' | 'questionnaire' | 'results';

export function EmotioneleReadinessFlow() {
  const [currentStep, setCurrentStep] = useState<AssessmentStep>('intro');
  const [assessmentData, setAssessmentData] = useState<any>(null);

  const getStepProgress = () => {
    switch (currentStep) {
      case 'intro': return 0;
      case 'questionnaire': return 33;
      case 'results': return 100;
      default: return 0;
    }
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 'intro': return 'Emotionele Ready Scan';
      case 'questionnaire': return 'Vragenlijst';
      case 'results': return 'Jouw Resultaat';
      default: return '';
    }
  };

  const getStepSubtitle = () => {
    switch (currentStep) {
      case 'intro': return 'Ontdek of je klaar bent voor dating in 3-4 minuten';
      case 'questionnaire': return 'Beantwoord de vragen eerlijk voor het beste resultaat';
      case 'results': return 'Je readiness score en persoonlijk advies';
      default: return '';
    }
  };

  const handleStartAssessment = () => {
    setCurrentStep('questionnaire');
  };

  const handleAssessmentComplete = (data: any) => {
    setAssessmentData(data);
    setCurrentStep('results');
  };

  const handleRestart = () => {
    setAssessmentData(null);
    setCurrentStep('intro');
  };

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card className="bg-white border-0 shadow-sm">
        <CardContent className="p-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-pink-50 rounded-xl flex items-center justify-center mx-auto mb-6">
              <Sparkles className="w-8 h-8 text-pink-500" />
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-3">{getStepTitle()}</h1>
            <p className="text-gray-600 mb-6">{getStepSubtitle()}</p>

            {/* Progress Bar */}
            <div className="max-w-md mx-auto">
              <Progress value={getStepProgress()} className="h-2 mb-3" />
              <div className="flex justify-between text-sm text-gray-500">
                <span>Start</span>
                <span>Vragen</span>
                <span>Resultaat</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Card */}
      <Card className="bg-white border-0 shadow-sm">
        <CardContent className="p-0">
          {currentStep === 'intro' && (
            <IntroCard onStart={handleStartAssessment} />
          )}

          {currentStep === 'questionnaire' && (
            <EmotionalReadinessQuestionnaire
              onComplete={handleAssessmentComplete}
              onBack={() => setCurrentStep('intro')}
            />
          )}

          {currentStep === 'results' && assessmentData && (
            <EmotionalReadinessResults
              data={assessmentData}
              onRestart={handleRestart}
            />
          )}
        </CardContent>
      </Card>

      {/* Footer Card */}
      <Card className="bg-white border-0 shadow-sm">
        <CardContent className="p-6">
          <div className="text-center text-sm text-gray-600">
            <p className="mb-2">Deze scan is geen medische diagnose maar geeft praktische inzichten voor betere dating.</p>
            <p>Alle data wordt AVG-proof opgeslagen en blijft privé.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Intro Card Component
interface IntroCardProps {
  onStart: () => void;
}

function IntroCard({ onStart }: IntroCardProps) {
  return (
    <div className="p-8 space-y-6">
      {/* Clean description */}
      <div className="text-center space-y-4">
        <p className="text-gray-700 leading-relaxed max-w-2xl mx-auto">
          Ontdek of je écht klaar bent om te daten. Deze scan meet je emotionele draagkracht, detecteert rebound risico's, en geeft concrete timing adviezen.
        </p>
      </div>

      {/* What you get - Simple list */}
      <div className="max-w-xl mx-auto">
        <h3 className="text-sm font-semibold text-gray-900 mb-4 text-center">Wat je krijgt</h3>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 bg-pink-500 rounded-full mt-2 flex-shrink-0"></div>
            <div>
              <p className="font-medium text-gray-900">Readiness Score</p>
              <p className="text-sm text-gray-600">Van 1-10, met uitleg wat het betekent</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 bg-pink-500 rounded-full mt-2 flex-shrink-0"></div>
            <div>
              <p className="font-medium text-gray-900">Rebound Risico %</p>
              <p className="text-sm text-gray-600">Hoe groot is de kans op rebound dating?</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 bg-pink-500 rounded-full mt-2 flex-shrink-0"></div>
            <div>
              <p className="font-medium text-gray-900">Groei Plan</p>
              <p className="text-sm text-gray-600">Concrete stappen naar dating readiness</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Button */}
      <div className="text-center pt-4">
        <Button
          onClick={onStart}
          size="lg"
          className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white px-8 py-6 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all"
        >
          Start Scan
          <Sparkles className="w-5 h-5 ml-2" />
        </Button>
        <p className="text-sm text-gray-500 mt-4">
          3-4 minuten · AVG-proof · Direct resultaat
        </p>
      </div>
    </div>
  );
}
