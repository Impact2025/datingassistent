'use client';

/**
 * Pattern Quiz Analyzing Screen
 *
 * Suspenseful analyzing animation before revealing results.
 */

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Heart, Shield, Sparkles } from 'lucide-react';

interface PatternAnalyzingProps {
  onComplete: () => void;
  firstName: string;
}

const ANALYSIS_STEPS = [
  { icon: Brain, text: 'Analyseren van je antwoorden...', duration: 1500 },
  { icon: Heart, text: 'Identificeren van je patronen...', duration: 1500 },
  { icon: Shield, text: 'Berekenen van attachment dimensies...', duration: 1500 },
  { icon: Sparkles, text: 'Voorbereiden van je persoonlijke analyse...', duration: 1000 },
];

export function PatternAnalyzing({ onComplete, firstName }: PatternAnalyzingProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (currentStep >= ANALYSIS_STEPS.length) {
      // All steps complete, trigger onComplete
      setTimeout(onComplete, 500);
      return;
    }

    const step = ANALYSIS_STEPS[currentStep];
    const interval = setInterval(() => {
      setProgress((prev) => {
        const stepProgress = ((currentStep + 1) / ANALYSIS_STEPS.length) * 100;
        const stepStart = (currentStep / ANALYSIS_STEPS.length) * 100;
        const newProgress = prev + 1;

        if (newProgress >= stepProgress) {
          clearInterval(interval);
          setTimeout(() => {
            setCurrentStep((s) => s + 1);
          }, 200);
          return stepProgress;
        }
        return newProgress;
      });
    }, step.duration / 25);

    return () => clearInterval(interval);
  }, [currentStep, onComplete]);

  const CurrentIcon = ANALYSIS_STEPS[currentStep]?.icon || Sparkles;

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-pink-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-8">
        {/* Animated Icon */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="relative"
        >
          {/* Pulsing Background */}
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              className="w-32 h-32 rounded-full bg-pink-200/50"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            style={{ animationDelay: '0.5s' }}
          >
            <motion.div
              className="w-24 h-24 rounded-full bg-pink-300/50"
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
            />
          </motion.div>

          {/* Icon */}
          <div className="relative w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-pink-500 to-pink-600 flex items-center justify-center shadow-lg">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ scale: 0.5, opacity: 0, rotate: -180 }}
                animate={{ scale: 1, opacity: 1, rotate: 0 }}
                exit={{ scale: 0.5, opacity: 0, rotate: 180 }}
                transition={{ duration: 0.3 }}
              >
                <CurrentIcon className="w-10 h-10 text-white" />
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Greeting */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-2xl font-bold text-gray-900">
            Even geduld, {firstName}...
          </h2>
        </motion.div>

        {/* Current Step Text */}
        <AnimatePresence mode="wait">
          <motion.p
            key={currentStep}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-gray-600"
          >
            {ANALYSIS_STEPS[currentStep]?.text || 'Bijna klaar...'}
          </motion.p>
        </AnimatePresence>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-pink-500 to-pink-600 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <p className="text-sm text-gray-500">{Math.round(progress)}%</p>
        </div>

        {/* Step Indicators */}
        <div className="flex justify-center gap-2">
          {ANALYSIS_STEPS.map((step, index) => (
            <motion.div
              key={index}
              className={`w-2 h-2 rounded-full transition-colors ${
                index <= currentStep ? 'bg-pink-500' : 'bg-gray-300'
              }`}
              animate={index === currentStep ? { scale: [1, 1.3, 1] } : {}}
              transition={{ duration: 0.5, repeat: Infinity }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
