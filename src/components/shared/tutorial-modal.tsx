'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  ChevronLeft,
  ChevronRight,
  Play,
  CheckCircle,
  X,
  HelpCircle,
  Lightbulb,
  Target,
  BookOpen,
  Video
} from 'lucide-react';

interface TutorialStep {
  title: string;
  content: string;
  image?: string;
  video?: string;
  tips?: string[];
  action?: {
    text: string;
    target: string;
    highlight?: boolean;
  };
}

interface TutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
  toolId: string;
  toolName: string;
  steps: TutorialStep[];
  onComplete?: () => void;
}

export function TutorialModal({ isOpen, onClose, toolId, toolName, steps, onComplete }: TutorialModalProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (isOpen) {
      setCurrentStep(0);
      setCompletedSteps(new Set());
    }
  }, [isOpen]);

  const progress = ((currentStep + 1) / steps.length) * 100;

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCompletedSteps(prev => new Set([...prev, currentStep]));
      setCurrentStep(prev => prev + 1);
    } else {
      // Tutorial completed
      setCompletedSteps(prev => new Set([...prev, currentStep]));
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleComplete = () => {
    // Mark tutorial as completed in localStorage
    const completedTutorials = JSON.parse(localStorage.getItem('completedTutorials') || '[]');
    if (!completedTutorials.includes(toolId)) {
      completedTutorials.push(toolId);
      localStorage.setItem('completedTutorials', JSON.stringify(completedTutorials));
    }

    onComplete?.();
    onClose();
  };

  const currentStepData = steps[currentStep];
  const isCompleted = completedSteps.has(currentStep);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-blue-500" />
              Tutorial: {toolName}
            </DialogTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Stap {currentStep + 1} van {steps.length}</span>
              <span>{Math.round(progress)}% compleet</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Step Content */}
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                isCompleted ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'
              }`}>
                {isCompleted ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  <span className="text-sm font-semibold">{currentStep + 1}</span>
                )}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-2">{currentStepData.title}</h3>
                <div className="prose prose-sm max-w-none">
                  <p className="text-muted-foreground leading-relaxed">{currentStepData.content}</p>
                </div>
              </div>
            </div>

            {/* Media Content */}
            {currentStepData.image && (
              <div className="bg-muted/30 rounded-lg p-4">
                <img
                  src={currentStepData.image}
                  alt={currentStepData.title}
                  className="w-full rounded-lg shadow-sm"
                />
              </div>
            )}

            {currentStepData.video && (
              <div className="bg-muted/30 rounded-lg p-4">
                <div className="aspect-video bg-black rounded-lg flex items-center justify-center">
                  <Button variant="secondary" className="gap-2">
                    <Play className="w-4 h-4" />
                    Video Afspelen
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  📹 Video uitleg: {currentStepData.video}
                </p>
              </div>
            )}

            {/* Tips */}
            {currentStepData.tips && currentStepData.tips.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Lightbulb className="w-4 h-4 text-blue-600" />
                  <span className="font-medium text-blue-900">Pro Tips</span>
                </div>
                <ul className="space-y-2">
                  {currentStepData.tips.map((tip, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-blue-800">
                      <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Action Button */}
            {currentStepData.action && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-4 h-4 text-green-600" />
                  <span className="font-medium text-green-900">Probeer het zelf</span>
                </div>
                <p className="text-sm text-green-800 mb-3">{currentStepData.action.text}</p>
                <Button
                  size="sm"
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => {
                    // Highlight target element
                    const targetElement = document.querySelector(currentStepData.action!.target);
                    if (targetElement) {
                      targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      targetElement.classList.add('ring-2', 'ring-green-500', 'ring-offset-2');
                      setTimeout(() => {
                        targetElement.classList.remove('ring-2', 'ring-green-500', 'ring-offset-2');
                      }, 3000);
                    }
                  }}
                >
                  Toon mij waar
                </Button>
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="flex justify-between pt-4 border-t">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className="gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Vorige
            </Button>

            <div className="flex gap-2">
              <Button variant="ghost" onClick={onClose}>
                Overslaan
              </Button>
              <Button onClick={handleNext} className="gap-2">
                {currentStep === steps.length - 1 ? (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Tutorial Voltooien
                  </>
                ) : (
                  <>
                    Volgende
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Step Indicators */}
          <div className="flex justify-center gap-2 pt-2">
            {steps.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentStep(index)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentStep
                    ? 'bg-blue-500'
                    : completedSteps.has(index)
                    ? 'bg-green-500'
                    : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Hook for managing tutorial state
export function useTutorial(toolId: string) {
  const [hasCompletedTutorial, setHasCompletedTutorial] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);

  useEffect(() => {
    const completedTutorials = JSON.parse(localStorage.getItem('completedTutorials') || '[]');
    setHasCompletedTutorial(completedTutorials.includes(toolId));
  }, [toolId]);

  const startTutorial = () => setShowTutorial(true);
  const completeTutorial = () => {
    setHasCompletedTutorial(true);
    setShowTutorial(false);
  };

  return {
    hasCompletedTutorial,
    showTutorial,
    startTutorial,
    completeTutorial,
    setShowTutorial
  };
}