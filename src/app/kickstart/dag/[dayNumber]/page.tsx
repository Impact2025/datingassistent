'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Loader2, ArrowLeft, Home } from 'lucide-react';
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
        // Could trigger confetti or modal here
        console.log('Day complete!');
      }
    } catch (err) {
      console.error('Progress update error:', err);
      throw err;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-pink-500 mx-auto mb-4" />
          <p className="text-gray-600">Dag {dayNumber} laden...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error || 'Kon dag niet laden'}</p>
          <div className="flex gap-4 justify-center">
            <Button
              variant="outline"
              onClick={() => router.push('/kickstart')}
            >
              <Home className="w-4 h-4 mr-2" />
              Terug naar overzicht
            </Button>
            <Button onClick={() => window.location.reload()}>
              Probeer opnieuw
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/kickstart')}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Overzicht
            </Button>

            <div className="text-center">
              <p className="text-sm text-gray-500">
                Week {data.week.week_nummer} - {data.week.titel}
              </p>
            </div>

            <div className="w-24" /> {/* Spacer for alignment */}
          </div>
        </div>
      </div>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto px-4 py-8"
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
