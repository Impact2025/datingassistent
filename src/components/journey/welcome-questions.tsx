"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Sparkles, MessageSquare, Target, Bell } from 'lucide-react';

interface WelcomeQuestionsProps {
  onComplete: (answers: WelcomeAnswers) => void;
}

export interface WelcomeAnswers {
  writingStyle: string;
  datingApps: string[];
  genderPreference: string;
  remindersEnabled: string;
}

export function WelcomeQuestions({ onComplete }: WelcomeQuestionsProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<WelcomeAnswers>({
    writingStyle: '',
    datingApps: [],
    genderPreference: '',
    remindersEnabled: ''
  });

  const questions = [
    {
      id: 'writingStyle',
      title: 'Jouw schrijfstijl',
      description: 'Hoe wil je dat ik voor jou schrijf?',
      icon: <MessageSquare className="w-6 h-6" />,
      type: 'radio' as const,
      options: [
        { value: 'neutraal', label: 'Neutraal (aanbevolen)', description: 'Balans tussen professioneel en persoonlijk' },
        { value: 'informeel', label: 'Informeel & speels', description: 'Leuk en ontspannen taalgebruik' },
        { value: 'warm', label: 'Warm & empathisch', description: 'Hartelijk en invoelend' },
        { value: 'zelfverzekerd', label: 'Zelfverzekerd & direct', description: 'Krachtig en duidelijk' },
        { value: 'rustig', label: 'Rustig & duidelijk', description: 'Kalm en helder taalgebruik' }
      ],
      reason: 'Ik pas hiermee al jouw berichten, profielteksten en adviezen aan op jouw stijl.'
    },
    {
      id: 'datingApps',
      title: 'Jouw datingapps',
      description: 'Op welke apps werk ik straks met je samen?',
      icon: <Target className="w-6 h-6" />,
      type: 'checkbox' as const,
      options: [
        { value: 'tinder', label: 'Tinder', description: undefined },
        { value: 'bumble', label: 'Bumble', description: undefined },
        { value: 'hinge', label: 'Hinge', description: undefined },
        { value: 'inner-circle', label: 'Inner Circle', description: undefined },
        { value: 'lexa', label: 'Lexa', description: undefined },
        { value: 'andere', label: 'Andere', description: undefined }
      ],
      reason: 'Elke app heeft andere strategieën. Ik optimaliseer per platform.'
    },
    {
      id: 'genderPreference',
      title: 'Op wie val jij?',
      description: 'Op wie val jij? Dan kan ik mijn advies daarop afstemmen.',
      icon: <Sparkles className="w-6 h-6" />,
      type: 'radio' as const,
      options: [
        { value: 'mannen', label: 'Mannen' },
        { value: 'vrouwen', label: 'Vrouwen' },
        { value: 'iedereen', label: 'Iedereen' }
      ],
      reason: 'Voor dynamiek, openingszinnen, profielopbouw en matchselectie.'
    },
    {
      id: 'remindersEnabled',
      title: 'Persoonlijke reminders',
      description: 'Wil je dat ik jou af en toe help herinneren aan je doelen?',
      icon: <Bell className="w-6 h-6" />,
      type: 'radio' as const,
      options: [
        { value: 'ja', label: 'Ja graag', description: 'Ik stuur je af en toe een vriendelijke reminder' },
        { value: 'nee', label: 'Nee', description: 'Ik respecteer je keuze voor volledige autonomie' },
        { value: 'later', label: 'Later beslissen', description: 'Je kunt dit altijd later aanpassen in je instellingen' }
      ],
      reason: 'Activeert micro-coaching (zonder push of druk).'
    }
  ];

  const handleAnswer = (questionId: string, value: string | string[]) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      onComplete(answers);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const currentQ = questions[currentQuestion];
  const isAnswered = currentQ.type === 'checkbox'
    ? (answers[currentQ.id as keyof WelcomeAnswers] as string[]).length > 0
    : answers[currentQ.id as keyof WelcomeAnswers] !== '';

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
        <CardHeader className="text-center pb-6">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center text-white">
            {currentQ.icon}
          </div>
          <div className="flex items-center justify-center space-x-2 mb-4">
            {questions.map((_, index) => (
              <div
                key={index}
                className={`w-3 h-3 rounded-full transition-colors ${
                  index === currentQuestion
                    ? 'bg-pink-500'
                    : index < currentQuestion
                    ? 'bg-green-500'
                    : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
          <CardTitle className="text-xl font-bold text-gray-900">
            {currentQ.title}
          </CardTitle>
          <p className="text-gray-600 mt-2">
            {currentQ.description}
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Question Options */}
          <div className="space-y-3">
            {currentQ.type === 'radio' ? (
              <RadioGroup
                value={answers[currentQ.id as keyof WelcomeAnswers] as string}
                onValueChange={(value) => handleAnswer(currentQ.id, value)}
                className="space-y-3"
              >
                {currentQ.options.map((option) => (
                  <div key={option.value} className="flex items-start space-x-3 p-4 rounded-lg border border-gray-200 hover:border-pink-300 hover:bg-pink-50/50 transition-colors">
                    <RadioGroupItem value={option.value} id={option.value} className="mt-0.5" />
                    <div className="flex-1">
                      <Label
                        htmlFor={option.value}
                        className="font-medium text-gray-900 cursor-pointer"
                      >
                        {option.label}
                      </Label>
                      {option.description && (
                        <p className="text-sm text-gray-600 mt-1">{option.description}</p>
                      )}
                    </div>
                  </div>
                ))}
              </RadioGroup>
            ) : (
              <div className="space-y-3">
                {currentQ.options.map((option) => (
                  <div key={option.value} className="flex items-start space-x-3 p-4 rounded-lg border border-gray-200 hover:border-pink-300 hover:bg-pink-50/50 transition-colors">
                    <Checkbox
                      id={option.value}
                      checked={(answers.datingApps as string[]).includes(option.value)}
                      onCheckedChange={(checked) => {
                        const currentApps = answers.datingApps as string[];
                        if (checked) {
                          handleAnswer('datingApps', [...currentApps, option.value]);
                        } else {
                          handleAnswer('datingApps', currentApps.filter(app => app !== option.value));
                        }
                      }}
                      className="mt-0.5"
                    />
                    <Label
                      htmlFor={option.value}
                      className="font-medium text-gray-900 cursor-pointer flex-1"
                    >
                      {option.label}
                    </Label>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Reason */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>Waarom deze vraag?</strong> {currentQ.reason}
            </p>
          </div>

          {/* Navigation */}
          <div className="flex justify-between pt-4">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
              className="px-6"
            >
              Vorige
            </Button>

            <div className="text-sm text-gray-500 self-center">
              {currentQuestion + 1} van {questions.length}
            </div>

            <Button
              onClick={handleNext}
              disabled={!isAnswered}
              className="bg-pink-500 hover:bg-pink-600 px-6"
            >
              {currentQuestion === questions.length - 1 ? 'Naar Dashboard' : 'Volgende'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}