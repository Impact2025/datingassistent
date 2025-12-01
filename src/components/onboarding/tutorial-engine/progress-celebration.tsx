"use client";

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, Sparkles, Trophy, Star } from 'lucide-react';
import { TutorialStep } from './tutorial-engine';

interface ProgressCelebrationProps {
  step: TutorialStep;
  onComplete: () => void;
}

export function ProgressCelebration({ step, onComplete }: ProgressCelebrationProps) {
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    setShowConfetti(true);

    // Auto-complete after animation
    const timer = setTimeout(() => {
      onComplete();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <>
      {/* Confetti animation overlay */}
      {showConfetti && (
        <div className="fixed inset-0 z-40 pointer-events-none">
          <div className="absolute inset-0 flex items-center justify-center">
            {/* Simple confetti effect */}
            <div className="relative">
              {[...Array(20)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-2 h-2 bg-yellow-400 rounded-full animate-bounce"
                  style={{
                    left: `${Math.random() * 200 - 100}px`,
                    top: `${Math.random() * 200 - 100}px`,
                    animationDelay: `${Math.random() * 2}s`,
                    animationDuration: `${1 + Math.random()}s`
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Celebration modal */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full mx-4 relative shadow-2xl border-2 border-yellow-200">
          <CardContent className="p-8 text-center">
            {/* Success icon */}
            <div className="mb-6">
              <div className="w-20 h-20 mx-auto bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mb-4">
                <Trophy className="w-10 h-10 text-white" />
              </div>

              {/* Animated stars */}
              <div className="flex justify-center space-x-2 mb-4">
                <Star className="w-6 h-6 text-yellow-400 animate-pulse" />
                <Star className="w-8 h-8 text-yellow-500 animate-pulse" style={{ animationDelay: '0.2s' }} />
                <Star className="w-6 h-6 text-yellow-400 animate-pulse" style={{ animationDelay: '0.4s' }} />
              </div>
            </div>

            {/* Title */}
            {step.title && (
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {step.title}
              </h2>
            )}

            {/* Content */}
            <p className="text-gray-700 leading-relaxed mb-6">
              {step.content}
            </p>

            {/* Achievement badge */}
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="font-semibold text-yellow-900">Nieuwe skill ontgrendeld!</span>
                <Sparkles className="w-5 h-5 text-yellow-600" />
              </div>
            </div>

            {/* Continue button */}
            <Button
              onClick={onComplete}
              className="bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white px-8 py-3 text-lg font-semibold"
            >
              Verder met je journey! 🚀
            </Button>
          </CardContent>
        </Card>
      </div>
    </>
  );
}