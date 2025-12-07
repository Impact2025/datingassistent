/**
 * Achievement System Types
 * Gamification layer for Kickstart program
 */

export type AchievementCategory = 'milestone' | 'streak' | 'engagement' | 'mastery';

export type AchievementTier = 'bronze' | 'silver' | 'gold' | 'platinum';

export interface Achievement {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: AchievementCategory;
  tier: AchievementTier;
  icon: string; // emoji
  points: number;
  requirement: {
    type: 'day_complete' | 'streak' | 'quiz_perfect' | 'reflection_count' | 'video_complete' | 'week_complete';
    target: number;
    metadata?: Record<string, any>;
  };
}

export interface UserAchievement {
  id: number;
  user_id: number;
  achievement_slug: string;
  unlocked_at: Date;
  progress?: number; // For incremental achievements
  notified: boolean; // Has user been notified of unlock?
}

export interface AchievementProgress {
  achievement: Achievement;
  unlocked: boolean;
  unlocked_at?: Date;
  current_progress: number;
  target_progress: number;
  percentage: number;
}

export interface AchievementStats {
  total_unlocked: number;
  total_points: number;
  total_available: number;
  by_category: Record<AchievementCategory, number>;
  recent_unlocks: UserAchievement[];
}

// Pre-defined achievements
export const ACHIEVEMENTS: Achievement[] = [
  // Milestone Achievements
  {
    id: 'first-day',
    slug: 'first-day',
    title: 'Eerste Stap',
    description: 'Voltooi je eerste dag van de Kickstart',
    category: 'milestone',
    tier: 'bronze',
    icon: '🌱',
    points: 10,
    requirement: {
      type: 'day_complete',
      target: 1,
    },
  },
  {
    id: 'week-one',
    slug: 'week-one',
    title: 'Week Warrior',
    description: 'Voltooi week 1 van de Kickstart',
    category: 'milestone',
    tier: 'silver',
    icon: '⚔️',
    points: 50,
    requirement: {
      type: 'week_complete',
      target: 1,
    },
  },
  {
    id: 'week-two',
    slug: 'week-two',
    title: 'Momentum Master',
    description: 'Voltooi week 2 van de Kickstart',
    category: 'milestone',
    tier: 'gold',
    icon: '🚀',
    points: 75,
    requirement: {
      type: 'week_complete',
      target: 2,
    },
  },
  {
    id: 'week-three',
    slug: 'week-three',
    title: 'Final Countdown',
    description: 'Voltooi week 3 van de Kickstart',
    category: 'milestone',
    tier: 'gold',
    icon: '⏰',
    points: 100,
    requirement: {
      type: 'week_complete',
      target: 3,
    },
  },
  {
    id: 'kickstart-graduate',
    slug: 'kickstart-graduate',
    title: 'Kickstart Graduate 🎓',
    description: 'Voltooi alle 21 dagen van de Kickstart',
    category: 'milestone',
    tier: 'platinum',
    icon: '🎓',
    points: 250,
    requirement: {
      type: 'day_complete',
      target: 21,
    },
  },

  // Streak Achievements
  {
    id: 'streak-3',
    slug: 'streak-3',
    title: 'Op Dreef',
    description: 'Behaal een 3-dagen streak',
    category: 'streak',
    tier: 'bronze',
    icon: '🔥',
    points: 15,
    requirement: {
      type: 'streak',
      target: 3,
    },
  },
  {
    id: 'streak-7',
    slug: 'streak-7',
    title: 'Week Champion',
    description: 'Behaal een 7-dagen streak',
    category: 'streak',
    tier: 'silver',
    icon: '🔥',
    points: 40,
    requirement: {
      type: 'streak',
      target: 7,
    },
  },
  {
    id: 'streak-14',
    slug: 'streak-14',
    title: 'Twee-Week Warrior',
    description: 'Behaal een 14-dagen streak',
    category: 'streak',
    tier: 'gold',
    icon: '🔥',
    points: 80,
    requirement: {
      type: 'streak',
      target: 14,
    },
  },
  {
    id: 'streak-21',
    slug: 'streak-21',
    title: 'Perfect Streak',
    description: 'Voltooi alle 21 dagen zonder onderbreking',
    category: 'streak',
    tier: 'platinum',
    icon: '💎',
    points: 200,
    requirement: {
      type: 'streak',
      target: 21,
    },
  },

  // Engagement Achievements
  {
    id: 'reflection-master',
    slug: 'reflection-master',
    title: 'Reflectie Master',
    description: 'Vul 10 reflecties in',
    category: 'engagement',
    tier: 'silver',
    icon: '📝',
    points: 30,
    requirement: {
      type: 'reflection_count',
      target: 10,
    },
  },
  {
    id: 'video-enthusiast',
    slug: 'video-enthusiast',
    title: 'Video Enthusiast',
    description: 'Bekijk alle 21 video\'s',
    category: 'engagement',
    tier: 'gold',
    icon: '📹',
    points: 60,
    requirement: {
      type: 'video_complete',
      target: 21,
    },
  },

  // Mastery Achievements
  {
    id: 'quiz-ace',
    slug: 'quiz-ace',
    title: 'Quiz Ace',
    description: 'Score 100% op 5 quizzes',
    category: 'mastery',
    tier: 'gold',
    icon: '🎯',
    points: 70,
    requirement: {
      type: 'quiz_perfect',
      target: 5,
    },
  },
  {
    id: 'quiz-perfectionist',
    slug: 'quiz-perfectionist',
    title: 'Quiz Perfectionist',
    description: 'Score 100% op alle quizzes',
    category: 'mastery',
    tier: 'platinum',
    icon: '🏆',
    points: 150,
    requirement: {
      type: 'quiz_perfect',
      target: 21, // Assuming 21 quizzes
    },
  },
];

// Helper functions
export function getAchievementBySlug(slug: string): Achievement | undefined {
  return ACHIEVEMENTS.find((a) => a.slug === slug);
}

export function getAchievementsByCategory(category: AchievementCategory): Achievement[] {
  return ACHIEVEMENTS.filter((a) => a.category === category);
}

export function getTierColor(tier: AchievementTier): string {
  switch (tier) {
    case 'bronze':
      return 'from-amber-600 to-orange-700';
    case 'silver':
      return 'from-gray-400 to-gray-600';
    case 'gold':
      return 'from-yellow-400 to-yellow-600';
    case 'platinum':
      return 'from-purple-500 to-pink-600';
    default:
      return 'from-gray-400 to-gray-600';
  }
}

export function getTierBgColor(tier: AchievementTier): string {
  switch (tier) {
    case 'bronze':
      return 'bg-amber-50';
    case 'silver':
      return 'bg-gray-50';
    case 'gold':
      return 'bg-yellow-50';
    case 'platinum':
      return 'bg-purple-50';
    default:
      return 'bg-gray-50';
  }
}
