'use client';

/**
 * Pattern Quiz Main Component - CONVERSION OPTIMIZED VERSION
 *
 * Orchestrates the complete Dating Pattern Quiz flow:
 * Landing → Questions (1-10) → Preview → Account Gate → Analyzing → Result with OTO
 *
 * Features:
 * - localStorage progress saving
 * - Account creation during flow (OTP-free for new users)
 * - Quiz submit runs in parallel with the analyzing animation (no stacked delays)
 * - Inline error handling (no browser alerts)
 * - OTO modal sequence (Transformatie → Kickstart downsell)
 * - UTM tracking
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { useUser } from '@/providers/user-provider';
import { AnimatePresence, motion } from 'framer-motion';
import type {
  QuizState,
  PatternQuizAnswers,
  AttachmentPattern,
} from '@/lib/quiz/pattern/pattern-types';
import { PATTERN_QUESTIONS, TOTAL_QUESTIONS } from '@/lib/quiz/pattern/pattern-questions';
import { calculatePatternScore } from '@/lib/quiz/pattern/pattern-scoring';
import { PatternLandingHero } from './pattern-landing-hero';
import { PatternQuestionComponent } from './pattern-question';
import { PatternPreview } from './pattern-preview';
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

function saveProgress(data: Omit<SavedProgress, 'savedAt'>): void {
  if (!isStorageAvailable()) return;
  try {
    const progress: SavedProgress = { ...data, savedAt: Date.now() };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch (e) {
    console.warn('Failed to save quiz progress:', e);
  }
}

function loadProgress(): SavedProgress | null {
  if (!isStorageAvailable()) return null;
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return null;

    const progress: SavedProgress = JSON.parse(saved);
    const maxAge = 24 * 60 * 60 * 1000;

    if (Date.now() - progress.savedAt > maxAge) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }

    if (progress.quizState === 'result' || progress.quizState === 'analyzing') {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }

    return progress;
  } catch {
    return null;
  }
}

function clearProgress(): void {
  if (!isStorageAvailable()) return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore
  }
}

interface PatternQuizProps {
  skipLanding?: boolean;
}

export function PatternQuiz({ skipLanding = false }: PatternQuizProps) {
  const searchParams = useSearchParams();
  const { user } = useUser();

  const [quizState, setQuizState] = useState<QuizState>(
    skipLanding ? 'question' : 'landing'
  );
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<PatternQuizAnswers>({});
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [acceptsMarketing, setAcceptsMarketing] = useState(true);
  const [hasRestoredProgress, setHasRestoredProgress] = useState(false);

  // Preview state — local pre-calculation shown before email gate
  const [previewPattern, setPreviewPattern] = useState<AttachmentPattern | null>(null);
  const [previewAnxietyScore, setPreviewAnxietyScore] = useState(0);
  const [previewAvoidanceScore, setPreviewAvoidanceScore] = useState(0);
  const [previewConfidence, setPreviewConfidence] = useState(0);

  // Result state — confirmed by API after account creation
  const [resultId, setResultId] = useState<string | null>(null);
  const [attachmentPattern, setAttachmentPattern] = useState<AttachmentPattern | null>(null);
  const [anxietyScore, setAnxietyScore] = useState(0);
  const [avoidanceScore, setAvoidanceScore] = useState(0);
  const [confidence, setConfidence] = useState(0);
  const [userId, setUserId] = useState<number | null>(null);

  // Inline submit error (replaces browser alert)
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Coordination: analyzing animation + quiz submit API run in parallel.
  // We transition to 'result' only when BOTH are done.
  const apiResultReadyRef = useRef(false);
  const analyzingDoneRef = useRef(false);

  // UTM tracking
  const [utmParams, setUtmParams] = useState<{
    source?: string;
    medium?: string;
    campaign?: string;
  }>({});

  useEffect(() => {
    if (!searchParams) return;
    const source   = searchParams.get('utm_source')   || undefined;
    const medium   = searchParams.get('utm_medium')   || undefined;
    const campaign = searchParams.get('utm_campaign') || undefined;
    setUtmParams({ source, medium, campaign });

    if (source || medium || campaign) {
      try {
        sessionStorage.setItem('da_utm', JSON.stringify({ source, medium, campaign }));
      } catch { /* ignore */ }
    }
  }, [searchParams]);

  // Restore progress from localStorage on mount
  useEffect(() => {
    if (hasRestoredProgress) return;

    const saved = loadProgress();
    if (saved && saved.currentQuestionIndex > 0) {
      setQuizState(saved.quizState);
      setCurrentQuestionIndex(saved.currentQuestionIndex);
      setAnswers(saved.answers);
    }
    setHasRestoredProgress(true);
  }, [hasRestoredProgress]);

  // If a returning magic-link user lands back on the quiz already authenticated,
  // auto-advance past the email gate so they don't have to interact again.
  useEffect(() => {
    if (!user || !hasRestoredProgress) return;
    if (quizState !== 'email-gate') return;

    const answeredCount = Object.keys(answers).length;
    if (answeredCount < TOTAL_QUESTIONS) return;

    // User is authenticated — pull their info and submit immediately
    const storedName = (typeof window !== 'undefined' && localStorage.getItem('quiz_user_name')) || user.name || '';
    handleAccountSubmit(user.email, storedName, true, user.id);
  }, [user, hasRestoredProgress, quizState]); // eslint-disable-line react-hooks/exhaustive-deps

  // Save progress when answers or question index changes
  useEffect(() => {
    if (!hasRestoredProgress) return;
    if (quizState === 'result' || quizState === 'analyzing') {
      clearProgress();
      return;
    }
    if (quizState === 'question' || quizState === 'email-gate') {
      saveProgress({ quizState, currentQuestionIndex, answers });
    }
  }, [quizState, currentQuestionIndex, answers, hasRestoredProgress]);

  const currentQuestion = PATTERN_QUESTIONS[currentQuestionIndex];
  const currentAnswer = answers[currentQuestion?.id?.toString()] || null;

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

  const handleNext = (lastAnswerValue?: string) => {
    if (currentQuestionIndex < PATTERN_QUESTIONS.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      const finalAnswers = lastAnswerValue && currentQuestion
        ? { ...answers, [currentQuestion.id.toString()]: lastAnswerValue }
        : answers;

      setAnswers(finalAnswers);

      const localScore = calculatePatternScore(finalAnswers);
      setPreviewPattern(localScore.attachmentPattern);
      setPreviewAnxietyScore(localScore.anxietyScore);
      setPreviewAvoidanceScore(localScore.avoidanceScore);
      setPreviewConfidence(localScore.confidence);
      setQuizState('preview');
    }
  };

  const handleBack = () => {
    if (quizState === 'preview') {
      setQuizState('question');
      return;
    }
    if (quizState === 'email-gate') {
      setSubmitError(null);
      setQuizState('preview');
      return;
    }

    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    } else if (quizState === 'question' && !skipLanding) {
      setQuizState('landing');
    }
  };

  /**
   * Called by PatternAccountGate once the user's account is ready (new or existing).
   *
   * CHANGE: We switch to 'analyzing' IMMEDIATELY so the animation starts right away.
   * The quiz submit API runs in parallel — we transition to 'result' when BOTH complete.
   */
  const handleAccountSubmit = useCallback(async (
    submittedEmail: string,
    submittedFirstName: string,
    submittedAcceptsMarketing: boolean,
    submittedUserId: number
  ) => {
    setEmail(submittedEmail);
    setFirstName(submittedFirstName);
    setAcceptsMarketing(submittedAcceptsMarketing);
    setUserId(submittedUserId);
    setSubmitError(null);

    // Guard: check all questions are answered before proceeding.
    // This can happen if localStorage restored an incomplete 'email-gate' state.
    const answeredCount = Object.keys(answers).length;
    if (answeredCount < TOTAL_QUESTIONS) {
      const firstMissingIndex = PATTERN_QUESTIONS.findIndex(
        q => !answers[q.id.toString()]
      );
      setCurrentQuestionIndex(firstMissingIndex >= 0 ? firstMissingIndex : 0);
      setQuizState('question');
      return;
    }

    // Reset coordination flags for this run
    apiResultReadyRef.current = false;
    analyzingDoneRef.current = false;

    // Show analyzing immediately — no stacked delay
    setQuizState('analyzing');

    try {
      const response = await fetch('/api/quiz/pattern/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          answers,
          email: submittedEmail,
          firstName: submittedFirstName,
          acceptsMarketing: submittedAcceptsMarketing,
          userId: submittedUserId,
          utmSource: utmParams.source,
          utmMedium: utmParams.medium,
          utmCampaign: utmParams.campaign,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Inzending mislukt. Probeer het opnieuw.');
      }

      const data = await response.json();

      setResultId(data.resultId);
      setAttachmentPattern(data.attachmentPattern);
      setAnxietyScore(data.anxietyScore);
      setAvoidanceScore(data.avoidanceScore);
      setConfidence(data.confidence);

      // Signal that the API is done.
      // If the analyzing animation has already completed, go to result immediately.
      apiResultReadyRef.current = true;
      if (analyzingDoneRef.current) {
        setQuizState('result');
      }
      // else: stay in 'analyzing' — the animation's onComplete handler will transition us.
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Er is een onbekende fout opgetreden.';
      setSubmitError(message);
      // Go back to email gate so user can try again
      setQuizState('email-gate');
      apiResultReadyRef.current = false;
      analyzingDoneRef.current = false;
    }
  }, [answers, utmParams]);

  /**
   * Called by PatternAnalyzing after its 3-second animation completes.
   * If the API is already done, go straight to result.
   * If the API is still running, flag that we're ready — it will complete the transition.
   */
  const handleAnalyzingComplete = useCallback(() => {
    analyzingDoneRef.current = true;
    if (apiResultReadyRef.current) {
      setQuizState('result');
    }
    // else: stay on analyzing screen — API response will trigger the transition.
  }, []);

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

      {quizState === 'preview' && previewPattern && (
        <PatternPreview
          key="preview"
          pattern={previewPattern}
          anxietyScore={previewAnxietyScore}
          avoidanceScore={previewAvoidanceScore}
          confidence={previewConfidence}
          onUnlock={() => setQuizState('email-gate')}
        />
      )}

      {quizState === 'email-gate' && (
        <PatternAccountGate
          key="account-gate"
          onSubmit={handleAccountSubmit}
          onBack={handleBack}
          isSubmitting={false}
          submitError={submitError}
          onClearError={() => setSubmitError(null)}
          initialEmail={email}
          initialFirstName={firstName}
        />
      )}

      {quizState === 'analyzing' && (
        <PatternAnalyzing
          key="analyzing"
          onComplete={handleAnalyzingComplete}
          firstName={firstName}
        />
      )}

      {quizState === 'result' && attachmentPattern && userId && (
        <PatternResultWithOTO
          key="result"
          firstName={firstName}
          pattern={attachmentPattern}
          anxietyScore={anxietyScore}
          avoidanceScore={avoidanceScore}
          confidence={confidence}
          userId={userId}
        />
      )}
    </AnimatePresence>
  );
}
