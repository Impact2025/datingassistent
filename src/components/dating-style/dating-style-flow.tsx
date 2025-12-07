"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Sparkles, ArrowRight, ArrowLeft, Heart, Shield, Flame, Zap, Target, User, MessageCircle } from 'lucide-react';
import { DatingStyleIntro } from './dating-style-intro';
import { DatingStyleQuestionnaire } from './dating-style-questionnaire';
import { DatingStyleResults } from './dating-style-results';
import { useUser } from '@/providers/user-provider';

export type DatingStyle = 'initiator' | 'planner' | 'adventurer' | 'pleaser' | 'selector' | 'distant' | 'over_sharer' | 'ghost_prone';

export interface AssessmentData {
  assessmentId: number;
  responses: Array<{ questionId: number; value: number; timeMs: number }>;
  primaryStyle: DatingStyle;
  secondaryStyles: Array<{style: DatingStyle, percentage: number}>;
  scores: Record<DatingStyle, number>;
  blindspotIndex: number;
  confidence: number;
  aiInsights: {
    headline: string;
    oneLiner: string;
    strongPoints: string[];
    blindSpots: string[];
    chatScripts: {
      openers: string[];
      boundaries: string[];
      followups: string[];
    };
    microExercises: Array<{
      title: string;
      description: string;
      duration: number;
    }>;
    matchFilters: {
      values: string[];
      behaviors: string[];
    };
    recommendedDates: string[];
    avoidDates: string[];
  };
}

type AssessmentStep = 'intro' | 'questionnaire' | 'results';

export function DatingStyleFlow() {
  const { user } = useUser();
  const [currentStep, setCurrentStep] = useState<AssessmentStep>('intro');
  const [assessmentData, setAssessmentData] = useState<AssessmentData | null>(null);
  const [loading, setLoading] = useState(false);
  const [progressData, setProgressData] = useState<{
    hasAssessment: boolean;
    canRetake: boolean;
    totalAssessments: number;
    nextRetakeDate?: string;
  } | null>(null);

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
      case 'intro': return 'Datingstijl & Blinde Vlek Scan';
      case 'questionnaire': return 'Vragenlijst';
      case 'results': return 'Jouw Resultaat';
      default: return '';
    }
  };

  const getStepSubtitle = () => {
    switch (currentStep) {
      case 'intro': return 'Ontdek je datingstijl en blinde vlekken in 3-6 minuten';
      case 'questionnaire': return 'Beantwoord eerlijk voor het beste inzicht';
      case 'results': return 'Praktische inzichten voor betere dating';
      default: return '';
    }
  };

  // Load progress data on mount
  useEffect(() => {
    if (user?.id) {
      loadProgressData();
    }
  }, [user?.id]);

  const loadProgressData = async () => {
    try {
      const response = await fetch('/api/dating-style', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('datespark_auth_token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setProgressData({
          hasAssessment: data.hasAssessment || false,
          canRetake: data.progress?.canRetake || true,
          totalAssessments: data.progress?.totalAssessments || 0,
          nextRetakeDate: data.progress?.nextRetakeDate
        });
      }
    } catch (error) {
      console.error('Error loading progress data:', error);
    }
  };

  const handleStartAssessment = async () => {
    if (!user?.id) {
      alert('Je moet ingelogd zijn om de scan te starten.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/dating-style', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('datespark_auth_token')}`
        },
        body: JSON.stringify({
          userId: user.id,
          action: 'start'
        })
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('API error:', data);
        alert(`Fout bij starten van de scan: ${data.message || data.error || 'Onbekende fout'}`);
        return;
      }

      if (data.assessment?.id) {
        setAssessmentData({
          assessmentId: data.assessment.id,
          responses: [],
          primaryStyle: 'initiator',
          secondaryStyles: [],
          scores: {
            initiator: 0, planner: 0, adventurer: 0, pleaser: 0,
            selector: 0, distant: 0, over_sharer: 0, ghost_prone: 0
          },
          blindspotIndex: 0,
          confidence: 0,
          aiInsights: {
            headline: '',
            oneLiner: '',
            strongPoints: [],
            blindSpots: [],
            chatScripts: { openers: [], boundaries: [], followups: [] },
            microExercises: [],
            matchFilters: { values: [], behaviors: [] },
            recommendedDates: [],
            avoidDates: []
          }
        });
        setCurrentStep('questionnaire');
      } else {
        alert('Geen assessment ID ontvangen van de server.');
      }
    } catch (error: any) {
      console.error('Error starting assessment:', error);
      alert(`Fout bij starten van de scan: ${error.message || 'Netwerkfout'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleQuestionnaireComplete = async (responses: Array<{ questionId: number; value: number; timeMs: number }>) => {
    if (!assessmentData) return;

    setCurrentStep('results');
    setLoading(true);

    try {
      const resultsResponse = await fetch('/api/dating-style/results', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('datespark_auth_token')}`
        },
        body: JSON.stringify({
          assessmentId: assessmentData.assessmentId,
          userId: user?.id,
          responses: responses
        })
      });

      const resultsData = await resultsResponse.json();

      if (!resultsResponse.ok) {
        console.error('Error submitting assessment:', resultsData);
        alert(`Fout bij verwerken van je antwoorden: ${resultsData.message || resultsData.error || 'Onbekende fout'}`);
        setCurrentStep('questionnaire');
        return;
      }

      if (resultsData.result) {
        setAssessmentData(prev => prev ? {
          ...prev,
          responses,
          primaryStyle: resultsData.result.primary_style as DatingStyle,
          secondaryStyles: resultsData.result.secondary_styles || [],
          scores: {
            initiator: resultsData.result.initiator_score,
            planner: resultsData.result.planner_score,
            adventurer: resultsData.result.adventurer_score,
            pleaser: resultsData.result.pleaser_score,
            selector: resultsData.result.selector_score,
            distant: resultsData.result.distant_score,
            over_sharer: resultsData.result.over_sharer_score,
            ghost_prone: resultsData.result.ghost_prone_score
          },
          blindspotIndex: resultsData.result.blindspot_index,
          confidence: resultsData.confidence,
          aiInsights: resultsData.aiInsights
        } : null);
      } else {
        alert('Geen resultaten ontvangen van de server.');
        setCurrentStep('questionnaire');
      }
    } catch (error: any) {
      console.error('Error completing assessment:', error);
      alert(`Fout bij verwerken van je antwoorden: ${error.message || 'Netwerkfout'}`);
      setCurrentStep('questionnaire');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToIntro = () => {
    setCurrentStep('intro');
    setAssessmentData(null);
  };

  const getStyleIcon = (style: DatingStyle) => {
    switch (style) {
      case 'initiator': return <Zap className="w-5 h-5 text-pink-500" />;
      case 'planner': return <Target className="w-5 h-5 text-pink-500" />;
      case 'adventurer': return <Flame className="w-5 h-5 text-pink-500" />;
      case 'pleaser': return <Heart className="w-5 h-5 text-pink-500" />;
      case 'selector': return <Shield className="w-5 h-5 text-pink-500" />;
      case 'distant': return <User className="w-5 h-5 text-pink-500" />;
      case 'over_sharer': return <MessageCircle className="w-5 h-5 text-pink-500" />;
      case 'ghost_prone': return <Sparkles className="w-5 h-5 text-pink-500" />;
      default: return <Sparkles className="w-5 h-5 text-pink-500" />;
    }
  };

  const getStyleColor = (style: DatingStyle) => {
    return 'text-pink-600 bg-pink-50 border-pink-200';
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
            <DatingStyleIntro
              onStart={handleStartAssessment}
              loading={loading}
              hasPreviousAssessment={progressData?.hasAssessment || false}
              canRetake={progressData?.canRetake || true}
              totalAssessments={progressData?.totalAssessments || 0}
              nextRetakeDate={progressData?.nextRetakeDate}
            />
          )}

          {currentStep === 'questionnaire' && assessmentData && (
            <DatingStyleQuestionnaire
              assessmentId={assessmentData.assessmentId}
              onComplete={handleQuestionnaireComplete}
              onBack={handleBackToIntro}
              loading={loading}
            />
          )}

          {currentStep === 'results' && assessmentData && (
            <DatingStyleResults
              data={assessmentData}
              onRestart={handleBackToIntro}
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
            <p className="mb-2">Deze scan geeft praktische inzichten voor betere dating, geen medische diagnose.</p>
            <p>Alle data wordt AVG-proof opgeslagen en blijft privé.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}