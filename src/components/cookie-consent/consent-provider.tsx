'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { logger } from '@/lib/logger';

/**
 * Consent Provider - Beheert cookie toestemmingen
 *
 * Opslag: localStorage key 'cookie-consent'
 * Format: { necessary: true, analytics: boolean, marketing: boolean, timestamp: number }
 */

interface ConsentPreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
}

interface ConsentContextType {
  consent: ConsentPreferences;
  hasConsent: boolean;
  updateConsent: (preferences: ConsentPreferences) => void;
  resetConsent: () => void;
}

const ConsentContext = createContext<ConsentContextType | undefined>(undefined);

const CONSENT_STORAGE_KEY = 'cookie-consent';
const CONSENT_VERSION = '1.0'; // Verhoog dit als je privacy policy wijzigt
const CONSENT_MAX_AGE_MS = 13 * 30 * 24 * 60 * 60 * 1000; // 13 maanden (EDPB-richtlijn)

interface StoredConsent extends ConsentPreferences {
  timestamp: number;
  version: string;
}

export function ConsentProvider({ children }: { children: ReactNode }) {
  const [consent, setConsent] = useState<ConsentPreferences>({
    necessary: true,
    analytics: false,
    marketing: false,
  });
  const [hasConsent, setHasConsent] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // Client-side hydration
  useEffect(() => {
    setIsClient(true);
    loadConsent();
  }, []);

  const loadConsent = () => {
    try {
      const stored = localStorage.getItem(CONSENT_STORAGE_KEY);
      if (stored) {
        const parsed: StoredConsent = JSON.parse(stored);

        // Check versie én houdbaarheid (max 13 maanden per EDPB-richtlijn)
        const isExpired = Date.now() - (parsed.timestamp || 0) > CONSENT_MAX_AGE_MS;
        if (parsed.version === CONSENT_VERSION && !isExpired) {
          setConsent({
            necessary: parsed.necessary,
            analytics: parsed.analytics,
            marketing: parsed.marketing,
          });
          setHasConsent(true);
        } else {
          // Verlopen of verouderde versie — opnieuw toestemming vragen
          localStorage.removeItem(CONSENT_STORAGE_KEY);
          logger.log('[Consent] Consent expired or policy updated, requesting new consent');
          setHasConsent(false);
        }
      }
    } catch (error) {
      console.error('[Consent] Error loading consent:', error);
    }
  };

  const updateConsent = (preferences: ConsentPreferences) => {
    const stored: StoredConsent = {
      ...preferences,
      necessary: true, // Altijd true
      timestamp: Date.now(),
      version: CONSENT_VERSION,
    };

    try {
      localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(stored));
      setConsent(preferences);
      setHasConsent(true);

      // Trigger custom event zodat tracking scripts kunnen reageren
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('consentUpdated', {
          detail: preferences
        }));
      }

      logger.log('[Consent] Updated:', preferences);
    } catch (error) {
      console.error('[Consent] Error saving consent:', error);
    }
  };

  const resetConsent = () => {
    try {
      localStorage.removeItem(CONSENT_STORAGE_KEY);
      setConsent({
        necessary: true,
        analytics: false,
        marketing: false,
      });
      setHasConsent(false);
      logger.log('[Consent] Reset');
    } catch (error) {
      console.error('[Consent] Error resetting consent:', error);
    }
  };

  // Always render provider, even during SSR
  // The isClient check prevents localStorage access during SSR,
  // but the provider itself should always be present
  return (
    <ConsentContext.Provider value={{ consent, hasConsent, updateConsent, resetConsent }}>
      {children}
    </ConsentContext.Provider>
  );
}

export function useConsent() {
  const context = useContext(ConsentContext);
  if (!context) {
    throw new Error('useConsent must be used within ConsentProvider');
  }
  return context;
}

/**
 * Helper functies voor gebruik in tracking scripts
 */
export function hasAnalyticsConsent(): boolean {
  if (typeof window === 'undefined') return false;

  try {
    const stored = localStorage.getItem(CONSENT_STORAGE_KEY);
    if (!stored) return false;

    const parsed: StoredConsent = JSON.parse(stored);
    return parsed.analytics === true && parsed.version === CONSENT_VERSION;
  } catch {
    return false;
  }
}

export function hasMarketingConsent(): boolean {
  if (typeof window === 'undefined') return false;

  try {
    const stored = localStorage.getItem(CONSENT_STORAGE_KEY);
    if (!stored) return false;

    const parsed: StoredConsent = JSON.parse(stored);
    return parsed.marketing === true && parsed.version === CONSENT_VERSION;
  } catch {
    return false;
  }
}
