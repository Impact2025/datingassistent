/**
 * Pattern Quiz Scoring Algorithm
 *
 * Calculates attachment pattern based on two dimensions:
 * - ANXIETY: Fear of rejection/abandonment, need for approval
 * - AVOIDANCE: Discomfort with intimacy/dependency
 *
 * Based on Bartholomew & Horowitz (1991) Four-Category Model:
 * - SECURE: Low anxiety + Low avoidance
 * - ANXIOUS: High anxiety + Low avoidance
 * - AVOIDANT: Low anxiety + High avoidance
 * - FEARFUL_AVOIDANT: High anxiety + High avoidance
 */

import type {
  AttachmentPattern,
  PatternQuizAnswers,
  PatternScoringResult,
} from './pattern-types';
import { PATTERN_QUESTIONS } from './pattern-questions';

// =====================================================
// THRESHOLDS
// =====================================================

/** Threshold for low dimension (below this = low) */
const LOW_THRESHOLD = 40;

/** Threshold for high dimension (above this = high) */
const HIGH_THRESHOLD = 60;

/** Maximum possible raw score for anxiety (Q3 + Q5 + Q7 max weights) */
const MAX_ANXIETY_RAW = 75;

/** Maximum possible raw score for avoidance (Q4 + Q6 + Q7 max weights) */
const MAX_AVOIDANCE_RAW = 75;

// =====================================================
// SCORING FUNCTIONS
// =====================================================

/**
 * Get the weight for a specific answer from question options
 */
function getWeight(
  questionId: number,
  answerValue: string,
  dimension: 'anxiety' | 'avoidance'
): number {
  const question = PATTERN_QUESTIONS.find((q) => q.id === questionId);
  if (!question) return 0;

  const option = question.options.find((o) => o.value === answerValue);
  if (!option) return 0;

  return dimension === 'anxiety'
    ? option.anxietyWeight ?? 0
    : option.avoidanceWeight ?? 0;
}

/**
 * Get direct pattern mapping from Q7 if available
 */
function getDirectPatternFromQ7(answerValue: string): AttachmentPattern | null {
  const q7 = PATTERN_QUESTIONS.find((q) => q.id === 7);
  if (!q7) return null;

  const option = q7.options.find((o) => o.value === answerValue);
  return option?.directPattern ?? null;
}

/**
 * Calculate raw anxiety score from answers
 * Primary questions: Q3, Q5, Q7
 */
function calculateRawAnxiety(answers: PatternQuizAnswers): number {
  let score = 0;

  // Q3: After good date, no message
  if (answers['3']) {
    score += getWeight(3, answers['3'], 'anxiety');
  }

  // Q5: More investment = more insecurity
  if (answers['5']) {
    score += getWeight(5, answers['5'], 'anxiety');
  }

  // Q7: Direct statement
  if (answers['7']) {
    score += getWeight(7, answers['7'], 'anxiety');
  }

  return score;
}

/**
 * Calculate raw avoidance score from answers
 * Primary questions: Q4, Q6, Q7
 */
function calculateRawAvoidance(answers: PatternQuizAnswers): number {
  let score = 0;

  // Q4: Sharing personal things
  if (answers['4']) {
    score += getWeight(4, answers['4'], 'avoidance');
  }

  // Q6: Distance when serious
  if (answers['6']) {
    score += getWeight(6, answers['6'], 'avoidance');
  }

  // Q7: Direct statement
  if (answers['7']) {
    score += getWeight(7, answers['7'], 'avoidance');
  }

  return score;
}

/**
 * Normalize raw score to 0-100 scale
 */
function normalizeScore(rawScore: number, maxRaw: number): number {
  const normalized = (rawScore / maxRaw) * 100;
  return Math.min(100, Math.max(0, Math.round(normalized)));
}

/**
 * Determine attachment pattern from dimension scores
 */
function determinePattern(
  anxietyScore: number,
  avoidanceScore: number
): AttachmentPattern {
  const isLowAnxiety = anxietyScore < LOW_THRESHOLD;
  const isHighAnxiety = anxietyScore >= HIGH_THRESHOLD;
  const isLowAvoidance = avoidanceScore < LOW_THRESHOLD;
  const isHighAvoidance = avoidanceScore >= HIGH_THRESHOLD;

  // Clear quadrant assignments
  if (isLowAnxiety && isLowAvoidance) {
    return 'secure';
  }

  if (isHighAnxiety && isLowAvoidance) {
    return 'anxious';
  }

  if (isLowAnxiety && isHighAvoidance) {
    return 'avoidant';
  }

  if (isHighAnxiety && isHighAvoidance) {
    return 'fearful_avoidant';
  }

  // Ambiguous cases (in the "grey zone")
  // Use distance from center to determine primary pattern
  const anxietyMidpoint = (LOW_THRESHOLD + HIGH_THRESHOLD) / 2; // 50
  const avoidanceMidpoint = (LOW_THRESHOLD + HIGH_THRESHOLD) / 2; // 50

  const anxietyDeviation = anxietyScore - anxietyMidpoint;
  const avoidanceDeviation = avoidanceScore - avoidanceMidpoint;

  // Determine by strongest deviation from midpoint
  if (Math.abs(anxietyDeviation) > Math.abs(avoidanceDeviation)) {
    // Anxiety is the dominant factor
    if (anxietyScore > anxietyMidpoint) {
      return avoidanceScore > avoidanceMidpoint ? 'fearful_avoidant' : 'anxious';
    }
    return avoidanceScore > avoidanceMidpoint ? 'avoidant' : 'secure';
  } else {
    // Avoidance is the dominant factor
    if (avoidanceScore > avoidanceMidpoint) {
      return anxietyScore > anxietyMidpoint ? 'fearful_avoidant' : 'avoidant';
    }
    return anxietyScore > anxietyMidpoint ? 'anxious' : 'secure';
  }
}

/**
 * Calculate confidence in the pattern prediction
 * Higher when scores are clearly in one quadrant
 */
function calculateConfidence(
  anxietyScore: number,
  avoidanceScore: number,
  pattern: AttachmentPattern
): number {
  let anxietyDistance: number;
  let avoidanceDistance: number;

  switch (pattern) {
    case 'secure':
      anxietyDistance = LOW_THRESHOLD - anxietyScore;
      avoidanceDistance = LOW_THRESHOLD - avoidanceScore;
      break;
    case 'anxious':
      anxietyDistance = anxietyScore - HIGH_THRESHOLD;
      avoidanceDistance = LOW_THRESHOLD - avoidanceScore;
      break;
    case 'avoidant':
      anxietyDistance = LOW_THRESHOLD - anxietyScore;
      avoidanceDistance = avoidanceScore - HIGH_THRESHOLD;
      break;
    case 'fearful_avoidant':
      anxietyDistance = anxietyScore - HIGH_THRESHOLD;
      avoidanceDistance = avoidanceScore - HIGH_THRESHOLD;
      break;
  }

  // Base confidence
  let confidence = 65;

  // Add confidence based on distance from thresholds
  confidence += Math.max(0, anxietyDistance) * 0.8;
  confidence += Math.max(0, avoidanceDistance) * 0.8;

  // Penalize if in grey zone
  if (anxietyDistance < 0) confidence -= Math.abs(anxietyDistance) * 0.5;
  if (avoidanceDistance < 0) confidence -= Math.abs(avoidanceDistance) * 0.5;

  // Clamp to valid range
  return Math.min(95, Math.max(55, Math.round(confidence)));
}

// =====================================================
// MAIN EXPORT
// =====================================================

/**
 * Calculate pattern score from quiz answers
 *
 * @param answers - Object with question ID keys and answer values
 * @returns Complete scoring result with pattern and confidence
 *
 * @example
 * ```ts
 * const result = calculatePatternScore({
 *   '1': 'less_than_6_months',
 *   '2': 'wrong_type',
 *   '3': 'feel_restless',
 *   '4': 'depends_on_safety',
 *   '5': 'yes_pattern',
 *   '6': 'no',
 *   '7': 'want_connection_fear_rejection',
 *   '8': 'both',
 *   '9': '3_to_7_hours',
 *   '10': 'understand_myself',
 * });
 *
 * console.log(result.attachmentPattern); // 'anxious'
 * console.log(result.anxietyScore); // 80
 * console.log(result.confidence); // 78
 * ```
 */
export function calculatePatternScore(
  answers: PatternQuizAnswers
): PatternScoringResult {
  // Calculate raw scores from weighted answers
  const rawAnxiety = calculateRawAnxiety(answers);
  const rawAvoidance = calculateRawAvoidance(answers);

  // Normalize to 0-100
  const anxietyScore = normalizeScore(rawAnxiety, MAX_ANXIETY_RAW);
  const avoidanceScore = normalizeScore(rawAvoidance, MAX_AVOIDANCE_RAW);

  // Check for direct pattern from Q7 (strongest indicator)
  const directPattern = answers['7']
    ? getDirectPatternFromQ7(answers['7'])
    : null;

  // Determine pattern (prefer direct mapping if clear)
  let attachmentPattern: AttachmentPattern;

  if (directPattern) {
    // Q7 is a strong direct indicator
    // But validate with dimension scores for edge cases
    const dimensionPattern = determinePattern(anxietyScore, avoidanceScore);

    // If Q7 and dimensions agree, use Q7
    // If they disagree significantly, use dimensions
    const agreeOnAnxiety =
      (directPattern === 'secure' || directPattern === 'avoidant') ===
      (anxietyScore < LOW_THRESHOLD);
    const agreeOnAvoidance =
      (directPattern === 'secure' || directPattern === 'anxious') ===
      (avoidanceScore < LOW_THRESHOLD);

    if (agreeOnAnxiety && agreeOnAvoidance) {
      attachmentPattern = directPattern;
    } else if (agreeOnAnxiety || agreeOnAvoidance) {
      // Partial agreement - slight preference for Q7
      attachmentPattern = directPattern;
    } else {
      // Full disagreement - use dimension calculation
      attachmentPattern = dimensionPattern;
    }
  } else {
    attachmentPattern = determinePattern(anxietyScore, avoidanceScore);
  }

  // Calculate confidence
  const confidence = calculateConfidence(
    anxietyScore,
    avoidanceScore,
    attachmentPattern
  );

  return {
    anxietyScore,
    avoidanceScore,
    attachmentPattern,
    confidence,
  };
}

/**
 * Get pattern distribution percentages (for UI display)
 */
export const PATTERN_DISTRIBUTION = {
  secure: 15,
  anxious: 35,
  avoidant: 25,
  fearful_avoidant: 25,
} as const;
