"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { X, ArrowRight, ArrowLeft, Play, Pause } from 'lucide-react';
import { TutorialStep } from './tutorial-engine';

interface TutorialModalProps {
  step: TutorialStep;
  isFirst: boolean;
  isLast: boolean;
  onNext: () => void;
  onPrevious: () => void;
  onSkip: () => void;
  onComplete: () => void;
}

export function TutorialModal({
  step,
  isFirst,
  isLast,
  onNext,
  onPrevious,
  onSkip,
  onComplete
}: TutorialModalProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  // Auto-advance if enabled
  useEffect(() => {
    if (step.autoAdvance && step.duration) {
      const timer = setTimeout(() => {
        if (isLast) {
          onComplete();
        } else {
          onNext();
        }
      }, step.duration * 1000);

      return () => clearTimeout(timer);
    }
  }, [step, isLast, onNext, onComplete]);

  const handlePrimaryAction = () => {
    if (isLast) {
      onComplete();
    } else {
      onNext();
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        {/* Modal */}
        <Card className="max-w-lg w-full mx-4 relative shadow-2xl border-2 border-white/20">
          <CardContent className="p-6">
            {/* Close button */}
            {step.showSkip && (
              <button
                onClick={onSkip}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors z-10"
                aria-label="Tutorial overslaan"
              >
                <X className="w-5 h-5" />
              </button>
            )}

            {/* Media content */}
            {step.media && (
              <div className="mb-6">
                {step.media.type === 'video' && (
                  <div className="relative bg-black rounded-lg overflow-hidden">
                    <video
                      src={step.media.url}
                      className="w-full h-48 object-cover"
                      controls={false}
                      autoPlay={isPlaying}
                      muted
                      loop
                    />
                    <button
                      onClick={() => setIsPlaying(!isPlaying)}
                      className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/50 transition-colors"
                    >
                      {isPlaying ? (
                        <Pause className="w-12 h-12 text-white" />
                      ) : (
                        <Play className="w-12 h-12 text-white ml-2" />
                      )}
                    </button>
                  </div>
                )}

                {step.media.type === 'image' && (
                  <img
                    src={step.media.url}
                    alt={step.media.alt || 'Tutorial afbeelding'}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                )}
              </div>
            )}

            {/* Title */}
            {step.title && (
              <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">
                {step.title}
              </h2>
            )}

            {/* Content */}
            <div className="text-gray-700 leading-relaxed mb-6 text-center">
              {step.content}
            </div>

            {/* Auto-advance indicator */}
            {step.autoAdvance && step.duration && (
              <div className="mb-4">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-pink-500 h-2 rounded-full transition-all duration-1000 ease-linear"
                    style={{
                      width: '100%',
                      animation: `shrink ${step.duration}s linear forwards`
                    }}
                  />
                </div>
                <p className="text-xs text-gray-500 text-center mt-2">
                  Automatisch verder in {step.duration} seconden...
                </p>
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between items-center">
              {/* Skip button */}
              {step.showSkip && (
                <Button
                  variant="ghost"
                  onClick={onSkip}
                  className="text-gray-500 hover:text-gray-700"
                >
                  Overslaan
                </Button>
              )}

              {!step.showSkip && !isFirst && <div />}

              {/* Navigation buttons */}
              <div className="flex space-x-3">
                {!isFirst && (
                  <Button
                    variant="outline"
                    onClick={onPrevious}
                    className="flex items-center space-x-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Vorige</span>
                  </Button>
                )}

                <Button
                  onClick={handlePrimaryAction}
                  className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white flex items-center space-x-2"
                >
                  <span>{isLast ? 'Voltooien' : 'Volgende'}</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Custom CSS for animation */}
      <style jsx>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </>
  );
}