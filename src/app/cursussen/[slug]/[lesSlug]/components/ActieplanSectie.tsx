'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { PrimaryButton } from '@/components/ui/button-system';
import { CheckCircle, Calendar } from 'lucide-react';

interface ActieplanSectieProps {
  sectie: any;
  isCompleted: boolean;
  onComplete: () => void;
}

export function ActieplanSectie({ sectie, isCompleted, onComplete }: ActieplanSectieProps) {
  const content = sectie.inhoud || {};
  const acties = content.acties || [];

  const [completedActions, setCompletedActions] = useState<number[]>([]);

  const handleActionToggle = (index: number) => {
    if (completedActions.includes(index)) {
      setCompletedActions(completedActions.filter(i => i !== index));
    } else {
      setCompletedActions([...completedActions, index]);
    }
  };

  const allActionsCompleted = acties.length > 0 && completedActions.length === acties.length;

  return (
    <Card className="shadow-lg border-coral-100 dark:border-gray-700 dark:bg-gray-800 hover:shadow-xl transition-shadow">
      <CardContent className="p-8">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-coral-500 to-coral-600 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{sectie.titel}</h3>
          </div>
          {isCompleted && <CheckCircle className="w-5 h-5 text-green-500" />}
        </div>

        {/* Intro text */}
        {content.intro && (
          <p className="text-gray-700 dark:text-gray-200 mb-6 leading-relaxed">{content.intro}</p>
        )}

        {/* Action items */}
        <div className="space-y-3 mb-6">
          {acties.map((actie: { tekst: string; deadline?: string }, index: number) => {
            const isActionCompleted = completedActions.includes(index);

            return (
              <div
                key={index}
                onClick={() => !isCompleted && handleActionToggle(index)}
                className={`p-5 rounded-lg border-2 transition-all cursor-pointer ${
                  isActionCompleted
                    ? 'border-green-300 bg-green-50 dark:border-green-700 dark:bg-green-900/30'
                    : 'border-gray-200 bg-white dark:border-gray-600 dark:bg-gray-700 hover:border-coral-300 dark:hover:border-coral-600 hover:shadow-md'
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Checkbox */}
                  <div className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                    isActionCompleted
                      ? 'border-green-500 bg-green-500'
                      : 'border-gray-300 dark:border-gray-500'
                  }`}>
                    {isActionCompleted && (
                      <CheckCircle className="w-4 h-4 text-white" />
                    )}
                  </div>

                  <div className="flex-1">
                    {/* Action text */}
                    <p className={`font-medium ${
                      isActionCompleted ? 'text-green-900 dark:text-green-300 line-through' : 'text-gray-900 dark:text-white'
                    }`}>
                      {actie.tekst}
                    </p>

                    {/* Deadline */}
                    {actie.deadline && (
                      <div className="flex items-center gap-2 mt-2">
                        <Calendar className="w-4 h-4 text-coral-500 dark:text-coral-400" />
                        <span className={`text-sm ${
                          isActionCompleted ? 'text-green-700 dark:text-green-400' : 'text-coral-600 dark:text-coral-400'
                        }`}>
                          {actie.deadline}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Action number */}
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-coral-100 dark:bg-coral-900/40 text-coral-600 dark:text-coral-400 flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Progress indicator */}
        {acties.length > 0 && (
          <div className="mb-6">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600 dark:text-gray-400">Voortgang</span>
              <span className="font-medium text-coral-600 dark:text-coral-400">
                {completedActions.length} / {acties.length} acties voltooid
              </span>
            </div>
            <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-coral-500 to-coral-600 transition-all duration-300"
                style={{ width: `${(completedActions.length / acties.length) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Success message */}
        {allActionsCompleted && !isCompleted && (
          <div className="p-4 rounded-lg bg-green-100 dark:bg-green-900/40 border-2 border-green-300 dark:border-green-700 mb-6">
            <p className="text-green-900 dark:text-green-300 font-semibold text-center">
              Fantastisch! Alle acties voltooid!
            </p>
          </div>
        )}

        {/* Motivation */}
        {content.motivatie && (
          <div className="mb-6 p-4 bg-coral-50 dark:bg-coral-900/30 rounded-lg border-2 border-coral-200 dark:border-coral-700">
            <p className="text-coral-900 dark:text-coral-300 font-medium text-center">
              {content.motivatie}
            </p>
          </div>
        )}

        {/* Complete button */}
        {!isCompleted && (
          <PrimaryButton
            onClick={onComplete}
            disabled={!allActionsCompleted}
            className={`w-full rounded-full shadow-lg hover:shadow-xl transition-all ${
              allActionsCompleted
                ? 'bg-coral-500 hover:bg-coral-600 text-white'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Actieplan voltooien
          </PrimaryButton>
        )}
      </CardContent>
    </Card>
  );
}
