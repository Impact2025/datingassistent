'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, Circle, Lightbulb, Heart, Sparkles } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ReflectionQuestion {
  id: number;
  question: string;
  description: string;
  minWords: number;
  points: number;
  placeholder: string;
}

const REFLECTION_QUESTIONS: ReflectionQuestion[] = [
  {
    id: 1,
    question: 'Wanneer voelde jij je online ooit ongemakkelijk of onveilig?',
    description: 'Denk terug aan een moment waarop je intuïtie je waarschuwde',
    minWords: 50,
    points: 7,
    placeholder: 'Bijvoorbeeld: "Ik chattte met iemand die heel snel wilde afspreken en me onder druk zette..."',
  },
  {
    id: 2,
    question: 'Wat deed je intuïtie toen?',
    description: 'Welke signalen gaf je lichaam of gevoel je?',
    minWords: 30,
    points: 6,
    placeholder: 'Bijvoorbeeld: "Ik voelde een knoop in mijn maag en merkte dat ik steeds vaker twijfelde..."',
  },
  {
    id: 3,
    question: 'Hoe reageerde je toen?',
    description: 'Wat deed je in die situatie? Geen oordeel - je leert ervan!',
    minWords: 50,
    points: 7,
    placeholder: 'Bijvoorbeeld: "Ik was bang om onbeleefd te zijn, dus ik bleef chatten maar voelde me niet prettig..."',
  },
];

interface ReflectionExerciseProps {
  onComplete?: (answers: Record<number, string>, totalPoints: number) => void;
  initialAnswers?: Record<number, string>;
}

export function ReflectionExercise({ onComplete, initialAnswers = {} }: ReflectionExerciseProps) {
  const [answers, setAnswers] = useState<Record<number, string>>(initialAnswers);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [completedQuestions, setCompletedQuestions] = useState<Set<number>>(new Set());
  const [showTips, setShowTips] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const totalPoints = REFLECTION_QUESTIONS.reduce((sum, q) => sum + q.points, 0);
  const earnedPoints = Array.from(completedQuestions).reduce(
    (sum, qId) => sum + (REFLECTION_QUESTIONS.find(q => q.id === qId)?.points || 0),
    0
  );

  const question = REFLECTION_QUESTIONS[currentQuestion];
  const currentAnswer = answers[question.id] || '';
  const wordCount = currentAnswer.trim().split(/\s+/).filter(w => w.length > 0).length;
  const isValid = wordCount >= question.minWords;
  const isCompleted = completedQuestions.has(question.id);

  const handleAnswerChange = (value: string) => {
    setAnswers(prev => ({ ...prev, [question.id]: value }));
  };

  const handleNext = () => {
    if (isValid) {
      setCompletedQuestions(prev => new Set(prev).add(question.id));

      if (currentQuestion < REFLECTION_QUESTIONS.length - 1) {
        setCurrentQuestion(prev => prev + 1);
      } else {
        // All questions answered
        setSubmitted(true);
        if (onComplete) {
          onComplete(answers, totalPoints);
        }
      }
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const handleQuestionJump = (index: number) => {
    setCurrentQuestion(index);
  };

  const progressPercentage = (completedQuestions.size / REFLECTION_QUESTIONS.length) * 100;

  if (submitted) {
    return (
      <Card className="border-2 border-primary/30 bg-gradient-to-br from-primary/5 to-primary/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <CheckCircle2 className="h-8 w-8 text-green-600" />
            Geweldig! Reflectie voltooid
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center space-y-4">
            <div className="text-6xl font-bold text-primary">
              {totalPoints}
            </div>
            <p className="text-xl font-semibold">punten verdiend! 🎉</p>

            <Alert className="bg-blue-50 border-blue-200">
              <Lightbulb className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-900">
                Je antwoorden zijn opgeslagen. Aan het eind van deze module kijk je terug op je groei en inzichten!
              </AlertDescription>
            </Alert>

            <div className="mt-6 p-4 bg-background rounded-lg border">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Heart className="h-5 w-5 text-coral-500" />
                Waarom reflecteren belangrijk is
              </h4>
              <ul className="text-sm text-muted-foreground space-y-1 text-left">
                <li>✓ Je herkent patronen in je gedrag</li>
                <li>✓ Je leert vertrouwen op je intuïtie</li>
                <li>✓ Je groeit zonder jezelf te veroordelen</li>
                <li>✓ Je bent beter voorbereid voor de toekomst</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Progress */}
      <Card>
        <CardHeader>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-6 w-6 text-primary" />
                💭 Reflectie-oefening
              </CardTitle>
              <div className="text-sm font-semibold text-primary">
                {earnedPoints} / {totalPoints} punten
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>Voortgang: {completedQuestions.size} van {REFLECTION_QUESTIONS.length} vragen</span>
                <span>{Math.round(progressPercentage)}%</span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
            </div>

            {/* Question Navigator */}
            <div className="flex gap-2">
              {REFLECTION_QUESTIONS.map((q, index) => (
                <button
                  key={q.id}
                  onClick={() => handleQuestionJump(index)}
                  className={`flex-1 h-10 rounded-lg border-2 transition-all ${
                    completedQuestions.has(q.id)
                      ? 'bg-green-50 border-green-500 text-green-700'
                      : index === currentQuestion
                      ? 'bg-primary/10 border-primary text-primary'
                      : 'bg-muted border-border text-muted-foreground hover:border-primary/50'
                  }`}
                >
                  <div className="flex items-center justify-center gap-1">
                    {completedQuestions.has(q.id) ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : (
                      <Circle className="h-4 w-4" />
                    )}
                    <span className="font-semibold">{index + 1}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Current Question */}
      <Card className="border-2 border-primary/20">
        <CardHeader>
          <div className="space-y-2">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="text-sm text-muted-foreground mb-2">
                  Vraag {currentQuestion + 1} van {REFLECTION_QUESTIONS.length}
                </div>
                <CardTitle className="text-xl">{question.question}</CardTitle>
                <p className="text-sm text-muted-foreground mt-2">
                  {question.description}
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-primary">{question.points}</div>
                <div className="text-xs text-muted-foreground">punten</div>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="reflection-answer">Jouw antwoord</Label>
            <Textarea
              id="reflection-answer"
              value={currentAnswer}
              onChange={(e) => handleAnswerChange(e.target.value)}
              placeholder={question.placeholder}
              rows={8}
              className="resize-none"
            />
            <div className="flex items-center justify-between text-sm">
              <span className={wordCount >= question.minWords ? 'text-green-600' : 'text-muted-foreground'}>
                {wordCount} / {question.minWords} woorden {wordCount >= question.minWords && '✓'}
              </span>
              {!isValid && wordCount > 0 && (
                <span className="text-orange-600">
                  Nog {question.minWords - wordCount} woorden nodig
                </span>
              )}
            </div>
          </div>

          {/* Tips Toggle */}
          <button
            onClick={() => setShowTips(!showTips)}
            className="text-sm text-primary hover:underline flex items-center gap-1"
          >
            <Lightbulb className="h-4 w-4" />
            {showTips ? 'Verberg tips' : 'Hulp nodig? Bekijk tips'}
          </button>

          {showTips && (
            <Alert className="bg-blue-50 border-blue-200">
              <Lightbulb className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-sm text-blue-900 space-y-2">
                <p className="font-semibold">💡 Reflectie Tips:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li><strong>Wees eerlijk:</strong> Niemand anders ziet je antwoorden</li>
                  <li><strong>Neem de tijd:</strong> Deze vragen helpen je patronen herkennen</li>
                  <li><strong>Geen oordeel:</strong> Wat je deed was het beste wat je kon op dat moment</li>
                  <li><strong>Groei:</strong> Door te reflecteren leer je voor de toekomst</li>
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
            >
              Vorige
            </Button>

            <Button
              type="button"
              onClick={handleNext}
              disabled={!isValid}
              className="min-w-[120px]"
            >
              {currentQuestion === REFLECTION_QUESTIONS.length - 1 ? (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Voltooien
                </>
              ) : (
                'Volgende'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Encouragement Message */}
      {completedQuestions.size > 0 && !submitted && (
        <Alert className="bg-green-50 border-green-200">
          <Heart className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-900">
            Je doet het geweldig! Door eerlijk te reflecteren, groei je in zelfbewustzijn.
            {completedQuestions.size === REFLECTION_QUESTIONS.length - 1 &&
              ' Nog één vraag en je bent klaar! 🎉'}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
