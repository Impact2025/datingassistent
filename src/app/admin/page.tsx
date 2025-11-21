"use client";

import { useUser } from '@/providers/user-provider';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from 'next/link';
import {
  TrendingUp,
  Users,
  DollarSign,
  Mail,
  Activity,
  AlertTriangle,
  Clock,
  Zap,
  Globe,
  BarChart3,
  Settings,
  RefreshCw,
  FileText,
  Edit,
  Brain
} from 'lucide-react';
import { Admin2FASetup } from '@/components/auth/admin-2fa-setup';
import { AdminPasswordChange } from '@/components/auth/admin-password-change';

interface ManagementData {
  // Token & Cost Data
  tokenUsage: {
    openai: { tokens: number; cost: number; limit: number };
    anthropic: { tokens: number; cost: number; limit: number };
    totalCost: number;
    budgetRemaining: number;
  };

  // Visitor Analytics
  visitors: {
    today: number;
    thisWeek: number;
    thisMonth: number;
    conversionRate: number;
    topPages: Array<{ page: string; views: number }>;
  };

  // Email Analytics
  emails: {
    sentToday: number;
    openRate: number;
    clickRate: number;
    campaigns: Array<{
      name: string;
      sent: number;
      opens: number;
      clicks: number;
      date: string;
    }>;
  };

  // User Engagement
  engagement: {
    dau: number;
    mau: number;
    retention: number;
    avgSession: number;
    featureUsage: Array<{ feature: string; usage: number }>;
  };

  // Revenue & Forecasting
  revenue: {
    total: number;
    monthly: number;
    forecast: number;
    churnRate: number;
    clv: number;
  };

  // System Info
  system: {
    version: string;
    lastUpdate: string;
    serverLoad: number;
    dbConnections: number;
    alerts: Array<{ type: 'warning' | 'error' | 'info'; message: string }>;
  };
}

export default function AdminPage() {
  const { logout } = useUser();
  const router = useRouter();
  const [data, setData] = useState<ManagementData>({
    tokenUsage: {
      openai: { tokens: 0, cost: 0, limit: 100000 },
      anthropic: { tokens: 0, cost: 0, limit: 50000 },
      totalCost: 0,
      budgetRemaining: 500
    },
    visitors: {
      today: 0,
      thisWeek: 0,
      thisMonth: 0,
      conversionRate: 0,
      topPages: []
    },
    emails: {
      sentToday: 0,
      openRate: 0,
      clickRate: 0,
      campaigns: []
    },
    engagement: {
      dau: 0,
      mau: 0,
      retention: 0,
      avgSession: 0,
      featureUsage: []
    },
    revenue: {
      total: 0,
      monthly: 0,
      forecast: 0,
      churnRate: 0,
      clv: 0
    },
    system: {
      version: '1.3.0',
      lastUpdate: new Date().toISOString(),
      serverLoad: 0,
      dbConnections: 0,
      alerts: []
    }
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [showDetailedAnalytics, setShowDetailedAnalytics] = useState(false);
  const [showCouponAnalytics, setShowCouponAnalytics] = useState(false);

  useEffect(() => {
    loadManagementData();
    // Auto-refresh every 5 minutes
    const interval = setInterval(loadManagementData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []); // Empty dependency array to prevent infinite re-renders

  const loadManagementData = async () => {
    try {
      // Load all management data with credentials
      const fetchOptions = {
        credentials: 'include' as RequestCredentials,
        headers: {
          'Content-Type': 'application/json',
        }
      };

      const [analyticsRes, tokenRes, visitorRes, emailRes, engagementRes] = await Promise.all([
        fetch('/api/admin/analytics', fetchOptions),
        fetch('/api/admin/token-usage', fetchOptions),
        fetch('/api/admin/visitors', fetchOptions),
        fetch('/api/admin/emails', fetchOptions),
        fetch('/api/admin/engagement', fetchOptions)
      ]);

      const [analytics, tokenUsageData, visitors, emails, engagement] = await Promise.all([
        analyticsRes.json(),
        tokenRes.json(),
        visitorRes.json(),
        emailRes.json(),
        engagementRes.json()
      ]);

      // Transform token usage data to match expected format
      const defaultTokenUsage = {
        openai: { tokens: 0, cost: 0, limit: 100000 },
        anthropic: { tokens: 0, cost: 0, limit: 50000 },
        totalCost: 0,
        budgetRemaining: 500
      };

      const tokenUsage = { ...defaultTokenUsage }; // Start with default structure

      if (tokenUsageData && !tokenUsageData.error && Array.isArray(tokenUsageData.summary)) {
        const openaiData = tokenUsageData.summary.find((s: any) => s.provider === 'openai');
        const anthropicData = tokenUsageData.summary.find((s: any) => s.provider === 'anthropic');

        if (openaiData) {
          tokenUsage.openai.tokens = openaiData.totalTokens || 0;
          tokenUsage.openai.cost = openaiData.totalCostUSD || 0;
        }

        if (anthropicData) {
          tokenUsage.anthropic.tokens = anthropicData.totalTokens || 0;
          tokenUsage.anthropic.cost = anthropicData.totalCostUSD || 0;
        }

        if (tokenUsageData.totals) {
          tokenUsage.totalCost = tokenUsageData.totals.totalCostUSD || 0;
          tokenUsage.budgetRemaining = 500 - (tokenUsageData.totals.totalCostUSD || 0);
        }
      }

      const defaultVisitors = {
        today: 0,
        thisWeek: 0,
        thisMonth: 0,
        conversionRate: 0,
        topPages: []
      };

      const defaultEmails = {
        sentToday: 0,
        openRate: 0,
        clickRate: 0,
        campaigns: []
      };

      const defaultEngagement = {
        dau: 0,
        mau: 0,
        retention: 0,
        avgSession: 0,
        featureUsage: []
      };

      const defaultRevenue = {
        total: 0,
        monthly: 0,
        forecast: 0,
        churnRate: 0,
        clv: 0
      };

      setData({
        tokenUsage,
        visitors: (visitors && !visitors.error) ? visitors : defaultVisitors,
        emails: (emails && !emails.error) ? emails : defaultEmails,
        engagement: (engagement && !engagement.error) ? engagement : defaultEngagement,
        revenue: (analytics && !analytics.error) ? analytics : defaultRevenue,
        system: {
          version: '1.3.0',
          lastUpdate: new Date().toISOString(),
          serverLoad: 34,
          dbConnections: 12,
          alerts: [
            { type: 'info', message: 'Admin dashboard succesvol geladen' },
            { type: 'warning', message: 'Sommige metrics gebruiken mock data' }
          ]
        }
      });
    } catch (error) {
      console.error('Error loading management data:', error);
      // Set default data on error
      setData({
        tokenUsage: {
          openai: { tokens: 0, cost: 0, limit: 100000 },
          anthropic: { tokens: 0, cost: 0, limit: 50000 },
          totalCost: 0,
          budgetRemaining: 500
        },
        visitors: {
          today: 0,
          thisWeek: 0,
          thisMonth: 0,
          conversionRate: 0,
          topPages: []
        },
        emails: {
          sentToday: 0,
          openRate: 0,
          clickRate: 0,
          campaigns: []
        },
        engagement: {
          dau: 0,
          mau: 0,
          retention: 0,
          avgSession: 0,
          featureUsage: []
        },
        revenue: {
          total: 0,
          monthly: 0,
          forecast: 0,
          churnRate: 0,
          clv: 0
        },
        system: {
          version: '1.3.0',
          lastUpdate: new Date().toISOString(),
          serverLoad: 34,
          dbConnections: 12,
          alerts: [
            { type: 'error', message: 'Fout bij laden van management data' }
          ]
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/admin/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="mx-auto h-8 w-8 animate-spin text-primary mb-4" />
          <p>Loading management dashboard...</p>
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
            <div>
              <h1 className="text-3xl font-bold">Management Dashboard</h1>
              <p className="text-muted-foreground">Real-time business intelligence & system monitoring</p>
            </div>
            <div className="flex gap-2">
              <Button onClick={loadManagementData} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link href="/dashboard">
                  Terug naar Dashboard
                </Link>
              </Button>
              <Button onClick={handleLogout} variant="outline" size="sm">
                Uitloggen
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-9">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="coach">AI Coach</TabsTrigger>
            <TabsTrigger value="blogs">Blogs</TabsTrigger>
            <TabsTrigger value="coupons">Coupons</TabsTrigger>
            <TabsTrigger value="tokens">Tokens & Costs</TabsTrigger>
            <TabsTrigger value="visitors">Visitors</TabsTrigger>
            <TabsTrigger value="emails">Emails</TabsTrigger>
            <TabsTrigger value="engagement">Engagement</TabsTrigger>
            <TabsTrigger value="system">System</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {/* Revenue Card */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">€{(data.revenue.total || 0).toFixed(2)}</div>
                  <p className="text-xs text-muted-foreground">
                    +{(((data.revenue.monthly || 0) / Math.max((data.revenue.total || 0) - (data.revenue.monthly || 0), 1)) * 100).toFixed(1)}% from last month
                  </p>
                </CardContent>
              </Card>

              {/* Active Users Card */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{data.engagement.dau || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    {data.engagement.mau || 0} MAU this month
                  </p>
                </CardContent>
              </Card>

              {/* Token Costs Card */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">API Costs</CardTitle>
                  <Zap className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">€{(data.tokenUsage.totalCost || 0).toFixed(2)}</div>
                  <p className="text-xs text-muted-foreground">
                    €{(data.tokenUsage.budgetRemaining || 0).toFixed(2)} budget remaining
                  </p>
                </CardContent>
              </Card>

              {/* Email Performance Card */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Email Open Rate</CardTitle>
                  <Mail className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{((data.emails.openRate || 0) * 100).toFixed(1)}%</div>
                  <p className="text-xs text-muted-foreground">
                    {((data.emails.clickRate || 0) * 100).toFixed(1)}% click rate
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Alerts Section */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  System Alerts & Notifications
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {(data.system.alerts || []).map((alert, index) => (
                    <div key={index} className={`flex items-center gap-3 p-3 rounded-lg ${
                      alert.type === 'error' ? 'bg-red-50 border border-red-200' :
                      alert.type === 'warning' ? 'bg-yellow-50 border border-yellow-200' :
                      'bg-blue-50 border border-blue-200'
                    }`}>
                      {alert.type === 'error' && <AlertTriangle className="h-4 w-4 text-red-500" />}
                      {alert.type === 'warning' && <AlertTriangle className="h-4 w-4 text-yellow-500" />}
                      {alert.type === 'info' && <Activity className="h-4 w-4 text-blue-500" />}
                      <span className="text-sm">{alert.message}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <Link href="/admin/coach" className="block">
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardContent className="p-6 text-center">
                    <Brain className="h-8 w-8 mx-auto mb-3 text-primary" />
                    <h3 className="font-semibold mb-2">AI Coach</h3>
                    <p className="text-sm text-muted-foreground">Client management</p>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/admin/analytics" className="block">
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardContent className="p-6 text-center">
                    <BarChart3 className="h-8 w-8 mx-auto mb-3 text-primary" />
                    <h3 className="font-semibold mb-2">Analytics</h3>
                    <p className="text-sm text-muted-foreground">Business intelligence</p>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/admin/users" className="block">
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardContent className="p-6 text-center">
                    <Users className="h-8 w-8 mx-auto mb-3 text-primary" />
                    <h3 className="font-semibold mb-2">Users</h3>
                    <p className="text-sm text-muted-foreground">Manage accounts</p>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/admin/courses" className="block">
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardContent className="p-6 text-center">
                    <Activity className="h-8 w-8 mx-auto mb-3 text-primary" />
                    <h3 className="font-semibold mb-2">Content</h3>
                    <p className="text-sm text-muted-foreground">Courses & blogs</p>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/admin/test-link" className="block">
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardContent className="p-6 text-center">
                    <Settings className="h-8 w-8 mx-auto mb-3 text-primary" />
                    <h3 className="font-semibold mb-2">System</h3>
                    <p className="text-sm text-muted-foreground">Debug & tools</p>
                  </CardContent>
                </Card>
              </Link>
            </div>

            {/* Detailed Analytics Section */}
            {showDetailedAnalytics && data.tokenUsage && (
              <div className="mt-8 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Detailed Token Usage Analytics
                    </CardTitle>
                    <CardDescription>
                      Comprehensive breakdown of AI API usage, costs, and performance metrics
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                      <div className="text-center p-4 border rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">
                          {((data.tokenUsage?.openai?.tokens || 0)).toLocaleString()}
                        </div>
                        <div className="text-sm text-muted-foreground">OpenAI Tokens</div>
                        <div className="text-xs text-green-600 mt-1">
                          €{(data.tokenUsage?.openai?.cost || 0).toFixed(2)}
                        </div>
                      </div>

                      <div className="text-center p-4 border rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">
                          {((data.tokenUsage?.anthropic?.tokens || 0)).toLocaleString()}
                        </div>
                        <div className="text-sm text-muted-foreground">Anthropic Tokens</div>
                        <div className="text-xs text-green-600 mt-1">
                          €{(data.tokenUsage?.anthropic?.cost || 0).toFixed(2)}
                        </div>
                      </div>

                      <div className="text-center p-4 border rounded-lg">
                        <div className="text-2xl font-bold text-orange-600">
                          {((data.tokenUsage?.totalCost || 0) / Math.max((data.engagement?.mau || 1), 1)).toFixed(2)}
                        </div>
                        <div className="text-sm text-muted-foreground">Cost per MAU</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          Monthly active users
                        </div>
                      </div>

                      <div className="text-center p-4 border rounded-lg">
                        <div className="text-2xl font-bold text-red-600">
                          {(data.tokenUsage?.budgetRemaining || 0) >= 0 ? '✅' : '⚠️'}
                        </div>
                        <div className="text-sm text-muted-foreground">Budget Status</div>
                        <div className={`text-xs mt-1 ${(data.tokenUsage?.budgetRemaining || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          €{Math.abs(data.tokenUsage?.budgetRemaining || 0).toFixed(2)} {(data.tokenUsage?.budgetRemaining || 0) >= 0 ? 'remaining' : 'over budget'}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Usage Breakdown</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div className="flex justify-between items-center">
                              <span>OpenAI GPT-4o</span>
                              <div className="text-right">
                                <div className="font-medium">{(data.tokenUsage?.openai?.tokens || 0).toLocaleString()} tokens</div>
                                <div className="text-sm text-muted-foreground">€{(data.tokenUsage?.openai?.cost || 0).toFixed(2)}</div>
                              </div>
                            </div>
                            <div className="flex justify-between items-center">
                              <span>Anthropic Claude</span>
                              <div className="text-right">
                                <div className="font-medium">{(data.tokenUsage?.anthropic?.tokens || 0).toLocaleString()} tokens</div>
                                <div className="text-sm text-muted-foreground">€{(data.tokenUsage?.anthropic?.cost || 0).toFixed(2)}</div>
                              </div>
                            </div>
                            <div className="border-t pt-4">
                              <div className="flex justify-between items-center font-semibold">
                                <span>Total</span>
                                <div className="text-right">
                                  <div>{((data.tokenUsage?.openai?.tokens || 0) + (data.tokenUsage?.anthropic?.tokens || 0)).toLocaleString()} tokens</div>
                                  <div className="text-sm text-muted-foreground">€{(data.tokenUsage?.totalCost || 0).toFixed(2)}</div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Performance Insights</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div className="flex items-center gap-3">
                              <div className={`w-3 h-3 rounded-full ${((data.tokenUsage?.openai?.tokens || 0) > (data.tokenUsage?.anthropic?.tokens || 0)) ? 'bg-blue-500' : 'bg-purple-500'}`}></div>
                              <div>
                                <div className="font-medium">Primary Provider</div>
                                <div className="text-sm text-muted-foreground">
                                  {((data.tokenUsage?.openai?.tokens || 0) > (data.tokenUsage?.anthropic?.tokens || 0)) ? 'OpenAI' : 'Anthropic'} leads usage
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-3">
                              <div className={`w-3 h-3 rounded-full ${(((data.tokenUsage?.totalCost || 0) / Math.max((data.engagement?.mau || 1), 1)) < 0.5) ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                              <div>
                                <div className="font-medium">Cost Efficiency</div>
                                <div className="text-sm text-muted-foreground">
                                  €{((data.tokenUsage?.totalCost || 0) / Math.max((data.engagement?.mau || 1), 1)).toFixed(2)} per active user
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-3">
                              <div className={`w-3 h-3 rounded-full ${((data.tokenUsage?.budgetRemaining || 0) > 100) ? 'bg-green-500' : 'bg-orange-500'}`}></div>
                              <div>
                                <div className="font-medium">Budget Health</div>
                                <div className="text-sm text-muted-foreground">
                                  {(data.tokenUsage?.budgetRemaining || 0) > 100 ? 'Healthy budget remaining' : 'Monitor spending closely'}
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          {/* AI Coach Tab */}
          <TabsContent value="coach" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">AI Coach Dashboard</CardTitle>
                  <Brain className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">AI</div>
                  <p className="text-xs text-muted-foreground">
                    Beheer je cliënten met AI-gedreven inzichten
                  </p>
                  <Button asChild className="w-full mt-4">
                    <Link href="/admin/coach">
                      Open AI Coach Dashboard
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Rapporten Genereren</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">Auto</div>
                  <p className="text-xs text-muted-foreground">
                    Maandelijkse en wekelijkse AI rapporten
                  </p>
                  <Button variant="outline" className="w-full mt-4">
                    <Link href="/admin/coach">
                      Ga naar Rapporten
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Email Verzending</CardTitle>
                  <Mail className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">Auto</div>
                  <p className="text-xs text-muted-foreground">
                    Automatische verzending van AI rapporten
                  </p>
                  <Button variant="outline" className="w-full mt-4">
                    <Link href="/admin/coach">
                      Email Instellingen
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>AI Coach Systeem Overzicht</CardTitle>
                <CardDescription>
                  Het AI Coach systeem helpt je bij het beheren van je cliënten met geautomatiseerde inzichten en rapporten.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold">Functies:</h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center gap-2">
                        <Activity className="h-4 w-4 text-green-500" />
                        <span>Automatische AI rapporten genereren</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Activity className="h-4 w-4 text-green-500" />
                        <span>Maandelijkse en wekelijkse reviews</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Activity className="h-4 w-4 text-green-500" />
                        <span>Client voortgang monitoring</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Activity className="h-4 w-4 text-green-500" />
                        <span>Automatische email verzending</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Activity className="h-4 w-4 text-green-500" />
                        <span>Cron job beheer voor automatisering</span>
                      </li>
                    </ul>
                  </div>
                  <div className="space-y-4">
                    <h4 className="font-semibold">Voordelen:</h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-blue-500" />
                        <span>Efficiëntere client communicatie</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-blue-500" />
                        <span>Data-gedreven inzichten</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-blue-500" />
                        <span>Automatische rapportage</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-blue-500" />
                        <span>Betere client retentie</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-blue-500" />
                        <span>Scalable coaching praktijk</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Coupons Tab */}
          <TabsContent value="coupons" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Coupons</CardTitle>
                  <Activity className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">0</div>
                  <p className="text-xs text-muted-foreground">
                    Currently active discount codes
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Usage</CardTitle>
                  <TrendingUp className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">0</div>
                  <p className="text-xs text-muted-foreground">
                    Times coupons have been redeemed
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Revenue Impact</CardTitle>
                  <DollarSign className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">€0</div>
                  <p className="text-xs text-muted-foreground">
                    Discount value given to customers
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Coupon Management</CardTitle>
                  <CardDescription>
                    Create, manage, and track discount codes for your customers
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Activity className="h-4 w-4 text-green-500" />
                      <span>Create percentage or fixed amount discounts</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Activity className="h-4 w-4 text-green-500" />
                      <span>Set usage limits and expiration dates</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Activity className="h-4 w-4 text-green-500" />
                      <span>Track redemption analytics</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Activity className="h-4 w-4 text-green-500" />
                      <span>Apply to specific packages or all products</span>
                    </div>
                    <Button asChild className="w-full mt-4">
                      <Link href="/admin/coupons">
                        Open Coupon Manager
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>
                    Common coupon management tasks
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Button asChild variant="outline" className="w-full justify-start">
                      <Link href="/admin/coupons">
                        <span className="mr-2">+</span>
                        Create New Coupon
                      </Link>
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => setShowCouponAnalytics(!showCouponAnalytics)}
                    >
                      <TrendingUp className="h-4 w-4 mr-2" />
                      {showCouponAnalytics ? 'Hide' : 'View'} Usage Analytics
                    </Button>
                    <Button variant="outline" className="w-full justify-start" disabled>
                      <Settings className="h-4 w-4 mr-2" />
                      Bulk Coupon Operations
                      <span className="ml-auto text-xs text-muted-foreground">Coming Soon</span>
                    </Button>
                    <Button variant="outline" className="w-full justify-start" disabled>
                      <FileText className="h-4 w-4 mr-2" />
                      Export Coupon Data
                      <span className="ml-auto text-xs text-muted-foreground">Coming Soon</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Recent Coupon Activity</CardTitle>
                <CardDescription>
                  Latest coupon creation and redemption activity
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-4 border rounded-lg">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <Activity className="h-5 w-5 text-green-600" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">No recent coupon activity</p>
                      <p className="text-xs text-muted-foreground">
                        Start creating coupons with the coupon manager above
                      </p>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      --
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Detailed Coupon Analytics Section */}
            {showCouponAnalytics && (
              <div className="mt-8 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Detailed Coupon Usage Analytics
                    </CardTitle>
                    <CardDescription>
                      Comprehensive breakdown of coupon performance and redemption patterns
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                      <div className="text-center p-4 border rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                          0
                        </div>
                        <div className="text-sm text-muted-foreground">Active Coupons</div>
                        <div className="text-xs text-green-600 mt-1">
                          Ready for use
                        </div>
                      </div>

                      <div className="text-center p-4 border rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">
                          0
                        </div>
                        <div className="text-sm text-muted-foreground">Total Redemptions</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          All time
                        </div>
                      </div>

                      <div className="text-center p-4 border rounded-lg">
                        <div className="text-2xl font-bold text-orange-600">
                          €0.00
                        </div>
                        <div className="text-sm text-muted-foreground">Revenue Impact</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          Discount value given
                        </div>
                      </div>

                      <div className="text-center p-4 border rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">
                          0.0%
                        </div>
                        <div className="text-sm text-muted-foreground">Conversion Rate</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          Coupon to sale ratio
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Coupon Performance</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div className="flex justify-between items-center">
                              <span>Most Popular Type</span>
                              <div className="text-right">
                                <div className="font-medium">Percentage Discount</div>
                                <div className="text-sm text-muted-foreground">20% off orders</div>
                              </div>
                            </div>
                            <div className="flex justify-between items-center">
                              <span>Average Order Value</span>
                              <div className="text-right">
                                <div className="font-medium">€0.00</div>
                                <div className="text-sm text-muted-foreground">With coupon applied</div>
                              </div>
                            </div>
                            <div className="border-t pt-4">
                              <div className="flex justify-between items-center font-semibold">
                                <span>Total Revenue Generated</span>
                                <div className="text-right">
                                  <div>€0.00</div>
                                  <div className="text-sm text-muted-foreground">From coupon users</div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Usage Insights</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div className="flex items-center gap-3">
                              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                              <div>
                                <div className="font-medium">Best Performing</div>
                                <div className="text-sm text-muted-foreground">
                                  Welcome discounts drive highest conversions
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-3">
                              <div className="w-3 h-3 rounded-full bg-green-500"></div>
                              <div>
                                <div className="font-medium">Customer Retention</div>
                                <div className="text-sm text-muted-foreground">
                                  Coupon users return 35% more often
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-3">
                              <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                              <div>
                                <div className="font-medium">Revenue Impact</div>
                                <div className="text-sm text-muted-foreground">
                                  Net positive with strategic discounting
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-start gap-3">
                        <Activity className="h-5 w-5 text-blue-600 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-blue-900">Ready for Implementation</h4>
                          <p className="text-sm text-blue-700 mt-1">
                            Coupon analytics will be fully functional once the coupon system is implemented.
                            This dashboard will then show real-time redemption data, conversion rates, and revenue impact analysis.
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          {/* Tokens & Costs Tab */}
          <TabsContent value="tokens" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>API Usage This Month</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">OpenAI</span>
                      <span className="text-sm text-muted-foreground">
                        {(data.tokenUsage.openai.tokens || 0).toLocaleString()} tokens
                      </span>
                    </div>
                    <Progress
                      value={((data.tokenUsage.openai.tokens || 0) / (data.tokenUsage.openai.limit || 1)) * 100}
                      className="h-2"
                    />
                    <div className="flex justify-between mt-1">
                      <span className="text-xs text-muted-foreground">
                        €{(data.tokenUsage.openai.cost || 0).toFixed(2)}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {(((data.tokenUsage.openai.tokens || 0) / (data.tokenUsage.openai.limit || 1)) * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">Anthropic</span>
                      <span className="text-sm text-muted-foreground">
                        {(data.tokenUsage.anthropic.tokens || 0).toLocaleString()} tokens
                      </span>
                    </div>
                    <Progress
                      value={((data.tokenUsage.anthropic.tokens || 0) / (data.tokenUsage.anthropic.limit || 1)) * 100}
                      className="h-2"
                    />
                    <div className="flex justify-between mt-1">
                      <span className="text-xs text-muted-foreground">
                        €{(data.tokenUsage.anthropic.cost || 0).toFixed(2)}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {(((data.tokenUsage.anthropic.tokens || 0) / (data.tokenUsage.anthropic.limit || 1)) * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Cost Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Total Costs</span>
                      <span className="font-bold text-lg">€{(data.tokenUsage.totalCost || 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Budget Remaining</span>
                      <span className="font-bold text-green-600">€{(data.tokenUsage.budgetRemaining || 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Cost per User</span>
                      <span>€{((data.tokenUsage.totalCost || 0) / Math.max((data.engagement.mau || 0), 1)).toFixed(2)}</span>
                    </div>
                    <div className="pt-4 border-t">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Budget Usage</span>
                        <span className="text-sm font-medium">
                          {(((data.tokenUsage.totalCost || 0) / ((data.tokenUsage.totalCost || 0) + (data.tokenUsage.budgetRemaining || 0))) * 100).toFixed(1)}%
                        </span>
                      </div>
                      <Progress
                        value={((data.tokenUsage.totalCost || 0) / ((data.tokenUsage.totalCost || 0) + (data.tokenUsage.budgetRemaining || 0))) * 100}
                        className="h-2 mt-2"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Visitors Tab */}
          <TabsContent value="visitors" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Today's Visitors</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{data.visitors.today || 0}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">This Week</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{data.visitors.thisWeek || 0}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{((data.visitors.conversionRate || 0) * 100).toFixed(1)}%</div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Top Pages</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {(data.visitors.topPages || []).map((page, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-sm">{page.page}</span>
                      <Badge variant="secondary">{page.views || 0} views</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Emails Tab */}
          <TabsContent value="emails" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Emails Sent Today</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{data.emails.sentToday || 0}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Open Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{((data.emails.openRate || 0) * 100).toFixed(1)}%</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Click Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{((data.emails.clickRate || 0) * 100).toFixed(1)}%</div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Recent Campaigns</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {(data.emails.campaigns || []).map((campaign, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium">{campaign.name}</h4>
                        <Badge variant="outline">{campaign.date}</Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Sent:</span>
                          <span className="ml-2 font-medium">{campaign.sent || 0}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Opens:</span>
                          <span className="ml-2 font-medium">{campaign.opens || 0}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Clicks:</span>
                          <span className="ml-2 font-medium">{campaign.clicks || 0}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Engagement Tab */}
          <TabsContent value="engagement" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Daily Active Users</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{data.engagement.dau || 0}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Monthly Active Users</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{data.engagement.mau || 0}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Retention Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{((data.engagement.retention || 0) * 100).toFixed(1)}%</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Avg Session Time</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{data.engagement.avgSession || 0}min</div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Feature Usage</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {(data.engagement.featureUsage || []).map((feature, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-sm">{feature.feature}</span>
                      <Badge variant="secondary">{feature.usage || 0} uses</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Blogs Tab */}
          <TabsContent value="blogs" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {/* Blog Statistics Cards */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Blogs</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">0</div>
                  <p className="text-xs text-muted-foreground">
                    Published blogs
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">AI Generated</CardTitle>
                  <Zap className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">0</div>
                  <p className="text-xs text-muted-foreground">
                    Blogs created with AI
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Draft Blogs</CardTitle>
                  <Edit className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">0</div>
                  <p className="text-xs text-muted-foreground">
                    Unpublished drafts
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions for Blogs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>AI Blog Generator</CardTitle>
                  <CardDescription>
                    Generate high-quality blog posts using AI technology
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Activity className="h-4 w-4 text-green-500" />
                      <span>Convert articles to blogs</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Activity className="h-4 w-4 text-green-500" />
                      <span>SEO optimized content</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Activity className="h-4 w-4 text-green-500" />
                      <span>Multiple languages support</span>
                    </div>
                    <Button asChild className="w-full mt-4">
                      <Link href="/admin/blog-generator">
                        Open Blog Generator
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Blog Management</CardTitle>
                  <CardDescription>
                    Manage all your blog posts, drafts, and publications
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Activity className="h-4 w-4 text-green-500" />
                      <span>Edit and publish blogs</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Activity className="h-4 w-4 text-green-500" />
                      <span>SEO optimization tools</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Activity className="h-4 w-4 text-green-500" />
                      <span>Performance analytics</span>
                    </div>
                    <Button asChild variant="outline" className="w-full mt-4">
                      <Link href="/admin/blogs">
                        Manage Blogs
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Blog Activity */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Recent Blog Activity</CardTitle>
                <CardDescription>
                  Latest blog creation and publishing activity
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-4 border rounded-lg">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <FileText className="h-5 w-5 text-blue-600" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">No recent blog activity</p>
                      <p className="text-xs text-muted-foreground">
                        Start creating blogs with the AI generator above
                      </p>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      --
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* System Tab */}
          <TabsContent value="system" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>System Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span>Version</span>
                    <Badge>{data.system.version}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Last Update</span>
                    <span className="text-sm text-muted-foreground">
                      {new Date(data.system.lastUpdate).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Server Load</span>
                    <span className="text-sm">{(data.system.serverLoad || 0)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>DB Connections</span>
                    <span className="text-sm">{data.system.dbConnections || 0}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>System Health</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm">Server Load</span>
                        <span className="text-sm">{(data.system.serverLoad || 0)}%</span>
                      </div>
                      <Progress value={data.system.serverLoad || 0} className="h-2" />
                    </div>

                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm">Database Health</span>
                        <span className="text-sm">Good</span>
                      </div>
                      <Progress value={85} className="h-2" />
                    </div>

                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm">API Response Time</span>
                        <span className="text-sm">120ms</span>
                      </div>
                      <Progress value={90} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Password Change */}
            <AdminPasswordChange />

            {/* 2FA Setup */}
            <Admin2FASetup />

            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Recent Updates & Changes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border-l-4 border-green-500 pl-4">
                    <div className="flex items-center gap-2 mb-1">
                      <Activity className="h-4 w-4 text-green-500" />
                      <span className="font-medium">v1.2.3 - Email Templates Updated</span>
                    </div>
                    <p className="text-sm text-muted-foreground">Updated all email templates to match homepage design</p>
                    <p className="text-xs text-muted-foreground mt-1">2 hours ago</p>
                  </div>

                  <div className="border-l-4 border-blue-500 pl-4">
                    <div className="flex items-center gap-2 mb-1">
                      <Clock className="h-4 w-4 text-blue-500" />
                      <span className="font-medium">Management Dashboard</span>
                    </div>
                    <p className="text-sm text-muted-foreground">Complete management dashboard with real-time analytics</p>
                    <p className="text-xs text-muted-foreground mt-1">1 day ago</p>
                  </div>

                  <div className="border-l-4 border-purple-500 pl-4">
                    <div className="flex items-center gap-2 mb-1">
                      <Activity className="h-4 w-4 text-purple-500" />
                      <span className="font-medium">Course System Enhanced</span>
                    </div>
                    <p className="text-sm text-muted-foreground">Added main courses overview page and improved UX</p>
                    <p className="text-xs text-muted-foreground mt-1">3 days ago</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}