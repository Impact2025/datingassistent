'use client';

import { Card, CardContent } from '@/components/ui/card';
import { PrimaryButton } from '@/components/ui/button-system';
import { CheckCircle, Wrench } from 'lucide-react';

interface ToolSectieProps {
  sectie: any;
  isCompleted: boolean;
  onComplete: () => void;
}

export function ToolSectie({ sectie, isCompleted, onComplete }: ToolSectieProps) {
  const content = sectie.inhoud || {};

  const handleLaunchTool = () => {
    // TODO: Implement tool launching logic
    // This should open the tool in the dashboard or a modal
    console.log('Launching tool:', content.toolId);
    alert(`Tool "${content.toolId}" opening... (not yet implemented)`);
  };

  return (
    <Card className="shadow-lg border-pink-100 hover:shadow-xl transition-shadow">
      <CardContent className="p-8">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-pink-600 flex items-center justify-center">
              <Wrench className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900">{sectie.titel}</h3>
          </div>
          {isCompleted && <CheckCircle className="w-5 h-5 text-green-500" />}
        </div>

        {/* Intro text */}
        {content.introTekst && (
          <p className="text-gray-700 mb-6 leading-relaxed">{content.introTekst}</p>
        )}

        {/* Tool card */}
        <div className="mb-6 p-6 rounded-lg bg-gradient-to-r from-pink-50 to-white border-2 border-pink-200">
          <div className="text-center">
            <div className="text-4xl mb-4">🛠️</div>
            <h4 className="font-bold text-gray-900 mb-2 text-lg">
              {content.toolNaam || sectie.titel}
            </h4>
            {content.toolBeschrijving && (
              <p className="text-sm text-gray-600 mb-4">{content.toolBeschrijving}</p>
            )}
            <PrimaryButton
              onClick={handleLaunchTool}
              className="bg-pink-500 hover:bg-pink-600 text-white rounded-full shadow-lg"
            >
              {content.ctaTekst || 'Open tool'}
            </PrimaryButton>
          </div>
        </div>

        {/* Instructions */}
        {content.instructies && (
          <div className="mb-6 p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
            <h4 className="font-semibold text-blue-900 mb-2">📋 Hoe te gebruiken:</h4>
            <p className="text-sm text-blue-800 whitespace-pre-wrap">{content.instructies}</p>
          </div>
        )}

        {/* Complete button */}
        {!isCompleted && (
          <PrimaryButton
            onClick={onComplete}
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full border-2 border-gray-300"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Tool gebruikt
          </PrimaryButton>
        )}
      </CardContent>
    </Card>
  );
}
