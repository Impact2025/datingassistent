"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/hooks/use-toast';
import { useUser } from '@/providers/user-provider';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Podcast {
  id: number;
  title: string;
  description: string;
  file_url: string;
  file_size?: number;
  duration?: number;
  published: boolean;
  published_at?: string | Date;
  created_at: string | Date;
  updated_at: string | Date;
}

export default function ManagePodcastsPage() {
  const [podcasts, setPodcasts] = useState<Podcast[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push('/admin/login');
    } else {
      fetchPodcasts();
    }
  }, [user, router]);

  const fetchPodcasts = async () => {
    try {
      const response = await fetch('/api/admin/podcasts');
      const data = await response.json();
      
      if (data.success) {
        setPodcasts(data.podcasts);
      } else {
        toast({
          title: "Fout bij ophalen",
          description: data.error || "Er is een fout opgetreden bij het ophalen van de podcasts.",
          variant: "destructive",
        });
        console.error('API Error Details:', data.details);
      }
    } catch (error) {
      console.error('Error fetching podcasts:', error);
      toast({
        title: "Fout bij ophalen",
        description: "Er is een fout opgetreden bij het ophalen van de podcasts. Controleer de console voor details.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePublishToggle = async (id: number, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/admin/podcasts/${id}/publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ published: !currentStatus }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Update local state
        setPodcasts(podcasts.map(podcast => 
          podcast.id === id 
            ? { ...podcast, published: !currentStatus, published_at: data.podcast.published_at }
            : podcast
        ));
        
        toast({
          title: "Status bijgewerkt",
          description: `Podcast is ${!currentStatus ? 'gepubliceerd' : 'niet gepubliceerd'}.`,
        });
      } else {
        toast({
          title: "Fout bij bijwerken",
          description: data.error || "Er is een fout opgetreden bij het bijwerken van de status.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error updating podcast status:', error);
      toast({
        title: "Fout bij bijwerken",
        description: "Er is een fout opgetreden bij het bijwerken van de status.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Weet je zeker dat je deze podcast wilt verwijderen?')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/admin/podcasts/${id}`, { method: 'DELETE' });
      const data = await response.json();
      
      if (data.success) {
        // Update local state
        setPodcasts(podcasts.filter(podcast => podcast.id !== id));
        
        toast({
          title: "Podcast verwijderd",
          description: "De podcast is succesvol verwijderd.",
        });
      } else {
        toast({
          title: "Fout bij verwijderen",
          description: data.error || "Er is een fout opgetreden bij het verwijderen van de podcast.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error deleting podcast:', error);
      toast({
        title: "Fout bij verwijderen",
        description: "Er is een fout opgetreden bij het verwijderen van de podcast.",
        variant: "destructive",
      });
    }
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' bytes';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    if (bytes < 1073741824) return (bytes / 1048576).toFixed(1) + ' MB';
    return (bytes / 1073741824).toFixed(1) + ' GB';
  };

  const formatDate = (date: string | Date | undefined) => {
    if (!date) return '';
    try {
      return new Date(date).toLocaleDateString('nl-NL');
    } catch (e) {
      console.error('Error formatting date:', e);
      return '';
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>Beheer Podcasts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center items-center h-32">
              <p>Laden...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Beheer Podcasts</CardTitle>
            <Link href="/admin/podcasts">
              <Button>Nieuwe Podcast</Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {podcasts.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Er zijn nog geen podcasts geüpload.</p>
              <Link href="/admin/podcasts">
                <Button className="mt-4">Eerste Podcast Uploaden</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {podcasts.map((podcast) => (
                <div key={podcast.id} className="border rounded-lg p-4 flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <h3 className="text-lg font-semibold">{podcast.title}</h3>
                      <Switch
                        checked={podcast.published}
                        onCheckedChange={() => handlePublishToggle(podcast.id, podcast.published)}
                      />
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{podcast.description}</p>
                    <div className="flex flex-wrap gap-4 mt-2 text-sm">
                      <span>Grootte: {formatFileSize(podcast.file_size || 0)}</span>
                      {podcast.duration && (
                        <span>Duur: {formatDuration(podcast.duration)}</span>
                      )}
                      <span>
                        Status: 
                        <span className={`ml-1 ${podcast.published ? 'text-green-600' : 'text-yellow-600'}`}>
                          {podcast.published ? 'Gepubliceerd' : 'Concept'}
                        </span>
                      </span>
                      {podcast.published_at && (
                        <span>
                          Gepubliceerd op: {formatDate(podcast.published_at)}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button variant="outline" size="sm">
                      Bewerken
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm" 
                      onClick={() => handleDelete(podcast.id)}
                    >
                      Verwijderen
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}