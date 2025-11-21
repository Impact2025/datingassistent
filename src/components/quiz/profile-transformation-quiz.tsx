"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import * as Lucide from 'lucide-react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import type { CarouselApi } from '@/components/ui/carousel';

// Add slide animation styles
const slideAnimationStyles = `
  @keyframes slideInUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .slide-enter {
    animation: slideInUp 0.5s ease-out;
  }
`;

type OptionKey = 'A' | 'B' | 'C' | 'D';

interface QuizQuestion {
  id: string;
  question: string;
  options: Record<OptionKey, string>;
  answer: OptionKey;
  feedback: Record<OptionKey, string>;
}

const PROFILE_QUIZ_DATA: QuizQuestion[] = [
  {
    id: 'hook-importance',
    question: 'Waarom is de eerste zin van je profieltekst zo belangrijk?',
    options: {
      A: 'Het bepaalt welke foto\'s mensen bekijken',
      B: 'Het creëert onmiddellijke nieuwsgierigheid of verveling',
      C: 'Het toont je schrijfvaardigheid',
      D: 'Het bespaart tijd bij het lezen'
    },
    answer: 'B',
    feedback: {
      A: 'Foto\'s worden altijd eerst bekeken, maar de tekst bepaalt of mensen verder lezen.',
      B: 'Correct! Binnen 3 seconden beslissen mensen of je profiel interessant genoeg is om verder te lezen.',
      C: 'Schrijfstijl is belangrijk, maar de eerste indruk gaat om emotionele reactie.',
      D: 'Het gaat niet om snelheid, maar om kwaliteit van aandacht.'
    }
  },
  {
    id: 'show-dont-tell',
    question: 'Wat betekent "show, don\'t tell" in profielteksten?',
    options: {
      A: 'Laat zien wie je bent door verhalen in plaats van lijstjes eigenschappen',
      B: 'Vertel mensen wat ze moeten doen',
      C: 'Toon je foto\'s in plaats van tekst te schrijven',
      D: 'Gebruik alleen korte zinnen'
    },
    answer: 'A',
    feedback: {
      A: 'Precies! "Ik ben spontaan" wordt "Vorige week sprong ik spontaan in een fontein met vrienden".',
      B: 'Het gaat niet om instructies geven, maar om jezelf laten zien.',
      C: 'Foto\'s zijn belangrijk, maar tekst geeft context en diepte.',
      D: 'Korte zinnen kunnen helpen, maar het principe gaat om verhalen vs. feiten.'
    }
  },
  {
    id: 'specificity-power',
    question: 'Waarom werken specifieke details beter dan algemene uitspraken?',
    options: {
      A: 'Ze nemen meer ruimte in',
      B: 'Ze maken je uniek en geloofwaardig',
      C: 'Ze zijn makkelijker te schrijven',
      D: 'Ze trekken meer technische mensen aan'
    },
    answer: 'B',
    feedback: {
      A: 'Ruimte is beperkt, dus specifieke details moeten beknopt zijn.',
      B: 'Correct! "Ik hou van koken" wordt "Ik experimenteer graag met Thaise curry\'s op zondag".',
      C: 'Specifieke details vragen meer creativiteit, maar werken beter.',
      D: 'Het gaat niet om beroepsgroepen, maar om authenticiteit.'
    }
  },
  {
    id: 'emotional-connection',
    question: 'Welke emotie wekt het meest waarschijnlijk een reactie op?',
    options: {
      A: 'Trots op prestaties',
      B: 'Gedeelde kwetsbaarheid of humor',
      C: 'Boosheid over het verleden',
      D: 'Angst voor de toekomst'
    },
    answer: 'B',
    feedback: {
      A: 'Trots kan werken, maar gedeelde menselijkheid trekt meer aan.',
      B: 'Juist! Mensen reageren op verhalen die hen laten lachen of raken.',
      C: 'Negatieve emoties kunnen afschrikken.',
      D: 'Angst roept geen positieve connectie op.'
    }
  },
  {
    id: 'call-to-action',
    question: 'Wat is het doel van een goede call-to-action in je profiel?',
    options: {
      A: 'Mensen dwingen te antwoorden',
      B: 'Een natuurlijke uitnodiging tot gesprek creëren',
      C: 'Je telefoonnummer vragen',
      D: 'Onmiddellijke afspraak maken'
    },
    answer: 'B',
    feedback: {
      A: 'Druk werkt averechts op dating apps.',
      B: 'Perfect! Een vraag als "Wat is jouw guilty pleasure?" nodigt uit tot reactie.',
      C: 'Te direct voor een eerste ontmoeting.',
      D: 'Te snel - bouw eerst connectie op.'
    }
  },
  {
    id: 'authenticity-balance',
    question: 'Hoe balanceer je authenticiteit met aantrekkelijkheid?',
    options: {
      A: 'Wees altijd 100% jezelf, ongeacht wat',
      B: 'Toon je beste versie op een eerlijke manier',
      C: 'Verander jezelf volledig voor meer matches',
      D: 'Schrijf alleen over negatieve ervaringen'
    },
    answer: 'B',
    feedback: {
      A: 'Authenticiteit is belangrijk, maar iedereen toont zich van zijn beste kant.',
      B: 'Correct! Wees eerlijk over wie je bent, maar presenteer jezelf aantrekkelijk.',
      C: 'Verandering voor anderen werkt niet op lange termijn.',
      D: 'Negatieve verhalen trekken niet aan.'
    }
  },
  {
    id: 'length-optimization',
    question: 'Wat is de ideale lengte voor een profieltekst?',
    options: {
      A: 'Zo kort mogelijk (1 zin)',
      B: '150-200 woorden voor diepte zonder overweldigen',
      C: 'Zo lang mogelijk om alles te vertellen',
      D: 'Alleen emoji\'s gebruiken'
    },
    answer: 'B',
    feedback: {
      A: 'Te kort geeft niet genoeg informatie.',
      B: 'Juist! Genoeg ruimte voor verhalen, maar niet te veel om te lezen.',
      C: 'Te lange teksten worden overgeslagen.',
      D: 'Emoji\'s kunnen ondersteunen, maar vervangen geen tekst.'
    }
  }
];

const SCORE_TIERS = [
  { min: 0.86, label: 'Profieltekst Expert! 🎯', tone: 'Je hebt uitstekende kennis van wat werkt in profielen. Je kunt direct beginnen met schrijven!' },
  { min: 0.71, label: 'Goede Basis! 📝', tone: 'Je kent de belangrijkste principes. Focus op specifieke verhalen en emotionele connectie.' },
  { min: 0.57, label: 'Op de Goede Weg! 🚀', tone: 'Je begrijpt de basics. Werk aan authenticiteit en specifieke details.' },
  { min: 0, label: 'Nieuwe Start! 🌱', tone: 'Geen zorgen! Dit is normaal voor beginners. De cursus helpt je stap voor stap.' }
];

function getScoreSummary(score: number, total: number) {
  const percentage = total > 0 ? score / total : 0;
  const tier = SCORE_TIERS.find((item) => percentage >= item.min) ?? SCORE_TIERS[SCORE_TIERS.length - 1];
  return tier;
}

export function ProfileTransformationQuiz() {
  const [answers, setAnswers] = useState<Record<string, OptionKey>>({});
  const [showResults, setShowResults] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [api, setApi] = useState<CarouselApi>();
  const [slideAnimations, setSlideAnimations] = useState<Record<number, boolean>>({});

  const totalQuestions = PROFILE_QUIZ_DATA.length;
  const answeredCount = Object.keys(answers).length;
  const progress = totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : 0;

  const { correctCount, incorrectQuestions } = PROFILE_QUIZ_DATA.reduce(
    (acc, question) => {
      const selected = answers[question.id];
      if (!selected) return acc;

      const isCorrect = selected === question.answer;
      return {
        correctCount: acc.correctCount + (isCorrect ? 1 : 0),
        incorrectQuestions: isCorrect ? acc.incorrectQuestions : [...acc.incorrectQuestions, question.id]
      };
    },
    { correctCount: 0, incorrectQuestions: [] as string[] }
  );

  const summary = getScoreSummary(correctCount, totalQuestions);

  // Update current slide when carousel changes
  useEffect(() => {
    if (!api) return;

    const updateCurrentSlide = () => {
      const newSlide = api.selectedScrollSnap();
      setCurrentSlide(newSlide);

      // Trigger slide animation
      setSlideAnimations(prev => ({ ...prev, [newSlide]: true }));
      setTimeout(() => {
        setSlideAnimations(prev => ({ ...prev, [newSlide]: false }));
      }, 600);
    };

    updateCurrentSlide();
    api.on("select", updateCurrentSlide);

    return () => {
      api.off("select", updateCurrentSlide);
    };
  }, [api]);

  const handleSubmit = () => {
    setShowResults(true);
  };

  const resetQuiz = () => {
    setAnswers({});
    setShowResults(false);
    setCurrentSlide(0);
    api?.scrollTo(0);
  };

  return (
    <div className="space-y-6">
      {/* Inject animation styles */}
      <style dangerouslySetInnerHTML={{ __html: slideAnimationStyles }} />

      <div className="rounded-xl border border-primary/30 bg-primary/5 p-6 shadow-sm">
        <div className="flex items-start gap-3">
          <Lucide.Brain className="mt-1 h-5 w-5 text-primary" />
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-foreground">Profieltekst Kennis Quiz</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Test je kennis over wat werkt in dating profielen. Ontdek waar je sterk in bent en waar je kunt verbeteren.
            </p>
          </div>
        </div>
        <div className="mt-4">
          <Progress value={progress} className="h-2" />
          <div className="mt-2 text-xs text-muted-foreground">
            {answeredCount} / {totalQuestions} vragen beantwoord
          </div>
        </div>
      </div>

      <Carousel setApi={setApi} className="w-full">
        <CarouselContent>
          {PROFILE_QUIZ_DATA.map((question, index) => {
            const selected = answers[question.id];
            const isAnswered = Boolean(selected);
            const isCorrect = selected === question.answer;
            const isAnimating = slideAnimations[index];

            const availableOptions = (['A', 'B', 'C', 'D'] as OptionKey[]).filter(
              key => question.options[key]
            );

            // Get slide theme based on question type
            const getSlideTheme = () => {
              switch (question.id) {
                case 'hook-importance': return { icon: '🎯', color: 'from-blue-500 to-purple-600', bg: 'from-blue-50 to-purple-50' };
                case 'show-dont-tell': return { icon: '📖', color: 'from-green-500 to-teal-600', bg: 'from-green-50 to-teal-50' };
                case 'specificity-power': return { icon: '🔍', color: 'from-orange-500 to-red-600', bg: 'from-orange-50 to-red-50' };
                case 'emotional-connection': return { icon: '❤️', color: 'from-pink-500 to-rose-600', bg: 'from-pink-50 to-rose-50' };
                case 'call-to-action': return { icon: '💬', color: 'from-indigo-500 to-blue-600', bg: 'from-indigo-50 to-blue-50' };
                case 'authenticity-balance': return { icon: '⚖️', color: 'from-amber-500 to-orange-600', bg: 'from-amber-50 to-orange-50' };
                case 'length-optimization': return { icon: '📏', color: 'from-emerald-500 to-green-600', bg: 'from-emerald-50 to-green-50' };
                default: return { icon: '❓', color: 'from-gray-500 to-gray-600', bg: 'from-gray-50 to-gray-50' };
              }
            };

            const theme = getSlideTheme();

            return (
              <CarouselItem key={question.id}>
                <Card className={cn(
                  "border-border/70 bg-gradient-to-br transition-all duration-500 overflow-hidden",
                  theme.bg,
                  isAnimating && "scale-105 shadow-lg"
                )}>
                  <CardContent className="space-y-6 p-6">
                    {/* Slide Header */}
                    <div className="text-center space-y-3">
                      <div className={cn(
                        "inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r text-white text-2xl shadow-lg",
                        theme.color
                      )}>
                        {theme.icon}
                      </div>
                      <div className="space-y-2">
                        <span className="inline-flex items-center gap-2 rounded-full bg-white/80 backdrop-blur-sm px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm">
                          <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                          Slide {index + 1} van {totalQuestions}
                        </span>
                        <div className="w-full bg-white/50 rounded-full h-1">
                          <div
                            className="bg-gradient-to-r from-primary to-primary/80 h-1 rounded-full transition-all duration-1000"
                            style={{ width: `${((index + 1) / totalQuestions) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>

                    {/* Question */}
                    <div className="space-y-4">
                      <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 shadow-sm">
                        <p className="text-lg font-semibold text-gray-800 leading-relaxed text-center">
                          {question.question}
                        </p>
                      </div>
                    {/* Answer Options */}
                    <div className="space-y-3">
                      {availableOptions.map((optionKey, optionIndex) => {
                        const option = question.options[optionKey];
                        const selectedThis = selected === optionKey;
                        const showFeedback = isAnswered && selectedThis;
                        const correctOption = question.answer === optionKey;

                        // Stagger animation for options
                        const animationDelay = optionIndex * 100;

                        return (
                          <div key={optionKey} className="space-y-2">
                            <button
                              type="button"
                              onClick={() => {
                                if (!showResults) {
                                  setAnswers((prev) => ({ ...prev, [question.id]: optionKey }));
                                }
                              }}
                              className={cn(
                                'group relative w-full overflow-hidden rounded-xl border-2 bg-white/80 backdrop-blur-sm p-4 text-left transition-all duration-300 hover:shadow-md',
                                showResults
                                  ? correctOption
                                    ? 'border-green-400 bg-gradient-to-r from-green-50 to-emerald-50 text-green-900 shadow-green-100'
                                    : selectedThis
                                    ? 'border-red-400 bg-gradient-to-r from-red-50 to-pink-50 text-red-900 shadow-red-100'
                                    : 'border-gray-200 bg-white/60 text-gray-600'
                                  : selectedThis
                                  ? 'border-primary bg-gradient-to-r from-primary/10 to-primary/5 text-foreground shadow-primary/20 scale-105'
                                  : 'border-gray-200 hover:border-primary/50 hover:bg-white/90'
                              )}
                              disabled={showResults}
                              style={{
                                animationDelay: `${animationDelay}ms`,
                                animation: isAnimating ? 'slideInUp 0.5s ease-out forwards' : undefined
                              }}
                            >
                              {/* Selection indicator */}
                              <div className="absolute left-4 top-1/2 -translate-y-1/2">
                                <div className={cn(
                                  'flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm font-bold transition-all duration-300',
                                  showResults
                                    ? correctOption
                                      ? 'border-green-500 bg-green-500 text-white'
                                      : selectedThis
                                      ? 'border-red-500 bg-red-500 text-white'
                                      : 'border-gray-300 bg-white text-gray-400'
                                    : selectedThis
                                    ? 'border-primary bg-primary text-white'
                                    : 'border-gray-300 bg-white text-gray-400 group-hover:border-primary/50'
                                )}>
                                  {optionKey}
                                </div>
                              </div>

                              {/* Option text */}
                              <div className="ml-12">
                                <span className="text-base leading-relaxed">{option}</span>
                              </div>

                              {/* Correct/incorrect icons */}
                              {showResults && (
                                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                  {correctOption ? (
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500 text-white">
                                      <Lucide.Check className="h-5 w-5" />
                                    </div>
                                  ) : selectedThis ? (
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-500 text-white">
                                      <Lucide.X className="h-5 w-5" />
                                    </div>
                                  ) : null}
                                </div>
                              )}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                    </div>
                  </CardContent>
                </Card>
              </CarouselItem>
            );
          })}
        </CarouselContent>
        <CarouselPrevious className="left-0" />
        <CarouselNext className="right-0" />
      </Carousel>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {!showResults ? (
          <>
            <div className="flex gap-2">
              <Button
                onClick={() => api?.scrollPrev()}
                disabled={currentSlide === 0}
                variant="outline"
                size="sm"
              >
                Vorige
              </Button>
              <Button
                onClick={() => api?.scrollNext()}
                disabled={currentSlide === totalQuestions - 1}
                variant="outline"
                size="sm"
              >
                Volgende
              </Button>
            </div>
            <Button
              onClick={handleSubmit}
              disabled={answeredCount !== totalQuestions}
              className="w-full sm:w-auto"
            >
              Bekijk Mijn Score
            </Button>
          </>
        ) : (
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <Button onClick={resetQuiz} variant="outline" className="w-full sm:w-auto">
              Opnieuw Maken
            </Button>
          </div>
        )}
        {!showResults && answeredCount !== totalQuestions && (
          <span className="text-xs text-muted-foreground">Beantwoord alle vragen om je score te zien.</span>
        )}
      </div>

      {showResults && (
        <div className="rounded-xl border border-primary/40 bg-primary/10 p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <Lucide.Star className="h-6 w-6 text-primary" />
            <div>
              <h4 className="text-lg font-semibold text-foreground">
                {summary.label} – {correctCount}/{totalQuestions} goed
              </h4>
              <p className="text-sm text-muted-foreground">{summary.tone}</p>
            </div>
          </div>
          {incorrectQuestions.length > 0 && (
            <div className="mt-4 rounded-lg bg-background/80 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Tips voor betere profielen
              </p>
              <ul className="mt-2 list-disc space-y-1 pl-4 text-sm text-muted-foreground">
                {incorrectQuestions.map((id) => {
                  const question = PROFILE_QUIZ_DATA.find((item) => item.id === id);
                  if (!question) return null;
                  const questionIndex = PROFILE_QUIZ_DATA.indexOf(question);
                  return (
                    <li key={`hint-${id}`}>
                      Herlees vraag {questionIndex + 1} – juiste antwoord: <strong>{question.answer}: {question.options[question.answer]}</strong>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}