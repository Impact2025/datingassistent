"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/shared/loading-spinner';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { PublicHeader } from '@/components/layout/public-header';
import { PublicFooter } from '@/components/layout/public-footer';
import * as Lucide from 'lucide-react';

interface Podcast {
  id: number;
  title: string;
  description: string;
  file_url: string;
  duration?: number;
  published_at?: string;
}

export default function PodcastsPage() {
  const router = useRouter();
  const [podcasts, setPodcasts] = useState<Podcast[]>([]);
  const [filteredPodcasts, setFilteredPodcasts] = useState<Podcast[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPodcast, setSelectedPodcast] = useState<Podcast | null>(null);
  const [showMembershipModal, setShowMembershipModal] = useState(false);
  const [isMember, setIsMember] = useState(false);
  const [playingPodcastId, setPlayingPodcastId] = useState<number | null>(null);

  // Check if user is logged in
  useEffect(() => {
    const checkMembership = async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (response.ok) {
          setIsMember(true);
        }
      } catch (err) {
        // User is not logged in
        setIsMember(false);
      }
    };
    checkMembership();
  }, []);

  useEffect(() => {
    fetchPodcasts();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const filtered = podcasts.filter(podcast =>
        podcast.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        podcast.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredPodcasts(filtered);
    } else {
      setFilteredPodcasts(podcasts);
    }
  }, [searchQuery, podcasts]);

  const fetchPodcasts = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/podcasts');

      if (!response.ok) {
        throw new Error('Failed to fetch podcasts');
      }

      const data = await response.json();
      setPodcasts(data);
      setFilteredPodcasts(data);
    } catch (err) {
      setError('Kon podcasts niet laden');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePlayPodcast = (podcast: Podcast) => {
    setSelectedPodcast(podcast);
    setPlayingPodcastId(podcast.id);

    if (!isMember) {
      // Start 15 second timer for non-members
      setTimeout(() => {
        setShowMembershipModal(true);
        setPlayingPodcastId(null);
      }, 15000);
    }
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return 'Onbekend';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('nl-NL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <PublicHeader />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <p className="text-destructive mb-4">{error}</p>
            <Button onClick={() => router.push('/')}>
              Terug naar Home
            </Button>
          </div>
        </main>
        <PublicFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <PublicHeader />

      {/* Main Content */}
      <main className="flex-grow">
        {/* Header */}
        <header className="border-b bg-card/50">
          <div className="container mx-auto px-4 py-8">
            <Button
              variant="ghost"
              onClick={() => router.push('/')}
              className="mb-6"
            >
              <Lucide.ArrowLeft className="mr-2 h-4 w-4" />
              Terug naar home
            </Button>

            <h1 className="text-4xl md:text-5xl font-bold mb-4">🎙️ Podcasts</h1>
            <p className="text-xl text-muted-foreground mb-6">
              Luister naar onze dating tips en advies podcasts
            </p>

            {!isMember && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 max-w-2xl">
                <p className="text-sm text-blue-800">
                  💡 <strong>Preview beschikbaar:</strong> Beluister gratis de eerste 15 seconden van elke podcast. Word lid voor volledige toegang.
                </p>
              </div>
            )}

            {/* Search Bar */}
            <div className="relative max-w-2xl">
              <Lucide.Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Zoek podcasts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-10"
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
                  onClick={() => setSearchQuery('')}
                >
                  <Lucide.X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8">
          {/* Results Count */}
          <div className="mb-6 text-muted-foreground">
            {filteredPodcasts.length} {filteredPodcasts.length === 1 ? 'podcast' : 'podcasts'} gevonden
            {searchQuery && ` met "${searchQuery}"`}
          </div>

          {/* Podcasts Grid */}
          {filteredPodcasts.length === 0 ? (
            <Card className="p-12 text-center">
              <Lucide.Podcast className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
              <p className="text-lg text-muted-foreground">
                {searchQuery ? 'Geen podcasts gevonden. Probeer een andere zoekopdracht.' : 'Nog geen podcasts beschikbaar'}
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPodcasts.map((podcast) => (
                <Card key={podcast.id} className="hover:shadow-lg transition-shadow">
                  <div className="aspect-video overflow-hidden rounded-t-lg bg-gradient-to-br from-primary/80 to-primary flex items-center justify-center">
                    <Lucide.Podcast className="h-20 w-20 text-white" />
                  </div>

                  <CardHeader>
                    <CardTitle className="line-clamp-2">{podcast.title}</CardTitle>
                    <CardDescription className="line-clamp-3">
                      {podcast.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent>
                    <div className="space-y-3">
                      {/* Podcast Info */}
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        {podcast.duration && (
                          <div className="flex items-center gap-1">
                            <Lucide.Clock className="h-4 w-4" />
                            <span>{formatDuration(podcast.duration)}</span>
                          </div>
                        )}
                        {podcast.published_at && (
                          <div className="flex items-center gap-1">
                            <Lucide.Calendar className="h-4 w-4" />
                            <span>{formatDate(podcast.published_at)}</span>
                          </div>
                        )}
                      </div>

                      {/* Play Button */}
                      <Button
                        onClick={() => handlePlayPodcast(podcast)}
                        className="w-full"
                        variant={playingPodcastId === podcast.id ? "secondary" : "default"}
                      >
                        {playingPodcastId === podcast.id ? (
                          <>
                            <Lucide.Pause className="mr-2 h-4 w-4" />
                            Aan het afspelen...
                          </>
                        ) : (
                          <>
                            <Lucide.Play className="mr-2 h-4 w-4" />
                            Beluister {!isMember && '(15s preview)'}
                          </>
                        )}
                      </Button>

                      {/* Preview Badge for Non-Members */}
                      {!isMember && playingPodcastId !== podcast.id && (
                        <div className="flex items-center justify-center">
                          <Badge variant="outline" className="text-xs">
                            <Lucide.Lock className="h-3 w-3 mr-1" />
                            15 seconden gratis preview
                          </Badge>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Membership Modal */}
      <Dialog open={showMembershipModal} onOpenChange={setShowMembershipModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl">🎧 Word lid voor volledige toegang</DialogTitle>
            <DialogDescription className="text-base pt-4">
              <div className="space-y-4">
                <p>
                  Je hebt de gratis preview van 15 seconden beluisterd. Word lid om:
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <Lucide.Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Onbeperkt alle podcasts te beluisteren</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Lucide.Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Toegang tot exclusieve dating cursussen</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Lucide.Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Persoonlijke AI dating coach</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Lucide.Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Profieltekst optimalisatie</span>
                  </li>
                </ul>
              </div>
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-3 pt-4">
            <Button
              onClick={() => router.push('/register')}
              size="lg"
              className="w-full"
            >
              <Lucide.UserPlus className="mr-2 h-5 w-5" />
              Word nu lid
            </Button>
            <Button
              onClick={() => router.push('/login')}
              variant="outline"
              size="lg"
              className="w-full"
            >
              <Lucide.LogIn className="mr-2 h-5 w-5" />
              Ik heb al een account
            </Button>
            <Button
              onClick={() => setShowMembershipModal(false)}
              variant="ghost"
              size="sm"
              className="w-full"
            >
              Sluiten
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <PublicFooter />
    </div>
  );
}
