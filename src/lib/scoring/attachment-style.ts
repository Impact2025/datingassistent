/**
 * Attachment Style Calculator
 *
 * World-class implementation based on established psychological research.
 *
 * SCIENTIFIC FOUNDATION:
 * ----------------------
 * Based on Bartholomew & Horowitz (1991) Four-Category Model of Adult Attachment,
 * which builds on Bowlby's (1969) Attachment Theory and Ainsworth's (1978) research.
 *
 * The model uses two orthogonal dimensions:
 * 1. ANXIETY (Model of Self): Fear of rejection/abandonment, need for approval
 * 2. AVOIDANCE (Model of Others): Discomfort with intimacy/dependency
 *
 * Four Attachment Styles:
 * - SECURE: Low anxiety + Low avoidance → Positive self, positive others
 * - ANXIOUS (Preoccupied): High anxiety + Low avoidance → Negative self, positive others
 * - AVOIDANT (Dismissive): Low anxiety + High avoidance → Positive self, negative others
 * - FEARFUL-AVOIDANT: High anxiety + High avoidance → Negative self, negative others
 *
 * REFERENCES:
 * -----------
 * - Bartholomew, K., & Horowitz, L. M. (1991). Attachment styles among young adults.
 *   Journal of Personality and Social Psychology, 61(2), 226–244.
 * - Brennan, Clark & Shaver (1998). Experiences in Close Relationships Scale (ECR)
 * - Fraley, R. C. (2002). Attachment stability from infancy to adulthood.
 *
 * QUESTION MAPPING:
 * -----------------
 * Our 7-question short form maps to the ECR dimensions:
 *
 * ANXIETY DIMENSION (Questions measuring fear of abandonment/need for validation):
 * - Q1 (abandonment): "Ik maak me snel zorgen dat iemand me zal verlaten of afwijzen"
 * - Q4 (validation): "Ik heb veel bevestiging nodig van iemand waar ik mee date"
 * - Q7 (closeness): "Ik verlang naar meer nabijheid dan de ander comfortabel vindt"
 *
 * AVOIDANCE DIMENSION (Questions measuring discomfort with intimacy/dependency):
 * - Q2 (trust): "Ik vind het moeilijk om volledig op anderen te vertrouwen"
 * - Q3 (intimacy): "Ik voel me ongemakkelijk als relaties te intiem worden"
 * - Q5 (withdraw): "Ik trek me terug als iemand emotioneel te dichtbij komt"
 * - Q6 (independence): "Ik houd graag mijn onafhankelijkheid, ook in een relatie"
 *
 * SCORING:
 * --------
 * Each question: 1-5 scale (1 = Helemaal niet, 5 = Heel erg)
 *
 * Anxiety Score Range: 3-15 (sum of Q1, Q4, Q7)
 * Avoidance Score Range: 4-20 (sum of Q2, Q3, Q5, Q6)
 *
 * Thresholds (calibrated from ECR 36-item scale):
 * - Low Anxiety: ≤7 (corresponds to ~2.33 average, below midpoint)
 * - High Anxiety: >10 (corresponds to ~3.33 average, above midpoint)
 * - Low Avoidance: ≤10 (corresponds to ~2.5 average)
 * - High Avoidance: >14 (corresponds to ~3.5 average)
 */

import type { AttachmentStyle } from '@/types/dating-snapshot.types';

// =====================================================
// TYPES
// =====================================================

export interface AttachmentQuestionAnswers {
  attachment_q1_abandonment: number; // 1-5
  attachment_q2_trust: number;       // 1-5
  attachment_q3_intimacy: number;    // 1-5
  attachment_q4_validation: number;  // 1-5
  attachment_q5_withdraw: number;    // 1-5
  attachment_q6_independence: number;// 1-5
  attachment_q7_closeness: number;   // 1-5
}

export interface AttachmentDimensions {
  /** Anxiety score (fear of abandonment, need for approval) - Range: 3-15 */
  anxiety: number;
  /** Avoidance score (discomfort with intimacy) - Range: 4-20 */
  avoidance: number;
  /** Normalized anxiety (0-100 scale for UI) */
  anxietyNormalized: number;
  /** Normalized avoidance (0-100 scale for UI) */
  avoidanceNormalized: number;
}

export interface AttachmentResult {
  /** Primary attachment style */
  style: AttachmentStyle;
  /** Confidence in the prediction (0-100) */
  confidence: number;
  /** Raw dimension scores */
  dimensions: AttachmentDimensions;
  /** Human-readable style name (Dutch) */
  styleName: string;
  /** Brief description of the style */
  description: string;
  /** Coaching recommendations */
  recommendations: string[];
}

// =====================================================
// CONSTANTS
// =====================================================

/** Threshold for low anxiety (below midpoint) */
const ANXIETY_LOW_THRESHOLD = 7;

/** Threshold for high anxiety (above midpoint) */
const ANXIETY_HIGH_THRESHOLD = 10;

/** Threshold for low avoidance (below midpoint) */
const AVOIDANCE_LOW_THRESHOLD = 10;

/** Threshold for high avoidance (above midpoint) */
const AVOIDANCE_HIGH_THRESHOLD = 14;

/** Minimum possible anxiety score */
const ANXIETY_MIN = 3;

/** Maximum possible anxiety score */
const ANXIETY_MAX = 15;

/** Minimum possible avoidance score */
const AVOIDANCE_MIN = 4;

/** Maximum possible avoidance score */
const AVOIDANCE_MAX = 20;

// =====================================================
// STYLE METADATA
// =====================================================

const STYLE_METADATA: Record<AttachmentStyle, {
  name: string;
  description: string;
  recommendations: string[];
}> = {
  secure: {
    name: 'Veilig Gehecht',
    description: 'Je voelt je comfortabel met intimiteit en bent niet bang voor afwijzing. Je kunt zowel nabijheid als onafhankelijkheid balanceren.',
    recommendations: [
      'Je hechtingsstijl is een sterke basis voor gezonde relaties',
      'Focus op het vinden van iemand met vergelijkbare waarden',
      'Vertrouw op je intuïtie bij het daten',
    ],
  },
  anxious: {
    name: 'Angstig Gehecht',
    description: 'Je verlangt naar veel nabijheid en maakt je snel zorgen over afwijzing. Je hebt vaak bevestiging nodig van je partner.',
    recommendations: [
      'Module 9 (Attachment Healing) is speciaal voor jou ontworpen',
      'Leer je triggers herkennen voordat je reageert',
      'Bouw een sterk zelfbeeld onafhankelijk van relaties',
      'Geef matches de ruimte om te reageren zonder paniek',
    ],
  },
  avoidant: {
    name: 'Vermijdend Gehecht',
    description: 'Je waardeert onafhankelijkheid sterk en voelt je ongemakkelijk bij te veel intimiteit. Je trekt je soms terug als het serieus wordt.',
    recommendations: [
      'Module 9 helpt je om veilig dichter bij iemand te komen',
      'Oefen met kleine stappen richting kwetsbaarheid',
      'Erken dat behoefte aan verbinding normaal is',
      'Communiceer je behoefte aan ruimte in plaats van terugtrekken',
    ],
  },
  fearful_avoidant: {
    name: 'Angstig-Vermijdend Gehecht',
    description: 'Je wilt nabijheid maar bent er tegelijk bang voor. Dit kan leiden tot tegenstrijdige gevoelens in dating.',
    recommendations: [
      'Module 9 is essentieel voor jouw transformatie',
      'Overweeg aanvullende therapie naast deze cursus',
      'Ga langzaam — neem de tijd om vertrouwen op te bouwen',
      'Herken het push-pull patroon in je dating gedrag',
    ],
  },
};

// =====================================================
// CALCULATION FUNCTIONS
// =====================================================

/**
 * Calculate raw dimension scores from question answers
 */
function calculateDimensions(answers: AttachmentQuestionAnswers): AttachmentDimensions {
  // Calculate anxiety (sum of Q1, Q4, Q7)
  const anxiety =
    answers.attachment_q1_abandonment +
    answers.attachment_q4_validation +
    answers.attachment_q7_closeness;

  // Calculate avoidance (sum of Q2, Q3, Q5, Q6)
  const avoidance =
    answers.attachment_q2_trust +
    answers.attachment_q3_intimacy +
    answers.attachment_q5_withdraw +
    answers.attachment_q6_independence;

  // Normalize to 0-100 scale for UI display
  const anxietyNormalized = Math.round(
    ((anxiety - ANXIETY_MIN) / (ANXIETY_MAX - ANXIETY_MIN)) * 100
  );
  const avoidanceNormalized = Math.round(
    ((avoidance - AVOIDANCE_MIN) / (AVOIDANCE_MAX - AVOIDANCE_MIN)) * 100
  );

  return {
    anxiety,
    avoidance,
    anxietyNormalized,
    avoidanceNormalized,
  };
}

/**
 * Determine attachment style based on dimension scores
 *
 * Uses quadrant model:
 * - SECURE: Low anxiety AND low avoidance
 * - ANXIOUS: High anxiety AND low avoidance
 * - AVOIDANT: Low anxiety AND high avoidance
 * - FEARFUL-AVOIDANT: High anxiety AND high avoidance
 */
function determineStyle(dimensions: AttachmentDimensions): AttachmentStyle {
  const { anxiety, avoidance } = dimensions;

  const isLowAnxiety = anxiety <= ANXIETY_LOW_THRESHOLD;
  const isHighAnxiety = anxiety > ANXIETY_HIGH_THRESHOLD;
  const isLowAvoidance = avoidance <= AVOIDANCE_LOW_THRESHOLD;
  const isHighAvoidance = avoidance > AVOIDANCE_HIGH_THRESHOLD;

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
  // Use distance from center to determine primary style

  // Calculate distance from secure quadrant
  const anxietyMidpoint = (ANXIETY_LOW_THRESHOLD + ANXIETY_HIGH_THRESHOLD) / 2; // 8.5
  const avoidanceMidpoint = (AVOIDANCE_LOW_THRESHOLD + AVOIDANCE_HIGH_THRESHOLD) / 2; // 12

  const anxietyDeviation = anxiety - anxietyMidpoint;
  const avoidanceDeviation = avoidance - avoidanceMidpoint;

  // If both dimensions are in the grey zone, determine by strongest deviation
  if (Math.abs(anxietyDeviation) > Math.abs(avoidanceDeviation)) {
    // Anxiety is the dominant factor
    return anxiety > anxietyMidpoint ? 'anxious' : 'secure';
  } else {
    // Avoidance is the dominant factor
    return avoidance > avoidanceMidpoint ? 'avoidant' : 'secure';
  }
}

/**
 * Calculate confidence in the style prediction
 *
 * Higher confidence when scores are clearly in one quadrant.
 * Lower confidence when scores are near the thresholds.
 */
function calculateConfidence(
  dimensions: AttachmentDimensions,
  style: AttachmentStyle
): number {
  const { anxiety, avoidance } = dimensions;

  // Distance from threshold boundaries (higher = more confident)
  let anxietyDistance: number;
  let avoidanceDistance: number;

  switch (style) {
    case 'secure':
      anxietyDistance = ANXIETY_LOW_THRESHOLD - anxiety;
      avoidanceDistance = AVOIDANCE_LOW_THRESHOLD - avoidance;
      break;
    case 'anxious':
      anxietyDistance = anxiety - ANXIETY_HIGH_THRESHOLD;
      avoidanceDistance = AVOIDANCE_LOW_THRESHOLD - avoidance;
      break;
    case 'avoidant':
      anxietyDistance = ANXIETY_LOW_THRESHOLD - anxiety;
      avoidanceDistance = avoidance - AVOIDANCE_HIGH_THRESHOLD;
      break;
    case 'fearful_avoidant':
      anxietyDistance = anxiety - ANXIETY_HIGH_THRESHOLD;
      avoidanceDistance = avoidance - AVOIDANCE_HIGH_THRESHOLD;
      break;
  }

  // Base confidence
  let confidence = 60;

  // Add confidence based on distance from thresholds
  // Each point of distance adds ~5% confidence
  confidence += Math.max(0, anxietyDistance) * 5;
  confidence += Math.max(0, avoidanceDistance) * 3;

  // Penalize if in grey zone (negative distances)
  if (anxietyDistance < 0) confidence -= Math.abs(anxietyDistance) * 3;
  if (avoidanceDistance < 0) confidence -= Math.abs(avoidanceDistance) * 2;

  // Clamp to valid range
  return Math.min(95, Math.max(50, Math.round(confidence)));
}

// =====================================================
// MAIN EXPORT
// =====================================================

/**
 * Calculate attachment style from questionnaire answers
 *
 * @param answers - Object with Q1-Q7 attachment question scores (1-5 each)
 * @returns Complete attachment analysis with style, confidence, and recommendations
 *
 * @example
 * ```ts
 * const result = calculateAttachmentStyle({
 *   attachment_q1_abandonment: 4,
 *   attachment_q2_trust: 3,
 *   attachment_q3_intimacy: 2,
 *   attachment_q4_validation: 5,
 *   attachment_q5_withdraw: 2,
 *   attachment_q6_independence: 3,
 *   attachment_q7_closeness: 4,
 * });
 *
 * console.log(result.style); // 'anxious'
 * console.log(result.confidence); // 78
 * console.log(result.dimensions.anxiety); // 13
 * ```
 */
export function calculateAttachmentStyle(
  answers: AttachmentQuestionAnswers
): AttachmentResult {
  // Validate inputs
  const questionKeys = [
    'attachment_q1_abandonment',
    'attachment_q2_trust',
    'attachment_q3_intimacy',
    'attachment_q4_validation',
    'attachment_q5_withdraw',
    'attachment_q6_independence',
    'attachment_q7_closeness',
  ] as const;

  for (const key of questionKeys) {
    const value = answers[key];
    if (typeof value !== 'number' || value < 1 || value > 5) {
      console.warn(`Invalid attachment answer for ${key}: ${value}, using default 3`);
      (answers as any)[key] = 3;
    }
  }

  // Calculate dimensions
  const dimensions = calculateDimensions(answers);

  // Determine style
  const style = determineStyle(dimensions);

  // Calculate confidence
  const confidence = calculateConfidence(dimensions, style);

  // Get metadata
  const metadata = STYLE_METADATA[style];

  return {
    style,
    confidence,
    dimensions,
    styleName: metadata.name,
    description: metadata.description,
    recommendations: metadata.recommendations,
  };
}

/**
 * Get a simple style prediction (for legacy compatibility)
 */
export function getAttachmentStyleSimple(
  answers: Partial<AttachmentQuestionAnswers>
): { style: AttachmentStyle; confidence: number } {
  // Fill in defaults for missing answers
  const fullAnswers: AttachmentQuestionAnswers = {
    attachment_q1_abandonment: answers.attachment_q1_abandonment ?? 3,
    attachment_q2_trust: answers.attachment_q2_trust ?? 3,
    attachment_q3_intimacy: answers.attachment_q3_intimacy ?? 3,
    attachment_q4_validation: answers.attachment_q4_validation ?? 3,
    attachment_q5_withdraw: answers.attachment_q5_withdraw ?? 3,
    attachment_q6_independence: answers.attachment_q6_independence ?? 3,
    attachment_q7_closeness: answers.attachment_q7_closeness ?? 3,
  };

  const result = calculateAttachmentStyle(fullAnswers);
  return { style: result.style, confidence: result.confidence };
}
