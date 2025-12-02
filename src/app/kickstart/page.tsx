'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { WeekOverview, KickstartStats } from '@/components/kickstart/WeekOverview';
import type { KickstartOverview } from '@/types/kickstart.types';

export default function KickstartPage() {
  const router = useRouter();
  const [data, setData] = useState<KickstartOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
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
  }, []);

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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">De Kickstart</h1>
              <p className="text-sm text-gray-600">21 dagen naar dating succes</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
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
            <div className="grid grid-cols-3 gap-6">
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
      </div>
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
