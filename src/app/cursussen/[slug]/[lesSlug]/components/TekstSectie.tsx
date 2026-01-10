'use client';

import { Card, CardContent } from '@/components/ui/card';
import { PrimaryButton } from '@/components/ui/button-system';
import { CheckCircle } from 'lucide-react';

interface TekstSectieProps {
  sectie: any;
  isCompleted: boolean;
  onComplete: () => void;
}

export function TekstSectie({ sectie, isCompleted, onComplete }: TekstSectieProps) {
  const content = sectie.inhoud || {};

  return (
    <Card className="shadow-lg border-pink-100 dark:border-gray-700 dark:bg-gray-800 hover:shadow-xl transition-shadow">
      <CardContent className="p-8">
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{sectie.titel}</h3>
          {isCompleted && <CheckCircle className="w-5 h-5 text-green-500" />}
        </div>

        {/* Body text */}
        {content.body && (
          <div className="prose prose-lg dark:prose-invert max-w-none">
            <p className="text-gray-700 dark:text-gray-200 leading-relaxed whitespace-pre-wrap">{content.body}</p>
          </div>
        )}

        {/* Complete button */}
        {!isCompleted && (
          <div className="mt-6">
            <PrimaryButton
              onClick={onComplete}
              className="bg-pink-500 hover:bg-pink-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Gelezen!
            </PrimaryButton>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
