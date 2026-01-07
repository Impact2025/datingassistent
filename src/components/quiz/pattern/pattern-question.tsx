'use client';

/**
 * Pattern Quiz Question Component
 *
 * Displays a single quiz question with animated options.
 */

import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, CheckCircle } from 'lucide-react';
import type { PatternQuestion } from '@/lib/quiz/pattern/pattern-types';
import { TOTAL_QUESTIONS } from '@/lib/quiz/pattern/pattern-questions';

interface PatternQuestionProps {
  question: PatternQuestion;
  currentAnswer: string | null;
  onAnswer: (value: string) => void;
  onNext: () => void;
  onBack: () => void;
  canGoBack: boolean;
}

export function PatternQuestionComponent({
  question,
  currentAnswer,
  onAnswer,
  onNext,
  onBack,
  canGoBack,
}: PatternQuestionProps) {
  const progressPercentage = (question.id / TOTAL_QUESTIONS) * 100;
  const Icon = question.icon;

  const handleOptionClick = (value: string) => {
    onAnswer(value);
    // Auto-advance after short delay
    setTimeout(() => {
      onNext();
    }, 400);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-pink-25 to-white flex items-center justify-center p-4">
      <div className="max-w-2xl w-full space-y-6">
        {/* Progress */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-2"
        >
          <div className="flex justify-between text-sm text-gray-600">
            <span>
              Vraag {question.id} van {TOTAL_QUESTIONS}
            </span>
            <span>{Math.round(progressPercentage)}%</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </motion.div>

        {/* Question Card */}
        <motion.div
          key={question.id}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="border-2 border-pink-200 shadow-xl">
            <CardContent className="p-6 sm:p-8">
              <div className="space-y-6">
                {/* Question Header */}
                <div className="text-center space-y-3">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto rounded-full bg-gradient-to-br from-pink-500 to-pink-600 flex items-center justify-center shadow-lg">
                    <Icon className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                    {question.question}
                  </h2>
                  {question.description && (
                    <p className="text-gray-600 text-sm sm:text-base">
                      {question.description}
                    </p>
                  )}
                </div>

                {/* Options */}
                <div className="space-y-3">
                  {question.options.map((option) => {
                    const isSelected = currentAnswer === option.value;
                    return (
                      <button
                        key={option.value}
                        onClick={() => handleOptionClick(option.value)}
                        className={`w-full p-4 rounded-xl border-2 text-left transition-all duration-200 hover:border-pink-300 hover:bg-pink-50 ${
                          isSelected
                            ? 'border-pink-500 bg-pink-50 shadow-md ring-2 ring-pink-500/20'
                            : 'border-gray-200 bg-white hover:shadow-sm'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ${
                              isSelected
                                ? 'border-pink-500 bg-pink-500'
                                : 'border-gray-300'
                            }`}
                          >
                            {isSelected && (
                              <CheckCircle className="w-4 h-4 text-white" />
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="font-semibold text-gray-900 text-sm sm:text-base">
                              {option.label}
                            </div>
                            {option.description && (
                              <div className="text-xs sm:text-sm text-gray-500 mt-1">
                                {option.description}
                              </div>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Navigation */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex justify-between"
        >
          <Button
            variant="ghost"
            onClick={onBack}
            disabled={!canGoBack}
            className="text-gray-600"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Vorige
          </Button>

          <Button
            variant="ghost"
            onClick={onNext}
            disabled={!currentAnswer}
            className="text-pink-600"
          >
            Volgende
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </motion.div>

        {/* Phase Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center"
        >
          <span
            className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
              question.phase === 'opening'
                ? 'bg-blue-100 text-blue-700'
                : question.phase === 'middle'
                  ? 'bg-pink-100 text-pink-700'
                  : 'bg-green-100 text-green-700'
            }`}
          >
            {question.phase === 'opening'
              ? 'Kennismaking'
              : question.phase === 'middle'
                ? 'Patroon Analyse'
                : 'Afsluiting'}
          </span>
        </motion.div>
      </div>
    </div>
  );
}
