"use client";

/**
 * Assessment Flow - Quick 3-minute profile assessment
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';

interface AssessmentFlowProps {
  onComplete: (data: any) => void;
  onBack: () => void;
}

const ASSESSMENT_STEPS = [
  {
    id: 'current-situation',
    title: 'Huidige Situatie',
    subtitle: 'Waar ben je nu?',
    questions: [
      {
        id: 'hasProfile',
        label: 'Heb je al een dating profiel?',
        type: 'radio',
        options: [
          { value: 'yes', label: 'Ja, ik heb al een profiel' },
          { value: 'no', label: 'Nee, ik begin vanaf nul' }
        ]
      },
      {
        id: 'platform',
        label: 'Op welke app(s)?',
        type: 'multiselect',
        dependsOn: { hasProfile: 'yes' },
        options: [
          'Tinder',
          'Bumble',
          'Hinge',
          'Happn',
          'Inner Circle',
          'Anders'
        ]
      },
      {
        id: 'currentMatches',
        label: 'Krijg je matches?',
        type: 'radio',
        dependsOn: { hasProfile: 'yes' },
        options: [
          { value: 'many', label: 'Veel (10+ per week)' },
          { value: 'average', label: 'Gemiddeld (3-10 per week)' },
          { value: 'few', label: 'Weinig (1-3 per week)' },
          { value: 'none', label: 'Geen of bijna geen' }
        ]
      }
    ]
  },
  {
    id: 'personality',
    title: 'Leer Je Kennen',
    subtitle: 'Snel persoonlijkheidsscan',
    questions: [
      {
        id: 'coreValues',
        label: 'Wat zijn je 3 belangrijkste waarden?',
        type: 'tags',
        placeholder: 'Bijv: Eerlijkheid, Avontuur, Vrijheid...',
        maxTags: 3
      },
      {
        id: 'uniqueTrait',
        label: 'Wat maakt jou uniek?',
        type: 'textarea',
        placeholder: 'Deel iets specifieks over jezelf...',
        hint: 'Wees concreet! Niet "Ik ben grappig", maar "Ik maak altijd woordgrappen met groente namen"'
      },
      {
        id: 'lookingFor',
        label: 'Wat zoek je?',
        type: 'radio',
        options: [
          { value: 'serious', label: 'Serieuze relatie' },
          { value: 'casual', label: 'Casual dating' },
          { value: 'open', label: 'Open voor alles' },
          { value: 'friends', label: 'Eerst vriendschap' }
        ]
      }
    ]
  },
  {
    id: 'goals',
    title: 'Jouw Doelen',
    subtitle: 'Wat wil je bereiken?',
    questions: [
      {
        id: 'improvementGoals',
        label: 'Wat wil je verbeteren?',
        type: 'multiselect',
        options: [
          'Meer matches krijgen',
          'Betere kwaliteit matches',
          'Gesprekken op gang krijgen',
          'Van chat naar date',
          'Authentiek overkomen',
          'Zelfvertrouwen bij dating'
        ]
      },
      {
        id: 'dealBreakers',
        label: 'Deal-breakers (optioneel)',
        type: 'tags',
        placeholder: 'Bijv: Roker, Geen huisdieren...',
        maxTags: 3
      }
    ]
  }
];

export function AssessmentFlow({ onComplete, onBack }: AssessmentFlowProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const currentStep = ASSESSMENT_STEPS[currentStepIndex];
  const progress = ((currentStepIndex + 1) / ASSESSMENT_STEPS.length) * 100;

  const handleAnswer = (questionId: string, value: any) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const isStepComplete = () => {
    return currentStep.questions.every(q => {
      // Check if question depends on another answer
      if (q.dependsOn) {
        const [dependsKey, dependsValue] = Object.entries(q.dependsOn)[0];
        if (answers[dependsKey] !== dependsValue) {
          return true; // Skip this question
        }
      }

      const answer = answers[q.id];

      // For tags/multiselect - check if array has items
      if (q.type === 'tags' || q.type === 'multiselect') {
        return Array.isArray(answer) && answer.length > 0;
      }

      // For other types - check if not empty
      return answer !== undefined && answer !== '';
    });
  };

  const handleNext = async () => {
    if (currentStepIndex < ASSESSMENT_STEPS.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    } else {
      // Final step - analyze and complete
      setIsAnalyzing(true);
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate AI analysis
      onComplete(answers);
    }
  };

  const handlePrevious = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    } else {
      onBack();
    }
  };

  const renderQuestion = (question: any) => {
    // Check dependencies
    if (question.dependsOn) {
      const [dependsKey, dependsValue] = Object.entries(question.dependsOn)[0];
      if (answers[dependsKey] !== dependsValue) {
        return null;
      }
    }

    switch (question.type) {
      case 'radio':
        return (
          <div className="space-y-3">
            {question.options.map((option: any) => (
              <label
                key={option.value}
                className="flex items-center gap-3 p-4 border-2 border-gray-200 dark:border-gray-600 rounded-lg cursor-pointer hover:border-gray-900 dark:hover:border-gray-400 transition-colors"
              >
                <input
                  type="radio"
                  name={question.id}
                  value={option.value}
                  checked={answers[question.id] === option.value}
                  onChange={(e) => handleAnswer(question.id, e.target.value)}
                  className="w-4 h-4 text-gray-900 dark:text-gray-100"
                />
                <span className="text-gray-900 dark:text-white">{option.label}</span>
              </label>
            ))}
          </div>
        );

      case 'multiselect':
        return (
          <div className="grid grid-cols-2 gap-3">
            {question.options.map((option: string) => {
              const isSelected = answers[question.id]?.includes(option);
              return (
                <button
                  key={option}
                  onClick={() => {
                    const current = answers[question.id] || [];
                    const updated = isSelected
                      ? current.filter((v: string) => v !== option)
                      : [...current, option];
                    handleAnswer(question.id, updated);
                  }}
                  className={`p-4 border-2 rounded-lg text-sm font-medium transition-all ${
                    isSelected
                      ? 'border-gray-900 dark:border-gray-100 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900'
                      : 'border-gray-200 dark:border-gray-600 hover:border-gray-900 dark:hover:border-gray-400 text-gray-900 dark:text-white'
                  }`}
                >
                  {option}
                </button>
              );
            })}
          </div>
        );

      case 'textarea':
        return (
          <div className="space-y-2">
            <Textarea
              placeholder={question.placeholder}
              value={answers[question.id] || ''}
              onChange={(e) => handleAnswer(question.id, e.target.value)}
              className="min-h-[120px] resize-none border-2 border-gray-200 dark:border-gray-600 focus:border-gray-900 dark:focus:border-gray-400 rounded-lg dark:bg-gray-700 dark:text-white"
            />
            {question.hint && (
              <p className="text-sm text-gray-500 dark:text-gray-400 italic">{question.hint}</p>
            )}
          </div>
        );

      case 'tags':
        return (
          <div className="space-y-3">
            <Input
              placeholder={question.placeholder}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  const value = (e.target as HTMLInputElement).value.trim();
                  if (value) {
                    const current = answers[question.id] || [];
                    if (current.length < question.maxTags) {
                      handleAnswer(question.id, [...current, value]);
                      (e.target as HTMLInputElement).value = '';
                    }
                  }
                }
              }}
              className="border-2 border-gray-200 dark:border-gray-600 focus:border-gray-900 dark:focus:border-gray-400 rounded-lg dark:bg-gray-700 dark:text-white"
            />
            {answers[question.id]?.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {answers[question.id].map((tag: string, idx: number) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-sm rounded-full flex items-center gap-2"
                  >
                    {tag}
                    <button
                      onClick={() => {
                        const updated = answers[question.id].filter((_: any, i: number) => i !== idx);
                        handleAnswer(question.id, updated);
                      }}
                      className="hover:text-gray-300 dark:hover:text-gray-600"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
            <p className={`text-sm ${
              (answers[question.id]?.length || 0) === 0
                ? 'text-orange-600 dark:text-orange-400 font-medium'
                : 'text-gray-500 dark:text-gray-400'
            }`}>
              {answers[question.id]?.length || 0} / {question.maxTags} - Druk Enter om toe te voegen
              {(answers[question.id]?.length || 0) === 0 && ' (Minimaal 1 vereist)'}
            </p>
          </div>
        );

      default:
        return null;
    }
  };

  if (isAnalyzing) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="p-12 max-w-md w-full text-center space-y-6 border-0 shadow-lg dark:bg-gray-800">
          <Loader2 className="w-12 h-12 animate-spin text-gray-900 dark:text-gray-100 mx-auto" />
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">AI analyseert je antwoorden...</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Ik maak een gepersonaliseerde optimalisatie route voor je
            </p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-2xl w-full space-y-6">
        {/* Header */}
        <div className="space-y-4">
          <button
            onClick={handlePrevious}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Terug</span>
          </button>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
              <span>Stap {currentStepIndex + 1} van {ASSESSMENT_STEPS.length}</span>
              <span>{Math.round(progress)}% voltooid</span>
            </div>
            <Progress value={progress} className="h-1 bg-gray-200 dark:bg-gray-700" />
          </div>
        </div>

        {/* Main Content */}
        <Card className="p-8 border-0 shadow-lg dark:bg-gray-800">
          <div className="space-y-8">
            <div className="space-y-2">
              <div className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                {currentStep.subtitle}
              </div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                {currentStep.title}
              </h2>
            </div>

            <div className="space-y-8">
              {currentStep.questions.map((question) => (
                <div key={question.id} className="space-y-3">
                  <label className="block text-lg font-medium text-gray-900 dark:text-white">
                    {question.label}
                  </label>
                  {renderQuestion(question)}
                </div>
              ))}
            </div>

            <div className="pt-4">
              <Button
                onClick={handleNext}
                disabled={!isStepComplete()}
                className="w-full h-12 bg-gray-900 hover:bg-gray-800 dark:bg-gray-100 dark:hover:bg-gray-200 disabled:bg-gray-300 dark:disabled:bg-gray-600 text-white dark:text-gray-900 font-medium rounded-lg transition-colors group"
              >
                {currentStepIndex === ASSESSMENT_STEPS.length - 1 ? 'Analyseer & Volgende' : 'Volgende Stap'}
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
