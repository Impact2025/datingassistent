'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Activity,
  Users,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Database,
  Zap,
  Shield,
  BarChart3,
  Settings
} from 'lucide-react';

interface SystemHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  uptime: number;
  memory: { used: number; total: number; percentage: number };
  database: { status: 'healthy' | 'unhealthy'; connections: number };
  responseTime: number;
}

interface PerformanceMetrics {
  coreWebVitals: {
    cls: number;
    fid: number;
    lcp: number;
  };
  pageViews: number;
  uniqueVisitors: number;
  bounceRate: number;
  avgSessionDuration: number;
}

interface SecurityMetrics {
  failedLogins: number;
  suspiciousActivities: number;
  blockedIPs: number;
  activeThreats: number;
}

export function MonitoringDashboard() {
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics | null>(null);
  const [securityMetrics, setSecurityMetrics] = useState<SecurityMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
    // Refresh every 30 seconds
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [healthRes, perfRes, securityRes] = await Promise.all([
        fetch('/api/health?detailed=true'),
        fetch('/api/analytics/performance'),
        fetch('/api/admin/security-metrics')
      ]);

      if (healthRes.ok) {
        const health = await healthRes.json();
        setSystemHealth(health);
      }

      if (perfRes.ok) {
        const perf = await perfRes.json();
        setPerformanceMetrics(perf);
      }

      if (securityRes.ok) {
        const security = await securityRes.json();
        setSecurityMetrics(security);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Monitoring Dashboard</h1>
          <p className="text-muted-foreground">
            Real-time system health, performance, and security monitoring
          </p>
        </div>
        <Button onClick={fetchDashboardData} variant="outline">
          <Activity className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* System Health Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Status</CardTitle>
            {systemHealth?.status === 'healthy' ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : systemHealth?.status === 'degraded' ? (
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
            ) : (
              <XCircle className="h-4 w-4 text-red-500" />
            )}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">{systemHealth?.status || 'Unknown'}</div>
            <p className="text-xs text-muted-foreground">
              Uptime: {systemHealth ? formatUptime(systemHealth.uptime) : 'N/A'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {systemHealth?.memory.percentage.toFixed(1)}%
            </div>
            <Progress value={systemHealth?.memory.percentage || 0} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {systemHealth ? formatBytes(systemHealth.memory.used) : 'N/A'} used
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Response Time</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {systemHealth?.responseTime ? `${systemHealth.responseTime}ms` : 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">
              Average response time
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {performanceMetrics?.uniqueVisitors || 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">
              Last 24 hours
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Monitoring Tabs */}
      <Tabs defaultValue="performance" className="space-y-4">
        <TabsList>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Core Web Vitals</CardTitle>
                <CardDescription>
                  Google's performance metrics
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Largest Contentful Paint</span>
                  <Badge variant={performanceMetrics?.coreWebVitals.lcp && performanceMetrics.coreWebVitals.lcp < 2500 ? "default" : "destructive"}>
                    {performanceMetrics?.coreWebVitals.lcp ? `${performanceMetrics.coreWebVitals.lcp}ms` : 'N/A'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">First Input Delay</span>
                  <Badge variant={performanceMetrics?.coreWebVitals.fid && performanceMetrics.coreWebVitals.fid < 100 ? "default" : "destructive"}>
                    {performanceMetrics?.coreWebVitals.fid ? `${performanceMetrics.coreWebVitals.fid}ms` : 'N/A'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Cumulative Layout Shift</span>
                  <Badge variant={performanceMetrics?.coreWebVitals.cls && performanceMetrics.coreWebVitals.cls < 0.1 ? "default" : "destructive"}>
                    {performanceMetrics?.coreWebVitals.cls ? performanceMetrics.coreWebVitals.cls.toFixed(3) : 'N/A'}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>User Engagement</CardTitle>
                <CardDescription>
                  Website usage statistics
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Page Views</span>
                  <span className="text-sm font-bold">{performanceMetrics?.pageViews || 'N/A'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Bounce Rate</span>
                  <span className="text-sm font-bold">
                    {performanceMetrics?.bounceRate ? `${performanceMetrics.bounceRate.toFixed(1)}%` : 'N/A'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Avg. Session</span>
                  <span className="text-sm font-bold">
                    {performanceMetrics?.avgSessionDuration ? formatDuration(performanceMetrics.avgSessionDuration) : 'N/A'}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Failed Logins</CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {securityMetrics?.failedLogins || 0}
                </div>
                <p className="text-xs text-muted-foreground">Last 24 hours</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Suspicious Activity</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">
                  {securityMetrics?.suspiciousActivities || 0}
                </div>
                <p className="text-xs text-muted-foreground">Detected events</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Blocked IPs</CardTitle>
                <XCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  {securityMetrics?.blockedIPs || 0}
                </div>
                <p className="text-xs text-muted-foreground">Currently blocked</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Threats</CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {securityMetrics?.activeThreats || 0}
                </div>
                <p className="text-xs text-muted-foreground">Ongoing threats</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="system" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Resources</CardTitle>
              <CardDescription>
                Detailed system health metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Memory Usage</span>
                    <span>{systemHealth?.memory.percentage.toFixed(1)}%</span>
                  </div>
                  <Progress value={systemHealth?.memory.percentage || 0} />
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4">
                  <div>
                    <p className="text-sm font-medium">Database Status</p>
                    <Badge variant={systemHealth?.database.status === 'healthy' ? 'default' : 'destructive'}>
                      {systemHealth?.database.status || 'Unknown'}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Active Connections</p>
                    <p className="text-lg font-bold">{systemHealth?.database.connections || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Analytics Overview</CardTitle>
              <CardDescription>
                Key performance indicators and trends
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Advanced analytics dashboard coming soon.
                  <br />
                  Currently integrated with Google Analytics 4.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Alerts */}
      {systemHealth?.status === 'unhealthy' && (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertTitle>Critical System Issues</AlertTitle>
          <AlertDescription>
            The system is experiencing critical issues. Please check the system logs and take immediate action.
          </AlertDescription>
        </Alert>
      )}

      {systemHealth?.status === 'degraded' && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>System Performance Degraded</AlertTitle>
          <AlertDescription>
            The system is experiencing performance issues. Monitor closely and consider scaling resources.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}

// Utility functions
function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (days > 0) return `${days}d ${hours}h ${minutes}m`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

function formatBytes(bytes: number): string {
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  if (bytes === 0) return '0 Bytes';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
}

function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}