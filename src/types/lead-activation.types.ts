/**
 * Lead Activation Flow - TypeScript Types
 *
 * Types for the "Hooked Model" conversion funnel:
 * 1. Account creation (minimal)
 * 2. Mini-intake questions (segmentation)
 * 3. Photo upload + AI scan
 * 4. Score reveal + OTO
 */

// ============================================
// Step 1: Account Registration
// ============================================

export interface LeadAccountData {
  firstName: string;
  email: string;
  password: string;
}

// ============================================
// Step 2: Mini-Intake Questions
// ============================================

export type LookingFor = 'man' | 'vrouw' | 'anders';

export type DatingStatus =
  | 'net_begonnen'
  | 'tijdje_bezig_geen_succes'
  | 'gefrustreerd';

export type DatingObstacle =
  | 'profiel_trekt_niemand_aan'
  | 'gesprekken_vallen_stil'
  | 'krijg_geen_dates';

export interface LeadIntakeData {
  lookingFor: LookingFor;
  datingStatus: DatingStatus;
  mainObstacle: DatingObstacle;
  completedAt: string; // ISO timestamp
}

// Maps obstacles to recommended upsells
export const OBSTACLE_UPSELL_MAP: Record<DatingObstacle, string[]> = {
  'profiel_trekt_niemand_aan': ['kickstart', 'foto-coach'],
  'gesprekken_vallen_stil': ['chat-coach', 'transformatie'],
  'krijg_geen_dates': ['transformatie', 'vip'],
};

// ============================================
// Step 3: Photo Analysis
// ============================================

export interface PhotoAnalysisResult {
  overall_score: number;
  analysis: {
    lighting: CategoryScore;
    composition: CategoryScore;
    authenticity: CategoryScore;
    facial_expression: CategoryScore;
  };
  tips: string[];
  suggestions: {
    alternative_angles: string[];
    background: string[];
    overall: string;
  };
}

export interface CategoryScore {
  score: number;
  feedback: string;
}

// For the onboarding flow, we extract specific parts
export interface OnboardingPhotoResult {
  score: number;
  strongPoint: {
    category: string;
    feedback: string;
    scoreBoost: string; // e.g., "+10% score"
  };
  criticalPoint: {
    category: string;
    feedback: string;
  };
  lockedCategories: {
    category: string;
    score: number;
  }[];
}

// ============================================
// Step 4: OTO (One-Time-Offer)
// ============================================

export interface OTOConfig {
  headline: string;
  subheadline: string;
  originalPrice: number;
  discountedPrice: number;
  features: string[];
  ctaPrimary: string;
  ctaSecondary: string;
  redirectUrl: string;
}

export const KICKSTART_OTO: OTOConfig = {
  headline: 'Je laat {percentage}% van je matches liggen.',
  subheadline: 'Je start is goed, maar met kleine aanpassingen ga je naar een 8.5+. Wil je weten wat je precies moet veranderen?',
  originalPrice: 97,
  discountedPrice: 47,
  features: [
    'Ontgrendel je volledige foto-rapport',
    'Fix je bio in 21 dagen',
    'AI coaching op je eerste bericht',
  ],
  ctaPrimary: 'Ja, ontgrendel mijn rapport',
  ctaSecondary: 'Nee, naar dashboard',
  redirectUrl: '/checkout/kickstart-programma',
};

// Primary OTO - Transformatie (Hero Product)
export const TRANSFORMATIE_OTO: OTOConfig = {
  headline: 'Wil je in 90 dagen van {score} naar 8+?',
  subheadline: 'De complete opleiding tot succesvol daten. Van profiel tot date, alles in één programma.',
  originalPrice: 297,
  discountedPrice: 147,
  features: [
    '🎓 Complete Video Academy (6 Modules)',
    '🤖 Pro AI Suite (90 dagen onbeperkt)',
    '💬 24/7 Chat Coach & Match Analyse',
    '👥 3x Live Q&A Sessies',
    '📖 Alles uit Kickstart inbegrepen',
  ],
  ctaPrimary: 'Ja, start mijn transformatie!',
  ctaSecondary: 'Misschien later',
  redirectUrl: '/checkout/transformatie-programma',
};

// Downsell - Kickstart (after declining Transformatie)
export const KICKSTART_DOWNSELL: OTOConfig = {
  headline: 'Te snel? Start met 21 dagen.',
  subheadline: 'Begin met de Kickstart en upgrade later wanneer je klaar bent voor de volgende stap.',
  originalPrice: 97,
  discountedPrice: 47,
  features: [
    '21-Dagen Video Challenge',
    'AI Foto Check (Onbeperkt)',
    'Bio Builder (AI schrijft je tekst)',
    'Kickstart Werkboek & Templates',
  ],
  ctaPrimary: 'Start met Kickstart €47',
  ctaSecondary: 'Nee bedankt, naar dashboard',
  redirectUrl: '/checkout/kickstart-programma',
};

// ============================================
// Wizard State Management
// ============================================

export type LeadWizardStep =
  | 'account'
  | 'intake'
  | 'photo-upload'
  | 'scanning'
  | 'score-reveal'
  | 'oto'           // Transformatie OTO (primary)
  | 'downsell'      // Kickstart downsell (after declining Transformatie)
  | 'complete';

export interface LeadWizardState {
  currentStep: LeadWizardStep;
  accountData: LeadAccountData | null;
  intakeData: LeadIntakeData | null;
  photoResult: PhotoAnalysisResult | null;
  userId: number | null;
  otoAccepted: boolean | null;
}

// Initial state
export const INITIAL_WIZARD_STATE: LeadWizardState = {
  currentStep: 'account',
  accountData: null,
  intakeData: null,
  photoResult: null,
  userId: null,
  otoAccepted: null,
};

// ============================================
// Freemium System
// ============================================

export interface FreemiumStatus {
  credits: number;
  initialPhotoScore: number | null;
  onboardingCompleted: boolean;
  otoShown: boolean;
}

export type CreditType = 'chat' | 'photo_analysis';

// ============================================
// Scanning Animation
// ============================================

export const SCANNING_TEXTS = [
  'Analyseren oogcontact...',
  'Belichting checken...',
  'Betrouwbaarheid meten...',
  'Compositie evalueren...',
  'Score berekenen...',
] as const;

// ============================================
// Helper Functions
// ============================================

/**
 * Calculate missed matches percentage based on photo score
 */
export function calculateMissedMatches(score: number): number {
  const potentialImprovement = 10 - score;
  return Math.round(potentialImprovement * 10);
}

/**
 * Extract strong and critical points from analysis
 */
export function extractOnboardingResult(result: PhotoAnalysisResult): OnboardingPhotoResult {
  const categories = Object.entries(result.analysis);

  // Find highest scoring category (strong point)
  const sorted = [...categories].sort((a, b) => b[1].score - a[1].score);
  const strongest = sorted[0];
  const weakest = sorted[sorted.length - 1];

  // Locked categories are the middle ones
  const locked = sorted.slice(1, -1);

  return {
    score: result.overall_score,
    strongPoint: {
      category: formatCategoryName(strongest[0]),
      feedback: strongest[1].feedback,
      scoreBoost: `+${Math.round((strongest[1].score / 10) * 100 - 50)}% score`,
    },
    criticalPoint: {
      category: formatCategoryName(weakest[0]),
      feedback: weakest[1].feedback,
    },
    lockedCategories: locked.map(([cat, data]) => ({
      category: formatCategoryName(cat),
      score: data.score,
    })),
  };
}

function formatCategoryName(key: string): string {
  const names: Record<string, string> = {
    lighting: 'Belichting',
    composition: 'Compositie',
    authenticity: 'Authenticiteit',
    facial_expression: 'Gezichtsuitdrukking',
  };
  return names[key] || key;
}
