'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Compass, ArrowRight, CheckCircle, Sparkles, Target, Heart, Zap, ArrowLeft, HelpCircle, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Logo } from '@/components/shared/logo';
import { MiniIntake } from './MiniIntake';
import { WaardenOnderzoek } from './WaardenOnderzoek';
import { AISynthese } from './AISynthese';
import { IntegratieHub } from './IntegratieHub';
import { ToolProgressIndicator } from '@/components/ui/tool-progress-indicator';

export type WaardenKompasPhase = 'intake' | 'onderzoek' | 'synthese' | 'integratie' | 'completed';

interface WaardenKompasSession {
  id: number;
  currentPhase: WaardenKompasPhase;
  intake?: {
    goal: string;
    valuesImportance: string;
    datingStyle: string;
  };
  startedAt: string;
  completedAt?: string;
}

interface WaardenKompasToolProps {
  className?: string;
}

export function WaardenKompasTool({ className }: WaardenKompasToolProps) {
  const router = useRouter();
  const [session, setSession] = useState<WaardenKompasSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPhase, setCurrentPhase] = useState<WaardenKompasPhase>('intake');
  const [error, setError] = useState<string | null>(null);
  const [showGuide, setShowGuide] = useState(false);

  // Load existing session on mount
  useEffect(() => {
    loadSession();
  }, []);

  const loadSession = async () => {
    try {
      const token = localStorage.getItem('datespark_auth_token');
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await fetch('/api/waarden-kompas', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.hasSession) {
          setSession(data.session);
          setCurrentPhase(data.session.currentPhase);
        }
      }
    } catch (error) {
      console.error('Error loading session:', error);
    } finally {
      setLoading(false);
    }
  };

  const startNewSession = async () => {
    try {
      const token = localStorage.getItem('datespark_auth_token');
      if (!token) return;

      const response = await fetch('/api/waarden-kompas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          action: 'start_session'
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setSession(data.session);
        setCurrentPhase('intake');
      }
    } catch (error) {
      console.error('Error starting session:', error);
    }
  };

  const handlePhaseComplete = async (nextPhase: WaardenKompasPhase) => {
    setCurrentPhase(nextPhase);
    if (session) {
      setSession({ ...session, currentPhase: nextPhase });
    }

    // Track completion for this phase
    try {
      const token = localStorage.getItem('datespark_auth_token');
      if (token) {
        const phaseActionMap = {
          'onderzoek': 'waarden_onderzoek_completed',
          'synthese': 'ai_synthese_completed',
          'integratie': 'integratie_completed',
          'completed': 'waarden_kompas_completed'
        };

        const actionName = phaseActionMap[nextPhase];
        if (actionName) {
          await fetch('/api/tool-completion/mark-completed', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
              toolName: 'waarden-kompas',
              actionName,
              metadata: { phase: nextPhase, sessionId: session?.id }
            }),
          });
        }
      }
    } catch (error) {
      console.error('Error tracking completion:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="bg-white border-0 shadow-sm rounded-xl p-8 text-center max-w-sm">
          <Compass className="w-8 h-8 animate-spin mx-auto mb-4 text-pink-500" />
          <p className="text-gray-600">Waarden Kompas laden...</p>
        </Card>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Hero Card */}
          <Card className="bg-white border-0 shadow-sm rounded-xl overflow-hidden">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-pink-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Compass className="w-8 h-8 text-pink-600" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900 mb-4">
                Ontdek Jouw Waarden Kompas™
              </CardTitle>
              <p className="text-gray-600 mb-8">
                Ontdek jouw kernwaarden in liefde, relaties en levensstijl — en vertaal ze direct naar betere datingkeuzes.
              </p>

              <Button
                onClick={startNewSession}
                className="w-full bg-pink-500 hover:bg-pink-600 text-white font-medium py-3 rounded-xl"
                size="lg"
              >
                <Compass className="w-5 h-5 mr-2" />
                Start Jouw Waarden Kompas
              </Button>

              <p className="text-xs text-gray-500 mt-4">
                ± 5 minuten • 4 interactieve fases • Persoonlijk advies
              </p>
            </CardContent>
          </Card>

          {/* Promise Card */}
          <Card className="bg-white border-0 shadow-sm rounded-xl">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-pink-100 rounded-xl flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-pink-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Onze Belofte</h3>
                  <p className="text-sm text-gray-600">Binnen 5 minuten weet jij wat jij écht nodig hebt in een relatie</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Benefits Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-white border-0 shadow-sm rounded-xl">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Target className="w-6 h-6 text-blue-600" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Helderheid</h4>
                <p className="text-sm text-gray-600">Meer zelfkennis over wat je wilt</p>
              </CardContent>
            </Card>

            <Card className="bg-white border-0 shadow-sm rounded-xl">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-6 h-6 text-green-600" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Betere Matches</h4>
                <p className="text-sm text-gray-600">Kwalitatieve connecties vinden</p>
              </CardContent>
            </Card>

            <Card className="bg-white border-0 shadow-sm rounded-xl">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-6 h-6 text-purple-600" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Snellere Besluiten</h4>
                <p className="text-sm text-gray-600">Minder twijfel, meer actie</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Progress indicator
  const getProgressPercentage = () => {
    switch (currentPhase) {
      case 'intake': return 25;
      case 'onderzoek': return 50;
      case 'synthese': return 75;
      case 'integratie': return 90;
      case 'completed': return 100;
      default: return 0;
    }
  };

  const getPhaseTitle = () => {
    switch (currentPhase) {
      case 'intake': return 'Mini Intake';
      case 'onderzoek': return 'Waarden Onderzoek';
      case 'synthese': return 'AI Synthese';
      case 'integratie': return 'Integratie';
      case 'completed': return 'Voltooid';
      default: return '';
    }
  };

  return (
    <div className={`min-h-screen bg-gray-50 p-4 ${className}`}>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-4 py-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="p-2"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Waarden Kompas</h1>
              <p className="text-sm text-gray-600">Persoonlijke waarden ontdekken</p>
            </div>
          </div>
        </div>

        {/* Progress Card */}
        <Card className="bg-white border-0 shadow-sm rounded-xl mx-4">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Voortgang</h2>
                <p className="text-sm text-gray-600">Fase {getPhaseTitle()}</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-pink-600">{getProgressPercentage()}%</div>
              </div>
            </div>
            <Progress value={getProgressPercentage()} className="h-2" />
          </CardContent>
        </Card>

        {/* Progress Indicator */}
        <ToolProgressIndicator
          toolId="waarden-kompas"
          toolName="Waarden Kompas"
          totalActions={4}
          showDetails={true}
        />

        {/* Phase Content */}
        <div className="space-y-6">
        {currentPhase === 'intake' && (
          <MiniIntake
            sessionId={session.id}
            onComplete={() => handlePhaseComplete('onderzoek')}
          />
        )}

        {currentPhase === 'onderzoek' && (
          <WaardenOnderzoek
            sessionId={session.id}
            onComplete={() => handlePhaseComplete('synthese')}
          />
        )}

        {currentPhase === 'synthese' && (
          <AISynthese
            sessionId={session.id}
            onComplete={() => handlePhaseComplete('integratie')}
          />
        )}

        {currentPhase === 'integratie' && (
          <IntegratieHub
            sessionId={session.id}
            onComplete={() => handlePhaseComplete('completed')}
          />
        )}

        {currentPhase === 'completed' && (
          <Card className="bg-white border-0 shadow-sm rounded-xl">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Jouw Waarden Kompas is Voltooid! 🎉
              </h2>
              <p className="text-gray-600 mb-8">
                Je hebt nu helder zicht op wat jij écht belangrijk vindt in relaties.
                Deze inzichten helpen je om betere dating beslissingen te maken.
              </p>
              <Button
                onClick={() => window.location.reload()}
                className="bg-pink-500 hover:bg-pink-600 text-white font-medium px-8 py-3 rounded-xl"
              >
                Bekijk Resultaten Opnieuw
              </Button>
            </CardContent>
          </Card>
        )}
        </div>

        {/* Guide Modal */}
        {showGuide && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-md">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <HelpCircle className="w-5 h-5 text-pink-600" />
                    Handleiding Waarden Kompas
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowGuide(false)}
                    className="p-1"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3 text-sm">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">📋 Mini Intake</h4>
                    <p className="text-gray-600">Vertel ons over je dating doelen en wat belangrijk voor je is in relaties.</p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">🎯 Waarden Onderzoek</h4>
                    <p className="text-gray-600">Ontdek welke kernwaarden het belangrijkst zijn voor jouw ideale relatie.</p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">🤖 AI Synthese</h4>
                    <p className="text-gray-600">Onze AI analyseert je antwoorden en geeft gepersonaliseerde inzichten.</p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">🔄 Integratie</h4>
                    <p className="text-gray-600">Leer hoe je deze inzichten kunt toepassen in je dagelijkse dating leven.</p>
                  </div>
                </div>

                <div className="bg-pink-50 border border-pink-200 rounded-lg p-3">
                  <p className="text-sm text-pink-800">
                    <strong>Tip:</strong> Neem de tijd voor elke vraag. Je antwoorden helpen ons om de beste inzichten voor jou te genereren.
                  </p>
                </div>

                <Button
                  onClick={() => setShowGuide(false)}
                  className="w-full bg-pink-500 hover:bg-pink-600 text-white"
                >
                  Begrepen, doorgaan
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}