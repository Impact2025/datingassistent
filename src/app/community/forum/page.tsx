"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ForumCategories } from '@/components/community/forum-categories';
import { ForumSearch } from '@/components/community/forum-search';
import { NotificationsPanel } from '@/components/community/notifications';
import { Header } from '@/components/layout/header';
import { MainNav } from '@/components/layout/main-nav';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useUser } from '@/providers/user-provider';
import * as Lucide from 'lucide-react';

interface FollowedItem {
  id: number;
  target_type: string;
  target_id: number;
  created_at: string;
  post_title?: string;
  category_name?: string;
}

export default function ForumPage() {
  const router = useRouter();
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState('community');
  const [sidebarTab, setSidebarTab] = useState('forum');
  const [followedItems, setFollowedItems] = useState<FollowedItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchFollowedItems();
    }
  }, [user]);

  const fetchFollowedItems = async () => {
    if (!user) return;

    try {
      const response = await fetch(`/api/community/follow?userId=${user.id}`);
      if (response.ok) {
        const data = await response.json();
        setFollowedItems(data.follows || []);
      }
    } catch (error) {
      console.error('Error fetching followed items:', error);
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
        fetchFollowedItems(); // Refresh the list
      } else if (response.status === 503) {
        alert('Follow functionaliteit is nog niet beschikbaar. Probeer het later opnieuw.');
      }
    } catch (error) {
      console.error('Error unfollowing:', error);
      alert('Er ging iets mis bij het ontvolgen. Probeer het opnieuw.');
    }
  };

  const handleSearch = async (query: string, categoryId?: number, sortBy?: string) => {
    setSearchLoading(true);
    try {
      // For now, just log the search - implement actual search later
      console.log('Searching:', { query, categoryId, sortBy });
      // Could redirect to search results page or filter current content
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setSearchLoading(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-4xl p-4 sm:p-6 lg:p-8">
      <div className="space-y-6">
        <Header />
        <main className="rounded-2xl bg-card p-4 shadow-2xl sm:p-6">
          <MainNav activeTab={activeTab} onTabChange={handleTabChange} />
          <div className="mt-6">
            <div className="space-y-6">
              {/* Hero Section - Compact version */}
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary/10 via-pink-500/5 to-purple-500/10 p-6 border border-primary/10">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary via-pink-600 to-purple-600 bg-clip-text text-transparent">
                      Community Forum
                    </h1>
                    <p className="text-muted-foreground mt-1">
                      Ontdek verhalen, deel ervaringen en vind steun bij anderen
                    </p>
                  </div>
                  <Button asChild size="sm" className="bg-gradient-to-r from-primary to-pink-600 hover:from-primary/90 hover:to-pink-600/90">
                    <a href="/dashboard/community">
                      <Lucide.LayoutDashboard className="h-4 w-4 mr-2" />
                      Dashboard
                    </a>
                  </Button>
                </div>
              </div>

              {/* Sidebar Tabs - Compact */}
              <Tabs value={sidebarTab} onValueChange={setSidebarTab} className="w-full">
                <TabsList className="grid w-full grid-cols-3 bg-muted/50">
                  <TabsTrigger value="forum" className="text-xs">Forum</TabsTrigger>
                  <TabsTrigger value="dashboard" className="text-xs">Dashboard</TabsTrigger>
                  <TabsTrigger value="followed" className="text-xs">Gevolgd</TabsTrigger>
                </TabsList>

                <TabsContent value="forum" className="space-y-4 mt-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Card className="border-2 border-primary/10">
                      <CardContent className="p-4">
                        <Button
                          onClick={() => router.push('/community/forum')}
                          className="w-full justify-start"
                          variant="ghost"
                        >
                          <Lucide.MessageSquare className="h-4 w-4 mr-2" />
                          Alle Discussies
                        </Button>
                      </CardContent>
                    </Card>

                    <Card className="border-2 border-primary/10">
                      <CardContent className="p-4">
                        <Button
                          onClick={() => router.push('/community/guidelines')}
                          className="w-full justify-start"
                          variant="ghost"
                        >
                          <Lucide.Shield className="h-4 w-4 mr-2" />
                          Community Regels
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="dashboard" className="mt-4">
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
              </Tabs>

              <ForumSearch onSearch={handleSearch} isLoading={searchLoading} />

              <ForumCategories />
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