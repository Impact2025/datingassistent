'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { PrimaryButton } from '@/components/ui/button-system';
import { CheckCircle, Clock } from 'lucide-react';

interface OpdrachtSectieProps {
  sectie: any;
  isCompleted: boolean;
  onComplete: () => void;
}

export function OpdrachtSectie({ sectie, isCompleted, onComplete }: OpdrachtSectieProps) {
  const content = sectie.inhoud || {};
  const stappen = content.stappen || [];

  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  const handleStepToggle = (index: number) => {
    if (completedSteps.includes(index)) {
      setCompletedSteps(completedSteps.filter(i => i !== index));
    } else {
      setCompletedSteps([...completedSteps, index]);
    }
  };

  const allStepsCompleted = stappen.length > 0 && completedSteps.length === stappen.length;

  return (
    <Card className="shadow-lg border-pink-100 hover:shadow-xl transition-shadow">
      <CardContent className="p-8">
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-xl font-semibold text-gray-900">{sectie.titel}</h3>
          {isCompleted && <CheckCircle className="w-5 h-5 text-green-500" />}
        </div>

        {/* Time duration */}
        {content.tijdsduur && (
          <div className="flex items-center gap-2 mb-4 text-sm text-gray-600">
            <Clock className="w-4 h-4" />
            <span>{content.tijdsduur}</span>
          </div>
        )}

        {/* Intro text */}
        {content.intro && (
          <p className="text-gray-700 mb-6 leading-relaxed">{content.intro}</p>
        )}

        {/* Steps/Tasks */}
        <div className="space-y-3 mb-6">
          {stappen.map((stap: string | { tekst: string; uitleg?: string }, index: number) => {
            const stepText = typeof stap === 'string' ? stap : stap.tekst;
            const stepExplanation = typeof stap === 'object' ? stap.uitleg : undefined;
            const isStepCompleted = completedSteps.includes(index);

            return (
              <div
                key={index}
                onClick={() => !isCompleted && handleStepToggle(index)}
                className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                  isStepCompleted
                    ? 'border-green-300 bg-green-50'
                    : 'border-gray-200 bg-white hover:border-pink-300'
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Checkbox */}
                  <div className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                    isStepCompleted
                      ? 'border-green-500 bg-green-500'
                      : 'border-gray-300'
                  }`}>
                    {isStepCompleted && (
                      <CheckCircle className="w-3 h-3 text-white" />
                    )}
                  </div>

                  <div className="flex-1">
                    <p className={`font-medium ${
                      isStepCompleted ? 'text-green-900 line-through' : 'text-gray-900'
                    }`}>
                      {stepText}
                    </p>
                    {stepExplanation && (
                      <p className="text-sm text-gray-600 mt-1">{stepExplanation}</p>
                    )}
                  </div>

                  {/* Step number */}
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Progress indicator */}
        {stappen.length > 0 && (
          <div className="mb-6">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600">Voortgang</span>
              <span className="font-medium text-pink-600">
                {completedSteps.length} / {stappen.length}
              </span>
            </div>
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-pink-500 to-pink-600 transition-all duration-300"
                style={{ width: `${(completedSteps.length / stappen.length) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Success message */}
        {allStepsCompleted && !isCompleted && (
          <div className="p-4 rounded-lg bg-green-100 border-2 border-green-300 mb-6">
            <p className="text-green-900 font-semibold text-center">
              🎉 Goed gedaan! Alle stappen voltooid!
            </p>
          </div>
        )}

        {/* Complete button */}
        {!isCompleted && (
          <PrimaryButton
            onClick={onComplete}
            disabled={!allStepsCompleted}
            className={`rounded-full shadow-lg hover:shadow-xl transition-all ${
              allStepsCompleted
                ? 'bg-pink-500 hover:bg-pink-600 text-white'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Opdracht voltooien
          </PrimaryButton>
        )}
      </CardContent>
    </Card>
  );
}
