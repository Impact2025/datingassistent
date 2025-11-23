"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/providers/user-provider';
import { useDeviceDetection } from '@/hooks/use-device-detection';
import { MobileDashboard } from '@/components/mobile/mobile-dashboard';
import { LoadingSpinner } from '@/components/shared/loading-spinner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LogIn, UserPlus, Monitor, Smartphone } from 'lucide-react';

export default function HomePage() {
  const { user, loading } = useUser();
  const { isMobile, isTablet, isDesktop } = useDeviceDetection();
  const router = useRouter();
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const [deviceDetected, setDeviceDetected] = useState(false);

  useEffect(() => {
    // Wait for device detection
    const timer = setTimeout(() => setDeviceDetected(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Handle routing based on device type for authenticated users
    if (!loading && user && deviceDetected) {
      if (isDesktop) {
        // Redirect desktop users to the main dashboard
        console.log('🖥️ Desktop user detected, redirecting to main dashboard');
        router.push('/dashboard');
        return;
      }
      // Mobile/tablet users stay on this page for mobile dashboard
    }

    // Show auth prompt after a brief delay if user is not logged in
    if (!loading && !user && deviceDetected) {
      const timer = setTimeout(() => setShowAuthPrompt(true), 1000);
      return () => clearTimeout(timer);
    }
  }, [loading, user, deviceDetected, isDesktop, router]);

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-white to-purple-50">
        <div className="text-center space-y-4">
          <LoadingSpinner />
          <p className="text-gray-600">Dashboard laden...</p>
        </div>
      </div>
    );
  }

  // Show authentication prompt for non-logged-in users
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full shadow-lg border-0 bg-white/95 backdrop-blur-sm">
          <CardHeader className="text-center pb-4">
            <div className="w-20 h-20 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              {isMobile ? <Smartphone className="w-10 h-10 text-white" /> : <Monitor className="w-10 h-10 text-white" />}
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Welkom bij DatingAssistent
            </CardTitle>
            <p className="text-gray-600 mt-2">
              {isMobile
                ? "Meld je aan voor je persoonlijke AI dating coach op je telefoon"
                : "Meld je aan om toegang te krijgen tot je persoonlijke AI dating coach"
              }
            </p>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-pink-50 rounded-lg">
                <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
                <span className="text-sm text-gray-700">Persoonlijke AI aanbevelingen</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span className="text-sm text-gray-700">Profiel optimalisatie tools</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-sm text-gray-700">Chat coaching & date planning</span>
              </div>
            </div>

            {isDesktop && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800 text-center">
                  💡 <strong>Desktop gebruikers:</strong> Gebruik je telefoon voor de beste ervaring met onze mobiele app!
                </p>
              </div>
            )}

            <div className="space-y-3 pt-4">
              <Button
                onClick={() => router.push('/login')}
                className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white font-semibold py-3"
                size="lg"
              >
                <LogIn className="w-5 h-5 mr-2" />
                Inloggen
              </Button>

              <Button
                onClick={() => router.push('/register')}
                variant="outline"
                className="w-full border-pink-200 text-pink-700 hover:bg-pink-50"
                size="lg"
              >
                <UserPlus className="w-5 h-5 mr-2" />
                Account aanmaken
              </Button>
            </div>

            <div className="text-center pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-500">
                Gratis proberen • 7 dagen volledige toegang
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Handle device-specific routing for authenticated users
  if (deviceDetected) {
    if (isDesktop) {
      // Desktop users get redirected to main dashboard
      return (
        <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 flex items-center justify-center p-4">
          <Card className="max-w-md w-full shadow-lg border-0 bg-white/95 backdrop-blur-sm">
            <CardHeader className="text-center pb-4">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Monitor className="w-10 h-10 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900">
                Desktop Dashboard
              </CardTitle>
              <p className="text-gray-600 mt-2">
                Je wordt doorgestuurd naar het volledige desktop dashboard...
              </p>
            </CardHeader>
            <CardContent className="text-center">
              <LoadingSpinner />
              <p className="text-sm text-gray-500 mt-2">Bezig met doorsturen...</p>
            </CardContent>
          </Card>
        </div>
      );
    }
  }

  // User is authenticated, show the mobile dashboard
  return <MobileDashboard />;
}
