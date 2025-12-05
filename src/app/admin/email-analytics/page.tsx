'use client';

import React, { useState, useEffect } from 'react';

interface EmailStats {
  totalSent: number;
  totalDelivered: number;
  totalOpened: number;
  totalClicked: number;
  openRate: number;
  clickRate: number;
  bounceRate: number;
  unsubscribeRate: number;
}

interface EmailTypeStats {
  emailType: string;
  count: number;
  openRate: number;
  clickRate: number;
}

interface QueueStats {
  pending: number;
  processing: number;
  sent: number;
  failed: number;
}

interface RecentEmail {
  id: number;
  email_type: string;
  email_category: string;
  sent_at: string;
  opened_at: string | null;
  clicked_at: string | null;
  user_email: string;
  user_name: string;
}

interface AnalyticsData {
  stats: EmailStats;
  typeStats: EmailTypeStats[];
  queueStats: QueueStats;
  recentEmails: RecentEmail[];
  period: string;
}

export default function EmailAnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState('30d');

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/email-analytics?period=${period}`);
      if (!response.ok) {
        throw new Error('Failed to fetch analytics');
      }
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('nl-NL', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getEmailTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      welcome: 'Welkom',
      verification: 'Verificatie',
      password_reset: 'Wachtwoord Reset',
      profile_optimization_reminder: 'Profiel Optimalisatie',
      weekly_checkin: 'Wekelijkse Check-in',
      inactivity_3days: 'Inactiviteit (3 dagen)',
      inactivity_7days: 'Inactiviteit (7 dagen)',
      weekly_digest: 'Wekelijkse Digest',
      milestone_achievement: 'Milestone',
      subscription_renewal: 'Abonnement Verlenging',
      payment_failed: 'Betaling Mislukt',
      feature_limit_reached: 'Limiet Bereikt',
      monthly_progress: 'Maandelijks Rapport',
    };
    return labels[type] || type.replace(/_/g, ' ');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="bg-red-50 text-red-700 p-4 rounded-lg">
          Error: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Email Analytics</h1>
          <p className="text-gray-500 mt-1">Inzicht in email performance en engagement</p>
        </div>
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-pink-500"
        >
          <option value="7d">Laatste 7 dagen</option>
          <option value="30d">Laatste 30 dagen</option>
          <option value="90d">Laatste 90 dagen</option>
          <option value="365d">Laatste jaar</option>
        </select>
      </div>

      {data && (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Totaal Verzonden"
              value={data.stats.totalSent.toLocaleString()}
              icon="📤"
              color="blue"
            />
            <StatCard
              title="Open Rate"
              value={`${data.stats.openRate}%`}
              subtitle={`${data.stats.totalOpened.toLocaleString()} geopend`}
              icon="📬"
              color="green"
            />
            <StatCard
              title="Click Rate"
              value={`${data.stats.clickRate}%`}
              subtitle={`${data.stats.totalClicked.toLocaleString()} geklikt`}
              icon="👆"
              color="purple"
            />
            <StatCard
              title="Bounce Rate"
              value={`${data.stats.bounceRate}%`}
              icon="⚠️"
              color="red"
            />
          </div>

          {/* Queue Status */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Email Queue Status</h2>
            <div className="grid grid-cols-4 gap-4">
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">{data.queueStats.pending}</div>
                <div className="text-sm text-gray-500">In wachtrij</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{data.queueStats.processing}</div>
                <div className="text-sm text-gray-500">Wordt verwerkt</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{data.queueStats.sent}</div>
                <div className="text-sm text-gray-500">Verzonden</div>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">{data.queueStats.failed}</div>
                <div className="text-sm text-gray-500">Mislukt</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Email Type Performance */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Performance per Type</h2>
              <div className="space-y-4">
                {data.typeStats.map((type, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{getEmailTypeLabel(type.emailType)}</div>
                      <div className="text-sm text-gray-500">{type.count} verzonden</div>
                    </div>
                    <div className="flex gap-4 text-sm">
                      <span className="px-2 py-1 bg-green-100 text-green-700 rounded">
                        {type.openRate}% open
                      </span>
                      <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded">
                        {type.clickRate}% click
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Emails */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Recente Emails</h2>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {data.recentEmails.map((email) => (
                  <div key={email.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 text-sm">{email.user_email}</div>
                      <div className="text-xs text-gray-500">
                        {getEmailTypeLabel(email.email_type)} • {formatDate(email.sent_at)}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      {email.opened_at && (
                        <span className="w-2 h-2 bg-green-500 rounded-full" title="Geopend"></span>
                      )}
                      {email.clicked_at && (
                        <span className="w-2 h-2 bg-purple-500 rounded-full" title="Geklikt"></span>
                      )}
                      {!email.opened_at && !email.clicked_at && (
                        <span className="w-2 h-2 bg-gray-300 rounded-full" title="Niet geopend"></span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function StatCard({ title, value, subtitle, icon, color }: {
  title: string;
  value: string;
  subtitle?: string;
  icon: string;
  color: 'blue' | 'green' | 'purple' | 'red';
}) {
  const colors = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    red: 'bg-red-50 text-red-600',
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <span className="text-2xl">{icon}</span>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${colors[color]}`}>
          {title}
        </span>
      </div>
      <div className="text-3xl font-bold text-gray-900">{value}</div>
      {subtitle && <div className="text-sm text-gray-500 mt-1">{subtitle}</div>}
    </div>
  );
}
