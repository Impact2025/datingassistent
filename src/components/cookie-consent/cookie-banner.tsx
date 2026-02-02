'use client';

import { useState, useEffect } from 'react';
import { useConsent } from './consent-provider';
import { X, Cookie, Shield, BarChart, AlertCircle } from 'lucide-react';

/**
 * AVG-Compliant Cookie Consent Banner (Nederlands)
 *
 * Voldoet aan:
 * - AVG (GDPR)
 * - ePrivacy Directive
 * - Cookiewet Nederland
 *
 * Functionaliteit:
 * - Blokkeert tracking scripts tot toestemming
 * - Granulaire controle (noodzakelijk, analytics, marketing)
 * - Opslag van voorkeuren in localStorage
 * - Opt-in vereist (geen pre-checked boxes)
 */

export function CookieBanner() {
  const { consent, updateConsent, hasConsent } = useConsent();
  const [showBanner, setShowBanner] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [preferences, setPreferences] = useState({
    necessary: true, // Altijd true, niet uitzetbaar
    analytics: false,
    marketing: false,
  });

  useEffect(() => {
    // Toon banner alleen als gebruiker nog geen keuze heeft gemaakt
    if (!hasConsent) {
      setShowBanner(true);
    }
  }, [hasConsent]);

  const handleAcceptAll = () => {
    updateConsent({
      necessary: true,
      analytics: true,
      marketing: true,
    });
    setShowBanner(false);
  };

  const handleAcceptNecessary = () => {
    updateConsent({
      necessary: true,
      analytics: false,
      marketing: false,
    });
    setShowBanner(false);
  };

  const handleSavePreferences = () => {
    updateConsent(preferences);
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center pointer-events-none">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50 pointer-events-auto" />

      {/* Banner */}
      <div className="relative w-full max-w-4xl mx-4 mb-4 bg-white dark:bg-gray-900 rounded-lg shadow-2xl pointer-events-auto overflow-hidden">
        {/* Header */}
        <div className="bg-primary/10 dark:bg-primary/20 px-6 py-4 flex items-center justify-between border-b border-primary/20">
          <div className="flex items-center gap-3">
            <Cookie className="w-6 h-6 text-primary" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              🍪 Cookie Voorkeuren
            </h2>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {!showDetails ? (
            // Simpele weergave
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-gray-700 dark:text-gray-300 text-base leading-relaxed">
                    Wij gebruiken cookies en tracking technologieën om je ervaring te verbeteren en onze diensten te analyseren.
                    Dit omvat <strong>sessie-opnames, gedragsanalyse en marketing tracking</strong>.
                  </p>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mt-2">
                    Je kunt je voorkeuren altijd wijzigen. Alleen noodzakelijke cookies zijn vereist voor de werking van de site.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowDetails(true)}
                className="text-primary hover:underline text-sm font-medium"
              >
                → Meer informatie en instellingen
              </button>
            </div>
          ) : (
            // Gedetailleerde weergave met toggles
            <div className="space-y-6">
              <button
                onClick={() => setShowDetails(false)}
                className="text-primary hover:underline text-sm font-medium mb-2"
              >
                ← Terug naar simpele weergave
              </button>

              {/* Noodzakelijke cookies */}
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-green-600" />
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      Noodzakelijke Cookies
                    </h3>
                  </div>
                  <div className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-xs font-medium">
                    Altijd actief
                  </div>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  Deze cookies zijn essentieel voor de werking van de website. Ze maken functies mogelijk zoals inloggen,
                  winkelwagentjes en beveiligde verbindingen. Deze kunnen niet worden uitgeschakeld.
                </p>
                <details className="mt-2">
                  <summary className="text-xs text-gray-500 cursor-pointer hover:text-primary">
                    Technische details
                  </summary>
                  <ul className="text-xs text-gray-500 mt-2 ml-4 list-disc">
                    <li>Sessie cookies (authenticatie)</li>
                    <li>Thema voorkeuren (dark/light mode)</li>
                    <li>Cookie consent voorkeuren</li>
                  </ul>
                </details>
              </div>

              {/* Analytics cookies */}
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <BarChart className="w-5 h-5 text-blue-600" />
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      Analytics & Prestatie Cookies
                    </h3>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.analytics}
                      onChange={(e) => setPreferences({ ...preferences, analytics: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-300 dark:bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-2">
                  Deze cookies helpen ons begrijpen hoe bezoekers onze website gebruiken door informatie anoniem te verzamelen en te rapporteren.
                </p>
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded p-3 mb-2">
                  <p className="text-xs text-yellow-800 dark:text-yellow-300 font-medium mb-1">
                    ⚠️ Let op: Bevat sessie-opnames
                  </p>
                  <p className="text-xs text-yellow-700 dark:text-yellow-400">
                    Door analytics te accepteren, geef je toestemming voor sessie-opnames via Microsoft Clarity.
                    Dit betekent dat je scherm, muisbewegingen en clicks worden opgenomen voor analysedoeleinden.
                  </p>
                </div>
                <details className="mt-2">
                  <summary className="text-xs text-gray-500 cursor-pointer hover:text-primary">
                    Welke diensten gebruiken we?
                  </summary>
                  <ul className="text-xs text-gray-500 mt-2 ml-4 list-disc space-y-1">
                    <li><strong>Google Analytics 4</strong> - Bezoekersgedrag en pagina statistieken</li>
                    <li><strong>Microsoft Clarity</strong> - Heatmaps en sessie-opnames (⚠️ neemt je scherm op)</li>
                    <li><strong>Sentry</strong> - Error tracking en performance monitoring</li>
                    <li><strong>Vercel Analytics</strong> - Website prestatie metingen</li>
                  </ul>
                </details>
              </div>

              {/* Marketing cookies */}
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Cookie className="w-5 h-5 text-purple-600" />
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      Marketing & Personalisatie Cookies
                    </h3>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.marketing}
                      onChange={(e) => setPreferences({ ...preferences, marketing: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-300 dark:bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  Deze cookies worden gebruikt om advertenties relevanter te maken voor jou en je interesses.
                  Ze kunnen ook worden gebruikt om het aantal keren dat je een advertentie ziet te beperken.
                </p>
                <details className="mt-2">
                  <summary className="text-xs text-gray-500 cursor-pointer hover:text-primary">
                    Technische details
                  </summary>
                  <ul className="text-xs text-gray-500 mt-2 ml-4 list-disc">
                    <li>Lead scoring en gedragsprofilering</li>
                    <li>Conversie tracking (OTO aanbiedingen)</li>
                    <li>Remarketing pixels</li>
                    <li>A/B testing personalisatie</li>
                  </ul>
                </details>
              </div>
            </div>
          )}
        </div>

        {/* Footer met buttons */}
        <div className="bg-gray-50 dark:bg-gray-800 px-6 py-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
            <a
              href="/privacy"
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary hover:underline"
              target="_blank"
            >
              Lees ons privacybeleid →
            </a>

            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={handleAcceptNecessary}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition font-medium text-sm"
              >
                Alleen noodzakelijke
              </button>

              {showDetails && (
                <button
                  onClick={handleSavePreferences}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition font-medium text-sm"
                >
                  Voorkeuren opslaan
                </button>
              )}

              <button
                onClick={handleAcceptAll}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition font-medium text-sm"
              >
                Alles accepteren
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
