'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@/providers/user-provider';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import * as Lucide from 'lucide-react';

interface AuthenticityAnswers {
  coreValues: string;
  uniqueTraits: string;
  relationshipGoals: string;
  personalBoundaries: string;
  growthAreas: string;
}

const LESSON_ID = 901; // Module: Zelfkennis - Het Fundament van Authenticiteit

const REFLECTION_QUESTIONS = [
  {
    id: 'coreValues',
    question: 'Wat zijn je kernwaarden in relaties?',
    description: 'Welke principes zijn voor jou essentieel in een relatie? (bijv. vertrouwen, respect, avontuur, stabiliteit)',
    placeholder: 'Bijvoorbeeld: "Voor mij zijn vertrouwen en open communicatie essentieel. Ik waardeer partners die eerlijk zijn over hun gevoelens..."'
  },
  {
    id: 'uniqueTraits',
    question: 'Wat maakt jou uniek in de dating wereld?',
    description: 'Welke eigenschappen, ervaringen of perspectieven heb je die je onderscheiden van anderen?',
    placeholder: 'Bijvoorbeeld: "Door mijn reizen heb ik een unieke kijk op verschillende culturen. Ik spreek drie talen en heb daardoor..."'
  },
  {
    id: 'relationshipGoals',
    question: 'Wat zoek je echt in een relatie?',
    description: 'Niet wat je denkt dat je zou moeten willen, maar wat je diep van binnen voelt dat je nodig hebt.',
    placeholder: 'Bijvoorbeeld: "Ik zoek iemand die mijn rustpunt is na een drukke dag, maar ook mijn avontuurpartner voor nieuwe ervaringen..."'
  },
  {
    id: 'personalBoundaries',
    question: 'Welke grenzen zijn belangrijk voor jou?',
    description: 'Wat accepteer je niet in een relatie, ongeacht hoe je voelt voor de persoon?',
    placeholder: 'Bijvoorbeeld: "Ik accepteer geen vorm van manipulatie of controle. Mijn onafhankelijkheid is heilig voor me..."'
  },
  {
    id: 'growthAreas',
    question: 'Waar wil je in groeien binnen relaties?',
    description: 'Welke aspecten van jezelf wil je ontwikkelen om betere relaties te kunnen hebben?',
    placeholder: 'Bijvoorbeeld: "Ik wil leren om mijn kwetsbaarheid beter te tonen en minder mijn verdediging op te trekken..."'
  }
];

export function AuthenticityReflectionExercise({
  onComplete
}: {
  onComplete?: (answers: AuthenticityAnswers, points: number) => void
}) {
  const { user } = useUser();
  const { toast } = useToast();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<AuthenticityAnswers>({
    coreValues: '',
    uniqueTraits: '',
    relationshipGoals: '',
    personalBoundaries: '',
    growthAreas: ''
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [completedQuestions, setCompletedQuestions] = useState<Set<string>>(new Set());

  // Load saved answers on mount
  useEffect(() => {
    async function loadSavedAnswers() {
      if (!user?.id) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/user/lesson-responses?userId=${user.id}`);
        if (response.ok) {
          const allResponses = await response.json();
          const savedResponse = allResponses.find((r: any) => r.lesson_id === LESSON_ID);

          if (savedResponse?.response_text) {
            try {
              const parsedAnswers = JSON.parse(savedResponse.response_text);
              setAnswers(parsedAnswers);

              // Mark completed questions
              const completed = new Set<string>();
              Object.entries(parsedAnswers).forEach(([key, value]) => {
                if (value && (value as string).trim().length > 10) {
                  completed.add(key);
                }
              });
              setCompletedQuestions(completed);
            } catch (e) {
              console.error('Failed to parse saved answers:', e);
            }
          }
        }
      } catch (error) {
        console.error('Failed to load saved answers:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadSavedAnswers();
  }, [user?.id]);

  // Auto-save answers whenever they change
  useEffect(() => {
    if (!user?.id || isLoading) return;

    const timeoutId = setTimeout(async () => {
      setIsSaving(true);
      try {
        await fetch('/api/user/lesson-responses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user.id,
            lessonId: LESSON_ID,
            responseText: JSON.stringify(answers)
          }),
        });
      } catch (error) {
        console.error('Failed to auto-save answers:', error);
      } finally {
        setIsSaving(false);
      }
    }, 1000); // Debounce: save 1 second after last change

    return () => clearTimeout(timeoutId);
  }, [answers, user?.id, isLoading]);

  const handleAnswerChange = (questionId: keyof AuthenticityAnswers, value: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));

    // Mark as completed if answer is substantial
    if (value.trim().length > 10) {
      setCompletedQuestions(prev => new Set(prev).add(questionId));
    } else {
      setCompletedQuestions(prev => {
        const newSet = new Set(prev);
        newSet.delete(questionId);
        return newSet;
      });
    }
  };

  const handleNext = () => {
    if (currentQuestion < REFLECTION_QUESTIONS.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleComplete = () => {
    const totalQuestions = REFLECTION_QUESTIONS.length;
    const completedCount = completedQuestions.size;
    const points = Math.round((completedCount / totalQuestions) * 100);

    if (onComplete) {
      onComplete(answers, points);
    }

    toast({
      title: 'Reflectie voltooid! 🎉',
      description: `Je hebt ${completedCount} van de ${totalQuestions} vragen beantwoord. Goed gedaan!`,
    });
  };

  const currentQ = REFLECTION_QUESTIONS[currentQuestion];
  const currentAnswer = answers[currentQ.id as keyof AuthenticityAnswers];
  const isCompleted = completedQuestions.has(currentQ.id);
  const allCompleted = completedQuestions.size === REFLECTION_QUESTIONS.length;

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl mx-auto">
        <div className="flex items-center justify-center space-x-2">
          <Lucide.Loader className="h-6 w-6 animate-spin text-purple-600" />
          <span className="text-gray-600">Reflectie laden...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-4">
          <Lucide.Brain className="h-8 w-8 text-purple-600" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Zelfkennis Reflectie</h2>
            <p className="text-gray-600">Het fundament van authenticiteit in dating</p>
          </div>
        </div>

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Vraag {currentQuestion + 1} van {REFLECTION_QUESTIONS.length}</span>
            <span>{completedQuestions.size} / {REFLECTION_QUESTIONS.length} voltooid</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-purple-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentQuestion + 1) / REFLECTION_QUESTIONS.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Saving indicator */}
        <div className="flex items-center justify-end mt-2">
          {isSaving && (
            <span className="text-xs text-gray-500 flex items-center">
              <Lucide.Loader className="h-3 w-3 animate-spin mr-1" />
              Opslaan...
            </span>
          )}
          {!isSaving && completedQuestions.size > 0 && (
            <span className="text-xs text-green-600 flex items-center">
              <Lucide.Check className="h-3 w-3 mr-1" />
              Voortgang opgeslagen
            </span>
          )}
        </div>
      </div>

      {/* Current Question */}
      <div className="space-y-4">
        <div className="bg-purple-50 border-l-4 border-purple-400 p-4">
          <h3 className="text-lg font-semibold text-purple-900 mb-2">
            {currentQ.question}
          </h3>
          <p className="text-sm text-purple-700 mb-3">
            {currentQ.description}
          </p>
          {isCompleted && (
            <div className="flex items-center gap-2 text-green-700">
              <Lucide.CheckCircle className="h-4 w-4" />
              <span className="text-xs font-medium">Deze vraag heb je beantwoord</span>
            </div>
          )}
        </div>

        <Textarea
          value={currentAnswer}
          onChange={(e) => handleAnswerChange(currentQ.id as keyof AuthenticityAnswers, e.target.value)}
          placeholder={currentQ.placeholder}
          rows={6}
          className="resize-none"
        />

        {/* Tips */}
        <div className="bg-blue-50 border-l-4 border-blue-400 p-3 text-sm text-blue-800">
          💡 <strong>Tip:</strong> Neem de tijd voor deze reflectie. Hoe dieper je graaft, hoe authentieker je profieltekst wordt.
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center mt-6 pt-6 border-t border-gray-200">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentQuestion === 0}
        >
          <Lucide.ChevronLeft className="h-4 w-4 mr-2" />
          Vorige
        </Button>

        <div className="flex gap-2">
          {/* Question indicators */}
          {REFLECTION_QUESTIONS.map((_, index) => (
            <div
              key={index}
              className={`w-3 h-3 rounded-full transition-colors ${
                index === currentQuestion
                  ? 'bg-purple-600'
                  : completedQuestions.has(REFLECTION_QUESTIONS[index].id)
                  ? 'bg-green-500'
                  : 'bg-gray-300'
              }`}
            />
          ))}
        </div>

        {currentQuestion < REFLECTION_QUESTIONS.length - 1 ? (
          <Button onClick={handleNext}>
            Volgende
            <Lucide.ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        ) : (
          <Button
            onClick={handleComplete}
            disabled={!allCompleted}
            className="bg-green-600 hover:bg-green-700"
          >
            <Lucide.CheckCircle className="h-4 w-4 mr-2" />
            Reflectie Voltooien
          </Button>
        )}
      </div>

      {!allCompleted && (
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-500">
            Beantwoord alle vragen om je reflectie te voltooien
          </p>
        </div>
      )}

      {allCompleted && (
        <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4 text-center">
          <Lucide.Trophy className="h-8 w-8 text-green-600 mx-auto mb-2" />
          <p className="text-green-800 font-medium">
            Geweldig! Je hebt alle reflectievragen beantwoord.
          </p>
          <p className="text-green-700 text-sm mt-1">
            Deze inzichten vormen de basis voor een authentiek profiel.
          </p>
        </div>
      )}
    </div>
  );
}