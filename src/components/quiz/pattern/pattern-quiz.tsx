'use client';

/**
 * Pattern Quiz Main Component
 *
 * Orchestrates the complete Dating Pattern Quiz flow:
 * Landing → Questions (1-10) → Email Gate → Analyzing → Result
 */

import { useState, useEffect } from 'react';
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
import { PatternEmailGate } from './pattern-email-gate';
import { PatternAnalyzing } from './pattern-analyzing';
import { PatternResult } from './pattern-result';

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
        throw new Error('Failed to submit quiz');
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
      // TODO: Show error toast
      alert('Er ging iets mis. Probeer het opnieuw.');
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
