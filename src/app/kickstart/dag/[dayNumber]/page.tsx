'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Loader2, ArrowLeft, Home, Sparkles, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DayViewer } from '@/components/kickstart/DayViewer';
import { BottomNavigation } from '@/components/layout/bottom-navigation';
import { StreakDisplay } from '@/components/kickstart/StreakDisplay';
import type {
  DayDetailResponse,
  UpdateDayProgressInput,
} from '@/types/kickstart.types';

interface PageProps {
  params: Promise<{ dayNumber: string }>;
}

export default function KickstartDayPage({ params }: PageProps) {
  const { dayNumber } = use(params);
  const router = useRouter();
  const [data, setData] = useState<DayDetailResponse & { hasAccess: boolean } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch(`/api/kickstart/day/${dayNumber}`);
        if (!response.ok) {
          throw new Error('Kon dag niet laden');
        }
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Er ging iets mis');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [dayNumber]);

  const handleNavigate = (newDayNumber: number) => {
    router.push(`/kickstart/dag/${newDayNumber}`);
  };

  const handleProgressUpdate = async (updateData: UpdateDayProgressInput) => {
    try {
      const response = await fetch('/api/kickstart/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        throw new Error('Kon voortgang niet opslaan');
      }

      const result = await response.json();

      // Update local state with new progress
      if (data) {
        setData({
          ...data,
          progress: result.progress,
        });
      }

      // If day is complete, maybe show a celebration
      if (result.isComplete) {
        console.log('Day complete!');
      }
    } catch (err) {
      console.error('Progress update error:', err);
      throw err;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-pink-25 to-white">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-pink-500 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Dag {dayNumber} laden...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-pink-25 to-white">
        <div className="text-center bg-white rounded-2xl shadow-lg p-8 max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">😕</span>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Oeps!</h2>
          <p className="text-gray-600 mb-6">{error || 'Kon dag niet laden'}</p>
          <div className="flex gap-3 justify-center">
            <Button
              variant="outline"
              onClick={() => router.push('/dashboard')}
              className="border-pink-200 text-pink-600"
            >
              <Home className="w-4 h-4 mr-2" />
              Dashboard
            </Button>
            <Button
              onClick={() => window.location.reload()}
              className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600"
            >
              Probeer opnieuw
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-pink-25 to-white pb-24 md:pb-0">
      {/* Professional Header - Mobile Optimized */}
      <div className="bg-white/95 backdrop-blur-sm border-b border-pink-100 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Back button - Mobile: to overview, Desktop: shows text */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/kickstart')}
              className="text-pink-600 hover:text-pink-700 hover:bg-pink-50 p-2 md:px-3"
            >
              <ChevronLeft className="w-5 h-5 md:w-4 md:h-4 md:mr-2" />
              <span className="hidden md:inline">Overzicht</span>
            </Button>

            {/* Center - Program info */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div className="text-center">
                <p className="text-xs text-pink-600 font-medium">Dag {dayNumber}</p>
                <p className="text-sm text-gray-600 hidden md:block">
                  Week {data.week.week_nummer} · {data.week.titel}
                </p>
              </div>
            </div>

            {/* Right - Dashboard link for desktop */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/dashboard')}
              className="text-gray-500 hover:text-gray-700 hover:bg-gray-50 hidden md:flex"
            >
              <Home className="w-4 h-4 mr-2" />
              Dashboard
            </Button>
            {/* Mobile spacer */}
            <div className="w-10 md:hidden" />
          </div>
        </div>
      </div>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-5xl mx-auto px-4 py-4 md:py-8 space-y-6"
      >
        {/* Streak - Compact view at top */}
        <StreakDisplay variant="compact" />

        <DayViewer
          day={data.day}
          progress={data.progress}
          hasAccess={data.hasAccess}
          navigation={data.navigation}
          onNavigate={handleNavigate}
          onProgressUpdate={handleProgressUpdate}
        />
      </motion.div>

      {/* Bottom Navigation for Mobile */}
      <BottomNavigation />
    </div>
  );
}
