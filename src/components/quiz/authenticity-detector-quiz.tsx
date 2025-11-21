'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@/providers/user-provider';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import * as Lucide from 'lucide-react';

interface QuizResult {
  score: number;
  totalQuestions: number;
  feedback: string;
  strengths: string[];
  improvements: string[];
}

const AUTHENTICITY_QUESTIONS = [
  {
    id: 1,
    question: "Welke van deze bio zinnen voelt het meest authentiek?",
    options: [
      { text: "Ik ben een avontuurlijke spirit die van reizen houdt en nieuwe ervaringen opzoekt", value: "cliche", explanation: "Dit is een generieke beschrijving die iedereen zou kunnen gebruiken" },
      { text: "Ik heb vorig jaar mijn eerste solo-reis naar Japan gemaakt en ontdekte dat ik gek ben op streetfood-markten", value: "authentic", explanation: "Dit deelt een specifieke ervaring die uniek is voor jou" },
      { text: "Liefdevol, zorgzaam en altijd klaar voor een goed gesprek", value: "cliche", explanation: "Dit zijn oppervlakkige eigenschappen zonder context of verhaal" }
    ]
  },
  {
    id: 2,
    question: "Wat is het probleem met deze zin: 'Ik ben spontaan en hou van verrassingen'",
    options: [
      { text: "Niets, het is perfect!", value: "wrong", explanation: "Deze zin is te algemeen en zegt niets specifieks over jou" },
      { text: "Het mist een concreet voorbeeld van spontaniteit", value: "correct", explanation: "Precies! Zonder voorbeeld blijft het oppervlakkig" },
      { text: "Het gebruikt te veel woorden", value: "wrong", explanation: "De lengte is niet het probleem, maar de oppervlakkigheid wel" }
    ]
  },
  {
    id: 3,
    question: "Welke aanpak geeft meer authenticiteit?",
    options: [
      { text: "'Creatief en artistiek' - algemeen en oppervlakkig", value: "wrong", explanation: "Dit zegt niets unieks over jouw creativiteit" },
      { text: "'Ik teken cartoons over mijn slechte dagen op kantoor' - specifiek en persoonlijk", value: "correct", explanation: "Dit toont hoe jouw creativiteit eruit ziet in de praktijk" },
      { text: "'Kunstenaar in hart en nieren' - dramatisch maar leeg", value: "wrong", explanation: "Dit klinkt mooi maar geeft geen echte inzichten" }
    ]
  },
  {
    id: 4,
    question: "Waarom is deze zin problematisch: 'Ik zoek iemand die van koken houdt'",
    options: [
      { text: "Het is te specifiek en sluit mensen uit", value: "wrong", explanation: "Het is niet te specifiek, maar juist te algemeen" },
      { text: "Het zegt meer over jou dan over wat je zoekt", value: "correct", explanation: "Juist! Het onthult dat jij van koken houdt, niet wat je zoekt in een partner" },
      { text: "Het gebruikt de verkeerde grammatica", value: "wrong", explanation: "De grammatica is prima, maar de inhoud is egocentrisch" }
    ]
  },
  {
    id: 5,
    question: "Welke zin toont echte kwetsbaarheid?",
    options: [
      { text: "Ik ben perfectionistisch maar werk eraan om losser te worden", value: "wrong", explanation: "Dit klinkt als een oppervlakkige zelfverbetering" },
      { text: "Ik zeg soms nee tegen plannen omdat ik bang ben voor afwijzing, maar ik probeer dapperder te zijn", value: "correct", explanation: "Dit toont een echte worsteling met een specifiek gevoel" },
      { text: "Ik heb mijn uitdagingen maar ben veerkrachtig", value: "wrong", explanation: "Dit is te algemeen en zegt niets specifieks" }
    ]
  },
  {
    id: 6,
    question: "Wat maakt deze zin authentiek: 'Ik heb geleerd dat mijn buikgevoel meestal klopt'",
    options: [
      { text: "Het gebruikt het woord 'geleerd' wat groei toont", value: "wrong", explanation: "Het woord 'geleerd' helpt, maar het echte geheim is het verhaal" },
      { text: "Het impliceert een ervaring zonder die te delen", value: "correct", explanation: "Precies! Het hint naar een verhaal zonder alles weg te geven" },
      { text: "Het is kort en bondig", value: "wrong", explanation: "De lengte is niet doorslaggevend voor authenticiteit" }
    ]
  },
  {
    id: 7,
    question: "Waarom werkt deze zin beter: 'Ik dans als niemand kijkt, maar vind het heerlijk als iemand meedoet'",
    options: [
      { text: "Het gebruikt humor om connectie te maken", value: "wrong", explanation: "Humor helpt, maar het echte geheim is de kwetsbaarheid" },
      { text: "Het toont kwetsbaarheid door een 'geheim' te delen", value: "correct", explanation: "Juist! Het geeft een kijkje in iets persoonlijks en uitnodigend" },
      { text: "Het eindigt met een uitnodiging", value: "wrong", explanation: "De uitnodiging helpt, maar de kwetsbaarheid maakt het authentiek" }
    ]
  },
  {
    id: 8,
    question: "Welke van deze openingszinnen trekt het meest nieuwsgierigheid?",
    options: [
      { text: "Ik ben een leuke persoon die van gezelligheid houdt", value: "wrong", explanation: "Dit zegt niets specifieks en wekt geen nieuwsgierigheid" },
      { text: "Ik heb ooit een vreemde ontmoet die mijn leven veranderde", value: "correct", explanation: "Dit hint naar een verhaal zonder alles te verklappen" },
      { text: "Zoekend naar liefde en avontuur", value: "wrong", explanation: "Dit is te algemeen en klinkt als duizenden andere profielen" }
    ]
  }
];

export function AuthenticityDetectorQuiz({
  onComplete
}: {
  onComplete?: (result: QuizResult) => void
}) {
  const { user } = useUser();
  const { toast } = useToast();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [showExplanation, setShowExplanation] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [quizCompleted, setQuizCompleted] = useState(false);

  // Load saved progress on mount
  useEffect(() => {
    async function loadSavedProgress() {
      if (!user?.id) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/user/lesson-responses?userId=${user.id}`);
        if (response.ok) {
          const allResponses = await response.json();
          const savedResponse = allResponses.find((r: any) => r.lesson_id === 1002); // Authenticity quiz

          if (savedResponse?.response_text) {
            try {
              const parsedData = JSON.parse(savedResponse.response_text);
              if (parsedData.answers) {
                setAnswers(parsedData.answers);
                setCurrentQuestion(parsedData.currentQuestion || 0);
                if (parsedData.completed) {
                  setQuizCompleted(true);
                }
              }
            } catch (e) {
              console.error('Failed to parse saved quiz progress:', e);
            }
          }
        }
      } catch (error) {
        console.error('Failed to load saved quiz progress:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadSavedProgress();
  }, [user?.id]);

  // Auto-save progress
  useEffect(() => {
    if (!user?.id || isLoading || quizCompleted) return;

    const timeoutId = setTimeout(async () => {
      try {
        await fetch('/api/user/lesson-responses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user.id,
            lessonId: 1002, // Authenticity quiz
            responseText: JSON.stringify({
              answers,
              currentQuestion,
              completed: false
            })
          }),
        });
      } catch (error) {
        console.error('Failed to auto-save quiz progress:', error);
      }
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [answers, currentQuestion, user?.id, isLoading, quizCompleted]);

  const handleAnswerSelect = (answerValue: string) => {
    setSelectedAnswer(answerValue);
    setShowExplanation(true);
  };

  const handleNext = () => {
    if (selectedAnswer) {
      setAnswers(prev => ({ ...prev, [currentQuestion]: selectedAnswer }));

      if (currentQuestion < AUTHENTICITY_QUESTIONS.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setSelectedAnswer(null);
        setShowExplanation(false);
      } else {
        completeQuiz();
      }
    }
  };

  const completeQuiz = async () => {
    const totalQuestions = AUTHENTICITY_QUESTIONS.length;
    let correctAnswers = 0;

    AUTHENTICITY_QUESTIONS.forEach((question, index) => {
      if (answers[index] === 'correct' || answers[index] === 'authentic') {
        correctAnswers++;
      }
    });

    const score = Math.round((correctAnswers / totalQuestions) * 100);

    // Generate feedback based on score
    let feedback = '';
    const strengths: string[] = [];
    const improvements: string[] = [];

    if (score >= 80) {
      feedback = "Uitstekend! Je hebt een scherp oog voor authenticiteit. Je begrijpt wat werkt in dating profielen.";
      strengths.push("Sterk gevoel voor wat authentiek voelt");
      strengths.push("Goede intuïtie voor oppervlakkigheid");
    } else if (score >= 60) {
      feedback = "Goed gedaan! Je hebt de basis van authenticiteit te pakken, maar er is nog ruimte voor verbetering.";
      strengths.push("Begrijpt het verschil tussen cliché en authentiek");
      improvements.push("Let meer op specifieke details in verhalen");
    } else {
      feedback = "Je bent op de goede weg! Authenticiteit is een vaardigheid die je kunt ontwikkelen met oefening.";
      improvements.push("Focus op concrete ervaringen in plaats van algemene uitspraken");
      improvements.push("Zoek naar manieren om kwetsbaarheid te tonen");
    }

    const result: QuizResult = {
      score,
      totalQuestions,
      feedback,
      strengths,
      improvements
    };

    // Save final result
    if (user?.id) {
      try {
        await fetch('/api/user/lesson-responses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user.id,
            lessonId: 1002,
            responseText: JSON.stringify({
              answers,
              currentQuestion,
              completed: true,
              result
            })
          }),
        });
      } catch (error) {
        console.error('Failed to save quiz result:', error);
      }
    }

    setQuizCompleted(true);

    if (onComplete) {
      onComplete(result);
    }

    toast({
      title: 'Quiz voltooid! 🎯',
      description: `Je score: ${score}%. ${feedback}`,
    });
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl mx-auto">
        <div className="flex items-center justify-center space-x-2">
          <Lucide.Loader className="h-6 w-6 animate-spin text-purple-600" />
          <span className="text-gray-600">Authenticiteit quiz laden...</span>
        </div>
      </div>
    );
  }

  if (quizCompleted) {
    const totalQuestions = AUTHENTICITY_QUESTIONS.length;
    let correctAnswers = 0;

    AUTHENTICITY_QUESTIONS.forEach((question, index) => {
      if (answers[index] === 'correct' || answers[index] === 'authentic') {
        correctAnswers++;
      }
    });

    const score = Math.round((correctAnswers / totalQuestions) * 100);

    return (
      <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl mx-auto">
        <div className="text-center">
          <div className="mb-6">
            <Lucide.Trophy className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Authenticiteit Quiz Voltooid!</h2>
            <div className="text-6xl font-bold text-purple-600 mb-2">{score}%</div>
            <p className="text-gray-600">Je hebt {correctAnswers} van de {totalQuestions} vragen correct beantwoord</p>
          </div>

          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-purple-900 mb-2">Jouw Resultaat:</h3>
            <p className="text-purple-800">{score >= 80 ? "Uitstekend! Je hebt een scherp oog voor authenticiteit." :
                                           score >= 60 ? "Goed gedaan! Je begrijpt de basis van authenticiteit." :
                                           "Je bent op de goede weg! Blijf oefenen met authentiek schrijven."}</p>
          </div>

          {(score < 100) && (
            <div className="space-y-4 mb-6">
              <h3 className="font-semibold text-gray-900">Verbeterpunten:</h3>
              <ul className="text-left space-y-2">
                {score < 80 && <li className="flex items-start gap-2">
                  <Lucide.Lightbulb className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Let op specifieke details in plaats van algemene uitspraken</span>
                </li>}
                {score < 60 && <li className="flex items-start gap-2">
                  <Lucide.Lightbulb className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Zoek naar manieren om kwetsbaarheid en persoonlijke verhalen te tonen</span>
                </li>}
              </ul>
            </div>
          )}

          <Button
            onClick={() => {
              setQuizCompleted(false);
              setCurrentQuestion(0);
              setAnswers({});
              setSelectedAnswer(null);
              setShowExplanation(false);
            }}
            variant="outline"
          >
            <Lucide.RotateCcw className="h-4 w-4 mr-2" />
            Quiz opnieuw maken
          </Button>
        </div>
      </div>
    );
  }

  const currentQ = AUTHENTICITY_QUESTIONS[currentQuestion];
  const progress = ((currentQuestion + 1) / AUTHENTICITY_QUESTIONS.length) * 100;

  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-4">
          <Lucide.Search className="h-8 w-8 text-purple-600" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Authenticiteit Detector</h2>
            <p className="text-gray-600">Leer clichés herkennen en authentieke verhalen schrijven</p>
          </div>
        </div>

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Vraag {currentQuestion + 1} van {AUTHENTICITY_QUESTIONS.length}</span>
            <span>{Object.keys(answers).length} beantwoord</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-purple-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Question */}
      <div className="space-y-4">
        <div className="bg-purple-50 border-l-4 border-purple-400 p-4">
          <h3 className="text-lg font-semibold text-purple-900 mb-2">
            Vraag {currentQuestion + 1}
          </h3>
          <p className="text-purple-800">{currentQ.question}</p>
        </div>

        {/* Options */}
        <div className="space-y-3">
          {currentQ.options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswerSelect(option.value)}
              disabled={showExplanation}
              className={`w-full text-left p-4 rounded-lg border transition-all ${
                selectedAnswer === option.value
                  ? showExplanation
                    ? option.value === 'correct' || option.value === 'authentic'
                      ? 'border-green-500 bg-green-50'
                      : 'border-red-500 bg-red-50'
                    : 'border-purple-500 bg-purple-50'
                  : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 mt-0.5 ${
                  selectedAnswer === option.value
                    ? showExplanation
                      ? option.value === 'correct' || option.value === 'authentic'
                        ? 'border-green-500 bg-green-500'
                        : 'border-red-500 bg-red-500'
                      : 'border-purple-500 bg-purple-500'
                    : 'border-gray-300'
                }`}>
                  {selectedAnswer === option.value && (
                    <div className="w-full h-full rounded-full bg-white scale-50"></div>
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-gray-900">{option.text}</p>
                  {showExplanation && selectedAnswer === option.value && (
                    <p className={`text-sm mt-2 ${
                      option.value === 'correct' || option.value === 'authentic'
                        ? 'text-green-700'
                        : 'text-red-700'
                    }`}>
                      {option.explanation}
                    </p>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Next button */}
        {showExplanation && (
          <div className="flex justify-end pt-4">
            <Button onClick={handleNext}>
              {currentQuestion < AUTHENTICITY_QUESTIONS.length - 1 ? 'Volgende vraag' : 'Quiz voltooien'}
              <Lucide.ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}