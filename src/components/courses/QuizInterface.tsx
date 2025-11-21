'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LoadingSpinner } from '@/components/shared/loading-spinner';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  CheckCircle,
  XCircle,
  HelpCircle,
  Clock,
  Send,
  ArrowLeft,
  ArrowRight,
  RotateCcw,
  Trophy,
  Target
} from 'lucide-react';

interface QuizQuestion {
  id: number;
  lesson_id: number;
  question: string;
  question_type: 'multiple_choice' | 'true_false' | 'short_answer';
  position: number;
  points: number;
}

interface QuizOption {
  id: number;
  question_id: number;
  option_text: string;
  is_correct: boolean;
  position: number;
}

interface QuizResult {
  id: number;
  user_id: number;
  lesson_id: number;
  score: number;
  max_score: number;
  answers: Record<string, any>;
  completed_at: string;
}

interface QuizAttempt {
  question: QuizQuestion;
  options?: QuizOption[];
  user_answer?: any;
  is_correct?: boolean;
}

interface QuizInterfaceProps {
  lessonId: number;
  onComplete?: (result: QuizResult) => void;
  onRetry?: () => void;
  showResults?: boolean;
}

export function QuizInterface({
  lessonId,
  onComplete,
  onRetry,
  showResults = true
}: QuizInterfaceProps) {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [options, setOptions] = useState<QuizOption[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [result, setResult] = useState<QuizResult | null>(null);
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchQuizData();
  }, [lessonId]);

  const fetchQuizData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/quizzes/${lessonId}`);

      if (!response.ok) {
        throw new Error('Failed to fetch quiz questions');
      }

      const data = await response.json();
      setQuestions(data.questions || []);
      setOptions(data.options || []);

      // Check if user already completed this quiz
      const resultResponse = await fetch(`/api/quizzes/${lessonId}/submit`);
      if (resultResponse.ok) {
        const resultData = await resultResponse.json();
        if (resultData) {
          setResult(resultData);
          // Load attempts for showing results
          await loadQuizAttempts(resultData);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load quiz');
    } finally {
      setLoading(false);
    }
  };

  const loadQuizAttempts = async (quizResult: QuizResult) => {
    try {
      const attemptsData: QuizAttempt[] = questions.map(question => {
        const userAnswer = quizResult.answers?.[question.id.toString()];
        const questionOptions = options.filter(opt => opt.question_id === question.id);

        let isCorrect = false;
        if (userAnswer !== undefined) {
          isCorrect = checkAnswerCorrectness(question, userAnswer, questionOptions);
        }

        return {
          question,
          options: questionOptions,
          user_answer: userAnswer,
          is_correct: isCorrect
        };
      });

      setAttempts(attemptsData);
    } catch (err) {
      console.error('Error loading quiz attempts:', err);
    }
  };

  const checkAnswerCorrectness = (
    question: QuizQuestion,
    userAnswer: any,
    questionOptions: QuizOption[]
  ): boolean => {
    switch (question.question_type) {
      case 'multiple_choice':
      case 'true_false':
        const correctOption = questionOptions.find(opt => opt.is_correct);
        return correctOption?.id.toString() === userAnswer?.toString();

      case 'short_answer':
        // For short answers, check if any correct option matches (case insensitive)
        const correctOptions = questionOptions.filter(opt => opt.is_correct);
        const userAnswerStr = userAnswer?.toString().toLowerCase().trim();
        return correctOptions.some(opt =>
          opt.option_text.toLowerCase().trim() === userAnswerStr
        );

      default:
        return false;
    }
  };

  const handleAnswerChange = (questionId: number, answer: any) => {
    setAnswers(prev => ({
      ...prev,
      [questionId.toString()]: answer
    }));
  };

  const handleSubmitQuiz = async () => {
    if (Object.keys(answers).length !== questions.length) {
      setError('Beantwoord alle vragen voordat je de quiz indient');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`/api/quizzes/${lessonId}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ answers }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit quiz');
      }

      const quizResult = await response.json();
      setResult(quizResult);

      // Load attempts for results display
      await loadQuizAttempts(quizResult);

      if (onComplete) {
        onComplete(quizResult);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit quiz');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRetry = () => {
    setResult(null);
    setAttempts([]);
    setAnswers({});
    setCurrentQuestionIndex(0);
    setError(null);
    if (onRetry) {
      onRetry();
    }
  };

  const getQuestionTypeLabel = (type: string) => {
    switch (type) {
      case 'multiple_choice': return 'Meerkeuze';
      case 'true_false': return 'Juist/Onjuist';
      case 'short_answer': return 'Kort antwoord';
      default: return 'Vraag';
    }
  };

  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadgeColor = (percentage: number) => {
    if (percentage >= 80) return 'bg-green-100 text-green-800';
    if (percentage >= 60) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <LoadingSpinner />
          <span className="ml-3">Quiz laden...</span>
        </CardContent>
      </Card>
    );
  }

  if (questions.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <HelpCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">Geen quiz beschikbaar</h3>
          <p className="text-muted-foreground">
            Er zijn nog geen quiz vragen voor deze les.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Show results if quiz is completed
  if (result && showResults) {
    const scorePercentage = Math.round((result.score / result.max_score) * 100);

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Trophy className="h-6 w-6 text-yellow-500" />
            Quiz Resultaten
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Score Summary */}
          <div className="text-center space-y-4">
            <div className="text-4xl font-bold">
              <span className={getScoreColor(scorePercentage)}>
                {result.score}
              </span>
              <span className="text-muted-foreground">/{result.max_score}</span>
            </div>

            <Badge className={`text-lg px-4 py-2 ${getScoreBadgeColor(scorePercentage)}`}>
              {scorePercentage}% - {
                scorePercentage >= 80 ? 'Uitstekend' :
                scorePercentage >= 60 ? 'Goed' : 'Opnieuw proberen'
              }
            </Badge>

            <p className="text-muted-foreground">
              Voltooid op {new Date(result.completed_at).toLocaleDateString('nl-NL')}
            </p>
          </div>

          {/* Question Review */}
          <div className="space-y-4">
            <h4 className="font-medium">Vraag overzicht</h4>

            {attempts.map((attempt, index) => (
              <div key={attempt.question.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-medium text-muted-foreground">
                        Vraag {index + 1}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {getQuestionTypeLabel(attempt.question.question_type)}
                      </Badge>
                    </div>
                    <p className="font-medium">{attempt.question.question}</p>
                  </div>

                  <div className="flex items-center gap-1 ml-4">
                    {attempt.is_correct ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500" />
                    )}
                    <span className="text-sm font-medium">
                      {attempt.question.points} pt{attempt.question.points !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>

                {/* Show user's answer */}
                {attempt.user_answer && (
                  <div className="mb-3">
                    <Label className="text-sm font-medium">Jouw antwoord:</Label>
                    <div className={`mt-1 p-2 rounded text-sm ${
                      attempt.is_correct ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
                    }`}>
                      {attempt.question.question_type === 'multiple_choice' || attempt.question.question_type === 'true_false' ? (
                        attempt.options?.find(opt => opt.id.toString() === attempt.user_answer)?.option_text || attempt.user_answer
                      ) : (
                        attempt.user_answer
                      )}
                    </div>
                  </div>
                )}

                {/* Show correct answer if wrong */}
                {!attempt.is_correct && attempt.options && (
                  <div>
                    <Label className="text-sm font-medium">Juiste antwoord:</Label>
                    <div className="mt-1 p-2 rounded bg-green-50 text-green-800 text-sm">
                      {attempt.options.find(opt => opt.is_correct)?.option_text}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex justify-center gap-3 pt-4">
            <Button onClick={handleRetry} variant="outline" className="flex items-center gap-2">
              <RotateCcw className="h-4 w-4" />
              Opnieuw proberen
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show quiz taking interface
  const currentQuestion = questions[currentQuestionIndex];
  const currentOptions = options.filter(opt => opt.question_id === currentQuestion.id);
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Quiz
          </CardTitle>
          <Badge variant="outline">
            Vraag {currentQuestionIndex + 1} van {questions.length}
          </Badge>
        </div>

        <Progress value={progress} className="mt-4" />
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Question */}
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
              {currentQuestionIndex + 1}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary" className="text-xs">
                  {getQuestionTypeLabel(currentQuestion.question_type)}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {currentQuestion.points} punt{currentQuestion.points !== 1 ? 'en' : ''}
                </span>
              </div>
              <p className="text-lg font-medium leading-relaxed">
                {currentQuestion.question}
              </p>
            </div>
          </div>

          {/* Answer Input */}
          <div className="ml-11">
            {currentQuestion.question_type === 'multiple_choice' && currentOptions.length > 0 && (
              <RadioGroup
                value={answers[currentQuestion.id.toString()] || ''}
                onValueChange={(value) => handleAnswerChange(currentQuestion.id, value)}
              >
                {currentOptions.map((option) => (
                  <div key={option.id} className="flex items-center space-x-2">
                    <RadioGroupItem value={option.id.toString()} id={`option-${option.id}`} />
                    <Label htmlFor={`option-${option.id}`} className="flex-1 cursor-pointer">
                      {option.option_text}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            )}

            {currentQuestion.question_type === 'true_false' && (
              <RadioGroup
                value={answers[currentQuestion.id.toString()] || ''}
                onValueChange={(value) => handleAnswerChange(currentQuestion.id, value)}
              >
                {currentOptions.map((option) => (
                  <div key={option.id} className="flex items-center space-x-2">
                    <RadioGroupItem value={option.id.toString()} id={`option-${option.id}`} />
                    <Label htmlFor={`option-${option.id}`} className="cursor-pointer">
                      {option.option_text}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            )}

            {currentQuestion.question_type === 'short_answer' && (
              <div className="space-y-2">
                <Label htmlFor="short-answer">Jouw antwoord</Label>
                <Textarea
                  id="short-answer"
                  placeholder="Typ hier je antwoord..."
                  value={answers[currentQuestion.id.toString()] || ''}
                  onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                  className="min-h-[100px]"
                />
              </div>
            )}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between pt-4 border-t">
          <Button
            variant="outline"
            onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
            disabled={currentQuestionIndex === 0}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Vorige
          </Button>

          <div className="text-sm text-muted-foreground">
            {Object.keys(answers).length} van {questions.length} vragen beantwoord
          </div>

          {currentQuestionIndex < questions.length - 1 ? (
            <Button
              onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
              className="flex items-center gap-2"
            >
              Volgende
              <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmitQuiz}
              disabled={submitting || Object.keys(answers).length !== questions.length}
              className="flex items-center gap-2"
            >
              {submitting ? <LoadingSpinner /> : <Send className="h-4 w-4" />}
              Indienen
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}