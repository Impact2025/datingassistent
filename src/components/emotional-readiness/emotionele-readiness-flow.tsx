"use client";

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
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
      <Card className="bg-white border-gray-200 shadow-sm">
        <CardContent className="p-6">
          <div className="text-center">
            <div className="w-14 h-14 bg-pink-50 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Heart className="w-7 h-7 text-pink-500" />
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-2">{getStepTitle()}</h2>
            <p className="text-gray-600 mb-4">{getStepSubtitle()}</p>

            {/* Progress Bar */}
            <div className="max-w-md mx-auto">
              <Progress value={getStepProgress()} className="h-2 mb-2" />
              <div className="flex justify-between text-xs text-gray-500">
                <span>Start</span>
                <span>Vragen</span>
                <span>Resultaat</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
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

      {/* Footer Card */}
      <Card className="bg-white border-gray-200 shadow-sm">
        <CardContent className="p-4">
          <div className="text-center text-xs text-gray-600">
            <p className="mb-1">Deze scan is geen medische diagnose maar geeft praktische inzichten voor betere dating.</p>
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
    <>
      {/* Two Column Grid */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* What it does Card */}
        <Card className="bg-white border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-pink-50 rounded-lg">
                <Sparkles className="w-5 h-5 text-pink-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Wat deze scan doet</h3>
            </div>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-pink-500 mt-0.5">•</span>
                <span className="text-gray-700">Meet je emotionele draagkracht voor dating</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-pink-500 mt-0.5">•</span>
                <span className="text-gray-700">Detecteert rebound risico na een relatie</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-pink-500 mt-0.5">•</span>
                <span className="text-gray-700">Analyseert je healing proces stadium</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-pink-500 mt-0.5">•</span>
                <span className="text-gray-700">Geeft concrete timing adviezen</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* What you get Card */}
        <Card className="bg-white border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-pink-50 rounded-lg">
                <Heart className="w-5 h-5 text-pink-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Wat je krijgt</h3>
            </div>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-pink-500 mt-0.5">•</span>
                <div>
                  <p className="font-medium text-gray-900">Readiness Score (1-10)</p>
                  <p className="text-xs text-gray-600">Met uitleg wat het betekent</p>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-pink-500 mt-0.5">•</span>
                <div>
                  <p className="font-medium text-gray-900">Rebound Risico %</p>
                  <p className="text-xs text-gray-600">Hoe groot is de kans?</p>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-pink-500 mt-0.5">•</span>
                <div>
                  <p className="font-medium text-gray-900">Groei Plan</p>
                  <p className="text-xs text-gray-600">Concrete stappen</p>
                </div>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Why this matters Card */}
      <Card className="bg-white border-gray-200 rounded-xl shadow-sm">
        <CardContent className="p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-pink-50 rounded-lg">
              <Heart className="w-5 h-5 text-pink-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Waarom dit belangrijk is</h3>
          </div>
          <div className="space-y-3 text-sm text-gray-700">
            <p>
              <strong className="text-gray-900">Te vroeg daten na een breakup?</strong> Dan loop je het risico op rebound relaties die eindigen in déjà vu. Je trekt dezelfde types aan, herhaalt patronen, of bouwt iets op dat niet duurzaam is.
            </p>
            <p>
              <strong className="text-gray-900">Dating terwijl je nog heelt?</strong> Zorgt voor onbewuste sabotage. Je date vanuit angst (voor alleen zijn), niet vanuit hoop (voor echte connectie).
            </p>
            <div className="bg-pink-50 border-l-4 border-pink-500 p-3 rounded-r-lg">
              <p className="text-pink-900">
                <strong>Deze scan helpt je eerlijk te zijn met jezelf</strong>, zodat je dating start <em>wanneer het klopt</em>—niet wanneer je denkt dat het moet.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* CTA Card */}
      <Card className="bg-gradient-to-br from-pink-500 to-purple-600 border-0 rounded-xl shadow-lg">
        <CardContent className="p-6 text-center">
          <h3 className="text-xl font-bold text-white mb-3">
            Klaar om jezelf eerlijk te scannen?
          </h3>
          <p className="text-pink-50 mb-4 text-sm">
            In 3-4 minuten weet je of je klaar bent, of dat je jezelf nog even tijd moet geven.
          </p>
          <button
            onClick={onStart}
            className="bg-white text-pink-600 hover:bg-gray-50 px-6 py-3 text-base rounded-full font-semibold shadow-lg hover:shadow-xl transition-all inline-flex items-center gap-2"
          >
            <Heart className="w-5 h-5" />
            Start Emotionele Ready Scan
          </button>
          <p className="text-pink-100 text-xs mt-3">
            ✓ Anoniem ✓ Wetenschappelijk ✓ Direct resultaat
          </p>
        </CardContent>
      </Card>
    </>
  );
}
