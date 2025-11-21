'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { profileAnalytics } from '@/lib/profile-analytics';
import { abTesting } from '@/lib/ab-testing';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import {
  TrendingUp,
  Users,
  Copy,
  Target,
  BarChart3,
  RefreshCw
} from 'lucide-react';

interface AnalyticsData {
  totalUsers: number;
  totalSessions: number;
  averageCompletionRate: number;
  averageCopyRate: number;
  topPerformingProfiles: Array<{
    profileType: string;
    copyRate: number;
    sampleCount: number;
  }>;
}

interface ABTestResults {
  testId: string;
  variantId: string;
  participants: number;
  conversions: number;
  conversionRate: number;
  confidence: number;
}

export function AnalyticsDashboard() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [abTestResults, setAbTestResults] = useState<ABTestResults[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const loadAnalytics = async () => {
    try {
      setIsLoading(true);

      // Load aggregate analytics
      const analytics = await profileAnalytics.getAggregateAnalytics(30);
      setAnalyticsData(analytics);

      // Load A/B test results
      const activeTests = abTesting.getActiveTests();
      const testResults: ABTestResults[] = [];

      for (const test of activeTests) {
        const results = await abTesting.getTestResults(test.id);
        testResults.push(...results.map(result => ({
          testId: test.id,
          ...result
        })));
      }

      setAbTestResults(testResults);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, []);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            AI Profile Builder performance metrics and A/B testing results
          </p>
        </div>
        <Button onClick={loadAnalytics} variant="outline" className="gap-2">
          <RefreshCw className="w-4 h-4" />
          Refresh
        </Button>
      </div>

      <div className="text-sm text-muted-foreground">
        Last updated: {lastUpdated.toLocaleString()}
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="ab-testing">A/B Testing</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analyticsData?.totalUsers || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Active profile builder users
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analyticsData?.totalSessions || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Profile builder sessions
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analyticsData?.averageCompletionRate || 0}%</div>
                <p className="text-xs text-muted-foreground">
                  Quiz completion rate
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Copy Rate</CardTitle>
                <Copy className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analyticsData?.averageCopyRate || 0}%</div>
                <p className="text-xs text-muted-foreground">
                  Profile copy rate
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Top Performing Profiles */}
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Profile Types</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analyticsData?.topPerformingProfiles || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="profileType" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="copyRate" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ab-testing" className="space-y-6">
          {abTestResults.length === 0 ? (
            <Card>
              <CardContent className="flex items-center justify-center h-64">
                <p className="text-muted-foreground">No A/B test data available yet</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {abTestResults.map((result, index) => (
                <Card key={`${result.testId}-${result.variantId}`}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{result.testId} - {result.variantId}</span>
                      <Badge variant={result.confidence > 95 ? "default" : "secondary"}>
                        {result.confidence}% confidence
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span>Participants:</span>
                        <span className="font-semibold">{result.participants}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Conversions:</span>
                        <span className="font-semibold">{result.conversions}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Conversion Rate:</span>
                        <span className="font-semibold">{result.conversionRate.toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${result.conversionRate}%` }}
                        ></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Conversion Funnel</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span>Quiz Started</span>
                  </div>
                  <span className="font-semibold">{analyticsData?.totalSessions || 0}</span>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span>Quiz Completed</span>
                  </div>
                  <span className="font-semibold">
                    {Math.round((analyticsData?.totalSessions || 0) * (analyticsData?.averageCompletionRate || 0) / 100)}
                  </span>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                    <span>Profile Generated</span>
                  </div>
                  <span className="font-semibold">
                    {Math.round((analyticsData?.totalSessions || 0) * (analyticsData?.averageCompletionRate || 0) / 100)}
                  </span>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                    <span>Profile Copied</span>
                  </div>
                  <span className="font-semibold">
                    {Math.round((analyticsData?.totalSessions || 0) * (analyticsData?.averageCopyRate || 0) / 100)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}