"use client";

/**
 * Dating DNA Assessment
 * 7 strategische vragen die user type bepalen en AI context vullen
 * Modern design met smooth animaties
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Heart, MessageCircle, Target, TrendingUp, Clock, Sparkles,
  ChevronRight, ChevronLeft, CheckCircle2
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface Question {
  id: number;
  text: string;
  icon: any;
  color: string;
  options: QuestionOption[];
  aiContext: string;
}

interface QuestionOption {
  value: string;
  label: string;
  description?: string;
  userType?: string; // Helps determine A/B/C/D
}

interface DatingDNAAssessmentProps {
  onComplete: (answers: Record<number, string>, userType: string) => void;
}

const questions: Question[] = [
  {
    id: 1,
    text: "Heb je momenteel een actief dating profiel?",
    icon: User,
    color: "pink",
    aiContext: "datingSituation",
    options: [
      { value: "active", label: "Ja, actief", description: "Ik gebruik dating apps regelmatig", userType: "B" },
      { value: "inactive", label: "Ja, maar inactief", description: "Heb een profiel maar gebruik het weinig", userType: "A" },
      { value: "none", label: "Nee, nog niet", description: "Nog geen dating profiel gemaakt", userType: "A" },
      { value: "multiple", label: "Meerdere apps", description: "Actief op verschillende platforms", userType: "C" }
    ]
  },
  {
    id: 2,
    text: "Wat is je grootste uitdaging met daten?",
    icon: Target,
    color: "purple",
    aiContext: "mainChallenge",
    options: [
      { value: "profile", label: "Profiel maken die klikt", description: "Weet niet hoe ik mezelf moet presenteren", userType: "A" },
      { value: "matches", label: "Matches krijgen", description: "Krijg te weinig likes of matches", userType: "B" },
      { value: "conversations", label: "Gesprekken starten", description: "Weet niet wat ik moet zeggen", userType: "B" },
      { value: "dates", label: "Van chat naar date", description: "Gesprekken leiden niet tot afspraken", userType: "C" },
      { value: "depth", label: "Dates die leiden tot meer", description: "Dates blijven oppervlakkig", userType: "D" }
    ]
  },
  {
    id: 3,
    text: "Wat zoek je op dit moment?",
    icon: Heart,
    color: "rose",
    aiContext: "relationshipGoal",
    options: [
      { value: "serious", label: "Serieuze relatie", description: "Op zoek naar een lange termijn partner" },
      { value: "exploring", label: "Ontdekken wat ik wil", description: "Nog niet zeker, wil ervaring opdoen" },
      { value: "casual", label: "Casual dating", description: "Leuke contacten zonder directe verwachtingen" },
      { value: "friendship", label: "Vriendschap eerst", description: "Laat het organisch groeien" }
    ]
  },
  {
    id: 4,
    text: "Hoe zou je je communicatiestijl beschrijven?",
    icon: MessageCircle,
    color: "blue",
    aiContext: "communicationStyle",
    options: [
      { value: "direct", label: "Direct en eerlijk", description: "Zeg waar het op staat" },
      { value: "thoughtful", label: "Voorzichtig en bedachtzaam", description: "Denk goed na voor ik iets zeg" },
      { value: "playful", label: "Speels en luchtig", description: "Hou het licht en fun" },
      { value: "deep", label: "Diepgaand en filosofisch", description: "Hou van betekenisvolle gesprekken" }
    ]
  },
  {
    id: 5,
    text: "Wat is je sterkste punt in daten?",
    icon: Sparkles,
    color: "yellow",
    aiContext: "strengths",
    options: [
      { value: "listening", label: "Goed luisteren", description: "Mensen voelen zich gehoord" },
      { value: "conversation", label: "Interessante gesprekken", description: "Kan over veel praten" },
      { value: "comfort", label: "Mensen op hun gemak stellen", description: "Creëer veilige sfeer" },
      { value: "authentic", label: "Authenticiteit", description: "Gewoon mezelf zijn" },
      { value: "unsure", label: "Weet ik nog niet", description: "Nog aan het ontdekken" }
    ]
  },
  {
    id: 6,
    text: "Waar wil je als eerste aan werken?",
    icon: TrendingUp,
    color: "green",
    aiContext: "improvementFocus",
    options: [
      { value: "profile", label: "Mijn profiel", description: "Betere foto's en bio", userType: "A" },
      { value: "conversations", label: "Gesprekken voeren", description: "Beter chatten en connecteren", userType: "B" },
      { value: "confidence", label: "Zelfvertrouwen", description: "Meer zeker van mezelf worden", userType: "A" },
      { value: "connection", label: "Connectie maken", description: "Diepere band opbouwen", userType: "C" },
      { value: "everything", label: "Alles", description: "Complete dating upgrade", userType: "D" }
    ]
  },
  {
    id: 7,
    text: "Hoeveel tijd kun je per week investeren?",
    icon: Clock,
    color: "indigo",
    aiContext: "timeCommitment",
    options: [
      { value: "minimal", label: "1-2 uur", description: "Quick wins en efficiëntie" },
      { value: "moderate", label: "3-5 uur", description: "Stabiele groei" },
      { value: "intensive", label: "5+ uur", description: "Snelle transformatie" },
      { value: "flexible", label: "Nog niet zeker", description: "Hangt van resultaten af" }
    ]
  }
];

const colorMap: Record<string, string> = {
  pink: "from-coral-500 to-rose-500",
  purple: "from-purple-500 to-indigo-500",
  rose: "from-rose-500 to-coral-500",
  blue: "from-blue-500 to-cyan-500",
  yellow: "from-yellow-500 to-orange-500",
  green: "from-green-500 to-emerald-500",
  indigo: "from-indigo-500 to-purple-500"
};

const bgColorMap: Record<string, string> = {
  pink: "bg-coral-100 text-coral-700",
  purple: "bg-purple-100 text-purple-700",
  rose: "bg-rose-100 text-rose-700",
  blue: "bg-blue-100 text-blue-700",
  yellow: "bg-yellow-100 text-yellow-700",
  green: "bg-green-100 text-green-700",
  indigo: "bg-indigo-100 text-indigo-700"
};

export function DatingDNAAssessment({ onComplete }: DatingDNAAssessmentProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward');

  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const isLastQuestion = currentQuestion === questions.length - 1;
  const canGoNext = answers[questions[currentQuestion].id] !== undefined;
  const canGoBack = currentQuestion > 0;

  const handleSelectOption = (value: string) => {
    setAnswers(prev => ({
      ...prev,
      [questions[currentQuestion].id]: value
    }));
  };

  const handleNext = () => {
    if (isLastQuestion && canGoNext) {
      // Determine user type based on answers
      const userType = determineUserType(answers);
      onComplete(answers, userType);
    } else if (canGoNext) {
      setDirection('forward');
      setCurrentQuestion(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (canGoBack) {
      setDirection('backward');
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const determineUserType = (answers: Record<number, string>): string => {
    // Count userType indicators from answers
    const typeScores: Record<string, number> = { A: 0, B: 0, C: 0, D: 0 };

    questions.forEach(q => {
      const selectedOption = q.options.find(opt => opt.value === answers[q.id]);
      if (selectedOption?.userType) {
        typeScores[selectedOption.userType]++;
      }
    });

    // Determine dominant type
    const dominantType = Object.entries(typeScores).reduce((a, b) =>
      b[1] > a[1] ? b : a
    )[0];

    return dominantType;
  };

  const question = questions[currentQuestion];
  const IconComponent = question.icon;
  const selectedAnswer = answers[question.id];

  return (
    <div className="space-y-6">
      {/* Progress Header */}
      <Card className="border-2 border-coral-200 shadow-lg">
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center bg-gradient-to-br",
                  colorMap[question.color]
                )}>
                  <IconComponent className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Jouw Dating DNA</h3>
                  <p className="text-sm text-gray-600">
                    Vraag {currentQuestion + 1} van {questions.length}
                  </p>
                </div>
              </div>
              <Badge className={bgColorMap[question.color]}>
                {Math.round(progress)}%
              </Badge>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Question Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestion}
          initial={{ opacity: 0, x: direction === 'forward' ? 50 : -50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: direction === 'forward' ? -50 : 50 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="border-2 hover:shadow-xl transition-shadow">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {question.text}
              </h2>

              <div className="space-y-3">
                {question.options.map((option, index) => {
                  const isSelected = selectedAnswer === option.value;

                  return (
                    <motion.div
                      key={option.value}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <button
                        onClick={() => handleSelectOption(option.value)}
                        className={cn(
                          "w-full text-left p-4 rounded-lg border-2 transition-all",
                          isSelected
                            ? "border-coral-500 bg-coral-50 shadow-md scale-[1.02]"
                            : "border-gray-200 hover:border-coral-300 hover:bg-gray-50"
                        )}
                      >
                        <div className="flex items-start gap-3">
                          <div className={cn(
                            "w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5",
                            isSelected
                              ? "border-coral-500 bg-coral-500"
                              : "border-gray-300"
                          )}>
                            {isSelected && (
                              <CheckCircle2 className="w-4 h-4 text-white" />
                            )}
                          </div>
                          <div className="flex-1">
                            <p className={cn(
                              "font-semibold mb-1",
                              isSelected ? "text-coral-700" : "text-gray-900"
                            )}>
                              {option.label}
                            </p>
                            {option.description && (
                              <p className="text-sm text-gray-600">
                                {option.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </button>
                    </motion.div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex items-center justify-between gap-4">
        <Button
          variant="outline"
          onClick={handleBack}
          disabled={!canGoBack}
          className="w-32"
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Vorige
        </Button>

        <div className="flex gap-2">
          {questions.map((_, index) => (
            <div
              key={index}
              className={cn(
                "w-2 h-2 rounded-full transition-all",
                index === currentQuestion
                  ? "bg-coral-500 w-8"
                  : index < currentQuestion
                  ? "bg-green-500"
                  : "bg-gray-300"
              )}
            />
          ))}
        </div>

        <Button
          onClick={handleNext}
          disabled={!canGoNext}
          className={cn(
            "w-32 transition-all",
            isLastQuestion
              ? "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
              : "bg-gradient-to-r from-coral-500 to-coral-600 hover:from-coral-600 hover:to-coral-700"
          )}
        >
          {isLastQuestion ? "Voltooien" : "Volgende"}
          {!isLastQuestion && <ChevronRight className="w-4 h-4 ml-2" />}
        </Button>
      </div>
    </div>
  );
}
