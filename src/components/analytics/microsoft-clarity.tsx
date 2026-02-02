'use client';

/**
 * Microsoft Clarity Integration - AVG Compliant
 *
 * Provides heatmaps, session recordings, and behavioral analytics.
 * Free alternative to Hotjar with unlimited sessions.
 *
 * PRIVACY NOTICE:
 * - Laadt ALLEEN met analytics consent
 * - Neemt scherm, muisbewegingen en clicks op
 * - Verstuurt data naar Microsoft servers
 *
 * Setup:
 * 1. Create account at https://clarity.microsoft.com
 * 2. Add your site
 * 3. Get your Clarity Project ID
 * 4. Add NEXT_PUBLIC_CLARITY_PROJECT_ID to .env
 */

import { useEffect, useState } from 'react';
import { hasAnalyticsConsent } from '@/components/cookie-consent';

declare global {
  interface Window {
    clarity: (...args: any[]) => void;
  }
}

interface ClarityProps {
  projectId?: string;
}

export function MicrosoftClarity({ projectId }: ClarityProps) {
  const clarityId = projectId || process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID;
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    // Check initial consent
    const checkConsent = () => {
      const hasConsent = hasAnalyticsConsent();
      setShouldLoad(hasConsent);

      if (!hasConsent) {
        console.log('[Clarity] Blocked - Analytics consent required');
      }
    };

    checkConsent();

    // Listen for consent changes
    const handleConsentUpdate = () => {
      checkConsent();
    };

    window.addEventListener('consentUpdated', handleConsentUpdate);
    return () => window.removeEventListener('consentUpdated', handleConsentUpdate);
  }, []);

  useEffect(() => {
    if (!clarityId) {
      if (process.env.NODE_ENV === 'development') {
        console.log('[Clarity] No project ID configured. Add NEXT_PUBLIC_CLARITY_PROJECT_ID to .env');
      }
      return;
    }

    // Don't load in development unless explicitly enabled
    if (process.env.NODE_ENV === 'development' && !process.env.NEXT_PUBLIC_CLARITY_DEV_ENABLED) {
      console.log('[Clarity] Disabled in development. Set NEXT_PUBLIC_CLARITY_DEV_ENABLED=true to enable.');
      return;
    }

    // Only load if consent is given
    if (!shouldLoad) {
      return;
    }

    // Prevent double initialization
    if (window.clarity) {
      console.log('[Clarity] Already initialized');
      return;
    }

    // Clarity initialization script
    (function(c: any, l: any, a: any, r: any, i: any, t?: any, y?: any) {
      c[a] = c[a] || function(...args: any[]) {
        (c[a].q = c[a].q || []).push(args);
      };
      t = l.createElement(r);
      t.async = 1;
      t.src = 'https://www.clarity.ms/tag/' + i;
      y = l.getElementsByTagName(r)[0];
      y.parentNode.insertBefore(t, y);
    })(window, document, 'clarity', 'script', clarityId);

    console.log('[Clarity] ✅ Initialized with consent - Session recording active');
  }, [clarityId, shouldLoad]);

  return null;
}

/**
 * Set custom user ID for Clarity
 */
export function setClarityUserId(userId: string): void {
  if (typeof window !== 'undefined' && window.clarity) {
    window.clarity('identify', userId);
  }
}

/**
 * Set custom session tags for filtering in Clarity dashboard
 */
export function setClarityTag(key: string, value: string): void {
  if (typeof window !== 'undefined' && window.clarity) {
    window.clarity('set', key, value);
  }
}

/**
 * Track custom events in Clarity
 */
export function trackClarityEvent(eventName: string): void {
  if (typeof window !== 'undefined' && window.clarity) {
    window.clarity('event', eventName);
  }
}

/**
 * Upgrade session to be saved (useful for important sessions)
 */
export function upgradeClaritySession(reason: string): void {
  if (typeof window !== 'undefined' && window.clarity) {
    window.clarity('upgrade', reason);
  }
}

export default MicrosoftClarity;
