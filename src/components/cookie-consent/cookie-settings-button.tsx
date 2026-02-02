'use client';

import { useState } from 'react';
import { Cookie, Settings } from 'lucide-react';
import { useConsent } from './consent-provider';

/**
 * Floating Cookie Settings Button
 *
 * Wordt alleen getoond als gebruiker al een keuze heeft gemaakt
 * Opent de cookie banner opnieuw om voorkeuren aan te passen
 */

export function CookieSettingsButton() {
  const { resetConsent, hasConsent } = useConsent();
  const [isVisible, setIsVisible] = useState(false);

  // Toon knop alleen als gebruiker al toestemming heeft gegeven
  if (!hasConsent) {
    return null;
  }

  return (
    <>
      {/* Floating button - rechtsonder */}
      <button
        onClick={() => resetConsent()}
        className="fixed bottom-4 left-4 z-50 bg-gray-800 dark:bg-gray-700 text-white rounded-full p-3 shadow-lg hover:bg-gray-700 dark:hover:bg-gray-600 transition-all hover:scale-110 group"
        aria-label="Cookie instellingen"
        title="Cookie voorkeuren wijzigen"
      >
        <Cookie className="w-5 h-5" />

        {/* Tooltip */}
        <span className="absolute left-full ml-2 top-1/2 -translate-y-1/2 bg-gray-900 text-white text-xs px-3 py-2 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          Cookie voorkeuren
        </span>
      </button>
    </>
  );
}
