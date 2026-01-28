'use client';

import { useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Battery,
  BatteryLow,
  BatteryMedium,
  BatteryFull,
  ArrowLeft,
  Loader2,
  CheckCircle,
  AlertCircle,
  Zap,
  Moon,
  Sun,
  Users,
  Coffee,
  Heart,
  ChevronRight,
  RefreshCcw,
  Info,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { BottomNavigation } from '@/components/layout/bottom-navigation';

interface Question {
  id: string;
  question: string;
  category: 'social' | 'recovery' | 'energy';
  options: { value: number; label: string; icon?: any }[];
}

const QUESTIONS: Question[] = [
  {
    id: 'social_events',
    question: 'Hoeveel sociale events heb je deze week gehad?',
    category: 'social',
    options: [
      { value: 100, label: 'Geen', icon: Moon },
      { value: 75, label: '1-2', icon: Coffee },
      { value: 50, label: '3-4', icon: Users },
      { value: 25, label: '5+', icon: Zap },
    ],
  },
  {
    id: 'energy_morning',
    question: 'Hoe voel je je meestal \'s ochtends?',
    category: 'energy',
    options: [
      { value: 100, label: 'Vol energie', icon: Sun },
      { value: 70, label: 'Redelijk', icon: Coffee },
      { value: 40, label: 'Moe', icon: Moon },
      { value: 10, label: 'Uitgeput', icon: BatteryLow },
    ],
  },
  {
    id: 'alone_time',
    question: 'Hoeveel alleen-tijd heb je per dag?',
    category: 'recovery',
    options: [
      { value: 100, label: '4+ uur', icon: Moon },
      { value: 70, label: '2-4 uur', icon: Coffee },
      { value: 40, label: '1-2 uur', icon: Users },
      { value: 10, label: '< 1 uur', icon: Zap },
    ],
  },
  {
    id: 'social_drain',
    question: 'Hoe voel je je na een date of sociaal event?',
    category: 'social',
    options: [
      { value: 100, label: 'Energiek', icon: Zap },
      { value: 70, label: 'Neutraal', icon: Coffee },
      { value: 40, label: 'Moe', icon: Moon },
      { value: 10, label: 'Leeggelopen', icon: BatteryLow },
    ],
  },
  {
    id: 'dating_frequency',
    question: 'Hoe vaak wil je idealiter daten per week?',
    category: 'social',
    options: [
      { value: 25, label: '4+ dates', icon: Heart },
      { value: 50, label: '2-3 dates', icon: Users },
      { value: 75, label: '1 date', icon: Coffee },
      { value: 100, label: 'Elke 2 weken', icon: Moon },
    ],
  },
];

interface EnergyResult {
  energyLevel: number;
  socialCapacity: number;
  recoveryNeeded: number;
  recommendation: string;
  tips: string[];
  datingAdvice: string;
}

function EnergieBatterijContent() {
  const router = useRouter();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<EnergyResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const progress = ((currentQuestion + 1) / QUESTIONS.length) * 100;
  const isComplete = currentQuestion >= QUESTIONS.length;

  const handleAnswer = (questionId: string, value: number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));

    if (currentQuestion < QUESTIONS.length - 1) {
      setTimeout(() => setCurrentQuestion((prev) => prev + 1), 300);
    } else {
      submitAssessment({ ...answers, [questionId]: value });
    }
  };

  const submitAssessment = async (finalAnswers: Record<string, number>) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/energie-batterij', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ answers: finalAnswers }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Analyse mislukt');
      }

      setResult(data.result);
    } catch (err: any) {
      setError(err.message || 'Er is iets misgegaan');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetAssessment = () => {
    setCurrentQuestion(0);
    setAnswers({});
    setResult(null);
    setError(null);
  };

  const getBatteryIcon = (level: number) => {
    if (level >= 70) return <BatteryFull className="w-8 h-8 text-green-500" />;
    if (level >= 40) return <BatteryMedium className="w-8 h-8 text-amber-500" />;
    return <BatteryLow className="w-8 h-8 text-red-500" />;
  };

  const getBatteryColor = (level: number) => {
    if (level >= 70) return 'from-green-400 to-green-600';
    if (level >= 40) return 'from-amber-400 to-amber-600';
    return 'from-red-400 to-red-600';
  };

  const currentQ = QUESTIONS[currentQuestion];

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50/50 to-white dark:from-gray-900 dark:to-gray-900 pb-24">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                  <Battery className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Energie Batterij</h1>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Meet je sociale energie</p>
                </div>
              </div>
            </div>
            <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300 border-0">
              Transformatie
            </Badge>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Intro Card */}
        {currentQuestion === 0 && !result && (
          <Card className="border-amber-200 dark:border-amber-700 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/30 dark:to-orange-900/30">
            <CardContent className="p-6">
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center flex-shrink-0">
                  <Info className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white mb-1">Voorkom dating burnout</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Speciaal voor introverts en mensen die snel social drain ervaren.
                    Ontdek hoeveel sociale energie je hebt en hoeveel herstel je nodig hebt.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Progress Bar */}
        {!result && !isSubmitting && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Vraag {currentQuestion + 1} van {QUESTIONS.length}</span>
              <span className="font-medium text-amber-600 dark:text-amber-400">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2 bg-amber-100" />
          </div>
        )}

        {/* Question Card */}
        {!result && !isSubmitting && currentQ && (
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQ.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <Card className="dark:bg-gray-800 dark:border-gray-700">
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                    {currentQ.question}
                  </h2>

                  <div className="grid grid-cols-2 gap-3">
                    {currentQ.options.map((option) => {
                      const Icon = option.icon;
                      const isSelected = answers[currentQ.id] === option.value;

                      return (
                        <button
                          key={option.value}
                          onClick={() => handleAnswer(currentQ.id, option.value)}
                          className={cn(
                            'p-4 rounded-xl border-2 text-left transition-all',
                            isSelected
                              ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/30'
                              : 'border-gray-200 dark:border-gray-600 hover:border-amber-300 dark:hover:border-amber-600 hover:bg-amber-50/50 dark:hover:bg-amber-900/20'
                          )}
                        >
                          {Icon && (
                            <Icon className={cn(
                              'w-6 h-6 mb-2',
                              isSelected ? 'text-amber-600 dark:text-amber-400' : 'text-gray-400'
                            )} />
                          )}
                          <span className={cn(
                            'font-medium',
                            isSelected ? 'text-amber-700 dark:text-amber-300' : 'text-gray-700 dark:text-gray-300'
                          )}>
                            {option.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </AnimatePresence>
        )}

        {/* Loading */}
        {isSubmitting && (
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardContent className="p-12 text-center">
              <Loader2 className="w-12 h-12 text-amber-500 animate-spin mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-300">Je energie wordt berekend...</p>
            </CardContent>
          </Card>
        )}

        {/* Error */}
        {error && (
          <Card className="border-red-200 dark:border-red-700 bg-red-50 dark:bg-red-900/30">
            <CardContent className="p-4 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Results */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              {/* Main Battery Level */}
              <Card className="dark:bg-gray-800 dark:border-gray-700">
                <CardContent className="p-6 text-center">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 flex items-center justify-center mx-auto mb-4">
                    {getBatteryIcon(result.energyLevel)}
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    {result.energyLevel}% Energie
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300">{result.recommendation}</p>
                </CardContent>
              </Card>

              {/* Detailed Scores */}
              <Card className="dark:bg-gray-800 dark:border-gray-700">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2 dark:text-white">
                    <Zap className="w-5 h-5 text-amber-500" />
                    Jouw energie profiel
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Social Capacity */}
                  <div className="p-4 rounded-xl border border-blue-100 dark:border-blue-700 bg-blue-50/50 dark:bg-blue-900/20">
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Sociale capaciteit</span>
                      </div>
                      <span className="text-sm font-bold text-blue-600 dark:text-blue-400">{result.socialCapacity}%</span>
                    </div>
                    <Progress value={result.socialCapacity} className="h-2 bg-blue-100" />
                  </div>

                  {/* Recovery Needed */}
                  <div className="p-4 rounded-xl border border-purple-100 dark:border-purple-700 bg-purple-50/50 dark:bg-purple-900/20">
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-2">
                        <Moon className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Herstel nodig</span>
                      </div>
                      <span className="text-sm font-bold text-purple-600 dark:text-purple-400">{result.recoveryNeeded}%</span>
                    </div>
                    <Progress value={result.recoveryNeeded} className="h-2 bg-purple-100" />
                  </div>
                </CardContent>
              </Card>

              {/* Reflectie Section - Matching Design */}
              <Card className="dark:bg-gray-800 dark:border-gray-700">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg dark:text-white">Reflectie</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Spiegel - Dating Advies */}
                  <div className="p-4 rounded-xl border-2 border-coral-200 dark:border-coral-700 bg-coral-50/50 dark:bg-coral-900/20">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 rounded-full bg-coral-500 flex items-center justify-center">
                        <Heart className="w-3 h-3 text-white" />
                      </div>
                      <Badge className="bg-coral-100 text-coral-700 dark:bg-coral-900/50 dark:text-coral-300 border-0 text-xs">
                        Spiegel
                      </Badge>
                    </div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Dating advies</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{result.datingAdvice}</p>
                  </div>

                  {/* Identiteit - Tips */}
                  <div className="p-4 rounded-xl border-2 border-amber-200 dark:border-amber-700 bg-amber-50/50 dark:bg-amber-900/20">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 rounded-full bg-amber-500 flex items-center justify-center">
                        <Sparkles className="w-3 h-3 text-white" />
                      </div>
                      <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300 border-0 text-xs">
                        Identiteit
                      </Badge>
                    </div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Energie tips</p>
                    <ul className="space-y-1">
                      {result.tips.map((tip, i) => (
                        <li key={i} className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Actie */}
                  <div className="p-4 rounded-xl border-2 border-green-200 dark:border-green-700 bg-green-50/50 dark:bg-green-900/20">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                        <Zap className="w-3 h-3 text-white" />
                      </div>
                      <Badge className="bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300 border-0 text-xs">
                        Actie
                      </Badge>
                    </div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Volgende stap</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Plan je dates op basis van je energieniveau. Check deze tool regelmatig
                      om je sociale batterij te monitoren.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={resetAssessment}
                  className="flex-1 border-gray-200 dark:border-gray-600"
                >
                  <RefreshCcw className="w-4 h-4 mr-2" />
                  Opnieuw
                </Button>
                <Button
                  onClick={() => router.push('/transformatie')}
                  className="flex-1 bg-amber-500 hover:bg-amber-600 text-white"
                >
                  Terug naar cursus
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <BottomNavigation />
    </div>
  );
}

export default function EnergieBatterijPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center dark:bg-gray-900">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
      </div>
    }>
      <EnergieBatterijContent />
    </Suspense>
  );
}
