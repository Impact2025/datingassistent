'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Database,
  RefreshCw,
  Server,
  TrendingUp,
  Users,
  Zap,
  XCircle
} from 'lucide-react';

interface SystemHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  uptime: number;
  responseTime: number;
  errorRate: number;
  activeUsers: number;
  lastChecked: string;
}

interface MonitoringEvent {
  id: number;
  event_type: string;
  service: string;
  operation: string;
  message: string;
  severity: string;
  created_at: string;
  user_id?: number;
}

interface MonitoringStats {
  events: Array<{
    event_type: string;
    severity: string;
    count: number;
  }>;
  performance: Array<{
    service: string;
    operation: string;
    avg_duration: number;
    max_duration: number;
    count: number;
  }>;
  timeframe: string;
}

export function SystemMonitoringDashboard() {
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [stats, setStats] = useState<MonitoringStats | null>(null);
  const [recentEvents, setRecentEvents] = useState<MonitoringEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState<'hour' | 'day' | 'week'>('hour');

  useEffect(() => {
    loadMonitoringData();
  }, [timeframe]);

  const loadMonitoringData = async () => {
    setLoading(true);
    try {
      // Load health check
      const healthResponse = await fetch('/api/monitoring/health');
      if (healthResponse.ok) {
        const healthData = await healthResponse.json();
        setHealth(healthData);
      }

      // Load monitoring stats
      const statsResponse = await fetch(`/api/admin/monitoring/stats?timeframe=${timeframe}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('datespark_auth_token')}`
        }
      });
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData);
      }

      // Load recent events
      const eventsResponse = await fetch('/api/admin/monitoring/events?limit=50', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('datespark_auth_token')}`
        }
      });
      if (eventsResponse.ok) {
        const eventsData = await eventsResponse.json();
        setRecentEvents(eventsData.events || []);
      }

    } catch (error) {
      console.error('Failed to load monitoring data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600 bg-green-100';
      case 'degraded': return 'text-yellow-600 bg-yellow-100';
      case 'unhealthy': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="w-5 h-5" />;
      case 'degraded': return <AlertTriangle className="w-5 h-5" />;
      case 'unhealthy': return <XCircle className="w-5 h-5" />;
      default: return <Activity className="w-5 h-5" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const formatUptime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading system monitoring...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">🔍 System Monitoring</h1>
          <p className="text-muted-foreground">
            Real-time system health, performance, and error monitoring
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={loadMonitoringData}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* System Health Overview */}
      {health && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">System Status</p>
                  <p className="text-lg font-bold capitalize">{health.status}</p>
                </div>
                <div className={`p-2 rounded-full ${getStatusColor(health.status)}`}>
                  {getStatusIcon(health.status)}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Uptime</p>
                  <p className="text-lg font-bold">{formatUptime(health.uptime)}</p>
                </div>
                <Server className="w-8 h-8 text-blue-600 opacity-60" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Response Time</p>
                  <p className="text-lg font-bold">{health.responseTime}ms</p>
                </div>
                <Clock className="w-8 h-8 text-green-600 opacity-60" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Error Rate</p>
                  <p className="text-lg font-bold">{health.errorRate.toFixed(1)}%</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-red-600 opacity-60" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Users</p>
                  <p className="text-lg font-bold">{health.activeUsers}</p>
                </div>
                <Users className="w-8 h-8 text-purple-600 opacity-60" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Timeframe Selector */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium">Timeframe:</span>
            <Select value={timeframe} onValueChange={(value: any) => setTimeframe(value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hour">Last Hour</SelectItem>
                <SelectItem value="day">Last Day</SelectItem>
                <SelectItem value="week">Last Week</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="events" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
        </TabsList>

        <TabsContent value="events" className="space-y-6">
          {/* Event Statistics */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {stats.events.map((eventStat, index) => (
                <Card key={index}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground capitalize">
                          {eventStat.event_type}s
                        </p>
                        <p className="text-2xl font-bold">{eventStat.count}</p>
                        <Badge className={getSeverityColor(eventStat.severity)}>
                          {eventStat.severity}
                        </Badge>
                      </div>
                      <Activity className="w-8 h-8 text-gray-600 opacity-60" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Recent Events */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Recent Events
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {recentEvents.map((event) => (
                  <div key={event.id} className="flex items-start gap-3 p-3 border rounded-lg">
                    <div className={`w-2 h-2 rounded-full mt-2 ${
                      event.severity === 'critical' ? 'bg-red-500' :
                      event.severity === 'high' ? 'bg-orange-500' :
                      event.severity === 'medium' ? 'bg-yellow-500' : 'bg-blue-500'
                    }`}></div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{event.service}</span>
                        <Badge className={getSeverityColor(event.severity)} variant="secondary">
                          {event.severity}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">
                        {event.operation}
                      </p>
                      <p className="text-sm">{event.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(event.created_at).toLocaleString('nl-NL')}
                        {event.user_id && ` • User #${event.user_id}`}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          {stats && stats.performance.length > 0 ? (
            <div className="space-y-4">
              {stats.performance.map((perf, index) => (
                <Card key={index}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-semibold">{perf.service} - {perf.operation}</h3>
                        <p className="text-sm text-muted-foreground">
                          {perf.count} operations
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold">{Math.round(perf.avg_duration)}ms</p>
                        <p className="text-sm text-muted-foreground">avg response time</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Average: {Math.round(perf.avg_duration)}ms</span>
                        <span>Peak: {Math.round(perf.max_duration)}ms</span>
                      </div>
                      <Progress
                        value={Math.min((perf.avg_duration / 1000) * 100, 100)}
                        className="h-2"
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6 text-center py-12">
                <TrendingUp className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No Performance Data</h3>
                <p className="text-muted-foreground">
                  Performance metrics will appear here as the system processes requests.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="alerts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                System Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Critical alerts would be loaded from the database */}
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    System monitoring is active. Critical alerts will appear here automatically.
                  </AlertDescription>
                </Alert>

                {health && health.status !== 'healthy' && (
                  <Alert className="border-yellow-200 bg-yellow-50">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      System status is {health.status}. Response time: {health.responseTime}ms,
                      Error rate: {health.errorRate.toFixed(1)}%
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}