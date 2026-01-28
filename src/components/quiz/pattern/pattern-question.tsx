'use client';

/**
 * Pattern Quiz Question Component - Brand Style (Pink Minimalist)
 */

import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
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

  const handleOptionClick = (value: string) => {
    onAnswer(value);
    setTimeout(() => onNext(), 300);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Progress bar */}
      <div className="h-1 bg-gray-100">
        <motion.div
          className="h-full bg-coral-500"
          initial={{ width: 0 }}
          animate={{ width: `${progressPercentage}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="max-w-xl w-full">
          {/* Question number */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-2"
          >
            <span className="text-sm text-gray-400">
              {question.id} / {TOTAL_QUESTIONS}
            </span>
          </motion.div>

          {/* Question */}
          <motion.h2
            key={question.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl sm:text-3xl font-bold text-gray-900 mb-8 leading-snug"
          >
            {question.question}
          </motion.h2>

          {/* Options */}
          <div className="space-y-3">
            {question.options.map((option, index) => {
              const isSelected = currentAnswer === option.value;
              return (
                <motion.button
                  key={option.value}
                  onClick={() => handleOptionClick(option.value)}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                    isSelected
                      ? 'border-coral-500 bg-coral-50'
                      : 'border-gray-200 hover:border-coral-300'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${
                        isSelected
                          ? 'border-coral-500 bg-coral-500'
                          : 'border-gray-300'
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3 text-white" />}
                    </div>
                    <div>
                      <span className="text-gray-900 font-medium">
                        {option.label}
                      </span>
                      {option.description && (
                        <p className="text-sm text-gray-500 mt-0.5">
                          {option.description}
                        </p>
                      )}
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="border-t border-gray-100 px-4 py-4">
        <div className="max-w-xl mx-auto flex justify-between">
          <button
            onClick={onBack}
            disabled={!canGoBack}
            className="flex items-center gap-2 px-4 py-2 text-gray-500 hover:text-gray-900 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Vorige</span>
          </button>

          <button
            onClick={onNext}
            disabled={!currentAnswer}
            className="flex items-center gap-2 px-4 py-2 text-coral-500 hover:text-coral-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <span className="text-sm">Volgende</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
