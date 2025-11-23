"use client";

import { useUser } from '@/providers/user-provider';
import { useDeviceDetection } from '@/hooks/use-device-detection';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function HomePage() {
  return (
    <ClientSideRedirect>
      <SimpleLandingPage />
    </ClientSideRedirect>
  );
}

// Simple landing page to test if basic rendering works
function SimpleLandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welkom bij DatingAssistent
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Je persoonlijke AI dating coach voor betere relaties
          </p>
          <div className="space-x-4">
            <button className="bg-pink-500 hover:bg-pink-600 text-white px-8 py-3 rounded-lg font-semibold">
              Start Nu Gratis
            </button>
            <button className="border border-pink-500 text-pink-600 hover:bg-pink-50 px-8 py-3 rounded-lg font-semibold">
              Meer Informatie
            </button>
          </div>
        </div>

        <div className="mt-16 grid md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-3">AI Profiel Analyse</h3>
            <p className="text-gray-600">Krijg gedetailleerde feedback op je dating profielen</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-3">Chat Coaching</h3>
            <p className="text-gray-600">Persoonlijke begeleiding bij gesprekken</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-3">Date Planning</h3>
            <p className="text-gray-600">Hulp bij het organiseren van perfecte dates</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Client-side component to handle authenticated user redirects
function ClientSideRedirect({ children }: { children: React.ReactNode }) {
  const { user, loading } = useUser();
  const { isDesktop } = useDeviceDetection();
  const router = useRouter();

  useEffect(() => {
    // Only redirect authenticated users
    if (!loading && user) {
      if (isDesktop) {
        // Redirect desktop users to dashboard
        router.push('/dashboard');
      } else {
        // Mobile users get mobile dashboard
        router.push('/mobile-dashboard');
      }
    }
  }, [user, loading, isDesktop, router]);

  // Show landing page for everyone (including loading states)
  // Authenticated users will be redirected by the useEffect above
  return <>{children}</>;
}
