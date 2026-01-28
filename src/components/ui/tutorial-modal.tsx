import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  X,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  Lightbulb,
  Target,
  Zap,
  HelpCircle,
  Play,
  BookOpen
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface TutorialStep {
  id: string;
  title: string;
  description: string;
  content?: React.ReactNode;
  tip?: string;
  example?: {
    before?: string;
    after?: string;
    explanation?: string;
  };
  interactive?: boolean;
}

export interface TutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete?: () => void;
  title: string;
  description: string;
  steps: TutorialStep[];
  toolId: string;
  estimatedTime?: number;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  category?: string;
}

export function TutorialModal({
  isOpen,
  onClose,
  onComplete,
  title,
  description,
  steps,
  toolId,
  estimatedTime = 2,
  difficulty = 'beginner',
  category = 'tool'
}: TutorialModalProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  const progress = ((currentStep + 1) / steps.length) * 100;
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === steps.length - 1;

  useEffect(() => {
    if (isOpen) {
      setCurrentStep(0);
      setCompletedSteps(new Set());
    }
  }, [isOpen]);

  const handleNext = () => {
    if (!isLastStep) {
      setCompletedSteps(prev => new Set([...prev, currentStep]));
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (!isFirstStep) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    // Mark tutorial as completed for this tool
    localStorage.setItem(`tutorial-completed-${toolId}`, 'true');
    onComplete?.();
    onClose();
  };

  const handleSkip = () => {
    onClose();
  };

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'bg-green-100 text-green-700';
      case 'intermediate': return 'bg-yellow-100 text-yellow-700';
      case 'advanced': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  if (!isOpen) return null;

  const currentTutorialStep = steps[currentStep];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="w-full max-w-2xl max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <Card className="bg-white border-0 shadow-2xl">
            {/* Header */}
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-coral-100 rounded-full flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-coral-600" />
                  </div>
                  <div>
                    <CardTitle className="text-xl flex items-center gap-2">
                      {title}
                      <Badge className={getDifficultyColor(difficulty)}>
                        {difficulty}
                      </Badge>
                    </CardTitle>
                    <p className="text-sm text-gray-600">{description}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSkip}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* Progress and Meta Info */}
              <div className="flex items-center justify-between text-sm text-gray-600 mt-4">
                <div className="flex items-center gap-4">
                  <span>Stap {currentStep + 1} van {steps.length}</span>
                  <span>⏱️ {estimatedTime} min</span>
                </div>
                <div className="flex items-center gap-2">
                  {steps.map((_, index) => (
                    <div
                      key={index}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        index === currentStep
                          ? 'bg-coral-500'
                          : completedSteps.has(index)
                          ? 'bg-coral-300'
                          : 'bg-gray-300'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <Progress value={progress} className="mt-2 h-2" />
            </CardHeader>

            {/* Content */}
            <CardContent className="max-h-[50vh] overflow-y-auto">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  {/* Step Title */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {currentTutorialStep.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {currentTutorialStep.description}
                    </p>
                  </div>

                  {/* Custom Content */}
                  {currentTutorialStep.content && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      {currentTutorialStep.content}
                    </div>
                  )}

                  {/* Example Section */}
                  {currentTutorialStep.example && (
                    <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-400">
                      <div className="flex items-center gap-2 mb-3">
                        <Lightbulb className="w-4 h-4 text-blue-600" />
                        <span className="font-medium text-blue-800">Voorbeeld</span>
                      </div>

                      {currentTutorialStep.example.before && (
                        <div className="mb-3">
                          <div className="text-sm text-blue-700 mb-1">❌ Voor:</div>
                          <div className="bg-white p-3 rounded border text-sm text-gray-700">
                            {currentTutorialStep.example.before}
                          </div>
                        </div>
                      )}

                      {currentTutorialStep.example.after && (
                        <div className="mb-3">
                          <div className="text-sm text-green-700 mb-1">✅ Na:</div>
                          <div className="bg-white p-3 rounded border text-sm text-gray-700">
                            {currentTutorialStep.example.after}
                          </div>
                        </div>
                      )}

                      {currentTutorialStep.example.explanation && (
                        <div className="text-sm text-blue-700">
                          {currentTutorialStep.example.explanation}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Tip Section */}
                  {currentTutorialStep.tip && (
                    <div className="bg-yellow-50 rounded-lg p-4 border-l-4 border-yellow-400">
                      <div className="flex items-center gap-2 mb-2">
                        <Zap className="w-4 h-4 text-yellow-600" />
                        <span className="font-medium text-yellow-800">Pro Tip</span>
                      </div>
                      <p className="text-sm text-yellow-700">{currentTutorialStep.tip}</p>
                    </div>
                  )}

                  {/* Interactive Element */}
                  {currentTutorialStep.interactive && (
                    <div className="bg-green-50 rounded-lg p-4 border-l-4 border-green-400">
                      <div className="flex items-center gap-2 mb-2">
                        <Play className="w-4 h-4 text-green-600" />
                        <span className="font-medium text-green-800">Probeer het zelf</span>
                      </div>
                      <p className="text-sm text-green-700">
                        Gebruik de tool hierboven om deze stap in de praktijk te brengen.
                      </p>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </CardContent>

            {/* Footer */}
            <div className="border-t bg-gray-50 px-6 py-4">
              <div className="flex items-center justify-between">
                <Button
                  variant="ghost"
                  onClick={handleSkip}
                  className="text-gray-500 hover:text-gray-700"
                >
                  Overslaan
                </Button>

                <div className="flex gap-3">
                  {!isFirstStep && (
                    <Button
                      variant="outline"
                      onClick={handlePrevious}
                      className="flex items-center gap-2"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Vorige
                    </Button>
                  )}

                  <Button
                    onClick={handleNext}
                    className="bg-coral-500 hover:bg-coral-600 text-white flex items-center gap-2"
                  >
                    {isLastStep ? (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        Start gebruiken
                      </>
                    ) : (
                      <>
                        Volgende
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// Hook to check if tutorial has been completed
export function useTutorialCompletion(toolId: string) {
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    const completed = localStorage.getItem(`tutorial-completed-${toolId}`) === 'true';
    setIsCompleted(completed);
  }, [toolId]);

  const markCompleted = () => {
    localStorage.setItem(`tutorial-completed-${toolId}`, 'true');
    setIsCompleted(true);
  };

  const resetTutorial = () => {
    localStorage.removeItem(`tutorial-completed-${toolId}`);
    setIsCompleted(false);
  };

  return { isCompleted, markCompleted, resetTutorial };
}