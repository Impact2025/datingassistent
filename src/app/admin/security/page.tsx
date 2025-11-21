/**
 * SECURITY MONITORING DASHBOARD
 * Real-time security monitoring for administrators
 * Created: 2025-11-21
 * Author: Security Specialist
 */

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Shield,
  AlertTriangle,
  Activity,
  Users,
  Clock,
  Search,
  RefreshCw,
  Download,
  Eye,
  EyeOff,
  Filter,
  TrendingUp,
  TrendingDown,
  Minus
} from 'lucide-react';

interface SecurityStats {
  totalAdminActions: number;
  failedActions: number;
  securityEventsToday: number;
  blockedRequests: number;
  activeAdminSessions: number;
}

interface SecurityEvent {
  id: string;
  eventType: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  userId: number | null;
  ipAddress: string;
  userAgent: string;
  details: any;
  createdAt: string;
  userEmail?: string;
  userName?: string;
}

interface AuditLog {
  id: string;
  userId: number;
  action: string;
  resource: string;
  success: boolean;
  ipAddress: string;
  createdAt: string;
  userEmail?: string;
  userName?: string;
}

export default function SecurityDashboard() {
  const [stats, setStats] = useState<SecurityStats | null>(null);
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [timeRange, setTimeRange] = useState('24h');

  // Load security data
  const loadSecurityData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [statsResponse, eventsResponse, auditResponse] = await Promise.all([
        fetch('/api/admin/security/stats'),
        fetch('/api/admin/security/events'),
        fetch('/api/admin/security/audit')
      ]);

      if (!statsResponse.ok || !eventsResponse.ok || !auditResponse.ok) {
        throw new Error('Failed to load security data');
      }

      const [statsData, eventsData, auditData] = await Promise.all([
        statsResponse.json(),
        eventsResponse.json(),
        auditResponse.json()
      ]);

      setStats(statsData);
      setEvents(eventsData.events || []);
      setAuditLogs(auditData.logs || []);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load security data');
      console.error('Security dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSecurityData();

    // Auto-refresh every 30 seconds
    const interval = setInterval(loadSecurityData, 30000);
    return () => clearInterval(interval);
  }, []);

  // Filter events based on search and filters
  const filteredEvents = events.filter(event => {
    const matchesSearch = searchTerm === '' ||
      event.eventType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.details?.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.userEmail?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesSeverity = severityFilter === 'all' || event.severity === severityFilter;

    return matchesSearch && matchesSeverity;
  });

  // Get severity color
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500 text-white';
      case 'high': return 'bg-orange-500 text-white';
      case 'medium': return 'bg-yellow-500 text-black';
      case 'low': return 'bg-blue-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  // Get severity icon
  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <AlertTriangle className="w-4 h-4" />;
      case 'high': return <AlertTriangle className="w-4 h-4" />;
      case 'medium': return <Shield className="w-4 h-4" />;
      case 'low': return <Activity className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  if (loading && !stats) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {error}
            <Button
              variant="outline"
              size="sm"
              onClick={loadSecurityData}
              className="ml-4"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Security Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Real-time security monitoring and audit logs
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadSecurityData}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Admin Actions</p>
                  <p className="text-2xl font-bold">{stats.totalAdminActions}</p>
                </div>
                <Activity className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Failed Actions</p>
                  <p className="text-2xl font-bold text-red-600">{stats.failedActions}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Security Events</p>
                  <p className="text-2xl font-bold text-orange-600">{stats.securityEventsToday}</p>
                </div>
                <Shield className="w-8 h-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Blocked Requests</p>
                  <p className="text-2xl font-bold text-purple-600">{stats.blockedRequests}</p>
                </div>
                <EyeOff className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Sessions</p>
                  <p className="text-2xl font-bold text-green-600">{stats.activeAdminSessions}</p>
                </div>
                <Users className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="events">Security Events</TabsTrigger>
          <TabsTrigger value="audit">Audit Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Security Events */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Recent Security Events
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {events.slice(0, 5).map((event) => (
                    <div key={event.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {getSeverityIcon(event.severity)}
                        <div>
                          <p className="font-medium text-sm">{event.eventType}</p>
                          <p className="text-xs text-gray-500">
                            {event.userEmail || 'System'} • {event.ipAddress}
                          </p>
                        </div>
                      </div>
                      <Badge className={getSeverityColor(event.severity)}>
                        {event.severity}
                      </Badge>
                    </div>
                  ))}
                  {events.length === 0 && (
                    <p className="text-gray-500 text-center py-4">No security events</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Recent Audit Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Recent Admin Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {auditLogs.slice(0, 5).map((log) => (
                    <div key={log.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium text-sm">{log.action}</p>
                        <p className="text-xs text-gray-500">
                          {log.userEmail} • {log.resource}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={log.success ? "default" : "destructive"}>
                          {log.success ? "Success" : "Failed"}
                        </Badge>
                      </div>
                    </div>
                  ))}
                  {auditLogs.length === 0 && (
                    <p className="text-gray-500 text-center py-4">No audit logs</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="events" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search events..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={severityFilter} onValueChange={setSeverityFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Severity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Severities</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={timeRange} onValueChange={setTimeRange}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Time" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1h">Last Hour</SelectItem>
                    <SelectItem value="24h">Last 24h</SelectItem>
                    <SelectItem value="7d">Last 7 days</SelectItem>
                    <SelectItem value="30d">Last 30 days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Events Table */}
          <Card>
            <CardHeader>
              <CardTitle>Security Events ({filteredEvents.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Time</TableHead>
                    <TableHead>Event</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>IP Address</TableHead>
                    <TableHead>Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEvents.map((event) => (
                    <TableRow key={event.id}>
                      <TableCell className="text-sm">
                        {new Date(event.createdAt).toLocaleString()}
                      </TableCell>
                      <TableCell className="font-medium">{event.eventType}</TableCell>
                      <TableCell>
                        <Badge className={getSeverityColor(event.severity)}>
                          {event.severity}
                        </Badge>
                      </TableCell>
                      <TableCell>{event.userEmail || 'System'}</TableCell>
                      <TableCell className="font-mono text-sm">{event.ipAddress}</TableCell>
                      <TableCell className="max-w-xs truncate" title={JSON.stringify(event.details)}>
                        {JSON.stringify(event.details).substring(0, 50)}...
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit" className="space-y-6">
          {/* Audit Logs Table */}
          <Card>
            <CardHeader>
              <CardTitle>Admin Audit Logs ({auditLogs.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Time</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Resource</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>IP Address</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {auditLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="text-sm">
                        {new Date(log.createdAt).toLocaleString()}
                      </TableCell>
                      <TableCell className="font-medium">{log.action}</TableCell>
                      <TableCell>{log.resource}</TableCell>
                      <TableCell>{log.userEmail}</TableCell>
                      <TableCell>
                        <Badge variant={log.success ? "default" : "destructive"}>
                          {log.success ? "Success" : "Failed"}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-sm">{log.ipAddress}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}