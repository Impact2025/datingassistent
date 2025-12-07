'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Loader2, ArrowLeft, Home } from 'lucide-react';
import { WeekOverview, KickstartStats } from '@/components/kickstart/WeekOverview';
import { PostKickstartJourney } from '@/components/kickstart/PostKickstartJourney';
import { BottomNavigation } from '@/components/layout/bottom-navigation';
import { Button } from '@/components/ui/button';
import { StreakDisplay } from '@/components/kickstart/StreakDisplay';
import type { KickstartOverview } from '@/types/kickstart.types';

export default function KickstartPage() {
  const router = useRouter();
  const [data, setData] = useState<KickstartOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        // Check if onboarding is completed first
        const onboardingResponse = await fetch('/api/kickstart/onboarding');
        if (onboardingResponse.ok) {
          const onboardingData = await onboardingResponse.json();

          // If enrolled but onboarding not completed, redirect to onboarding
          if (!onboardingData.completed) {
            // Check if user is actually enrolled
            const enrolledResponse = await fetch('/api/user/enrolled-programs');
            if (enrolledResponse.ok) {
              const enrolledData = await enrolledResponse.json();
              const hasKickstart = enrolledData.programs?.some(
                (p: any) => p.program_slug === 'kickstart'
              );

              if (hasKickstart) {
                // User is enrolled but hasn't done onboarding - redirect
                router.push('/kickstart/onboarding');
                return;
              }
            }
          }
        }

        // Fetch overview data
        const response = await fetch('/api/kickstart');
        if (!response.ok) {
          throw new Error('Kon data niet laden');
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
  }, [router]);

  const handleDaySelect = (dayNumber: number) => {
    router.push(`/kickstart/dag/${dayNumber}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-pink-500" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error || 'Kon data niet laden'}</p>
          <button
            onClick={() => window.location.reload()}
            className="text-pink-500 underline"
          >
            Probeer opnieuw
          </button>
        </div>
      </div>
    );
  }

  // Get completed days
  const completedDays = data.weeks
    .flatMap((w) => w.days || [])
    .filter((d: any) => d.progress?.status === 'completed')
    .map((d) => d.dag_nummer);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-pink-25 to-white pb-24">
      {/* Header - Mobile Optimized */}
      <div className="bg-white/95 backdrop-blur-sm border-b border-pink-100 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Back to Dashboard */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/dashboard')}
                className="p-2 rounded-full hover:bg-pink-50 md:hidden"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </Button>
              <div>
                <h1 className="text-lg md:text-xl font-bold text-gray-900">De Kickstart</h1>
                <p className="text-xs md:text-sm text-gray-600">21 dagen naar dating succes</p>
              </div>
            </div>
            {/* Desktop: Dashboard button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push('/dashboard')}
              className="hidden md:flex border-pink-200 text-pink-600 hover:bg-pink-50"
            >
              <Home className="w-4 h-4 mr-2" />
              Dashboard
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-6 md:py-8 space-y-6 md:space-y-8">
        {/* Streak Display - Prominent */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <StreakDisplay variant="full" />
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <KickstartStats
            totalDays={data.progress.total_days}
            completedDays={data.progress.completed_days}
            currentDay={data.progress.current_day}
            currentWeek={data.progress.current_week}
          />
        </motion.div>

        {/* Week Overview */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Jouw 21-dagen reis</h2>
          <WeekOverview
            weeks={data.weeks}
            currentDay={data.progress.current_day}
            completedDays={completedDays}
            onDaySelect={handleDaySelect}
          />
        </div>

        {/* Metrics comparison (if available) */}
        {data.metrics.start && data.metrics.current && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl p-6 border"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-4">Jouw vooruitgang</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
              <MetricComparison
                label="Matches per week"
                before={data.metrics.start.matches_count || 0}
                after={data.metrics.current.matches_count || 0}
              />
              <MetricComparison
                label="Gesprekken"
                before={data.metrics.start.gesprekken_count || 0}
                after={data.metrics.current.gesprekken_count || 0}
              />
              <MetricComparison
                label="Dates"
                before={data.metrics.start.dates_count || 0}
                after={data.metrics.current.dates_count || 0}
              />
            </div>
          </motion.div>
        )}

        {/* Post-Kickstart Journey - shown when all 21 days are completed */}
        <PostKickstartJourney
          completedDays={completedDays.length}
          className="mt-8"
        />
      </div>

      {/* Bottom Navigation for Mobile */}
      <BottomNavigation />
    </div>
  );
}

interface MetricComparisonProps {
  label: string;
  before: number;
  after: number;
}

function MetricComparison({ label, before, after }: MetricComparisonProps) {
  const change = after - before;
  const percentChange = before > 0 ? Math.round((change / before) * 100) : 0;
  const isPositive = change > 0;

  return (
    <div className="text-center">
      <p className="text-sm text-gray-600 mb-2">{label}</p>
      <div className="flex items-center justify-center gap-4">
        <span className="text-gray-400 line-through">{before}</span>
        <span className="text-2xl font-bold text-gray-900">{after}</span>
      </div>
      {change !== 0 && (
        <p className={`text-sm mt-1 ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
          {isPositive ? '+' : ''}
          {change} ({isPositive ? '+' : ''}
          {percentChange}%)
        </p>
      )}
    </div>
  );
}
