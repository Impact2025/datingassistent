/**
 * Lead Scoring - Track and score visitor engagement
 *
 * Lightweight lead scoring system to identify hot leads based on
 * their interaction patterns with the chat widget.
 */

export type LeadEngagementLevel = 'cold' | 'warm' | 'hot';

interface LeadScore {
  score: number;
  level: LeadEngagementLevel;
  interactions: number;
  lastInteraction: number;
  highIntentSignals: string[];
}

// High-intent keywords that indicate strong buying signals
const HIGH_INTENT_KEYWORDS = [
  'prijs', 'kosten', 'betalen', 'aanmelden', 'starten',
  'kickstart', 'programma', 'coaching', 'inschrijven',
  'hoe werkt', 'wat kost', 'abonnement', 'korting'
];

// Scoring weights for different actions
const SCORING_WEIGHTS = {
  chatOpened: 5,
  messageSent: 10,
  highIntentMessage: 25,
  inviteAccepted: 15,
  multipleMessages: 5, // bonus per message after first
  sessionReturn: 20 // returning visitor
};

// Thresholds for lead levels
const LEVEL_THRESHOLDS = {
  warm: 20,
  hot: 50
};

/**
 * Get current lead score from storage
 */
function getLeadScore(): LeadScore {
  if (typeof window === 'undefined') {
    return {
      score: 0,
      level: 'cold',
      interactions: 0,
      lastInteraction: Date.now(),
      highIntentSignals: []
    };
  }

  const stored = localStorage.getItem('lead-score');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      // Invalid data, return fresh score
    }
  }

  return {
    score: 0,
    level: 'cold',
    interactions: 0,
    lastInteraction: Date.now(),
    highIntentSignals: []
  };
}

/**
 * Save lead score to storage
 */
function saveLeadScore(score: LeadScore): void {
  if (typeof window === 'undefined') return;

  localStorage.setItem('lead-score', JSON.stringify(score));
}

/**
 * Calculate engagement level based on score
 */
function calculateLevel(score: number): LeadEngagementLevel {
  if (score >= LEVEL_THRESHOLDS.hot) return 'hot';
  if (score >= LEVEL_THRESHOLDS.warm) return 'warm';
  return 'cold';
}

/**
 * Check if message contains high-intent keywords
 */
function detectHighIntent(message: string): string[] {
  const lowerMessage = message.toLowerCase();
  return HIGH_INTENT_KEYWORDS.filter(keyword =>
    lowerMessage.includes(keyword)
  );
}

/**
 * Track lead engagement event
 */
export function trackLeadEngagement(
  event: 'chat_opened' | 'message_sent' | 'invite_accepted' | 'session_return',
  metadata?: { message?: string }
): LeadScore {
  const currentScore = getLeadScore();
  let pointsToAdd = 0;
  const newHighIntentSignals: string[] = [];

  switch (event) {
    case 'chat_opened':
      pointsToAdd = SCORING_WEIGHTS.chatOpened;
      break;

    case 'message_sent':
      pointsToAdd = SCORING_WEIGHTS.messageSent;

      // Bonus for multiple messages (engagement depth)
      if (currentScore.interactions > 0) {
        pointsToAdd += SCORING_WEIGHTS.multipleMessages;
      }

      // Check for high-intent keywords
      if (metadata?.message) {
        const intents = detectHighIntent(metadata.message);
        if (intents.length > 0) {
          pointsToAdd += SCORING_WEIGHTS.highIntentMessage;
          newHighIntentSignals.push(...intents);
        }
      }

      currentScore.interactions++;
      break;

    case 'invite_accepted':
      pointsToAdd = SCORING_WEIGHTS.inviteAccepted;
      break;

    case 'session_return':
      // Check if this is truly a returning visitor (last interaction > 1 hour ago)
      const hourAgo = Date.now() - (60 * 60 * 1000);
      if (currentScore.lastInteraction < hourAgo) {
        pointsToAdd = SCORING_WEIGHTS.sessionReturn;
      }
      break;
  }

  // Update score
  currentScore.score += pointsToAdd;
  currentScore.level = calculateLevel(currentScore.score);
  currentScore.lastInteraction = Date.now();

  // Add new high-intent signals (deduplicated)
  for (const signal of newHighIntentSignals) {
    if (!currentScore.highIntentSignals.includes(signal)) {
      currentScore.highIntentSignals.push(signal);
    }
  }

  // Save and return
  saveLeadScore(currentScore);

  // Log in development
  if (process.env.NODE_ENV === 'development') {
    console.log(`🎯 Lead Score: ${currentScore.score} (${currentScore.level})`, {
      event,
      pointsAdded: pointsToAdd,
      signals: currentScore.highIntentSignals
    });
  }

  return currentScore;
}

/**
 * Get current lead score without modifying it
 */
export function getCurrentLeadScore(): LeadScore {
  return getLeadScore();
}

/**
 * Check if lead is hot (high conversion potential)
 */
export function isHotLead(): boolean {
  return getLeadScore().level === 'hot';
}

/**
 * Check if lead is warm (medium conversion potential)
 */
export function isWarmLead(): boolean {
  const level = getLeadScore().level;
  return level === 'warm' || level === 'hot';
}

/**
 * Reset lead score (for testing)
 */
export function resetLeadScore(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('lead-score');
}

/**
 * Send lead score to analytics endpoint for tracking
 */
export async function syncLeadScoreToBackend(): Promise<void> {
  const score = getLeadScore();

  // Only sync warm/hot leads to save API calls
  if (score.level === 'cold') return;

  try {
    await fetch('/api/analytics/lead-score', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        score: score.score,
        level: score.level,
        interactions: score.interactions,
        highIntentSignals: score.highIntentSignals,
        timestamp: Date.now()
      }),
      keepalive: true
    });
  } catch (error) {
    // Silently fail - don't disrupt UX
    console.error('Lead score sync failed:', error);
  }
}
