/**
 * Early Bird Campaign Configuration
 *
 * Centrale configuratie voor alle early bird promoties.
 * Update alleen dit bestand om de actie te wijzigen of te beëindigen.
 */

export const EARLY_BIRD_CONFIG = {
  // Campaign details
  deadline: '1 maart 2026',
  endDate: new Date('2026-03-01T23:59:59'),

  // Pricing discounts
  pricing: {
    kickstart: {
      original: 97,
      earlyBird: 47,
      discount: 50,
      discountPercentage: 51
    },
    transformatie: {
      original: 297,
      earlyBird: 147,
      discount: 150,
      discountPercentage: 50
    },
    vip: {
      original: 997,
      earlyBird: 797,
      discount: 200,
      discountPercentage: 20
    }
  },

  // Helper functions
  isActive: () => new Date() <= EARLY_BIRD_CONFIG.endDate,

  // Days remaining
  daysRemaining: () => {
    const now = new Date();
    const end = EARLY_BIRD_CONFIG.endDate;
    const diff = end.getTime() - now.getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  },

  // Hours remaining
  hoursRemaining: () => {
    const now = new Date();
    const end = EARLY_BIRD_CONFIG.endDate;
    const diff = end.getTime() - now.getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60)));
  },

  // Badge text variations
  getBadgeText: () => {
    const days = EARLY_BIRD_CONFIG.daysRemaining();
    if (days <= 1) {
      return `LAATSTE KANS - Eindigt vandaag!`;
    } else if (days <= 3) {
      return `EARLYBIRD - Nog ${days} dagen`;
    } else {
      return `EARLYBIRD t/m ${EARLY_BIRD_CONFIG.deadline}`;
    }
  }
} as const;

// Type exports for TypeScript
export type ProgramType = keyof typeof EARLY_BIRD_CONFIG.pricing;
