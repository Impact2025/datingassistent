'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  BarChart3,
  TrendingUp,
  Users,
  Clock,
  MessageCircle,
  Star,
  ArrowLeft,
  RefreshCw,
  Calendar,
  Download
} from 'lucide-react';

interface AnalyticsData {
  overview: {
    totalChats: number;
    avgResponseTime: number;
    satisfactionScore: number;
    resolutionRate: number;
  };
  dailyStats: Array<{
    date: string;
    chats: number;
    avgResponseTime: number;
    satisfactionScore: number;
  }>;
  agentStats: Array<{
    agentId: number;
    agentName: string;
    totalChats: number;
    avgResponseTime: number;
    satisfactionScore: number;
    resolutionRate: number;
  }>;
  departmentStats: Array<{
    department: string;
    totalChats: number;
    avgResponseTime: number;
    satisfactionScore: number;
  }>;
  hourlyStats: Array<{
    hour: number;
    chats: number;
    avgResponseTime: number;
  }>;
}

export default function LiveChatAnalyticsPage() {
  const router = useRouter();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = async () => {
    try {
      const response = await fetch(`/api/live-chat/analytics?timeRange=${timeRange}`);
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      }
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportData = () => {
    if (!analytics) return;

    const dataStr = JSON.stringify(analytics, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);

    const exportFileDefaultName = `live-chat-analytics-${timeRange}-${new Date().toISOString().split('T')[0]}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <BarChart3 className="mx-auto h-8 w-8 animate-spin text-primary mb-4" />
          <p>Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <BarChart3 className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No analytics data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/admin/live-chat')}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Terug naar Live Chat
              </Button>
              <div>
                <h1 className="text-3xl font-bold">Live Chat Analytics</h1>
                <p className="text-muted-foreground">Detailed insights into chat performance and agent productivity</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1d">Last 24h</SelectItem>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="90d">Last 90 days</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={loadAnalytics} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button onClick={exportData} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="agents">Agents</TabsTrigger>
            <TabsTrigger value="departments">Departments</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="mt-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Chats</CardTitle>
                  <MessageCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics.overview.totalChats}</div>
                  <p className="text-xs text-muted-foreground">
                    In selected time period
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics.overview.avgResponseTime}s</div>
                  <p className="text-xs text-muted-foreground">
                    Industry standard: under 30s
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Satisfaction Score</CardTitle>
                  <Star className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics.overview.satisfactionScore?.toFixed(1) || 'N/A'}</div>
                  <p className="text-xs text-muted-foreground">
                    Out of 5.0
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Resolution Rate</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{(analytics.overview.resolutionRate * 100).toFixed(1)}%</div>
                  <p className="text-xs text-muted-foreground">
                    Chats resolved successfully
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Performance Indicators */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Response Time Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Under 30 seconds</span>
                      <Badge variant="default" className="bg-green-500">
                        {analytics.overview.avgResponseTime < 30 ? '✓ Good' : '✗ Needs improvement'}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Under 60 seconds</span>
                      <Badge variant={analytics.overview.avgResponseTime < 60 ? "default" : "secondary"}>
                        {analytics.overview.avgResponseTime < 60 ? '✓ Acceptable' : '✗ Slow'}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Over 120 seconds</span>
                      <Badge variant="destructive">
                        {analytics.overview.avgResponseTime > 120 ? '✗ Too slow' : '✓ Good'}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Satisfaction Levels</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Excellent (4.5+)</span>
                      <Badge variant={analytics.overview.satisfactionScore >= 4.5 ? "default" : "secondary"}>
                        {analytics.overview.satisfactionScore >= 4.5 ? '✓' : '○'}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Good (3.5-4.4)</span>
                      <Badge variant={
                        analytics.overview.satisfactionScore >= 3.5 && analytics.overview.satisfactionScore < 4.5
                          ? "default" : "secondary"
                      }>
                        {analytics.overview.satisfactionScore >= 3.5 && analytics.overview.satisfactionScore < 4.5 ? '✓' : '○'}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Needs improvement (under 3.5)</span>
                      <Badge variant={analytics.overview.satisfactionScore < 3.5 ? "destructive" : "secondary"}>
                        {analytics.overview.satisfactionScore < 3.5 ? '✗' : '○'}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Resolution Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Excellent (95%+)</span>
                      <Badge variant={analytics.overview.resolutionRate >= 0.95 ? "default" : "secondary"}>
                        {analytics.overview.resolutionRate >= 0.95 ? '✓' : '○'}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Good (85-94%)</span>
                      <Badge variant={
                        analytics.overview.resolutionRate >= 0.85 && analytics.overview.resolutionRate < 0.95
                          ? "default" : "secondary"
                      }>
                        {analytics.overview.resolutionRate >= 0.85 && analytics.overview.resolutionRate < 0.95 ? '✓' : '○'}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Needs attention (under 85%)</span>
                      <Badge variant={analytics.overview.resolutionRate < 0.85 ? "destructive" : "secondary"}>
                        {analytics.overview.resolutionRate < 0.85 ? '✗' : '○'}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Agents Tab */}
          <TabsContent value="agents" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Agent Performance</CardTitle>
                <CardDescription>
                  Individual agent statistics and performance metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.agentStats.map((agent) => (
                    <div key={agent.agentId} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-medium">{agent.agentName}</h3>
                        <Badge variant="outline">{agent.totalChats} chats</Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Avg Response:</span>
                          <div className="font-medium">{agent.avgResponseTime}s</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Satisfaction:</span>
                          <div className="font-medium">{agent.satisfactionScore?.toFixed(1) || 'N/A'}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Resolution:</span>
                          <div className="font-medium">{(agent.resolutionRate * 100).toFixed(1)}%</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Departments Tab */}
          <TabsContent value="departments" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Department Performance</CardTitle>
                <CardDescription>
                  Performance metrics by department
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.departmentStats.map((dept) => (
                    <div key={dept.department} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-medium capitalize">{dept.department}</h3>
                        <Badge variant="outline">{dept.totalChats} chats</Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Avg Response:</span>
                          <div className="font-medium">{dept.avgResponseTime}s</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Satisfaction:</span>
                          <div className="font-medium">{dept.satisfactionScore?.toFixed(1) || 'N/A'}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Volume:</span>
                          <div className="font-medium">{dept.totalChats}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Trends Tab */}
          <TabsContent value="trends" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Daily Chat Volume</CardTitle>
                  <CardDescription>
                    Number of chats per day over time
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {analytics.dailyStats.slice(-7).map((day) => (
                      <div key={day.date} className="flex items-center justify-between">
                        <span className="text-sm">{new Date(day.date).toLocaleDateString()}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-500 h-2 rounded-full"
                              style={{
                                width: `${(day.chats / Math.max(...analytics.dailyStats.map(d => d.chats))) * 100}%`
                              }}
                            />
                          </div>
                          <span className="text-sm font-medium w-8 text-right">{day.chats}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Peak Hours</CardTitle>
                  <CardDescription>
                    Chat volume by hour of day
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {analytics.hourlyStats.map((hour) => (
                      <div key={hour.hour} className="flex items-center justify-between">
                        <span className="text-sm">{hour.hour}:00</span>
                        <div className="flex items-center gap-2">
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-green-500 h-2 rounded-full"
                              style={{
                                width: `${(hour.chats / Math.max(...analytics.hourlyStats.map(h => h.chats))) * 100}%`
                              }}
                            />
                          </div>
                          <span className="text-sm font-medium w-8 text-right">{hour.chats}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}