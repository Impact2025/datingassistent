'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface ScheidingHerstartAnalyzingProps {
  onComplete: () => void;
  firstName: string;
}

const STEPS = [
  'Antwoorden verwerken',
  'Herstart profiel bepalen',
  'Persoonlijk actieplan samenstellen',
];

export function ScheidingHerstartAnalyzing({ onComplete, firstName }: ScheidingHerstartAnalyzingProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [showExtended, setShowExtended] = useState(false);

  useEffect(() => {
    const progressTimer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) { clearInterval(progressTimer); return 100; }
        return prev + 1;
      });
    }, 30);

    const s1 = setTimeout(() => setCurrentStep(1), 1000);
    const s2 = setTimeout(() => setCurrentStep(2), 2000);
    const done = setTimeout(onComplete, 3000);
    const ext = setTimeout(() => setShowExtended(true), 4500);

    return () => {
      clearInterval(progressTimer);
      clearTimeout(s1);
      clearTimeout(s2);
      clearTimeout(done);
      clearTimeout(ext);
    };
  }, [onComplete]);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="max-w-sm w-full text-center">
        <div className="mb-8">
          <motion.div
            className="w-12 h-12 mx-auto border-2 border-gray-200 border-t-rose-500 rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          />
        </div>

        <h2 className="text-xl font-bold text-gray-900 mb-2">
          Even geduld, {firstName}
        </h2>
        <p className="text-gray-500 mb-8">
          We analyseren je antwoorden
        </p>

        <div className="mb-6">
          <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-rose-500"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="space-y-2">
          {STEPS.map((step, index) => (
            <motion.div
              key={step}
              initial={{ opacity: 0 }}
              animate={{ opacity: index <= currentStep ? 1 : 0.3 }}
              className="flex items-center justify-center gap-2 text-sm"
            >
              {index < currentStep ? (
                <span className="text-rose-500">✓</span>
              ) : index === currentStep ? (
                <motion.span
                  animate={{ opacity: [1, 0.5, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="text-rose-500"
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

        {showExtended && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-6 text-sm text-gray-400"
          >
            Bijna klaar, nog een moment...
          </motion.p>
        )}
      </div>
    </div>
  );
}
