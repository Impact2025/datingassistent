'use client';

/**
 * Dating Style Quiz - Lead Magnet
 * Strak, minimalistisch en professioneel design
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import {
  Heart, Target, MessageCircle, Clock, Shield,
  ArrowRight, ArrowLeft, Mail, Sparkles, CheckCircle
} from 'lucide-react';
import { Logo } from '@/components/shared/logo';
import { AnalyzingScreen } from './analyzing-screen';

interface QuizQuestion {
  id: number;
  question: string;
  description?: string;
  icon: any;
  options: {
    value: string;
    label: string;
    description?: string;
  }[];
}

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    question: "Wat is je primaire doel?",
    description: "Eerlijk zijn helpt ons je beter te helpen",
    icon: Target,
    options: [
      { value: 'serious', label: 'Serieuze relatie vinden', description: 'Op zoek naar iets blijvends' },
      { value: 'casual', label: 'Leuke dates & nieuwe mensen', description: 'Open minded daten' },
      { value: 'unsure', label: 'Weet ik nog niet precies', description: 'Kijken waar het naartoe gaat' }
    ]
  },
  {
    id: 2,
    question: "Wat is je grootste frustratie met daten?",
    description: "We kunnen je helpen dit op te lossen",
    icon: MessageCircle,
    options: [
      { value: 'conversations_die', label: 'Gesprekken doodbloeden altijd', description: 'Weet niet wat ik moet zeggen' },
      { value: 'no_matches', label: 'Ik krijg niet genoeg matches', description: 'Mijn profiel werkt niet' },
      { value: 'no_dates', label: 'Matches leiden niet tot dates', description: 'Van chat naar date lukt niet' },
      { value: 'no_relationships', label: 'Dates leiden niet tot relaties', description: 'Het blijft bij 1-2 dates' }
    ]
  },
  {
    id: 3,
    question: "Welke dating app gebruik je het meest?",
    description: "Elke app heeft zijn eigen strategie",
    icon: Sparkles,
    options: [
      { value: 'tinder', label: 'Tinder', description: 'De klassieker' },
      { value: 'bumble', label: 'Bumble', description: 'Vrouwen maken eerste stap' },
      { value: 'hinge', label: 'Hinge', description: 'Designed to be deleted' },
      { value: 'none', label: 'Geen apps (meer)', description: 'Ik ben gestopt' }
    ]
  },
  {
    id: 4,
    question: "Hoe comfortabel voel je je bij het chatten?",
    description: "Eerlijkheid is de eerste stap naar groei",
    icon: MessageCircle,
    options: [
      { value: 'uncomfortable', label: 'Ik weet nooit wat ik moet zeggen', description: 'Staar naar het scherm' },
      { value: 'okay', label: 'Gaat wel, maar niet natuurlijk', description: 'Denk te veel na' },
      { value: 'comfortable', label: 'Redelijk comfortabel', description: 'Meestal gaat het goed' },
      { value: 'very_comfortable', label: 'Zeer comfortabel', description: 'Chatten is mijn ding' }
    ]
  },
  {
    id: 5,
    question: "Wat beschrijft jou het beste in relaties?",
    description: "Dit helpt ons je hechtingsstijl te bepalen",
    icon: Heart,
    options: [
      { value: 'avoidant', label: 'Ik trek me snel terug als het serieus wordt', description: 'Behoefte aan ruimte' },
      { value: 'anxious', label: 'Ik word onzeker als de ander afstand neemt', description: 'Behoefte aan bevestiging' },
      { value: 'secure', label: 'Ik ben meestal stabiel en in balans', description: 'Gezonde grenzen' },
      { value: 'fearful', label: 'Ik vermijd eigenlijk relaties', description: 'Bang voor afwijzing' }
    ]
  },
  {
    id: 6,
    question: "Hoeveel tijd heb je per week voor dating?",
    description: "We stemmen het programma af op jouw tempo",
    icon: Clock,
    options: [
      { value: '1-2', label: '1-2 uur', description: 'Drukke agenda' },
      { value: '3-5', label: '3-5 uur', description: 'Gezonde balans' },
      { value: '5+', label: '5+ uur', description: 'Dating is prioriteit' }
    ]
  }
];

interface DatingStyleQuizProps {
  onComplete?: (answers: Record<string, string>, email: string) => void;
}

export function DatingStyleQuiz({ onComplete }: DatingStyleQuizProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [email, setEmail] = useState('');
  const [acceptsMarketing, setAcceptsMarketing] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [direction, setDirection] = useState(1); // 1 = forward, -1 = backward
  const [showAnalyzing, setShowAnalyzing] = useState(false);
  const [resultId, setResultId] = useState<string | null>(null);

  const totalSteps = QUIZ_QUESTIONS.length + 1; // +1 for email step
  const progressPercentage = (currentStep / totalSteps) * 100;
  const currentQuestion = QUIZ_QUESTIONS[currentStep];
  const isEmailStep = currentStep === QUIZ_QUESTIONS.length;

  const handleAnswer = (value: string) => {
    const questionId = currentQuestion.id.toString();
    setAnswers(prev => ({ ...prev, [questionId]: value }));

    // Auto-advance after selection
    setTimeout(() => {
      handleNext();
    }, 300);
  };

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setDirection(1);
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setDirection(-1);
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (!email || !email.includes('@')) return;

    setIsSubmitting(true);

    try {
      // Submit to API
      const response = await fetch('/api/quiz/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          answers,
          email,
          acceptsMarketing,
          timestamp: new Date().toISOString()
        })
      });

      if (response.ok) {
        const data = await response.json();
        setResultId(data.resultId);
        onComplete?.(answers, email);

        // Show analyzing screen (suspense moment!)
        setShowAnalyzing(true);
      }
    } catch (error) {
      console.error('Error submitting quiz:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAnalyzingComplete = () => {
    // Redirect to result page after analyzing animation
    if (resultId) {
      window.location.href = `/quiz/resultaat?id=${resultId}`;
    }
  };

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      x: direction > 0 ? -300 : 300,
      opacity: 0
    })
  };

  // Show analyzing screen after submission
  if (showAnalyzing) {
    return <AnalyzingScreen onComplete={handleAnalyzingComplete} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full space-y-6">
        {/* Logo & Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <Logo iconSize={48} textSize="lg" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Ontdek je Dating Stijl
            </h1>
            <p className="text-gray-600">
              In 2 minuten weet je precies wat jou tegenhoudt
            </p>
          </div>
        </motion.div>

        {/* Progress Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-2"
        >
          <div className="flex justify-between text-sm text-gray-600">
            <span>Vraag {currentStep + 1} van {totalSteps}</span>
            <span>{Math.round(progressPercentage)}%</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </motion.div>

        {/* Question Card */}
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentStep}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3 }}
          >
            <Card className="border-2 border-pink-200 shadow-xl">
              <CardContent className="p-8">
                {!isEmailStep ? (
                  <div className="space-y-6">
                    {/* Question Header */}
                    <div className="text-center space-y-3">
                      <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-pink-500 to-pink-600 flex items-center justify-center shadow-lg">
                        {currentQuestion && <currentQuestion.icon className="w-8 h-8 text-white" />}
                      </div>
                      <h2 className="text-2xl font-bold text-gray-900">
                        {currentQuestion?.question}
                      </h2>
                      {currentQuestion?.description && (
                        <p className="text-gray-600">
                          {currentQuestion.description}
                        </p>
                      )}
                    </div>

                    {/* Options */}
                    <div className="space-y-3">
                      {currentQuestion?.options.map((option) => {
                        const isSelected = answers[currentQuestion.id.toString()] === option.value;
                        return (
                          <button
                            key={option.value}
                            onClick={() => handleAnswer(option.value)}
                            className={`w-full p-4 rounded-lg border-2 text-left transition-all hover:border-pink-300 hover:bg-pink-50 ${
                              isSelected
                                ? 'border-pink-500 bg-pink-50 shadow-md'
                                : 'border-gray-200 bg-white'
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                                isSelected
                                  ? 'border-pink-500 bg-pink-500'
                                  : 'border-gray-300'
                              }`}>
                                {isSelected && <CheckCircle className="w-4 h-4 text-white" />}
                              </div>
                              <div className="flex-1">
                                <div className="font-semibold text-gray-900 mb-1">
                                  {option.label}
                                </div>
                                {option.description && (
                                  <div className="text-sm text-gray-600">
                                    {option.description}
                                  </div>
                                )}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  /* Email Capture Step */
                  <div className="space-y-6">
                    <div className="text-center space-y-3">
                      <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-pink-500 to-pink-600 flex items-center justify-center shadow-lg">
                        <Mail className="w-8 h-8 text-white" />
                      </div>
                      <h2 className="text-2xl font-bold text-gray-900">
                        Laatste stap!
                      </h2>
                      <p className="text-gray-600">
                        Waar sturen we je persoonlijke Dating Stijl Analyse naartoe?
                      </p>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                          E-mailadres
                        </label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="jouw@email.nl"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="h-12 text-base"
                          autoFocus
                        />
                      </div>

                      <label className="flex items-start gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={acceptsMarketing}
                          onChange={(e) => setAcceptsMarketing(e.target.checked)}
                          className="mt-1 w-4 h-4 text-pink-600 rounded border-gray-300 focus:ring-pink-500"
                        />
                        <span className="text-sm text-gray-600">
                          Ja, stuur me wekelijks dating tips en exclusieve aanbiedingen
                        </span>
                      </label>

                      <Button
                        onClick={handleSubmit}
                        disabled={!email || !email.includes('@') || isSubmitting}
                        className="w-full h-12 text-base bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700"
                      >
                        {isSubmitting ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                            Bezig met analyseren...
                          </>
                        ) : (
                          <>
                            Bekijk mijn Dating Stijl
                            <ArrowRight className="w-5 h-5 ml-2" />
                          </>
                        )}
                      </Button>

                      <p className="text-xs text-center text-gray-500">
                        Je ontvangt direct je persoonlijke analyse + concrete tips
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>

        {/* Navigation Buttons */}
        {!isEmailStep && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-between"
          >
            <Button
              variant="ghost"
              onClick={handleBack}
              disabled={currentStep === 0}
              className="text-gray-600"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Vorige
            </Button>

            <Button
              variant="ghost"
              onClick={handleNext}
              disabled={!answers[currentQuestion?.id.toString()]}
              className="text-pink-600"
            >
              Volgende
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </motion.div>
        )}

        {isEmailStep && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <Button
              variant="ghost"
              onClick={handleBack}
              className="text-gray-600"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Vorige
            </Button>
          </motion.div>
        )}

        {/* Trust Badge */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex items-center justify-center gap-2 text-sm text-gray-500"
        >
          <Shield className="w-4 h-4" />
          <span>Je gegevens zijn 100% veilig en worden niet gedeeld</span>
        </motion.div>
      </div>
    </div>
  );
}
