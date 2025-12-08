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
    <Card className="shadow-lg border-pink-100 hover:shadow-xl transition-shadow">
      <CardContent className="p-8">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-pink-600 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900">{sectie.titel}</h3>
          </div>
          {isCompleted && <CheckCircle className="w-5 h-5 text-green-500" />}
        </div>

        {/* Intro text */}
        {content.intro && (
          <p className="text-gray-700 mb-6 leading-relaxed">{content.intro}</p>
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
                    ? 'border-green-300 bg-green-50'
                    : 'border-gray-200 bg-white hover:border-pink-300 hover:shadow-md'
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Checkbox */}
                  <div className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                    isActionCompleted
                      ? 'border-green-500 bg-green-500'
                      : 'border-gray-300'
                  }`}>
                    {isActionCompleted && (
                      <CheckCircle className="w-4 h-4 text-white" />
                    )}
                  </div>

                  <div className="flex-1">
                    {/* Action text */}
                    <p className={`font-medium ${
                      isActionCompleted ? 'text-green-900 line-through' : 'text-gray-900'
                    }`}>
                      {actie.tekst}
                    </p>

                    {/* Deadline */}
                    {actie.deadline && (
                      <div className="flex items-center gap-2 mt-2">
                        <Calendar className="w-4 h-4 text-pink-500" />
                        <span className={`text-sm ${
                          isActionCompleted ? 'text-green-700' : 'text-pink-600'
                        }`}>
                          {actie.deadline}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Action number */}
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center text-sm font-bold">
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
              <span className="text-gray-600">Voortgang</span>
              <span className="font-medium text-pink-600">
                {completedActions.length} / {acties.length} acties voltooid
              </span>
            </div>
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-pink-500 to-pink-600 transition-all duration-300"
                style={{ width: `${(completedActions.length / acties.length) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Success message */}
        {allActionsCompleted && !isCompleted && (
          <div className="p-4 rounded-lg bg-green-100 border-2 border-green-300 mb-6">
            <p className="text-green-900 font-semibold text-center">
              🎉 Fantastisch! Alle acties voltooid!
            </p>
          </div>
        )}

        {/* Motivation */}
        {content.motivatie && (
          <div className="mb-6 p-4 bg-pink-50 rounded-lg border-2 border-pink-200">
            <p className="text-pink-900 font-medium text-center">
              💪 {content.motivatie}
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
                ? 'bg-pink-500 hover:bg-pink-600 text-white'
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
