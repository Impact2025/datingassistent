/**
 * Pattern Quiz Types
 *
 * Type definitions for the Dating Pattern Quiz based on attachment theory.
 * Uses the Bartholomew & Horowitz (1991) Four-Category Model.
 */

import type { LucideIcon } from 'lucide-react';

// =====================================================
// ATTACHMENT PATTERNS
// =====================================================

export type AttachmentPattern = 'secure' | 'anxious' | 'avoidant' | 'fearful_avoidant';

export interface AttachmentDimensions {
  /** Anxiety score (0-100 normalized) */
  anxiety: number;
  /** Avoidance score (0-100 normalized) */
  avoidance: number;
}

// =====================================================
// QUIZ QUESTIONS
// =====================================================

export type QuestionPhase = 'opening' | 'middle' | 'closing';

export interface PatternQuestionOption {
  value: string;
  label: string;
  description?: string;
  /** How much this option adds to anxiety score (0-25) */
  anxietyWeight?: number;
  /** How much this option adds to avoidance score (0-25) */
  avoidanceWeight?: number;
  /** Direct pattern mapping for Q7 */
  directPattern?: AttachmentPattern;
}

export interface PatternQuestion {
  id: number;
  phase: QuestionPhase;
  question: string;
  description?: string;
  icon: LucideIcon;
  options: PatternQuestionOption[];
}

// =====================================================
// QUIZ STATE
// =====================================================

export type QuizState =
  | 'landing'      // Landing page with hero
  | 'question'     // Answering questions (1-10)
  | 'email-gate'   // Email capture step
  | 'analyzing'    // Analyzing animation
  | 'result';      // Result display

export interface PatternQuizAnswers {
  [questionId: string]: string;
}

export interface PatternQuizState {
  currentState: QuizState;
  currentQuestion: number;
  answers: PatternQuizAnswers;
  email: string;
  firstName: string;
  acceptsMarketing: boolean;
  resultId: string | null;
  attachmentPattern: AttachmentPattern | null;
  utmParams?: {
    source?: string;
    medium?: string;
    campaign?: string;
  };
}

// =====================================================
// SCORING
// =====================================================

export interface PatternScoringResult {
  /** Normalized anxiety score (0-100) */
  anxietyScore: number;
  /** Normalized avoidance score (0-100) */
  avoidanceScore: number;
  /** Determined attachment pattern */
  attachmentPattern: AttachmentPattern;
  /** Confidence in the prediction (0-100) */
  confidence: number;
}

// =====================================================
// RESULT CONFIGURATION
// =====================================================

export interface PatternResultTestimonial {
  quote: string;
  name: string;
  age: number;
}

export interface PatternResultConfig {
  key: AttachmentPattern;

  // Display info
  title: string;
  subtitle: string;
  color: string;

  // Content sections (from the blueprint)
  opening: {
    headline: string;
    paragraph: string;
  };
  nuance: {
    headline: string;
    paragraph: string;
  };
  patternExplained: {
    headline: string;
    paragraph: string;
    bullets: string[];
  };
  mainPitfall: {
    headline: string;
    paragraph: string;
  };
  concreteTip: {
    headline: string;
    tip: string;
  };

  // CTA configuration
  ctaSection: {
    headline: string;
    paragraph: string;
    bullets?: string[];
    buttonText: string;
    buttonTextSecondary?: string;
    testimonial?: PatternResultTestimonial;
  };
}

// =====================================================
// API TYPES
// =====================================================

export interface PatternQuizSubmitRequest {
  answers: PatternQuizAnswers;
  email: string;
  firstName: string;
  acceptsMarketing: boolean;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
}

export interface PatternQuizSubmitResponse {
  success: boolean;
  resultId: string;
  attachmentPattern: AttachmentPattern;
  anxietyScore: number;
  avoidanceScore: number;
  confidence: number;
}

export interface PatternQuizResultResponse {
  id: number;
  firstName: string;
  email: string;
  attachmentPattern: AttachmentPattern;
  anxietyScore: number;
  avoidanceScore: number;
  confidence: number;
  answers: PatternQuizAnswers;
  completedAt: string;
}
