'use client';

/**
 * Pattern Quiz Analyzing Screen - Brand Style (Pink Minimalist)
 */

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface PatternAnalyzingProps {
  onComplete: () => void;
  firstName: string;
}

const STEPS = [
  'Antwoorden verwerken',
  'Patronen analyseren',
  'Resultaat berekenen',
];

export function PatternAnalyzing({ onComplete, firstName }: PatternAnalyzingProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Progress animation
    const progressTimer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressTimer);
          return 100;
        }
        return prev + 1;
      });
    }, 30);

    // Step progression
    const stepTimer1 = setTimeout(() => setCurrentStep(1), 1000);
    const stepTimer2 = setTimeout(() => setCurrentStep(2), 2000);
    const completeTimer = setTimeout(onComplete, 3000);

    return () => {
      clearInterval(progressTimer);
      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="max-w-sm w-full text-center">
        {/* Spinner */}
        <div className="mb-8">
          <motion.div
            className="w-12 h-12 mx-auto border-2 border-gray-200 border-t-pink-500 rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          />
        </div>

        {/* Title */}
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          Even geduld, {firstName}
        </h2>
        <p className="text-gray-500 mb-8">
          We analyseren je antwoorden
        </p>

        {/* Progress bar */}
        <div className="mb-6">
          <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-pink-500"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Steps */}
        <div className="space-y-2">
          {STEPS.map((step, index) => (
            <motion.div
              key={step}
              initial={{ opacity: 0 }}
              animate={{ opacity: index <= currentStep ? 1 : 0.3 }}
              className="flex items-center justify-center gap-2 text-sm"
            >
              {index < currentStep ? (
                <span className="text-pink-500">✓</span>
              ) : index === currentStep ? (
                <motion.span
                  animate={{ opacity: [1, 0.5, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="text-pink-500"
                >
                  •
                </motion.span>
              ) : (
                <span className="text-gray-300">○</span>
              )}
              <span className={index <= currentStep ? 'text-gray-900' : 'text-gray-400'}>
                {step}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
