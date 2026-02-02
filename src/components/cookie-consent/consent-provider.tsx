'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

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

        // Check versie - als privacy policy is gewijzigd, vraag opnieuw toestemming
        if (parsed.version === CONSENT_VERSION) {
          setConsent({
            necessary: parsed.necessary,
            analytics: parsed.analytics,
            marketing: parsed.marketing,
          });
          setHasConsent(true);
        } else {
          // Oude versie, reset consent
          console.log('[Consent] Privacy policy updated, requesting new consent');
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

      console.log('[Consent] Updated:', preferences);
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
      console.log('[Consent] Reset');
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
