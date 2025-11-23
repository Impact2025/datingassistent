"use client";

import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, Video, CheckCircle, AlertTriangle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VideoUploadProps {
  courseId: string;
  moduleId: string;
  currentVideoUrl?: string;
  onUploadSuccess: (videoUrl: string) => void;
  className?: string;
}

export function VideoUpload({
  courseId,
  moduleId,
  currentVideoUrl,
  onUploadSuccess,
  className
}: VideoUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [videoTitle, setVideoTitle] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('video/')) {
      setError('Selecteer een geldig videobestand');
      return;
    }

    // Validate file size (max 100MB)
    if (file.size > 100 * 1024 * 1024) {
      setError('Videobestand is te groot (maximaal 100MB)');
      return;
    }

    setError(null);
    await uploadVideo(file);
  };

  const uploadVideo = async (file: File) => {
    setIsUploading(true);
    setUploadProgress(0);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('video', file);
      formData.append('courseId', courseId);
      formData.append('moduleId', moduleId);
      formData.append('title', videoTitle || 'Video les');

      // Get auth token (assuming it's stored in localStorage)
      const token = localStorage.getItem('admin_token');
      if (!token) {
        throw new Error('Niet geautoriseerd');
      }

      const response = await fetch('/api/admin/upload-video', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload mislukt');
      }

      const result = await response.json();

      setSuccess(true);
      onUploadSuccess(result.videoUrl);

      // Reset form
      setVideoTitle('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      // Hide success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);

    } catch (error) {
      console.error('Upload error:', error);
      setError(error instanceof Error ? error.message : 'Upload mislukt');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Card className={cn("", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Video className="w-5 h-5" />
          Video Upload
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current video display */}
        {currentVideoUrl && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2 text-green-800">
              <CheckCircle className="w-4 h-4" />
              <span className="font-medium">Video geüpload</span>
            </div>
            <p className="text-sm text-green-700 mt-1">
              {currentVideoUrl}
            </p>
          </div>
        )}

        {/* Error display */}
        {error && (
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Success display */}
        {success && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Video succesvol geüpload!
            </AlertDescription>
          </Alert>
        )}

        {/* Upload form */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="video-title">Video titel (optioneel)</Label>
            <Input
              id="video-title"
              value={videoTitle}
              onChange={(e) => setVideoTitle(e.target.value)}
              placeholder="bijv. Introductie tot dating"
              disabled={isUploading}
            />
          </div>

          <div>
            <Label htmlFor="video-file">Videobestand</Label>
            <div className="mt-1">
              <input
                ref={fileInputRef}
                type="file"
                id="video-file"
                accept="video/*"
                onChange={handleFileSelect}
                disabled={isUploading}
                className="hidden"
              />

              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="w-full h-24 border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors"
              >
                <div className="text-center">
                  {isUploading ? (
                    <>
                      <Loader2 className="w-6 h-6 mx-auto mb-2 animate-spin text-blue-500" />
                      <p className="text-sm text-gray-600">Uploaden... {uploadProgress}%</p>
                    </>
                  ) : (
                    <>
                      <Upload className="w-6 h-6 mx-auto mb-2 text-gray-400" />
                      <p className="text-sm text-gray-600">
                        Klik om video te selecteren
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        MP4, WebM • Max 100MB
                      </p>
                    </>
                  )}
                </div>
              </Button>
            </div>
          </div>
        </div>

        {/* Upload instructions */}
        <div className="text-xs text-gray-500 space-y-1">
          <p><strong>Ondersteunde formaten:</strong> MP4, WebM, MOV</p>
          <p><strong>Maximale grootte:</strong> 100MB (Vercel limiet)</p>
          <p><strong>Aanbeveling:</strong> Comprimeer videos voor web (H.264, 1080p max)</p>
        </div>
      </CardContent>
    </Card>
  );
}