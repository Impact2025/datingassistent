"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, ArrowRight, Clock } from 'lucide-react';

interface Question {
  id: number;
  question_type: string;
  question_text: string;
  category: string;
  order_position: number;
  scenarios?: Array<{
    id: number;
    option_text: string;
    associated_styles: string[];
    weight: number;
    order_position: number;
  }>;
}

interface AttachmentQuestionnaireProps {
  assessmentId: number;
  onComplete: (responses: Array<{ questionId: number; type: string; category: string; value: number; timeMs: number }>) => void;
  onBack: () => void;
  loading: boolean;
}

export function AttachmentQuestionnaire({
  assessmentId,
  onComplete,
  onBack,
  loading
}: AttachmentQuestionnaireProps) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<Record<number, { value: number; timeMs: number; type: string; category: string }>>({});
  const [questionStartTime, setQuestionStartTime] = useState<number>(Date.now());
  const [loadingQuestions, setLoadingQuestions] = useState(true);

  // Load questions
  useEffect(() => {
    const loadQuestions = async () => {
      try {
        const response = await fetch('/api/hechtingsstijl/questions');
        if (response.ok) {
          const data = await response.json();
          setQuestions(data.questions);
        }
      } catch (error) {
        console.error('Error loading questions:', error);
      } finally {
        setLoadingQuestions(false);
      }
    };

    loadQuestions();
  }, []);

  // Reset timer when question changes
  useEffect(() => {
    setQuestionStartTime(Date.now());
  }, [currentQuestionIndex]);

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  const isFirstQuestion = currentQuestionIndex === 0;

  const handleAnswer = (value: number) => {
    if (!currentQuestion) return;

    const timeMs = Date.now() - questionStartTime;

    // Store response with full question metadata
    setResponses(prev => ({
      ...prev,
      [currentQuestion.id]: {
        value,
        timeMs,
        type: currentQuestion.question_type,
        category: currentQuestion.category
      }
    }));

    // Auto-advance after a brief delay for better UX
    setTimeout(() => {
      if (isLastQuestion) {
        // Complete assessment - use stored metadata from each response
        const finalResponses = Object.entries(responses).map(([questionId, data]) => ({
          questionId: parseInt(questionId),
          type: data.type,
          category: data.category,
          value: data.value,
          timeMs: data.timeMs
        }));

        // Add current question response
        finalResponses.push({
          questionId: currentQuestion.id,
          type: currentQuestion.question_type,
          category: currentQuestion.category,
          value,
          timeMs
        });

        onComplete(finalResponses);
      } else {
        setCurrentQuestionIndex(prev => prev + 1);
      }
    }, 300);
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleSkip = () => {
    if (!currentQuestion) return;

    const timeMs = Date.now() - questionStartTime;

    // Store neutral response with full metadata
    setResponses(prev => ({
      ...prev,
      [currentQuestion.id]: {
        value: 3,
        timeMs,
        type: currentQuestion.question_type,
        category: currentQuestion.category
      }
    }));

    if (isLastQuestion) {
      // Use stored metadata from each response
      const finalResponses = Object.entries(responses).map(([questionId, data]) => ({
        questionId: parseInt(questionId),
        type: data.type,
        category: data.category,
        value: data.value,
        timeMs: data.timeMs
      }));
      finalResponses.push({
        questionId: currentQuestion.id,
        type: currentQuestion.question_type,
        category: currentQuestion.category,
        value: 3,
        timeMs
      });
      onComplete(finalResponses);
    } else {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  if (loadingQuestions) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Vragen laden...</p>
        </div>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-600">Geen vragen beschikbaar.</p>
      </div>
    );
  }

  return (
    <div className="min-h-[600px] flex flex-col">
      {/* Progress Header */}
      <div className="px-6 py-4 border-b border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-gray-700">
            Vraag {currentQuestionIndex + 1} van {questions.length}
          </span>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Clock className="w-4 h-4" />
            <span>Neem je tijd</span>
          </div>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Question Content */}
      <div className="flex-1 px-6 py-8">
        <div className="max-w-2xl mx-auto">
          <Card className="border-0 shadow-sm bg-gradient-to-br from-white to-gray-50">
            <CardContent className="p-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-pink-100 to-pink-200 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-2xl font-bold text-pink-600">
                    {currentQuestionIndex + 1}
                  </span>
                </div>

                <h2 className="text-xl font-semibold text-gray-900 mb-8 leading-relaxed">
                  {currentQuestion.question_text}
                </h2>

                {/* Conditional rendering: Scenario vs Likert Scale */}
                {currentQuestion.question_type === 'scenario' && currentQuestion.scenarios ? (
                  /* Scenario Options */
                  <div className="space-y-3">
                    {currentQuestion.scenarios.map((scenario, index) => (
                      <button
                        key={scenario.id}
                        onClick={() => handleAnswer(index + 1)}
                        disabled={loading}
                        className="w-full p-4 text-left rounded-xl border-2 border-gray-200 hover:border-pink-300 hover:bg-pink-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-sm font-semibold text-pink-600">{index + 1}</span>
                          </div>
                          <p className="text-gray-700 leading-relaxed">{scenario.option_text}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  /* Likert Scale for statements */
                  <div className="space-y-4">
                    <div className="grid grid-cols-5 gap-3 mb-6">
                      {[1, 2, 3, 4, 5].map((value) => (
                        <button
                          key={value}
                          onClick={() => handleAnswer(value)}
                          disabled={loading}
                          className="aspect-square rounded-xl border-2 border-gray-200 hover:border-pink-300 hover:bg-pink-50 transition-all duration-200 flex items-center justify-center text-lg font-semibold text-gray-700 hover:text-pink-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {value}
                        </button>
                      ))}
                    </div>

                    <div className="flex justify-between text-sm text-gray-500 px-2">
                      <span>Helemaal<br />oneens</span>
                      <span className="text-center">Neutraal</span>
                      <span className="text-right">Helemaal<br />eens</span>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Skip option */}
          <div className="text-center mt-6">
            <button
              onClick={handleSkip}
              disabled={loading}
              className="text-sm text-gray-500 hover:text-gray-700 underline disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Vraag overslaan
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Footer */}
      <div className="px-6 py-4 border-t border-gray-100 bg-gray-50">
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          <Button
            variant="outline"
            onClick={isFirstQuestion ? onBack : handlePrevious}
            disabled={loading}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            {isFirstQuestion ? 'Terug naar start' : 'Vorige'}
          </Button>

          <div className="text-sm text-gray-500">
            {Object.keys(responses).length + (responses[currentQuestion.id] ? 1 : 0)} van {questions.length} beantwoord
          </div>

          <div className="w-24"></div> {/* Spacer for balance */}
        </div>
      </div>

      {/* Loading overlay with animated steps */}
      {loading && (
        <div className="absolute inset-0 bg-white/95 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="text-center max-w-md px-6">
            <div className="relative mb-6">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-pink-500 mx-auto"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="animate-pulse text-2xl">💭</div>
              </div>
            </div>

            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Jouw Profiel Wordt Geanalyseerd
            </h3>

            <div className="space-y-2 text-sm text-gray-600">
              <p className="flex items-center justify-center gap-2">
                <span className="inline-block w-2 h-2 bg-pink-500 rounded-full animate-pulse"></span>
                Antwoorden verwerken
              </p>
              <p className="flex items-center justify-center gap-2">
                <span className="inline-block w-2 h-2 bg-pink-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></span>
                Hechtingsstijl berekenen
              </p>
              <p className="flex items-center justify-center gap-2">
                <span className="inline-block w-2 h-2 bg-pink-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></span>
                AI inzichten genereren
              </p>
            </div>

            <p className="text-xs text-gray-500 mt-4">
              Dit kan 10-15 seconden duren...
            </p>
          </div>
        </div>
      )}
    </div>
  );
}