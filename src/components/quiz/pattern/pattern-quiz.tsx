'use client';

/**
 * Pattern Quiz Main Component - CONVERSION OPTIMIZED VERSION
 *
 * Orchestrates the complete Dating Pattern Quiz flow:
 * Landing → Questions (1-10) → Account Creation → Analyzing → Result with OTO
 *
 * Features:
 * - localStorage progress saving
 * - Account creation during flow
 * - OTO modal sequence (Transformatie → Kickstart downsell)
 * - UTM tracking
 */

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { AnimatePresence } from 'framer-motion';
import type {
  QuizState,
  PatternQuizAnswers,
  AttachmentPattern,
} from '@/lib/quiz/pattern/pattern-types';
import { PATTERN_QUESTIONS } from '@/lib/quiz/pattern/pattern-questions';
import { PatternLandingHero } from './pattern-landing-hero';
import { PatternQuestionComponent } from './pattern-question';
import { PatternAccountGate } from './pattern-account-gate';
import { PatternAnalyzing } from './pattern-analyzing';
import { PatternResultWithOTO } from './pattern-result-with-oto';

const STORAGE_KEY = 'dating-pattern-quiz-progress';

interface SavedProgress {
  quizState: QuizState;
  currentQuestionIndex: number;
  answers: PatternQuizAnswers;
  savedAt: number;
}

// Helper to check if localStorage is available
function isStorageAvailable(): boolean {
  try {
    const test = '__storage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}

// Helper to save progress
function saveProgress(data: Omit<SavedProgress, 'savedAt'>): void {
  if (!isStorageAvailable()) return;
  try {
    const progress: SavedProgress = { ...data, savedAt: Date.now() };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch (e) {
    console.warn('Failed to save quiz progress:', e);
  }
}

// Helper to load progress (max 24 hours old)
function loadProgress(): SavedProgress | null {
  if (!isStorageAvailable()) return null;
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return null;

    const progress: SavedProgress = JSON.parse(saved);
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours

    // Check if progress is still valid
    if (Date.now() - progress.savedAt > maxAge) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }

    // Don't restore if already completed
    if (progress.quizState === 'result' || progress.quizState === 'analyzing') {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }

    return progress;
  } catch {
    return null;
  }
}

// Helper to clear progress
function clearProgress(): void {
  if (!isStorageAvailable()) return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore
  }
}

interface PatternQuizProps {
  /** Start directly on questions instead of landing page */
  skipLanding?: boolean;
}

export function PatternQuiz({ skipLanding = false }: PatternQuizProps) {
  const searchParams = useSearchParams();

  // Quiz state
  const [quizState, setQuizState] = useState<QuizState>(
    skipLanding ? 'question' : 'landing'
  );
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<PatternQuizAnswers>({});
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [acceptsMarketing, setAcceptsMarketing] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasRestoredProgress, setHasRestoredProgress] = useState(false);

  // Result state
  const [resultId, setResultId] = useState<string | null>(null);
  const [attachmentPattern, setAttachmentPattern] =
    useState<AttachmentPattern | null>(null);
  const [anxietyScore, setAnxietyScore] = useState(0);
  const [avoidanceScore, setAvoidanceScore] = useState(0);
  const [confidence, setConfidence] = useState(0);

  // UTM tracking
  const [utmParams, setUtmParams] = useState<{
    source?: string;
    medium?: string;
    campaign?: string;
  }>({});

  // Capture UTM params on mount
  useEffect(() => {
    if (searchParams) {
      setUtmParams({
        source: searchParams.get('utm_source') || undefined,
        medium: searchParams.get('utm_medium') || undefined,
        campaign: searchParams.get('utm_campaign') || undefined,
      });
    }
  }, [searchParams]);

  // Restore progress from localStorage on mount
  useEffect(() => {
    if (hasRestoredProgress) return;

    const saved = loadProgress();
    if (saved && saved.currentQuestionIndex > 0) {
      // Only restore if user has made progress
      setQuizState(saved.quizState);
      setCurrentQuestionIndex(saved.currentQuestionIndex);
      setAnswers(saved.answers);
    }
    setHasRestoredProgress(true);
  }, [hasRestoredProgress]);

  // Save progress when answers or question index changes
  useEffect(() => {
    if (!hasRestoredProgress) return;
    if (quizState === 'result' || quizState === 'analyzing') {
      // Clear progress when quiz is completed
      clearProgress();
      return;
    }
    if (quizState === 'question' || quizState === 'email-gate') {
      saveProgress({
        quizState,
        currentQuestionIndex,
        answers,
      });
    }
  }, [quizState, currentQuestionIndex, answers, hasRestoredProgress]);

  const currentQuestion = PATTERN_QUESTIONS[currentQuestionIndex];
  const currentAnswer = answers[currentQuestion?.id?.toString()] || null;

  // Handlers
  const handleStartQuiz = () => {
    setQuizState('question');
  };

  const handleAnswer = (value: string) => {
    if (!currentQuestion) return;
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id.toString()]: value,
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < PATTERN_QUESTIONS.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      // Last question - go to email gate
      setQuizState('email-gate');
    }
  };

  const handleBack = () => {
    if (quizState === 'email-gate') {
      setQuizState('question');
      return;
    }

    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    } else if (quizState === 'question' && !skipLanding) {
      setQuizState('landing');
    }
  };

  const handleEmailSubmit = async (
    submittedEmail: string,
    submittedFirstName: string,
    submittedAcceptsMarketing: boolean
  ) => {
    setEmail(submittedEmail);
    setFirstName(submittedFirstName);
    setAcceptsMarketing(submittedAcceptsMarketing);
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/quiz/pattern/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          answers,
          email: submittedEmail,
          firstName: submittedFirstName,
          acceptsMarketing: submittedAcceptsMarketing,
          utmSource: utmParams.source,
          utmMedium: utmParams.medium,
          utmCampaign: utmParams.campaign,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Quiz submit error:', errorData);
        throw new Error(errorData.error || 'Failed to submit quiz');
      }

      const data = await response.json();

      setResultId(data.resultId);
      setAttachmentPattern(data.attachmentPattern);
      setAnxietyScore(data.anxietyScore);
      setAvoidanceScore(data.avoidanceScore);
      setConfidence(data.confidence);

      // Go to analyzing screen
      setQuizState('analyzing');
    } catch (error) {
      console.error('Error submitting quiz:', error);
      const message = error instanceof Error ? error.message : 'Onbekende fout';
      alert(`Er ging iets mis: ${message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAnalyzingComplete = () => {
    setQuizState('result');
  };

  // Render based on state
  return (
    <AnimatePresence mode="wait">
      {quizState === 'landing' && (
        <PatternLandingHero key="landing" onStartQuiz={handleStartQuiz} />
      )}

      {quizState === 'question' && currentQuestion && (
        <PatternQuestionComponent
          key={`question-${currentQuestionIndex}`}
          question={currentQuestion}
          currentAnswer={currentAnswer}
          onAnswer={handleAnswer}
          onNext={handleNext}
          onBack={handleBack}
          canGoBack={currentQuestionIndex > 0 || !skipLanding}
        />
      )}

      {quizState === 'email-gate' && (
        <PatternEmailGate
          key="email-gate"
          onSubmit={handleEmailSubmit}
          onBack={handleBack}
          isSubmitting={isSubmitting}
        />
      )}

      {quizState === 'analyzing' && (
        <PatternAnalyzing
          key="analyzing"
          onComplete={handleAnalyzingComplete}
          firstName={firstName}
        />
      )}

      {quizState === 'result' && attachmentPattern && (
        <PatternResult
          key="result"
          firstName={firstName}
          pattern={attachmentPattern}
          anxietyScore={anxietyScore}
          avoidanceScore={avoidanceScore}
          confidence={confidence}
        />
      )}
    </AnimatePresence>
  );
}
