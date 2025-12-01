'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { ArrowRight, Target, Heart, Zap } from 'lucide-react';

interface MiniIntakeProps {
  sessionId: number;
  onComplete: () => void;
}

export function MiniIntake({ sessionId, onComplete }: MiniIntakeProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({
    goal: '',
    valuesImportance: '',
    datingStyle: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const questions = [
    {
      id: 'goal',
      title: 'Wat is op dit moment jouw belangrijkste doel in daten?',
      subtitle: 'Dit helpt ons om de vragen af te stemmen op jouw situatie.',
      icon: <Target className="w-6 h-6 text-blue-500" />,
      options: [
        { value: 'relatie_vinden', label: 'Een relatie vinden', description: 'Serieus op zoek naar een partner' },
        { value: 'zelf_begrijpen', label: 'Mijzelf beter begrijpen', description: 'Meer inzicht in wat ik wil' },
        { value: 'ontdekken_wat_past', label: 'Ontdekken wat bij me past', description: 'Verkennen van mogelijkheden' },
        { value: 'weet_niet', label: 'Ik weet het nog niet', description: 'Nog zoekende naar richting' }
      ]
    },
    {
      id: 'valuesImportance',
      title: 'Hoe belangrijk zijn gedeelde waarden voor jou in een relatie?',
      subtitle: 'Dit bepaalt hoe we de resultaten interpreteren.',
      icon: <Heart className="w-6 h-6 text-pink-500" />,
      options: [
        { value: 'niet_belangrijk', label: 'Niet zo belangrijk', description: 'Andere dingen wegen zwaarder' },
        { value: 'best_belangrijk', label: 'Best belangrijk', description: 'Goede basis voor connectie' },
        { value: 'heel_belangrijk', label: 'Heel belangrijk', description: 'Essentieel voor succes' },
        { value: 'cruciaal', label: 'Cruciaal', description: 'Kan niet zonder' }
      ]
    },
    {
      id: 'datingStyle',
      title: 'Hoe zou je jouw huidige datingstijl omschrijven?',
      subtitle: 'Dit helpt ons om gepaste strategieën voor te stellen.',
      icon: <Zap className="w-6 h-6 text-purple-500" />,
      options: [
        { value: 'impulsief', label: 'Impulsief / Intuïtief', description: 'Ga op gevoel, spontane beslissingen' },
        { value: 'doordacht', label: 'Doordacht / Nadenkend', description: 'Analyseer eerst, dan beslissen' },
        { value: 'zoekende', label: 'Nog zoekende', description: 'Bezig met ontdekken wat werkt' }
      ]
    }
  ];

  const currentQ = questions[currentQuestion];

  const handleAnswerSelect = (value: string) => {
    setAnswers(prev => ({
      ...prev,
      [currentQ.id]: value
    }));
  };

  const handleNext = async () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      // Submit intake data
      await submitIntake();
    }
  };

  const submitIntake = async () => {
    setSubmitting(true);
    try {
      const token = localStorage.getItem('datespark_auth_token');
      if (!token) return;

      const response = await fetch('/api/waarden-kompas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          action: 'update_intake',
          data: {
            goal: answers.goal,
            valuesImportance: answers.valuesImportance,
            datingStyle: answers.datingStyle
          }
        }),
      });

      if (response.ok) {
        onComplete();
      } else {
        console.error('Failed to submit intake');
      }
    } catch (error) {
      console.error('Error submitting intake:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const canProceed = answers[currentQ.id as keyof typeof answers] !== '';
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <Card className="bg-white border-0 shadow-sm rounded-xl max-w-2xl mx-auto">
      <CardHeader className="text-center p-10">
        <div className="w-16 h-16 bg-pink-100 rounded-2xl flex items-center justify-center mx-auto mb-8">
          {currentQ.icon}
        </div>
        <CardTitle className="text-2xl font-bold text-gray-900 mb-4">
          {currentQ.title}
        </CardTitle>
        <p className="text-gray-600 mb-8 text-lg leading-relaxed">
          {currentQ.subtitle}
        </p>

        {/* Progress indicator */}
        <div className="space-y-4">
          <div className="flex justify-between text-sm text-gray-500">
            <span>Vraag {currentQuestion + 1} van {questions.length}</span>
            <span>{Math.round(progress)}% compleet</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-pink-500 h-3 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </CardHeader>

      <CardContent className="px-10 pb-10 space-y-8">
        <RadioGroup
          value={answers[currentQ.id as keyof typeof answers]}
          onValueChange={handleAnswerSelect}
          className="space-y-4"
        >
          {currentQ.options.map((option) => (
            <div key={option.value} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-xl border border-gray-200 hover:bg-gray-100 transition-colors">
              <RadioGroupItem
                value={option.value}
                id={option.value}
                className="mt-1"
              />
              <Label
                htmlFor={option.value}
                className="flex-1 cursor-pointer"
              >
                <div className="font-semibold text-gray-900 text-lg">
                  {option.label}
                </div>
                <div className="text-gray-600 mt-2 leading-relaxed">
                  {option.description}
                </div>
              </Label>
            </div>
          ))}
        </RadioGroup>

        <div className="space-y-4">
          <Button
            onClick={handleNext}
            disabled={!canProceed || submitting}
            className="w-full bg-pink-500 hover:bg-pink-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all py-4 text-lg"
            size="lg"
          >
            {submitting ? (
              'Opslaan...'
            ) : currentQuestion === questions.length - 1 ? (
              <>
                Start Waarden Onderzoek
                <ArrowRight className="w-5 h-5 ml-2" />
              </>
            ) : (
              <>
                Volgende Vraag
                <ArrowRight className="w-5 h-5 ml-2" />
              </>
            )}
          </Button>

          {currentQuestion > 0 && (
            <Button
              variant="outline"
              onClick={() => setCurrentQuestion(prev => prev - 1)}
              className="w-full border-gray-300 text-gray-700 hover:bg-gray-50 rounded-full shadow-lg hover:shadow-xl transition-all py-4 text-lg"
            >
              Vorige Vraag
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}