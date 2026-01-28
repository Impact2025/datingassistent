"use client";

import { ArrowLeft, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

/**
 * ToolModalHeader - Premium header for tool modals
 *
 * Features:
 * - Back button with clear affordance
 * - Title and subtitle
 * - Optional progress indicator
 * - Close button (desktop only)
 * - Sticky positioning
 */

interface ToolModalHeaderProps {
  title: string;
  subtitle?: string;
  onBack: () => void;
  onClose?: () => void;
  progress?: number; // 0-100
  currentStep?: number;
  totalSteps?: number;
  className?: string;
}

export function ToolModalHeader({
  title,
  subtitle,
  onBack,
  onClose,
  progress,
  currentStep,
  totalSteps,
  className
}: ToolModalHeaderProps) {
  return (
    <div
      className={cn(
        "sticky top-0 z-10 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700",
        "shadow-sm",
        className
      )}
    >
      <div className="px-4 py-3">
        {/* Top Row: Back, Title, Close */}
        <div className="flex items-center justify-between mb-2">
          {/* Back Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
            aria-label="Ga terug"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          </Button>

          {/* Title */}
          <div className="flex-1 mx-3 min-w-0">
            <h1
              id="modal-title"
              className="text-lg font-bold text-gray-900 dark:text-white truncate"
            >
              {title}
            </h1>
          </div>

          {/* Close Button (All devices) */}
          {onClose && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="flex p-2 -mr-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
              aria-label="Sluit"
            >
              <X className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            </Button>
          )}
        </div>

        {/* Subtitle */}
        {subtitle && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 px-1">
            {subtitle}
          </p>
        )}

        {/* Progress Indicator */}
        {(progress !== undefined || (currentStep && totalSteps)) && (
          <div className="space-y-2">
            {/* Progress Bar */}
            {progress !== undefined && (
              <Progress value={progress} className="h-1.5" />
            )}

            {/* Step Dots */}
            {currentStep && totalSteps && (
              <div className="flex items-center justify-center gap-1.5">
                {Array.from({ length: totalSteps }, (_, i) => (
                  <div
                    key={i}
                    className={cn(
                      "w-1.5 h-1.5 rounded-full transition-all duration-300",
                      i < currentStep
                        ? "bg-coral-500 w-2 h-2" // Completed
                        : i === currentStep
                        ? "bg-coral-500 w-2.5 h-2.5" // Current
                        : "bg-gray-300 dark:bg-gray-600" // Upcoming
                    )}
                  />
                ))}
              </div>
            )}

            {/* Step Counter Text */}
            {currentStep && totalSteps && (
              <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                Stap {currentStep} van {totalSteps}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
