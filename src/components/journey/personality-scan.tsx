"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Users, Target, Sparkles, ArrowRight, ArrowLeft } from "lucide-react";
import { useUser } from '@/providers/user-provider';

interface PersonalityScanProps {
  onComplete: (scanData: any) => void;
  onBack?: () => void;
}

// Define option types to fix TypeScript errors
interface RadioOption {
  value: string;
  label: string;
  description: string;
}

interface CheckboxOption {
  value: string;
  label: string;
  description?: string;
}

const QUESTIONS = [
  {
    id: 'current_situation',
    title: 'Wat is je huidige situatie in daten?',
    type: 'radio',
    icon: Users,
    options: [
      { value: 'single', label: 'Single', description: 'Klaar voor nieuwe ontmoetingen' },
      { value: 'recent_breakup', label: 'Net uit een relatie', description: 'Herstellende van een break-up' },
      { value: 'dating_not_progressing', label: 'Ik date al, maar kom niet verder', description: 'Geen vervolg na eerste dates' },
      { value: 'active_apps_struggling', label: 'Ik ben actief op apps maar het lukt niet echt', description: 'Weinig matches of gesprekken' },
      { value: 'doubting', label: 'Ik ben nog aan het twijfelen of ik wil daten', description: 'Onzeker over de stap' }
    ] as RadioOption[]
  },
  {
    id: 'dating_feeling',
    title: 'Hoe voelt daten voor jou op dit moment?',
    subtitle: '1 = spannend/lastig, 10 = ontspannen & leuk',
    type: 'slider',
    icon: Heart,
    min: 1,
    max: 10,
    labels: ['Spannend/lastig', 'Neutraal', 'Ontspannen & leuk']
  },
  {
    id: 'main_obstacles',
    title: 'Wat loop je nu het meest tegenaan?',
    subtitle: 'Meerdere antwoorden mogelijk',
    type: 'checkbox',
    icon: Target,
    options: [
      { value: 'few_matches', label: 'Te weinig matches' },
      { value: 'profile_insecurity', label: 'Onzeker over mijn profiel / foto\'s' },
      { value: 'shallow_conversations', label: 'Gesprekken blijven oppervlakkig' },
      { value: 'no_dates', label: 'Geen dates' },
      { value: 'dates_no_followup', label: 'Dates worden geen vervolg' },
      { value: 'nervousness', label: 'Onzekerheid / zenuwen' },
      { value: 'self_presentation', label: 'Ik weet niet hoe ik mezelf aantrekkelijk neerzet' }
    ] as CheckboxOption[]
  },
  {
    id: 'goal_30_90_days',
    title: 'Wat wil je de komende 30-90 dagen bereiken?',
    type: 'radio',
    icon: Sparkles,
    options: [
      { value: 'relationship', label: 'Een relatie', description: 'Klaar voor een vaste partner' },
      { value: 'flow_and_joy', label: 'Meer plezier en flow in daten', description: 'Lekkerder in je vel' },
      { value: 'quality_matches', label: 'Meer matches en kwalitatieve gesprekken', description: 'Betere connecties' },
      { value: 'flirting_skills', label: 'Beter worden in flirten / connectie', description: 'Skills verbeteren' },
      { value: 'confidence', label: 'Meer zelfvertrouwen', description: 'Zekerder over jezelf' },
      { value: 'consistent_action', label: 'Leren consistente actie te nemen', description: 'Blijven bewegen' }
    ] as RadioOption[]
  },
  {
    id: 'social_strengths',
    title: 'Welke sterke kanten heb je in sociale situaties?',
    subtitle: 'Bijv. humor, empathie, energie, rust, diepgang, spontaniteit',
    type: 'textarea',
    icon: Heart,
    placeholder: 'Beschrijf je sterktes...'
  },
  {
    id: 'dating_difficulty',
    title: 'Wat vind je op dit moment het moeilijkst aan daten?',
    subtitle: 'Bijv. spanning, afwijzing, openingszinnen, foto\'s, eerlijk zijn, initiatief nemen',
    type: 'textarea',
    icon: Target,
    placeholder: 'Beschrijf wat je moeilijk vindt...'
  },
  {
    id: 'weekly_time',
    title: 'Hoeveel tijd wil je per week investeren?',
    type: 'radio',
    icon: Users,
    options: [
      { value: '1-2h', label: '1-2 uur per week', description: 'Rustig aan beginnen' },
      { value: '3-5h', label: '3-5 uur per week', description: 'Gemiddelde investering' },
      { value: '5h_plus', label: '5+ uur per week', description: 'Serieus aan de slag' },
      { value: 'coach_advice', label: 'Geen idee, coach mag me adviseren', description: 'Laat de coach beslissen' }
    ] as RadioOption[]
  }
];

export function PersonalityScan({ onComplete, onBack }: PersonalityScanProps) {
  const { user } = useUser();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const progress = ((currentQuestion + 1) / QUESTIONS.length) * 100;
  const currentQ = QUESTIONS[currentQuestion];
  const CurrentIcon = currentQ.icon;

  const handleAnswer = (questionId: string, value: any) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleNext = () => {
    if (currentQuestion < QUESTIONS.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      handleSubmit();
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Validate all required answers
      const requiredQuestions = QUESTIONS.filter(q => q.type !== 'textarea');
      const missingAnswers = requiredQuestions.filter(q => !answers[q.id]);

      if (missingAnswers.length > 0) {
        alert('Beantwoord alle vragen om door te gaan');
        setIsSubmitting(false);
        return;
      }

      // Format answers for the coach API
      const scanData = {
        current_situation: answers.current_situation,
        dating_feeling: answers.dating_feeling || 5,
        main_obstacles: answers.main_obstacles || [],
        goal_30_90_days: answers.goal_30_90_days,
        social_strengths: answers.social_strengths || '',
        dating_difficulty: answers.dating_difficulty || '',
        weekly_time: answers.weekly_time
      };

      // Track scan completion
      try {
        console.log('📊 Tracking personality scan completion...');
        // We don't need to wait for this to complete
        // Track scan completion activity
        if (user?.id) {
          fetch('/api/activity/track', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: user.id,
              activityType: 'personality_scan_started',
              data: { questions_answered: Object.keys(answers).length },
              points: 5 // Award points for starting the scan
            }),
          });
        }
      } catch (error) {
        console.error('Failed to track scan start:', error);
        // Non-blocking error - continue even if tracking fails
      }

      onComplete(scanData);
    } catch (error) {
      console.error('Error submitting scan:', error);
      setIsSubmitting(false);
    }
  };

  const canProceed = () => {
    const answer = answers[currentQ.id];
    if (!answer) return false;

    if (currentQ.type === 'textarea') {
      return answer.trim().length >= 10; // Minimum 10 characters
    }

    if (currentQ.type === 'checkbox') {
      return Array.isArray(answer) && answer.length > 0; // At least one checkbox selected
    }

    return true;
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto py-8">

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
            Jouw Dating Persoonlijkheid
          </h1>
          <p className="text-muted-foreground">
            7 vragen om je unieke dating DNA te ontdekken
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-foreground">
              Vraag {currentQuestion + 1} van {QUESTIONS.length}
            </span>
            <span className="text-sm text-muted-foreground">
              {Math.round(progress)}% compleet
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Question Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="border border-border shadow-sm">
              <CardHeader className="text-center pb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
                  <CurrentIcon className="w-8 h-8 text-primary" />
                </div>
                <CardTitle className="text-xl md:text-2xl text-foreground">
                  {currentQ.title}
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-6">

                {/* Radio Group Questions */}
                {currentQ.type === 'radio' && (
                  <RadioGroup
                    value={answers[currentQ.id] || ''}
                    onValueChange={(value) => handleAnswer(currentQ.id, value)}
                    className="space-y-3"
                  >
                    {currentQ.options?.map((option) => (
                      <div key={option.value} className="flex items-start space-x-3">
                        <RadioGroupItem
                          value={option.value}
                          id={option.value}
                          className="mt-1"
                        />
                        <Label
                          htmlFor={option.value}
                          className="flex-1 cursor-pointer"
                        >
                          <div className="font-medium text-foreground">
                            {option.label}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {option.description}
                          </div>
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                )}

                {/* Slider Questions */}
                {currentQ.type === 'slider' && (
                  <div className="space-y-6">
                    <div className="px-2">
                      <Slider
                        value={[answers[currentQ.id] || 5]}
                        onValueChange={(value) => handleAnswer(currentQ.id, value[0])}
                        max={currentQ.max}
                        min={currentQ.min}
                        step={1}
                        className="w-full"
                      />
                    </div>
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>{currentQ.labels?.[0]}</span>
                      <span className="font-medium text-lg text-foreground">
                        {answers[currentQ.id] || 5}
                      </span>
                      <span>{currentQ.labels?.[2]}</span>
                    </div>
                  </div>
                )}

                {/* Checkbox Questions */}
                {currentQ.type === 'checkbox' && (
                  <div className="space-y-3">
                    {currentQ.subtitle && (
                      <p className="text-sm text-muted-foreground mb-4">{currentQ.subtitle}</p>
                    )}
                    {currentQ.options?.map((option) => (
                      <div key={option.value} className="flex items-center space-x-3">
                        <Checkbox
                          id={option.value}
                          checked={(answers[currentQ.id] || []).includes(option.value)}
                          onCheckedChange={(checked) => {
                            const current = answers[currentQ.id] || [];
                            const updated = checked
                              ? [...current, option.value]
                              : current.filter((v: string) => v !== option.value);
                            handleAnswer(currentQ.id, updated);
                          }}
                        />
                        <Label
                          htmlFor={option.value}
                          className="text-foreground cursor-pointer flex-1"
                        >
                          {option.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                )}

                {/* Textarea Questions */}
                {currentQ.type === 'textarea' && (
                  <Textarea
                    placeholder={currentQ.placeholder}
                    value={answers[currentQ.id] || ''}
                    onChange={(e) => handleAnswer(currentQ.id, e.target.value)}
                    className="min-h-[120px] resize-none"
                    maxLength={500}
                  />
                )}

                {/* Navigation */}
                <div className="flex justify-between items-center pt-6 border-t">
                  <Button
                    variant="outline"
                    onClick={currentQuestion === 0 ? onBack : handlePrevious}
                    disabled={isSubmitting}
                    className="flex items-center gap-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    {currentQuestion === 0 ? 'Terug' : 'Vorige'}
                  </Button>

                  <Button
                    onClick={handleNext}
                    disabled={!canProceed() || isSubmitting}
                    className="flex items-center gap-2"
                  >
                    {isSubmitting ? (
                      'Verwerken...'
                    ) : currentQuestion === QUESTIONS.length - 1 ? (
                      'Genereer mijn DNA!'
                    ) : (
                      <>
                        Volgende
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </Button>
                </div>

              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>

        {/* Question Indicators */}
        <div className="flex justify-center mt-8 space-x-2">
          {QUESTIONS.map((_, index) => (
            <div
              key={index}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentQuestion
                  ? 'bg-primary scale-125'
                  : index < currentQuestion
                  ? 'bg-green-600'
                  : 'bg-muted'
              }`}
            />
          ))}
        </div>

      </div>
    </div>
  );
}