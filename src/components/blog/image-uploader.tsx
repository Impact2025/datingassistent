"use client";

import { useState, useRef, ChangeEvent } from 'react';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

interface ImageUploaderProps {
  onImageUploaded: (url: string) => void;
  currentImage?: string;
}

export function ImageUploader({ onImageUploaded, currentImage }: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string>(currentImage || '');
  const [imageUrl, setImageUrl] = useState<string>(currentImage || '');
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = async (e: ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      await handleFile(e.target.files[0]);
    }
  };

  const handleFile = async (file: File) => {
    // Validatie
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Ongeldig bestand',
        description: 'Upload alleen afbeeldingen (JPG, PNG, WebP)',
        variant: 'destructive',
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'Bestand te groot',
        description: 'Maximale bestandsgrootte is 5MB',
        variant: 'destructive',
      });
      return;
    }

    setUploading(true);

    try {
      // Preview maken
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Upload naar Neon database via API
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload-image', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Upload failed');
      }

      const data = await response.json();
      const imageUrl = data.image.url;

      setImageUrl(imageUrl);
      onImageUploaded(imageUrl);

      toast({
        title: 'Upload succesvol!',
        description: 'Afbeelding is geüpload naar database',
      });
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: 'Upload mislukt',
        description: error instanceof Error ? error.message : 'Kon afbeelding niet uploaden',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  const handleUrlSubmit = () => {
    if (imageUrl && imageUrl.startsWith('http')) {
      setPreview(imageUrl);
      onImageUploaded(imageUrl);
      toast({
        title: 'Afbeelding toegevoegd',
        description: 'Afbeelding URL is toegevoegd',
      });
    } else {
      toast({
        title: 'Ongeldige URL',
        description: 'Vul een geldige afbeelding URL in',
        variant: 'destructive',
      });
    }
  };

  const removeImage = () => {
    setPreview('');
    setImageUrl('');
    onImageUploaded('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      <Label>Featured afbeelding</Label>

      {preview ? (
        <Card className="relative p-4">
          <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-muted">
            <img
              src={preview}
              alt="Preview"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex gap-2 mt-4">
            <Button
              onClick={removeImage}
              variant="destructive"
              size="sm"
              className="flex-1"
            >
              <X className="w-4 h-4 mr-2" />
              Verwijder
            </Button>
            <Button
              onClick={() => fileInputRef.current?.click()}
              variant="outline"
              size="sm"
              className="flex-1"
            >
              <Upload className="w-4 h-4 mr-2" />
              Vervang
            </Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {/* Drag & Drop Upload */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`
              border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
              transition-colors duration-200
              ${dragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary'}
            `}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleChange}
              className="hidden"
              disabled={uploading}
            />

            {uploading ? (
              <div className="flex flex-col items-center">
                <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
                <p className="text-sm text-muted-foreground">
                  Uploaden...
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <Upload className="w-12 h-12 text-muted-foreground mb-4" />
                <p className="text-sm font-medium mb-2">
                  Klik om te uploaden of sleep bestand hierheen
                </p>
                <p className="text-xs text-muted-foreground">
                  JPG, PNG of WebP (max 5MB)
                </p>
              </div>
            )}
          </div>

          {/* URL Input */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Of gebruik een URL
              </span>
            </div>
          </div>

          <div className="flex gap-2">
            <Input
              type="url"
              placeholder="https://example.com/image.jpg"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              disabled={uploading}
            />
            <Button
              onClick={handleUrlSubmit}
              disabled={uploading || !imageUrl}
              variant="secondary"
            >
              <ImageIcon className="w-4 h-4 mr-2" />
              Toevoegen
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
