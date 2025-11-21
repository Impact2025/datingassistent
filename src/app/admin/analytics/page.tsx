"use client";

import { useUser } from '@/providers/user-provider';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { LoadingSpinner } from '@/components/shared/loading-spinner';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useTimeoutLoading } from '@/hooks/use-timeout-loading';
import { SEODashboard } from '@/components/admin/seo-dashboard';
import { LocalSEOSettings } from '@/components/admin/local-seo-settings';
import { PerformanceMonitor } from '@/components/admin/performance-monitor';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const ADMIN_EMAILS = ['v_mun@hotmail.com', 'v.munster@weareimpact.nl'];

interface AnalyticsData {
  totalUsers: number;
  totalRevenue: number;
  activeSubscriptions: number;
  freeUsers: number;
  premiumUsers: number;
  proUsers: number;
  monthlyRevenue: number;
  recentTransactions: Transaction[];
}

interface Transaction {
  id: string;
  userId: string;
  userEmail: string;
  plan: string;
  amount: number;
  date: any;
}

export default function AnalyticsPage() {
  const { user, loading } = useUser();
  const router = useRouter();
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalUsers: 0,
    totalRevenue: 0,
    activeSubscriptions: 0,
    freeUsers: 0,
    premiumUsers: 0,
    proUsers: 0,
    monthlyRevenue: 0,
    recentTransactions: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("analytics");

  // Add timeout loading protection
  useTimeoutLoading(isLoading, setIsLoading, 5000);

  useEffect(() => {
    console.log('AnalyticsPage - useEffect triggered', { user, loading });
    
    if (!loading) {
      console.log('AnalyticsPage - User loaded, checking permissions');
      
      if (!user) {
        console.log('AnalyticsPage - No user, redirecting to dashboard');
        router.push('/dashboard');
      } else if (user.email && !ADMIN_EMAILS.includes(user.email)) {
        console.log('AnalyticsPage - Not admin, redirecting to dashboard');
        router.push('/dashboard');
      } else {
        console.log('AnalyticsPage - Admin user, loading analytics');
        loadAnalytics();
      }
    }
  }, [user, loading, router]);

  const loadAnalytics = async () => {
    try {
      console.log('AnalyticsPage - Loading analytics data from Neon');
      setIsLoading(true);
      setError(null);

      // Fetch analytics from API
      const response = await fetch('/api/admin/analytics');

      if (!response.ok) {
        throw new Error('Failed to fetch analytics');
      }

      const data = await response.json();

      setAnalytics({
        totalUsers: data.totalUsers || 0,
        totalRevenue: data.totalRevenue || 0,
        activeSubscriptions: data.activeSubscriptions || 0,
        freeUsers: data.freeUsers || 0,
        premiumUsers: data.premiumUsers || 0,
        proUsers: data.proUsers || 0,
        monthlyRevenue: data.monthlyRevenue || 0,
        recentTransactions: data.recentTransactions || [],
      });

      console.log('AnalyticsPage - Analytics data loaded successfully from Neon');
    } catch (error) {
      console.error('AnalyticsPage - Error loading analytics:', error);
      setError('Failed to load analytics data: ' + (error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  if (loading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-500 mb-4">Error</h1>
          <p className="text-muted-foreground">{error}</p>
          <Button onClick={loadAnalytics} className="mt-4">Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <Button onClick={() => router.push('/admin')}>Back to Admin</Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="analytics">Business Analytics</TabsTrigger>
          <TabsTrigger value="seo">SEO Dashboard</TabsTrigger>
          <TabsTrigger value="local-seo">Local SEO</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>
        
        <TabsContent value="analytics" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle>Total Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{analytics.totalUsers}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Active Subscriptions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{analytics.activeSubscriptions}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Total Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">€{analytics.totalRevenue.toFixed(2)}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Monthly Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">€{analytics.monthlyRevenue.toFixed(2)}</div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle>User Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Free Users</span>
                    <span className="font-medium">{analytics.freeUsers}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Premium Users</span>
                    <span className="font-medium">{analytics.premiumUsers}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Pro Users</span>
                    <span className="font-medium">{analytics.proUsers}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Recent Transactions</CardTitle>
              </CardHeader>
              <CardContent>
                {analytics.recentTransactions.length > 0 ? (
                  <div className="space-y-3">
                    {analytics.recentTransactions.map((transaction) => (
                      <div key={transaction.id} className="flex justify-between items-center border-b pb-2">
                        <div>
                          <p className="font-medium">{transaction.userEmail || 'Unknown User'}</p>
                          <p className="text-sm text-muted-foreground">{transaction.plan}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">€{transaction.amount.toFixed(2)}</p>
                          <p className="text-sm text-muted-foreground">
                            {transaction.date?.toDate ? 
                              transaction.date.toDate().toLocaleDateString() : 
                              new Date(transaction.date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No recent transactions</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="seo" className="mt-6">
          <SEODashboard />
        </TabsContent>
        
        <TabsContent value="local-seo" className="mt-6">
          <LocalSEOSettings />
        </TabsContent>
        
        <TabsContent value="performance" className="mt-6">
          <PerformanceMonitor />
        </TabsContent>
      </Tabs>
    </div>
  );
}