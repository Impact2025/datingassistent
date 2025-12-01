"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowRight, ArrowLeft, Clock, Plus, X } from 'lucide-react';

interface Question {
  id: number;
  question_type: 'statement' | 'scenario';
  question_text: string;
  category: string;
  is_reverse_scored: boolean;
  weight: number;
  order_position: number;
  scenarios: Array<{
    id: number;
    text: string;
    styles: string[];
    weight: number;
    order: number;
  }>;
}

interface RelatiepatronenQuestionnaireProps {
  assessmentId: number;
  onComplete: (responses: Array<{ questionId: number; value: number; timeMs: number }>, timeline?: Array<{entry: string, order: number}>) => void;
  onBack: () => void;
  loading: boolean;
}

export function RelatiepatronenQuestionnaire({
  assessmentId,
  onComplete,
  onBack,
  loading
}: RelatiepatronenQuestionnaireProps) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<Record<number, { value: number; timeMs: number; startTime: number }>>({});
  const [timeline, setTimeline] = useState<Array<{entry: string, order: number}>>([]);
  const [showTimeline, setShowTimeline] = useState(false);
  const [loadingQuestions, setLoadingQuestions] = useState(true);

  // Load questions
  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    try {
      const response = await fetch('/api/relatiepatronen/questions');
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

  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  const handleResponse = (value: number) => {
    if (!currentQuestion) return;

    const startTime = responses[currentQuestion.id]?.startTime || Date.now();
    const timeMs = Date.now() - startTime;

    setResponses(prev => ({
      ...prev,
      [currentQuestion.id]: { value, timeMs, startTime }
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      // Complete assessment
      const responseArray = Object.entries(responses).map(([questionId, data]) => ({
        questionId: parseInt(questionId),
        value: data.value,
        timeMs: data.timeMs
      }));

      onComplete(responseArray, timeline.length > 0 ? timeline : undefined);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const addTimelineEntry = () => {
    setTimeline(prev => [...prev, { entry: '', order: prev.length + 1 }]);
  };

  const updateTimelineEntry = (index: number, entry: string) => {
    setTimeline(prev => prev.map((item, i) =>
      i === index ? { ...item, entry } : item
    ));
  };

  const removeTimelineEntry = (index: number) => {
    setTimeline(prev => prev.filter((_, i) => i !== index).map((item, i) => ({ ...item, order: i + 1 })));
  };

  const canProceed = currentQuestion && (
    currentQuestion.question_type === 'statement'
      ? responses[currentQuestion.id]?.value !== undefined
      : responses[currentQuestion.id]?.value !== undefined
  );

  if (loadingQuestions) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500 mx-auto mb-4"></div>
        <p className="text-gray-600">Vragen laden...</p>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-600">Geen vragen beschikbaar</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Progress */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">
            Vraag {currentQuestionIndex + 1} van {questions.length}
          </span>
          <span className="text-sm text-gray-500">
            {Math.round(progress)}% compleet
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-pink-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      {/* Question Card */}
      <Card className="mb-8">
        <CardContent className="p-8">
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-pink-100 rounded-lg flex items-center justify-center">
                <span className="text-sm font-semibold text-pink-600">
                  {currentQuestionIndex + 1}
                </span>
              </div>
              <span className="text-sm text-gray-500 uppercase tracking-wide">
                {currentQuestion.question_type === 'statement' ? 'Statement' : 'Scenario'}
              </span>
            </div>

            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              {currentQuestion.question_text}
            </h2>
          </div>

          {/* Response Options */}
          {currentQuestion.question_type === 'statement' ? (
            <div className="space-y-4">
              <p className="text-sm text-gray-600 mb-4">
                Geef aan in hoeverre deze uitspraak op jou van toepassing is:
              </p>

              <RadioGroup
                value={responses[currentQuestion.id]?.value?.toString()}
                onValueChange={(value) => handleResponse(parseInt(value))}
                className="space-y-3"
              >
                <div className="flex items-center space-x-3">
                  <RadioGroupItem value="1" id="option-1" />
                  <Label htmlFor="option-1" className="flex-1 cursor-pointer">
                    <span className="font-medium">Helemaal niet van toepassing</span>
                  </Label>
                </div>

                <div className="flex items-center space-x-3">
                  <RadioGroupItem value="2" id="option-2" />
                  <Label htmlFor="option-2" className="flex-1 cursor-pointer">
                    <span className="font-medium">Niet van toepassing</span>
                  </Label>
                </div>

                <div className="flex items-center space-x-3">
                  <RadioGroupItem value="3" id="option-3" />
                  <Label htmlFor="option-3" className="flex-1 cursor-pointer">
                    <span className="font-medium">Neutraal</span>
                  </Label>
                </div>

                <div className="flex items-center space-x-3">
                  <RadioGroupItem value="4" id="option-4" />
                  <Label htmlFor="option-4" className="flex-1 cursor-pointer">
                    <span className="font-medium">Van toepassing</span>
                  </Label>
                </div>

                <div className="flex items-center space-x-3">
                  <RadioGroupItem value="5" id="option-5" />
                  <Label htmlFor="option-5" className="flex-1 cursor-pointer">
                    <span className="font-medium">Helemaal van toepassing</span>
                  </Label>
                </div>
              </RadioGroup>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-gray-600 mb-4">
                Kies de optie die het beste bij jou past:
              </p>

              <RadioGroup
                value={responses[currentQuestion.id]?.value?.toString()}
                onValueChange={(value) => handleResponse(parseInt(value))}
                className="space-y-3"
              >
                {currentQuestion.scenarios.map((scenario) => (
                  <div key={scenario.id} className="flex items-start space-x-3">
                    <RadioGroupItem value={scenario.order.toString()} id={`scenario-${scenario.id}`} className="mt-1" />
                    <Label htmlFor={`scenario-${scenario.id}`} className="flex-1 cursor-pointer">
                      <span className="font-medium">{scenario.text}</span>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Optional Timeline Section */}
      {isLastQuestion && (
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">
                Optioneel: Relatie timeline
              </h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowTimeline(!showTimeline)}
              >
                {showTimeline ? 'Verbergen' : 'Toevoegen'}
              </Button>
            </div>

            {showTimeline && (
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  Noteer kort 1-3 patronen die je steeds terugziet (max 3 regels per entry).
                  Dit helpt de AI voor meer gepersonaliseerde inzichten.
                </p>

                {timeline.map((item, index) => (
                  <div key={index} className="flex gap-2">
                    <Textarea
                      placeholder={`Patroon ${index + 1}...`}
                      value={item.entry}
                      onChange={(e) => updateTimelineEntry(index, e.target.value)}
                      className="flex-1"
                      rows={2}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeTimelineEntry(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}

                {timeline.length < 3 && (
                  <Button
                    variant="outline"
                    onClick={addTimelineEntry}
                    className="w-full"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Patroon toevoegen
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={currentQuestionIndex === 0 ? onBack : handlePrevious}
          disabled={loading}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          {currentQuestionIndex === 0 ? 'Terug naar start' : 'Vorige'}
        </Button>

        <Button
          onClick={handleNext}
          disabled={!canProceed || loading}
          className="bg-pink-500 hover:bg-pink-600"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Verwerken...
            </>
          ) : isLastQuestion ? (
            <>
              Resultaat Bekijken
              <ArrowRight className="w-4 h-4 ml-2" />
            </>
          ) : (
            <>
              Volgende
              <ArrowRight className="w-4 h-4 ml-2" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}