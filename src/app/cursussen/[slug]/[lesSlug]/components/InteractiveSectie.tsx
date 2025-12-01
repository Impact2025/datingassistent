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
    <Card className="shadow-lg border-pink-100 hover:shadow-xl transition-shadow">
      <CardContent className="p-8">
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-xl font-semibold text-gray-900">{sectie.titel}</h3>
          {isCompleted && <CheckCircle className="w-5 h-5 text-green-500" />}
        </div>

        {/* Intro */}
        {content.intro && (
          <p className="text-gray-700 mb-6 leading-relaxed">{content.intro}</p>
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
                      ? 'border-amber-300 bg-amber-50'
                      : 'border-green-300 bg-green-50'
                    : 'border-gray-200 bg-white'
                }`}
              >
                <p className="text-gray-900 font-medium mb-3">{vraagItem.vraag}</p>

                {/* Yes/No buttons */}
                {!isCompleted && (
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleAnswer(idx, true)}
                      className={`flex-1 py-2 px-4 rounded-lg border-2 font-medium transition-all ${
                        answer === true
                          ? 'border-amber-500 bg-amber-500 text-white'
                          : 'border-gray-300 bg-white text-gray-700 hover:border-amber-300 hover:bg-amber-50'
                      }`}
                    >
                      Ja
                    </button>
                    <button
                      onClick={() => handleAnswer(idx, false)}
                      className={`flex-1 py-2 px-4 rounded-lg border-2 font-medium transition-all ${
                        answer === false
                          ? 'border-green-500 bg-green-500 text-white'
                          : 'border-gray-300 bg-white text-gray-700 hover:border-green-300 hover:bg-green-50'
                      }`}
                    >
                      Nee
                    </button>
                  </div>
                )}

                {/* Show meaning if answered "Ja" and result is shown */}
                {showResult && answer === true && vraagItem.ja_betekent && (
                  <div className="mt-3 p-3 bg-amber-100 rounded border border-amber-300">
                    <p className="text-xs font-semibold text-amber-900 mb-1">Dit betekent:</p>
                    <p className="text-sm text-amber-800">{vraagItem.ja_betekent}</p>
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
              className="bg-pink-500 hover:bg-pink-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all"
            >
              Bekijk Resultaat
            </PrimaryButton>
          </div>
        )}

        {/* Result and interpretation */}
        {showResult && (
          <div className="space-y-4 mb-6">
            {/* Score */}
            <div className="p-5 rounded-lg bg-gradient-to-r from-pink-100 to-purple-100 border-2 border-pink-300">
              <p className="text-sm text-gray-700 mb-2">Je score:</p>
              <p className="text-3xl font-bold text-pink-600 mb-1">
                {yesCount} / {vragen.length}
              </p>
              <p className="text-sm text-gray-600">
                {yesCount === 1 ? '1 "ja" antwoord' : `${yesCount} "ja" antwoorden`}
              </p>
            </div>

            {/* Interpretation */}
            {interpretatie && getInterpretation() && (
              <div className="p-5 rounded-lg bg-white border-2 border-pink-200">
                <p className="text-sm font-semibold text-pink-900 mb-2">Wat dit betekent:</p>
                <p className="text-gray-800 leading-relaxed">{getInterpretation()}</p>
              </div>
            )}
          </div>
        )}

        {/* Complete button */}
        {showResult && !isCompleted && (
          <PrimaryButton
            onClick={onComplete}
            className="bg-pink-500 hover:bg-pink-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Check voltooid!
          </PrimaryButton>
        )}
      </CardContent>
    </Card>
  );
}
