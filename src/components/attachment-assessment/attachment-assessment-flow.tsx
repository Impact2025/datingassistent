"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Sparkles, ArrowRight, ArrowLeft, Heart, Shield, Flame, Zap, X, CheckCircle } from 'lucide-react';
import { AttachmentIntro } from './attachment-intro';
import { AttachmentQuestionnaire } from './attachment-questionnaire';
import { AttachmentResults } from './attachment-results';
import { useUser } from '@/providers/user-provider';

export type AttachmentStyle = 'veilig' | 'angstig' | 'vermijdend' | 'angstig_vermijdend';

export interface AssessmentData {
  assessmentId: number;
  userId?: number;
  confidence?: number;
  responses: Array<{ questionId: number; type: string; category: string; value: number; timeMs: number }>;
  primaryStyle: AttachmentStyle;
  secondaryStyle?: AttachmentStyle;
  scores: Record<AttachmentStyle, number>;
  aiInsights: {
    profiel: string;
    toekomstgerichteInterpretatie: string;
    datingVoorbeelden: string[];
    triggers: string[];
    herstelStrategieen: string[];
    microInterventies: any;
    gesprekScripts: any;
    recommendedTools: any[];
  };
}

type AssessmentStep = 'intro' | 'questionnaire' | 'results';

interface AttachmentAssessmentFlowProps {
  onClose?: () => void;
}

export function AttachmentAssessmentFlow({ onClose }: AttachmentAssessmentFlowProps = {}) {
  const { user } = useUser();
  const [currentStep, setCurrentStep] = useState<AssessmentStep>('intro');
  const [assessmentData, setAssessmentData] = useState<AssessmentData | null>(null);
  const [loading, setLoading] = useState(false);

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
      case 'intro': return 'Hechtingsstijl QuickScan';
      case 'questionnaire': return 'Vragenlijst';
      case 'results': return 'Jouw Resultaat';
      default: return '';
    }
  };

  const getStepSubtitle = () => {
    switch (currentStep) {
      case 'intro': return 'Ontdek je relatiepatronen in 3-5 minuten';
      case 'questionnaire': return 'Beantwoord de vragen eerlijk voor het beste resultaat';
      case 'results': return 'Praktische inzichten voor betere dating';
      default: return '';
    }
  };

  const handleStartAssessment = async () => {
    if (!user?.id) {
      alert('Je moet ingelogd zijn om de QuickScan te starten.');
      return;
    }

    setLoading(true);
    try {
      // For now, we'll use a simple start - in production this would include micro-intake
      const microIntake = {
        datingFase: 'ontdekken',
        laatsteRelatieRecent: false,
        stressNiveau: 3
      };

      const response = await fetch('/api/hechtingsstijl', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'start',
          userId: user.id,
          microIntake
        })
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('API error:', data);
        alert(`Fout bij starten van de QuickScan: ${data.message || data.error || 'Onbekende fout'}`);
        return;
      }

      if (data.success && data.assessmentId) {
        setAssessmentData({
          assessmentId: data.assessmentId,
          userId: user.id,
          confidence: 85, // Default confidence score
          responses: [],
          primaryStyle: 'veilig',
          scores: { veilig: 0, angstig: 0, vermijdend: 0, angstig_vermijdend: 0 },
          aiInsights: {
            profiel: '',
            toekomstgerichteInterpretatie: '',
            datingVoorbeelden: [],
            triggers: [],
            herstelStrategieen: [],
            microInterventies: {},
            gesprekScripts: {},
            recommendedTools: []
          }
        });
        setCurrentStep('questionnaire');
      } else {
        alert('Geen assessment ID ontvangen van de server.');
      }
    } catch (error: any) {
      console.error('Error starting assessment:', error);
      alert(`Fout bij starten van de QuickScan: ${error.message || 'Netwerkfout'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleQuestionnaireComplete = async (responses: Array<{ questionId: number; type: string; category: string; value: number; timeMs: number }>) => {
    if (!assessmentData) return;

    // Show loading state while processing
    setLoading(true);

    try {
      // Submit responses and get results in one API call
      const response = await fetch('/api/hechtingsstijl', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'submit',
          assessmentId: assessmentData.assessmentId,
          userId: user?.id,
          responses
        })
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('Error submitting assessment:', data);
        alert(`Fout bij verwerken van je antwoorden: ${data.message || data.error || 'Onbekende fout'}`);
        setCurrentStep('questionnaire');
        return;
      }

      console.log('Assessment results:', data);

      // Helper function to safely parse arrays
      const safeParseArray = (data: any, fallback: any[] = []) => {
        if (!data) return fallback;
        if (Array.isArray(data)) return data;
        if (typeof data === 'string') {
          try {
            return JSON.parse(data);
          } catch {
            return fallback;
          }
        }
        return fallback;
      };

      if (data.success && data.result) {
        // Get confidence score from validity data or default to 85
        const confidenceScore = data.validity?.confidenceScore || 85;

        setAssessmentData(prev => prev ? {
          ...prev,
          responses: responses as any, // Type assertion for now
          primaryStyle: data.result.primary_style,
          secondaryStyle: data.result.secondary_style,
          confidence: confidenceScore,
          scores: {
            veilig: data.result.veilig_score,
            angstig: data.result.angstig_score,
            vermijdend: data.result.vermijdend_score,
            angstig_vermijdend: data.result.angstig_vermijdend_score
          },
          aiInsights: {
            profiel: data.result.ai_profiel || 'Jouw hechtingsprofiel wordt geanalyseerd...',
            toekomstgerichteInterpretatie: data.result.toekomstgerichte_interpretatie || 'Deze analyse helpt je bewuster te daten.',
            datingVoorbeelden: safeParseArray(data.result.dating_voorbeelden, ['Voorbeeld wordt geladen...']),
            triggers: safeParseArray(data.result.triggers, ['Triggers worden geanalyseerd...']),
            herstelStrategieen: safeParseArray(data.result.herstel_strategieen, ['Strategieën worden bepaald...']),
            microInterventies: data.result.micro_interventies || {},
            gesprekScripts: data.result.gesprek_scripts || {},
            recommendedTools: safeParseArray(data.result.recommended_tools, [])
          }
        } : null);

        // Show warnings if any
        if (data.validity?.warnings && data.validity.warnings.length > 0) {
          console.warn('Validity warnings:', data.validity.warnings);
        }

        // Only move to results after data is fully processed
        setCurrentStep('results');
      } else {
        alert('Geen resultaten ontvangen van de server.');
        setCurrentStep('questionnaire');
      }
    } catch (error: any) {
      console.error('Error completing assessment:', error);
      alert(`Fout bij verwerken van je antwoorden: ${error.message || 'Netwerkfout'}`);
      // If there's an error, go back to questionnaire
      setCurrentStep('questionnaire');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToIntro = () => {
    setCurrentStep('intro');
    setAssessmentData(null);
  };

  const getStyleIcon = (style: AttachmentStyle) => {
    switch (style) {
      case 'veilig': return <Heart className="w-5 h-5 text-pink-500" />;
      case 'angstig': return <Flame className="w-5 h-5 text-pink-500" />;
      case 'vermijdend': return <Shield className="w-5 h-5 text-pink-500" />;
      case 'angstig_vermijdend': return <Zap className="w-5 h-5 text-pink-500" />;
      default: return <Sparkles className="w-5 h-5 text-pink-500" />;
    }
  };

  const getStyleColor = (style: AttachmentStyle) => {
    return 'text-pink-600 bg-pink-50 border-pink-200';
  };

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card className="bg-white border-0 shadow-sm">
        <CardContent className="p-8 relative">
          {/* Close button */}
          {onClose && (
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors group"
              aria-label="Sluiten"
            >
              <X className="w-5 h-5 text-gray-400 group-hover:text-gray-600" />
            </button>
          )}

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
            <AttachmentIntro
              onStart={handleStartAssessment}
              loading={loading}
            />
          )}

          {currentStep === 'questionnaire' && assessmentData && !loading && (
            <AttachmentQuestionnaire
              assessmentId={assessmentData.assessmentId}
              onComplete={handleQuestionnaireComplete}
              onBack={handleBackToIntro}
              loading={loading}
            />
          )}

          {/* AI Analysis Loading Screen */}
          {loading && currentStep === 'questionnaire' && (
            <div className="p-12 text-center">
              <div className="mb-8">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full animate-pulse mb-6">
                  <Sparkles className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  AI analyseert je antwoorden...
                </h3>
                <p className="text-gray-600 mb-6">
                  Dit kan 10-15 seconden duren. We maken een persoonlijk profiel voor jou.
                </p>
                <div className="max-w-md mx-auto">
                  <Progress value={66} className="h-2 mb-4" />
                  <div className="space-y-2 text-sm text-gray-500">
                    <div className="flex items-center justify-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span>Hechtingsstijl berekenen</span>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
                      <span>AI insights genereren</span>
                    </div>
                    <div className="flex items-center justify-center gap-2 opacity-50">
                      <div className="w-4 h-4 border-2 border-gray-300 rounded-full" />
                      <span>Persoonlijke adviezen maken</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentStep === 'results' && assessmentData && (
            <AttachmentResults
              data={assessmentData}
              onRestart={handleBackToIntro}
              onClose={onClose}
              styleIcon={getStyleIcon}
              styleColor={getStyleColor}
            />
          )}
        </CardContent>
      </Card>

      {/* Footer Card */}
      <Card className="bg-white border-0 shadow-sm">
        <CardContent className="p-6">
          <div className="text-center text-sm text-gray-600">
            <p className="mb-2">Deze QuickScan is geen medische diagnose maar geeft praktische inzichten voor betere dating.</p>
            <p>Alle data wordt AVG-proof opgeslagen en blijft privé.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}