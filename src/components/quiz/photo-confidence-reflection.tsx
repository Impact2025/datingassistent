'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@/providers/user-provider';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import * as Lucide from 'lucide-react';

interface PhotoConfidenceAnswers {
  cameraFear: string;
  pastExperiences: string;
  bodyImage: string;
  successMoments: string;
  supportSystem: string;
}

const LESSON_ID = 1001; // Photography course confidence reflection

const CONFIDENCE_QUESTIONS = [
  {
    id: 'cameraFear',
    question: 'Wat is je grootste angst als het om foto\'s maken gaat?',
    description: 'Wees eerlijk - gaat het om hoe je eruitziet, de technische kant, of iets anders?',
    placeholder: 'Bijvoorbeeld: "Ik ben bang dat ik er stijf en onnatuurlijk uitzie op foto\'s..."'
  },
  {
    id: 'pastExperiences',
    question: 'Welke ervaringen heb je gehad met foto\'s die je zelfvertrouwen beïnvloedden?',
    description: 'Denk aan complimenten, kritiek, of momenten die je bijbleven.',
    placeholder: 'Bijvoorbeeld: "Toen ik klein was, lachte iedereen om mijn beugel op schoolfoto\'s..."'
  },
  {
    id: 'bodyImage',
    question: 'Hoe sta je tegenover je eigen lichaam en uiterlijk?',
    description: 'Dit gaat niet om perfectie, maar om acceptatie en zelfcompassie.',
    placeholder: 'Bijvoorbeeld: "Ik ben kritisch over mijn glimlach, maar ik hou van mijn expressieve ogen..."'
  },
  {
    id: 'successMoments',
    question: 'Wanneer voelde je je wél goed op foto\'s?',
    description: 'Herinner je momenten waarin je jezelf mooi of krachtig vond.',
    placeholder: 'Bijvoorbeeld: "Op mijn verjaardag vorig jaar, toen ik danste met vrienden..."'
  },
  {
    id: 'supportSystem',
    question: 'Wie kan je ondersteunen tijdens je fotografie journey?',
    description: 'Vrienden, familie, of professionele hulp - bouw je team op.',
    placeholder: 'Bijvoorbeeld: "Mijn zus is altijd eerlijk maar lief, en mijn partner moedigt me aan..."'
  }
];

export function PhotoConfidenceReflection({
  onComplete
}: {
  onComplete?: (answers: PhotoConfidenceAnswers, points: number) => void
}) {
  const { user } = useUser();
  const { toast } = useToast();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<PhotoConfidenceAnswers>({
    cameraFear: '',
    pastExperiences: '',
    bodyImage: '',
    successMoments: '',
    supportSystem: ''
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

  const handleAnswerChange = (questionId: keyof PhotoConfidenceAnswers, value: string) => {
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
    if (currentQuestion < CONFIDENCE_QUESTIONS.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleComplete = () => {
    const totalQuestions = CONFIDENCE_QUESTIONS.length;
    const completedCount = completedQuestions.size;
    const points = Math.round((completedCount / totalQuestions) * 100);

    if (onComplete) {
      onComplete(answers, points);
    }

    toast({
      title: 'Reflectie voltooid! 📸',
      description: `Je hebt ${completedCount} van de ${totalQuestions} vragen beantwoord. Je bent een stap dichter bij zelfverzekerde foto's!`,
    });
  };

  const currentQ = CONFIDENCE_QUESTIONS[currentQuestion];
  const currentAnswer = answers[currentQ.id as keyof PhotoConfidenceAnswers];
  const isCompleted = completedQuestions.has(currentQ.id);
  const allCompleted = completedQuestions.size === CONFIDENCE_QUESTIONS.length;

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl mx-auto">
        <div className="flex items-center justify-center space-x-2">
          <Lucide.Loader className="h-6 w-6 animate-spin text-blue-600" />
          <span className="text-gray-600">Foto zelfvertrouwen reflectie laden...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-4">
          <Lucide.Camera className="h-8 w-8 text-blue-600" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Foto Zelfvertrouwen Reflectie</h2>
            <p className="text-gray-600">Ontdek wat je tegenhoudt en bouw je fotografische zelfvertrouwen op</p>
          </div>
        </div>

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Vraag {currentQuestion + 1} van {CONFIDENCE_QUESTIONS.length}</span>
            <span>{completedQuestions.size} / {CONFIDENCE_QUESTIONS.length} voltooid</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentQuestion + 1) / CONFIDENCE_QUESTIONS.length) * 100}%` }}
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
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">
            {currentQ.question}
          </h3>
          <p className="text-sm text-blue-700 mb-3">
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
          onChange={(e) => handleAnswerChange(currentQ.id as keyof PhotoConfidenceAnswers, e.target.value)}
          placeholder={currentQ.placeholder}
          rows={6}
          className="resize-none"
        />

        {/* Tips based on current question */}
        <div className="bg-blue-50 border-l-4 border-blue-400 p-3 text-sm text-blue-800">
          💡 <strong>Tip:</strong> {
            currentQuestion === 0 ? "Wees mild voor jezelf - iedereen heeft wel een vorm van camera-angst!" :
            currentQuestion === 1 ? "Herinneringen vormen ons, maar bepalen niet wie we zijn." :
            currentQuestion === 2 ? "Zelfacceptatie begint met compassie voor je eigen verhaal." :
            currentQuestion === 3 ? "Deze momenten zijn je kompas voor authentieke fotografie." :
            "Een goed support systeem maakt het verschil tussen proberen en slagen."
          }
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
          {CONFIDENCE_QUESTIONS.map((_, index) => (
            <div
              key={index}
              className={`w-3 h-3 rounded-full transition-colors ${
                index === currentQuestion
                  ? 'bg-blue-600'
                  : completedQuestions.has(CONFIDENCE_QUESTIONS[index].id)
                  ? 'bg-green-500'
                  : 'bg-gray-300'
              }`}
            />
          ))}
        </div>

        {currentQuestion < CONFIDENCE_QUESTIONS.length - 1 ? (
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
            Beantwoord alle vragen om je foto zelfvertrouwen reflectie te voltooien
          </p>
        </div>
      )}

      {allCompleted && (
        <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4 text-center">
          <Lucide.Trophy className="h-8 w-8 text-green-600 mx-auto mb-2" />
          <p className="text-green-800 font-medium">
            Uitstekend! Je foto zelfvertrouwen foundation staat.
          </p>
          <p className="text-green-700 text-sm mt-1">
            Deze inzichten helpen je om authentieke, zelfverzekerde foto's te maken.
          </p>
        </div>
      )}
    </div>
  );
}