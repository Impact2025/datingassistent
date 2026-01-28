'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { IrisInlineFeedback } from '@/components/iris/IrisInlineFeedback';
import { CheckCircle, Send } from 'lucide-react';

interface Oefening {
  id: number;
  titel: string;
  beschrijving: string;
  type: 'tekst' | 'selectie' | 'schaal' | 'ranking' | 'quiz';
  config: any;
  irisContext: string;
}

interface OefeningSectionProps {
  oefening: Oefening;
  isActive: boolean;
  isCompleted: boolean;
  onComplete: () => void;
  moduleSlug: string;
  lesSlug: string;
}

export function OefeningSection({
  oefening,
  isActive,
  isCompleted,
  onComplete,
  moduleSlug,
  lesSlug
}: OefeningSectionProps) {
  const [antwoord, setAntwoord] = useState('');
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
            setAntwoord(existing.answer);
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

  const handleSubmit = async () => {
    if (!antwoord.trim()) return;

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('datespark_auth_token');
      if (!token) {
        throw new Error('Niet ingelogd. Log in om je antwoorden op te slaan.');
      }

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
          answer: antwoord,
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
        answer: antwoord,
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

  if (!isActive && !isCompleted) return null;

  return (
    <Card className={`transition-all duration-300 ${
      isActive ? 'ring-2 ring-coral-500 shadow-lg' : ''
    }`}>
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          {/* Status indicator */}
          <div className="flex-shrink-0 mt-1">
            {isCompleted ? (
              <CheckCircle className="w-6 h-6 text-green-500" />
            ) : (
              <div className="w-6 h-6 rounded-full border-2 border-coral-500" />
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {oefening.titel}
            </h3>
            <p className="text-gray-600 mb-4">
              {oefening.beschrijving}
            </p>

            {/* Input field */}
            {oefening.type === 'tekst' && (
              <div className="space-y-4">
                <Textarea
                  value={antwoord}
                  onChange={(e) => setAntwoord(e.target.value)}
                  placeholder={oefening.config.placeholder}
                  disabled={isCompleted}
                  showCount={true}
                  maxLength={oefening.config.maxLength}
                />

                {!isCompleted && (
                  <Button
                    onClick={handleSubmit}
                    disabled={!antwoord.trim() || isSubmitting}
                    className="w-full"
                  >
                    {isSubmitting ? (
                      'Versturen...'
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Verstuur voor feedback
                      </>
                    )}
                  </Button>
                )}
              </div>
            )}

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