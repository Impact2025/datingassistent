/**
 * useCoachingTracker Hook
 *
 * Professional hook for tracking tool usage in the coaching profile system.
 * Use this in any tool component to automatically track usage and update next actions.
 *
 * @example
 * function ProfielCoachTab() {
 *   const { trackToolView, trackToolComplete, isTracking } = useCoachingTracker('profiel-coach');
 *
 *   useEffect(() => {
 *     trackToolView(); // Track when user views the tool
 *   }, []);
 *
 *   const handleComplete = async () => {
 *     await trackToolComplete(); // Track when user completes an action
 *   };
 * }
 */

import { useState, useCallback, useEffect } from 'react';
import { useUser } from '@/providers/user-provider';

export interface CoachingTrackerOptions {
  /**
   * Automatically track tool view on mount
   * @default true
   */
  autoTrackView?: boolean;

  /**
   * Show console logs for debugging
   * @default false (true in development)
   */
  debug?: boolean;

  /**
   * Callback when tracking succeeds
   */
  onTrackSuccess?: (event: string) => void;

  /**
   * Callback when tracking fails
   */
  onTrackError?: (error: Error) => void;
}

export interface CoachingTracker {
  /**
   * Track that user viewed this tool
   */
  trackToolView: () => Promise<void>;

  /**
   * Track that user completed an action in this tool
   */
  trackToolComplete: () => Promise<void>;

  /**
   * Track custom event
   */
  trackCustomEvent: (eventName: string, data?: Record<string, any>) => Promise<void>;

  /**
   * Whether tracking is currently in progress
   */
  isTracking: boolean;

  /**
   * Whether this is the user's first time using this tool
   */
  isFirstTime: boolean;

  /**
   * Whether user came from onboarding flow
   */
  isFromOnboarding: boolean;
}

export function useCoachingTracker(
  toolName: string,
  options: CoachingTrackerOptions = {}
): CoachingTracker {
  const { user } = useUser();
  const [isTracking, setIsTracking] = useState(false);
  const [isFirstTime, setIsFirstTime] = useState(false);
  const [isFromOnboarding, setIsFromOnboarding] = useState(false);

  const {
    autoTrackView = true,
    debug = process.env.NODE_ENV === 'development',
    onTrackSuccess,
    onTrackError
  } = options;

  // Check URL parameters for context
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const params = new URLSearchParams(window.location.search);
    const firstTime = params.get('firstTime') === 'true';
    const onboarding = params.get('onboarding') === 'true';

    setIsFirstTime(firstTime);
    setIsFromOnboarding(onboarding);

    if (debug) {
      console.log(`🎯 [${toolName}] Context:`, {
        isFirstTime: firstTime,
        isFromOnboarding: onboarding
      });
    }
  }, [toolName, debug]);

  const trackEvent = useCallback(async (
    eventType: 'view' | 'complete' | 'custom',
    eventName?: string,
    data?: Record<string, any>
  ) => {
    if (!user?.id) {
      if (debug) {
        console.warn(`⚠️ [${toolName}] Cannot track - no user logged in`);
      }
      return;
    }

    // Temporarily disable tracking until coaching_profiles table is created
    if (debug) {
      console.log(`📊 [${toolName}] Tracking disabled - coaching_profiles table not available`);
    }
    return;

    setIsTracking(true);

    try {
      const token = localStorage.getItem('datespark_auth_token');

      if (!token) {
        throw new Error('No auth token found');
      }

      // Track tool usage via API
      const response = await fetch('/api/coaching-profile/track-tool', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          toolName,
          eventType,
          eventName,
          timestamp: new Date().toISOString(),
          isFirstTime,
          isFromOnboarding,
          ...data
        })
      });

      if (!response.ok) {
        console.warn(`⚠️ [${toolName}] Tracking failed: ${response.status} ${response.statusText}`);
        onTrackError?.(new Error(`Tracking failed: ${response.statusText}`));
        return; // Don't throw, just log and continue
      }

      if (debug) {
        console.log(`✅ [${toolName}] Tracked ${eventType}:`, eventName || 'tool usage');
      }

      onTrackSuccess?.(eventType);

      // Track in analytics if available
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', `coaching_${eventType}`, {
          tool_name: toolName,
          event_name: eventName,
          user_id: user.id,
          is_first_time: isFirstTime,
          is_from_onboarding: isFromOnboarding
        });
      }

    } catch (error) {
      console.error(`❌ [${toolName}] Tracking error:`, error);
      onTrackError?.(error as Error);
    } finally {
      setIsTracking(false);
    }
  }, [user, toolName, isFirstTime, isFromOnboarding, debug, onTrackSuccess, onTrackError]);

  const trackToolView = useCallback(async () => {
    await trackEvent('view');
  }, [trackEvent]);

  const trackToolComplete = useCallback(async () => {
    await trackEvent('complete');
  }, [trackEvent]);

  const trackCustomEvent = useCallback(async (eventName: string, data?: Record<string, any>) => {
    await trackEvent('custom', eventName, data);
  }, [trackEvent]);

  // Auto-track view on mount if enabled
  useEffect(() => {
    if (autoTrackView && user?.id) {
      trackToolView();
    }
  }, [autoTrackView, user?.id]); // Only run when user becomes available

  return {
    trackToolView,
    trackToolComplete,
    trackCustomEvent,
    isTracking,
    isFirstTime,
    isFromOnboarding
  };
}

/**
 * Hook to check if user should see onboarding for this tool
 */
export function useToolOnboarding(toolName: string) {
  const [shouldShowOnboarding, setShouldShowOnboarding] = useState(false);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const params = new URLSearchParams(window.location.search);
    const firstTime = params.get('firstTime') === 'true';
    const onboarding = params.get('onboarding') === 'true';

    // Check localStorage if user has seen onboarding before
    const seenKey = `onboarding_seen_${toolName}`;
    const hasSeen = localStorage.getItem(seenKey) === 'true';

    setHasSeenOnboarding(hasSeen);
    setShouldShowOnboarding((firstTime || onboarding) && !hasSeen);
  }, [toolName]);

  const markOnboardingSeen = useCallback(() => {
    const seenKey = `onboarding_seen_${toolName}`;
    localStorage.setItem(seenKey, 'true');
    setShouldShowOnboarding(false);
    setHasSeenOnboarding(true);
  }, [toolName]);

  const resetOnboarding = useCallback(() => {
    const seenKey = `onboarding_seen_${toolName}`;
    localStorage.removeItem(seenKey);
    setHasSeenOnboarding(false);
  }, [toolName]);

  return {
    shouldShowOnboarding,
    hasSeenOnboarding,
    markOnboardingSeen,
    resetOnboarding
  };
}
