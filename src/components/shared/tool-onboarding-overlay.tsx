"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChevronRight, ChevronLeft, X, Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";

export interface OnboardingStep {
  title: string;
  description: string;
  icon?: React.ReactNode;
  image?: string;
  tip?: string;
}

export interface ToolOnboardingOverlayProps {
  toolName: string;
  displayName: string;
  steps: OnboardingStep[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete?: () => void;
  onSkip?: () => void;
}

export function ToolOnboardingOverlay({
  toolName,
  displayName,
  steps,
  open,
  onOpenChange,
  onComplete,
  onSkip
}: ToolOnboardingOverlayProps) {
  const [currentStep, setCurrentStep] = useState(0);

  // Reset to first step when opening
  useEffect(() => {
    if (open) {
      setCurrentStep(0);
    }
  }, [open]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleComplete = () => {
    // Save to localStorage that user completed onboarding
    localStorage.setItem(`onboarding_completed_${toolName}`, 'true');
    onComplete?.();
    onOpenChange(false);
  };

  const handleSkip = () => {
    // Save to localStorage that user saw (but skipped) onboarding
    localStorage.setItem(`onboarding_seen_${toolName}`, 'true');
    onSkip?.();
    onOpenChange(false);
  };

  const step = steps[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === steps.length - 1;
  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden">
        {/* Header */}
        <DialogHeader className="p-6 pb-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2 text-xl">
              {step.icon && <span className="text-2xl">{step.icon}</span>}
              Welkom bij {displayName}!
            </DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 rounded-full"
              onClick={() => onOpenChange(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <DialogDescription>
            Stap {currentStep + 1} van {steps.length}
          </DialogDescription>
        </DialogHeader>

        {/* Progress bar */}
        <div className="px-6">
          <div className="w-full bg-secondary rounded-full h-1.5">
            <div
              className="bg-primary h-1.5 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Step indicator dots */}
          <div className="flex items-center justify-center gap-2">
            {steps.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentStep(index)}
                className={cn(
                  "w-2 h-2 rounded-full transition-all",
                  index === currentStep
                    ? "bg-primary w-6"
                    : index < currentStep
                    ? "bg-primary/50"
                    : "bg-secondary"
                )}
                aria-label={`Ga naar stap ${index + 1}`}
              />
            ))}
          </div>

          {/* Image/Icon */}
          {step.image ? (
            <div className="relative w-full aspect-video bg-muted rounded-lg overflow-hidden">
              <img
                src={step.image}
                alt={step.title}
                className="w-full h-full object-cover"
              />
            </div>
          ) : step.icon ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-6xl">{step.icon}</div>
            </div>
          ) : null}

          {/* Title & Description */}
          <div className="space-y-2 text-center">
            <h3 className="text-lg font-semibold">{step.title}</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {step.description}
            </p>
          </div>

          {/* Tip */}
          {step.tip && (
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Lightbulb className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium mb-1">Pro tip</p>
                  <p className="text-sm text-muted-foreground">{step.tip}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 pt-0 flex items-center justify-between gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSkip}
            className="text-muted-foreground"
          >
            Overslaan
          </Button>

          <div className="flex items-center gap-2">
            {!isFirstStep && (
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrevious}
                className="gap-1"
              >
                <ChevronLeft className="w-4 h-4" />
                Vorige
              </Button>
            )}

            <Button
              size="sm"
              onClick={handleNext}
              className="gap-1"
            >
              {isLastStep ? 'Begrepen!' : 'Volgende'}
              {!isLastStep && <ChevronRight className="w-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Keyboard hints */}
        <div className="px-6 pb-4 text-center text-xs text-muted-foreground">
          Gebruik <kbd className="px-1 py-0.5 bg-muted rounded text-xs">←</kbd> en{' '}
          <kbd className="px-1 py-0.5 bg-muted rounded text-xs">→</kbd> of{' '}
          <kbd className="px-1 py-0.5 bg-muted rounded text-xs">ESC</kbd> om te sluiten
        </div>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Hook to manage onboarding overlay state
 */
export function useOnboardingOverlay(toolName: string) {
  const [showOverlay, setShowOverlay] = useState(false);

  useEffect(() => {
    // Check if user has completed or seen onboarding
    const completed = localStorage.getItem(`onboarding_completed_${toolName}`) === 'true';
    const seen = localStorage.getItem(`onboarding_seen_${toolName}`) === 'true';

    // Check URL params for onboarding trigger
    const params = new URLSearchParams(window.location.search);
    const shouldShow = params.get('onboarding') === 'true' || params.get('firstTime') === 'true';

    // Show overlay if:
    // 1. User came from onboarding/first-time AND
    // 2. Hasn't completed or seen it before
    if (shouldShow && !completed && !seen) {
      // Small delay for better UX
      const timer = setTimeout(() => setShowOverlay(true), 500);
      return () => clearTimeout(timer);
    }
  }, [toolName]);

  const resetOnboarding = () => {
    localStorage.removeItem(`onboarding_completed_${toolName}`);
    localStorage.removeItem(`onboarding_seen_${toolName}`);
    setShowOverlay(true);
  };

  return {
    showOverlay,
    setShowOverlay,
    resetOnboarding
  };
}
