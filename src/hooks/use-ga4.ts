/**
 * useGA4 - React hook for GA4 analytics tracking
 *
 * Provides easy-to-use tracking functions for React components.
 * Automatically includes user context when available.
 */

import { useCallback, useEffect, useRef } from 'react';
import { useUser } from '@/providers/user-provider';
import {
  trackToolUsed,
  trackAssessmentStart,
  trackAssessmentComplete,
  trackFeatureClick,
  trackChatMessageSent,
  trackVideoStart,
  trackVideoComplete,
  trackLessonStart,
  trackLessonComplete,
  setUserProperties,
} from '@/lib/analytics/ga4-events';

interface UseGA4Options {
  toolName?: string;
  toolCategory?: string;
}

export function useGA4(options?: UseGA4Options) {
  const { user } = useUser();
  const startTimeRef = useRef<number | null>(null);
  const hasTrackedStart = useRef(false);

  // Set user properties when user changes
  useEffect(() => {
    if (user?.id) {
      setUserProperties({
        user_id: user.id.toString(),
      });
    }
  }, [user?.id]);

  // Track tool open (call once when component mounts)
  const trackToolOpen = useCallback(() => {
    if (hasTrackedStart.current || !options?.toolName) return;

    hasTrackedStart.current = true;
    startTimeRef.current = Date.now();

    trackToolUsed({
      tool_name: options.toolName,
      tool_category: options.toolCategory || 'tool',
      completed: false,
    });
  }, [options?.toolName, options?.toolCategory]);

  // Track tool complete (call when user finishes)
  const trackToolComplete = useCallback((result?: string) => {
    if (!options?.toolName) return;

    const duration = startTimeRef.current
      ? Math.round((Date.now() - startTimeRef.current) / 1000)
      : undefined;

    trackToolUsed({
      tool_name: options.toolName,
      tool_category: options.toolCategory || 'tool',
      duration_seconds: duration,
      completed: true,
      result,
    });
  }, [options?.toolName, options?.toolCategory]);

  // Track assessment start
  const trackAssessment = useCallback((assessmentType: string, assessmentName: string) => {
    trackAssessmentStart({
      assessment_type: assessmentType,
      assessment_name: assessmentName,
    });
  }, []);

  // Track assessment complete
  const trackAssessmentDone = useCallback((
    assessmentType: string,
    assessmentName: string,
    score?: number,
    result?: string,
    durationSeconds?: number
  ) => {
    trackAssessmentComplete({
      assessment_type: assessmentType,
      assessment_name: assessmentName,
      score,
      result,
      duration_seconds: durationSeconds,
    });
  }, []);

  // Track feature click
  const trackClick = useCallback((featureName: string, location: string, category?: string) => {
    trackFeatureClick({
      feature_name: featureName,
      feature_location: location,
      feature_category: category,
    });
  }, []);

  // Track chat message
  const trackChat = useCallback((chatType?: 'coach' | 'support' | 'iris', messageLength?: number) => {
    trackChatMessageSent({
      chat_type: chatType,
      message_length: messageLength,
    });
  }, []);

  // Track video events
  const trackVideo = useCallback((
    action: 'start' | 'complete',
    videoId: string,
    videoTitle: string,
    extra?: { duration?: number; watchTime?: number; completion?: number }
  ) => {
    if (action === 'start') {
      trackVideoStart({
        video_id: videoId,
        video_title: videoTitle,
        video_duration: extra?.duration,
      });
    } else {
      trackVideoComplete({
        video_id: videoId,
        video_title: videoTitle,
        watch_time_seconds: extra?.watchTime,
        completion_percentage: extra?.completion,
      });
    }
  }, []);

  // Track lesson events
  const trackLesson = useCallback((
    action: 'start' | 'complete',
    lessonId: string,
    lessonName: string,
    courseName?: string,
    extra?: { duration?: number; score?: number; moduleName?: string }
  ) => {
    if (action === 'start') {
      trackLessonStart({
        lesson_id: lessonId,
        lesson_name: lessonName,
        course_name: courseName,
        module_name: extra?.moduleName,
      });
    } else {
      trackLessonComplete({
        lesson_id: lessonId,
        lesson_name: lessonName,
        course_name: courseName,
        duration_seconds: extra?.duration,
        score: extra?.score,
      });
    }
  }, []);

  return {
    trackToolOpen,
    trackToolComplete,
    trackAssessment,
    trackAssessmentDone,
    trackClick,
    trackChat,
    trackVideo,
    trackLesson,
    userId: user?.id,
  };
}

export default useGA4;
