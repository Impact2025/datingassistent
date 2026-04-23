'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { hasAnalyticsConsent } from '@/components/cookie-consent';
import { logger } from '@/lib/logger';

// Routes met Art.9-data (seksuele voorkeur, psychologische data, reflecties)
// Op deze routes wordt sessie-opname gestopt zodat gevoelige invoer niet bij
// Microsoft terechtkomt (AVG art. 5 lid 1 sub f + art. 9).
const SENSITIVE_ROUTE_PREFIXES = [
  '/kickstart',
  '/hechtingsstijl',
  '/dashboard',
  '/transformatie',
  '/snapshot',
  '/onboarding',
];

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
  const pathname = usePathname();

  // Stop sessie-opname op gevoelige routes (AVG art. 9 - bijzondere categorieën)
  useEffect(() => {
    if (typeof window === 'undefined' || !window.clarity) return;
    const isSensitive = SENSITIVE_ROUTE_PREFIXES.some(p => pathname.startsWith(p));
    if (isSensitive) {
      window.clarity('stop');
      logger.log('[Clarity] ⛔ Sessie-opname gestopt op gevoelige route:', pathname);
    }
  }, [pathname]);

  useEffect(() => {
    const checkConsent = () => {
      const hasConsent = hasAnalyticsConsent();
      setShouldLoad(hasConsent);
      if (!hasConsent) logger.log('[Clarity] Blocked - Analytics consent required');
    };

    checkConsent();
    window.addEventListener('consentUpdated', checkConsent);
    return () => window.removeEventListener('consentUpdated', checkConsent);
  }, []);

  useEffect(() => {
    if (!clarityId) {
      if (process.env.NODE_ENV === 'development') {
        logger.log('[Clarity] No project ID configured. Add NEXT_PUBLIC_CLARITY_PROJECT_ID to .env');
      }
      return;
    }

    // Don't load in development unless explicitly enabled
    if (process.env.NODE_ENV === 'development' && !process.env.NEXT_PUBLIC_CLARITY_DEV_ENABLED) {
      logger.log('[Clarity] Disabled in development. Set NEXT_PUBLIC_CLARITY_DEV_ENABLED=true to enable.');
      return;
    }

    // Only load if consent is given
    if (!shouldLoad) {
      return;
    }

    // Prevent double initialization
    if (window.clarity) {
      logger.log('[Clarity] Already initialized');
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

    logger.log('[Clarity] ✅ Initialized with consent - Session recording active');
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
