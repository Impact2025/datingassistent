'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Database,
  RefreshCw,
  Server,
  Wifi,
  WifiOff,
  XCircle,
  Trash2,
  Play,
  Eye
} from 'lucide-react';
import { getSWDiagnostics, clearSWAndCaches, setupGlobalErrorHandlers } from '@/lib/client-error-reporter';

interface HealthData {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  build: {
    version: string;
    time: string;
    nodeEnv: string;
  };
  checks: {
    database: { status: string; responseTime: number; error?: string };
    api: { status: string; responseTime: number };
    serviceWorker: { status: string; note: string };
  };
  uptime: number;
  responseTime: number;
  memory: { used: number; total: number; unit: string };
  errorStats?: {
    lastHour: {
      critical: number;
      high: number;
      errors: number;
      total: number;
      errorRate: number;
    };
  };
  activeUsers: number;
}

interface SWDiagnostics {
  supported: boolean;
  registered: boolean;
  registrations: number;
  caches: string[];
  controller: boolean;
}

interface MonitoringEvent {
  id: number;
  event_type: string;
  service: string;
  operation: string;
  message: string;
  severity: string;
  created_at: string;
}

export default function MonitoringPage() {
  const [health, setHealth] = useState<HealthData | null>(null);
  const [swDiagnostics, setSWDiagnostics] = useState<SWDiagnostics | null>(null);
  const [recentErrors, setRecentErrors] = useState<MonitoringEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const fetchHealth = useCallback(async () => {
    try {
      const response = await fetch('/api/monitoring/health');
      if (response.ok) {
        const data = await response.json();
        setHealth(data);
      }
    } catch (error) {
      console.error('Failed to fetch health:', error);
    }
  }, []);

  const fetchSWDiagnostics = useCallback(async () => {
    const diagnostics = await getSWDiagnostics();
    setSWDiagnostics(diagnostics);
  }, []);

  const fetchRecentErrors = useCallback(async () => {
    try {
      const token = localStorage.getItem('datespark_auth_token');
      const response = await fetch('/api/admin/monitoring/events?limit=20&type=error', {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      if (response.ok) {
        const data = await response.json();
        setRecentErrors(data.events || []);
      }
    } catch (error) {
      console.error('Failed to fetch errors:', error);
    }
  }, []);

  const refreshAll = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([fetchHealth(), fetchSWDiagnostics(), fetchRecentErrors()]);
    setLastRefresh(new Date());
    setRefreshing(false);
    setLoading(false);
  }, [fetchHealth, fetchSWDiagnostics, fetchRecentErrors]);

  useEffect(() => {
    setupGlobalErrorHandlers();
    refreshAll();
  }, [refreshAll]);

  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(refreshAll, 5000);
    return () => clearInterval(interval);
  }, [autoRefresh, refreshAll]);

  const handleClearSW = async () => {
    if (confirm('Dit verwijdert alle Service Worker caches en registraties. Doorgaan?')) {
      const success = await clearSWAndCaches();
      if (success) {
        alert('Service Worker caches geleegd. Pagina wordt herladen.');
        window.location.reload();
      } else {
        alert('Kon caches niet legen. Zie console voor details.');
      }
    }
  };

  const handleTestSW = async () => {
    if (!('serviceWorker' in navigator)) {
      alert('Service Workers worden niet ondersteund in deze browser.');
      return;
    }

    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      alert(`Service Worker registratie ${registration.active ? 'actief' : 'gestart'}. Scope: ${registration.scope}`);
      await fetchSWDiagnostics();
    } catch (error: any) {
      alert(`Service Worker registratie gefaald: ${error.message}`);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-green-500';
      case 'degraded': return 'bg-yellow-500';
      case 'unhealthy': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'degraded': return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      case 'unhealthy': return <XCircle className="w-5 h-5 text-red-600" />;
      default: return <Activity className="w-5 h-5 text-gray-600" />;
    }
  };

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="w-8 h-8 animate-spin mr-2" />
          <span>Loading monitoring data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Live Monitoring Dashboard</h1>
          <p className="text-muted-foreground">
            Real-time systeem status en diagnostiek
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={autoRefresh ? 'default' : 'secondary'}>
            {autoRefresh ? 'Auto-refresh: ON' : 'Auto-refresh: OFF'}
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            <Eye className="w-4 h-4 mr-1" />
            {autoRefresh ? 'Stop' : 'Start'}
          </Button>
          <Button variant="outline" size="sm" onClick={refreshAll} disabled={refreshing}>
            <RefreshCw className={`w-4 h-4 mr-1 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Last refresh time */}
      <p className="text-xs text-muted-foreground">
        Laatst bijgewerkt: {lastRefresh.toLocaleTimeString('nl-NL')}
      </p>

      {/* System Status Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Overall Status */}
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">System Status</p>
                <p className="text-lg font-bold capitalize">{health?.status || 'Unknown'}</p>
              </div>
              <div className={`w-4 h-4 rounded-full ${getStatusColor(health?.status || '')}`} />
            </div>
          </CardContent>
        </Card>

        {/* Database */}
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Database</p>
                <p className="text-lg font-bold">
                  {health?.checks.database.responseTime || 0}ms
                </p>
              </div>
              <Database className={`w-5 h-5 ${health?.checks.database.status === 'healthy' ? 'text-green-600' : 'text-red-600'}`} />
            </div>
          </CardContent>
        </Card>

        {/* API */}
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">API Response</p>
                <p className="text-lg font-bold">{health?.responseTime || 0}ms</p>
              </div>
              <Server className="w-5 h-5 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        {/* Uptime */}
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Uptime</p>
                <p className="text-lg font-bold">{formatUptime(health?.uptime || 0)}</p>
              </div>
              <Clock className="w-5 h-5 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Build Info */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Build Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Version:</span>{' '}
              <span className="font-mono">{health?.build.version}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Environment:</span>{' '}
              <Badge variant="outline">{health?.build.nodeEnv}</Badge>
            </div>
            <div>
              <span className="text-muted-foreground">Memory:</span>{' '}
              <span className="font-mono">{health?.memory.used}/{health?.memory.total} MB</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Service Worker Diagnostics */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            {swDiagnostics?.registered ? (
              <Wifi className="w-4 h-4 text-green-600" />
            ) : (
              <WifiOff className="w-4 h-4 text-yellow-600" />
            )}
            Service Worker Diagnostics
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-xs text-muted-foreground">Supported</p>
              <p className="font-bold">{swDiagnostics?.supported ? 'Yes' : 'No'}</p>
            </div>
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-xs text-muted-foreground">Registered</p>
              <p className="font-bold">{swDiagnostics?.registered ? 'Yes' : 'No'}</p>
            </div>
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-xs text-muted-foreground">Registrations</p>
              <p className="font-bold">{swDiagnostics?.registrations || 0}</p>
            </div>
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-xs text-muted-foreground">Controller Active</p>
              <p className="font-bold">{swDiagnostics?.controller ? 'Yes' : 'No'}</p>
            </div>
          </div>

          {/* Caches */}
          {swDiagnostics?.caches && swDiagnostics.caches.length > 0 && (
            <div>
              <p className="text-xs text-muted-foreground mb-2">Active Caches:</p>
              <div className="flex flex-wrap gap-1">
                {swDiagnostics.caches.map((cache, i) => (
                  <Badge key={i} variant="secondary" className="text-xs">{cache}</Badge>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={handleTestSW}>
              <Play className="w-4 h-4 mr-1" />
              Test SW Registration
            </Button>
            <Button variant="destructive" size="sm" onClick={handleClearSW}>
              <Trash2 className="w-4 h-4 mr-1" />
              Clear All Caches
            </Button>
          </div>

          {!swDiagnostics?.registered && (
            <Alert>
              <AlertTriangle className="w-4 h-4" />
              <AlertDescription>
                Service Worker is niet geregistreerd. Dit kan de oorzaak zijn van ERR_FAILED errors.
                Check de build logs voor "self is not defined" errors.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Error Stats */}
      {health?.errorStats && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Error Statistics (Last Hour)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-4">
              <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <p className="text-2xl font-bold text-red-600">{health.errorStats.lastHour.critical}</p>
                <p className="text-xs text-muted-foreground">Critical</p>
              </div>
              <div className="text-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                <p className="text-2xl font-bold text-orange-600">{health.errorStats.lastHour.high}</p>
                <p className="text-xs text-muted-foreground">High</p>
              </div>
              <div className="text-center p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <p className="text-2xl font-bold text-yellow-600">{health.errorStats.lastHour.errors}</p>
                <p className="text-xs text-muted-foreground">Errors</p>
              </div>
              <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-2xl font-bold text-blue-600">{health.errorStats.lastHour.errorRate}%</p>
                <p className="text-xs text-muted-foreground">Error Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Errors */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            Recent Errors (Live Feed)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentErrors.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              Geen recente errors gevonden
            </p>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {recentErrors.map((error) => (
                <div key={error.id} className="flex items-start gap-2 p-2 border rounded text-sm">
                  <div className={`w-2 h-2 rounded-full mt-1.5 ${
                    error.severity === 'critical' ? 'bg-red-500' :
                    error.severity === 'high' ? 'bg-orange-500' :
                    'bg-yellow-500'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{error.service}</span>
                      <Badge variant="outline" className="text-xs">{error.severity}</Badge>
                    </div>
                    <p className="text-muted-foreground truncate">{error.message}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(error.created_at).toLocaleString('nl-NL')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
