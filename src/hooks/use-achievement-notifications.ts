'use client';

/**
 * Achievement Notifications Hook
 * Sprint 4: Integration & UX Enhancement
 *
 * Usage:
 * const { checkForNewAchievements } = useAchievementNotifications();
 * await checkForNewAchievements(); // Call after lesson completion, quiz pass, etc.
 */

import { useCallback } from 'react';
import { useToast } from '@/components/notifications/toast-container';
import type { Achievement } from '@/lib/achievements/achievement-tracker';

export function useAchievementNotifications() {
  const { showAchievementToast } = useToast();

  /**
   * Check for newly unlocked achievements and show toast notifications
   */
  const checkForNewAchievements = useCallback(async () => {
    try {
      const response = await fetch('/api/achievements/check', {
        method: 'POST',
        credentials: 'include'
      });

      if (!response.ok) {
        console.error('Failed to check achievements');
        return [];
      }

      const data = await response.json();
      const newAchievements: Achievement[] = data.achievements || [];

      // Show toast for each new achievement
      newAchievements.forEach((achievement, index) => {
        // Stagger toasts slightly if multiple achievements unlocked
        setTimeout(() => {
          showAchievementToast(achievement);
        }, index * 500);
      });

      return newAchievements;

    } catch (error) {
      console.error('Error checking achievements:', error);
      return [];
    }
  }, [showAchievementToast]);

  /**
   * Show a specific achievement toast (for testing or manual triggering)
   */
  const showAchievement = useCallback((achievement: Achievement) => {
    showAchievementToast(achievement);
  }, [showAchievementToast]);

  return {
    checkForNewAchievements,
    showAchievement
  };
}
