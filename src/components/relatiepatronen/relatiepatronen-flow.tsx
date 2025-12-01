"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Sparkles, ArrowRight, ArrowLeft, Heart, Shield, Flame, Zap, Target, User, MessageCircle } from 'lucide-react';
import { RelatiepatronenIntro } from './relatiepatronen-intro';
import { RelatiepatronenQuestionnaire } from './relatiepatronen-questionnaire';
import { RelatiepatronenResults } from './relatiepatronen-results';
import { useUser } from '@/providers/user-provider';

export type RelationshipPattern =
  'idealize' | 'avoid_conflict' | 'rebound' | 'sabotage' |
  'boundary_deficit' | 'role_expectation' | 'unavailable_preference' | 'validation_seeking';

export interface AssessmentData {
  assessmentId: number;
  userId?: string | number;
  responses: Array<{ questionId: number; value: number; timeMs: number }>;
  primaryPattern: RelationshipPattern;
  secondaryPatterns: Array<{pattern: RelationshipPattern, percentage: number}>;
  scores: Record<RelationshipPattern, number>;
  blindspotIndex: number;
  confidence: number;
  timeline?: Array<{entry: string, order: number}>;
  aiInsights: {
    headline: string;
    oneLiner: string;
    patternExamples: string[];
    triggers: string[];
    microInterventions: Array<{
      title: string;
      description: string;
      duration: number;
    }>;
    conversationScripts: {
      boundary: string;
      checkIn: string;
      postDate: string;
    };
    stopStartActions: {
      stop: string[];
      start: string[];
    };
    recommendedTools: Array<{
      name: string;
      url: string;
      reason: string;
    }>;
  };
}

type AssessmentStep = 'intro' | 'questionnaire' | 'results';

export function RelatiepatronenFlow() {
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
      case 'intro': return 'Relatiepatronen Reflectie';
      case 'questionnaire': return 'Vragenlijst';
      case 'results': return 'Jouw Resultaat';
      default: return '';
    }
  };

  const getStepSubtitle = () => {
    switch (currentStep) {
      case 'intro': return 'Ontdek je terugkerende relatiepatronen — 4–7 minuten';
      case 'questionnaire': return 'Beantwoord eerlijk voor het beste inzicht';
      case 'results': return 'Praktische inzichten voor betere relaties';
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
      const response = await fetch('/api/relatiepatronen', {
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
    if (!user?.id) return;

    setLoading(true);
    try {
      const response = await fetch('/api/relatiepatronen', {
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

      if (response.ok) {
        const data = await response.json();
        setAssessmentData({
          assessmentId: data.assessment.id,
          userId: user?.id,
          responses: [],
          primaryPattern: 'idealize',
          secondaryPatterns: [],
          scores: {
            idealize: 0, avoid_conflict: 0, rebound: 0, sabotage: 0,
            boundary_deficit: 0, role_expectation: 0, unavailable_preference: 0, validation_seeking: 0
          },
          blindspotIndex: 0,
          confidence: 0,
          aiInsights: {
            headline: '',
            oneLiner: '',
            patternExamples: [],
            triggers: [],
            microInterventions: [],
            conversationScripts: { boundary: '', checkIn: '', postDate: '' },
            stopStartActions: { stop: [], start: [] },
            recommendedTools: []
          }
        });
        setCurrentStep('questionnaire');
      }
    } catch (error) {
      console.error('Error starting assessment:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleQuestionnaireComplete = async (
    responses: Array<{ questionId: number; value: number; timeMs: number }>,
    timeline?: Array<{entry: string, order: number}>
  ) => {
    if (!assessmentData) return;

    setCurrentStep('results');
    setLoading(true);

    try {
      const resultsResponse = await fetch('/api/relatiepatronen/results', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('datespark_auth_token')}`
        },
        body: JSON.stringify({
          assessmentId: assessmentData.assessmentId,
          userId: user?.id,
          responses: responses,
          timeline: timeline
        })
      });

      if (resultsResponse.ok) {
        const resultsData = await resultsResponse.json();
        setAssessmentData(prev => prev ? {
          ...prev,
          responses,
          timeline,
          primaryPattern: resultsData.result.primary_pattern as RelationshipPattern,
          secondaryPatterns: resultsData.result.secondary_patterns || [],
          scores: {
            idealize: resultsData.result.idealize_score,
            avoid_conflict: resultsData.result.avoid_conflict_score,
            rebound: resultsData.result.rebound_score,
            sabotage: resultsData.result.sabotage_score,
            boundary_deficit: resultsData.result.boundary_deficit_score,
            role_expectation: resultsData.result.role_expectation_score,
            unavailable_preference: resultsData.result.unavailable_preference_score,
            validation_seeking: resultsData.result.validation_seeking_score
          },
          blindspotIndex: resultsData.result.blindspot_index,
          confidence: resultsData.confidence,
          aiInsights: resultsData.aiInsights
        } : null);
      }
    } catch (error) {
      console.error('Error completing assessment:', error);
      setCurrentStep('questionnaire');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToIntro = () => {
    setCurrentStep('intro');
    setAssessmentData(null);
  };

  const getPatternIcon = (pattern: RelationshipPattern) => {
    switch (pattern) {
      case 'idealize': return <Sparkles className="w-5 h-5 text-pink-500" />;
      case 'avoid_conflict': return <Shield className="w-5 h-5 text-pink-500" />;
      case 'rebound': return <Zap className="w-5 h-5 text-pink-500" />;
      case 'sabotage': return <Flame className="w-5 h-5 text-pink-500" />;
      case 'boundary_deficit': return <Target className="w-5 h-5 text-pink-500" />;
      case 'role_expectation': return <User className="w-5 h-5 text-pink-500" />;
      case 'unavailable_preference': return <Heart className="w-5 h-5 text-pink-500" />;
      case 'validation_seeking': return <MessageCircle className="w-5 h-5 text-pink-500" />;
      default: return <Sparkles className="w-5 h-5 text-pink-500" />;
    }
  };

  const getPatternColor = (pattern: RelationshipPattern) => {
    return 'text-pink-600 bg-pink-50 border-pink-200';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header Card */}
        <Card className="bg-white border-0 shadow-sm mb-8">
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
              <RelatiepatronenIntro
                onStart={handleStartAssessment}
                loading={loading}
                hasPreviousAssessment={progressData?.hasAssessment || false}
                canRetake={progressData?.canRetake || true}
                totalAssessments={progressData?.totalAssessments || 0}
                nextRetakeDate={progressData?.nextRetakeDate}
              />
            )}

            {currentStep === 'questionnaire' && assessmentData && (
              <RelatiepatronenQuestionnaire
                assessmentId={assessmentData.assessmentId}
                onComplete={handleQuestionnaireComplete}
                onBack={handleBackToIntro}
                loading={loading}
              />
            )}

            {currentStep === 'results' && assessmentData && (
              <RelatiepatronenResults
                data={assessmentData}
                onRestart={handleBackToIntro}
                patternIcon={getPatternIcon}
                patternColor={getPatternColor}
              />
            )}
          </CardContent>
        </Card>

        {/* Footer Card */}
        <Card className="bg-white border-0 shadow-sm mt-8">
          <CardContent className="p-6">
            <div className="text-center text-sm text-gray-600">
              <p className="mb-2">Deze reflectie geeft inzichten voor zelfbewustzijn, geen diagnose.</p>
              <p>Alle data wordt AVG-proof opgeslagen en blijft privé.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}