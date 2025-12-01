"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  Activity,
  Target,
  DollarSign,
  Clock,
  Eye,
  MousePointer,
  Smartphone,
  Monitor,
  Calendar,
  Download,
  RefreshCw,
  Zap,
  Heart,
  MessageSquare,
  Star,
  Crown
} from "lucide-react";

interface AnalyticsData {
  overview: {
    totalUsers: number;
    activeUsers: number;
    newUsers: number;
    conversionRate: number;
    revenue: number;
    avgSessionDuration: number;
  };
  userBehavior: {
    pageViews: number;
    uniqueVisitors: number;
    bounceRate: number;
    returnVisitors: number;
    deviceBreakdown: {
      mobile: number;
      desktop: number;
      tablet: number;
    };
  };
  toolUsage: {
    emotionalReadiness: { completions: number; avgScore: number; };
    hechtingsstijl: { completions: number; avgScore: number; };
    chatCoach: { sessions: number; messages: number; };
    profileBuilder: { profiles: number; avgQuality: number; };
    datingStyle: { assessments: number; avgMaturity: number; };
  };
  conversionFunnel: {
    visitors: number;
    signups: number;
    assessments: number;
    premiumUpgrades: number;
    vipUpgrades: number;
  };
  timeSeries: Array<{
    date: string;
    users: number;
    revenue: number;
    assessments: number;
  }>;
}

export default function AdminAnalytics() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("7d");
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      // Mock comprehensive analytics data
      const mockData: AnalyticsData = {
        overview: {
          totalUsers: 2847,
          activeUsers: 1923,
          newUsers: 156,
          conversionRate: 16.2,
          revenue: 12847.50,
          avgSessionDuration: 1247 // seconds
        },
        userBehavior: {
          pageViews: 45231,
          uniqueVisitors: 8923,
          bounceRate: 34.2,
          returnVisitors: 2341,
          deviceBreakdown: {
            mobile: 68,
            desktop: 28,
            tablet: 4
          }
        },
        toolUsage: {
          emotionalReadiness: { completions: 1247, avgScore: 72.4 },
          hechtingsstijl: { completions: 892, avgScore: 78.1 },
          chatCoach: { sessions: 3456, messages: 12847 },
          profileBuilder: { profiles: 567, avgQuality: 8.2 },
          datingStyle: { assessments: 723, avgMaturity: 6.8 }
        },
        conversionFunnel: {
          visitors: 10000,
          signups: 1620,
          assessments: 1247,
          premiumUpgrades: 262,
          vipUpgrades: 45
        },
        timeSeries: Array.from({ length: 7 }, (_, i) => ({
          date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          users: Math.floor(Math.random() * 200) + 150,
          revenue: Math.floor(Math.random() * 2000) + 1000,
          assessments: Math.floor(Math.random() * 50) + 20
        })).reverse()
      };

      setData(mockData);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('nl-NL', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const getConversionRate = (from: number, to: number) => {
    return ((to / from) * 100).toFixed(1);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <BarChart3 className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No analytics data available</h3>
        <p className="mt-1 text-sm text-gray-500">Unable to load analytics dashboard.</p>
        <Button onClick={fetchAnalytics} className="mt-4">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600">
            Comprehensive insights into user behavior and platform performance
          </p>
        </div>
        <div className="flex items-center space-x-3">
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
          <span className="text-sm text-gray-500">
            Updated: {lastUpdated.toLocaleTimeString()}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchAnalytics}
            className="flex items-center space-x-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </Button>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">User Behavior</TabsTrigger>
          <TabsTrigger value="tools">Tool Usage</TabsTrigger>
          <TabsTrigger value="conversion">Conversion</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(data.overview.revenue)}</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-600">+23.1%</span> from last period
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.overview.activeUsers.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-600">+12.5%</span> from last period
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.overview.conversionRate}%</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-600">+2.1%</span> from last period
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Session</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatDuration(data.overview.avgSessionDuration)}</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-600">+8.3%</span> from last period
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Device Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Device Usage</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Smartphone className="h-4 w-4 text-blue-600" />
                    <span className="text-sm">Mobile</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <Progress value={data.userBehavior.deviceBreakdown.mobile} className="w-24" />
                    <span className="text-sm font-medium">{data.userBehavior.deviceBreakdown.mobile}%</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Monitor className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Desktop</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <Progress value={data.userBehavior.deviceBreakdown.desktop} className="w-24" />
                    <span className="text-sm font-medium">{data.userBehavior.deviceBreakdown.desktop}%</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Monitor className="h-4 w-4 text-purple-600" />
                    <span className="text-sm">Tablet</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <Progress value={data.userBehavior.deviceBreakdown.tablet} className="w-24" />
                    <span className="text-sm font-medium">{data.userBehavior.deviceBreakdown.tablet}%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* User Behavior Tab */}
        <TabsContent value="users" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Eye className="h-5 w-5" />
                  <span>Page Views</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{data.userBehavior.pageViews.toLocaleString()}</div>
                <p className="text-sm text-muted-foreground mt-1">
                  Total page views in selected period
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5" />
                  <span>Unique Visitors</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{data.userBehavior.uniqueVisitors.toLocaleString()}</div>
                <p className="text-sm text-muted-foreground mt-1">
                  Unique users who visited the platform
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MousePointer className="h-5 w-5" />
                  <span>Bounce Rate</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{data.userBehavior.bounceRate}%</div>
                <p className="text-sm text-muted-foreground mt-1">
                  Visitors who left after one page
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>User Engagement Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {((data.userBehavior.returnVisitors / data.userBehavior.uniqueVisitors) * 100).toFixed(1)}%
                  </div>
                  <div className="text-sm text-gray-600">Return Visitors</div>
                </div>

                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {(data.userBehavior.pageViews / data.userBehavior.uniqueVisitors).toFixed(1)}
                  </div>
                  <div className="text-sm text-gray-600">Pages per User</div>
                </div>

                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {formatDuration(data.overview.avgSessionDuration)}
                  </div>
                  <div className="text-sm text-gray-600">Avg Session</div>
                </div>

                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">
                    {data.overview.newUsers}
                  </div>
                  <div className="text-sm text-gray-600">New Users</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tool Usage Tab */}
        <TabsContent value="tools" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Heart className="h-5 w-5 text-pink-600" />
                  <span>Emotional Readiness</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Completions</span>
                    <span className="font-medium">{data.toolUsage.emotionalReadiness.completions}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Avg Score</span>
                    <span className="font-medium">{data.toolUsage.emotionalReadiness.avgScore}/100</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Star className="h-5 w-5 text-blue-600" />
                  <span>Hechtingsstijl</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Completions</span>
                    <span className="font-medium">{data.toolUsage.hechtingsstijl.completions}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Avg Score</span>
                    <span className="font-medium">{data.toolUsage.hechtingsstijl.avgScore}/100</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MessageSquare className="h-5 w-5 text-green-600" />
                  <span>Chat Coach</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Sessions</span>
                    <span className="font-medium">{data.toolUsage.chatCoach.sessions}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Messages</span>
                    <span className="font-medium">{data.toolUsage.chatCoach.messages}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="h-5 w-5 text-purple-600" />
                  <span>Profile Builder</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Profiles Created</span>
                    <span className="font-medium">{data.toolUsage.profileBuilder.profiles}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Avg Quality</span>
                    <span className="font-medium">{data.toolUsage.profileBuilder.avgQuality}/10</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Zap className="h-5 w-5 text-orange-600" />
                  <span>Dating Style</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Assessments</span>
                    <span className="font-medium">{data.toolUsage.datingStyle.assessments}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Avg Maturity</span>
                    <span className="font-medium">{data.toolUsage.datingStyle.avgMaturity}/10</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Conversion Funnel Tab */}
        <TabsContent value="conversion" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Conversion Funnel</CardTitle>
              <p className="text-sm text-muted-foreground">
                User journey from visitor to premium subscriber
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Eye className="h-5 w-5 text-gray-600" />
                    <span className="font-medium">Visitors</span>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-lg">{data.conversionFunnel.visitors.toLocaleString()}</div>
                    <div className="text-sm text-gray-600">100.0%</div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Users className="h-5 w-5 text-blue-600" />
                    <span className="font-medium">Signups</span>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-lg">{data.conversionFunnel.signups.toLocaleString()}</div>
                    <div className="text-sm text-blue-600">
                      {getConversionRate(data.conversionFunnel.visitors, data.conversionFunnel.signups)}%
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Target className="h-5 w-5 text-green-600" />
                    <span className="font-medium">Assessments</span>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-lg">{data.conversionFunnel.assessments.toLocaleString()}</div>
                    <div className="text-sm text-green-600">
                      {getConversionRate(data.conversionFunnel.signups, data.conversionFunnel.assessments)}%
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Star className="h-5 w-5 text-yellow-600" />
                    <span className="font-medium">Premium Upgrades</span>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-lg">{data.conversionFunnel.premiumUpgrades.toLocaleString()}</div>
                    <div className="text-sm text-yellow-600">
                      {getConversionRate(data.conversionFunnel.assessments, data.conversionFunnel.premiumUpgrades)}%
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Crown className="h-5 w-5 text-purple-600" />
                    <span className="font-medium">VIP Upgrades</span>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-lg">{data.conversionFunnel.vipUpgrades.toLocaleString()}</div>
                    <div className="text-sm text-purple-600">
                      {getConversionRate(data.conversionFunnel.premiumUpgrades, data.conversionFunnel.vipUpgrades)}%
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Trends Tab */}
        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>7-Day Trends</CardTitle>
              <p className="text-sm text-muted-foreground">
                Daily metrics over the past week
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.timeSeries.map((day, index) => (
                  <div key={day.date} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="font-medium">
                        {new Date(day.date).toLocaleDateString('nl-NL', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                    <div className="flex items-center space-x-6 text-sm">
                      <div className="text-center">
                        <div className="font-medium">{day.users}</div>
                        <div className="text-gray-500">Users</div>
                      </div>
                      <div className="text-center">
                        <div className="font-medium">€{day.revenue}</div>
                        <div className="text-gray-500">Revenue</div>
                      </div>
                      <div className="text-center">
                        <div className="font-medium">{day.assessments}</div>
                        <div className="text-gray-500">Assessments</div>
                      </div>
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