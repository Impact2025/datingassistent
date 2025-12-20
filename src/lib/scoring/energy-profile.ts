/**
 * Energy Profile Calculator
 *
 * Calculates introvert/extrovert/ambivert profile based on social energy patterns.
 *
 * SCIENTIFIC FOUNDATION:
 * ----------------------
 * Based on Jung's (1921) personality types and modern research on introversion/extroversion
 * as a spectrum rather than binary categories.
 *
 * Key insight: Introversion/Extroversion is about where you get ENERGY, not social skills.
 * - Introverts: Recharge alone, social interaction drains energy
 * - Extroverts: Recharge through social interaction, solitude drains energy
 * - Ambiverts: Balance of both, context-dependent
 *
 * REFERENCES:
 * -----------
 * - Jung, C. G. (1921). Psychological Types
 * - Eysenck, H. J. (1967). The Biological Basis of Personality
 * - Grant, A. (2013). Rethinking the Extraverted Sales Ideal
 *
 * QUESTION MAPPING:
 * -----------------
 * Our questions measure different aspects of social energy:
 *
 * 1. energy_after_social (1-5): How you feel after social interaction
 *    - 1 = Compleet uitgeput → Strong introvert signal
 *    - 5 = Helemaal opgeladen → Strong extrovert signal
 *
 * 2. call_preparation (1-5): Preparation before phone calls
 *    - 1 = Never prepare → Extrovert signal
 *    - 5 = Always prepare → Introvert signal
 *
 * 3. post_date_need: What you need after a date
 *    - 'alone_time' → Introvert signal
 *    - 'more_contact' → Extrovert signal
 *    - 'depends' → Ambivert signal
 *
 * 4. social_battery_capacity (1-10): Self-reported battery size
 *    - 1-3 = Small battery → Introvert
 *    - 7-10 = Large battery → Extrovert
 *
 * 5. recharge_method: How you recharge
 *    - 'alone' → Strong introvert signal
 *    - 'activities' → Ambivert/extrovert
 *    - 'close_friends' → Ambivert
 *    - 'sleep' → Neutral
 *
 * SCORING:
 * --------
 * Final score: 0-100 (Introvert Score)
 * - 0-35: Extrovert
 * - 36-64: Ambivert
 * - 65-100: Introvert
 */

import type { EnergyProfile } from '@/types/dating-snapshot.types';

// =====================================================
// TYPES
// =====================================================

export interface EnergyQuestionAnswers {
  /** 1-5: How you feel after social interaction (1=exhausted, 5=energized) */
  energy_after_social: number;
  /** 1-5: Do you prepare before calls (1=never, 5=always) */
  call_preparation: number;
  /** What you need after a date */
  post_date_need: 'alone_time' | 'more_contact' | 'depends';
  /** 1-10: Self-reported social battery size */
  social_battery_capacity: number;
  /** How you recharge */
  recharge_method?: 'alone' | 'close_friends' | 'activities' | 'sleep';
  /** Conversation preference */
  conversation_preference?: 'deep_1on1' | 'light_groups' | 'mixed';
}

export interface EnergyProfileResult {
  /** Primary energy profile */
  profile: EnergyProfile;
  /** Introvert score 0-100 (higher = more introverted) */
  introvertScore: number;
  /** Human-readable profile name (Dutch) */
  profileName: string;
  /** Brief description */
  description: string;
  /** Dating recommendations based on profile */
  recommendations: string[];
  /** Whether to enable introvert mode features */
  enableIntrovertMode: boolean;
}

// =====================================================
// CONSTANTS
// =====================================================

/** Score threshold for extrovert (below this) */
const EXTROVERT_THRESHOLD = 35;

/** Score threshold for introvert (above this) */
const INTROVERT_THRESHOLD = 65;

/** Score threshold for enabling introvert mode features */
const INTROVERT_MODE_THRESHOLD = 60;

// =====================================================
// PROFILE METADATA
// =====================================================

const PROFILE_METADATA: Record<EnergyProfile, {
  name: string;
  description: string;
  recommendations: string[];
}> = {
  introvert: {
    name: 'Introvert',
    description: 'Je haalt energie uit alleen-tijd en diepgaande gesprekken. Sociale interactie kan je uitputten, maar dat maakt je niet minder sociaal vaardig.',
    recommendations: [
      'Plan dates niet te dicht op elkaar — geef jezelf hersteltijd',
      'Kies voor rustige date locaties waar je kunt praten',
      'Bereid gesprekstopics voor als dat je helpt ontspannen',
      'Communiceer je behoefte aan ruimte — de juiste match begrijpt dit',
      'Gebruik de Introvert Modus voor aangepaste pacing',
    ],
  },
  extrovert: {
    name: 'Extrovert',
    description: 'Je haalt energie uit sociale interactie en voelt je opgeladen na dates. Alleen-tijd kan je onrustig maken.',
    recommendations: [
      'Pas op dat je niet te veel dates plant en burned out raakt',
      'Geef matches die trager reageren de tijd',
      'Niet iedereen deelt je energie — stem af op je date',
      'Gebruik je sociale energie als kracht, niet als druk',
    ],
  },
  ambivert: {
    name: 'Ambivert',
    description: 'Je schakelt tussen sociale energie en alleen-tijd afhankelijk van de situatie. Dit geeft je flexibiliteit in dating.',
    recommendations: [
      'Luister naar je energie op een bepaalde dag',
      'Je kunt je aanpassen aan zowel rustige als energieke matches',
      'Gebruik je flexibiliteit als superkracht',
      'Plan dates wanneer je je sociaal voelt, niet uit verplichting',
    ],
  },
};

// =====================================================
// CALCULATION FUNCTIONS
// =====================================================

/**
 * Calculate introvert score from question answers
 *
 * Score components:
 * - energy_after_social: (6 - score) * 15 = max 75 points (inverted, lower = more introvert)
 * - call_preparation: score * 5 = max 25 points (higher = more introvert)
 * - post_date_need: 0-15 points based on choice
 * - social_battery: (11 - score) * 2 = max 20 points (inverted)
 * - recharge_method: 0-10 bonus points
 * - conversation_preference: 0-5 bonus points
 *
 * Total possible: ~130, normalized to 0-100
 */
function calculateIntrovertScore(answers: EnergyQuestionAnswers): number {
  let score = 0;
  let maxPossible = 0;

  // Energy after social (inverted): 1=exhausted→introvert, 5=energized→extrovert
  const energyScore = answers.energy_after_social ?? 3;
  score += (6 - energyScore) * 15; // Range: 15-75 (higher when exhausted)
  maxPossible += 75;

  // Call preparation: higher = more introvert
  const callPrepScore = answers.call_preparation ?? 3;
  score += callPrepScore * 5; // Range: 5-25
  maxPossible += 25;

  // Post date need
  switch (answers.post_date_need) {
    case 'alone_time':
      score += 15;
      break;
    case 'depends':
      score += 8;
      break;
    case 'more_contact':
      score += 0;
      break;
    default:
      score += 8; // Default to ambivert
  }
  maxPossible += 15;

  // Social battery (inverted): smaller battery = more introvert
  const batteryScore = answers.social_battery_capacity ?? 5;
  score += (11 - batteryScore) * 2; // Range: 2-20
  maxPossible += 20;

  // Recharge method bonus
  switch (answers.recharge_method) {
    case 'alone':
      score += 10;
      break;
    case 'sleep':
      score += 5;
      break;
    case 'close_friends':
      score += 3;
      break;
    case 'activities':
      score += 0;
      break;
  }
  maxPossible += 10;

  // Conversation preference bonus
  switch (answers.conversation_preference) {
    case 'deep_1on1':
      score += 5;
      break;
    case 'mixed':
      score += 2;
      break;
    case 'light_groups':
      score += 0;
      break;
  }
  maxPossible += 5;

  // Normalize to 0-100
  const normalizedScore = Math.round((score / maxPossible) * 100);

  // Clamp to valid range
  return Math.min(100, Math.max(0, normalizedScore));
}

/**
 * Determine energy profile from introvert score
 */
function determineProfile(introvertScore: number): EnergyProfile {
  if (introvertScore >= INTROVERT_THRESHOLD) {
    return 'introvert';
  }
  if (introvertScore <= EXTROVERT_THRESHOLD) {
    return 'extrovert';
  }
  return 'ambivert';
}

// =====================================================
// MAIN EXPORT
// =====================================================

/**
 * Calculate energy profile from questionnaire answers
 *
 * @param answers - Object with energy-related question answers
 * @returns Complete energy profile analysis with score and recommendations
 *
 * @example
 * ```ts
 * const result = calculateEnergyProfile({
 *   energy_after_social: 2,
 *   call_preparation: 4,
 *   post_date_need: 'alone_time',
 *   social_battery_capacity: 4,
 *   recharge_method: 'alone',
 *   conversation_preference: 'deep_1on1',
 * });
 *
 * console.log(result.profile); // 'introvert'
 * console.log(result.introvertScore); // 78
 * console.log(result.enableIntrovertMode); // true
 * ```
 */
export function calculateEnergyProfile(
  answers: Partial<EnergyQuestionAnswers>
): EnergyProfileResult {
  // Fill in defaults for missing answers
  const fullAnswers: EnergyQuestionAnswers = {
    energy_after_social: answers.energy_after_social ?? 3,
    call_preparation: answers.call_preparation ?? 3,
    post_date_need: answers.post_date_need ?? 'depends',
    social_battery_capacity: answers.social_battery_capacity ?? 5,
    recharge_method: answers.recharge_method,
    conversation_preference: answers.conversation_preference,
  };

  // Calculate score
  const introvertScore = calculateIntrovertScore(fullAnswers);

  // Determine profile
  const profile = determineProfile(introvertScore);

  // Get metadata
  const metadata = PROFILE_METADATA[profile];

  // Determine if introvert mode should be enabled
  const enableIntrovertMode = introvertScore >= INTROVERT_MODE_THRESHOLD;

  return {
    profile,
    introvertScore,
    profileName: metadata.name,
    description: metadata.description,
    recommendations: metadata.recommendations,
    enableIntrovertMode,
  };
}

/**
 * Get simple profile (for legacy compatibility)
 */
export function getEnergyProfileSimple(
  answers: Partial<EnergyQuestionAnswers>
): { profile: EnergyProfile; introvertScore: number } {
  const result = calculateEnergyProfile(answers);
  return { profile: result.profile, introvertScore: result.introvertScore };
}
