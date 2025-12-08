'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { PrimaryButton } from '@/components/ui/button-system';
import { CheckCircle, MessageSquare } from 'lucide-react';

interface ReflectieSectieProps {
  sectie: any;
  isCompleted: boolean;
  onComplete: () => void;
}

export function ReflectieSectie({ sectie, isCompleted, onComplete }: ReflectieSectieProps) {
  const content = sectie.inhoud || {};
  const vragen = content.vragen || [];

  const [answers, setAnswers] = useState<Record<number, string>>({});

  const handleAnswerChange = (index: number, value: string) => {
    setAnswers({ ...answers, [index]: value });
  };

  const allAnswered = vragen.length > 0 && vragen.every((_: any, i: number) => answers[i]?.trim().length > 0);

  return (
    <Card className="shadow-lg border-pink-100 hover:shadow-xl transition-shadow">
      <CardContent className="p-8">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-pink-600 flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900">{sectie.titel}</h3>
          </div>
          {isCompleted && <CheckCircle className="w-5 h-5 text-green-500" />}
        </div>

        {/* Intro text */}
        {content.intro && (
          <p className="text-gray-700 mb-6 leading-relaxed">{content.intro}</p>
        )}

        {/* Questions */}
        <div className="space-y-6 mb-6">
          {vragen.map((vraag: string, index: number) => (
            <div key={index} className="space-y-3">
              <label className="block">
                <span className="text-gray-900 font-medium flex items-center gap-2">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </span>
                  {vraag}
                </span>
                <textarea
                  value={answers[index] || ''}
                  onChange={(e) => handleAnswerChange(index, e.target.value)}
                  disabled={isCompleted}
                  className="mt-3 w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-pink-500 focus:ring-2 focus:ring-pink-200 transition-all resize-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                  rows={4}
                  placeholder={isCompleted ? 'Al ingevuld' : 'Schrijf je antwoord hier...'}
                />
              </label>
            </div>
          ))}
        </div>

        {/* AI Analysis notice */}
        {content.aiAnalyse && (
          <div className="p-4 rounded-lg bg-blue-50 border-2 border-blue-200 mb-6">
            <p className="text-sm text-blue-900 flex items-center gap-2">
              <span className="text-xl">🤖</span>
              <span>
                Je antwoorden worden opgeslagen en kunnen worden gebruikt voor gepersonaliseerde feedback.
              </span>
            </p>
          </div>
        )}

        {/* Progress indicator */}
        {vragen.length > 0 && (
          <div className="mb-6">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600">Beantwoorde vragen</span>
              <span className="font-medium text-pink-600">
                {Object.keys(answers).filter(k => answers[parseInt(k)]?.trim().length > 0).length} / {vragen.length}
              </span>
            </div>
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-pink-500 to-pink-600 transition-all duration-300"
                style={{
                  width: `${(Object.keys(answers).filter(k => answers[parseInt(k)]?.trim().length > 0).length / vragen.length) * 100}%`
                }}
              />
            </div>
          </div>
        )}

        {/* Complete button */}
        {!isCompleted && (
          <PrimaryButton
            onClick={onComplete}
            disabled={!allAnswered}
            className={`rounded-full shadow-lg hover:shadow-xl transition-all ${
              allAnswered
                ? 'bg-pink-500 hover:bg-pink-600 text-white'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Reflectie voltooien
          </PrimaryButton>
        )}
      </CardContent>
    </Card>
  );
}
