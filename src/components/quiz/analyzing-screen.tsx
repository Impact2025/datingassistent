'use client';

/**
 * Analyzing Screen - Suspense & Excitement
 * Creates anticipation before revealing results
 */

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Heart, TrendingUp, Users, Zap, Target } from 'lucide-react';

const ANALYSIS_STEPS = [
  { icon: Users, text: 'Vergelijken met 10.000+ Nederlandse singles...', duration: 2000 },
  { icon: TrendingUp, text: 'Je dating patronen analyseren...', duration: 1800 },
  { icon: Heart, text: 'Je hechtingsstijl bepalen...', duration: 1600 },
  { icon: Target, text: 'Je grootste valkuilen identificeren...', duration: 1400 },
  { icon: Zap, text: 'Je persoonlijke actieplan samenstellen...', duration: 1200 },
  { icon: Sparkles, text: 'Je unieke dating stijl onthullen...', duration: 1000 }
];

interface AnalyzingScreenProps {
  onComplete: () => void;
}

export function AnalyzingScreen({ onComplete }: AnalyzingScreenProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (currentStep < ANALYSIS_STEPS.length) {
      const step = ANALYSIS_STEPS[currentStep];
      const timer = setTimeout(() => {
        setCurrentStep(prev => prev + 1);
      }, step.duration);

      // Smooth progress animation
      const progressTimer = setInterval(() => {
        setProgress(prev => {
          const target = ((currentStep + 1) / ANALYSIS_STEPS.length) * 100;
          const increment = (target - prev) / 20;
          if (prev < target) {
            return Math.min(prev + increment, target);
          }
          return prev;
        });
      }, step.duration / 20);

      return () => {
        clearTimeout(timer);
        clearInterval(progressTimer);
      };
    } else {
      // Final step - complete
      setTimeout(() => {
        onComplete();
      }, 800);
    }
  }, [currentStep, onComplete]);

  const currentStepData = ANALYSIS_STEPS[currentStep];

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-pink-25 to-white flex items-center justify-center p-4">
      <div className="max-w-2xl w-full space-y-8">
        {/* Main Animation */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center space-y-6"
        >
          {/* Animated Icon */}
          <div className="relative">
            {/* Pulse rings */}
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.5, 0, 0.5]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-pink-400 to-purple-400" />
            </motion.div>

            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0, 0.3]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.3
              }}
            >
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-pink-400 to-purple-400" />
            </motion.div>

            {/* Center icon */}
            <div className="relative w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-pink-500 to-pink-600 flex items-center justify-center shadow-2xl">
              <AnimatePresence mode="wait">
                {currentStepData && (
                  <motion.div
                    key={currentStep}
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    exit={{ scale: 0, rotate: 180 }}
                    transition={{ duration: 0.4 }}
                  >
                    <currentStepData.icon className="w-16 h-16 text-white" />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Analysis Text */}
          <div className="space-y-4">
            <h2 className="text-3xl font-bold text-gray-900">
              We analyseren je profiel...
            </h2>

            <div className="h-8">
              <AnimatePresence mode="wait">
                {currentStepData && (
                  <motion.p
                    key={currentStep}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="text-lg text-gray-600"
                  >
                    {currentStepData.text}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-3">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Voortgang</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-pink-500 to-pink-600"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>

          {/* Fun Facts */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="pt-8"
          >
            <div className="inline-block px-6 py-3 bg-white/80 backdrop-blur-sm rounded-full shadow-lg">
              <p className="text-sm text-gray-600">
                💡 <span className="font-semibold">Fun fact:</span> {getFunFact(currentStep)}
              </p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

function getFunFact(step: number): string {
  const facts = [
    '73% van succesvolle relaties begint online',
    'Je eerste foto krijgt gemiddeld 0.3 seconden aandacht',
    'Mensen die vragen stellen krijgen 30% meer replies',
    'Zondag 21:00 is de beste tijd om matches te krijgen',
    'Het gemiddelde gesprek eindigt na 7 berichten',
    'Emoji\'s verhogen je kans op een reply met 15%'
  ];
  return facts[step] || facts[0];
}
