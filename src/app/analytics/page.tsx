'use client';

/**
 * Analytics Page
 * Sprint 5: Analytics & Personalization
 */

import { UserAnalyticsDashboard } from '@/components/analytics/user-analytics-dashboard';
import { ProgressInsightsDashboard } from '@/components/insights/progress-insights-dashboard';
import { Card, CardContent } from '@/components/ui/card';
import { BarChart3 } from 'lucide-react';

export default function AnalyticsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 to-pink-600 flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Jouw Analytics
              </h1>
              <p className="text-sm sm:text-base text-gray-600">
                Inzicht in je leerprogressie en prestaties
              </p>
            </div>
          </div>
        </div>

        {/* Analytics Dashboard */}
        <UserAnalyticsDashboard />

        {/* Progress Insights Dashboard - Sprint 5.3 */}
        <div className="mt-8">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
            Progress Insights & Voorspellingen
          </h2>
          <ProgressInsightsDashboard />
        </div>

        {/* Info Card */}
        <Card className="mt-6 bg-blue-50 border-blue-200">
          <CardContent className="p-4 sm:p-6">
            <p className="text-sm text-blue-900">
              <strong>💡 Tip:</strong> Analytics worden elke 24 uur bijgewerkt.
              Je progress tracking gebeurt real-time, maar sommige statistieken kunnen een kleine vertraging hebben.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
