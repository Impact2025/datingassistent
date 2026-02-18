'use client';

/**
 * Google Analytics 4 - Consent Mode v2 (AVG Compliant)
 *
 * De GA tag laadt ALTIJD, maar werkt in 'denied' modus totdat
 * de gebruiker toestemming geeft. Dit is de Google-aanbevolen
 * aanpak voor AVG-compliance in de EU.
 *
 * - Zonder consent: geen cookies, geen persoonlijke data, wel modelering
 * - Met consent: volledige tracking
 */

import { useEffect } from 'react';
import Script from 'next/script';
import { hasAnalyticsConsent, hasMarketingConsent } from '@/components/cookie-consent';

declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}

function applyConsent(analytics: boolean, marketing: boolean) {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') return;

  window.gtag('consent', 'update', {
    analytics_storage: analytics ? 'granted' : 'denied',
    ad_storage: marketing ? 'granted' : 'denied',
    ad_user_data: marketing ? 'granted' : 'denied',
    ad_personalization: marketing ? 'granted' : 'denied',
  });

  console.log('[GA4] Consent updated:', { analytics, marketing });
}

export function GoogleAnalytics() {
  const gaId = process.env.NEXT_PUBLIC_GA4_PROPERTY_ID || 'G-CLGV5SLPFW';

  useEffect(() => {
    // Pas direct de bestaande consent toe (als gebruiker al eerder keuze maakte)
    applyConsent(hasAnalyticsConsent(), hasMarketingConsent());

    // Luister naar toekomstige consent-wijzigingen
    const handleConsentUpdate = (e: Event) => {
      const detail = (e as CustomEvent<{ analytics?: boolean; marketing?: boolean }>).detail ?? {};
      applyConsent(detail.analytics ?? false, detail.marketing ?? false);
    };

    window.addEventListener('consentUpdated', handleConsentUpdate);
    return () => window.removeEventListener('consentUpdated', handleConsentUpdate);
  }, []);

  // GA scripts laden altijd - consent wordt via gtag('consent', 'update') beheerd
  return (
    <>
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
      />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${gaId}', {
              page_path: window.location.pathname
            });
          `,
        }}
      />
    </>
  );
}
