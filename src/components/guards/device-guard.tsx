/**
 * DEVICE GUARD COMPONENT
 * Prevents incorrect device access to dashboards
 * Created: 2025-11-23
 *
 * This provides client-side protection (defense in depth)
 * Server-side protection is done in middleware
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDeviceDetection } from '@/hooks/use-device-detection';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Monitor, Smartphone, AlertCircle, RefreshCw } from 'lucide-react';
import { LoadingSpinner } from '@/components/shared/loading-spinner';

export interface DeviceGuardProps {
  requiredDevice: 'mobile' | 'desktop';
  children: React.ReactNode;
  allowOverride?: boolean; // Allow user to continue anyway
  allowMobileTabs?: boolean; // Allow mobile access to specific dashboard tabs
}

/**
 * DeviceGuard - Protects routes based on device type
 *
 * @param requiredDevice - 'mobile' or 'desktop'
 * @param children - Content to show if device matches
 * @param allowOverride - Allow user to bypass and continue anyway
 */
export function DeviceGuard({
  requiredDevice,
  children,
  allowOverride = false,
  allowMobileTabs = false
}: DeviceGuardProps) {
  const router = useRouter();
  const { isMobile, isTablet, isDesktop, screenWidth } = useDeviceDetection();
  const [showOverride, setShowOverride] = useState(false);
  const [overrideAccepted, setOverrideAccepted] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  // Device preference from localStorage
  const [devicePreference, setDevicePreference] = useState<string | null>(null);

  useEffect(() => {
    // Check for device preference
    const pref = localStorage.getItem('device-preference');
    setDevicePreference(pref);

    // Wait for device detection to stabilize
    const timer = setTimeout(() => {
      setIsChecking(false);
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  // Check if current device matches required device
  const deviceMatches = (): boolean => {
    // If user has overridden, allow access
    if (overrideAccepted) return true;

    // Check preference first
    if (devicePreference === requiredDevice) return true;

    // Allow mobile access to specific dashboard tabs if allowMobileTabs is enabled
    if (allowMobileTabs && requiredDevice === 'desktop' && isMobile) {
      const urlParams = new URLSearchParams(window.location.search);
      const tab = urlParams.get('tab');
      // Allow mobile access to these specific tabs
      const allowedMobileTabs = ['subscription', 'data-management', 'chat-coach'];
      if (tab && allowedMobileTabs.includes(tab)) {
        return true;
      }
    }

    // Check actual device
    if (requiredDevice === 'mobile') {
      return isMobile;
    } else {
      // Desktop requirement: allow both desktop and tablet
      return isDesktop || isTablet;
    }
  };

  const matches = deviceMatches();

  // Redirect to correct dashboard if device doesn't match
  useEffect(() => {
    if (isChecking) return;
    if (matches) return;
    if (showOverride && allowOverride) return;

    // Auto-redirect after 2 seconds
    const timer = setTimeout(() => {
      const redirectPath = requiredDevice === 'mobile' ? '/dashboard' : '/mobile-dashboard';
      router.push(redirectPath);
    }, 2000);

    return () => clearTimeout(timer);
  }, [isChecking, matches, showOverride, allowOverride, requiredDevice, router]);

  // Still checking device
  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-white to-purple-50">
        <div className="text-center space-y-4">
          <LoadingSpinner />
          <p className="text-gray-600">Apparaat detecteren...</p>
        </div>
      </div>
    );
  }

  // Device matches - show content
  if (matches) {
    return <>{children}</>;
  }

  // Device doesn't match - show mismatch screen
  const currentDevice = isMobile ? 'mobiel' : isTablet ? 'tablet' : 'desktop';
  const expectedDevice = requiredDevice === 'mobile' ? 'mobiel' : 'desktop';
  const redirectPath = requiredDevice === 'mobile' ? '/dashboard' : '/mobile-dashboard';
  const redirectLabel = requiredDevice === 'mobile' ? 'Desktop Dashboard' : 'Mobiel Dashboard';

  const Icon = requiredDevice === 'mobile' ? Smartphone : Monitor;

  const handleOverride = () => {
    // Save preference
    localStorage.setItem('device-preference', requiredDevice);
    setDevicePreference(requiredDevice);
    setOverrideAccepted(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-white to-purple-50 p-4">
      <Card className="max-w-lg w-full shadow-xl border-0 bg-white/95 backdrop-blur-sm">
        <CardHeader className="text-center pb-4">
          <div className="w-20 h-20 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-10 h-10 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Verkeerd Apparaat Gedetecteerd
          </CardTitle>
          <p className="text-gray-600 mt-2">
            Deze pagina is geoptimaliseerd voor {expectedDevice} apparaten
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
            <div className="flex items-center gap-2 text-blue-900 font-medium">
              <Icon className="w-5 h-5" />
              <span>Huidige apparaat: {currentDevice}</span>
            </div>
            <div className="text-sm text-blue-700">
              Schermgrootte: {screenWidth}px
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-sm text-gray-600 text-center">
              Je wordt automatisch doorgestuurd naar het juiste dashboard...
            </p>

            <Button
              onClick={() => router.push(redirectPath)}
              className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
              size="lg"
            >
              <RefreshCw className="w-5 h-5 mr-2" />
              Ga naar {redirectLabel}
            </Button>

            {allowOverride && !showOverride && (
              <Button
                onClick={() => setShowOverride(true)}
                variant="outline"
                className="w-full"
                size="sm"
              >
                Toch doorgaan op dit apparaat
              </Button>
            )}

            {showOverride && allowOverride && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 space-y-3">
                <p className="text-sm text-yellow-900">
                  ⚠️ De ervaring is mogelijk niet geoptimaliseerd voor jouw apparaat.
                  Weet je zeker dat je wilt doorgaan?
                </p>
                <div className="flex gap-2">
                  <Button
                    onClick={handleOverride}
                    variant="outline"
                    className="flex-1"
                    size="sm"
                  >
                    Ja, doorgaan
                  </Button>
                  <Button
                    onClick={() => setShowOverride(false)}
                    variant="ghost"
                    className="flex-1"
                    size="sm"
                  >
                    Annuleren
                  </Button>
                </div>
              </div>
            )}
          </div>

          <div className="text-center pt-4 border-t">
            <p className="text-xs text-gray-500">
              Tip: Gebruik altijd het dashboard dat past bij jouw apparaat voor de beste ervaring
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
