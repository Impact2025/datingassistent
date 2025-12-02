/**
 * Achievement Definitions for User Progress
 * Used in onboarding and throughout the platform
 */

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  xp: number;
  category: 'onboarding' | 'profile' | 'conversation' | 'dating' | 'engagement';
}

export const ACHIEVEMENTS: Record<string, Achievement> = {
  // Onboarding Achievements
  FIRST_STEP: {
    id: 'first_step',
    name: 'Eerste Stap',
    description: 'Je bent begonnen aan je transformatie',
    icon: '🚀',
    xp: 50,
    category: 'onboarding',
  },
  QUICK_STARTER: {
    id: 'quick_starter',
    name: 'Quick Starter',
    description: 'Onboarding voltooid binnen 10 minuten',
    icon: '⚡',
    xp: 100,
    category: 'onboarding',
  },
  SELF_AWARE: {
    id: 'self_aware',
    name: 'Zelfbewust',
    description: 'Je intake vragenlijst voltooid',
    icon: '🪞',
    xp: 75,
    category: 'onboarding',
  },
  ROADMAP_READY: {
    id: 'roadmap_ready',
    name: 'Plan Klaar',
    description: 'Je persoonlijke roadmap bekeken',
    icon: '🗺️',
    xp: 50,
    category: 'onboarding',
  },

  // Profile Achievements
  PHOTO_WARRIOR: {
    id: 'photo_warrior',
    name: 'Foto Warrior',
    description: 'Je eerste foto-analyse voltooid',
    icon: '📸',
    xp: 75,
    category: 'profile',
  },
  BIO_BUILDER: {
    id: 'bio_builder',
    name: 'Bio Builder',
    description: 'Je eerste bio gegenereerd',
    icon: '✍️',
    xp: 75,
    category: 'profile',
  },
  PROFILE_PRO: {
    id: 'profile_pro',
    name: 'Profiel Pro',
    description: 'Alle profiel tools minstens één keer gebruikt',
    icon: '⭐',
    xp: 150,
    category: 'profile',
  },

  // Conversation Achievements
  CONVERSATION_STARTER: {
    id: 'conversation_starter',
    name: 'Gespreksstarter',
    description: 'Je eerste opening gegenereerd',
    icon: '👋',
    xp: 50,
    category: 'conversation',
  },
  CHAT_MASTER: {
    id: 'chat_master',
    name: 'Chat Master',
    description: '10 gesprekken geanalyseerd',
    icon: '💬',
    xp: 200,
    category: 'conversation',
  },

  // Dating Achievements
  DATE_PREPPER: {
    id: 'date_prepper',
    name: 'Date Prepper',
    description: 'Je eerste date voorbereiding gedaan',
    icon: '📅',
    xp: 75,
    category: 'dating',
  },
  DATING_CHAMPION: {
    id: 'dating_champion',
    name: 'Dating Champion',
    description: '5 dates gepland via het platform',
    icon: '🏆',
    xp: 250,
    category: 'dating',
  },

  // Engagement Achievements
  STREAK_STARTER: {
    id: 'streak_starter',
    name: 'Streak Starter',
    description: '3 dagen op rij actief geweest',
    icon: '🔥',
    xp: 100,
    category: 'engagement',
  },
  WEEK_WARRIOR: {
    id: 'week_warrior',
    name: 'Week Warrior',
    description: '7 dagen op rij actief geweest',
    icon: '💎',
    xp: 200,
    category: 'engagement',
  },
  DEDICATED: {
    id: 'dedicated',
    name: 'Toegewijd',
    description: '30 dagen op rij actief geweest',
    icon: '👑',
    xp: 500,
    category: 'engagement',
  },
};

/**
 * Get achievement by ID
 */
export function getAchievement(id: string): Achievement | null {
  return Object.values(ACHIEVEMENTS).find((a) => a.id === id) || null;
}

/**
 * Get all achievements in a category
 */
export function getAchievementsByCategory(category: Achievement['category']): Achievement[] {
  return Object.values(ACHIEVEMENTS).filter((a) => a.category === category);
}

/**
 * Calculate level from XP
 */
export function calculateLevel(totalXp: number): {
  level: number;
  currentXp: number;
  xpForNextLevel: number;
  progress: number;
} {
  // XP required per level: 100, 250, 500, 1000, 2000, etc.
  const levelThresholds = [0, 100, 350, 850, 1850, 3850, 7850];

  let level = 1;
  for (let i = 1; i < levelThresholds.length; i++) {
    if (totalXp >= levelThresholds[i]) {
      level = i + 1;
    } else {
      break;
    }
  }

  const currentLevelXp = levelThresholds[level - 1] || 0;
  const nextLevelXp = levelThresholds[level] || levelThresholds[levelThresholds.length - 1] * 2;
  const xpInCurrentLevel = totalXp - currentLevelXp;
  const xpNeededForLevel = nextLevelXp - currentLevelXp;
  const progress = Math.min(100, (xpInCurrentLevel / xpNeededForLevel) * 100);

  return {
    level,
    currentXp: xpInCurrentLevel,
    xpForNextLevel: xpNeededForLevel,
    progress,
  };
}

/**
 * Level names
 */
export function getLevelName(level: number): string {
  const names = [
    'Nieuweling',
    'Beginner',
    'Leerling',
    'Gevorderd',
    'Expert',
    'Meester',
    'Legende',
  ];
  return names[Math.min(level - 1, names.length - 1)];
}
