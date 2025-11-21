"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import * as Lucide from 'lucide-react';
import { useUser } from '@/providers/user-provider';
import { ForumPost } from '@/lib/types';

export function ForumPosts({ categoryId }: { categoryId: number }) {
  const router = useRouter();
  const { user } = useUser();
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showNewPostForm, setShowNewPostForm] = useState(false);
  const [newPost, setNewPost] = useState({ title: '', content: '' });

  useEffect(() => {
    if (categoryId) {
      fetchPosts();
    }
  }, [categoryId]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/community/forum/posts?categoryId=${categoryId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch posts');
      }
      
      const data = await response.json();
      setPosts(data.posts);
    } catch (err) {
      setError('Kon forum posts niet laden');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async () => {
    if (!user || !newPost.title.trim() || !newPost.content.trim()) return;

    // Check for duplicate posts by this user in this category
    const duplicatePost = posts.find(post =>
      post.userId === user.id &&
      post.title.toLowerCase().trim() === newPost.title.toLowerCase().trim() &&
      post.content.toLowerCase().trim() === newPost.content.toLowerCase().trim()
    );

    if (duplicatePost) {
      setError('Je hebt al een identieke post gemaakt in deze categorie');
      return;
    }

    try {
      const response = await fetch('/api/community/forum/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          categoryId,
          title: newPost.title.trim(),
          content: newPost.content.trim()
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create post');
      }

      // Reset form and refresh posts
      setNewPost({ title: '', content: '' });
      setShowNewPostForm(false);
      setError(null); // Clear any previous errors
      fetchPosts();
    } catch (err) {
      setError('Kon post niet aanmaken: ' + (err instanceof Error ? err.message : 'Onbekende fout'));
      console.error(err);
    }
  };

  const handlePostClick = (postId: number) => {
    router.push(`/community/forum/post/${postId}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Lucide.Loader className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="bg-secondary/50">
        <CardHeader>
          <CardTitle>Forum Posts</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header with gradient */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary/10 via-pink-500/5 to-purple-500/10 p-8">
        <div className="relative">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-pink-600 bg-clip-text text-transparent">
                Discussies
              </h2>
              <p className="text-muted-foreground mt-1">
                Deel je ervaringen en leer van anderen in onze community
              </p>
            </div>
            <Button
              onClick={() => setShowNewPostForm(!showNewPostForm)}
              size="lg"
              className="bg-gradient-to-r from-primary to-pink-600 hover:from-primary/90 hover:to-pink-600/90 shadow-lg"
            >
              <Lucide.Plus className="h-5 w-5 mr-2" />
              Nieuwe Discussie
            </Button>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-4 right-4 opacity-10">
          <Lucide.MessageSquare className="h-16 w-16 text-primary" />
        </div>
      </div>

      {/* New Post Form - Modern Modal Style */}
      {showNewPostForm && (
        <Card className="border-2 border-primary/20 shadow-xl bg-gradient-to-br from-card to-card/50">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-gradient-to-r from-primary to-pink-600 flex items-center justify-center">
                <Lucide.Edit className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl">Start een nieuwe discussie</CardTitle>
                <p className="text-sm text-muted-foreground">Deel je vraag of ervaring met de community</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">Titel van je discussie</label>
              <Input
                value={newPost.title}
                onChange={(e) => setNewPost({...newPost, title: e.target.value})}
                placeholder="Bv: 'Mijn eerste date ervaring' of 'Hulp nodig met profielfoto'"
                className="text-base border-2 focus:border-primary"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">Je bericht</label>
              <Textarea
                value={newPost.content}
                onChange={(e) => setNewPost({...newPost, content: e.target.value})}
                rows={8}
                placeholder="Vertel je verhaal, stel je vraag, of deel je ervaring. Hoe gedetailleerder, hoe beter anderen kunnen helpen!"
                className="text-base border-2 focus:border-primary resize-none"
              />
              <p className="text-xs text-muted-foreground">
                Tip: Wees respectvol en specifiek voor de beste reacties
              </p>
            </div>
            <div className="flex gap-3 pt-4">
              <Button
                onClick={handleCreatePost}
                disabled={!newPost.title.trim() || !newPost.content.trim()}
                className="bg-gradient-to-r from-primary to-pink-600 hover:from-primary/90 hover:to-pink-600/90"
              >
                <Lucide.Send className="h-4 w-4 mr-2" />
                Publiceren
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowNewPostForm(false)}
                className="border-2"
              >
                Annuleren
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Posts List - Modern Card Design */}
      <div className="space-y-4">
        {posts.length === 0 ? (
          <Card className="border-2 border-dashed border-muted-foreground/25 bg-gradient-to-br from-muted/20 to-muted/5">
            <CardContent className="py-16 text-center">
              <div className="space-y-4">
                <div className="h-20 w-20 rounded-full bg-gradient-to-r from-primary/10 to-pink-600/10 flex items-center justify-center mx-auto">
                  <Lucide.MessageSquare className="h-10 w-10 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground mb-2">Nog geen discussies</h3>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    Wees de eerste om een discussie te starten in deze categorie.
                    Jouw vraag of ervaring kan anderen helpen!
                  </p>
                </div>
                <Button
                  onClick={() => setShowNewPostForm(true)}
                  className="mt-4 bg-gradient-to-r from-primary to-pink-600"
                >
                  <Lucide.Plus className="h-4 w-4 mr-2" />
                  Start de eerste discussie
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          posts.map((post, index) => (
            <Card
              key={post.id}
              className="group relative overflow-hidden bg-gradient-to-br from-card to-card/50 border border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 cursor-pointer"
              onClick={() => handlePostClick(post.id)}
            >
              {/* Subtle background gradient */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/2 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              <CardContent className="p-6 relative">
                <div className="flex gap-4">
                  {/* User Avatar */}
                  <div className="flex-shrink-0">
                    {post.user?.profilePictureUrl ? (
                      <img
                        src={post.user.profilePictureUrl}
                        alt={post.user.name}
                        className="h-12 w-12 rounded-full object-cover ring-2 ring-primary/10 group-hover:ring-primary/30 transition-all"
                      />
                    ) : (
                      <div className="h-12 w-12 rounded-full bg-gradient-to-r from-primary/10 to-pink-600/10 flex items-center justify-center ring-2 ring-primary/10 group-hover:ring-primary/30 transition-all">
                        <Lucide.User className="h-6 w-6 text-primary" />
                      </div>
                    )}
                  </div>

                  {/* Post Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        {/* Title with pin indicator */}
                        <div className="flex items-center gap-2 mb-2">
                          {post.isPinned && (
                            <div className="flex items-center gap-1 text-primary">
                              <Lucide.Pin className="h-4 w-4" />
                              <span className="text-xs font-medium bg-primary/10 px-2 py-1 rounded-full">Vastgezet</span>
                            </div>
                          )}
                          <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                            {post.title}
                          </h3>
                        </div>

                        {/* Post preview */}
                        <p className="text-muted-foreground line-clamp-2 mb-4 leading-relaxed">
                          {post.content}
                        </p>

                        {/* Meta information */}
                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1.5">
                            <Lucide.User className="h-4 w-4" />
                            <span className="font-medium">{post.user?.name || 'Anoniem'}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Lucide.Clock className="h-4 w-4" />
                            <span>{new Date(post.createdAt).toLocaleDateString('nl-NL')}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Lucide.MessageCircle className="h-4 w-4" />
                            <span>{post.repliesCount || 0} reacties</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Lucide.Eye className="h-4 w-4" />
                            <span>{post.views || 0} views</span>
                          </div>
                        </div>
                      </div>

                      {/* Engagement indicators */}
                      <div className="flex flex-col items-end gap-2">
                        <div className="flex items-center gap-1 text-sm font-medium text-primary">
                          <Lucide.MessageCircle className="h-4 w-4" />
                          <span>{post.repliesCount || 0}</span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {post.repliesCount > 0 ? 'actief' : 'nieuw'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Hover indicator */}
                <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="flex items-center gap-1 text-primary text-sm font-medium">
                    <span>Bekijk discussie</span>
                    <Lucide.ChevronRight className="h-4 w-4" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}