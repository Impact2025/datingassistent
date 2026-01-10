'use client';

import { Card, CardContent } from '@/components/ui/card';
import { PrimaryButton } from '@/components/ui/button-system';
import { CheckCircle, Lightbulb, AlertCircle, Star } from 'lucide-react';

interface KernpuntenSectieProps {
  sectie: any;
  isCompleted: boolean;
  onComplete: () => void;
}

export function KernpuntenSectie({ sectie, isCompleted, onComplete }: KernpuntenSectieProps) {
  const content = sectie.inhoud || {};
  const punten = content.punten || [];

  const getIcon = (iconName: string) => {
    const icons: Record<string, any> = {
      'sunglasses': '🕶️',
      'users': '👥',
      'image-off': '🖼️',
      'lightbulb': '💡',
      'alert': '⚠️',
      'star': '⭐',
    };
    return icons[iconName] || '•';
  };

  return (
    <Card className="shadow-lg border-pink-100 dark:border-gray-700 dark:bg-gray-800 hover:shadow-xl transition-shadow">
      <CardContent className="p-8">
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{sectie.titel}</h3>
          {isCompleted && <CheckCircle className="w-5 h-5 text-green-500" />}
        </div>

        {/* Intro text if available */}
        {content.intro && (
          <p className="text-gray-700 dark:text-gray-200 mb-6 leading-relaxed">{content.intro}</p>
        )}

        {/* Key points list */}
        <div className="space-y-4 mb-6">
          {punten.map((punt: any, index: number) => (
            <div
              key={index}
              className="p-5 rounded-lg border-2 border-pink-200 dark:border-pink-700 bg-gradient-to-r from-pink-50 to-white dark:from-pink-900/30 dark:to-gray-800 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start gap-4">
                {/* Icon */}
                {punt.icon && (
                  <div className="flex-shrink-0 text-3xl">
                    {getIcon(punt.icon)}
                  </div>
                )}

                <div className="flex-1">
                  {/* Title */}
                  {punt.titel && (
                    <h4 className="font-bold text-gray-900 dark:text-white mb-2 text-lg">
                      {punt.titel}
                    </h4>
                  )}

                  {/* Description */}
                  {punt.beschrijving && (
                    <p className="text-gray-700 dark:text-gray-200 leading-relaxed">
                      {punt.beschrijving}
                    </p>
                  )}

                  {/* Extra info if available */}
                  {punt.uitleg && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 italic">
                      {punt.uitleg}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Conclusion if available */}
        {content.conclusie && (
          <div className="p-5 rounded-lg bg-gradient-to-r from-pink-100 to-pink-200 dark:from-pink-900/40 dark:to-pink-800/40 border-2 border-pink-300 dark:border-pink-700 mb-6">
            <p className="text-gray-900 dark:text-white font-semibold leading-relaxed">
              {content.conclusie}
            </p>
          </div>
        )}

        {/* Complete button */}
        {!isCompleted && (
          <PrimaryButton
            onClick={onComplete}
            className="bg-pink-500 hover:bg-pink-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Begrepen!
          </PrimaryButton>
        )}
      </CardContent>
    </Card>
  );
}
