"use client";

import { useCallback } from 'react';

export interface TutorialEvent {
  eventType: 'tutorial_started' | 'tutorial_completed' | 'tutorial_skipped' | 'step_completed' | 'step_skipped' | 'help_requested';
  tutorialId: string;
  stepId?: string;
  userId?: string;
  metadata?: Record<string, any>;
  timestamp: Date;
}

export interface TutorialMetrics {
  tutorialId: string;
  completionRate: number;
  averageTime: number;
  dropOffPoints: number[];
  userSatisfaction: number;
  totalStarts: number;
  totalCompletions: number;
}

export function useTutorialAnalytics() {
  const trackEvent = useCallback(async (
    eventType: TutorialEvent['eventType'],
    data: Omit<TutorialEvent, 'eventType' | 'timestamp'>
  ) => {
    try {
      const event: TutorialEvent = {
        eventType,
        timestamp: new Date(),
        ...data
      };

      // Send to analytics API
      await fetch('/api/tutorial-analytics/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event)
      });

      // Also track in local analytics for immediate feedback
      console.log('📊 Tutorial Event:', event);
    } catch (error) {
      console.error('Failed to track tutorial event:', error);
    }
  }, []);

  const trackCompletion = useCallback(async (tutorialId: string, timeSpent: number) => {
    await trackEvent('tutorial_completed', {
      tutorialId,
      metadata: { timeSpent, completionRate: 100 }
    });
  }, [trackEvent]);

  const trackSkip = useCallback(async (tutorialId: string, lastStepIndex: number) => {
    await trackEvent('tutorial_skipped', {
      tutorialId,
      metadata: { lastStepIndex, completionRate: (lastStepIndex / 10) * 100 } // Assuming 10 steps
    });
  }, [trackEvent]);

  const getTutorialMetrics = useCallback(async (tutorialId: string): Promise<TutorialMetrics | null> => {
    try {
      const response = await fetch(`/api/tutorial-analytics/metrics/${tutorialId}`);
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.error('Failed to fetch tutorial metrics:', error);
    }
    return null;
  }, []);

  const getUserTutorialHistory = useCallback(async (userId: string) => {
    try {
      const response = await fetch(`/api/tutorial-analytics/user/${userId}/history`);
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.error('Failed to fetch user tutorial history:', error);
    }
    return [];
  }, []);

  return {
    trackEvent,
    trackCompletion,
    trackSkip,
    getTutorialMetrics,
    getUserTutorialHistory
  };
}