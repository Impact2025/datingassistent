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
  TrendingUp,
  TrendingDown,
  DollarSign,
  Activity,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  PieChart,
  Calendar,
  Users,
  Zap,
  RefreshCw,
  Download,
  Filter
} from 'lucide-react';

interface CostSummary {
  totalCost: number;
  monthlyCost: number;
  dailyCost: number;
  costByService: Record<string, number>;
  costByDay: Array<{ date: string; cost: number }>;
  topUsers: Array<{ userId: number; cost: number; operations: number }>;
  alerts: Array<{ type: string; message: string; severity: 'low' | 'medium' | 'high' }>;
}

interface RecentOperation {
  service: string;
  operation: string;
  cost: number;
  tokens?: number;
  created_at: string;
  user_id?: number;
}

export function CostMonitoringDashboard() {
  const [summary, setSummary] = useState<CostSummary | null>(null);
  const [recentOperations, setRecentOperations] = useState<RecentOperation[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'day' | 'week' | 'month' | 'year'>('month');
  const [selectedService, setSelectedService] = useState<string>('');

  useEffect(() => {
    loadCostData();
  }, [period, selectedService]);

  const loadCostData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        period,
        ...(selectedService && { service: selectedService })
      });

      const response = await fetch(`/api/admin/cost-monitoring?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('datespark_auth_token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSummary(data.data);
        setRecentOperations(data.recentOperations || []);
      }
    } catch (error) {
      console.error('Failed to load cost data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'high': return <AlertTriangle className="w-4 h-4" />;
      case 'medium': return <Activity className="w-4 h-4" />;
      case 'low': return <CheckCircle className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading cost analytics...</p>
        </div>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <BarChart3 className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">No cost data available</h3>
          <p className="text-muted-foreground">Cost tracking will begin once AI services are used.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">💰 AI Cost Monitoring</h1>
          <p className="text-muted-foreground">
            Monitor AI service usage and costs across the platform
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={loadCostData}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Controls */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span className="text-sm font-medium">Period:</span>
              <Select value={period} onValueChange={(value: any) => setPeriod(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="day">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="year">This Year</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4" />
              <span className="text-sm font-medium">Service:</span>
              <Select value={selectedService} onValueChange={setSelectedService}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All Services" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Services</SelectItem>
                  {Object.keys(summary.costByService).map(service => (
                    <SelectItem key={service} value={service}>{service}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alerts */}
      {summary.alerts.length > 0 && (
        <div className="space-y-2">
          {summary.alerts.map((alert, index) => (
            <Alert key={index} className={`border-l-4 ${
              alert.severity === 'high' ? 'border-l-red-500' :
              alert.severity === 'medium' ? 'border-l-yellow-500' : 'border-l-blue-500'
            }`}>
              {getSeverityIcon(alert.severity)}
              <AlertDescription className="font-medium">
                {alert.message}
              </AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Cost</p>
                <p className="text-2xl font-bold">€{summary.totalCost.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">{period}</p>
              </div>
              <DollarSign className="w-8 h-8 text-green-600 opacity-60" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Daily Average</p>
                <p className="text-2xl font-bold">€{summary.dailyCost.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">Today</p>
              </div>
              <Activity className="w-8 h-8 text-blue-600 opacity-60" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Services Used</p>
                <p className="text-2xl font-bold">{Object.keys(summary.costByService).length}</p>
                <p className="text-xs text-muted-foreground">Active services</p>
              </div>
              <PieChart className="w-8 h-8 text-purple-600 opacity-60" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Top User Cost</p>
                <p className="text-2xl font-bold">
                  €{summary.topUsers[0]?.cost.toFixed(2) || '0.00'}
                </p>
                <p className="text-xs text-muted-foreground">User #{summary.topUsers[0]?.userId || 'N/A'}</p>
              </div>
              <Users className="w-8 h-8 text-orange-600 opacity-60" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="services">By Service</TabsTrigger>
          <TabsTrigger value="users">By User</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Cost Trend Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Cost Trend ({period})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {summary.costByDay.slice(0, 7).reverse().map((day, index) => (
                  <div key={day.date} className="flex items-center gap-4">
                    <div className="w-20 text-sm text-muted-foreground">
                      {new Date(day.date).toLocaleDateString('nl-NL', { weekday: 'short', month: 'short', day: 'numeric' })}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">€{day.cost.toFixed(2)}</span>
                      </div>
                      <Progress value={(day.cost / Math.max(...summary.costByDay.map(d => d.cost))) * 100} className="h-2" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="services" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="w-5 h-5" />
                Cost by Service
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(summary.costByService)
                  .sort(([,a], [,b]) => b - a)
                  .map(([service, cost]) => (
                  <div key={service} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <div>
                        <p className="font-medium capitalize">{service.replace('-', ' ')}</p>
                        <p className="text-sm text-muted-foreground">
                          {((cost / summary.totalCost) * 100).toFixed(1)}% of total
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold">€{cost.toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Top Users by Cost
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {summary.topUsers.map((user, index) => (
                  <div key={user.userId} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                        <span className="text-sm font-bold">#{index + 1}</span>
                      </div>
                      <div>
                        <p className="font-medium">User #{user.userId}</p>
                        <p className="text-sm text-muted-foreground">
                          {user.operations} operations
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold">€{user.cost.toFixed(2)}</p>
                      <p className="text-sm text-muted-foreground">
                        €{(user.cost / user.operations).toFixed(4)} avg
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timeline" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Recent Operations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {recentOperations.map((op, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <div>
                        <p className="font-medium">{op.operation}</p>
                        <p className="text-sm text-muted-foreground">
                          {op.service} • {op.user_id ? `User #${op.user_id}` : 'System'}
                          {op.tokens && ` • ${op.tokens} tokens`}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">€{op.cost.toFixed(4)}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(op.created_at).toLocaleTimeString('nl-NL')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}