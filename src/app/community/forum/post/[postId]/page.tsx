"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ForumPostDetail } from '@/components/community/forum-post-detail';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import * as Lucide from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/layout/header';
import { MainNav } from '@/components/layout/main-nav';

export default function ForumPostPage() {
  const params = useParams();
  const router = useRouter();
  const postId = parseInt(params.postId as string);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('community');

  useEffect(() => {
    if (!postId || isNaN(postId)) {
      setError('Ongeldige post ID');
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, [postId]);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    if (tabId === 'community') {
      // Stay on current page
      return;
    }
    router.push(`/dashboard#${tabId}`);
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
      <div className="mx-auto w-full max-w-4xl p-4 sm:p-6 lg:p-8">
        <div className="space-y-6">
          <Header />
          <main className="rounded-2xl bg-card p-4 shadow-2xl sm:p-6">
            <MainNav activeTab={activeTab} onTabChange={handleTabChange} />
            <div className="mt-6">
              <Card className="bg-secondary/50">
                <CardHeader>
                  <CardTitle>Fout</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{error}</p>
                  <div className="mt-4">
                    <Button onClick={() => router.push('/dashboard#community')}>
                      Terug naar Community
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

  if (!postId) {
    return (
      <div className="mx-auto w-full max-w-4xl p-4 sm:p-6 lg:p-8">
        <div className="space-y-6">
          <Header />
          <main className="rounded-2xl bg-card p-4 shadow-2xl sm:p-6">
            <MainNav activeTab={activeTab} onTabChange={handleTabChange} />
            <div className="mt-6">
              <Card className="bg-secondary/50">
                <CardHeader>
                  <CardTitle>Post niet gevonden</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">De opgevraagde post kon niet worden gevonden.</p>
                  <div className="mt-4">
                    <Button onClick={() => router.push('/dashboard#community')}>
                      Terug naar Community
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
        <main className="rounded-2xl bg-card p-4 shadow-2xl sm:p-6">
          <MainNav activeTab={activeTab} onTabChange={handleTabChange} />
          <div className="mt-6">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-3xl font-bold">Forum Post</h1>
              <Button onClick={() => router.back()} variant="outline">
                <Lucide.ArrowLeft className="h-4 w-4 mr-2" />
                Terug
              </Button>
            </div>
            
            <ForumPostDetail postId={postId} />
          </div>
        </main>
      </div>
    </div>
  );
}