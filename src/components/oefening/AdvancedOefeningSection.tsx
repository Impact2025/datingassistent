'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Send } from 'lucide-react';
import { IrisInlineFeedback } from '@/components/iris/IrisInlineFeedback';

// Import the complex components
import { PsychometricTest } from '@/components/cursus/PsychometricTest';
import { MultiScaleTest } from '@/components/cursus/MultiScaleTest';
import { PilarenScore } from '@/components/cursus/PilarenScore';
import { Ranking } from '@/components/cursus/Ranking';
import { KernkwaliteitenSelector } from '@/components/cursus/KernkwaliteitenSelector';

interface AdvancedOefening {
  id: number;
  titel: string;
  beschrijving: string;
  type: 'psychometric-test' | 'multi-scale-test' | 'pilaren-score' | 'ranking' | 'kernkwaliteiten-selector' | 'strategy-planning';
  config: any;
  irisContext: string;
}

interface AdvancedOefeningSectionProps {
  oefening: AdvancedOefening;
  isActive: boolean;
  isCompleted: boolean;
  onComplete: () => void;
  moduleSlug: string;
  lesSlug: string;
}

export function AdvancedOefeningSection({
  oefening,
  isActive,
  isCompleted,
  onComplete,
  moduleSlug,
  lesSlug
}: AdvancedOefeningSectionProps) {
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [existingAnswer, setExistingAnswer] = useState<any>(null);

  // Load existing answer on mount
  useEffect(() => {
    const loadExistingAnswer = async () => {
      try {
        const token = localStorage.getItem('datespark_auth_token');
        if (!token) return;

        const response = await fetch(`/api/cursus/answer?moduleSlug=${moduleSlug}&lesSlug=${lesSlug}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          const existing = data.answers.find((a: any) => a.exerciseId === oefening.id);
          if (existing) {
            setFeedback(existing.feedback);
            setExistingAnswer(existing);
          }
        }
      } catch (error) {
        console.error('Error loading existing answer:', error);
      }
    };

    if (isActive) {
      loadExistingAnswer();
    }
  }, [isActive, moduleSlug, lesSlug, oefening.id]);

  const handleOefeningComplete = async (resultaten: any) => {
    if (isCompleted) return;

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('datespark_auth_token');
      if (!token) {
        throw new Error('Niet ingelogd. Log in om je antwoorden op te slaan.');
      }

      // Convert resultaten to string for storage
      const answerText = JSON.stringify(resultaten);

      const response = await fetch('/api/cursus/answer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          moduleSlug,
          lesSlug,
          exerciseId: oefening.id,
          answer: answerText,
          answerType: oefening.type
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save answer');
      }

      const data = await response.json();
      setFeedback(data.feedback);
      setExistingAnswer({
        exerciseId: oefening.id,
        answer: answerText,
        feedback: data.feedback,
        score: data.score,
        submittedAt: new Date()
      });
      onComplete();
    } catch (error) {
      console.error('Error saving answer:', error);
      setFeedback('Er ging iets mis bij het opslaan van je antwoord. Probeer het opnieuw.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderOefeningComponent = () => {
    switch (oefening.type) {
      case 'psychometric-test':
        return (
          <PsychometricTest
            titel={oefening.titel}
            beschrijving={oefening.beschrijving}
            vragen={oefening.config.vragen}
            irisContext={oefening.irisContext}
            onComplete={handleOefeningComplete}
            onPrevious={() => {}}
          />
        );

      case 'multi-scale-test':
        return (
          <MultiScaleTest
            titel={oefening.titel}
            beschrijving={oefening.beschrijving}
            vragen={oefening.config.vragen}
            antwoordOpties={oefening.config.antwoordOpties}
            irisContext={oefening.irisContext}
            onComplete={handleOefeningComplete}
            onPrevious={() => {}}
          />
        );

      case 'pilaren-score':
        return (
          <PilarenScore
            titel={oefening.titel}
            beschrijving={oefening.beschrijving}
            pilaren={oefening.config.pilaren}
            irisContext={oefening.irisContext}
            onComplete={handleOefeningComplete}
            onPrevious={() => {}}
          />
        );

      case 'ranking':
        return (
          <Ranking
            titel={oefening.titel}
            beschrijving={oefening.beschrijving}
            items={oefening.config.items}
            irisContext={oefening.irisContext}
            onComplete={handleOefeningComplete}
            onPrevious={() => {}}
          />
        );

      case 'kernkwaliteiten-selector':
        return (
          <KernkwaliteitenSelector
            titel={oefening.titel}
            beschrijving={oefening.beschrijving}
            presetItems={oefening.config.presetItems}
            categorieën={oefening.config.categorieën}
            validatie={oefening.config.validatie}
            irisContext={oefening.irisContext}
            onComplete={handleOefeningComplete}
            onPrevious={() => {}}
          />
        );

      case 'strategy-planning':
        // For now, return a placeholder - we'll implement this later
        return (
          <Card>
            <CardContent className="p-6 text-center">
              <h3 className="text-lg font-semibold mb-2">{oefening.titel}</h3>
              <p className="text-gray-600 mb-4">{oefening.beschrijving}</p>
              <p className="text-sm text-gray-500">Strategy planning component komt binnenkort beschikbaar.</p>
              <Button
                onClick={() => handleOefeningComplete({ strategy: 'placeholder' })}
                className="mt-4"
              >
                <Send className="w-4 h-4 mr-2" />
                Opslaan
              </Button>
            </CardContent>
          </Card>
        );

      default:
        return (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-gray-500">Onbekend oefening type: {oefening.type}</p>
            </CardContent>
          </Card>
        );
    }
  };

  if (!isActive && !isCompleted) return null;

  return (
    <Card className={`transition-all duration-300 ${
      isActive ? 'ring-2 ring-pink-500 shadow-lg' : ''
    }`}>
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          {/* Status indicator */}
          <div className="flex-shrink-0 mt-1">
            {isCompleted ? (
              <CheckCircle className="w-6 h-6 text-green-500" />
            ) : (
              <div className="w-6 h-6 rounded-full border-2 border-pink-500" />
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {renderOefeningComponent()}

            {/* Iris feedback */}
            <IrisInlineFeedback
              feedback={feedback}
              isLoading={isSubmitting}
            />

            {isCompleted && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-800">
                  ✅ Oefening voltooid! Je inzichten zijn opgeslagen.
                </p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}