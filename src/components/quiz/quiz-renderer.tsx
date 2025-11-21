"use client";

import { useMemo, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import * as Lucide from 'lucide-react';

type OptionKey = 'A' | 'B' | 'C' | 'D';

export interface QuizQuestion {
  id: string;
  question: string;
  options: Record<OptionKey, string>;
  answer: OptionKey | OptionKey[]; // Can be single or multiple correct answers
  feedback: Record<OptionKey, string>;
  multipleAnswers?: boolean; // Flag to indicate if multiple answers are allowed
  isPoll?: boolean; // Flag to indicate if this is a poll/survey question (no correct answer)
}

export interface QuizData {
  title: string;
  description: string;
  questions: QuizQuestion[];
}

interface QuizRendererProps {
  quizData: QuizData;
  onFinished?: (score: number, incorrectIds: string[]) => void;
}

const SCORE_TIERS = [
  { min: 0.9, label: 'Uitstekend!', tone: 'Je hebt de stof uitstekend onder de knie. Goed gedaan!' },
  { min: 0.7, label: 'Goed bezig!', tone: 'Je kent de meeste concepten. Herhaal de punten waar je minder zeker van was.' },
  { min: 0.5, label: 'Voldoende', tone: 'Je bent op de goede weg. Besteed extra aandacht aan de onderwerpen die je miste.' },
  { min: 0, label: 'Blijf oefenen', tone: 'Geen zorgen! Herhaal de lesstof en probeer het opnieuw.' },
];

function getScoreSummary(score: number, total: number) {
  const percentage = total > 0 ? score / total : 0;
  const tier = SCORE_TIERS.find((item) => percentage >= item.min) ?? SCORE_TIERS[SCORE_TIERS.length - 1];
  return tier;
}

export function QuizRenderer({ quizData, onFinished }: QuizRendererProps) {
  const [answers, setAnswers] = useState<Record<string, OptionKey>>({});
  const [showResults, setShowResults] = useState(false);
  const [voteCounts, setVoteCounts] = useState<Record<string, Record<OptionKey, number>>>({});

  const totalQuestions = quizData.questions.length;
  const answeredCount = Object.keys(answers).length;
  const progress = totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : 0;

  // Check if all questions are polls (to hide progress bar)
  const isAllPolls = useMemo(() =>
    quizData.questions.every(q => q.isPoll === true),
    [quizData.questions]
  );

  // Initialize vote counts for poll questions
  useEffect(() => {
    const initialCounts: Record<string, Record<OptionKey, number>> = {};
    // Base vote counts for each option (A: 55, B: 43, C: 61, D: 72)
    const baseVotes: Record<OptionKey, number> = { A: 55, B: 43, C: 61, D: 72 };

    quizData.questions.forEach((question) => {
      if (question.isPoll) {
        const questionVotes: Record<OptionKey, number> = {} as Record<OptionKey, number>;
        (['A', 'B', 'C', 'D'] as OptionKey[]).forEach((key) => {
          if (question.options[key]) {
            questionVotes[key] = baseVotes[key] || 0;
          }
        });
        initialCounts[question.id] = questionVotes;
      }
    });
    setVoteCounts(initialCounts);
  }, [quizData.questions]);

  const { correctCount, incorrectQuestions } = useMemo(() => {
    let correct = 0;
    const incorrect: string[] = [];
    quizData.questions.forEach((question) => {
      const selected = answers[question.id];
      if (!selected) return;

      // Skip scoring for poll questions (they have no correct answer)
      if (question.isPoll) {
        return;
      }

      // Check if answer is correct (works for both single and multiple answers)
      const correctAnswer = question.answer;
      const isCorrect = Array.isArray(correctAnswer)
        ? selected === correctAnswer.join(',') // For multiple answers, compare sorted joined strings
        : selected === correctAnswer;

      if (isCorrect) {
        correct += 1;
      } else {
        incorrect.push(question.id);
      }
    });
    return { correctCount: correct, incorrectQuestions: incorrect };
  }, [answers, quizData.questions]);

  const summary = useMemo(() => getScoreSummary(correctCount, totalQuestions), [correctCount, totalQuestions]);

  const handleSubmit = () => {
    setShowResults(true);
    onFinished?.(correctCount, incorrectQuestions);
  };

  const resetQuiz = () => {
    setAnswers({});
    setShowResults(false);
  };

  if (totalQuestions === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Deze quiz heeft nog geen vragen.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-primary/30 bg-primary/5 p-6 shadow-sm">
        <div className="flex items-start gap-3">
          <Lucide.HelpCircle className="mt-1 h-5 w-5 text-primary" />
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-foreground">{quizData.title}</h3>
            {quizData.description && (
              <p className="mt-1 text-sm text-muted-foreground">
                {quizData.description}
              </p>
            )}
          </div>
        </div>
        {!isAllPolls && (
          <div className="mt-4">
            <Progress value={progress} className="h-2" />
            <div className="mt-2 text-xs text-muted-foreground">
              {answeredCount} / {totalQuestions} vragen beantwoord
            </div>
          </div>
        )}
      </div>

      <div className="space-y-5">
        {quizData.questions.map((question, index) => {
          const selected = answers[question.id];
          const isAnswered = Boolean(selected);
          const isCorrect = selected === question.answer;
          const isPollQuestion = question.isPoll === true;

          // Get available options (only those with content)
          const availableOptions = (['A', 'B', 'C', 'D'] as OptionKey[]).filter(
            key => question.options[key]
          );

          return (
            <Card key={question.id} className="border-border/70 bg-secondary/60">
              <CardContent className="space-y-4 p-5">
                <div className="space-y-3">
                  <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                    Vraag {index + 1}
                  </span>
                  <p className="text-base font-medium text-foreground leading-relaxed">{question.question}</p>
                </div>
                <div className="space-y-2">
                  {availableOptions.map((optionKey) => {
                    const option = question.options[optionKey];
                    const selectedThis = selected === optionKey;
                    const showFeedback = isAnswered && selectedThis && !isPollQuestion;
                    const correctOption = question.answer === optionKey;

                    return (
                      <div key={optionKey} className="space-y-2">
                        <button
                          type="button"
                          onClick={() => {
                            if (!showResults) {
                              setAnswers((prev) => {
                                const newAnswers = { ...prev, [question.id]: optionKey };
                                // If this is a poll question and wasn't answered before, increment the vote count
                                if (isPollQuestion && !prev[question.id]) {
                                  setVoteCounts((prevCounts) => ({
                                    ...prevCounts,
                                    [question.id]: {
                                      ...prevCounts[question.id],
                                      [optionKey]: (prevCounts[question.id]?.[optionKey] || 0) + 1,
                                    },
                                  }));
                                }
                                return newAnswers;
                              });
                            }
                          }}
                          className={cn(
                            'flex w-full items-start gap-3 rounded-lg border px-3 py-2 text-left text-sm transition',
                            showResults && !isPollQuestion
                              ? correctOption
                                ? 'border-green-500/70 bg-green-50/80 text-green-900'
                                : selectedThis
                                ? 'border-red-500/70 bg-red-50/80 text-red-900'
                                : 'border-border/60 bg-background'
                              : selectedThis
                              ? 'border-primary bg-primary/10 text-foreground'
                              : 'border-border/60 bg-background hover:border-primary/60'
                          )}
                          disabled={showResults}
                        >
                          <span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full border border-current text-xs font-semibold">
                            {optionKey}
                          </span>
                          <span className="flex-1">{option}</span>
                          {isPollQuestion && isAnswered && voteCounts[question.id]?.[optionKey] !== undefined && (
                            <span className="text-xs font-semibold text-primary">
                              +{voteCounts[question.id][optionKey]}
                            </span>
                          )}
                        </button>
                        {showFeedback && question.feedback[optionKey] && (
                          <div
                            className={cn(
                              'rounded-lg border px-3 py-2 text-xs leading-relaxed',
                              isCorrect
                                ? 'border-green-500/50 bg-green-50 text-green-800'
                                : 'border-amber-500/50 bg-amber-50 text-amber-800'
                            )}
                          >
                            {question.feedback[optionKey]}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {!showResults ? (
          <Button
            onClick={handleSubmit}
            disabled={answeredCount !== totalQuestions}
            className="w-full sm:w-auto"
          >
            Resultaat bekijken
          </Button>
        ) : (
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <Button onClick={resetQuiz} variant="outline" className="w-full sm:w-auto">
              Opnieuw maken
            </Button>
          </div>
        )}
        {!showResults && answeredCount !== totalQuestions && (
          <span className="text-xs text-muted-foreground">Beantwoord alle vragen om je score te zien.</span>
        )}
      </div>

      {showResults && (
        <div className="rounded-xl border border-primary/40 bg-primary/10 p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <Lucide.Star className="h-6 w-6 text-primary" />
            <div>
              <h4 className="text-lg font-semibold text-foreground">
                {summary.label} – {correctCount}/{totalQuestions} goed
              </h4>
              <p className="text-sm text-muted-foreground">{summary.tone}</p>
            </div>
          </div>
          {incorrectQuestions.length > 0 && (
            <div className="mt-4 rounded-lg bg-background/80 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Tips voor verbetering
              </p>
              <ul className="mt-2 list-disc space-y-1 pl-4 text-sm text-muted-foreground">
                {incorrectQuestions.map((id) => {
                  const question = quizData.questions.find((item) => item.id === id);
                  if (!question) return null;
                  const questionIndex = quizData.questions.indexOf(question);
                  return (
                    <li key={`hint-${id}`}>
                      Herlees vraag {questionIndex + 1} – juiste antwoord: <strong>{question.answer}: {question.options[question.answer]}</strong>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default QuizRenderer;
