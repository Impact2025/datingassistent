/**
 * Chat Analytics - Track proactive invite performance
 *
 * Tracks:
 * - Invite shows
 * - Invite accepts (click-through)
 * - Invite dismissals
 * - Conversion rate
 */

export type ChatAnalyticsEvent =
  | 'proactive_invite_shown'
  | 'proactive_invite_accepted'
  | 'proactive_invite_dismissed'
  | 'chat_opened'
  | 'chat_closed'
  | 'message_sent';

interface AnalyticsData {
  event: ChatAnalyticsEvent;
  timestamp: number;
  sessionId: string;
  userAgent?: string;
  pageUrl?: string;
  metadata?: Record<string, any>;
}

/**
 * Track analytics event
 */
export function trackChatEvent(
  event: ChatAnalyticsEvent,
  metadata?: Record<string, any>
): void {
  // Get or create session ID
  const sessionId = getOrCreateSessionId();

  const data: AnalyticsData = {
    event,
    timestamp: Date.now(),
    sessionId,
    userAgent: typeof window !== 'undefined' ? navigator.userAgent : undefined,
    pageUrl: typeof window !== 'undefined' ? window.location.href : undefined,
    metadata
  };

  // Send to analytics endpoint
  sendToAnalytics(data);

  // Also log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.log('📊 Chat Analytics:', event, metadata);
  }
}

/**
 * Get or create session ID for tracking
 */
function getOrCreateSessionId(): string {
  if (typeof window === 'undefined') return 'server';

  let sessionId = sessionStorage.getItem('chat-analytics-session-id');

  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('chat-analytics-session-id', sessionId);
  }

  return sessionId;
}

/**
 * Send analytics data to backend
 */
async function sendToAnalytics(data: AnalyticsData): Promise<void> {
  try {
    // Send to analytics endpoint
    await fetch('/api/analytics/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
      // Use keepalive to ensure request completes even if user navigates away
      keepalive: true
    });
  } catch (error) {
    // Silently fail - don't disrupt user experience
    console.error('Analytics error:', error);
  }
}

/**
 * Calculate conversion rate from stored analytics
 */
export function getConversionRate(): {
  shown: number;
  accepted: number;
  dismissed: number;
  conversionRate: number;
} {
  if (typeof window === 'undefined') {
    return { shown: 0, accepted: 0, dismissed: 0, conversionRate: 0 };
  }

  const shown = parseInt(localStorage.getItem('analytics-invite-shown') || '0');
  const accepted = parseInt(localStorage.getItem('analytics-invite-accepted') || '0');
  const dismissed = parseInt(localStorage.getItem('analytics-invite-dismissed') || '0');

  const conversionRate = shown > 0 ? (accepted / shown) * 100 : 0;

  return {
    shown,
    accepted,
    dismissed,
    conversionRate
  };
}

/**
 * Track invite shown
 */
export function trackInviteShown(metadata?: Record<string, any>): void {
  trackChatEvent('proactive_invite_shown', metadata);

  // Increment local counter
  if (typeof window !== 'undefined') {
    const shown = parseInt(localStorage.getItem('analytics-invite-shown') || '0');
    localStorage.setItem('analytics-invite-shown', String(shown + 1));
  }
}

/**
 * Track invite accepted
 */
export function trackInviteAccepted(metadata?: Record<string, any>): void {
  trackChatEvent('proactive_invite_accepted', metadata);

  // Increment local counter
  if (typeof window !== 'undefined') {
    const accepted = parseInt(localStorage.getItem('analytics-invite-accepted') || '0');
    localStorage.setItem('analytics-invite-accepted', String(accepted + 1));
  }
}

/**
 * Track invite dismissed
 */
export function trackInviteDismissed(metadata?: Record<string, any>): void {
  trackChatEvent('proactive_invite_dismissed', metadata);

  // Increment local counter
  if (typeof window !== 'undefined') {
    const dismissed = parseInt(localStorage.getItem('analytics-invite-dismissed') || '0');
    localStorage.setItem('analytics-invite-dismissed', String(dismissed + 1));
  }
}
