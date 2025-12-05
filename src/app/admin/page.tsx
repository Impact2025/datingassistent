"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Users,
  Activity,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  BarChart3,
  UserCheck,
  Target,
  Shield,
  Database,
  RefreshCw,
  Tag,
  Settings,
  Zap
} from "lucide-react";

// =============================================================================
// TYPES
// =============================================================================

interface GrowthMetric {
  value: number;
  percentage: number;
  trend: 'up' | 'down' | 'stable';
}

interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  premiumUsers: number;
  totalAssessments: number;
  completedAssessments: number;
  usersWithProgress: number;
  averageReadinessScore: number;
  revenue: number;
  conversionRate: number;
  systemHealth: {
    database: 'healthy' | 'warning' | 'error';
    api: 'healthy' | 'warning' | 'error';
    ai: 'healthy' | 'warning' | 'error';
  };
  recentActivity: Array<{
    id: string;
    type: string;
    user: string;
    action: string;
    timestamp: string;
  }>;
  growth?: {
    users: GrowthMetric;
    revenue: GrowthMetric;
    activeUsers: GrowthMetric;
    conversions: GrowthMetric;
  };
}

// =============================================================================
// SKELETON COMPONENTS
// =============================================================================

function MetricCardSkeleton() {
  return (
    <Card className="animate-pulse">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="h-4 bg-gray-200 rounded w-24"></div>
        <div className="h-4 w-4 bg-gray-200 rounded"></div>
      </CardHeader>
      <CardContent>
        <div className="h-8 bg-gray-200 rounded w-20 mb-2"></div>
        <div className="h-3 bg-gray-200 rounded w-32"></div>
      </CardContent>
    </Card>
  );
}

function ActivitySkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-start space-x-3 animate-pulse">
          <div className="h-4 w-4 bg-gray-200 rounded"></div>
          <div className="flex-1">
            <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-48"></div>
          </div>
        </div>
      ))}
    </div>
  );
}

// =============================================================================
// TREND COMPONENT
// =============================================================================

function TrendIndicator({ growth, label }: { growth?: GrowthMetric; label?: string }) {
  if (!growth) {
    return <span className="text-gray-400 text-xs">-</span>;
  }

  const { percentage, trend } = growth;
  const isPositive = trend === 'up';
  const isNegative = trend === 'down';

  const Icon = isPositive ? TrendingUp : isNegative ? TrendingDown : Minus;
  const colorClass = isPositive
    ? 'text-green-600'
    : isNegative
    ? 'text-red-600'
    : 'text-gray-500';

  return (
    <p className="text-xs text-muted-foreground flex items-center gap-1">
      <span className={colorClass}>
        <Icon className="h-3 w-3 inline" />
        {isPositive && '+'}
        {percentage.toFixed(1)}%
      </span>
      {label && <span className="text-gray-400">{label}</span>}
    </p>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const router = useRouter();

  const fetchDashboardStats = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      // Probeer eerst enhanced endpoint, fallback naar basic
      let response = await fetch('/api/admin/dashboard/enhanced');

      if (!response.ok) {
        response = await fetch('/api/admin/dashboard');
      }

      if (!response.ok) {
        throw new Error('Failed to fetch dashboard stats');
      }

      const data = await response.json();

      if (data.success && data.stats) {
        setStats(data.stats);
        setLastUpdated(new Date());
      } else {
        throw new Error(data.error || 'Invalid response format');
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      setStats(null);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardStats();

    // Auto-refresh elke 30 seconden
    const interval = setInterval(() => {
      fetchDashboardStats(true);
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchDashboardStats]);

  // Keyboard shortcut: R voor refresh
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'r' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        const target = e.target as HTMLElement;
        if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') {
          e.preventDefault();
          fetchDashboardStats(true);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [fetchDashboardStats]);

  const getHealthColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600 bg-green-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'error': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getHealthIcon = (status: string) => {
    switch (status) {
      case 'healthy': return CheckCircle;
      case 'warning': return AlertTriangle;
      case 'error': return AlertTriangle;
      default: return Activity;
    }
  };

  // Quick action handlers
  const quickActions = [
    {
      icon: Users,
      label: 'Manage Users',
      onClick: () => router.push('/admin/users'),
      color: 'hover:bg-blue-50 hover:border-blue-200'
    },
    {
      icon: BarChart3,
      label: 'View Analytics',
      onClick: () => router.push('/admin/analytics'),
      color: 'hover:bg-purple-50 hover:border-purple-200'
    },
    {
      icon: Tag,
      label: 'Coupon Beheer',
      onClick: () => router.push('/admin/coupons'),
      color: 'hover:bg-orange-50 hover:border-orange-200'
    },
    {
      icon: Shield,
      label: 'Security',
      onClick: () => router.push('/admin/security'),
      color: 'hover:bg-green-50 hover:border-green-200'
    }
  ];

  // Loading state met skeleton
  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-8 bg-gray-200 rounded w-48 mb-2 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-64 animate-pulse"></div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <MetricCardSkeleton key={i} />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <MetricCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="mx-auto h-12 w-12 text-red-500" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Error loading dashboard</h3>
        <p className="mt-1 text-sm text-gray-500">Unable to fetch dashboard statistics.</p>
        <Button onClick={() => fetchDashboardStats()} className="mt-4">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">
            Real-time overview van DatingAssistent platform
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <span className="text-sm text-gray-500">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchDashboardStats(true)}
            disabled={refreshing}
            className="flex items-center space-x-2"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
          </Button>
          <kbd className="hidden sm:inline-flex px-2 py-1 text-xs font-mono bg-gray-100 border rounded">
            R
          </kbd>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</div>
            <TrendIndicator growth={stats.growth?.users} label="vs vorige periode" />
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Activity className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeUsers.toLocaleString()}</div>
            <TrendIndicator growth={stats.growth?.activeUsers} label="vs vorige week" />
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-purple-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.revenue.toLocaleString('nl-NL', { style: 'currency', currency: 'EUR' })}</div>
            <TrendIndicator growth={stats.growth?.revenue} label="vs vorige maand" />
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-orange-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.conversionRate}%</div>
            <TrendIndicator growth={stats.growth?.conversions} label="vs vorige periode" />
          </CardContent>
        </Card>
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center space-x-2">
              <UserCheck className="h-4 w-4" />
              <span>Premium Users</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.premiumUsers}</div>
            <Progress value={(stats.premiumUsers / stats.totalUsers) * 100} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {((stats.premiumUsers / stats.totalUsers) * 100).toFixed(1)}% of total users
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center space-x-2">
              <Target className="h-4 w-4" />
              <span>Assessment Completion</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {((stats.completedAssessments / stats.totalAssessments) * 100).toFixed(1)}%
            </div>
            <Progress value={(stats.completedAssessments / stats.totalAssessments) * 100} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {stats.completedAssessments} of {stats.totalAssessments} completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center space-x-2">
              <BarChart3 className="h-4 w-4" />
              <span>Avg Readiness Score</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageReadinessScore}</div>
            <Progress value={stats.averageReadinessScore} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {stats.averageReadinessScore >= 80 ? 'Excellent' :
               stats.averageReadinessScore >= 60 ? 'Good' : 'Needs improvement'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* System Health & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* System Health */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="h-5 w-5" />
              <span>System Health</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(stats.systemHealth).map(([service, status]) => {
              const Icon = getHealthIcon(status);
              return (
                <div key={service} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Icon className="h-4 w-4" />
                    <span className="text-sm font-medium capitalize">{service}</span>
                  </div>
                  <Badge className={getHealthColor(status)}>
                    {status}
                  </Badge>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5" />
              <span>Recent Activity</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    {activity.type === 'assessment' && <Target className="h-4 w-4 text-blue-500" />}
                    {activity.type === 'subscription' && <DollarSign className="h-4 w-4 text-green-500" />}
                    {activity.type === 'login' && <Activity className="h-4 w-4 text-purple-500" />}
                    {activity.type === 'signup' && <UserCheck className="h-4 w-4 text-green-600" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {activity.user}
                    </p>
                    <p className="text-sm text-gray-500">
                      {activity.action}
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(activity.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-500" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <Button
                  key={index}
                  variant="outline"
                  onClick={action.onClick}
                  className={`h-20 flex flex-col items-center justify-center space-y-2 transition-all ${action.color}`}
                >
                  <Icon className="h-6 w-6" />
                  <span className="text-sm">{action.label}</span>
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Keyboard Shortcuts Help */}
      <div className="text-center text-sm text-gray-400">
        <kbd className="px-2 py-1 bg-gray-100 border rounded font-mono text-xs">R</kbd>
        <span className="ml-2">Refresh data</span>
      </div>
    </div>
  );
}