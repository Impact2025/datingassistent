"use client";

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { X, ArrowRight } from 'lucide-react';
import { TutorialStep } from './tutorial-engine';

interface TooltipGuideProps {
  step: TutorialStep;
  onNext: () => void;
  onSkip: () => void;
}

export function TooltipGuide({ step, onNext, onSkip }: TooltipGuideProps) {
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!step.target) return;

    const targetElement = document.querySelector(step.target);
    if (!targetElement) return;

    const rect = targetElement.getBoundingClientRect();
    const tooltipRect = tooltipRef.current?.getBoundingClientRect();

    let top = 0;
    let left = 0;

    switch (step.position) {
      case 'top':
        top = rect.top - (tooltipRect?.height || 100) - 10;
        left = rect.left + rect.width / 2 - (tooltipRect?.width || 200) / 2;
        break;
      case 'bottom':
        top = rect.bottom + 10;
        left = rect.left + rect.width / 2 - (tooltipRect?.width || 200) / 2;
        break;
      case 'left':
        top = rect.top + rect.height / 2 - (tooltipRect?.height || 100) / 2;
        left = rect.left - (tooltipRect?.width || 200) - 10;
        break;
      case 'right':
        top = rect.top + rect.height / 2 - (tooltipRect?.height || 100) / 2;
        left = rect.right + 10;
        break;
    }

    setPosition({ top, left });
  }, [step]);

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/20 z-40" onClick={onSkip} />

      {/* Tooltip */}
      <Card
        ref={tooltipRef}
        className="fixed z-50 shadow-xl border-2 border-blue-200 max-w-xs"
        style={{
          top: `${position.top}px`,
          left: `${position.left}px`,
        }}
      >
        <CardContent className="p-4">
          {/* Close button */}
          <button
            onClick={onSkip}
            className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Content */}
          <div className="pr-6">
            {step.title && (
              <h4 className="font-semibold text-blue-900 mb-2">{step.title}</h4>
            )}
            <p className="text-sm text-blue-800 mb-3">{step.content}</p>

            <Button
              onClick={onNext}
              size="sm"
              className="bg-blue-500 hover:bg-blue-600 text-white"
            >
              Begrepen
              <ArrowRight className="w-3 h-3 ml-1" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </>
  );
}