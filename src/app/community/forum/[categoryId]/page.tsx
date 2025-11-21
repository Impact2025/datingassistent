"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ForumPosts } from '@/components/community/forum-posts';
import { ForumSearch } from '@/components/community/forum-search';
import { NotificationsPanel } from '@/components/community/notifications';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/layout/header';
import { MainNav } from '@/components/layout/main-nav';
import { useUser } from '@/providers/user-provider';
import * as Lucide from 'lucide-react';
import { ForumCategory } from '@/lib/types';

interface FollowedItem {
  id: number;
  target_type: string;
  target_id: number;
  created_at: string;
  post_title?: string;
  category_name?: string;
}

export default function ForumCategoryPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useUser();
  const categoryId = params?.categoryId ? parseInt(params.categoryId as string) : null;
  const [category, setCategory] = useState<ForumCategory | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('community');
  const [sidebarTab, setSidebarTab] = useState('forum');
  const [followedItems, setFollowedItems] = useState<FollowedItem[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);

  useEffect(() => {
    if (categoryId && categoryId > 0) {
      fetchCategory();
    } else if (categoryId === null || categoryId === 0) {
      router.push('/community/forum');
      return;
    }
    if (user) {
      fetchFollowedItems();
    }
  }, [categoryId, user]);

  const fetchCategory = async () => {
    try {
      const response = await fetch('/api/community/forum/categories');
      if (response.ok) {
        const data = await response.json();
        const foundCategory = data.categories.find((cat: ForumCategory) => cat.id === categoryId);
        setCategory(foundCategory);
      }
    } catch (err) {
      console.error('Error fetching category:', err);
    } finally {
      setLoading(false);
    }
  };

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

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Lucide.Loader className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!category) {
    return (
      <div className="mx-auto w-full max-w-7xl p-4 sm:p-6 lg:p-8">
        <div className="space-y-6">
          <Header />
          <main className="rounded-2xl bg-card shadow-2xl overflow-hidden">
            <MainNav activeTab={activeTab} onTabChange={handleTabChange} />
            <div className="p-6">
              <Card className="bg-secondary/50">
                <CardHeader>
                  <CardTitle>Categorie niet gevonden</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">De opgevraagde forum categorie kon niet worden gevonden.</p>
                  <div className="mt-4">
                    <Button onClick={() => router.push('/community/forum')}>
                      Terug naar Forum
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-4xl p-4 sm:p-6 lg:p-8">
      <div className="space-y-6">
        <Header />
        <main className="rounded-2xl bg-card shadow-2xl overflow-hidden">
          <MainNav activeTab={activeTab} onTabChange={handleTabChange} />

          <div className="flex flex-col lg:flex-row min-h-[600px]">
            {/* Sidebar */}
            <div className="w-full lg:w-72 border-r border-border lg:border-r bg-muted/20 p-4 lg:p-6 order-2 lg:order-1">
              <Tabs value={sidebarTab} onValueChange={setSidebarTab} className="space-y-6">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="forum" className="text-xs">Forum</TabsTrigger>
                  <TabsTrigger value="dashboard" className="text-xs">Dashboard</TabsTrigger>
                  <TabsTrigger value="followed" className="text-xs">Gevolgd</TabsTrigger>
                </TabsList>

                <TabsContent value="forum" className="space-y-4 mt-0">
                  <div className="space-y-4">
                    <Button
                      onClick={() => router.push('/community/forum')}
                      className="w-full justify-start"
                      variant="outline"
                    >
                      <Lucide.MessageSquare className="h-4 w-4 mr-2" />
                      Alle Discussies
                    </Button>

                    <Button
                      onClick={() => router.push('/community/guidelines')}
                      className="w-full justify-start"
                      variant="outline"
                    >
                      <Lucide.Shield className="h-4 w-4 mr-2" />
                      Community Regels
                    </Button>

                    <div className="pt-4 border-t">
                      <h3 className="font-semibold mb-3 text-sm">Snelle Acties</h3>
                      <div className="space-y-2">
                        <Button size="sm" variant="ghost" className="w-full justify-start text-xs">
                          <Lucide.Plus className="h-3 w-3 mr-2" />
                          Nieuwe Post
                        </Button>
                        <Button size="sm" variant="ghost" className="w-full justify-start text-xs">
                          <Lucide.Search className="h-3 w-3 mr-2" />
                          Zoeken
                        </Button>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="dashboard" className="space-y-4 mt-0">
                  <NotificationsPanel />
                </TabsContent>

                <TabsContent value="followed" className="space-y-4 mt-0">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Lucide.Bookmark className="h-4 w-4" />
                        Gevolgde Discussies
                        <Badge variant="secondary" className="text-xs">{followedItems.length}</Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      {followedItems.length === 0 ? (
                        <div className="text-center py-6">
                          <Lucide.BookmarkX className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                          <p className="text-xs text-muted-foreground">
                            Geen gevolgde discussies
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Volg posts om updates te ontvangen
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-2 max-h-60 overflow-y-auto">
                          {followedItems.map((item) => (
                            <div
                              key={item.id}
                              className="flex items-center justify-between p-2 rounded border bg-background/50 hover:bg-background transition-colors"
                            >
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium truncate">
                                  {item.post_title || `Post ${item.target_id}`}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {item.category_name}
                                </p>
                              </div>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleUnfollow(item.target_type, item.target_id)}
                                className="h-6 w-6 p-0 ml-2"
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
            </div>

            {/* Main Content */}
            <div className="flex-1 p-6 order-1 lg:order-2">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-12 w-12 items-center justify-center rounded-full"
                      style={{ backgroundColor: category.color }}
                    >
                      <Lucide.MessageSquare className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h1 className="text-3xl font-bold">{category.name}</h1>
                      <p className="text-muted-foreground">{category.description}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={() => router.push('/community/forum')} variant="outline" size="sm">
                      <Lucide.ArrowLeft className="h-4 w-4 mr-2" />
                      Alle Categorieën
                    </Button>
                    <Button onClick={() => router.push('/dashboard')} variant="outline" size="sm">
                      <Lucide.LayoutDashboard className="h-4 w-4 mr-2" />
                      Dashboard
                    </Button>
                  </div>
                </div>

                <ForumSearch onSearch={handleSearch} isLoading={searchLoading} />

                <ForumPosts categoryId={categoryId!} />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}