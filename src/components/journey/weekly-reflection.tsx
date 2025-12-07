"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  TrendingUp,
  Target,
  Lightbulb,
  CheckCircle,
  ArrowRight,
  Sparkles,
  Heart,
  Star,
  MessageCircle,
  Users
} from "lucide-react";

interface WeeklyReflectionProps {
  userId: number;
  weekStart?: Date;
  onComplete?: (reflection: any) => void;
  onSkip?: () => void;
}

interface ReflectionData {
  whatWentWell: string[];
  whatChallenged: string[];
  keyLearnings: string[];
  nextWeekFocus: string[];
  overallSentiment: 'very_positive' | 'positive' | 'neutral' | 'challenging' | 'difficult';
}

const SENTIMENT_OPTIONS = [
  { value: 'very_positive', label: 'Zeer Positief', emoji: '😊', color: 'bg-green-500' },
  { value: 'positive', label: 'Positief', emoji: '🙂', color: 'bg-green-400' },
  { value: 'neutral', label: 'Neutraal', emoji: '😐', color: 'bg-yellow-500' },
  { value: 'challenging', label: 'Uitdagend', emoji: '😕', color: 'bg-orange-500' },
  { value: 'difficult', label: 'Moeilijk', emoji: '😢', color: 'bg-red-500' }
];

const REFLECTION_QUESTIONS = [
  {
    key: 'whatWentWell',
    title: 'Wat ging er goed deze week?',
    placeholder: 'Bijv: Ik heb 3 berichten verstuurd, mijn profiel foto bijgewerkt, een date gehad...',
    icon: CheckCircle,
    color: 'text-green-600'
  },
  {
    key: 'whatChallenged',
    title: 'Wat was uitdagend?',
    placeholder: 'Bijv: Weinig responses gekregen, moeite met opener zinnen, tijd vinden...',
    icon: Target,
    color: 'text-orange-600'
  },
  {
    key: 'keyLearnings',
    title: 'Wat heb je geleerd?',
    placeholder: 'Bijv: Kwaliteit boven kwantiteit bij berichten, oogcontact helpt, neem initiatief...',
    icon: Lightbulb,
    color: 'text-yellow-600'
  },
  {
    key: 'nextWeekFocus',
    title: 'Waar focus je volgende week op?',
    placeholder: 'Bijv: Meer variatie in berichten, profiel tekst verbeteren, 2 dates plannen...',
    icon: ArrowRight,
    color: 'text-blue-600'
  }
];

export function WeeklyReflection({ userId, weekStart, onComplete, onSkip }: WeeklyReflectionProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [reflection, setReflection] = useState<ReflectionData>({
    whatWentWell: [],
    whatChallenged: [],
    keyLearnings: [],
    nextWeekFocus: [],
    overallSentiment: 'neutral'
  });
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [showInsights, setShowInsights] = useState(false);
  const [aiInsights, setAiInsights] = useState<string[]>([]);
  const [aiRecommendations, setAiRecommendations] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mock data - in real implementation, this would come from the service
  const weekStats = {
    activitiesCompleted: 12,
    messagesSent: 8,
    datesScheduled: 1,
    profileViews: 15,
    responseRate: 62.5,
    currentStreak: 5
  };

  const mockAiInsights = [
    'Je bent consistent actief geweest - dat is de basis voor succes!',
    'Je response rate van 62.5% is bovengemiddeld - focus op kwaliteit berichten.',
    '1 date gepland is een mooie stap - bouw hierop voort.',
    'Profiel views nemen toe - je optimalisaties werken!'
  ];

  const mockRecommendations = [
    'Stuur deze week 3 berichten naar matches met persoonlijke details',
    'Update je profiel bio met je hobby\'s en interesses',
    'Plan 1-2 dates voor volgende week om momentum te houden',
    'Lees 1 artikel over conversation starters'
  ];

  useEffect(() => {
    // Load existing reflection data if available
    loadExistingReflection();
  }, [userId, weekStart]);

  const loadExistingReflection = async () => {
    // Mock loading - in real implementation, call the service
    setTimeout(() => {
      // If no existing data, continue with empty state
    }, 500);
  };

  const handleAnswerSubmit = () => {
    if (!currentAnswer.trim()) return;

    const answers = currentAnswer.split('\n').filter(line => line.trim());
    const questionKey = REFLECTION_QUESTIONS[currentStep].key as keyof ReflectionData;

    if (Array.isArray(reflection[questionKey])) {
      setReflection(prev => ({
        ...prev,
        [questionKey]: answers
      }));
    }

    setCurrentAnswer('');

    if (currentStep < REFLECTION_QUESTIONS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      // Show AI insights
      setShowInsights(true);
      setAiInsights(mockAiInsights);
      setAiRecommendations(mockRecommendations);
    }
  };

  const handleSentimentSelect = (sentiment: ReflectionData['overallSentiment']) => {
    setReflection(prev => ({ ...prev, overallSentiment: sentiment }));
  };

  const handleComplete = async () => {
    setIsSubmitting(true);

    try {
      // In real implementation, save to service
      const completeReflection = {
        ...reflection,
        aiInsights,
        aiRecommendations,
        weekStats,
        completedAt: new Date()
      };

      if (onComplete) {
        onComplete(completeReflection);
      }
    } catch (error) {
      console.error('Error completing reflection:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentQuestion = REFLECTION_QUESTIONS[currentStep];
  const CurrentIcon = currentQuestion?.icon;

  if (showInsights) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 p-4">
        <div className="max-w-3xl mx-auto space-y-6">

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
              Jouw Week Analyse ✨
            </h1>
            <p className="text-gray-600">
              AI-powered inzichten gebaseerd op je voortgang
            </p>
          </motion.div>

          {/* Week Stats */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                  Deze Week in Cijfers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600 mb-1">
                      {weekStats.activitiesCompleted}
                    </div>
                    <div className="text-sm text-gray-600">Activiteiten</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600 mb-1">
                      {weekStats.messagesSent}
                    </div>
                    <div className="text-sm text-gray-600">Berichten</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600 mb-1">
                      {weekStats.datesScheduled}
                    </div>
                    <div className="text-sm text-gray-600">Dates</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600 mb-1">
                      {weekStats.responseRate}%
                    </div>
                    <div className="text-sm text-gray-600">Response Rate</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-pink-600 mb-1">
                      {weekStats.currentStreak}
                    </div>
                    <div className="text-sm text-gray-600">Streak</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-indigo-600 mb-1">
                      {weekStats.profileViews}
                    </div>
                    <div className="text-sm text-gray-600">Profiel Views</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* AI Insights */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="border-0 shadow-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  AI Inzichten
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {aiInsights.map((insight, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-300 flex-shrink-0 mt-0.5" />
                    <span className="text-blue-100">{insight}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          {/* Recommendations */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-green-600" />
                  Aanbevelingen voor Volgende Week
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {aiRecommendations.map((rec, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                    <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                      {index + 1}
                    </div>
                    <span className="text-green-800">{rec}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          {/* Overall Sentiment */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Hoe voelde deze week overall?</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3">
                  {SENTIMENT_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => handleSentimentSelect(option.value as any)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
                        reflection.overallSentiment === option.value
                          ? `${option.color} text-white shadow-lg scale-105`
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <span className="text-lg">{option.emoji}</span>
                      <span className="font-medium">{option.label}</span>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Complete Actions */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1 }}
            className="flex gap-4 justify-center"
          >
            <Button
              variant="outline"
              onClick={onSkip}
              className="px-8"
            >
              Sla over
            </Button>
            <Button
              onClick={handleComplete}
              disabled={isSubmitting}
              className="px-8 bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700"
            >
              {isSubmitting ? 'Opslaan...' : 'Reflectie Voltooien ✨'}
            </Button>
          </motion.div>

        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 p-4">
      <div className="max-w-2xl mx-auto py-8">

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
            Wekelijkse Reflectie
          </h1>
          <p className="text-gray-600">
            Neem tijd om terug te kijken op je voortgang
          </p>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">
              Vraag {currentStep + 1} van {REFLECTION_QUESTIONS.length}
            </span>
            <span className="text-sm text-gray-500">
              {Math.round(((currentStep + 1) / REFLECTION_QUESTIONS.length) * 100)}% compleet
            </span>
          </div>
          <Progress value={(currentStep + 1) / REFLECTION_QUESTIONS.length * 100} className="h-2" />
        </div>

        {/* Question Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
              <CardHeader className="text-center pb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-4">
                  {CurrentIcon && <CurrentIcon className="w-8 h-8 text-white" />}
                </div>
                <CardTitle className="text-xl md:text-2xl">
                  {currentQuestion.title}
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-6">
                <Textarea
                  placeholder={currentQuestion.placeholder}
                  value={currentAnswer}
                  onChange={(e) => setCurrentAnswer(e.target.value)}
                  className="min-h-[120px] resize-none"
                  maxLength={1000}
                />

                <div className="flex justify-between items-center pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
                    disabled={currentStep === 0}
                    className="flex items-center gap-2"
                  >
                    <ArrowRight className="w-4 h-4 rotate-180" />
                    Vorige
                  </Button>

                  <Button
                    onClick={handleAnswerSubmit}
                    disabled={!currentAnswer.trim()}
                    className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                  >
                    {currentStep === REFLECTION_QUESTIONS.length - 1 ? 'Genereer Inzichten' : 'Volgende'}
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>

        {/* Quick Stats Preview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8"
        >
          <Card className="border-0 shadow-lg bg-gradient-to-r from-pink-500 to-pink-600 text-white">
            <CardContent className="p-6 text-center">
              <h3 className="text-lg font-bold mb-2">Deze Week</h3>
              <div className="flex justify-center gap-6 text-sm">
                <div>
                  <div className="text-2xl font-bold">{weekStats.activitiesCompleted}</div>
                  <div>Activiteiten</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">{weekStats.messagesSent}</div>
                  <div>Berichten</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">{weekStats.datesScheduled}</div>
                  <div>Dates</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

      </div>
    </div>
  );
}