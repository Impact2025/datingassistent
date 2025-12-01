/**
 * Gamification Hook - Track points, streaks, challenges & level
 * Sprint 4: Gamification & Engagement
 */

import { useEffect, useState } from 'react';

export interface GamificationStats {
  totalPoints: number;
  currentLevel: number;
  levelProgress: number;
  currentStreak: number;
  longestStreak: number;
  todayCompleted: boolean;
  levelTitle: string;
  pointsToNextLevel: number;
  nextLevelPoints: number;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  progress: number;
  pointsReward: number;
  difficulty: string;
  status: 'active' | 'completed' | 'locked';
}

export interface UseGamificationReturn {
  stats: GamificationStats | null;
  challenges: Challenge[];
  loading: boolean;
  error: Error | null;
  refreshStats: () => Promise<void>;
  trackLogin: () => Promise<void>;
}

export function useGamification(userId?: number): UseGamificationReturn {
  const [stats, setStats] = useState<GamificationStats | null>(null);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchStats = async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      const [statsRes, challengesRes] = await Promise.all([
        fetch(`/api/gamification/stats?userId=${userId}`),
        fetch(`/api/gamification/challenges?userId=${userId}`)
      ]);

      if (statsRes.ok) {
        const data = await statsRes.json();
        setStats(data);
      }

      if (challengesRes.ok) {
        const data = await challengesRes.json();
        setChallenges(data.challenges || []);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch gamification data'));
    } finally {
      setLoading(false);
    }
  };

  const trackLogin = async () => {
    if (!userId) return;

    try {
      const response = await fetch('/api/gamification/track-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });

      if (response.ok) {
        // Refresh stats after tracking login
        await fetchStats();
      }
    } catch (err) {
      console.error('Failed to track login:', err);
    }
  };

  const refreshStats = async () => {
    setLoading(true);
    await fetchStats();
  };

  // Initial fetch
  useEffect(() => {
    fetchStats();
  }, [userId]);

  return {
    stats,
    challenges,
    loading,
    error,
    refreshStats,
    trackLogin
  };
}
