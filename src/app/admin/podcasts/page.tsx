"use client";

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { useUser } from '@/providers/user-provider';
import { useRouter } from 'next/navigation';
import { createPodcast } from '@/lib/podcast-service';

export default function PodcastUploadPage() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [duration, setDuration] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push('/admin/login');
    }
  }, [user, router]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Check if file is M4A
      if (selectedFile.type !== 'audio/mp4' && !selectedFile.name.toLowerCase().endsWith('.m4a')) {
        toast({
          title: "Ongeldig bestandstype",
          description: "Alleen M4A-bestanden zijn toegestaan.",
          variant: "destructive",
        });
        return;
      }

      // Check file size (limit to 100MB)
      if (selectedFile.size > 100 * 1024 * 1024) {
        toast({
          title: "Bestand te groot",
          description: "Het bestand mag maximaal 100MB zijn.",
          variant: "destructive",
        });
        return;
      }

      setFile(selectedFile);
      
      // Create preview URL
      const url = URL.createObjectURL(selectedFile);
      setPreviewUrl(url);
      
      // Get audio duration
      getAudioDuration(url);
    }
  };

  const getAudioDuration = (url: string) => {
    const audio = new Audio(url);
    audio.addEventListener('loadedmetadata', () => {
      setDuration(Math.floor(audio.duration));
    });
  };

  const handleUpload = async () => {
    if (!file || !title || !description) {
      toast({
        title: "Ontbrekende informatie",
        description: "Vul alle verplichte velden in en selecteer een bestand.",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    
    try {
      // In a real implementation, this would upload to Firebase Storage
      // For now, we'll simulate the upload and save to database
      
      // Generate a mock file URL (in real implementation, this would be the Firebase Storage URL)
      const mockFileUrl = `/podcasts/${Date.now()}-${file.name}`;
      
      // Save podcast metadata to database
      const response = await fetch('/api/admin/podcasts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          description,
          file_url: mockFileUrl,
          file_size: file.size,
          duration: duration || 0,
          published: false,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to create podcast');
      }

      toast({
        title: "Upload succesvol",
        description: "De podcast is succesvol geüpload. Ga naar 'Beheer Podcasts' om deze te publiceren.",
      });
      
      // Reset form
      setTitle('');
      setDescription('');
      setFile(null);
      setPreviewUrl(null);
      setDuration(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload mislukt",
        description: "Er is een fout opgetreden bij het uploaden. Probeer het opnieuw.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleCancel = () => {
    setTitle('');
    setDescription('');
    setFile(null);
    setPreviewUrl(null);
    setDuration(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
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

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Podcast Uploaden</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Titel *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Voer de titel van de podcast in"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Beschrijving *</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Voer een beschrijving van de podcast in"
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="file">Audio Bestand (M4A) *</Label>
              <Input
                id="file"
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".m4a,audio/mp4"
              />
              <p className="text-sm text-muted-foreground">
                Alleen M4A-bestanden zijn toegestaan. Maximale bestandsgrootte: 100MB.
              </p>
            </div>

            {previewUrl && (
              <div className="space-y-2">
                <Label>Voorbeeld</Label>
                <audio controls src={previewUrl} className="w-full">
                  Uw browser ondersteunt de audioplayer niet.
                </audio>
                {duration && (
                  <p className="text-sm text-muted-foreground">
                    Duur: {formatDuration(duration)}
                  </p>
                )}
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <Button onClick={handleUpload} disabled={uploading}>
                {uploading ? 'Uploaden...' : 'Uploaden'}
              </Button>
              <Button variant="outline" onClick={handleCancel} disabled={uploading}>
                Annuleren
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}