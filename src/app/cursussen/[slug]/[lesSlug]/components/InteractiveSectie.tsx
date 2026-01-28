'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { PrimaryButton } from '@/components/ui/button-system';
import { CheckCircle } from 'lucide-react';

/**
 * InteractiveSectie Component
 *
 * Handles interactive sectie types:
 * - zelfreflectie: Self-reflection with yes/no questions and scoring
 * - check-in: Check-in questions with quotes
 * - reflectie: Reflection prompts
 *
 * Features:
 * - Yes/No questions with tracking
 * - Score calculation and interpretation
 * - Visual feedback for selected answers
 */

interface InteractiveSectieProps {
  sectie: any;
  isCompleted: boolean;
  onComplete: () => void;
}

export function InteractiveSectie({ sectie, isCompleted, onComplete }: InteractiveSectieProps) {
  const content = sectie.inhoud || {};

  // State for answers
  const [answers, setAnswers] = useState<Record<number, boolean>>({});
  const [showResult, setShowResult] = useState(false);

  const vragen = content.vragen || [];
  const interpretatie = content.interpretatie || {};

  // Calculate score
  const yesCount = Object.values(answers).filter(v => v === true).length;

  // Get interpretation based on score
  const getInterpretation = () => {
    const scoreKey = Object.keys(interpretatie).find(key => {
      const range = key.split('-').map(Number);
      if (range.length === 2) {
        return yesCount >= range[0] && yesCount <= range[1];
      }
      return false;
    });
    return scoreKey ? interpretatie[scoreKey] : null;
  };

  const handleAnswer = (idx: number, answer: boolean) => {
    if (isCompleted) return;
    setAnswers(prev => ({ ...prev, [idx]: answer }));
  };

  const handleShowResult = () => {
    setShowResult(true);
  };

  return (
    <Card className="shadow-lg border-coral-100 dark:border-gray-700 dark:bg-gray-800 hover:shadow-xl transition-shadow">
      <CardContent className="p-8">
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{sectie.titel}</h3>
          {isCompleted && <CheckCircle className="w-5 h-5 text-green-500" />}
        </div>

        {/* Intro */}
        {content.intro && (
          <p className="text-gray-700 dark:text-gray-200 mb-6 leading-relaxed">{content.intro}</p>
        )}

        {/* Questions */}
        <div className="space-y-4 mb-6">
          {vragen.map((vraagItem: any, idx: number) => {
            const isAnswered = answers.hasOwnProperty(idx);
            const answer = answers[idx];

            return (
              <div
                key={idx}
                className={`p-5 rounded-lg border-2 transition-all ${
                  isAnswered
                    ? answer
                      ? 'border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/30'
                      : 'border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-900/30'
                    : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700'
                }`}
              >
                <p className="text-gray-900 dark:text-white font-medium mb-3">{vraagItem.vraag}</p>

                {/* Yes/No buttons */}
                {!isCompleted && (
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleAnswer(idx, true)}
                      className={`flex-1 py-2 px-4 rounded-lg border-2 font-medium transition-all ${
                        answer === true
                          ? 'border-amber-500 bg-amber-500 text-white'
                          : 'border-gray-300 dark:border-gray-500 bg-white dark:bg-gray-600 text-gray-700 dark:text-gray-200 hover:border-amber-300 hover:bg-amber-50 dark:hover:bg-amber-900/30'
                      }`}
                    >
                      Ja
                    </button>
                    <button
                      onClick={() => handleAnswer(idx, false)}
                      className={`flex-1 py-2 px-4 rounded-lg border-2 font-medium transition-all ${
                        answer === false
                          ? 'border-green-500 bg-green-500 text-white'
                          : 'border-gray-300 dark:border-gray-500 bg-white dark:bg-gray-600 text-gray-700 dark:text-gray-200 hover:border-green-300 hover:bg-green-50 dark:hover:bg-green-900/30'
                      }`}
                    >
                      Nee
                    </button>
                  </div>
                )}

                {/* Show meaning if answered "Ja" and result is shown */}
                {showResult && answer === true && vraagItem.ja_betekent && (
                  <div className="mt-3 p-3 bg-amber-100 dark:bg-amber-900/40 rounded border border-amber-300 dark:border-amber-700">
                    <p className="text-xs font-semibold text-amber-900 dark:text-amber-300 mb-1">Dit betekent:</p>
                    <p className="text-sm text-amber-800 dark:text-amber-200">{vraagItem.ja_betekent}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Show result button */}
        {!showResult && Object.keys(answers).length === vragen.length && !isCompleted && (
          <div className="mb-6">
            <PrimaryButton
              onClick={handleShowResult}
              className="bg-coral-500 hover:bg-coral-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all"
            >
              Bekijk Resultaat
            </PrimaryButton>
          </div>
        )}

        {/* Result and interpretation */}
        {showResult && (
          <div className="space-y-4 mb-6">
            {/* Score */}
            <div className="p-5 rounded-lg bg-gradient-to-r from-coral-100 to-coral-200 dark:from-coral-900/40 dark:to-coral-800/40 border-2 border-coral-300 dark:border-coral-700">
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">Je score:</p>
              <p className="text-3xl font-bold text-coral-600 dark:text-coral-400 mb-1">
                {yesCount} / {vragen.length}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {yesCount === 1 ? '1 "ja" antwoord' : `${yesCount} "ja" antwoorden`}
              </p>
            </div>

            {/* Interpretation */}
            {interpretatie && getInterpretation() && (
              <div className="p-5 rounded-lg bg-white dark:bg-gray-700 border-2 border-coral-200 dark:border-coral-700">
                <p className="text-sm font-semibold text-coral-900 dark:text-coral-300 mb-2">Wat dit betekent:</p>
                <p className="text-gray-800 dark:text-gray-200 leading-relaxed">{getInterpretation()}</p>
              </div>
            )}
          </div>
        )}

        {/* Complete button */}
        {showResult && !isCompleted && (
          <PrimaryButton
            onClick={onComplete}
            className="bg-coral-500 hover:bg-coral-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Check voltooid!
          </PrimaryButton>
        )}
      </CardContent>
    </Card>
  );
}
