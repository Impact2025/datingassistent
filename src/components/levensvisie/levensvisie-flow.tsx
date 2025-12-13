"use client";

/**
 * LevensvisieFlow - Life Vision & Future Compass Flow
 * Comprehensive life vision assessment with 3 phases
 */

import { useState, useEffect } from 'react';
import { useUser } from '@/providers/user-provider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  Compass,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Heart,
  Target,
  TrendingUp,
  CheckCircle,
  Save
} from 'lucide-react';

type AssessmentPhase = 'intro' | 'horizon_scan' | 'values_mapping' | 'future_partner' | 'results';

interface LevensvisieFlowProps {
  onClose?: () => void;
}

export function LevensvisieFlow({ onClose }: LevensvisieFlowProps) {
  const { user } = useUser();
  const [currentPhase, setCurrentPhase] = useState<AssessmentPhase>('intro');
  const [questions, setQuestions] = useState<any>(null);
  const [responses, setResponses] = useState<any[]>([]);
  const [assessmentId, setAssessmentId] = useState<number | null>(null);
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  useEffect(() => {
    if (currentPhase !== 'intro' && currentPhase !== 'results' && !questions) {
      loadQuestions();
    }
  }, [currentPhase, questions]);

  const loadQuestions = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/levensvisie/questions');
      if (response.ok) {
        const data = await response.json();
        setQuestions(data.questions);
      }
    } catch (error) {
      console.error('Error loading questions:', error);
    } finally {
      setLoading(false);
    }
  };

  const startAssessment = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/levensvisie', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'start',
          userId: user?.id,
          horizonScan: {}
        })
      });

      if (response.ok) {
        const data = await response.json();
        setAssessmentId(data.assessmentId);
        setCurrentPhase('horizon_scan');
      }
    } catch (error) {
      console.error('Error starting assessment:', error);
    } finally {
      setLoading(false);
    }
  };

  const submitAssessment = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/levensvisie', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'submit',
          assessmentId,
          responses
        })
      });

      if (response.ok) {
        const data = await response.json();
        setResults(data.analysis);
        setCurrentPhase('results');
      }
    } catch (error) {
      console.error('Error submitting assessment:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPhaseProgress = () => {
    switch (currentPhase) {
      case 'intro': return 0;
      case 'horizon_scan': return 25;
      case 'values_mapping': return 50;
      case 'future_partner': return 75;
      case 'results': return 100;
      default: return 0;
    }
  };

  const renderIntro = () => (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-green-50 via-blue-50 to-purple-50 border-0 shadow-sm">
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Compass className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            Levensvisie & Toekomstkompas
          </h2>
          <p className="text-gray-600 leading-relaxed max-w-xl mx-auto mb-6">
            Ontdek je toekomstvisie en creëer helderheid over wat je echt wilt in liefde en leven. Deze assessment helpt je te begrijpen welke partner echt bij je past.
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
            <span>⏱️ 10-14 minuten</span>
            <span>•</span>
            <span>3 fases</span>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-3 gap-4">
        <Card className="border-2 border-blue-200">
          <CardContent className="p-6">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-3">
              <Compass className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="font-semibold mb-2">Horizon Scan</h3>
            <p className="text-sm text-gray-600">Ontdek jouw toekomstvisie in 2-3 minuten</p>
          </CardContent>
        </Card>

        <Card className="border-2 border-purple-200">
          <CardContent className="p-6">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mb-3">
              <Target className="w-5 h-5 text-purple-600" />
            </div>
            <h3 className="font-semibold mb-2">Waarden & Richting</h3>
            <p className="text-sm text-gray-600">Breng helderheid in wat echt belangrijk is</p>
          </CardContent>
        </Card>

        <Card className="border-2 border-pink-200">
          <CardContent className="p-6">
            <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center mb-3">
              <Heart className="w-5 h-5 text-pink-600" />
            </div>
            <h3 className="font-semibold mb-2">Partner Profiel</h3>
            <p className="text-sm text-gray-600">Definieer wat je nodig hebt voor duurzame liefde</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-center">
        <Button
          onClick={startAssessment}
          disabled={loading}
          className="bg-gradient-to-r from-green-500 to-blue-600 text-white px-8 py-6 text-lg"
        >
          {loading ? 'Laden...' : (
            <>
              Start Assessment
              <ArrowRight className="w-5 h-5 ml-2" />
            </>
          )}
        </Button>
      </div>
    </div>
  );

  const renderQuestionnaire = () => {
    const currentPhaseQuestions = questions?.[currentPhase] || [];
    const currentQuestion = currentPhaseQuestions[currentQuestionIndex];

    if (!currentQuestion) {
      return (
        <div className="text-center py-8">
          <p className="text-gray-600">Vragen worden geladen...</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between mb-2">
              <Badge variant="outline">
                Vraag {currentQuestionIndex + 1} van {currentPhaseQuestions.length}
              </Badge>
              <span className="text-sm text-gray-500 capitalize">
                {currentPhase.replace('_', ' ')}
              </span>
            </div>
            <CardTitle className="text-xl">{currentQuestion.question_text}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {currentQuestion.options?.map((option: string, index: number) => (
                <Button
                  key={index}
                  variant="outline"
                  className="w-full justify-start text-left h-auto py-4 px-6 hover:bg-green-50 hover:border-green-300"
                  onClick={() => handleAnswer(currentQuestion, option, index)}
                >
                  {option}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-between">
          <Button
            variant="ghost"
            onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
            disabled={currentQuestionIndex === 0}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Vorige
          </Button>
          <Button
            variant="ghost"
            onClick={() => skipQuestion(currentQuestion)}
          >
            Overslaan
          </Button>
        </div>
      </div>
    );
  };

  const handleAnswer = (question: any, answer: string, value: number) => {
    const response = {
      questionId: question.id,
      questionType: question.question_type,
      phase: currentPhase,
      value,
      answer,
      metadata: {}
    };

    setResponses([...responses, response]);

    const currentPhaseQuestions = questions?.[currentPhase] || [];
    if (currentQuestionIndex < currentPhaseQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      moveToNextPhase();
    }
  };

  const skipQuestion = (question: any) => {
    handleAnswer(question, 'skipped', 0);
  };

  const moveToNextPhase = () => {
    setCurrentQuestionIndex(0);

    if (currentPhase === 'horizon_scan') {
      setCurrentPhase('values_mapping');
    } else if (currentPhase === 'values_mapping') {
      setCurrentPhase('future_partner');
    } else if (currentPhase === 'future_partner') {
      submitAssessment();
    }
  };

  const renderResults = () => {
    if (!results) {
      return (
        <div className="text-center py-8">
          <p className="text-gray-600">Resultaten worden verwerkt...</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Save & Close Card */}
        {onClose && (
          <Card className="border-2 border-green-200 bg-gradient-to-r from-green-50 to-emerald-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">
                      Resultaten Automatisch Opgeslagen
                    </h3>
                    <p className="text-sm text-gray-600">
                      Je resultaten zijn veilig opgeslagen en altijd terug te vinden bij "Mijn Scans"
                    </p>
                  </div>
                </div>
                <Button
                  onClick={onClose}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-6 py-3 h-auto flex items-center gap-2 shadow-sm"
                >
                  <Save className="w-4 h-4" />
                  <span className="font-semibold">Bewaar & Sluiten</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-0 shadow-sm">
          <CardContent className="p-8 text-center">
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              Je Toekomstkompas is Klaar!
            </h2>
            <p className="text-gray-600 max-w-xl mx-auto">
              Ontdek je levensvisie en wat dit betekent voor je dating journey.
            </p>
          </CardContent>
        </Card>

        {/* Levensvisie Profiel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-600" />
              Je Levensvisie Profiel
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 leading-relaxed mb-4">
              {results.levensvisieProfiel?.samenvatting}
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold mb-2">Kernwaarden</h4>
                <ul className="space-y-1">
                  {results.levensvisieProfiel?.kernwaarden?.map((waarde: string, i: number) => (
                    <li key={i} className="text-sm text-gray-600 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      {waarde}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Drijfveren</h4>
                <ul className="space-y-1">
                  {results.levensvisieProfiel?.drijfveren?.map((drijfveer: string, i: number) => (
                    <li key={i} className="text-sm text-gray-600 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-blue-500" />
                      {drijfveer}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Toekomst Partner Profiel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-pink-600" />
              Je Ideale Partner Profiel
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {results.toekomstPartnerProfiel?.map((quality: string, i: number) => (
                <li key={i} className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-pink-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">{quality}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-4">
          {onClose && (
            <Button
              onClick={onClose}
              className="flex-1 bg-gradient-to-r from-green-500 to-blue-600"
            >
              Terug naar Dashboard
            </Button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">
            {currentPhase === 'intro' && 'Introductie'}
            {currentPhase === 'horizon_scan' && 'Horizon Scan'}
            {currentPhase === 'values_mapping' && 'Waarden & Richting'}
            {currentPhase === 'future_partner' && 'Partner Profiel'}
            {currentPhase === 'results' && 'Resultaten'}
          </span>
          <span className="text-sm text-gray-500">{getPhaseProgress()}%</span>
        </div>
        <Progress value={getPhaseProgress()} className="h-2" />
      </div>

      {/* Content */}
      {currentPhase === 'intro' && renderIntro()}
      {(currentPhase === 'horizon_scan' || currentPhase === 'values_mapping' || currentPhase === 'future_partner') && renderQuestionnaire()}
      {currentPhase === 'results' && renderResults()}
    </div>
  );
}
