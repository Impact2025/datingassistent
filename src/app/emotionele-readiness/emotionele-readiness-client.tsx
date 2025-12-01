"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Heart,
  Shield,
  Target,
  CheckCircle,
  AlertTriangle,
  Sparkles,
  ArrowRight,
  RefreshCw,
  Clock,
  TrendingUp,
  Activity
} from 'lucide-react';
import { EmotionalReadinessQuestionnaire } from '@/components/emotional-readiness/emotional-readiness-questionnaire';
import { EmotionalReadinessResults } from '@/components/emotional-readiness/emotional-readiness-results';
import { EmotionalReadinessTutorial } from '@/components/onboarding/tutorials/emotional-readiness-tutorial';

type AssessmentState = 'intro' | 'questionnaire' | 'results';

export function EmotioneleReadinessClient() {
  const [assessmentState, setAssessmentState] = useState<AssessmentState>('intro');
  const [assessmentData, setAssessmentData] = useState<any>(null);

  const handleStartAssessment = () => {
    setAssessmentState('questionnaire');
  };

  const handleAssessmentComplete = (data: any) => {
    setAssessmentData(data);
    setAssessmentState('results');
  };

  const handleRestart = () => {
    setAssessmentData(null);
    setAssessmentState('intro');
  };

  if (assessmentState === 'questionnaire') {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-12 max-w-4xl">
          <EmotionalReadinessQuestionnaire
            onComplete={handleAssessmentComplete}
            onBack={() => setAssessmentState('intro')}
          />
        </div>
      </div>
    );
  }

  if (assessmentState === 'results' && assessmentData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-12 max-w-4xl">
          <EmotionalReadinessResults
            data={assessmentData}
            onRestart={handleRestart}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-5xl mx-auto">
          {/* Header - Clean & Modern */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 mb-6">
              <div className="p-3 bg-pink-500 rounded-xl">
                <Heart className="w-6 h-6 text-white" />
              </div>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 tracking-tight">
              Emotionele Ready Scan
            </h1>

            <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Ontdek of je écht klaar bent om te daten, of dat je eerst moet helen.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
              <Badge variant="outline" className="px-4 py-2 bg-white border-gray-200 text-gray-700">
                <Clock className="w-4 h-4 mr-2" />
                3-4 minuten
              </Badge>
              <Badge variant="outline" className="px-4 py-2 bg-white border-gray-200 text-gray-700">
                <TrendingUp className="w-4 h-4 mr-2" />
                AI-analyse
              </Badge>
              <Badge variant="outline" className="px-4 py-2 bg-white border-gray-200 text-gray-700">
                <Shield className="w-4 h-4 mr-2" />
                Wetenschappelijk
              </Badge>
            </div>
          </div>

          {/* Main Content - Card Grid */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* What it does Card */}
            <Card className="bg-white border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-pink-50 rounded-lg">
                    <Target className="w-5 h-5 text-pink-600" />
                  </div>
                  <CardTitle className="text-xl text-gray-900">Wat deze scan doet</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-pink-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700 leading-relaxed">Meet je emotionele draagkracht voor dating</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-pink-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700 leading-relaxed">Detecteert rebound risico na een relatie</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-pink-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700 leading-relaxed">Analyseert je healing proces stadium</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-pink-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700 leading-relaxed">Geeft concrete timing adviezen</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* What you get Card */}
            <Card className="bg-white border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-pink-50 rounded-lg">
                    <Sparkles className="w-5 h-5 text-pink-600" />
                  </div>
                  <CardTitle className="text-xl text-gray-900">Wat je krijgt</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <div className="p-1.5 bg-pink-100 rounded-lg flex-shrink-0">
                      <Activity className="w-4 h-4 text-pink-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Readiness Score</p>
                      <p className="text-sm text-gray-600">Van 1-10, met uitleg wat het betekent</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="p-1.5 bg-pink-100 rounded-lg flex-shrink-0">
                      <AlertTriangle className="w-4 h-4 text-pink-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Rebound Risico %</p>
                      <p className="text-sm text-gray-600">Hoe groot is de kans op rebound dating?</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="p-1.5 bg-pink-100 rounded-lg flex-shrink-0">
                      <TrendingUp className="w-4 h-4 text-pink-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Groei Plan</p>
                      <p className="text-sm text-gray-600">Concrete stappen naar dating readiness</p>
                    </div>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Why this matters Card */}
          <Card className="bg-white border-gray-200 rounded-2xl shadow-sm mb-8">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-pink-50 rounded-lg">
                  <Heart className="w-5 h-5 text-pink-600" />
                </div>
                <CardTitle className="text-xl text-gray-900">Waarom dit belangrijk is</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 text-gray-700 leading-relaxed">
                <p>
                  <strong className="text-gray-900">Te vroeg daten na een breakup?</strong> Dan loop je het risico op rebound relaties die eindig
en in déjà vu. Je trekt dezelfde types aan, herhaalt patronen, of bouwt iets op dat niet duurzaam is.
                </p>
                <p>
                  <strong className="text-gray-900">Dating terwijl je nog heelt?</strong> Zorgt voor onbewuste sabotage. Je date vanuit angst (voor alleen zijn), niet vanuit hoop (voor echte connectie). Het resultaat: frustratie, teleurstelling, of erger—wonden die dieper worden.
                </p>
                <p className="bg-pink-50 border-l-4 border-pink-500 p-4 rounded-r-lg">
                  <strong className="text-pink-900">Deze scan helpt je eerlijk te zijn met jezelf</strong>, zodat je dating start <em>wanneer het klopt</em>—niet wanneer je denkt dat het moet.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* CTA Card */}
          <Card className="bg-gradient-to-br from-pink-500 to-purple-600 border-0 rounded-2xl shadow-lg">
            <CardContent className="p-8 text-center">
              <h3 className="text-2xl font-bold text-white mb-4">
                Klaar om jezelf eerlijk te scannen?
              </h3>
              <p className="text-pink-50 mb-6 max-w-xl mx-auto">
                In 3-4 minuten weet je of je klaar bent, of dat je jezelf nog even tijd moet geven.
              </p>
              <Button
                onClick={handleStartAssessment}
                size="lg"
                className="bg-white text-pink-600 hover:bg-gray-50 px-8 py-6 text-lg rounded-full font-semibold shadow-lg hover:shadow-xl transition-all"
              >
                Start Emotionele Ready Scan
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <p className="text-pink-100 text-sm mt-4">
                ✓ Anoniem ✓ Wetenschappelijk ✓ Direct resultaat
              </p>
            </CardContent>
          </Card>

          {/* Trust indicators */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-8 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              <span>AVG-proof</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              <span>Geen verplichtingen</span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              <span>AI-gedreven</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tutorial Component */}
      <EmotionalReadinessTutorial />
    </div>
  );
}
