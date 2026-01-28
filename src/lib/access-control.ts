/**
 * Access Control Library
 * Manages tier-based access for DatingAssistent programs
 *
 * Tiers:
 * - kickstart: €97 (beta €47) - Basic 21-day program
 * - transformatie: €297 (beta €147) - Extended program with more features
 * - vip: €997 (beta €497) - Full access + personal coaching
 */

import { sql } from '@vercel/postgres';

export type ProgramTier = 'free' | 'kickstart' | 'transformatie' | 'vip';

export interface TierConfig {
  name: string;
  displayName: string;
  price: number;
  betaPrice: number;
  features: string[];
  color: string;
  icon: string;
}

/**
 * Tier configuration with features and pricing
 */
export const TIER_CONFIG: Record<ProgramTier, TierConfig> = {
  free: {
    name: 'free',
    displayName: 'Gratis',
    price: 0,
    betaPrice: 0,
    features: [
      'Basis dashboard toegang',
      'Iris chat (beperkt)',
      'Profiel maken',
    ],
    color: 'gray',
    icon: '👤',
  },
  kickstart: {
    name: 'kickstart',
    displayName: 'Kickstart',
    price: 97,
    betaPrice: 47,
    features: [
      '21-dagen programma',
      'Dagelijkse video\'s en opdrachten',
      'Iris AI coaching (onbeperkt)',
      'Profiel review tools',
      'Conversation starters',
      'Dating app tips',
    ],
    color: 'pink',
    icon: '🚀',
  },
  transformatie: {
    name: 'transformatie',
    displayName: 'Transformatie',
    price: 297,
    betaPrice: 147,
    features: [
      'Alles van Kickstart +',
      '90-dagen uitgebreid programma',
      'Weekelijkse groepscalls',
      'Foto review service',
      'Bio optimalisatie',
      'Geavanceerde gespreksstrategieën',
      'Dating plan op maat',
      'Community toegang',
    ],
    color: 'purple',
    icon: '✨',
  },
  vip: {
    name: 'vip',
    displayName: 'VIP',
    price: 997,
    betaPrice: 497,
    features: [
      'Alles van Transformatie +',
      '6 maanden begeleiding',
      '1-op-1 coaching calls',
      'Persoonlijke Iris training',
      'Priority support',
      'Professionele fotoshoot planning',
      'Date outfit advies',
      'Lifetime community access',
    ],
    color: 'gold',
    icon: '👑',
  },
};

/**
 * Feature access control - which features are available at which tier
 */
export interface FeatureAccess {
  feature: string;
  minTier: ProgramTier;
  description: string;
  lockedMessage?: string;
}

export const FEATURE_ACCESS: FeatureAccess[] = [
  // Basic features (kickstart)
  {
    feature: 'kickstart-program',
    minTier: 'kickstart',
    description: '21-dagen Kickstart programma',
    lockedMessage: 'Upgrade naar Kickstart om het 21-dagen programma te starten',
  },
  {
    feature: 'iris-unlimited',
    minTier: 'kickstart',
    description: 'Onbeperkte Iris coaching',
    lockedMessage: 'Upgrade naar Kickstart voor onbeperkte Iris gesprekken',
  },
  {
    feature: 'profile-review',
    minTier: 'kickstart',
    description: 'Profiel review tools',
    lockedMessage: 'Upgrade naar Kickstart voor profiel reviews',
  },
  {
    feature: 'conversation-starters',
    minTier: 'kickstart',
    description: 'Conversation starters',
    lockedMessage: 'Upgrade naar Kickstart voor conversation starters',
  },

  // Transformatie features
  {
    feature: 'extended-program',
    minTier: 'transformatie',
    description: '90-dagen uitgebreid programma',
    lockedMessage: 'Upgrade naar Transformatie voor het uitgebreide programma',
  },
  {
    feature: 'group-calls',
    minTier: 'transformatie',
    description: 'Weekelijkse groepscalls',
    lockedMessage: 'Upgrade naar Transformatie voor groepscalls',
  },
  {
    feature: 'photo-review',
    minTier: 'transformatie',
    description: 'Professionele foto review',
    lockedMessage: 'Upgrade naar Transformatie voor foto reviews',
  },
  {
    feature: 'bio-optimization',
    minTier: 'transformatie',
    description: 'Bio optimalisatie service',
    lockedMessage: 'Upgrade naar Transformatie voor bio optimalisatie',
  },
  {
    feature: 'community',
    minTier: 'transformatie',
    description: 'Community toegang',
    lockedMessage: 'Upgrade naar Transformatie voor community toegang',
  },

  // VIP features
  {
    feature: 'one-on-one',
    minTier: 'vip',
    description: '1-op-1 coaching calls',
    lockedMessage: 'Upgrade naar VIP voor persoonlijke coaching calls',
  },
  {
    feature: 'custom-iris',
    minTier: 'vip',
    description: 'Persoonlijke Iris training',
    lockedMessage: 'Upgrade naar VIP voor een gepersonaliseerde Iris',
  },
  {
    feature: 'priority-support',
    minTier: 'vip',
    description: 'Priority support',
    lockedMessage: 'Upgrade naar VIP voor priority support',
  },
  {
    feature: 'photoshoot-planning',
    minTier: 'vip',
    description: 'Professionele fotoshoot planning',
    lockedMessage: 'Upgrade naar VIP voor fotoshoot begeleiding',
  },
];

/**
 * Tier hierarchy for comparison
 */
const TIER_HIERARCHY: Record<ProgramTier, number> = {
  free: 0,
  kickstart: 1,
  transformatie: 2,
  vip: 3,
};

/**
 * Check if a user tier has access to a required tier level
 */
export function hasAccess(userTier: ProgramTier, requiredTier: ProgramTier): boolean {
  return TIER_HIERARCHY[userTier] >= TIER_HIERARCHY[requiredTier];
}

/**
 * Check if user has access to a specific feature
 */
export function hasFeatureAccess(userTier: ProgramTier, feature: string): boolean {
  const featureConfig = FEATURE_ACCESS.find(f => f.feature === feature);
  if (!featureConfig) {
    console.warn(`Unknown feature: ${feature}`);
    return false;
  }
  return hasAccess(userTier, featureConfig.minTier);
}

/**
 * Get locked message for a feature
 */
export function getLockedMessage(feature: string): string {
  const featureConfig = FEATURE_ACCESS.find(f => f.feature === feature);
  return featureConfig?.lockedMessage || 'Upgrade je abonnement voor deze feature';
}

/**
 * Get the upgrade path from current tier
 */
export function getUpgradePath(currentTier: ProgramTier): ProgramTier | null {
  switch (currentTier) {
    case 'free':
      return 'kickstart';
    case 'kickstart':
      return 'transformatie';
    case 'transformatie':
      return 'vip';
    case 'vip':
      return null; // Already at top tier
    default:
      return 'kickstart';
  }
}

/**
 * Get upgrade CTA based on current tier and desired feature
 */
export function getUpgradeCTA(currentTier: ProgramTier, feature?: string): {
  targetTier: ProgramTier | null;
  buttonText: string;
  price: number;
  betaPrice: number;
} {
  let targetTier: ProgramTier | null = null;

  if (feature) {
    const featureConfig = FEATURE_ACCESS.find(f => f.feature === feature);
    if (featureConfig && !hasAccess(currentTier, featureConfig.minTier)) {
      targetTier = featureConfig.minTier;
    }
  } else {
    targetTier = getUpgradePath(currentTier);
  }

  if (!targetTier) {
    return {
      targetTier: null,
      buttonText: 'Je hebt volledige toegang',
      price: 0,
      betaPrice: 0,
    };
  }

  const tierConfig = TIER_CONFIG[targetTier];
  return {
    targetTier,
    buttonText: `Upgrade naar ${tierConfig.displayName}`,
    price: tierConfig.price,
    betaPrice: tierConfig.betaPrice,
  };
}

/**
 * Determine user's tier based on their enrollments
 * Returns the highest tier they have access to
 */
export function determineTierFromEnrollments(enrollments: { program_slug: string; status: string }[]): ProgramTier {
  // Check for active enrollments in order of tier hierarchy (highest first)
  const activeEnrollments = enrollments.filter(e => e.status === 'active');

  if (activeEnrollments.some(e => e.program_slug === 'vip' || e.program_slug === 'vip-coaching')) {
    return 'vip';
  }

  if (activeEnrollments.some(e => e.program_slug === 'transformatie' || e.program_slug === 'transformatie-programma')) {
    return 'transformatie';
  }

  if (activeEnrollments.some(e => e.program_slug === 'kickstart' || e.program_slug === 'kickstart-21')) {
    return 'kickstart';
  }

  return 'free';
}

/**
 * Get all features available at a tier (including lower tiers)
 */
export function getAvailableFeatures(tier: ProgramTier): FeatureAccess[] {
  return FEATURE_ACCESS.filter(f => hasAccess(tier, f.minTier));
}

/**
 * Get locked features for a tier
 */
export function getLockedFeatures(tier: ProgramTier): FeatureAccess[] {
  return FEATURE_ACCESS.filter(f => !hasAccess(tier, f.minTier));
}

/**
 * Format price for display
 */
export function formatPrice(price: number): string {
  return `€${price}`;
}

/**
 * Get tier badge color class
 */
export function getTierBadgeClass(tier: ProgramTier): string {
  switch (tier) {
    case 'vip':
      return 'bg-gradient-to-r from-yellow-500 to-amber-500 text-white';
    case 'transformatie':
      return 'bg-gradient-to-r from-purple-500 to-coral-500 text-white';
    case 'kickstart':
      return 'bg-gradient-to-r from-coral-500 to-rose-500 text-white';
    default:
      return 'bg-gray-200 text-gray-700';
  }
}

// ============================================
// TOOL LIMITS PER TIER
// ============================================

export interface TierToolLimits {
  irisDaily: number;           // Messages per day
  fotoAnalyse: number;         // Total uses
  profielCheck: number;        // Total uses
  gespreksstarter: number;     // Total uses
  hechtingsstijl: number;      // Total uses (unlimited = -1)
  datingstijl: number;         // Total uses
  waardenKompas: number;       // Total uses
  cursussen: 'preview' | 'full'; // Preview = module 1 only
  datePlanner: boolean;
  personalCoaching: boolean;
}

/**
 * Tool limits per tier - Pro approach to access control
 */
export const TIER_TOOL_LIMITS: Record<ProgramTier, TierToolLimits> = {
  free: {
    irisDaily: 2,
    fotoAnalyse: 0,
    profielCheck: 0,
    gespreksstarter: 0,
    hechtingsstijl: 0,
    datingstijl: 0,
    waardenKompas: 0,
    cursussen: 'preview',
    datePlanner: false,
    personalCoaching: false,
  },
  kickstart: {
    irisDaily: 10, // 10 messages per day for Kickstart
    fotoAnalyse: 2,
    profielCheck: 1,
    gespreksstarter: 3,
    hechtingsstijl: -1, // Unlimited - makes Iris better
    datingstijl: 1, // Sample mode
    waardenKompas: 1, // Sample mode
    cursussen: 'preview',
    datePlanner: false,
    personalCoaching: false,
  },
  transformatie: {
    irisDaily: -1, // Unlimited
    fotoAnalyse: 10,
    profielCheck: 5,
    gespreksstarter: 20,
    hechtingsstijl: -1,
    datingstijl: -1,
    waardenKompas: -1,
    cursussen: 'full',
    datePlanner: true,
    personalCoaching: false,
  },
  vip: {
    irisDaily: -1,
    fotoAnalyse: -1,
    profielCheck: -1,
    gespreksstarter: -1,
    hechtingsstijl: -1,
    datingstijl: -1,
    waardenKompas: -1,
    cursussen: 'full',
    datePlanner: true,
    personalCoaching: true,
  },
};

/**
 * Get tool limit for a tier
 */
export function getToolLimit(tier: ProgramTier, tool: keyof TierToolLimits): number | boolean | string {
  return TIER_TOOL_LIMITS[tier][tool];
}

/**
 * Check if user has remaining uses for a tool
 * Returns: true if unlimited, false if no access, or remaining count
 */
export function checkToolAccess(
  tier: ProgramTier,
  tool: keyof TierToolLimits,
  usedCount: number = 0
): { hasAccess: boolean; remaining: number | 'unlimited'; isLimited: boolean } {
  const limit = TIER_TOOL_LIMITS[tier][tool];

  // Boolean tools (datePlanner, personalCoaching)
  if (typeof limit === 'boolean') {
    return {
      hasAccess: limit,
      remaining: limit ? 'unlimited' : 0,
      isLimited: !limit,
    };
  }

  // String tools (cursussen)
  if (typeof limit === 'string') {
    return {
      hasAccess: true,
      remaining: limit === 'full' ? 'unlimited' : 1,
      isLimited: limit === 'preview',
    };
  }

  // Number limits (-1 = unlimited)
  if (limit === -1) {
    return {
      hasAccess: true,
      remaining: 'unlimited',
      isLimited: false,
    };
  }

  if (limit === 0) {
    return {
      hasAccess: false,
      remaining: 0,
      isLimited: true,
    };
  }

  const remaining = Math.max(0, limit - usedCount);
  return {
    hasAccess: remaining > 0,
    remaining,
    isLimited: true,
  };
}

// ============================================
// TOOL TRIGGERS PER DAY (LAAG 2)
// ============================================

export interface ToolTrigger {
  dayNumber: number;
  tool: string;
  toolIcon: string;
  toolName: string;
  triggerReason: string;
  irisPrompt: string; // What Iris says to introduce the tool
}

/**
 * Strategic tool triggers per Kickstart day
 * These tools are triggered after watching the video for that day
 */
export const DAY_TOOL_TRIGGERS: ToolTrigger[] = [
  {
    dayNumber: 3,
    tool: 'foto-analyse',
    toolIcon: '📸',
    toolName: 'Foto-analyse',
    triggerReason: 'Na video over profielfoto\'s',
    irisPrompt: 'Je hebt net geleerd hoe belangrijk je foto\'s zijn. Wil je dat ik je huidige foto\'s analyseer en concrete verbeterpunten geef?',
  },
  {
    dayNumber: 5,
    tool: 'hechtingsstijl',
    toolIcon: '🧠',
    toolName: 'Hechtingsstijl QuickScan',
    triggerReason: 'Week 1 = identiteit, perfect moment voor zelfinzicht',
    irisPrompt: 'Deze week draait om wie jij bent. Ken je je hechtingsstijl? Dit beïnvloedt hoe je date en relaties aangaat. Zal ik een snelle scan doen?',
  },
  {
    dayNumber: 10,
    tool: 'datingstijl',
    toolIcon: '💬',
    toolName: 'Datingstijl Test',
    triggerReason: 'Gesprekstechnieken content - ze gaan berichten sturen',
    irisPrompt: 'Je gaat nu berichten sturen. Wil je eerst weten wat jouw unieke dating stijl is? Dan kan ik mijn tips nog beter op jou afstemmen.',
  },
  {
    dayNumber: 15,
    tool: 'waarden-kompas',
    toolIcon: '🧭',
    toolName: 'Waarden Kompas Mini',
    triggerReason: '"Wat zoek je écht" reflectie dag',
    irisPrompt: 'Je denkt na over wat je écht zoekt in een partner. Wil je je kernwaarden verkennen? Dit helpt je om betere matches te kiezen.',
  },
];

/**
 * Get tool trigger for a specific day (if any)
 */
export function getToolTriggerForDay(dayNumber: number): ToolTrigger | null {
  return DAY_TOOL_TRIGGERS.find(t => t.dayNumber === dayNumber) || null;
}

// ============================================
// MICRO QUESTIONS FOR PROGRESSIVE PROFILING (LAAG 4)
// ============================================

export interface MicroQuestion {
  trigger: string;
  question: string;
  field: string;
  category: string;
}

/**
 * Micro questions Iris can ask during chat to learn more about the user
 * Each trigger determines when the question is asked
 */
export const MICRO_QUESTIONS: MicroQuestion[] = [
  // Day-based triggers
  {
    trigger: 'day_1_complete',
    question: 'Trouwens, wat voor werk doe je? (helpt me je tijdsindeling begrijpen)',
    field: 'occupation',
    category: 'lifestyle',
  },
  {
    trigger: 'day_3_complete',
    question: 'Heb je in het verleden langere relaties gehad?',
    field: 'past_relationships',
    category: 'history',
  },
  {
    trigger: 'day_7_complete',
    question: 'Hoe zou je jezelf omschrijven - meer introvert of extravert?',
    field: 'personality_type',
    category: 'personality',
  },
  {
    trigger: 'day_14_complete',
    question: 'Heb je al dates gehad sinds je met Kickstart begon?',
    field: 'kickstart_dates',
    category: 'progress',
  },
  {
    trigger: 'day_21_complete',
    question: 'Hoe voel je je nu vergeleken met dag 1? Schaal van 1-10?',
    field: 'final_confidence',
    category: 'progress',
  },

  // Context-based triggers
  {
    trigger: 'mentions_ex',
    question: 'Mag ik vragen hoe lang je langste relatie duurde?',
    field: 'longest_relationship',
    category: 'history',
  },
  {
    trigger: 'mentions_fear',
    question: 'Die angst die je noemt - komt die voort uit eerdere ervaringen?',
    field: 'fear_origin',
    category: 'psychology',
  },
  {
    trigger: 'mentions_match',
    question: 'Klinkt als een goede match! Wat trok je het meest aan?',
    field: 'attraction_factors',
    category: 'preferences',
  },
  {
    trigger: 'mentions_rejection',
    question: 'Hoe voel je je na zo\'n afwijzing? Wat doe je dan meestal?',
    field: 'rejection_response',
    category: 'psychology',
  },
  {
    trigger: 'mentions_date',
    question: 'Hoe ging de date? Wat vond je goed gaan en wat kon beter?',
    field: 'date_reflection',
    category: 'progress',
  },
];

/**
 * Get micro question for a trigger (if any)
 */
export function getMicroQuestion(trigger: string): MicroQuestion | null {
  return MICRO_QUESTIONS.find(q => q.trigger === trigger) || null;
}

/**
 * Detect trigger from message content
 */
export function detectTriggerFromMessage(message: string): string | null {
  const lowerMessage = message.toLowerCase();

  if (lowerMessage.includes('ex') || lowerMessage.includes('vorige relatie')) {
    return 'mentions_ex';
  }
  if (lowerMessage.includes('bang') || lowerMessage.includes('angst') || lowerMessage.includes('angstig')) {
    return 'mentions_fear';
  }
  if (lowerMessage.includes('match') && (lowerMessage.includes('leuk') || lowerMessage.includes('goed'))) {
    return 'mentions_match';
  }
  if (lowerMessage.includes('afgewezen') || lowerMessage.includes('ghosted') || lowerMessage.includes('geen reactie')) {
    return 'mentions_rejection';
  }
  if (lowerMessage.includes('date gehad') || lowerMessage.includes('date geweest') || lowerMessage.includes('date was')) {
    return 'mentions_date';
  }

  return null;
}

// ============================================
// PROFILE SUITE TOOLS ACCESS CONTROL
// ============================================

export type ToolAccessLevel = 'full' | 'limited' | 'locked';

export interface ProfileSuiteToolAccess {
  toolId: string;
  minTier: ProgramTier;
  // -1 = unlimited, 0 = locked, number = limit
  kickstartLimit: number;
  transformatieLimit: number;
  vipLimit: number;
  lockedMessage: string;
  upgradeMessage: string;
  // For guided tour ordering
  tourPriority: number;
  tourDescription: string;
}

/**
 * Complete tool access mapping for ProfileSuite
 * Maps each tool ID to its tier requirements and limits
 */
export const PROFILE_SUITE_TOOLS: ProfileSuiteToolAccess[] = [
  // ============================================
  // PROFIEL & PERSOONLIJKHEID
  // ============================================
  {
    toolId: 'hechtingsstijl',
    minTier: 'kickstart',
    kickstartLimit: -1,  // Unlimited - improves Iris
    transformatieLimit: -1,
    vipLimit: -1,
    lockedMessage: 'Start met Kickstart om je hechtingsstijl te ontdekken',
    upgradeMessage: 'Dit verbetert je Iris coaching aanzienlijk',
    tourPriority: 1,
    tourDescription: 'Ontdek je hechtingsstijl - de basis van hoe je liefhebt'
  },
  {
    toolId: 'emotionele-ready',
    minTier: 'kickstart',
    kickstartLimit: 1,   // 1x sample
    transformatieLimit: -1,
    vipLimit: -1,
    lockedMessage: 'Upgrade voor de Emotionele Ready Scan',
    upgradeMessage: 'Onbeperkt toegang met Transformatie',
    tourPriority: 5,
    tourDescription: 'Check of je emotioneel klaar bent voor dating'
  },
  {
    toolId: 'zelfbeeld',
    minTier: 'transformatie',
    kickstartLimit: 0,   // Locked
    transformatieLimit: -1,
    vipLimit: -1,
    lockedMessage: 'Zelfbeeld & Eerste Indruk is een Transformatie feature',
    upgradeMessage: 'Diepe zelfinzichten voor betere dates',
    tourPriority: 0,
    tourDescription: ''
  },
  {
    toolId: 'dating-stijl',
    minTier: 'kickstart',
    kickstartLimit: 1,   // 1x sample
    transformatieLimit: -1,
    vipLimit: -1,
    lockedMessage: 'Upgrade voor onbeperkte Dating Stijl scans',
    upgradeMessage: 'Ken je dating stijl voor betere matches',
    tourPriority: 4,
    tourDescription: 'Ontdek je unieke dating stijl en blinde vlekken'
  },
  {
    toolId: 'profile-builder',
    minTier: 'kickstart',
    kickstartLimit: 1,   // 1x
    transformatieLimit: 5,
    vipLimit: -1,
    lockedMessage: 'Upgrade naar Kickstart voor de Profiel Bouwer',
    upgradeMessage: 'Bouw het perfecte dating profiel',
    tourPriority: 2,
    tourDescription: 'Maak je ideale profieltekst met AI hulp'
  },
  {
    toolId: 'photo-analysis',
    minTier: 'kickstart',
    kickstartLimit: 2,   // 2x
    transformatieLimit: 10,
    vipLimit: -1,
    lockedMessage: 'Upgrade naar Kickstart voor Foto Analyse',
    upgradeMessage: 'AI feedback op je profielfoto\'s',
    tourPriority: 3,
    tourDescription: 'Krijg AI feedback op je profielfoto\'s'
  },
  {
    toolId: 'platform-match',
    minTier: 'transformatie',
    kickstartLimit: 0,   // Locked
    transformatieLimit: -1,
    vipLimit: -1,
    lockedMessage: 'Platform Match is een Transformatie feature',
    upgradeMessage: 'Ontdek welke dating app perfect bij jou past',
    tourPriority: 0,
    tourDescription: ''
  },
  {
    toolId: 'skills-scan',
    minTier: 'transformatie',
    kickstartLimit: 0,   // Locked
    transformatieLimit: -1,
    vipLimit: -1,
    lockedMessage: 'Vaardigheden Scan is een Transformatie feature',
    upgradeMessage: 'Ontdek je sterke dating punten',
    tourPriority: 0,
    tourDescription: ''
  },
  {
    toolId: 'stats',
    minTier: 'kickstart',
    kickstartLimit: -1,  // Always available
    transformatieLimit: -1,
    vipLimit: -1,
    lockedMessage: 'Upgrade naar Kickstart voor je Stats',
    upgradeMessage: 'Zie je volledige voortgang',
    tourPriority: 6,
    tourDescription: 'Bekijk je voortgang en statistieken'
  },

  // ============================================
  // COMMUNICATIE
  // ============================================
  {
    toolId: 'chat-coach',
    minTier: 'kickstart',
    kickstartLimit: 10,  // 10 per day
    transformatieLimit: -1,
    vipLimit: -1,
    lockedMessage: 'Upgrade naar Kickstart voor Chat Coach',
    upgradeMessage: 'Je 24/7 AI dating coach',
    tourPriority: 1,
    tourDescription: 'Stel al je dating vragen aan je AI coach'
  },
  {
    toolId: 'gespreks-assistent',
    minTier: 'kickstart',
    kickstartLimit: 1,   // 1x sample
    transformatieLimit: -1,
    vipLimit: -1,
    lockedMessage: 'Upgrade voor onbeperkte Gespreks Analyse',
    upgradeMessage: 'AI analyse van je dating gesprekken',
    tourPriority: 5,
    tourDescription: 'Laat AI je gesprekken analyseren'
  },
  {
    toolId: 'openers',
    minTier: 'kickstart',
    kickstartLimit: 3,   // 3x
    transformatieLimit: 20,
    vipLimit: -1,
    lockedMessage: 'Upgrade naar Kickstart voor Openingszinnen',
    upgradeMessage: 'Genereer perfecte openingsberichten',
    tourPriority: 3,
    tourDescription: 'Genereer effectieve openingsberichten'
  },
  {
    toolId: 'icebreakers',
    minTier: 'kickstart',
    kickstartLimit: 2,   // 2x
    transformatieLimit: 15,
    vipLimit: -1,
    lockedMessage: 'Upgrade naar Kickstart voor IJsbrekers',
    upgradeMessage: 'Perfecte gesprekstarters voor elke situatie',
    tourPriority: 4,
    tourDescription: 'Krijg perfecte gesprekstarters'
  },
  {
    toolId: 'safety',
    minTier: 'transformatie',
    kickstartLimit: 0,   // Locked
    transformatieLimit: -1,
    vipLimit: -1,
    lockedMessage: 'Veiligheidscheck is een Transformatie feature',
    upgradeMessage: 'Analyseer gesprekken op rode vlaggen',
    tourPriority: 0,
    tourDescription: ''
  },

  // ============================================
  // DATING & RELATIES
  // ============================================
  {
    toolId: 'date-planner',
    minTier: 'transformatie',
    kickstartLimit: 0,   // Locked
    transformatieLimit: -1,
    vipLimit: -1,
    lockedMessage: 'Date Planner is een Transformatie feature',
    upgradeMessage: 'Plan geslaagde dates met checklists',
    tourPriority: 0,
    tourDescription: ''
  },
  {
    toolId: 'date-ideeen',
    minTier: 'transformatie',
    kickstartLimit: 0,   // Locked
    transformatieLimit: -1,
    vipLimit: -1,
    lockedMessage: 'Date Ideeën is een Transformatie feature',
    upgradeMessage: 'Krijg inspiratie voor unieke dates',
    tourPriority: 0,
    tourDescription: ''
  },

  // ============================================
  // TRANSFORMATIE 3.0 EXCLUSIVE TOOLS
  // ============================================
  {
    toolId: 'vibe-check-simulator',
    minTier: 'transformatie',
    kickstartLimit: 0,   // Locked
    transformatieLimit: -1,
    vipLimit: -1,
    lockedMessage: 'Vibe Check Simulator is exclusief voor Transformatie',
    upgradeMessage: 'Ontdek hoe je foto\'s emotioneel overkomen op matches',
    tourPriority: 1,
    tourDescription: 'Krijg emotionele feedback op je profielfoto\'s'
  },
  {
    toolId: 'energie-batterij',
    minTier: 'transformatie',
    kickstartLimit: 0,   // Locked
    transformatieLimit: -1,
    vipLimit: -1,
    lockedMessage: 'Energie Batterij is exclusief voor Transformatie',
    upgradeMessage: 'Voorkom dating burnout met slimme energie tracking',
    tourPriority: 2,
    tourDescription: 'Meet je sociale energie en voorkom burnout'
  },
  {
    toolId: '36-vragen-oefen-bot',
    minTier: 'transformatie',
    kickstartLimit: 0,   // Locked
    transformatieLimit: -1,
    vipLimit: -1,
    lockedMessage: '36 Vragen Bot is exclusief voor Transformatie',
    upgradeMessage: 'Oefen diepgaande gesprekken voor echte connectie',
    tourPriority: 3,
    tourDescription: 'Oefen intimiteit-opbouwende vragen'
  },
  {
    toolId: 'ghosting-reframer',
    minTier: 'transformatie',
    kickstartLimit: 0,   // Locked
    transformatieLimit: -1,
    vipLimit: -1,
    lockedMessage: 'Ghosting Reframer is exclusief voor Transformatie',
    upgradeMessage: 'Verwerk afwijzing op een gezonde manier',
    tourPriority: 4,
    tourDescription: 'Therapeutische hulp bij ghosting-ervaringen'
  }
];

/**
 * Get tool access info by tool ID
 */
export function getToolAccessInfo(toolId: string): ProfileSuiteToolAccess | null {
  return PROFILE_SUITE_TOOLS.find(t => t.toolId === toolId) || null;
}

/**
 * Check if user has access to a specific ProfileSuite tool
 */
export function checkProfileSuiteToolAccess(
  toolId: string,
  userTier: ProgramTier,
  usedCount: number = 0
): {
  accessLevel: ToolAccessLevel;
  hasAccess: boolean;
  remaining: number | 'unlimited';
  limit: number;
  lockedMessage: string;
  upgradeMessage: string;
  upgradeTier: ProgramTier | null;
} {
  const toolInfo = getToolAccessInfo(toolId);

  if (!toolInfo) {
    return {
      accessLevel: 'locked',
      hasAccess: false,
      remaining: 0,
      limit: 0,
      lockedMessage: 'Tool niet gevonden',
      upgradeMessage: '',
      upgradeTier: null
    };
  }

  // Check if user tier meets minimum requirement
  if (!hasAccess(userTier, toolInfo.minTier)) {
    return {
      accessLevel: 'locked',
      hasAccess: false,
      remaining: 0,
      limit: 0,
      lockedMessage: toolInfo.lockedMessage,
      upgradeMessage: toolInfo.upgradeMessage,
      upgradeTier: toolInfo.minTier
    };
  }

  // Get limit based on user tier
  let limit: number;
  switch (userTier) {
    case 'vip':
      limit = toolInfo.vipLimit;
      break;
    case 'transformatie':
      limit = toolInfo.transformatieLimit;
      break;
    case 'kickstart':
      limit = toolInfo.kickstartLimit;
      break;
    default:
      limit = 0;
  }

  // Unlimited access
  if (limit === -1) {
    return {
      accessLevel: 'full',
      hasAccess: true,
      remaining: 'unlimited',
      limit: -1,
      lockedMessage: '',
      upgradeMessage: '',
      upgradeTier: null
    };
  }

  // Limited access
  const remaining = Math.max(0, limit - usedCount);
  const nextTier = getUpgradePath(userTier);

  return {
    accessLevel: remaining > 0 ? 'limited' : 'locked',
    hasAccess: remaining > 0,
    remaining,
    limit,
    lockedMessage: remaining === 0
      ? `Je hebt je ${limit}x limiet bereikt`
      : toolInfo.lockedMessage,
    upgradeMessage: remaining === 0
      ? `Upgrade naar ${nextTier ? TIER_CONFIG[nextTier].displayName : 'hoger'} voor meer`
      : toolInfo.upgradeMessage,
    upgradeTier: nextTier
  };
}

/**
 * Get tools available for guided tour (Kickstart)
 * Returns tools sorted by tour priority
 */
export function getKickstartTourTools(): ProfileSuiteToolAccess[] {
  return PROFILE_SUITE_TOOLS
    .filter(t => t.minTier === 'kickstart' && t.tourPriority > 0)
    .sort((a, b) => a.tourPriority - b.tourPriority);
}

/**
 * Get locked tools for a tier (for showing upgrade prompts)
 */
export function getLockedToolsForTier(userTier: ProgramTier): ProfileSuiteToolAccess[] {
  return PROFILE_SUITE_TOOLS.filter(t => !hasAccess(userTier, t.minTier));
}

// ============================================
// DATABASE-BASED ACCESS CHECK
// ============================================

/**
 * Check if a user has access to a specific tool
 * This is the main function to use from API routes
 * It fetches the user's tier from the database and checks tool access
 */
export async function checkToolAccessForUser(
  userId: number,
  toolId: string
): Promise<{
  hasAccess: boolean;
  reason?: string;
  tier?: ProgramTier;
  requiredTier?: ProgramTier;
}> {
  try {
    // Get user's enrollments to determine their tier
    const enrollments = await sql`
      SELECT pe.id, p.slug as program_slug, pe.status
      FROM program_enrollments pe
      JOIN programs p ON pe.program_id = p.id
      WHERE pe.user_id = ${userId}
      AND pe.status = 'active'
    `;

    const userTier = determineTierFromEnrollments(
      enrollments.rows.map(e => ({ program_slug: e.program_slug, status: e.status }))
    );

    // Check tool access
    const toolAccess = checkProfileSuiteToolAccess(toolId, userTier);

    if (!toolAccess.hasAccess) {
      return {
        hasAccess: false,
        reason: toolAccess.lockedMessage,
        tier: userTier,
        requiredTier: toolAccess.upgradeTier || undefined
      };
    }

    return {
      hasAccess: true,
      tier: userTier
    };
  } catch (error) {
    console.error('Error checking tool access:', error);
    return {
      hasAccess: false,
      reason: 'Er is een fout opgetreden bij het controleren van toegang'
    };
  }
}

// Note: checkToolAccessForUser is the async database-based function for API routes
// The existing checkToolAccess is a sync function for tier-based checks
