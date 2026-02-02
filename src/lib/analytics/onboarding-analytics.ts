/**
 * Onboarding Analytics - World-class event tracking (AVG Compliant)
 *
 * Features:
 * - Type-safe event definitions
 * - Automatic session tracking
 * - Time-on-task metrics
 * - Dropout analysis
 * - Privacy-first (no PII in events)
 *
 * PRIVACY: Requires analytics consent to track onboarding events
 */

// =====================================================
// EVENT DEFINITIONS
// =====================================================

export const OnboardingEvents = {
  // Flow lifecycle
  FLOW_STARTED: 'onboarding_flow_started',
  FLOW_COMPLETED: 'onboarding_flow_completed',
  FLOW_ABANDONED: 'onboarding_flow_abandoned',
  FLOW_RESTORED: 'onboarding_flow_restored',

  // Section events
  SECTION_STARTED: 'onboarding_section_started',
  SECTION_COMPLETED: 'onboarding_section_completed',
  SECTION_SKIPPED: 'onboarding_section_skipped',

  // Question events
  QUESTION_ANSWERED: 'onboarding_question_answered',
  QUESTION_CHANGED: 'onboarding_question_changed',
  QUESTION_SKIPPED: 'onboarding_question_skipped',

  // Errors
  VALIDATION_ERROR: 'onboarding_validation_error',
  SAVE_ERROR: 'onboarding_save_error',

  // Processing
  PROCESSING_STARTED: 'onboarding_processing_started',
  PROCESSING_COMPLETED: 'onboarding_processing_completed',
} as const;

export type OnboardingEventName = typeof OnboardingEvents[keyof typeof OnboardingEvents];

// =====================================================
// EVENT PROPERTIES
// =====================================================

interface BaseEventProperties {
  flowType: 'dating_snapshot' | 'transformatie_intake' | 'kickstart';
  sessionId: string;
  timestamp: number;
}

interface FlowStartedProperties extends BaseEventProperties {
  hasRestoredProgress: boolean;
  source?: string;
}

interface FlowCompletedProperties extends BaseEventProperties {
  totalTimeSeconds: number;
  sectionsCompleted: number;
  questionsAnswered: number;
}

interface FlowAbandonedProperties extends BaseEventProperties {
  lastSectionIndex: number;
  lastSectionId: string;
  timeSpentSeconds: number;
  questionsAnswered: number;
  abandonReason?: 'tab_close' | 'navigation' | 'timeout' | 'unknown';
}

interface SectionEventProperties extends BaseEventProperties {
  sectionIndex: number;
  sectionId: string;
  sectionTitle: string;
  timeSpentSeconds?: number;
  questionsInSection: number;
  questionsAnswered?: number;
}

interface QuestionEventProperties extends BaseEventProperties {
  questionId: string;
  questionType: string;
  sectionId: string;
  timeToAnswerSeconds?: number;
  wasChanged?: boolean;
}

interface ErrorEventProperties extends BaseEventProperties {
  errorType: string;
  errorMessage: string;
  questionId?: string;
  sectionId?: string;
}

// Union type for all event properties
type EventProperties =
  | FlowStartedProperties
  | FlowCompletedProperties
  | FlowAbandonedProperties
  | SectionEventProperties
  | QuestionEventProperties
  | ErrorEventProperties
  | BaseEventProperties;

// =====================================================
// SESSION MANAGEMENT
// =====================================================

let currentSessionId: string | null = null;
let sessionStartTime: number | null = null;

function generateSessionId(): string {
  return `ob_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function startSession(): string {
  currentSessionId = generateSessionId();
  sessionStartTime = Date.now();

  // Store in sessionStorage for tab persistence
  if (typeof window !== 'undefined') {
    sessionStorage.setItem('onboarding_session_id', currentSessionId);
    sessionStorage.setItem('onboarding_session_start', String(sessionStartTime));
  }

  return currentSessionId;
}

export function getSessionId(): string {
  if (currentSessionId) return currentSessionId;

  // Try to restore from sessionStorage
  if (typeof window !== 'undefined') {
    const stored = sessionStorage.getItem('onboarding_session_id');
    if (stored) {
      currentSessionId = stored;
      sessionStartTime = parseInt(sessionStorage.getItem('onboarding_session_start') || '0', 10);
      return currentSessionId;
    }
  }

  return startSession();
}

export function getSessionDuration(): number {
  if (!sessionStartTime) return 0;
  return Math.round((Date.now() - sessionStartTime) / 1000);
}

export function endSession(): void {
  currentSessionId = null;
  sessionStartTime = null;

  if (typeof window !== 'undefined') {
    sessionStorage.removeItem('onboarding_session_id');
    sessionStorage.removeItem('onboarding_session_start');
  }
}

// =====================================================
// CONSENT CHECKING
// =====================================================

/**
 * Check if analytics consent is given
 */
function hasAnalyticsConsent(): boolean {
  if (typeof window === 'undefined') return false;

  try {
    const stored = localStorage.getItem('cookie-consent');
    if (!stored) return false;

    const consent = JSON.parse(stored);
    return consent.analytics === true;
  } catch {
    return false;
  }
}

// =====================================================
// TRACKING FUNCTIONS
// =====================================================

type TrackingProvider = 'console' | 'vercel' | 'mixpanel' | 'custom';

interface AnalyticsConfig {
  provider: TrackingProvider;
  debug: boolean;
  enabled: boolean;
}

const config: AnalyticsConfig = {
  provider: process.env.NODE_ENV === 'development' ? 'console' : 'vercel',
  debug: process.env.NODE_ENV === 'development',
  enabled: true,
};

/**
 * Core tracking function (requires analytics consent)
 */
export function trackOnboardingEvent(
  eventName: OnboardingEventName,
  properties: Partial<EventProperties> & { flowType: string }
): void {
  if (!config.enabled) return;

  // Check analytics consent
  if (!hasAnalyticsConsent()) {
    if (config.debug) {
      console.log(`[Onboarding Analytics] ❌ ${eventName} blocked - Analytics consent required`);
    }
    return;
  }

  const fullProperties: EventProperties = {
    sessionId: getSessionId(),
    timestamp: Date.now(),
    ...properties,
  } as EventProperties;

  // Debug logging
  if (config.debug) {
    console.log(`📊 [Analytics] ${eventName}`, fullProperties);
  }

  // Send to provider
  switch (config.provider) {
    case 'vercel':
      sendToVercel(eventName, fullProperties);
      break;
    case 'mixpanel':
      sendToMixpanel(eventName, fullProperties);
      break;
    case 'console':
    default:
      // Already logged above
      break;
  }
}

// Provider implementations
function sendToVercel(eventName: string, properties: EventProperties): void {
  // Vercel Analytics integration
  if (typeof window !== 'undefined' && (window as any).va) {
    (window as any).va('event', {
      name: eventName,
      ...properties,
    });
  }
}

function sendToMixpanel(eventName: string, properties: EventProperties): void {
  // Mixpanel integration (if installed)
  if (typeof window !== 'undefined' && (window as any).mixpanel) {
    (window as any).mixpanel.track(eventName, properties);
  }
}

// =====================================================
// CONVENIENCE FUNCTIONS
// =====================================================

/**
 * Track when onboarding flow starts
 */
export function trackFlowStarted(
  flowType: string,
  options: { hasRestoredProgress?: boolean; source?: string } = {}
): void {
  startSession();
  trackOnboardingEvent(OnboardingEvents.FLOW_STARTED, {
    flowType: flowType as any,
    hasRestoredProgress: options.hasRestoredProgress ?? false,
    source: options.source,
  });
}

/**
 * Track when a section is completed
 */
export function trackSectionCompleted(
  flowType: string,
  section: {
    index: number;
    id: string;
    title: string;
    questionsTotal: number;
    questionsAnswered: number;
    timeSpentSeconds: number;
  }
): void {
  trackOnboardingEvent(OnboardingEvents.SECTION_COMPLETED, {
    flowType: flowType as any,
    sectionIndex: section.index,
    sectionId: section.id,
    sectionTitle: section.title,
    questionsInSection: section.questionsTotal,
    questionsAnswered: section.questionsAnswered,
    timeSpentSeconds: section.timeSpentSeconds,
  });
}

/**
 * Track when onboarding is completed
 */
export function trackFlowCompleted(
  flowType: string,
  stats: {
    sectionsCompleted: number;
    questionsAnswered: number;
  }
): void {
  trackOnboardingEvent(OnboardingEvents.FLOW_COMPLETED, {
    flowType: flowType as any,
    totalTimeSeconds: getSessionDuration(),
    sectionsCompleted: stats.sectionsCompleted,
    questionsAnswered: stats.questionsAnswered,
  });
  endSession();
}

/**
 * Track when onboarding is abandoned
 */
export function trackFlowAbandoned(
  flowType: string,
  state: {
    lastSectionIndex: number;
    lastSectionId: string;
    questionsAnswered: number;
    reason?: 'tab_close' | 'navigation' | 'timeout' | 'unknown';
  }
): void {
  trackOnboardingEvent(OnboardingEvents.FLOW_ABANDONED, {
    flowType: flowType as any,
    lastSectionIndex: state.lastSectionIndex,
    lastSectionId: state.lastSectionId,
    timeSpentSeconds: getSessionDuration(),
    questionsAnswered: state.questionsAnswered,
    abandonReason: state.reason ?? 'unknown',
  });
  endSession();
}

/**
 * Track validation errors
 */
export function trackValidationError(
  flowType: string,
  error: {
    type: string;
    message: string;
    questionId?: string;
    sectionId?: string;
  }
): void {
  trackOnboardingEvent(OnboardingEvents.VALIDATION_ERROR, {
    flowType: flowType as any,
    errorType: error.type,
    errorMessage: error.message,
    questionId: error.questionId,
    sectionId: error.sectionId,
  });
}

// =====================================================
// REACT HOOK
// =====================================================

import { useEffect, useRef, useCallback } from 'react';

interface UseOnboardingAnalyticsOptions {
  flowType: 'dating_snapshot' | 'transformatie_intake' | 'kickstart';
  enabled?: boolean;
}

interface UseOnboardingAnalyticsReturn {
  trackStart: (options?: { hasRestoredProgress?: boolean }) => void;
  trackSectionComplete: (section: {
    index: number;
    id: string;
    title: string;
    questionsTotal: number;
    questionsAnswered: number;
  }) => void;
  trackComplete: (stats: { sectionsCompleted: number; questionsAnswered: number }) => void;
  trackError: (error: { type: string; message: string; questionId?: string }) => void;
}

export function useOnboardingAnalytics(
  options: UseOnboardingAnalyticsOptions
): UseOnboardingAnalyticsReturn {
  const { flowType, enabled = true } = options;
  const sectionStartTime = useRef<number>(Date.now());
  const isStarted = useRef(false);

  // Track abandonment on unmount
  useEffect(() => {
    if (!enabled) return;

    const handleBeforeUnload = () => {
      if (isStarted.current) {
        trackFlowAbandoned(flowType, {
          lastSectionIndex: 0,
          lastSectionId: 'unknown',
          questionsAnswered: 0,
          reason: 'tab_close',
        });
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [flowType, enabled]);

  const trackStart = useCallback(
    (opts?: { hasRestoredProgress?: boolean }) => {
      if (!enabled) return;
      isStarted.current = true;
      sectionStartTime.current = Date.now();
      trackFlowStarted(flowType, opts);
    },
    [flowType, enabled]
  );

  const trackSectionComplete = useCallback(
    (section: {
      index: number;
      id: string;
      title: string;
      questionsTotal: number;
      questionsAnswered: number;
    }) => {
      if (!enabled) return;
      const timeSpent = Math.round((Date.now() - sectionStartTime.current) / 1000);
      trackSectionCompleted(flowType, { ...section, timeSpentSeconds: timeSpent });
      sectionStartTime.current = Date.now();
    },
    [flowType, enabled]
  );

  const trackComplete = useCallback(
    (stats: { sectionsCompleted: number; questionsAnswered: number }) => {
      if (!enabled) return;
      isStarted.current = false;
      trackFlowCompleted(flowType, stats);
    },
    [flowType, enabled]
  );

  const trackError = useCallback(
    (error: { type: string; message: string; questionId?: string }) => {
      if (!enabled) return;
      trackValidationError(flowType, error);
    },
    [flowType, enabled]
  );

  return {
    trackStart,
    trackSectionComplete,
    trackComplete,
    trackError,
  };
}
