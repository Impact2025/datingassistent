"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { X, ArrowRight, ArrowLeft, CheckCircle } from 'lucide-react';
import { Tutorial, TutorialStep } from './tutorial-engine';

interface StepByStepWalkthroughProps {
  tutorial: Tutorial;
  currentStep: number;
  onNext: () => void;
  onPrevious: () => void;
  onSkip: () => void;
  onComplete: () => void;
}

export function StepByStepWalkthrough({
  tutorial,
  currentStep,
  onNext,
  onPrevious,
  onSkip,
  onComplete
}: StepByStepWalkthroughProps) {
  const [highlightedElement, setHighlightedElement] = useState<Element | null>(null);

  useEffect(() => {
    const step = tutorial.steps[currentStep];
    if (step.target) {
      const element = document.querySelector(step.target);
      setHighlightedElement(element);

      // Scroll element into view
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }

    return () => setHighlightedElement(null);
  }, [currentStep, tutorial.steps]);

  const step = tutorial.steps[currentStep];
  const progress = ((currentStep + 1) / tutorial.steps.length) * 100;

  return (
    <>
      {/* Highlight overlay */}
      {highlightedElement && (
        <div className="fixed inset-0 z-40 pointer-events-none">
          <div className="absolute inset-0 bg-black/40" />
          {/* Highlight the target element */}
          <div
            className="absolute border-4 border-blue-500 rounded-lg animate-pulse"
            style={{
              top: highlightedElement.getBoundingClientRect().top - 4,
              left: highlightedElement.getBoundingClientRect().left - 4,
              width: highlightedElement.getBoundingClientRect().width + 8,
              height: highlightedElement.getBoundingClientRect().height + 8,
            }}
          />
        </div>
      )}

      {/* Walkthrough tooltip */}
      <Card className="fixed bottom-6 right-6 z-50 shadow-xl border-2 border-blue-200 max-w-sm">
        <CardContent className="p-4">
          {/* Progress */}
          <div className="mb-3">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>Stap {currentStep + 1} van {tutorial.steps.length}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Content */}
          {step.title && (
            <h4 className="font-semibold text-blue-900 mb-2">{step.title}</h4>
          )}
          <p className="text-sm text-blue-800 mb-4">{step.content}</p>

          {/* Navigation */}
          <div className="flex justify-between items-center">
            <Button variant="ghost" size="sm" onClick={onSkip}>
              <X className="w-4 h-4 mr-1" />
              Overslaan
            </Button>

            <div className="flex space-x-2">
              {currentStep > 0 && (
                <Button variant="outline" size="sm" onClick={onPrevious}>
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  Vorige
                </Button>
              )}

              <Button
                size="sm"
                onClick={currentStep === tutorial.steps.length - 1 ? onComplete : onNext}
                className="bg-blue-500 hover:bg-blue-600 text-white"
              >
                {currentStep === tutorial.steps.length - 1 ? (
                  <>
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Voltooien
                  </>
                ) : (
                  <>
                    Volgende
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}