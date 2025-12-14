/**
 * React Hook for Engagement Tracking
 * Sprint 5.4: Easy-to-use hook for tracking user interactions
 */

'use client';

import { useEffect, useRef, useCallback } from 'react';
import type { EngagementEventType } from '@/lib/analytics/engagement-tracker';

// Generate or retrieve session ID
const getSessionId = (): string => {
  if (typeof window === 'undefined') return 'ssr-session';

  let sessionId = sessionStorage.getItem('engagement_session_id');
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('engagement_session_id', sessionId);
  }
  return sessionId;
};

interface TrackEventOptions {
  event_data?: Record<string, any>;
  debounce?: number; // Debounce time in ms
}

export function useEngagementTracker() {
  const sessionId = useRef(getSessionId());
  const debounceTimers = useRef<Map<string, NodeJS.Timeout>>(new Map());

  /**
   * Track an engagement event
   */
  const trackEvent = useCallback(
    async (eventType: EngagementEventType, options: TrackEventOptions = {}) => {
      const { event_data, debounce = 0 } = options;

      // Perform the actual tracking
      const performTrack = async (
        eventType: EngagementEventType,
        eventData?: Record<string, any>
      ) => {
        try {
          await fetch('/api/engagement', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              event_type: eventType,
              event_data: eventData,
              session_id: sessionId.current
            })
          });
        } catch (error) {
          console.error('Error tracking engagement:', error);
          // Silent fail - don't break the app
        }
      };

      // Debounce if specified
      if (debounce > 0) {
        const existingTimer = debounceTimers.current.get(eventType);
        if (existingTimer) {
          clearTimeout(existingTimer);
        }

        const timer = setTimeout(() => {
          performTrack(eventType, event_data);
          debounceTimers.current.delete(eventType);
        }, debounce);

        debounceTimers.current.set(eventType, timer);
        return;
      }

      // Track immediately
      await performTrack(eventType, event_data);
    },
    []
  );

  /**
   * Track page view (call in useEffect)
   */
  const trackPageView = useCallback((page: string) => {
    trackEvent('page_view', { event_data: { page } });
  }, [trackEvent]);

  /**
   * Track feature click
   */
  const trackFeatureClick = useCallback((featureName: string, metadata?: Record<string, any>) => {
    trackEvent('feature_click', {
      event_data: { feature_name: featureName, ...metadata }
    });
  }, [trackEvent]);

  /**
   * Track lesson events
   */
  const trackLessonStart = useCallback((lessonId: number, programId?: number) => {
    trackEvent('lesson_start', {
      event_data: { lesson_id: lessonId, program_id: programId }
    });
  }, [trackEvent]);

  const trackLessonComplete = useCallback((
    lessonId: number,
    durationSeconds: number,
    programId?: number
  ) => {
    trackEvent('lesson_complete', {
      event_data: {
        lesson_id: lessonId,
        program_id: programId,
        duration_seconds: durationSeconds
      }
    });
  }, [trackEvent]);

  /**
   * Track video interactions
   */
  const trackVideoPlay = useCallback((lessonId: number, timestamp: number = 0) => {
    trackEvent('video_play', {
      event_data: { lesson_id: lessonId, timestamp },
      debounce: 1000 // Debounce video plays
    });
  }, [trackEvent]);

  const trackVideoPause = useCallback((lessonId: number, timestamp: number = 0) => {
    trackEvent('video_pause', {
      event_data: { lesson_id: lessonId, timestamp }
    });
  }, [trackEvent]);

  /**
   * Track quiz interactions
   */
  const trackQuizStart = useCallback((lessonId: number) => {
    trackEvent('quiz_start', { event_data: { lesson_id: lessonId } });
  }, [trackEvent]);

  const trackQuizSubmit = useCallback((lessonId: number, score: number) => {
    trackEvent('quiz_submit', {
      event_data: { lesson_id: lessonId, score }
    });
  }, [trackEvent]);

  // Cleanup debounce timers on unmount
  useEffect(() => {
    return () => {
      debounceTimers.current.forEach(timer => clearTimeout(timer));
      debounceTimers.current.clear();
    };
  }, []);

  return {
    trackEvent,
    trackPageView,
    trackFeatureClick,
    trackLessonStart,
    trackLessonComplete,
    trackVideoPlay,
    trackVideoPause,
    trackQuizStart,
    trackQuizSubmit
  };
}

/**
 * Hook to auto-track page views
 */
export function usePageViewTracking(pageName: string) {
  const { trackPageView } = useEngagementTracker();

  useEffect(() => {
    trackPageView(pageName);
  }, [pageName, trackPageView]);
}
