'use client';

/**
 * Lead Intake Questions - Data Enrichment Step
 *
 * 3 segmentation questions to understand the user and
 * target the right upsell offer:
 *
 * 1. Looking for: Man/Vrouw/Anders
 * 2. Dating status: Net begonnen/Tijdje bezig/Gefrustreerd
 * 3. Main obstacle: Profiel/Gesprekken/Dates
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, User, Heart, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type {
  LeadIntakeData,
  LookingFor,
  DatingStatus,
  DatingObstacle,
} from '@/types/lead-activation.types';

interface LeadIntakeQuestionsProps {
  onComplete: (data: LeadIntakeData) => void;
  userName?: string;
}

type QuestionStep = 1 | 2 | 3;

interface OptionConfig {
  value: string;
  label: string;
  description?: string;
}

export function LeadIntakeQuestions({
  onComplete,
  userName,
}: LeadIntakeQuestionsProps) {
  const [step, setStep] = useState<QuestionStep>(1);
  const [lookingFor, setLookingFor] = useState<LookingFor | null>(null);
  const [datingStatus, setDatingStatus] = useState<DatingStatus | null>(null);
  const [mainObstacle, setMainObstacle] = useState<DatingObstacle | null>(null);

  // Question 1: Looking for
  const lookingForOptions: OptionConfig[] = [
    { value: 'man', label: 'Een man' },
    { value: 'vrouw', label: 'Een vrouw' },
    { value: 'anders', label: 'Anders / Beiden' },
  ];

  // Question 2: Dating status
  const datingStatusOptions: OptionConfig[] = [
    {
      value: 'net_begonnen',
      label: 'Net begonnen',
      description: 'Ik ben nieuw met online daten',
    },
    {
      value: 'tijdje_bezig_geen_succes',
      label: 'Al een tijdje bezig',
      description: 'Maar nog niet het succes dat ik wil',
    },
    {
      value: 'gefrustreerd',
      label: 'Gefrustreerd',
      description: 'Ik ben klaar met de spelletjes',
    },
  ];

  // Question 3: Main obstacle (Money question)
  const obstacleOptions: OptionConfig[] = [
    {
      value: 'profiel_trekt_niemand_aan',
      label: 'Mijn profiel trekt niemand aan',
      description: 'Ik krijg weinig tot geen matches',
    },
    {
      value: 'gesprekken_vallen_stil',
      label: 'Gesprekken vallen stil',
      description: 'Matches reageren niet of haken af',
    },
    {
      value: 'krijg_geen_dates',
      label: 'Ik krijg geen dates',
      description: 'Van chat naar date lukt niet',
    },
  ];

  const handleSelect = (value: string) => {
    if (step === 1) {
      setLookingFor(value as LookingFor);
      setTimeout(() => setStep(2), 300);
    } else if (step === 2) {
      setDatingStatus(value as DatingStatus);
      setTimeout(() => setStep(3), 300);
    } else if (step === 3) {
      setMainObstacle(value as DatingObstacle);
      // Complete the intake
      setTimeout(() => {
        onComplete({
          lookingFor: lookingFor!,
          datingStatus: datingStatus!,
          mainObstacle: value as DatingObstacle,
          completedAt: new Date().toISOString(),
        });
      }, 300);
    }
  };

  const goBack = () => {
    if (step === 2) setStep(1);
    else if (step === 3) setStep(2);
  };

  const getCurrentValue = (): string | null => {
    if (step === 1) return lookingFor;
    if (step === 2) return datingStatus;
    return mainObstacle;
  };

  const renderQuestion = () => {
    let icon: React.ReactNode;
    let question: string;
    let options: OptionConfig[];

    if (step === 1) {
      icon = <User className="w-6 h-6 text-coral-500" />;
      question = 'Voor wie zoek je?';
      options = lookingForOptions;
    } else if (step === 2) {
      icon = <Heart className="w-6 h-6 text-coral-500" />;
      question = 'Wat is je huidige status?';
      options = datingStatusOptions;
    } else {
      icon = <Target className="w-6 h-6 text-coral-500" />;
      question = 'Wat is je grootste dating-obstakel?';
      options = obstacleOptions;
    }

    return (
      <motion.div
        key={step}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.3 }}
      >
        {/* Question Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-full bg-coral-50 flex items-center justify-center">
            {icon}
          </div>
          <div>
            <p className="text-sm text-gray-500">
              Vraag {step} van 3
            </p>
            <h2 className="text-xl font-bold text-gray-900">{question}</h2>
          </div>
        </div>

        {/* Options */}
        <div className="space-y-3">
          {options.map((option) => (
            <button
              key={option.value}
              onClick={() => handleSelect(option.value)}
              className={cn(
                'w-full p-4 rounded-xl border-2 text-left transition-all',
                getCurrentValue() === option.value
                  ? 'border-coral-500 bg-coral-50'
                  : 'border-gray-200 hover:border-coral-300 hover:bg-gray-50'
              )}
            >
              <span className="font-medium text-gray-900">{option.label}</span>
              {option.description && (
                <p className="text-sm text-gray-500 mt-1">
                  {option.description}
                </p>
              )}
            </button>
          ))}
        </div>
      </motion.div>
    );
  };

  return (
    <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8">
      {/* Personalized greeting */}
      {userName && step === 1 && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center text-gray-600 mb-6"
        >
          Welkom {userName}! Nog een paar snelle vragen...
        </motion.p>
      )}

      {/* Progress dots */}
      <div className="flex items-center justify-center gap-2 mb-8">
        {[1, 2, 3].map((s) => (
          <div
            key={s}
            className={cn(
              'w-2 h-2 rounded-full transition-all',
              s === step
                ? 'w-6 bg-coral-500'
                : s < step
                ? 'bg-coral-500'
                : 'bg-gray-200'
            )}
          />
        ))}
      </div>

      {/* Question Content */}
      <AnimatePresence mode="wait">{renderQuestion()}</AnimatePresence>

      {/* Back Button */}
      {step > 1 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-6"
        >
          <Button
            variant="ghost"
            onClick={goBack}
            className="text-gray-500 hover:text-gray-700"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Terug
          </Button>
        </motion.div>
      )}

      {/* Time estimate */}
      <p className="text-center text-sm text-gray-400 mt-6">
        Dit duurt nog ongeveer 1 minuut
      </p>
    </div>
  );
}
