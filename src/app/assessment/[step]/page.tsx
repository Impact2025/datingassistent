'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, ArrowRight, CheckCircle } from 'lucide-react';
import { ASSESSMENT_QUESTIONS, type AssessmentOption } from '@/lib/assessment-questions';

export default function AssessmentStepPage() {
  const router = useRouter();
  const params = useParams();
  const step = parseInt(params.step as string);

  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  // Load saved answers from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('assessment_answers');
    if (saved) {
      const parsed = JSON.parse(saved);
      setAnswers(parsed);

      // Set current question's answer if exists
      const currentQuestion = ASSESSMENT_QUESTIONS[step - 1];
      if (currentQuestion && parsed[currentQuestion.key]) {
        setSelectedAnswer(parsed[currentQuestion.key]);
      }
    }
  }, [step]);

  // Validate step
  if (step < 1 || step > 7 || isNaN(step)) {
    router.push('/assessment/1');
    return null;
  }

  const currentQuestion = ASSESSMENT_QUESTIONS[step - 1];
  const progress = (step / 7) * 100;

  const handleSelectOption = (optionValue: string) => {
    setSelectedAnswer(optionValue);
  };

  const handleNext = async () => {
    if (!selectedAnswer) return;

    // Save answer
    const newAnswers = {
      ...answers,
      [currentQuestion.key]: selectedAnswer
    };
    setAnswers(newAnswers);
    localStorage.setItem('assessment_answers', JSON.stringify(newAnswers));

    if (step === 7) {
      // Last question - save to database and go to results
      setIsLoading(true);
      try {
        const response = await fetch('/api/assessment/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ answers: newAnswers })
        });

        if (!response.ok) throw new Error('Failed to save assessment');

        // Clear localStorage
        localStorage.removeItem('assessment_answers');

        // Go to results
        router.push('/assessment/result');
      } catch (error) {
        console.error('Error saving assessment:', error);
        alert('Er ging iets mis. Probeer het opnieuw.');
      } finally {
        setIsLoading(false);
      }
    } else {
      // Go to next question
      router.push(`/assessment/${step + 1}`);
    }
  };

  const handleBack = () => {
    if (step === 1) {
      router.push('/register');
    } else {
      router.push(`/assessment/${step - 1}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="ghost"
              onClick={handleBack}
              className="text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Terug
            </Button>
            <div className="text-sm text-gray-600 font-medium">
              Vraag {step} van 7
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <Progress value={progress} className="h-2" />
            <div className="flex justify-between text-xs text-gray-500">
              <span>Start</span>
              <span>{Math.round(progress)}% compleet</span>
              <span>Aanbeveling</span>
            </div>
          </div>
        </div>

        {/* Question Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="border-2 border-gray-200 shadow-xl bg-white/80 backdrop-blur-sm">
              <CardContent className="p-8">
                {/* Question */}
                <div className="mb-8">
                  <h1 className="text-3xl font-bold text-gray-900 mb-3">
                    {currentQuestion.question}
                  </h1>
                  {currentQuestion.subtitle && (
                    <p className="text-gray-600 text-lg">
                      {currentQuestion.subtitle}
                    </p>
                  )}
                </div>

                {/* Options */}
                <div className="space-y-3">
                  {currentQuestion.options.map((option: AssessmentOption) => (
                    <motion.div
                      key={option.value}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <button
                        onClick={() => handleSelectOption(option.value)}
                        className={`w-full text-left p-5 rounded-xl border-2 transition-all ${
                          selectedAnswer === option.value
                            ? 'border-pink-500 bg-pink-50 shadow-md'
                            : 'border-gray-200 bg-white hover:border-pink-300 hover:shadow-sm'
                        }`}
                      >
                        <div className="flex items-start gap-4">
                          {/* Icon */}
                          <div className="text-3xl flex-shrink-0">
                            {option.icon}
                          </div>

                          {/* Content */}
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <h3 className="font-semibold text-gray-900 text-lg">
                                {option.label}
                              </h3>
                              {selectedAnswer === option.value && (
                                <CheckCircle className="w-5 h-5 text-pink-500 flex-shrink-0" />
                              )}
                            </div>
                            {option.description && (
                              <p className="text-sm text-gray-600">
                                {option.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </button>
                    </motion.div>
                  ))}
                </div>

                {/* Next Button */}
                <div className="mt-8 flex justify-end">
                  <Button
                    onClick={handleNext}
                    disabled={!selectedAnswer || isLoading}
                    className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white px-8 py-6 text-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Opslaan...
                      </>
                    ) : step === 7 ? (
                      <>
                        Bekijk aanbeveling
                        <CheckCircle className="w-5 h-5 ml-2" />
                      </>
                    ) : (
                      <>
                        Volgende vraag
                        <ArrowRight className="w-5 h-5 ml-2" />
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>

        {/* Tips Section */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            💡 <strong>Tip:</strong> Kies het antwoord dat het beste bij je aanvoelt.
            Er zijn geen goede of foute antwoorden.
          </p>
        </div>
      </div>
    </div>
  );
}
