'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X, Cookie } from 'lucide-react';

export function CookieConsentBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    // Check if user has already made a choice
    const consent = localStorage.getItem('cookie_consent');
    if (!consent) {
      // Show banner after a short delay
      const timer = setTimeout(() => setIsVisible(true), 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const acceptAllCookies = () => {
    localStorage.setItem('cookie_consent', 'accepted');
    localStorage.setItem('cookie_analytics', 'true');
    localStorage.setItem('cookie_marketing', 'true');
    setIsVisible(false);
  };

  const acceptEssentialOnly = () => {
    localStorage.setItem('cookie_consent', 'essential-only');
    localStorage.setItem('cookie_analytics', 'false');
    localStorage.setItem('cookie_marketing', 'false');
    setIsVisible(false);
  };

  const saveSettings = () => {
    const analytics = (document.getElementById('analytics-cookies') as HTMLInputElement)?.checked || false;
    const marketing = (document.getElementById('marketing-cookies') as HTMLInputElement)?.checked || false;

    localStorage.setItem('cookie_consent', 'custom');
    localStorage.setItem('cookie_analytics', analytics.toString());
    localStorage.setItem('cookie_marketing', marketing.toString());
    setIsVisible(false);
    setShowSettings(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg">
      <div className="max-w-6xl mx-auto p-4">
        {!showSettings ? (
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
            <div className="flex items-center gap-3 flex-1">
              <Cookie className="w-6 h-6 text-blue-600 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">
                  Cookies voor een betere ervaring
                </h3>
                <p className="text-sm text-gray-600">
                  Wij gebruiken cookies om onze website te verbeteren en je een gepersonaliseerde ervaring te bieden.
                  <a href="/cookies" className="text-blue-600 hover:underline ml-1">
                    Meer informatie
                  </a>
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSettings(true)}
                className="text-sm"
              >
                Voorkeuren aanpassen
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={acceptEssentialOnly}
                className="text-sm"
              >
                Alleen essentiële
              </Button>
              <Button
                size="sm"
                onClick={acceptAllCookies}
                className="text-sm bg-pink-500 hover:bg-pink-600"
              >
                Alles accepteren
              </Button>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsVisible(false)}
              className="absolute top-2 right-2 md:relative md:top-auto md:right-auto"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Cookie Voorkeuren</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSettings(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900">Essentiële Cookies</h4>
                  <p className="text-sm text-gray-600">Noodzakelijk voor de basisfunctionaliteit van de website</p>
                </div>
                <div className="text-sm font-medium text-green-600">Altijd actief</div>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900">Analytische Cookies</h4>
                  <p className="text-sm text-gray-600">Helpen ons te begrijpen hoe bezoekers de website gebruiken</p>
                </div>
                <input
                  id="analytics-cookies"
                  type="checkbox"
                  defaultChecked={false}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900">Marketing Cookies</h4>
                  <p className="text-sm text-gray-600">Gebruikt voor gepersonaliseerde advertenties en retargeting</p>
                </div>
                <input
                  id="marketing-cookies"
                  type="checkbox"
                  defaultChecked={false}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={() => setShowSettings(false)}>
                Annuleren
              </Button>
              <Button onClick={saveSettings} className="bg-pink-500 hover:bg-pink-600">
                Voorkeuren opslaan
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
