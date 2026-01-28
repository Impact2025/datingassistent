"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import * as Lucide from 'lucide-react';
import { useUser } from '@/providers/user-provider';
import { NotificationsPanel } from '@/components/community/notifications';
import { Header } from '@/components/layout/header';
import { MainNav } from '@/components/layout/main-nav';

interface FollowedItem {
  id: number;
  target_type: string;
  target_id: number;
  created_at: string;
  post_title?: string;
  category_name?: string;
}

interface UserStats {
  totalPosts: number;
  totalReplies: number;
  followedPosts: number;
  reputationPoints: number;
}

export default function CommunityDashboard() {
  const router = useRouter();
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState('community');
  const [followedItems, setFollowedItems] = useState<FollowedItem[]>([]);
  const [userStats, setUserStats] = useState<UserStats>({
    totalPosts: 0,
    totalReplies: 0,
    followedPosts: 0,
    reputationPoints: 0
  });
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Fetch followed items
      const followsResponse = await fetch(`/api/community/follow?userId=${user.id}`);
      if (followsResponse.ok) {
        const followsData = await followsResponse.json();
        setFollowedItems(followsData.follows || []);
      } else {
        console.log('Follow API not available yet, showing empty follows');
        setFollowedItems([]);
      }

      // Fetch user stats (mock data for now)
      setUserStats({
        totalPosts: 3,
        totalReplies: 7,
        followedPosts: followedItems.length,
        reputationPoints: 25
      });

      // Fetch recent activity (mock data)
      setRecentActivity([
        {
          id: 1,
          type: 'reply',
          message: 'Je reageerde op "Hoi allemaal! Nieuwe hier 👋"',
          time: '2 uur geleden',
          link: '/community/forum/post/215'
        },
        {
          id: 2,
          type: 'follow',
          message: 'Je begon "Profiel foto tips" te volgen',
          time: '1 dag geleden',
          link: '/community/forum/post/217'
        },
        {
          id: 3,
          type: 'post',
          message: 'Je plaatste een nieuwe discussie',
          time: '3 dagen geleden',
          link: '/community/forum/post/220'
        }
      ]);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    if (tabId === 'community') {
      // Stay on current page
      return;
    }
    router.push(`/dashboard#${tabId}`);
  };

  const handleUnfollow = async (targetType: string, targetId: number) => {
    if (!user) return;

    try {
      const response = await fetch('/api/community/follow', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          targetType,
          targetId
        }),
      });

      if (response.ok) {
        // Refresh followed items
        fetchDashboardData();
      } else if (response.status === 503) {
        // Follow functionality not available yet
        console.log('Follow functionality not available yet');
        alert('Follow functionaliteit is nog niet beschikbaar. Probeer het later opnieuw.');
      }
    } catch (error) {
      console.error('Error unfollowing:', error);
      alert('Er ging iets mis bij het ontvolgen. Probeer het opnieuw.');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Lucide.Loader className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-4xl p-4 sm:p-6 lg:p-8">
      <div className="space-y-6">
        <Header />
        <main className="rounded-2xl bg-card p-4 shadow-2xl sm:p-6">
          <MainNav activeTab={activeTab} onTabChange={handleTabChange} />
          <div className="mt-6">
            <div className="space-y-6">
              {/* Hero Section - Compact version */}
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary/10 via-coral-500/5 to-purple-500/10 p-6 border border-primary/10">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary via-coral-600 to-purple-600 bg-clip-text text-transparent">
                      Community Dashboard
                    </h1>
                    <p className="text-muted-foreground mt-1">
                      Jouw persoonlijke commandocentrum voor community activiteit
                    </p>
                  </div>
                  <Button asChild size="sm" className="bg-gradient-to-r from-primary to-coral-600 hover:from-primary/90 hover:to-coral-600/90">
                    <a href="/community/forum">
                      <Lucide.MessageSquare className="h-4 w-4 mr-2" />
                      Naar Forum
                    </a>
                  </Button>
                </div>
              </div>

              {/* Stats Overview - Compact Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="border-2 border-primary/10">
                  <CardContent className="p-3">
                    <div className="flex flex-col items-center text-center gap-2">
                      <div className="h-10 w-10 rounded-xl bg-blue-100 flex items-center justify-center">
                        <Lucide.FileText className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-xl font-bold">{userStats.totalPosts}</p>
                        <p className="text-xs text-muted-foreground">Posts</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-2 border-primary/10">
                  <CardContent className="p-3">
                    <div className="flex flex-col items-center text-center gap-2">
                      <div className="h-10 w-10 rounded-xl bg-green-100 flex items-center justify-center">
                        <Lucide.MessageCircle className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-xl font-bold">{userStats.totalReplies}</p>
                        <p className="text-xs text-muted-foreground">Reacties</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-2 border-primary/10">
                  <CardContent className="p-3">
                    <div className="flex flex-col items-center text-center gap-2">
                      <div className="h-10 w-10 rounded-xl bg-purple-100 flex items-center justify-center">
                        <Lucide.Bookmark className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-xl font-bold">{followedItems.length}</p>
                        <p className="text-xs text-muted-foreground">Gevolgd</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-2 border-primary/10">
                  <CardContent className="p-3">
                    <div className="flex flex-col items-center text-center gap-2">
                      <div className="h-10 w-10 rounded-xl bg-orange-100 flex items-center justify-center">
                        <Lucide.Star className="h-5 w-5 text-orange-600" />
                      </div>
                      <div>
                        <p className="text-xl font-bold">{userStats.reputationPoints}</p>
                        <p className="text-xs text-muted-foreground">Reputatie</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Main Content Tabs */}
              <Tabs defaultValue="notifications" className="space-y-4">
                <TabsList className="grid w-full grid-cols-4 bg-muted/50 p-1 rounded-xl">
                  <TabsTrigger value="notifications" className="rounded-lg text-xs font-medium">
                    <Lucide.Bell className="h-4 w-4 mr-1" />
                    Notificaties
                  </TabsTrigger>
                  <TabsTrigger value="followed" className="rounded-lg text-xs font-medium">
                    <Lucide.Bookmark className="h-4 w-4 mr-1" />
                    Gevolgd
                  </TabsTrigger>
                  <TabsTrigger value="activity" className="rounded-lg text-xs font-medium">
                    <Lucide.Activity className="h-4 w-4 mr-1" />
                    Activiteit
                  </TabsTrigger>
                  <TabsTrigger value="settings" className="rounded-lg text-xs font-medium">
                    <Lucide.Settings className="h-4 w-4 mr-1" />
                    Instellingen
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="notifications" className="mt-4">
                  <NotificationsPanel />
                </TabsContent>

                <TabsContent value="followed" className="mt-4">
                  <Card className="border-2 border-primary/10">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Lucide.Bookmark className="h-4 w-4" />
                        Gevolgde Discussies
                        <Badge variant="secondary">{followedItems.length}</Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {followedItems.length === 0 ? (
                        <div className="text-center py-6">
                          <Lucide.BookmarkX className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                          <p className="text-sm text-muted-foreground">
                            Geen gevolgde discussies
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                          {followedItems.map((item) => (
                            <div
                              key={item.id}
                              className="flex items-center justify-between p-2 rounded border bg-background/50"
                            >
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium truncate">
                                  {item.post_title || `Post ${item.target_id}`}
                                </p>
                              </div>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleUnfollow(item.target_type, item.target_id)}
                                className="h-6 w-6 p-0"
                              >
                                <Lucide.X className="h-3 w-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="activity" className="mt-4">
                  <Card className="border-2 border-primary/10">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Lucide.Activity className="h-4 w-4" />
                        Recente Activiteit
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {recentActivity.map((activity) => (
                          <div
                            key={activity.id}
                            className="flex items-center gap-3 p-2 rounded border bg-background/50"
                          >
                            <div className="flex-1">
                              <p className="text-xs font-medium">{activity.message}</p>
                              <p className="text-xs text-muted-foreground mt-0.5">{activity.time}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="settings" className="mt-4">
                  <Card className="border-2 border-primary/10">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Lucide.Settings className="h-4 w-4" />
                        Community Instellingen
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="space-y-2">
                          <label className="flex items-center gap-2 text-xs cursor-pointer">
                            <input type="checkbox" defaultChecked className="rounded" />
                            <span>Nieuwe reacties op gevolgde posts</span>
                          </label>
                          <label className="flex items-center gap-2 text-xs cursor-pointer">
                            <input type="checkbox" defaultChecked className="rounded" />
                            <span>Meldingen van moderators</span>
                          </label>
                          <label className="flex items-center gap-2 text-xs cursor-pointer">
                            <input type="checkbox" className="rounded" />
                            <span>Wekelijkse community samenvatting</span>
                          </label>
                        </div>
                        <Button size="sm" className="w-full bg-gradient-to-r from-primary to-coral-600">
                          <Lucide.Save className="h-3 w-3 mr-2" />
                          Opslaan
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </main>
        <footer className="text-center text-sm text-muted-foreground">
          <p>&copy; 2025 DatingAssistent. Alle rechten voorbehouden.</p>
        </footer>
      </div>
    </div>
  );
}