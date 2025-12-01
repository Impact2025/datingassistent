"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useUser } from '@/providers/user-provider';
import {
  ArrowLeft,
  ArrowRight,
  Heart,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface Question {
  id: number;
  question_type: string;
  question_text: string;
  category: string;
  scenarios?: Array<{
    id: number;
    option_text: string;
    associated_readiness: string[];
  }>;
}

interface MicroIntake {
  laatsteRelatie: string;
  emotioneelHerstel: number;
  stressNiveau: number;
}

interface EmotionalReadinessQuestionnaireProps {
  onComplete: (data: any) => void;
  onBack: () => void;
}

export function EmotionalReadinessQuestionnaire({ onComplete, onBack }: EmotionalReadinessQuestionnaireProps) {
  const { user } = useUser();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<Record<number, number>>({});
  const [microIntake, setMicroIntake] = useState<MicroIntake>({
    laatsteRelatie: '',
    emotioneelHerstel: 3,
    stressNiveau: 3
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      const response = await fetch('/api/emotionele-readiness/questions');
      const data = await response.json();
      if (data.success) {
        setQuestions(data.questions.rows);
      }
    } catch (error) {
      console.error('Error fetching questions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResponse = (questionId: number, value: number) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleMicroIntakeChange = (field: keyof MicroIntake, value: string | number) => {
    setMicroIntake(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      handleSubmit();
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (!user?.id) {
      console.error('No user ID available');
      alert('Geen gebruiker ingelogd. Log eerst in.');
      return;
    }

    setSubmitting(true);
    try {
      // Start assessment
      const startResponse = await fetch('/api/emotionele-readiness', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'start',
          userId: user.id,
          microIntake
        })
      });

      const startData = await startResponse.json();

      if (!startResponse.ok) {
        throw new Error(`Start assessment failed: ${startData.error || startResponse.statusText}`);
      }

      const assessmentId = startData.assessmentId;

      // Submit responses
      const submitResponse = await fetch('/api/emotionele-readiness', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'submit',
          assessmentId,
          responses: Object.entries(responses).map(([questionId, value]) => ({
            questionId: parseInt(questionId),
            value,
            type: questions.find(q => q.id === parseInt(questionId))?.question_type || 'statement'
          })),
          microIntake
        })
      });

      const resultData = await submitResponse.json();

      if (!submitResponse.ok) {
        throw new Error(`Submit responses failed: ${resultData.error || submitResponse.statusText}`);
      }

      if (resultData.success) {
        onComplete(resultData);
      } else {
        throw new Error('Assessment submission failed');
      }
    } catch (error) {
      console.error('Error submitting assessment:', error);
      alert(`Er is een fout opgetreden: ${error instanceof Error ? error.message : 'Onbekende fout'}`);
    } finally {
      setSubmitting(false);
    }
  };

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
  const isFirstQuestion = currentQuestionIndex === 0;
  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center">
        <Card className="p-8 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-pink-200 border-t-pink-600 rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Vragen laden...</p>
        </Card>
      </div>
    );
  }

  // Micro-intake screen
  if (currentQuestionIndex === 0 && !microIntake.laatsteRelatie) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <Card className="border-2 border-pink-200 bg-white/90 backdrop-blur-sm">
              <CardHeader className="text-center">
                <CardTitle className="flex items-center justify-center gap-2 text-2xl">
                  <Heart className="w-6 h-6 text-pink-600" />
                  Voorbereiding
                </CardTitle>
                <p className="text-gray-600 mt-2">
                  Een paar snelle vragen om je resultaten persoonlijker te maken
                </p>
              </CardHeader>

              <CardContent className="space-y-6">
                <div>
                  <Label className="text-base font-semibold mb-3 block">
                    Wanneer was je laatste relatie?
                  </Label>
                  <Select
                    value={microIntake.laatsteRelatie}
                    onValueChange={(value) => handleMicroIntakeChange('laatsteRelatie', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecteer een optie" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0-6m">Minder dan 6 maanden geleden</SelectItem>
                      <SelectItem value="6-12m">6-12 maanden geleden</SelectItem>
                      <SelectItem value=">12m">Meer dan 12 maanden geleden</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-base font-semibold mb-3 block">
                    Hoe goed heb je je emotioneel hersteld van je laatste relatie? (1-5)
                  </Label>
                  <RadioGroup
                    value={microIntake.emotioneelHerstel.toString()}
                    onValueChange={(value) => handleMicroIntakeChange('emotioneelHerstel', parseInt(value))}
                    className="flex gap-4"
                  >
                    {[1, 2, 3, 4, 5].map((value) => (
                      <div key={value} className="flex items-center space-x-2">
                        <RadioGroupItem value={value.toString()} id={`herstel-${value}`} />
                        <Label htmlFor={`herstel-${value}`}>{value}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                  <p className="text-sm text-gray-500 mt-2">
                    1 = Nog veel pijn, 5 = Volledig verwerkt
                  </p>
                </div>

                <div>
                  <Label className="text-base font-semibold mb-3 block">
                    Hoe is je huidige stressniveau? (1-5)
                  </Label>
                  <RadioGroup
                    value={microIntake.stressNiveau.toString()}
                    onValueChange={(value) => handleMicroIntakeChange('stressNiveau', parseInt(value))}
                    className="flex gap-4"
                  >
                    {[1, 2, 3, 4, 5].map((value) => (
                      <div key={value} className="flex items-center space-x-2">
                        <RadioGroupItem value={value.toString()} id={`stress-${value}`} />
                        <Label htmlFor={`stress-${value}`}>{value}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                  <p className="text-sm text-gray-500 mt-2">
                    1 = Zeer relaxed, 5 = Zeer gestrest
                  </p>
                </div>

                <div className="flex gap-4 pt-4">
                  <Button variant="outline" onClick={onBack} className="flex-1">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Terug
                  </Button>
                  <Button
                    onClick={() => setCurrentQuestionIndex(1)}
                    disabled={!microIntake.laatsteRelatie}
                    className="flex-1 bg-gradient-to-r from-pink-500 to-purple-600"
                  >
                    Start Vragen
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center">
        <Card className="p-8 text-center">
          <AlertCircle className="w-8 h-8 text-red-600 mx-auto mb-4" />
          <p className="text-gray-600">Geen vragen beschikbaar</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Progress Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <Button variant="ghost" onClick={onBack} className="flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                Terug
              </Button>
              <Badge className="px-3 py-1 bg-pink-100 text-pink-800">
                {currentQuestionIndex + 1} van {questions.length}
              </Badge>
            </div>

            <Progress value={progress} className="h-2 mb-2" />
            <p className="text-sm text-gray-600 text-center">
              {Math.round(progress)}% compleet
            </p>
          </div>

          {/* Question Card */}
          <Card className="border-2 border-pink-200 bg-white/90 backdrop-blur-sm shadow-xl">
            <CardHeader>
              <CardTitle className="text-xl leading-relaxed">
                {currentQuestion.question_text}
              </CardTitle>
              {currentQuestion.category && (
                <Badge variant="outline" className="w-fit">
                  {currentQuestion.category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </Badge>
              )}
            </CardHeader>

            <CardContent className="space-y-6">
              {currentQuestion.question_type === 'scenario' && currentQuestion.scenarios ? (
                <RadioGroup
                  value={responses[currentQuestion.id]?.toString() || ''}
                  onValueChange={(value) => handleResponse(currentQuestion.id, parseInt(value))}
                  className="space-y-4"
                >
                  {currentQuestion.scenarios.map((scenario) => (
                    <div key={scenario.id} className="flex items-start space-x-3 p-4 border border-gray-200 rounded-lg hover:border-pink-300 transition-colors">
                      <RadioGroupItem
                        value={scenario.order_position.toString()}
                        id={`scenario-${scenario.id}`}
                        className="mt-1"
                      />
                      <Label
                        htmlFor={`scenario-${scenario.id}`}
                        className="flex-1 cursor-pointer leading-relaxed"
                      >
                        {scenario.option_text}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              ) : (
                <RadioGroup
                  value={responses[currentQuestion.id]?.toString() || ''}
                  onValueChange={(value) => handleResponse(currentQuestion.id, parseInt(value))}
                  className="space-y-4"
                >
                  {[
                    { value: 1, label: 'Helemaal niet eens', color: 'text-red-600' },
                    { value: 2, label: 'Niet eens', color: 'text-orange-600' },
                    { value: 3, label: 'Neutraal', color: 'text-yellow-600' },
                    { value: 4, label: 'Eens', color: 'text-blue-600' },
                    { value: 5, label: 'Helemaal eens', color: 'text-green-600' }
                  ].map((option) => (
                    <div key={option.value} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:border-pink-300 transition-colors">
                      <RadioGroupItem
                        value={option.value.toString()}
                        id={`option-${option.value}`}
                      />
                      <Label
                        htmlFor={`option-${option.value}`}
                        className={`flex-1 cursor-pointer ${option.color}`}
                      >
                        {option.label}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              )}

              {/* Navigation */}
              <div className="flex gap-4 pt-6 border-t">
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={isFirstQuestion}
                  className="flex-1"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Vorige
                </Button>

                <Button
                  onClick={handleNext}
                  disabled={!responses[currentQuestion.id] || submitting}
                  className="flex-1 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                      Verzenden...
                    </>
                  ) : isLastQuestion ? (
                    <>
                      Resultaten
                      <CheckCircle className="w-4 h-4 ml-2" />
                    </>
                  ) : (
                    <>
                      Volgende
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Tips */}
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Heart className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-blue-900 mb-1">Wees eerlijk tegen jezelf</h4>
                <p className="text-sm text-blue-800">
                  Deze scan helpt je alleen als je antwoorden oprecht zijn. Er zijn geen "verkeerde" antwoorden — alleen inzichten die je helpen groeien.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}