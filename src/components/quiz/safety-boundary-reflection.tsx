'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@/providers/user-provider';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import * as Lucide from 'lucide-react';

interface SafetyAnswers {
  redFlagsReaction: string;
  personalBoundaries: string;
  safetyTriggers: string;
  trustBuilding: string;
  exitStrategy: string;
}

const LESSON_ID = 1003; // Red flags safety reflection

const SAFETY_QUESTIONS = [
  {
    id: 'redFlagsReaction',
    question: 'Hoe reageer je wanneer je een rode vlag opmerkt?',
    description: 'Beschrijf je eerste reactie en hoe je normaal gesproken handelt.',
    placeholder: 'Bijvoorbeeld: "Ik negeer het vaak eerst, omdat ik niet wil oordelen. Maar later knaagt het aan me..."'
  },
  {
    id: 'personalBoundaries',
    question: 'Wat zijn je niet-onderhandelbare grenzen in dating?',
    description: 'Welke gedragingen accepteren je absoluut niet, ongeacht hoe je voor de persoon voelt?',
    placeholder: 'Bijvoorbeeld: "Elke vorm van fysiek geweld, liegen over belangrijke zaken, of druk om dingen te doen waar ik niet klaar voor ben..."'
  },
  {
    id: 'safetyTriggers',
    question: 'Welke situaties activeren je veiligheidsradar?',
    description: 'Welke woorden, gedragingen of patronen zorgen ervoor dat je extra alert wordt?',
    placeholder: 'Bijvoorbeeld: "Als iemand meteen vraagt om persoonlijke informatie, of als verhalen niet consistent zijn..."'
  },
  {
    id: 'trustBuilding',
    question: 'Hoe bouw je vertrouwen op in nieuwe connecties?',
    description: 'Wat heb je nodig om je veilig en op je gemak te voelen bij iemand?',
    placeholder: 'Bijvoorbeeld: "Tijd nemen, consistente communicatie, en het gevoel dat mijn grenzen worden gerespecteerd..."'
  },
  {
    id: 'exitStrategy',
    question: 'Wat is je strategie wanneer iets niet goed voelt?',
    description: 'Hoe trek je je terug uit situaties die niet veilig of gezond zijn?',
    placeholder: 'Bijvoorbeeld: "Ik communiceer duidelijk mijn gevoelens, neem afstand, en praat erover met vertrouwde vrienden..."'
  }
];

export function SafetyBoundaryReflection({
  onComplete
}: {
  onComplete?: (answers: SafetyAnswers, points: number) => void
}) {
  const { user } = useUser();
  const { toast } = useToast();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<SafetyAnswers>({
    redFlagsReaction: '',
    personalBoundaries: '',
    safetyTriggers: '',
    trustBuilding: '',
    exitStrategy: ''
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

  const handleAnswerChange = (questionId: keyof SafetyAnswers, value: string) => {
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
    if (currentQuestion < SAFETY_QUESTIONS.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleComplete = () => {
    const totalQuestions = SAFETY_QUESTIONS.length;
    const completedCount = completedQuestions.size;
    const points = Math.round((completedCount / totalQuestions) * 100);

    if (onComplete) {
      onComplete(answers, points);
    }

    toast({
      title: 'Veiligheid reflectie voltooid! 🛡️',
      description: `Je hebt ${completedCount} van de ${totalQuestions} vragen beantwoord. Je veiligheid staat voorop!`,
    });
  };

  const currentQ = SAFETY_QUESTIONS[currentQuestion];
  const currentAnswer = answers[currentQ.id as keyof SafetyAnswers];
  const isCompleted = completedQuestions.has(currentQ.id);
  const allCompleted = completedQuestions.size === SAFETY_QUESTIONS.length;

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl mx-auto">
        <div className="flex items-center justify-center space-x-2">
          <Lucide.Loader className="h-6 w-6 animate-spin text-red-600" />
          <span className="text-gray-600">Veiligheid reflectie laden...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-4">
          <Lucide.Shield className="h-8 w-8 text-red-600" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Veiligheid & Grenzen Reflectie</h2>
            <p className="text-gray-600">Ontdek je persoonlijke veiligheidsstrategieën in dating</p>
          </div>
        </div>

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Vraag {currentQuestion + 1} van {SAFETY_QUESTIONS.length}</span>
            <span>{completedQuestions.size} / {SAFETY_QUESTIONS.length} voltooid</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-red-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentQuestion + 1) / SAFETY_QUESTIONS.length) * 100}%` }}
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
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <h3 className="text-lg font-semibold text-red-900 mb-2">
            {currentQ.question}
          </h3>
          <p className="text-sm text-red-700 mb-3">
            {currentQ.description}
          </p>
          {isCompleted && (
            <div className="flex items-center gap-2 text-green-700">
              <Lucide.CheckCircle className="h-4 w-4" />
              <span className="text-xs font-medium">Deze reflectie heb je voltooid</span>
            </div>
          )}
        </div>

        <Textarea
          value={currentAnswer}
          onChange={(e) => handleAnswerChange(currentQ.id as keyof SafetyAnswers, e.target.value)}
          placeholder={currentQ.placeholder}
          rows={6}
          className="resize-none"
        />

        {/* Tips based on current question */}
        <div className="bg-red-50 border-l-4 border-red-400 p-3 text-sm text-red-800">
          🛡️ <strong>Veiligheidstip:</strong> {
            currentQuestion === 0 ? "Het is normaal om rode vlaggen eerst te negeren - bewustzijn komt met ervaring." :
            currentQuestion === 1 ? "Grenzen zijn persoonlijk. Wat voor jou niet werkt, kan voor een ander prima zijn." :
            currentQuestion === 2 ? "Luister naar je intuïtie. Als iets niet goed voelt, is dat vaak een signaal." :
            currentQuestion === 3 ? "Vertrouwen bouw je op door consistentie en respect over tijd." :
            "Een goede exit strategie beschermt zowel jou als de ander."
          }
        </div>

        {/* Safety reminder */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <Lucide.AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-yellow-800">
              <strong>Onthoud:</strong> Je veiligheid gaat altijd voor. Als iets niet goed voelt, vertrouw op je gevoel en neem afstand.
            </div>
          </div>
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
          {SAFETY_QUESTIONS.map((_, index) => (
            <div
              key={index}
              className={`w-3 h-3 rounded-full transition-colors ${
                index === currentQuestion
                  ? 'bg-red-600'
                  : completedQuestions.has(SAFETY_QUESTIONS[index].id)
                  ? 'bg-green-500'
                  : 'bg-gray-300'
              }`}
            />
          ))}
        </div>

        {currentQuestion < SAFETY_QUESTIONS.length - 1 ? (
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
            Beantwoord alle vragen om je veiligheid reflectie te voltooien
          </p>
        </div>
      )}

      {allCompleted && (
        <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4 text-center">
          <Lucide.Trophy className="h-8 w-8 text-green-600 mx-auto mb-2" />
          <p className="text-green-800 font-medium">
            Uitstekend! Je veiligheid foundation staat sterk.
          </p>
          <p className="text-green-700 text-sm mt-1">
            Deze inzichten helpen je om bewuste, veilige dating beslissingen te nemen.
          </p>
        </div>
      )}
    </div>
  );
}