'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, ArrowLeft, Home, Sparkles } from 'lucide-react';
import { TransformatieDashboardView } from '@/components/transformatie/TransformatieDashboardView';
import { BottomNavigation } from '@/components/layout/bottom-navigation';
import { Button } from '@/components/ui/button';

function TransformatieContent() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [enrolled, setEnrolled] = useState(false);

  useEffect(() => {
    async function checkEnrollment() {
      try {
        // Check enrollment status
        const response = await fetch('/api/transformatie/check-enrollment');
        if (response.ok) {
          const data = await response.json();

          if (data.isEnrolled) {
            setEnrolled(true);
          } else {
            // Not enrolled - redirect to sales page or dashboard
            router.push('/dashboard');
            return;
          }
        }
      } catch (err) {
        console.error('Error checking enrollment:', err);
      } finally {
        setLoading(false);
      }
    }

    checkEnrollment();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-pink-500" />
      </div>
    );
  }

  if (!enrolled) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white pb-24">
      {/* Header - Mobile Optimized */}
      <div className="bg-gradient-to-r from-pink-50 via-rose-50 to-amber-50 border-b border-pink-100 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Back to Dashboard */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/dashboard')}
                className="p-2 rounded-full hover:bg-white/50 md:hidden"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </Button>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center shadow-md">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-lg md:text-xl font-semibold text-gray-900">Transformatie</h1>
                  <p className="text-xs md:text-sm text-gray-500">12 modules • DESIGN → ACTION → SURRENDER</p>
                </div>
              </div>
            </div>
            {/* Desktop: Dashboard button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push('/dashboard')}
              className="hidden md:flex border-gray-200 text-gray-700 hover:bg-white"
            >
              <Home className="w-4 h-4 mr-2" />
              Dashboard
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content - TransformatieDashboardView with sidebar layout */}
      <div className="max-w-7xl mx-auto">
        <TransformatieDashboardView onBack={() => router.push('/dashboard')} />
      </div>

      {/* Bottom Navigation for Mobile */}
      <BottomNavigation />
    </div>
  );
}

export default function TransformatiePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-pink-500" />
      </div>
    }>
      <TransformatieContent />
    </Suspense>
  );
}
