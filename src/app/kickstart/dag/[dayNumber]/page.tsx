'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Loader2, ArrowLeft, Home, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DayViewer } from '@/components/kickstart/DayViewer';
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-white to-purple-50">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-pink-500 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Dag {dayNumber} laden...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-white to-purple-50">
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
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
      {/* Professional Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-pink-100 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Back button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/dashboard')}
              className="text-pink-600 hover:text-pink-700 hover:bg-pink-50"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Dashboard
            </Button>

            {/* Center - Program info */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div className="text-center">
                <p className="text-xs text-pink-600 font-medium">21 Dagen Kickstart</p>
                <p className="text-sm text-gray-600">
                  Week {data.week.week_nummer} · {data.week.titel}
                </p>
              </div>
            </div>

            {/* Right spacer or additional actions */}
            <div className="w-24" />
          </div>
        </div>
      </div>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-5xl mx-auto px-4 py-8"
      >
        <DayViewer
          day={data.day}
          progress={data.progress}
          hasAccess={data.hasAccess}
          navigation={data.navigation}
          onNavigate={handleNavigate}
          onProgressUpdate={handleProgressUpdate}
        />
      </motion.div>
    </div>
  );
}
