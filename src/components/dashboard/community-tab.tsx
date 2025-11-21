"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import * as Lucide from 'lucide-react';
import { useUser } from '@/providers/user-provider';
import { NotificationsPanel } from '@/components/community/notifications';
import { useRouter } from 'next/navigation';

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

export function CommunityTab() {
  const { user } = useUser();
  const router = useRouter();
  const [followedItems, setFollowedItems] = useState<FollowedItem[]>([]);
  const [userStats, setUserStats] = useState<UserStats>({
    totalPosts: 0,
    totalReplies: 0,
    followedPosts: 0,
    reputationPoints: 0
  });
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

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
        fetchDashboardData();
      } else if (response.status === 503) {
        alert('Follow functionaliteit is nog niet beschikbaar. Probeer het later opnieuw.');
      }
    } catch (error) {
      console.error('Error unfollowing:', error);
      alert('Er ging iets mis bij het ontvolgen. Probeer het opnieuw.');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Lucide.Loader className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Lucide.Users className="w-6 h-6 text-teal-600" />
          <div>
            <h2 className="text-2xl font-bold text-teal-600">Community</h2>
            <p className="text-sm text-muted-foreground">
              Ontdek verhalen, deel ervaringen en vind steun bij anderen die hun dating leven verbeteren.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card className="bg-secondary/50 text-center">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-primary">{userStats.totalPosts}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Posts geplaatst</p>
          </CardContent>
        </Card>
        <Card className="bg-secondary/50 text-center">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-green-500">{userStats.totalReplies}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Reacties gegeven</p>
          </CardContent>
        </Card>
        <Card className="bg-secondary/50 text-center">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-purple-500">{followedItems.length}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Gevolgde discussies</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-2 border-b">
        <Button
          variant={activeTab === 'overview' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('overview')}
          className="gap-2"
        >
          <Lucide.Heart className="h-4 w-4" />
          Overzicht
        </Button>
        <Button
          variant={activeTab === 'followed' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('followed')}
          className="gap-2"
        >
          <Lucide.Bookmark className="h-4 w-4" />
          Gevolgd
        </Button>
        <Button
          variant={activeTab === 'activity' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('activity')}
          className="gap-2"
        >
          <Lucide.Activity className="h-4 w-4" />
          Activiteit
        </Button>
        <Button
          variant={activeTab === 'notifications' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('notifications')}
          className="gap-2"
        >
          <Lucide.Bell className="h-4 w-4" />
          Meldingen
        </Button>
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-4">
          <Card className="bg-secondary/50">
            <CardHeader>
              <CardTitle>Welkom in de Community</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Hier kun je discussiëren met andere gebruikers, vragen stellen en ervaringen delen over dating en relaties.
              </p>
              <div className="flex gap-3">
                <Button onClick={() => router.push('/community/forum')}>
                  <Lucide.MessageSquare className="h-4 w-4 mr-2" />
                  Ga naar Forum
                </Button>
                <Button variant="outline" onClick={() => router.push('/community/guidelines')}>
                  <Lucide.Shield className="h-4 w-4 mr-2" />
                  Community Regels
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'followed' && (
        <Card className="bg-secondary/50">
          <CardHeader>
            <CardTitle>Gevolgde Discussies</CardTitle>
          </CardHeader>
          <CardContent>
            {followedItems.length === 0 ? (
              <div className="text-center py-6">
                <Lucide.BookmarkX className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  Geen gevolgde discussies
                </p>
                <Button asChild className="mt-3">
                  <a href="/community/forum">Ontdek discussies</a>
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {followedItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">
                        <a
                          href={`/community/forum/post/${item.target_id}`}
                          className="hover:text-primary transition-colors"
                        >
                          {item.post_title || `Post ${item.target_id}`}
                        </a>
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        {item.category_name && `${item.category_name} • `}
                        Gevolgd {new Date(item.created_at).toLocaleDateString('nl-NL')}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleUnfollow(item.target_type, item.target_id)}
                    >
                      <Lucide.X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === 'activity' && (
        <Card className="bg-secondary/50">
          <CardHeader>
            <CardTitle>Recente Activiteit</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-shrink-0">
                    {activity.type === 'reply' && (
                      <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <Lucide.MessageCircle className="h-4 w-4 text-blue-600" />
                      </div>
                    )}
                    {activity.type === 'follow' && (
                      <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
                        <Lucide.Bookmark className="h-4 w-4 text-purple-600" />
                      </div>
                    )}
                    {activity.type === 'post' && (
                      <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                        <Lucide.FileText className="h-4 w-4 text-green-600" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm">{activity.message}</p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                  <Button variant="ghost" size="sm" asChild>
                    <a href={activity.link}>
                      <Lucide.ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'notifications' && (
        <NotificationsPanel />
      )}
    </div>
  );
}