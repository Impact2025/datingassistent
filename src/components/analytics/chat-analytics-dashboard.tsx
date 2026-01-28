'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { TrendingUp, TrendingDown, MousePointerClick, X, Eye, BarChart3 } from 'lucide-react';
import { getConversionRate } from '@/lib/analytics/chat-analytics';

interface AnalyticsSummary {
  shown: number;
  accepted: number;
  dismissed: number;
  conversionRate: number;
  totalEvents: number;
}

interface AnalyticsData {
  summary: AnalyticsSummary;
  events: any[];
  dateRange: {
    start: string;
    end: string;
    days: number;
  };
}

export function ChatAnalyticsDashboard() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(7);

  useEffect(() => {
    fetchAnalytics();
  }, [days]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/analytics/chat?days=${days}`);
      const data = await response.json();
      setAnalyticsData(data);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get client-side conversion rate from localStorage
  const clientMetrics = getConversionRate();

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Chat Widget Analytics</CardTitle>
          <CardDescription>Loading analytics data...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-coral-500"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const summary = analyticsData?.summary || {
    shown: 0,
    accepted: 0,
    dismissed: 0,
    conversionRate: 0,
    totalEvents: 0
  };

  const dismissalRate = summary.shown > 0
    ? ((summary.dismissed / summary.shown) * 100).toFixed(2)
    : '0.00';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Chat Widget Analytics</h2>
          <p className="text-sm text-gray-500 mt-1">
            Proactive invite performance metrics
          </p>
        </div>

        {/* Time range selector */}
        <div className="flex gap-2">
          {[7, 14, 30, 90].map((d) => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                days === d
                  ? 'bg-coral-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {d} dagen
            </button>
          ))}
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Invites Shown */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600">
                Invites Getoond
              </CardTitle>
              <Eye className="w-5 h-5 text-blue-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">
              {summary.shown}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Totaal aantal keer getoond
            </p>
          </CardContent>
        </Card>

        {/* Invites Accepted */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600">
                Geaccepteerd
              </CardTitle>
              <MousePointerClick className="w-5 h-5 text-green-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {summary.accepted}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Gebruikers openden chat
            </p>
          </CardContent>
        </Card>

        {/* Invites Dismissed */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600">
                Afgewezen
              </CardTitle>
              <X className="w-5 h-5 text-red-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">
              {summary.dismissed}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {dismissalRate}% dismissal rate
            </p>
          </CardContent>
        </Card>

        {/* Conversion Rate */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600">
                Conversie Rate
              </CardTitle>
              {summary.conversionRate >= 20 ? (
                <TrendingUp className="w-5 h-5 text-green-500" />
              ) : (
                <TrendingDown className="w-5 h-5 text-orange-500" />
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-coral-600">
              {summary.conversionRate.toFixed(1)}%
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {summary.conversionRate >= 20 ? 'Uitstekend!' : 'Kan beter'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Client-side metrics (localStorage) */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Client-side Metrics (Deze Sessie)</CardTitle>
          <CardDescription>
            Lokaal opgeslagen statistieken (localStorage)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="text-sm text-gray-600">Getoond</div>
              <div className="text-2xl font-bold text-gray-900">{clientMetrics.shown}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Geaccepteerd</div>
              <div className="text-2xl font-bold text-green-600">{clientMetrics.accepted}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Afgewezen</div>
              <div className="text-2xl font-bold text-red-600">{clientMetrics.dismissed}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Conversie</div>
              <div className="text-2xl font-bold text-coral-600">
                {clientMetrics.conversionRate.toFixed(1)}%
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Insights & Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-coral-500" />
            Inzichten & Aanbevelingen
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {summary.conversionRate >= 25 && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-800">
                  ✅ <strong>Uitstekende conversie!</strong> Je proactive invites presteren goed.
                  Overweeg om de delay aan te passen voor A/B testing.
                </p>
              </div>
            )}

            {summary.conversionRate < 25 && summary.conversionRate >= 15 && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  ℹ️ <strong>Gemiddelde conversie.</strong> Experimenteer met verschillende messages
                  of timing om de conversie te verbeteren.
                </p>
              </div>
            )}

            {summary.conversionRate < 15 && summary.shown > 10 && (
              <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <p className="text-sm text-orange-800">
                  ⚠️ <strong>Lage conversie.</strong> Overweeg om:
                  • De proactiveMessage aan te passen naar een meer persoonlijke boodschap
                  • De timing te optimaliseren (test 15s, 20s, 30s)
                  • A/B test verschillende varianten
                </p>
              </div>
            )}

            {parseFloat(dismissalRate) > 60 && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800">
                  🚨 <strong>Hoge dismissal rate!</strong> De meeste bezoekers sluiten de invite direct.
                  Overweeg om minder opdringerig te zijn of de timing aan te passen.
                </p>
              </div>
            )}

            {summary.shown === 0 && (
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                <p className="text-sm text-gray-700">
                  📊 Nog geen data beschikbaar. De proactive invites zijn nu ingeschakeld.
                  Kom later terug om de performance te bekijken.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
