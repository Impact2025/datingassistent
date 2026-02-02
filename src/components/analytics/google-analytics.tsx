'use client';

/**
 * Google Analytics 4 - AVG Compliant
 *
 * Laadt ALLEEN met analytics consent
 * Verstuurt data naar Google servers
 */

import { useEffect, useState } from 'react';
import Script from 'next/script';
import { hasAnalyticsConsent } from '@/components/cookie-consent';

declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}

export function GoogleAnalytics() {
  const gaId = process.env.NEXT_PUBLIC_GA4_PROPERTY_ID || 'G-CLGV5SLPFW';
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    // Check initial consent
    const checkConsent = () => {
      const hasConsent = hasAnalyticsConsent();
      setShouldLoad(hasConsent);

      if (!hasConsent) {
        console.log('[GA4] Blocked - Analytics consent required');
      } else {
        console.log('[GA4] ✅ Loading with consent');
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

  // Don't render scripts without consent
  if (!shouldLoad) {
    return null;
  }

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
              page_path: window.location.pathname,
              custom_map: {
                dimension1: 'metric_id',
                metric1: 'metric_value',
                metric2: 'metric_delta'
              }
            });
            console.log('[GA4] Tracking initialized');
          `,
        }}
      />
    </>
  );
}
